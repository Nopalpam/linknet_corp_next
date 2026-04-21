# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only for smaller image)
RUN npm ci --omit=dev

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files and install ALL deps (including dev for build tools)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Build Next.js application
RUN npm run build

# Stage 3: Runner (Production)
FROM node:22-alpine AS runner
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# CRITICAL: Copy i18n folder for next-intl runtime
COPY --from=builder --chown=nextjs:nodejs /app/i18n ./i18n

# Copy messages folder for dynamic imports
COPY --from=builder --chown=nextjs:nodejs /app/messages ./messages

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set port environment variable
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

# Start Next.js application using next start
CMD ["npm", "run", "start"]
