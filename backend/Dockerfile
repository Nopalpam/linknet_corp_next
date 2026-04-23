# ================================
# Stage 1: Build
# ================================
FROM node:22-alpine AS builder

WORKDIR /app

# OpenSSL required by Prisma
RUN apk add --no-cache openssl

# Install ALL dependencies (dev + prod) so Prisma CLI is available
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma Client (needs prisma CLI from devDependencies)
RUN npx prisma generate

# Compile TypeScript
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ================================
# Stage 2: Production
# ================================
FROM node:22-alpine AS production

RUN apk add --no-cache openssl

# Non-root user for runtime
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Install production dependencies only (no Prisma CLI)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npm cache clean --force

# Overwrite with the generated Prisma client from builder
# (prod install only fetches @prisma/client stub; generated code lives in .prisma)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Switch to non-root user (node_modules are world-readable by default)
USER nodejs

EXPOSE 5000

ENV NODE_ENV=production \
    PORT=5000

# wget is built into Alpine — no extra package needed
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
