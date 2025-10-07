# Zenotika GitHub MCP Server

This package exposes GitHub repository data and utilities through the [Model Context Protocol](https://modelcontextprotocol.io/). It supports both Personal Access Token (PAT) and OAuth device-flow authentication so you can pick the option that best fits your workflow.

## Features

- **Repository resources** – load repository metadata or pull any file via MCP resources.
- **Actionable tools** – search issues & PRs, list pull requests, and inspect commit history directly from an MCP-compatible client.
- **Flexible authentication** – prefer a PAT when you already have one, or fall back to an interactive OAuth device flow with automatic token caching.

## Authentication options

### 1. Personal Access Token (recommended for automation)

1. Create a PAT at <https://github.com/settings/tokens>. The server needs the following scopes:
   - `repo`
   - `read:org`
   - `gist`
2. Export the token before launching the MCP server:

   ```powershell
   $env:GITHUB_TOKEN = "<your-token>"
   ```

   You can also use `GH_TOKEN` if you prefer matching the GitHub CLI naming convention.

### 2. OAuth device flow (great for quick local use)

1. Create an OAuth app (GitHub → Settings → Developer settings → OAuth Apps → New OAuth App):
   - Application name: `Zenotika MCP (local)` (anything is fine)
   - Homepage URL: `https://github.com/<your-user-or-org>/<your-repo>`
   - Authorization callback URL: `http://localhost/dummy` (device flow does not use it, but GitHub requires a value)
   - Save, then click "Generate a new client secret".
2. Copy the generated **Client ID** and **Client Secret**.
3. (Optional) Decide custom scopes. If you omit `GITHUB_SCOPES`, the server defaults to: `repo, read:org, gist`.
4. Export the environment variables before launching the server:

   PowerShell (current session):
   ```powershell
   $env:GITHUB_CLIENT_ID = "<your-client-id>"
   $env:GITHUB_CLIENT_SECRET = "<your-client-secret>"
   # Optional custom scopes (comma separated)
   $env:GITHUB_SCOPES = "repo,read:org,gist"
   ```

   Bash / Zsh:
   ```bash
   export GITHUB_CLIENT_ID="<your-client-id>"
   export GITHUB_CLIENT_SECRET="<your-client-secret>"
   export GITHUB_SCOPES="repo,read:org,gist" # optional
   ```

   Windows CMD:
   ```cmd
   set GITHUB_CLIENT_ID=<your-client-id>
   set GITHUB_CLIENT_SECRET=<your-client-secret>
   set GITHUB_SCOPES=repo,read:org,gist
   ```

5. Start the server (see below). A verification URL + user code prints to stderr. Open the URL, enter the code, and approve.
6. The resulting access token is cached at `%USERPROFILE%\.cache\zenotika\github-mcp-token.json` until it expires. Delete that file or call `clearCachedToken()` to force a new login.
7. If a `GITHUB_TOKEN` or `GH_TOKEN` exists, the device flow is skipped (PAT takes precedence).

> **Tip:** The server always prefers `GITHUB_TOKEN`/`GH_TOKEN` when present. OAuth device flow is only triggered if no token is found.

## Installation

Requires **Node.js 22 LTS** (>=22.0.0).

```powershell
cd mcp/github
npm install
```

## Build & run

```powershell
cd mcp/github
npm run build
node dist/index.js
```

For live development, use:

```powershell
cd mcp/github
npm run dev
```

The server communicates over stdio, so pair it with an MCP-compatible client (e.g., Claude Desktop, MCP Inspector, or a custom integration). The executable path will be `node dist/index.js` once built, or `npx --yes @zenotika/mcp-github` if you publish the package.

## MCP resources and tools

| Identifier | Type | Description |
| --- | --- | --- |
| `github://repos/{owner}/{repo}` | Resource | Repository metadata as JSON. |
| `github://repos/{owner}/{repo}/file/{path}` | Resource | Fetches the decoded contents of a file. |
| `searchIssues` | Tool | Runs GitHub's issues/PR search and returns a concise summary. |
| `listPullRequests` | Tool | Lists recent pull requests for a repository. |
| `listCommits` | Tool | Shows commit messages, authors, and URLs for a branch or SHA. |

## Troubleshooting

- **Module not found errors:** Ensure `npm install` completed successfully; the MCP SDK and Octokit dependencies are required.
- **401/403 responses:** Confirm your PAT scopes or OAuth grant include `repo` access for private repositories.
- **Token cache issues:** Delete `%USERPROFILE%\.cache\zenotika\github-mcp-token.json` if you need to re-authenticate with new scopes.

Happy automating! 🎯
