# ───────────────────────────────────────────────
# Stage 1: Build
# ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

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
FROM node:20-alpine AS production

# Reduce attack surface — update apk packages in base image
RUN apk upgrade --no-cache

ENV NODE_ENV=production

# Create non-root user/group (Trivy + CIS compliance)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output, owned by app user
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

# Drop privileges
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/app.js"]
