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
      url: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028643999/NxTRBHVROOyrOHuD.pdf?Expires=1803743449&Signature=Q61cXPKmQsexZmNkmU50ej~TJbF1T5Y2SFrcv8P1OzuHcJKfMXneOFVjP0l-5bAo48eOc3cok~J76H7ZpNj7Hjs1eUajum~i4ywCh9EjxRsUsodTOrQoXlb5NgphgGq0runDpCislMLGwKv3XPnsbNfqeZ23dfoizLfb5OzJ-SBWE6v0J6aS-LPYlkWMzGoH7SPTvZmoQ-soqLEXqD~LiINXG7QE5BbZS9jYDGL6hoGoo2ZcHU~RBGRbXidqG7jq-bDpCwfb971k~H1YG3gt0NHq6OjcfJUoym-20GeFznIsirjovACj6brMrEywPSJA2X7UKU-WaSqBXuW90FJQmQ__&Key-Pair-Id=K2HSFNDJXOU9YS",
      filename: "PAGO-Ebook-v2.pdf",
    },
    "ebook-pdf-grafica": {
      url: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028643999/NxTRBHVROOyrOHuD.pdf?Expires=1803743449&Signature=Q61cXPKmQsexZmNkmU50ej~TJbF1T5Y2SFrcv8P1OzuHcJKfMXneOFVjP0l-5bAo48eOc3cok~J76H7ZpNj7Hjs1eUajum~i4ywCh9EjxRsUsodTOrQoXlb5NgphgGq0runDpCislMLGwKv3XPnsbNfqeZ23dfoizLfb5OzJ-SBWE6v0J6aS-LPYlkWMzGoH7SPTvZmoQ-soqLEXqD~LiINXG7QE5BbZS9jYDGL6hoGoo2ZcHU~RBGRbXidqG7jq-bDpCwfb971k~H1YG3gt0NHq6OjcfJUoym-20GeFznIsirjovACj6brMrEywPSJA2X7UKU-WaSqBXuW90FJQmQ__&Key-Pair-Id=K2HSFNDJXOU9YS",
      filename: "PAGO-Ebook-v2-Grafica.pdf",
    },
    "ebook-epub": {
      url: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028643999/TfLvukXUiYtrhvUf.epub?Expires=1803743449&Signature=Nh8RvaAA7lMtq8zcFqMVbNUuf6tZnL-DOSgthqVCInkeullO~OR6XeLYoPtmNMb45SBwdHA4jwXUExUrZeUIIuefMDmMmjH3dukp67KXJvczydZ5r9I4nt5qVkamPoNWCZ~p5pZgTJrj0HHOyiXVtdtvQY4ACPIDNmH7ffhLLtZf2RIoh5YH2AhWNvmCSb1wIQMMWgzERZ-ZyqhtU4sYUIxIEq57C2~xgAeVOUJvMUyY~-6ClyIxh~dZ3BcyOo6t1frUzS-Ni39l0C9Yp49Fo~TBYDE5d9pNwL~IIBbjjGDSNKKX3Ceem3Rr817zhYQMSzqEv92fjGVtX5e9RKjFGg__&Key-Pair-Id=K2HSFNDJXOU9YS",
      filename: "PAGO-Ebook-v2.epub",
    },
    "ebook-mobi": {
      url: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028643999/GtWuziDqVVjMAllQ.mobi?Expires=1803743449&Signature=sh~wsyCFkzXXSZtBzuMbbWBFJfjy7j2IScBYJD1P5r2FA~7KOb~W~GiJp4odWOH0ZzI4aiPNbDKlQr3TKiYlBKsUTdWi69whzVrRF45U2YSU-lJNVH68Y2kOE6aCaxnM0wpO-aHQDKGtn9~7LxDF2Rc3fvi2AZEsxDepLIif0FTfENLGfuIeH6bLq79791GwiLlDa3FfnajdEVnD9GsCYzxej4Wpkk4mn7R~MnCm~Qslng227kR0B43JGV3n2AjxGV93bmCiqlh-nrSzgOistvrbnoOLN6gsDNqmBmCr3ks5vkFrs8WmW2DDROveSKj0Fj5g8Q-0dnretvW2Pf9-~g__&Key-Pair-Id=K2HSFNDJXOU9YS",
      filename: "PAGO-Ebook-v2.mobi",
    },
    "ebook-flipbook": {
      url: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028643999/lJxPiNEElaOJuwAo.html?Expires=1803743449&Signature=d0~VTFsnmk0KhwsIqg-erzEyxrB4uQX4A777u4OC5JzaNWSBf5bLESMQm9uCthvPSzxCbWa7sI2uibDQGnpCMZOmERG~QKqutbrohTG2Og7PZPQnqpohmtJKwLto0exoXNggJCXcg2W2Gwi1kcTyx~-bRU~RSgZRGr2kIaDyG4wQ8TtRyjgHhqiMuXIvo4cgG5F-FdhB17sqFpS2ElRtyypodQhZkDEzI05reDrMEymK8hq9P4sIsm-5BrkUIX603N8qFwAm5t2IOW3qjrCjs039OR9SwKDTNenv8-3w4oNUohdNcO92ZlQSz~BxBJaluqG1Mqdh5hPgrQRLqee1-A__&Key-Pair-Id=K2HSFNDJXOU9YS",
      filename: "PAGO-Ebook-Flipbook.html",
    },
    "ebook-html": {
      url: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028643999/erDTlizKKxbincca.html?Expires=1803743449&Signature=lskU~aHl4sr4JIgsuxprKfPS3zEVlMZXeNT6xRkMtHQbUVIDjCPSH23G0eJlTYLOzXZlLG5Uzb5QaO5sFy0L7f5gaAzwAcO91Uxwp-v3-IvmpSmH06H8V5EWf0PI4EqC0xmpW9bADBlPMV7bFLHCFu20wRI0k36tuTNd~N3yDFl5lRRqbebbzj-rs2-9iiXkS~3VQPce-NmO8yHAe~-Bnpr4QtEBazasVqC4~81pL1Ip1hOIR-Ty3JN99lrHlCN2pgvgN5roeEK94Eq-kCt3a4s~GR8Gp2Sc43ivbzoMf2n-6Y-7C42hstEj~tUVEjs~uRRr6K4KOOVhk71VaqRD7A__&Key-Pair-Id=K2HSFNDJXOU9YS",
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
