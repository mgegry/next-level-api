# ---------- Build stage ----------
FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install dumb-init for clean signal handling
RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1001 nestjs
USER nestjs

# Install prod deps only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled app
COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

# ⬇️ Run migrations FIRST, then start NestJS
CMD ["sh", "-c", "npm run migration:run:prod && node dist/main.js"]