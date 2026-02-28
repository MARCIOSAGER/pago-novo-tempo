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

CMD ["node", "dist/index.js"]
