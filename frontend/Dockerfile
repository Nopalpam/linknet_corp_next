# ================================
# Stage 1: Builder
# ================================
FROM node:22-alpine AS builder
WORKDIR /app

# Install ALL dependencies (dev + prod needed for build tools)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

ENV NODE_ENV=production

# Build Next.js — output: standalone enabled in next.config.ts
RUN npm run build

# ================================
# Stage 2: Runner (Production)
# ================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone output includes its own trimmed node_modules — no npm install needed
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

USER nextjs

EXPOSE 3001

ENV PORT=3001 \
    HOSTNAME=0.0.0.0

# wget is built into Alpine — no extra package needed
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --spider -q http://localhost:3001/ || exit 1

CMD ["node", "server.js"]
