#!/usr/bin/env node
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Octokit } from "octokit";
import { resolveGitHubAuth } from "./auth.js";

const VERSION = "0.1.0";

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function formatList(values: string[]): string {
  return values.length ? values.join("\n\n") : "(no results)";
}

function requireStringParam(variables: Record<string, unknown>, key: string): string {
  const raw = variables[key];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`Missing required resource parameter: ${key}`);
  }
  return raw;
}

function normalizePathSegment(value: string): string {
  return value.replace(/^\/+/, "");
}

function registerResources(server: McpServer, octokit: Octokit) {
  const repoTemplate = new ResourceTemplate("github://repos/{owner}/{repo}", {
    list: undefined
  });

  server.registerResource(
    "github-repo",
    repoTemplate,
    {
      title: "GitHub repository metadata",
      description: "Retrieve repository metadata from the GitHub REST API.",
      mimeType: "application/json"
    },
    async (_uri, variables) => {
      const owner = requireStringParam(variables, "owner");
      const repo = requireStringParam(variables, "repo");
      const { data } = await octokit.rest.repos.get({ owner, repo });
      return {
        contents: [
          {
            uri: `github://repos/${owner}/${repo}`,
            text: formatJson(data),
            mimeType: "application/json"
          }
        ]
      };
    }
  );

  const fileTemplate = new ResourceTemplate("github://repos/{owner}/{repo}/file/{path}", {
    list: undefined
  });

  server.registerResource(
    "github-repo-file",
    fileTemplate,
    {
      title: "GitHub repository file",
      description: "Load the contents of a specific file from a GitHub repository.",
      mimeType: "text/plain"
    },
    async (_uri, variables) => {
      const owner = requireStringParam(variables, "owner");
      const repo = requireStringParam(variables, "repo");
      const path = normalizePathSegment(requireStringParam(variables, "path"));
      const response = await octokit.rest.repos.getContent({ owner, repo, path });
      if (Array.isArray(response.data) || response.data.type !== "file") {
        throw new Error("The requested path is not a file.");
      }
      const encoding = response.data.encoding as BufferEncoding;
      const decoded = Buffer.from(response.data.content, encoding).toString("utf-8");
      return {
        contents: [
          {
            uri: `github://repos/${owner}/${repo}/file/${path}`,
            text: decoded,
            mimeType: "text/plain"
          }
        ]
      };
    }
  );
}

function registerTools(server: McpServer, octokit: Octokit) {
  const searchIssuesArgs = {
    query: z.string().min(1, "Provide a search query."),
    perPage: z.number().int().min(1).max(50).default(5)
  } as const;

  const listPullsArgs = {
    owner: z.string().min(1),
    repo: z.string().min(1),
    state: z.enum(["open", "closed", "all"]).default("open"),
    base: z.string().optional(),
    perPage: z.number().int().min(1).max(50).default(10)
  } as const;

  const listCommitsArgs = {
    owner: z.string().min(1),
    repo: z.string().min(1),
    sha: z.string().optional(),
    perPage: z.number().int().min(1).max(50).default(10)
  } as const;

  const searchIssuesSchema = z.object(searchIssuesArgs);
  const listPullsSchema = z.object(listPullsArgs);
  const listCommitsSchema = z.object(listCommitsArgs);

  server.registerTool(
    "searchIssues",
    {
      title: "Search GitHub issues & PRs",
      description: "Run an issues/PR search query using GitHub's advanced search syntax.",
      inputSchema: searchIssuesArgs
    },
    async input => {
      const { query, perPage } = searchIssuesSchema.parse(input);
      const { data } = await octokit.rest.search.issuesAndPullRequests({
        q: query,
        per_page: perPage,
        sort: "updated",
        order: "desc"
      });

      const summary = data.items.map(item => {
        const labelsArray = Array.isArray(item.labels) ? item.labels : [];
        const labelNames = labelsArray
          .map(label => (typeof label === "string" ? label : label?.name ?? ""))
          .filter((name): name is string => typeof name === "string" && name.length > 0)
          .join(", ") || "(no labels)";

        const repoName = item.repository_url?.replace("https://api.github.com/repos/", "") ?? "";
        return [
          `${repoName} #${item.number}`.trim(),
          item.title,
          `state: ${item.state}${item.draft ? " (draft)" : ""}`,
          `labels: ${labelNames}`,
          `url: ${item.html_url}`
        ].join("\n");
      });

      return {
        content: [
          {
            type: "text" as const,
            text: formatList(summary)
          }
        ]
      };
    }
  );

  server.registerTool(
    "listPullRequests",
    {
      title: "List pull requests",
      description: "List recent pull requests for a repository.",
      inputSchema: listPullsArgs
    },
    async input => {
      const { owner, repo, state, base, perPage } = listPullsSchema.parse(input);
      const { data } = await octokit.rest.pulls.list({ owner, repo, state, base, per_page: perPage });
      const summary = data.map(pr => {
        return [
          `#${pr.number} ${pr.title}`,
          `state: ${pr.state}${pr.draft ? " (draft)" : ""}`,
          `author: ${pr.user?.login ?? "unknown"}`,
          `updated: ${pr.updated_at}`,
          `url: ${pr.html_url}`
        ].join("\n");
      });

      return {
        content: [
          {
            type: "text" as const,
            text: formatList(summary)
          }
        ]
      };
    }
  );

  server.registerTool(
    "listCommits",
    {
      title: "List recent commits",
      description: "Show recent commits for a repository branch.",
      inputSchema: listCommitsArgs
    },
    async input => {
      const { owner, repo, sha, perPage } = listCommitsSchema.parse(input);
      const { data } = await octokit.rest.repos.listCommits({ owner, repo, sha, per_page: perPage });
      const summary = data.map(commit => {
        const message = commit.commit.message?.split("\n")[0] ?? "(no message)";
        return [
          commit.sha?.slice(0, 12) ?? "(unknown sha)",
          message,
          `author: ${commit.commit.author?.name ?? commit.author?.login ?? "unknown"}`,
          `date: ${commit.commit.author?.date ?? "unknown"}`,
          `url: ${commit.html_url}`
        ].join("\n");
      });

      return {
        content: [
          {
            type: "text" as const,
            text: formatList(summary)
          }
        ]
      };
    }
  );
}

async function main() {
  try {
    const auth = await resolveGitHubAuth();
    const octokit = new Octokit({
      auth: auth.token,
      userAgent: `zenotika-mcp-github/${VERSION}`
    });

    const server = new McpServer(
      {
        name: "zenotika-github",
        version: VERSION
      },
      {
        capabilities: {
          resources: {},
          tools: {}
        }
      }
    );

    registerResources(server, octokit);
    registerTools(server, octokit);

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Zenotika GitHub MCP server ready using ${auth.method} authentication.`);
    console.error(auth.note);
    if (auth.scopes?.length) {
      console.error(`Scopes: ${auth.scopes.join(", ")}`);
    }
  } catch (error) {
    console.error("Failed to start Zenotika GitHub MCP server:", error);
    process.exitCode = 1;
  }
}

await main();
