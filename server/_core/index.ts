import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerChatRoutes } from "./chat";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { applyAllSecurity } from "../security";
import { getDownloadBySlug, recordDownloadEvent } from "../db";
import crypto from "crypto";

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

  // ─── Apply Security Layers FIRST ──────────────────────────
  applyAllSecurity(app);

  // Configure body parser with larger size limit for file uploads
  // (overrides the 1mb default from security for specific routes)
  app.use("/api/trpc/files.upload", express.json({ limit: "50mb" }));

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
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
  // ─── Flipbook Kids Route ─────────────────
  app.get("/flipbook-kids", (_req, res) => {
    res.redirect(302, "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028643999/JPckmwYvDWyIayHY.html?Expires=1803813522&Signature=uCPWn-QTA0pjZd5NRdSo3gdq6Li4MOt7kZz~ZIa9XyOL9GzFgqhlwgqN-s0SYmSrT3dYiWllu1z57OtiCBpsSNSGm6soZHhHxi5HH54EqXm8hj5R6U2sd0RABEBM3YXNNPatKJY7sMA9TN5JKLSae3VI7IwSydduFHG8RNSy74MsafLyXsf0sew1vii1jRZLyzWk7lhWk50jOAy0dlWYyPt9eEZ263euMU74e~855znEyZAVBonMZtiaz1R~FPuun4q-GKpG7kttBqsUWcoBG3iy3AxGsD5CiGUTCJkE9b2ir-ji-icPMdnTgN6CdVo4LsfAwRKSoS0feowvdT00bg__&Key-Pair-Id=K2HSFNDJXOU9YS");
  });

  // ─── Download Routes (database-driven with tracking) ─────────────────
  app.get("/api/downloads/:slug", async (req, res) => {
    try {
      const download = await getDownloadBySlug(req.params.slug);
      if (!download || download.active !== "yes") {
        return res.status(404).json({ error: "Download não encontrado" });
      }

      // Track download event asynchronously (non-blocking)
      const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.socket.remoteAddress || "";
      const ipHash = ip ? crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16) : undefined;
      recordDownloadEvent({
        downloadId: download.id,
        ipHash,
        userAgent: req.headers["user-agent"],
        referer: req.headers["referer"],
        country: req.headers["cf-ipcountry"]?.toString() || req.headers["x-country"]?.toString(),
      }).catch((err) => console.error("[Downloads] Tracking error:", err));

      res.redirect(302, download.url);
    } catch (error) {
      console.error("[Downloads] Error:", error);
      return res.status(500).json({ error: "Erro interno" });
    }
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
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
