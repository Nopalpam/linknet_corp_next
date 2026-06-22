# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Install ALL dependencies (dev + prod needed for build tools)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

ENV NODE_ENV=production

# Build Next.js — output: standalone enabled in next.config.mjs
RUN npm run build

# Stage 2: Runner (Production)
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

# next-intl reads locale files from filesystem at request time
COPY --from=builder --chown=nextjs:nodejs /app/messages         ./messages

# Debug: Print directory structure to locate server.js
RUN echo "=== ROOT PATH ===" && pwd && ls -la && echo "=== FIND SERVER.JS ===" && find . -name "server.js"

# Flatten nested standalone directory structure if Next.js nested the output
RUN if [ -d "./Link Net Corporate/corporate-web" ]; then \
      echo "Flattening Link Net Corporate/corporate-web structure..." && \
      cp -r "./Link Net Corporate/corporate-web/." ./ && \
      rm -rf "./Link Net Corporate"; \
    elif [ -d "./corporate-web" ]; then \
      echo "Flattening corporate-web structure..." && \
      cp -r "./corporate-web/." ./ && \
      rm -rf "./corporate-web"; \
    elif [ -d "./app" ]; then \
      echo "Flattening app structure..." && \
      cp -r "./app/." ./ && \
      rm -rf "./app"; \
    fi

# Verify flattening succeeded
RUN echo "=== AFTER FLATTENING ===" && ls -la && [ -f "./server.js" ] || (echo "❌ server.js not found at root!" && exit 1)

USER nextjs

EXPOSE 3000

ENV PORT=3000 \
    HOSTNAME=0.0.0.0

# wget is built into Alpine — no extra package needed
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --spider -q https://dev-be.lncorp.local || exit 1

CMD ["node", "server.js"]
