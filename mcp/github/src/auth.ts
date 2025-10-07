import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createOAuthDeviceAuth } from "@octokit/auth-oauth-device";

type Verification = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete?: string;
  expires_in: number;
  interval: number;
};

const CACHE_DIR = path.join(os.homedir(), ".cache", "zenotika");
const CACHE_FILE = path.join(CACHE_DIR, "github-mcp-token.json");

const DEFAULT_SCOPES = ["repo", "read:org", "gist"] as const;

type CachedToken = {
  token: string;
  method: "pat" | "oauth-device";
  scopes?: string[];
  createdAt: string;
  expiresAt?: string | null;
};

export type GitHubAuth = {
  token: string;
  method: "pat" | "oauth-device";
  scopes: readonly string[];
  note: string;
};

async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

async function readCachedToken(): Promise<CachedToken | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as CachedToken;
    if (!parsed?.token) {
      return null;
    }

    if (parsed.expiresAt) {
      const expires = new Date(parsed.expiresAt).getTime();
      if (Number.isFinite(expires) && expires <= Date.now()) {
        return null;
      }
    }

    return parsed;
  } catch (error) {
    return null;
  }
}

async function writeCachedToken(token: CachedToken): Promise<void> {
  await ensureCacheDir();
  await fs.writeFile(CACHE_FILE, JSON.stringify(token, null, 2), "utf-8");
}

export async function resolveGitHubAuth(): Promise<GitHubAuth> {
  const tokenFromEnv = (process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? "").trim();
  if (tokenFromEnv) {
    return {
      token: tokenFromEnv,
      method: "pat",
      scopes: DEFAULT_SCOPES,
      note: "Using GitHub personal access token from environment variables."
    };
  }

  const cached = await readCachedToken();
  if (cached) {
    return {
      token: cached.token,
      method: cached.method,
      scopes: cached.scopes ?? DEFAULT_SCOPES,
      note: "Reusing cached GitHub OAuth device token."
    };
  }

  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error(
      "Missing GitHub credentials. Set GITHUB_TOKEN (recommended) or provide GITHUB_CLIENT_ID for OAuth device flow."
    );
  }

  const scopesFromEnv = (process.env.GITHUB_SCOPES ?? "")
    .split(",")
    .map(scope => scope.trim())
    .filter(scope => scope.length > 0);
  const scopes = scopesFromEnv.length > 0 ? scopesFromEnv : Array.from(DEFAULT_SCOPES);

  const auth = createOAuthDeviceAuth({
    clientType: "oauth-app",
    clientId,
    scopes,
    onVerification: (verification: Verification) => {
      console.error("Authorize Zenotika GitHub MCP server:");
      console.error(`  Visit: ${verification.verification_uri_complete ?? verification.verification_uri}`);
      console.error(`  Code: ${verification.user_code}`);
      if (verification.expires_in) {
        const minutes = Math.floor(verification.expires_in / 60);
        console.error(`  Expires in: ${minutes} minute(s)`);
      }
    }
  });

  const authentication = await auth({ type: "oauth", scopes });
  const { token, scopes: grantedScopes } = authentication;

  await writeCachedToken({
    token,
    method: "oauth-device",
    scopes: grantedScopes,
    createdAt: new Date().toISOString(),
    expiresAt: "expiresAt" in authentication ? (authentication as { expiresAt?: string }).expiresAt ?? null : null
  });

  return {
    token,
    method: "oauth-device",
    scopes: grantedScopes,
    note: "Obtained GitHub OAuth device token; stored in cache for reuse until expiration."
  };
}

export function clearCachedToken(): Promise<void> {
  return fs.rm(CACHE_FILE, { force: true });
}
