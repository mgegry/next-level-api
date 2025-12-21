# ---------- Build stage ----------
FROM node:22-slim AS builder
WORKDIR /app

# Pin pnpm via Corepack for reproducible builds
RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

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

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Create non-root user (but don't switch yet)
RUN useradd -m -u 1001 nestjs

# Install prod deps as root (avoids EACCES writing to /app)
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch --frozen-lockfile \
  && pnpm install --offline --frozen-lockfile --prod

# Copy compiled app
COPY --from=builder /app/dist ./dist

# Fix ownership, then drop privileges
RUN chown -R nestjs:nestjs /app
USER nestjs

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "pnpm run migration:run:prod && node dist/main.js"]
