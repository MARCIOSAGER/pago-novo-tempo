# ─── Stage 1: Dependencies ────────────────────────────────────
FROM node:20-slim AS deps

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

RUN pnpm install --frozen-lockfile

# ─── Stage 2: Build ───────────────────────────────────────────
FROM node:20-slim AS build

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm run build

# ─── Stage 3: Production ──────────────────────────────────────
FROM node:20-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copy ALL node_modules from deps stage (esbuild externalizes npm packages
# but bundles relative imports like vite.config — so dev deps like vite,
# @builder.io/vite-plugin-jsx-loc etc. must be available at runtime)
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Built frontend (Vite output)
COPY --from=build /app/dist ./dist

# Drizzle migrations
COPY --from=build /app/drizzle ./drizzle

# Ebook files served via /api/downloads/:format
COPY --from=build /app/docs ./docs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=15s \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "dist/index.js"]
