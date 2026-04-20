// SEC: fail-fast on missing critical secrets in production.
// Empty JWT_SECRET would allow attackers to forge HS256 tokens signed with "".
// Stripe/webhook secrets missing = silent runtime failure. Fail at boot instead.
if (process.env.NODE_ENV === "production") {
  const required = ["JWT_SECRET"];
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  if (stripeConfigured) {
    // If Stripe is partially configured, both secrets must be present.
    required.push("STRIPE_WEBHOOK_SECRET");
  }
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`[env] Missing required secrets in production: ${missing.join(", ")}`);
  }
}

export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  // GitHub OAuth
  githubClientId: process.env.GITHUB_CLIENT_ID ?? "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  // OpenAI (direct)
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  // AWS S3 (direct)
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsRegion: process.env.AWS_REGION ?? "us-east-1",
  awsS3Bucket: process.env.AWS_S3_BUCKET ?? "",
  // Email notifications
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: process.env.SMTP_PORT ?? "587",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  // Public site URL (used for download links). Validated below.
  siteUrl: (() => {
    const raw = process.env.SITE_URL ?? "https://metodopago.com";
    const trimmed = raw.replace(/\/+$/, ""); // strip trailing slashes
    if (!/^https?:\/\/[a-z0-9.-]+(:\d+)?$/i.test(trimmed)) {
      console.warn(`[env] SITE_URL invalid format: "${raw}" — falling back to https://metodopago.com`);
      return "https://metodopago.com";
    }
    return trimmed;
  })(),
  // Analytics (Umami)
  analyticsEndpoint: process.env.VITE_ANALYTICS_ENDPOINT ?? "",
  analyticsWebsiteId: process.env.VITE_ANALYTICS_WEBSITE_ID ?? "",
  umamiUsername: process.env.UMAMI_USERNAME ?? "",
  umamiPassword: process.env.UMAMI_PASSWORD ?? "",
};
