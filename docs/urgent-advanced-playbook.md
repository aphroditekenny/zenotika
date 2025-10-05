# Urgent Advanced Playbook

This is a pragmatic, high-leverage checklist to stabilize, validate, and ship this React 19 + Vite app safely under time pressure.

## 0) Quick commands (Windows PowerShell)

```powershell
# Build Pages-compatible artifact + SPA fallback
npm run build:pages

# Local preview (binds to all interfaces; works with VS Code Dev Tunnels)
npm run preview:pages

# One-click a11y check against preview (waits for http://localhost:3000)
npm run a11y:one

# Baseline: performance + bundle report
npm run baseline:collect
npm run bundle:check
```

## 1) Hosting fallback options

- GitHub Pages: already supported (base path + 404.html fallback).
- Netlify: use `public/_redirects` (added) -> `/* /index.html 200`.
- Vercel: `vercel.json` (optional; see Next Steps) with SPA rewrites/headers.

## 2) Health, a11y, perf

- A11y: `npm run a11y:one` (axe on Playwright) -> `reports/a11y-preview-report.json`.
- Perf baseline: `npm run baseline:collect` -> `reports/baseline-report.json`.
- Bundle drift: `npm run bundle:check` (compare size/budget; configurable).

## 3) Operational safeguards

- Local-first: VS Code compound debug starts preview then opens Edge.
- Ports auto-forward: 3000 labeled "Vite Preview" and opens browser.
- Dev Tunnels: Preview binds on `0.0.0.0` to avoid loopback-only issues.

## 4) Triage order (when minutes matter)

1. Build + Preview locally (no errors in console/network).
2. Run a11y and baseline; ensure 0 critical violations; FCP within budget.
3. Sanity clickthrough of critical paths (Home -> Hero -> LogBook -> Footer).
4. If external sharing is needed now, use VS Code Dev Tunnels or Netlify drop.

## 5) Known watch-outs

- If the build was created with a non-root base, open the preview using the correct subpath or rebuild locally without a Pages base for local-only testing.
- Dev Tunnels may take a second to propagate after port forward—refresh once.

## 6) Next steps (optional but recommended)

- Sentry (perf + error tracking) behind `VITE_ENABLE_MONITORING`:
	- Set env: `VITE_ENABLE_MONITORING=true` and `VITE_SENTRY_DSN=<dsn>`.
	- Optional sourcemaps upload can be enabled later in CI.
- PWA: now available via flag. Set `VITE_ENABLE_PWA=true` (production only) to register `/sw.js` and use `manifest.webmanifest` for installability. No plugin required.
- Security headers (CSP/COOP/COEP): `netlify.toml` included; adjust CSP if using third-party analytics.
- CI re-enable once billing unblocked: run lint, tests, bundle check, baselines.

---

Owner: Farid-Ze • Updated: 2025-10-05
