# ---------- Build stage ----------
FROM node:22-silm AS builder
WORKDIR /app

# Install deps (including dev deps for building)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# If you have prisma/typeorm migrations files or other runtime assets,
# copy them too (uncomment if needed):
# COPY --from=builder /app/prisma ./prisma
# COPY --from=builder /app/migrations ./migrations

# Render (and many platforms) provide PORT env var
EXPOSE 3000
CMD ["node", "dist/main.js"]