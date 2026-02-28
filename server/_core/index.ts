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
import { serveStatic, setupVite } from "./vite";
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
  const docsDir = path.resolve(import.meta.dirname, "..", "..", "docs");
  const ebookFiles: Record<string, { filepath: string; filename: string }> = {
    "ebook-pdf": { filepath: path.join(docsDir, "ebook-pago-v2.pdf"), filename: "PAGO-Ebook-v2.pdf" },
    "ebook-pdf-grafica": { filepath: path.join(docsDir, "ebook-pago-v2-grafica.pdf"), filename: "PAGO-Ebook-v1-Grafica.pdf" },
    "ebook-epub": { filepath: path.join(docsDir, "ebook-pago-v2.epub"), filename: "PAGO-Ebook-v2.epub" },
    "ebook-mobi": { filepath: path.join(docsDir, "ebook-pago-v2.mobi"), filename: "PAGO-Ebook-v2.mobi" },
    "ebook-flipbook": { filepath: path.join(docsDir, "ebook-pago-flipbook.html"), filename: "PAGO-Ebook-Flipbook.html" },
    "ebook-html": { filepath: path.join(docsDir, "ebook-pago-v2.html"), filename: "PAGO-Ebook-v2.html" },
    "ebook-kids-pdf": { filepath: path.join(docsDir, "ebook-pago-v2-print.pdf"), filename: "PAGO-Kids-Ebook.pdf" },
  };

  app.get("/api/downloads/:format", (req, res) => {
    const file = ebookFiles[req.params.format];
    if (!file) {
      return res.status(404).json({ error: "Formato não encontrado" });
    }
    res.download(file.filepath, file.filename, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ error: "Arquivo não encontrado" });
      }
    });
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
