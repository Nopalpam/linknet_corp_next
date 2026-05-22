# ───────────────────────────────────────────────
# Stage 1: Build
# ───────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk upgrade --no-cache

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci

# Compile TypeScript
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ───────────────────────────────────────────────
# Stage 2: Production image
# ───────────────────────────────────────────────
FROM node:22-alpine AS production

# Update base image packages (security: patch OS-level CVEs)
RUN apk upgrade --no-cache

ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# Create non-root user/group (Trivy + CIS compliance)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output (node_modules are world-readable — no chown needed)
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

# Drop privileges
USER appuser

EXPOSE 3000

# wget is built into Alpine — lighter than node -e for health checks
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --spider -q http://localhost:3000/health || exit 1

CMD ["node", "dist/app.js"]
