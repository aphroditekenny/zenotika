#!/usr/bin/env node
import { chromium } from "playwright";
import { spawn } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { createRequire } from "module";
import { preview as vitePreview } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../");
const reportsDir = path.join(projectRoot, "reports");
const PREVIEW_HOST = "localhost";
const PREVIEW_PORT = "3000";
const TARGET_URL = `http://${PREVIEW_HOST}:${PREVIEW_PORT}/`;

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");

function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
      }
    });
    child.on("error", reject);
  });
}

async function startPreview() {
  const server = await vitePreview({
    configFile: path.join(projectRoot, "vite.config.ts"),
    preview: {
      host: PREVIEW_HOST,
      port: Number(PREVIEW_PORT),
      strictPort: true,
    },
  });

  await new Promise((resolve, reject) => {
    const httpServer = server.httpServer;
    if (!httpServer) {
      reject(new Error("Vite preview did not provide an HTTP server"));
      return;
    }

    if (httpServer.listening) {
      resolve();
      return;
    }

    const onListening = () => {
      httpServer.off("error", onError);
      resolve();
    };

    const onError = (error) => {
      httpServer.off("listening", onListening);
      reject(error);
    };

    httpServer.once("listening", onListening);
    httpServer.once("error", onError);
  });

  return server;
}

function collectPerformanceMetrics(entries) {
  const navigation = entries.navigation?.[0] ?? null;
  const paints = entries.paint ?? [];
  const largestContentfulPaintEntries = entries.lcp ?? [];
  const layoutShifts = entries.layoutShift ?? [];

  const fcp = paints.find((entry) => entry.name === "first-contentful-paint");
  const lcpEntry = largestContentfulPaintEntries.at(-1) ?? null;
  const cls = layoutShifts
    .filter((entry) => !entry.hadRecentInput)
    .reduce((total, entry) => total + entry.value, 0);

  return {
    navigationTiming: navigation
      ? {
          timeToFirstByte: navigation.responseStart - navigation.requestStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
          loadEvent: navigation.loadEventEnd - navigation.startTime,
        }
      : null,
    firstContentfulPaint: fcp ? fcp.startTime : null,
    largestContentfulPaint: lcpEntry ? lcpEntry.startTime : null,
    cumulativeLayoutShift: cls,
  };
}

async function collectBaselines() {
  mkdirSync(reportsDir, { recursive: true });

  console.log("➤ Building project...");
  await runCommand("npm", ["run", "build"], { cwd: projectRoot });

  console.log("➤ Starting vite preview...");
  const previewServer = await startPreview();

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log(`➤ Navigating to ${TARGET_URL}`);
    await page.goto(TARGET_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const performanceEntries = await page.evaluate(() => {
      return {
        navigation: performance.getEntriesByType("navigation").map((entry) => ({
          startTime: entry.startTime,
          requestStart: entry.requestStart,
          responseStart: entry.responseStart,
          domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
          loadEventEnd: entry.loadEventEnd,
        })),
        paint: performance.getEntriesByType("paint").map((entry) => ({
          name: entry.name,
          startTime: entry.startTime,
        })),
        lcp: performance.getEntriesByType("largest-contentful-paint").map((entry) => ({
          startTime: entry.startTime,
          size: entry.size,
        })),
        layoutShift: performance.getEntriesByType("layout-shift").map((entry) => ({
          value: entry.value,
          hadRecentInput: entry.hadRecentInput,
        })),
      };
    });

    const performanceSummary = collectPerformanceMetrics(performanceEntries);

    await page.addScriptTag({ path: axePath });
    const axeResults = await page.evaluate(async () => {
      const results = await axe.run();
      return {
        violations: results.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          help: violation.help,
          nodes: violation.nodes.map((node) => ({
            target: node.target,
            html: node.html,
            failureSummary: node.failureSummary,
          })),
        })),
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length,
      };
    });

  const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      url: TARGET_URL,
      performance: performanceSummary,
      accessibility: {
        totals: {
          violations: axeResults.violations.length,
          passes: axeResults.passes,
          incomplete: axeResults.incomplete,
          inapplicable: axeResults.inapplicable,
        },
        violations: axeResults.violations,
      },
    };

    const reportPath = path.join(reportsDir, "baseline-report.json");
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log("➤ Baseline report written to", reportPath);
    console.log("➤ Performance summary:", performanceSummary);

    // Guardrails: fail on bad vitals if configured thresholds are exceeded
    const LCP_LIMIT = Number(process.env.LCP_LIMIT_MS || 2500);
    const CLS_LIMIT = Number(process.env.CLS_LIMIT || 0.1);
    const lcp = performanceSummary.largestContentfulPaint ?? performanceSummary.firstContentfulPaint;
    const cls = performanceSummary.cumulativeLayoutShift ?? 0;
    let guardFailed = false;
    if (lcp != null && lcp > LCP_LIMIT) {
      console.error(`✖ LCP ${lcp.toFixed(0)}ms exceeded limit ${LCP_LIMIT}ms`);
      guardFailed = true;
    }
    if (cls > CLS_LIMIT) {
      console.error(`✖ CLS ${cls.toFixed(3)} exceeded limit ${CLS_LIMIT}`);
      guardFailed = true;
    }
    if (guardFailed) {
      process.exitCode = 1;
    }
    console.log(
      "➤ Accessibility violations:",
      axeResults.violations.map((v) => `${v.id} (${v.impact ?? "unknown"})`).join(", ") || "none",
    );
  } finally {
    await browser.close();
    await previewServer.close();
  }
}

collectBaselines().catch((error) => {
  console.error("Baseline collection failed:", error);
  process.exitCode = 1;
});
