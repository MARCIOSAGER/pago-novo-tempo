import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerLocalAuthRoutes } from "./localAuth";
import { registerChatRoutes } from "./chat";
import { appRouter } from "../routers";
import { createContext } from "./context";
import fs from "fs";
import { applyAllSecurity, refundLookupRateLimiter, refundRequestRateLimiter, lookupLinkRateLimiter } from "../security";
import { LOCAL_UPLOADS_DIR } from "../storage";
import { constructWebhookEvent, handleCheckoutSessionCompleted, handleCheckoutSessionExpired, handleChargeRefunded, handleChargeDisputeCreated } from "../stripe";
import { claimDownloadSlot, tryRecordStripeEvent } from "../db";
import rateLimit from "express-rate-limit";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust proxy for correct IP detection behind reverse proxy
  app.set('trust proxy', 1);

  // Stripe webhook — MUST use raw body (signature verification needs exact bytes)
  // Registered BEFORE any JSON parser to avoid consuming the body.
  // Rate limit: 600 req / 15 min / IP (generous to allow Stripe retries, blocks floods).
  const webhookRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests" },
  });
  app.post(
    "/api/stripe/webhook",
    webhookRateLimit,
    // 1MB is well above Stripe event payload size (typically <100KB)
    express.raw({ type: "application/json", limit: "1mb" }),
    async (req, res) => {
      const signature = req.headers["stripe-signature"];
      if (typeof signature !== "string") {
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }
      let event;
      try {
        event = constructWebhookEvent(req.body, signature);
      } catch {
        // Don't log err object (may contain body/sig) — just a boolean signal
        console.error("[Stripe Webhook] Signature verification failed");
        return res.status(400).json({ error: "Invalid signature" });
      }
      // Idempotency: dedupe by event.id. If already processed, ack immediately.
      try {
        const isNew = await tryRecordStripeEvent(event.id, event.type);
        if (!isNew) {
          return res.json({ received: true, deduped: true });
        }
      } catch (err) {
        console.error(`[Stripe Webhook] Dedupe check failed for ${event.id}:`, (err as Error).message);
        // Fail-open: continue processing (better to risk a duplicate than to lose an event)
      }
      try {
        if (event.type === "checkout.session.completed") {
          await handleCheckoutSessionCompleted(event.data.object);
        } else if (event.type === "checkout.session.expired") {
          await handleCheckoutSessionExpired(event.data.object);
        } else if (event.type === "charge.refunded") {
          await handleChargeRefunded(event.data.object);
        } else if (event.type === "charge.dispute.created") {
          await handleChargeDisputeCreated(event.data.object);
        } else {
          console.log(`[Stripe Webhook] Ignored event type: ${event.type}`);
        }
      } catch (err) {
        console.error(`[Stripe Webhook] Handler failed for ${event.type}:`, (err as Error).message);
        return res.status(500).json({ error: "Handler error" });
      }
      res.json({ received: true });
    }
  );

  // Configure body parser with larger size limit for file uploads
  // MUST be registered BEFORE applyAllSecurity (which sets 1mb global limit)
  app.use("/api/trpc/files.upload", express.json({ limit: "50mb" }));
  app.use("/api/trpc/siteSettings.updateImage", express.json({ limit: "50mb" }));
  app.use("/api/trpc/diagnostico.sendEmailWithPdf", express.json({ limit: "15mb" }));
  app.use("/api/trpc/diagnostico.generatePdf", express.json({ limit: "5mb" }));

  // Public refund endpoints — extra rate limits to prevent enumeration/abuse
  app.use("/api/trpc/purchases.lookupBySession", refundLookupRateLimiter);
  app.use("/api/trpc/purchases.requestRefund", refundRequestRateLimiter);
  app.use("/api/trpc/purchases.sendLookupLink", lookupLinkRateLimiter);

  // ─── Apply Security Layers ──────────────────────────────
  applyAllSecurity(app);

  // Serve local uploads (fallback when S3 is not configured)
  if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
    fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
  }
  app.use("/uploads", express.static(LOCAL_UPLOADS_DIR));

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  registerLocalAuthRoutes(app);
  // Chat API with streaming and tool calling
  registerChatRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // ─── Ebook Download Routes (serve from local docs/ folder) ──
  const docsDir = process.env.NODE_ENV === "development"
    ? path.resolve(import.meta.dirname, "../..", "docs")
    : path.resolve(import.meta.dirname, "..", "docs");
  const ebookFiles: Record<string, { filepath: string; filename: string }> = {
    "ebook-pdf": { filepath: path.join(docsDir, "PAGO-Ebook-Portugues.pdf"), filename: "PAGO-Ebook-Portugues.pdf" },
    "ebook-pdf-pt": { filepath: path.join(docsDir, "PAGO-Ebook-Portugues.pdf"), filename: "PAGO-Ebook-Portugues.pdf" },
    "ebook-pdf-en": { filepath: path.join(docsDir, "PAGO-Ebook-English.pdf"), filename: "PAGO-Ebook-English.pdf" },
    "ebook-pdf-es": { filepath: path.join(docsDir, "PAGO-Ebook-Espanol.pdf"), filename: "PAGO-Ebook-Espanol.pdf" },
    "ebook-pdf-grafica": { filepath: path.join(docsDir, "ebook-pago-v2-grafica.pdf"), filename: "PAGO-Ebook-v1-Grafica.pdf" },
    "ebook-epub": { filepath: path.join(docsDir, "ebook-pago-v2.epub"), filename: "PAGO-Ebook-v2.epub" },
    "ebook-mobi": { filepath: path.join(docsDir, "ebook-pago-v2.mobi"), filename: "PAGO-Ebook-v2.mobi" },
    "ebook-flipbook": { filepath: path.join(docsDir, "ebook-pago-flipbook.html"), filename: "PAGO-Ebook-Flipbook.html" },
    "ebook-html": { filepath: path.join(docsDir, "ebook-pago-v2.html"), filename: "PAGO-Ebook-v2.html" },
    "ebook-kids-pdf": { filepath: path.join(docsDir, "ebook-pago-kids.pdf"), filename: "PAGO-Kids-Ebook-Final.pdf" },
    "ebook-kids-flipbook": { filepath: path.join(docsDir, "flipbook-kids.html"), filename: "PAGO-Kids-Flipbook.html" },
    "certificado-kids": { filepath: path.join(docsDir, "certificado-pago-kids.png"), filename: "Certificado-PAGO-Kids-Pequeno-Construtor-de-Deus.png" },
  };

  // Serve flipbook images statically
  app.use("/api/flipbook-kids/images", express.static(path.join(docsDir, "flipbook-kids-images")));

  // Flipbook formats that should open in browser (sendFile) instead of download
  const inlineFormats = new Set(["ebook-flipbook", "ebook-kids-flipbook"]);

  app.get("/api/downloads/:format", (req, res) => {
    const file = ebookFiles[req.params.format];
    if (!file) {
      return res.status(404).json({ error: "Formato não encontrado" });
    }
    if (inlineFormats.has(req.params.format)) {
      return res.sendFile(file.filepath, (err) => {
        if (err && !res.headersSent) {
          res.status(404).json({ error: "Arquivo não encontrado" });
        }
      });
    }
    res.download(file.filepath, file.filename, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ error: "Arquivo não encontrado" });
      }
    });
  });

  // ─── Secure Purchase Download (token-based) ──────────────
  // Rate limit: 30 req / 15 min / IP to slow brute-force / enumeration.
  const downloadRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas requisições. Tente novamente em alguns minutos." },
  });
  // Token format: nanoid(32) using URL-safe alphabet [A-Za-z0-9_-]
  const TOKEN_REGEX = /^[A-Za-z0-9_-]{32}$/;
  // Unified error to prevent state-disclosure oracle (missing/expired/limit all return same 404).
  const DOWNLOAD_ERROR = { error: "Link inválido ou expirado." };

  app.get("/api/purchases/download", downloadRateLimit, async (req, res) => {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    if (!token || !TOKEN_REGEX.test(token)) {
      return res.status(404).json(DOWNLOAD_ERROR);
    }
    // Atomic claim: validates token, expiry, quota, status, product AND increments count in 1 query.
    const purchase = await claimDownloadSlot(token);
    if (!purchase) {
      return res.status(404).json(DOWNLOAD_ERROR);
    }

    const lang = purchase.language ?? "pt";
    const fileKey = `ebook-pdf-${lang}`;
    const file = ebookFiles[fileKey];
    if (!file) {
      // Misconfiguration on server side — log but don't leak details.
      console.error(`[Download] Ebook file missing for lang=${lang}`);
      return res.status(500).json({ error: "Erro interno." });
    }

    res.download(file.filepath, file.filename, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ error: "Erro interno." });
      }
    });
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    const distPath = path.resolve(import.meta.dirname, "public");
    if (!fs.existsSync(distPath)) {
      console.error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
    }
    app.use(express.static(distPath));
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
