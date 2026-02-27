# Security Checklist

## Server-Side Protections

### 1. Rate Limiting

```ts
import rateLimit from "express-rate-limit";

// Global: 100 req/15min
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Form submission: 5 req/15min per IP
app.use("/api/trpc/mentoria.submit", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));
```

### 2. Helmet.js Headers

```ts
import helmet from "helmet";
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
}));
```

### 3. CORS

```ts
import cors from "cors";
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["https://yourdomain.com"],
  credentials: true,
}));
```

### 4. Request Size Limiting

```ts
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
```

### 5. Input Validation (Zod on every route)

All tRPC inputs validated with Zod schemas. Never trust client data.

### 6. Honeypot Anti-Bot

Add invisible `website` field to forms. If filled, silently accept but discard:

```ts
if (input.website) return { success: true, message: "OK" };
```

### 7. File Upload Validation

```ts
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const BLOCKED_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".php", ".js"];

export function validateFileUpload(file: { name: string; type: string; size: number }) {
  if (!ALLOWED_TYPES.includes(file.type)) return { valid: false, error: "Tipo não permitido" };
  if (file.size > MAX_SIZE) return { valid: false, error: "Arquivo muito grande" };
  if (BLOCKED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext)))
    return { valid: false, error: "Extensão bloqueada" };
  return { valid: true };
}
```

## Dependencies

```bash
pnpm add helmet cors express-rate-limit
```
