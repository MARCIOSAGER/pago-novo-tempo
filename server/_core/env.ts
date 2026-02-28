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
  // Analytics (Umami)
  analyticsEndpoint: process.env.VITE_ANALYTICS_ENDPOINT ?? "",
  analyticsWebsiteId: process.env.VITE_ANALYTICS_WEBSITE_ID ?? "",
  umamiUsername: process.env.UMAMI_USERNAME ?? "",
  umamiPassword: process.env.UMAMI_PASSWORD ?? "",
};
