# ---------- Build stage ----------
FROM node:22-slim AS builder
WORKDIR /app

# Pin pnpm via Corepack for reproducible builds
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-lock.yaml ./

# Faster, cache-friendly installs
RUN pnpm fetch --frozen-lockfile
COPY . .
RUN pnpm install --offline --frozen-lockfile
RUN pnpm run build


# ---------- Runtime stage ----------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1001 nestjs
USER nestjs

COPY --chown=nestjs:nestjs package.json pnpm-lock.yaml ./
RUN pnpm fetch --frozen-lockfile \
  && pnpm install --offline --frozen-lockfile --prod

COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist

EXPOSE 3333
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "pnpm run migration:run:prod && node dist/main.js"]