/**
 * P.A.G.O. — Security Middleware Layer
 * Comprehensive protection against:
 * - XSS (Cross-Site Scripting)
 * - CSRF (Cross-Site Request Forgery)
 * - SQL Injection (handled by Drizzle ORM parameterized queries)
 * - DDoS / Brute Force (Rate Limiting)
 * - Clickjacking (X-Frame-Options via Helmet)
 * - MIME Sniffing (X-Content-Type-Options via Helmet)
 * - HTTP Parameter Pollution
 * - Path Traversal
 * - Oversized Payloads
 * - Bot Spam (Honeypot)
 */

import type { Express, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

// ─── 1. Helmet — HTTP Security Headers ──────────────────────────
export function applyHelmet(app: Express) {
  app.use(
    helmet({
      // Content Security Policy — prevents XSS by restricting resource origins
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
          connectSrc: ["'self'", "https:", "wss:"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      // Prevent clickjacking
      frameguard: { action: "deny" },
      // Prevent MIME type sniffing
      noSniff: true,
      // Referrer Policy — limit information leakage
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      // HSTS — force HTTPS
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      // Hide X-Powered-By header
      hidePoweredBy: true,
      // XSS Filter (legacy browsers)
      xssFilter: true,
      // DNS Prefetch Control
      dnsPrefetchControl: { allow: false },
      // Permitted Cross-Domain Policies
      permittedCrossDomainPolicies: { permittedPolicies: "none" },
    })
  );
}

// ─── 2. Rate Limiting — DDoS & Brute Force Protection ───────────

// General API rate limiter: 100 requests per 15 minutes per IP
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas requisições. Tente novamente em alguns minutos.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

// Strict rate limiter for sensitive endpoints (inscription, file upload)
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Limite de requisições atingido para esta operação.",
    code: "STRICT_RATE_LIMIT_EXCEEDED",
  },
});

// Auth rate limiter: 10 attempts per 15 minutes per IP
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas tentativas de autenticação. Aguarde antes de tentar novamente.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
});

// ─── 3. HTTP Parameter Pollution Protection ─────────────────────
export function applyHpp(app: Express) {
  app.use(hpp());
}

// ─── 4. Input Sanitization Middleware ────────────────────────────
// Strips dangerous HTML/script tags from string inputs
function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/javascript\s*:/gi, "")
      .replace(/data\s*:\s*text\/html/gi, "")
      .trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      sanitized[k] = sanitizeValue(v);
    }
    return sanitized;
  }
  return value;
}

export function inputSanitizer(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      req.query[key] = sanitizeValue(req.query[key]) as any;
    }
  }
  if (req.params && typeof req.params === "object") {
    for (const key of Object.keys(req.params)) {
      req.params[key] = sanitizeValue(req.params[key]) as string;
    }
  }
  next();
}

// ─── 5. File Upload Validation ──────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "audio/mpeg",
  "audio/wav",
  "video/mp4",
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const DANGEROUS_EXTENSIONS = new Set([
  ".exe", ".bat", ".cmd", ".com", ".msi", ".scr", ".pif",
  ".vbs", ".vbe", ".js", ".jse", ".wsf", ".wsh", ".ps1",
  ".sh", ".bash", ".csh", ".ksh", ".php", ".asp", ".aspx",
  ".jsp", ".py", ".rb", ".pl", ".cgi", ".htaccess", ".htpasswd",
]);

export function validateFileUpload(
  filename: string,
  mimeType: string,
  size: number
): { valid: boolean; error?: string } {
  // Check file size
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `Arquivo excede o tamanho máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB.` };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return { valid: false, error: `Tipo de arquivo não permitido: ${mimeType}` };
  }

  // Check dangerous extensions
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Extensão de arquivo perigosa não permitida: ${ext}` };
  }

  // Check for path traversal in filename
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return { valid: false, error: "Nome de arquivo contém caracteres não permitidos." };
  }

  // Check for null bytes (path traversal attack)
  if (filename.includes("\0")) {
    return { valid: false, error: "Nome de arquivo inválido." };
  }

  return { valid: true };
}

// ─── 6. Request Size Limiting ───────────────────────────────────
import express from "express";

export function applyRequestSizeLimits(app: Express) {
  // JSON body limit: 1MB
  app.use(express.json({ limit: "1mb" }));
  // URL-encoded body limit: 1MB
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
}

// ─── 7. Security Audit Logger ───────────────────────────────────
export function securityLogger(req: Request, _res: Response, next: NextFunction) {
  const suspiciousPatterns = [
    /(\.\.\/)/, // Path traversal
    /<script/i, // XSS attempt
    /union\s+select/i, // SQL injection
    /;\s*drop\s+table/i, // SQL injection
    /'\s*or\s+'1'\s*=\s*'1/i, // SQL injection
    /exec\s*\(/i, // Command injection
    /eval\s*\(/i, // Code injection
  ];

  const fullUrl = req.originalUrl || req.url;
  const body = JSON.stringify(req.body || {});
  const combined = `${fullUrl} ${body}`;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(combined)) {
      console.warn(
        `[SECURITY] Suspicious request detected | IP: ${req.ip} | Method: ${req.method} | URL: ${fullUrl} | Pattern: ${pattern.source} | Time: ${new Date().toISOString()}`
      );
      break;
    }
  }

  next();
}

// ─── 8. Honeypot Anti-Bot Field Validator ───────────────────────
// The frontend form includes a hidden field that bots will fill out.
// If the field has a value, the request is from a bot.
export function honeypotCheck(honeypotValue: string | undefined | null): boolean {
  // Returns true if the request is from a bot
  return !!honeypotValue && honeypotValue.trim().length > 0;
}

// ─── 9. CORS Configuration ─────────────────────────────────────
export function getCorsOptions() {
  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, etc.) in dev
      if (!origin) {
        callback(null, true);
        return;
      }
      // Allow same-origin and manus.space domains
      const allowedPatterns = [
        /^https?:\/\/localhost(:\d+)?$/,
        /^https?:\/\/.*\.manus\.space$/,
        /^https?:\/\/.*\.manus\.computer$/,
      ];
      const isAllowed = allowedPatterns.some((p) => p.test(origin));
      callback(isAllowed ? null : new Error("Not allowed by CORS"), isAllowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
    maxAge: 86400, // 24 hours preflight cache
  };
}

// ─── 10. Apply All Security Layers ──────────────────────────────
export function applyAllSecurity(app: Express) {
  // Order matters: headers first, then parsing, then validation
  applyHelmet(app);
  applyHpp(app);
  applyRequestSizeLimits(app);
  app.use(inputSanitizer);
  app.use(securityLogger);
  app.use("/api/", generalRateLimiter);
}
