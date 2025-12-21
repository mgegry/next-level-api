# ---------- Build stage ----------
FROM node:22-slim AS builder
WORKDIR /app

# Allow dependency build scripts (bcrypt, etc.)
ENV PNPM_ALLOW_SCRIPTS=true

# Pin pnpm for reproducible builds
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-lock.yaml ./

# Fast, cache-friendly install
RUN pnpm fetch --frozen-lockfile
COPY . .
RUN pnpm install --offline --frozen-lockfile
RUN pnpm run build


# ---------- Runtime stage ----------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PNPM_ALLOW_SCRIPTS=true

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Init + certs (enough for Render)
RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./

# Install prod deps
RUN pnpm fetch --frozen-lockfile \
  && pnpm install --offline --frozen-lockfile --prod

# Copy compiled app
COPY --from=builder /app/dist ./dist

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]

# Run migrations once, then start API
CMD ["sh", "-c", "pnpm run migration:run:prod && node dist/main.js"]