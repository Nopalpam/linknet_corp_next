# ================================
# Stage 1: Build
# ================================
FROM node:22-alpine AS builder

WORKDIR /app

# OpenSSL required by Prisma
RUN apk upgrade --no-cache && apk add --no-cache openssl

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

RUN apk upgrade --no-cache && apk add --no-cache openssl postgresql-client

# Non-root user for runtime
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Install dependencies needed by the API and staging DB refresh command.
# The refresh command runs the local Prisma CLI, so Prisma CLI must exist in the image.
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci && npm cache clean --force

# Overwrite with the generated Prisma client from builder
# (prod install only fetches @prisma/client stub; generated code lives in .prisma)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy database refresh/import assets used by npm run db:staging:refresh.
COPY scripts/db-rebuild ./scripts/db-rebuild
COPY database/db-rebuild ./database/db-rebuild

# Fail the image build early if the staging refresh command cannot exist at runtime.
RUN test -f scripts/db-rebuild/refresh-staging-database.cjs && \
    test -f database/db-rebuild/linknet_bersih_legacy_raw.postgres.sql && \
    test -f database/db-rebuild/import_legacy_canonical.sql && \
    test -f database/db-rebuild/validate_legacy_rebuild.sql && \
    node -c scripts/db-rebuild/refresh-staging-database.cjs && \
    psql --version && \
    ./node_modules/.bin/prisma --version >/dev/null

# Switch to non-root user (node_modules are world-readable by default)
USER nodejs

EXPOSE 5000

ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    PORT=5000

# wget is built into Alpine — no extra package needed
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO- https://dev-be.lncorp.local/health || exit 1

CMD ["node", "dist/server.js"]
