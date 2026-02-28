import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerChatRoutes } from "./chat";
import { appRouter } from "../routers";
import { createContext } from "./context";
import fs from "fs";
import { applyAllSecurity } from "../security";

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
  // ─── Ebook Download Routes (serve from local docs/ folder) ──
  const docsDir = process.env.NODE_ENV === "development"
    ? path.resolve(import.meta.dirname, "../..", "docs")
    : path.resolve(import.meta.dirname, "..", "docs");
  const ebookFiles: Record<string, { filepath: string; filename: string }> = {
    "ebook-pdf": { filepath: path.join(docsDir, "ebook-pago-v2.pdf"), filename: "PAGO-Ebook-v2.pdf" },
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
