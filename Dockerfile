# ---------- Build stage ----------
FROM node:22-slim AS builder
WORKDIR /app

# Enable pnpm via Corepack (recommended)
RUN corepack enable

# Copy only dependency manifests first (better caching)
COPY package.json pnpm-lock.yaml ./

# Install deps (including dev deps for build)
RUN pnpm install --frozen-lockfile

# Copy source + build
COPY . .
RUN pnpm run build


# ---------- Runtime stage ----------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Enable pnpm in runtime image too (needed for migrations script below)
RUN corepack enable

# Install dumb-init for clean signal handling
RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1001 nestjs
USER nestjs

# Install prod deps only
COPY --chown=nestjs:nestjs package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy compiled app (and any runtime-needed files, if applicable)
COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

# Run migrations FIRST, then start NestJS
CMD ["sh", "-c", "pnpm run migration:run:prod && node dist/main.js"]