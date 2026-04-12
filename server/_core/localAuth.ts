import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import * as argon2 from "argon2";
import { nanoid } from "nanoid";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { sendPasswordResetEmail } from "./notification";
import { authRateLimiter } from "../security";

const registerSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
}

export function registerLocalAuthRoutes(app: Express) {
  // Apply auth rate limiter to all local auth endpoints
  app.use("/api/auth", authRateLimiter);

  // ─── Register ──────────────────────────────────────────────────
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const body = registerSchema.parse(req.body);

      // Check if email already taken
      const existing = await db.getUserByEmail(body.email);
      if (existing) {
        res.status(409).json({ error: "Email já cadastrado." });
        return;
      }

      const passwordHash = await hashPassword(body.password);
      const user = await db.createLocalUser({
        email: body.email,
        name: body.name,
        passwordHash,
      });

      // Create session
      const openId = `local:${body.email}`;
      const sessionToken = await sdk.createSessionToken(openId, {
        name: body.name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error: any) {
      if (error?.name === "ZodError") {
        res.status(400).json({ error: "Dados inválidos." });
        return;
      }
      console.error("[LocalAuth] Register error:", error);
      res.status(500).json({ error: "Erro interno." });
    }
  });

  // ─── Login ─────────────────────────────────────────────────────
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const body = loginSchema.parse(req.body);

      const user = await db.getUserByEmail(body.email);
      if (!user || !user.passwordHash || user.loginMethod !== "email") {
        res.status(401).json({ error: "Email ou senha inválidos." });
        return;
      }

      const valid = await argon2.verify(user.passwordHash, body.password);
      if (!valid) {
        res.status(401).json({ error: "Email ou senha inválidos." });
        return;
      }

      // Update last sign in
      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error: any) {
      if (error?.name === "ZodError") {
        res.status(400).json({ error: "Dados inválidos." });
        return;
      }
      console.error("[LocalAuth] Login error:", error);
      res.status(500).json({ error: "Erro interno." });
    }
  });

  // ─── Forgot Password ──────────────────────────────────────────
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const body = forgotSchema.parse(req.body);

      // Always return success to prevent email enumeration
      const user = await db.getUserByEmail(body.email);
      if (user && user.loginMethod === "email") {
        const token = nanoid(32);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await db.setResetToken(user.id, token, expiresAt);

        const protocol = req.headers["x-forwarded-proto"] || req.protocol;
        const host = req.get("host");
        const resetUrl = `${protocol}://${host}/reset-password/${token}`;
        sendPasswordResetEmail(user.email!, user.name || "", resetUrl).catch(() => {});
      }

      res.json({ success: true });
    } catch (error: any) {
      if (error?.name === "ZodError") {
        res.status(400).json({ error: "Dados inválidos." });
        return;
      }
      console.error("[LocalAuth] Forgot password error:", error);
      res.status(500).json({ error: "Erro interno." });
    }
  });

  // ─── Reset Password ───────────────────────────────────────────
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const body = resetSchema.parse(req.body);

      const user = await db.getUserByResetToken(body.token);
      if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
        res.status(400).json({ error: "Token inválido ou expirado." });
        return;
      }

      const passwordHash = await hashPassword(body.password);
      await db.updatePasswordHash(user.id, passwordHash);

      res.json({ success: true });
    } catch (error: any) {
      if (error?.name === "ZodError") {
        res.status(400).json({ error: "Dados inválidos." });
        return;
      }
      console.error("[LocalAuth] Reset password error:", error);
      res.status(500).json({ error: "Erro interno." });
    }
  });
}
