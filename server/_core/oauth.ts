import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

// ─── Google OAuth Endpoints ─────────────────────────────────

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

// ─── GitHub OAuth Endpoints ─────────────────────────────────

const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USERINFO_URL = "https://api.github.com/user";
const GITHUB_EMAILS_URL = "https://api.github.com/user/emails";

function getCallbackUrl(req: Request, provider: string): string {
  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}/api/oauth/${provider}/callback`;
}

export function registerOAuthRoutes(app: Express) {
  // ─── Google: Redirect to Google ─────────────────────────────
  app.get("/api/oauth/google", (req: Request, res: Response) => {
    const redirectUri = getCallbackUrl(req, "google");
    const params = new URLSearchParams({
      client_id: ENV.googleClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });
    res.redirect(`${GOOGLE_AUTH_URL}?${params}`);
  });

  // ─── Google: Callback ───────────────────────────────────────
  app.get("/api/oauth/google/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string | undefined;
    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    try {
      // Exchange code for tokens
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: getCallbackUrl(req, "google"),
          grant_type: "authorization_code",
        }),
      });

      const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
      if (!tokenData.access_token) {
        console.error("[OAuth/Google] Token exchange failed:", tokenData);
        res.status(400).json({ error: "Failed to exchange authorization code" });
        return;
      }

      // Get user info
      const userRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userInfo = (await userRes.json()) as {
        id: string;
        name?: string;
        email?: string;
      };

      if (!userInfo.id) {
        res.status(400).json({ error: "Failed to get user info from Google" });
        return;
      }

      // Upsert user in database
      const openId = `google:${userInfo.id}`;
      await db.upsertUser({
        openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Create session JWT
      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth/Google] Callback failed:", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // ─── GitHub: Redirect to GitHub ─────────────────────────────
  app.get("/api/oauth/github", (req: Request, res: Response) => {
    const redirectUri = getCallbackUrl(req, "github");
    const params = new URLSearchParams({
      client_id: ENV.githubClientId,
      redirect_uri: redirectUri,
      scope: "read:user user:email",
    });
    res.redirect(`${GITHUB_AUTH_URL}?${params}`);
  });

  // ─── GitHub: Callback ──────────────────────────────────────
  app.get("/api/oauth/github/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string | undefined;
    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    try {
      // Exchange code for access token
      const tokenRes = await fetch(GITHUB_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: ENV.githubClientId,
          client_secret: ENV.githubClientSecret,
          code,
          redirect_uri: getCallbackUrl(req, "github"),
        }),
      });

      const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
      if (!tokenData.access_token) {
        console.error("[OAuth/GitHub] Token exchange failed:", tokenData);
        res.status(400).json({ error: "Failed to exchange authorization code" });
        return;
      }

      const authHeaders = { Authorization: `Bearer ${tokenData.access_token}` };

      // Get user info
      const userRes = await fetch(GITHUB_USERINFO_URL, { headers: authHeaders });
      const userInfo = (await userRes.json()) as {
        id: number;
        name?: string;
        login: string;
        email?: string | null;
      };

      // Get primary email if not public
      let email = userInfo.email;
      if (!email) {
        const emailsRes = await fetch(GITHUB_EMAILS_URL, { headers: authHeaders });
        const emails = (await emailsRes.json()) as Array<{
          email: string;
          primary: boolean;
          verified: boolean;
        }>;
        const primary = emails.find((e) => e.primary && e.verified);
        email = primary?.email ?? emails[0]?.email ?? null;
      }

      if (!userInfo.id) {
        res.status(400).json({ error: "Failed to get user info from GitHub" });
        return;
      }

      // Upsert user in database
      const openId = `github:${userInfo.id}`;
      await db.upsertUser({
        openId,
        name: userInfo.name || userInfo.login,
        email: email ?? null,
        loginMethod: "github",
        lastSignedIn: new Date(),
      });

      // Create session JWT
      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || userInfo.login,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth/GitHub] Callback failed:", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
