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
  // ─── Ebook Download Routes ─────────────────────────────────
  const ebookFiles: Record<string, { url: string; filename: string }> = {
    "ebook-pdf": {
      url: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028643999/eZxBBdeKPbrkcOtT.pdf?Expires=1803748610&Signature=eFAUQS0pT0XIcUouQfwdPu9S9dlfCIw1l3Cjz-jtzWCqek-M74gCdOy4gMri2lkBIxjJdSvrPbd-3BZCw2NFZNgzii31bp1Nsw4ne7V6vtbVGWVAtGEBxTmpNkjMfyziiso7OfcEbVwiI-euCjKCY28DZfQhJBzjhdlS6S2rnEnTTnqeyN5-hTk9l7V81i4WdimszFI0CYoFFQSNAHk0nfe4Atq~mzEeY7neYqqinz9F60iKDzRBYPXu4I8yAvWkgb2zApHLuSVrADpkoMtawP7QhMMhCriR2i~lDG57MX2PGJ2oQwaOYxg9-YmuDK9qMmDiBBxvBYRSxEWY0ux7Zw__&Key-Pair-Id=K2HSFNDJXOU9YS",
      filename: "PAGO-Ebook-v2.pdf",
    },
    "ebook-pdf-grafica": {
      url: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028643999/ZwjrbuQUWyVkjvEP.pdf?Expires=1803748611&Signature=sZ7rASliREeZBKw3LMMkAzESjBWCuvCXjZYtMS8xxBjVWm1F811h3pRl2bUOhewkT6AK6dpTGvSg0cs8UJgcCNWJKeellFgm9G3W4lFGdPyZXzjelQUXRjLppyuuH5hOMpmkYf0Sj0SJEgUKxGRAxeCZw5~1-BIl7Hzm35SgOKY24iv4WTivQOfTBfadO3RH9751YN1p2S9tkRM9~6sgp~-DSiV5pjcOkAOH0es5~-PitiVjbB6mjWXxxhRNebCS2HzcDS7xMaoQ-rcXyN06SXRwZlDjX1jeVss0U4Ob4WjerlOOZgc-lx4tXp-8B6catckHqLjnu7C7Cxbb4snP1w__&Key-Pair-Id=K2HSFNDJXOU9YS",
      filename: "PAGO-Ebook-v1-Grafica.pdf",
    },
    "ebook-epub": {
      url: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028643999/vSqZuzzhJInCGwlC.epub?Expires=1803748612&Signature=e27XQunrd8TABv~go4dh~-6YinzLBeuKXRm1Ler2eLRVN2UDVmL8HVOlXK52gdXZSXNf9bxRoqW-VRHjTIeh555dGoU~8ZKFn~Lm~1mW~FptdrDEQ7tkcXN1e9gu~-XtEmt-fOcOEC20zaGa-SOF5ipYxqWFhLJp0-0rX-2sJDxFM00NyMfKccxshEzcJIvFJIZwJwJqbPdk2JrPDTY~WdMalKTvTTl~ceOcW5~s1uuRe8-JigkxxL~iD-OGdJ3U6hBmGqGXuHuU3It7rvMjdbV-luesAwl~7w~AXFDqPioc5qlCkenA-6lal~hcZW1xW2qMsu3EfT2DEtBh-Y5hMw__&Key-Pair-Id=K2HSFNDJXOU9YS",
      filename: "PAGO-Ebook-v2.epub",
    },
    "ebook-mobi": {
      url: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028643999/MKtoPdresVJMbsAT.mobi?Expires=1803748613&Signature=rdqiXOw107OO8RTsEPTZPeSGyN7Eb5nFLhiLBP6drDHZnipM68TQ25D6DD6jHfmpQrmy8-NeFmlkcm9jhONkn6M7WJJfhI8YSKVMYlETeTSCN0PcxTMrv8XS76fT4tPClieM8dVFEiWu-vTxjxxV1SaOzlp~KPk29BEtMPfsjdJQZWbrRWyEXVNJ~z6FfX8BaEUrNQIRmgiZc7ooYxPc2hApAOSjRrxFynQiDlLE9XUrsBdeud83VJpSrq6kHT5hSP-mdcy75F~iA9VNRyCtqchhplLSbkiuU5l~Zd3~yD9JvoKZnQkVdFi-XVomDDseqItsqEZx~mOvJdJsuwDWcw__&Key-Pair-Id=K2HSFNDJXOU9YS",
      filename: "PAGO-Ebook-v2.mobi",
    },
    "ebook-flipbook": {
      url: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028643999/schRlLmgaEwceCwX.html?Expires=1803748723&Signature=kF6QTa9diYjSJpfSjYP0VcphrA1lah9HAVwQ-wKugDyla0bnAQ2otDPA3qcb0sntKmmkTdHbVfjAbezMWgu02gqeM5yWqY43p8fIi3K5yfN4~jgT8Ud8OlPxxM~uZ-AZ7lGbXeA8uK9uIVbLEMCDRIKBFF1eCbif3477hzhQKqInPNLGADtJa0zp3pQpBmgAgFduxsjJ5ySl15njZNWw2Os7xMsRdfQ0Uvgbb3OF2WJ5NR4iB0pV1OYQnA7nh1JADmXDbpfCZm7OFm3IharBFPLYXWbH-tXLJ9Jq9QeIZOigO9PlVhQwAdPd9Ltv3wtrdlM9AZY2jfZ-0zRJbAFgAA__&Key-Pair-Id=K2HSFNDJXOU9YS",
      filename: "PAGO-Ebook-Flipbook.html",
    },
    "ebook-html": {
      url: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028643999/nsqXhRlGADHIgEiR.html?Expires=1803748787&Signature=ZL4IkPKQWy-ucDA2MmIrVgf-L39g8PfUmq4SsfDgvgmXd-2yucqHaG6y04BU4Z7jk1J1SNs0Yw50ueajOjthdd~TspeDO96NpekvTVcUa7FPzLrvIX7XwJiKXYQFy74Up5DCJGm6X0Xn8y~SnJwdqY2-Xz08mkrO8sPDRtBwnaYdui7BL3dIFKIW~vnMh0WaKguk0Mm~g0V8dfuSJb2nrg6nSQFAGsiZMiRB8CfFafCnKNNwJhECCjMlkXUo~8F-IO8JiIPTEDtxu2GvcD780FiTAZKHRc06HWDcanw9-XJzSfugbkdgtUt22uqWaBOM-5ctfnf6CjFv2TjocaI3zQ__&Key-Pair-Id=K2HSFNDJXOU9YS",
      filename: "PAGO-Ebook-v2.html",
    },
  };

  app.get("/api/downloads/:format", (req, res) => {
    const file = ebookFiles[req.params.format];
    if (!file) {
      return res.status(404).json({ error: "Formato não encontrado" });
    }
    res.redirect(302, file.url);
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
