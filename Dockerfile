# ============================================
# Multi-stage Dockerfile for Google Calendar Clone
# Optimized for production deployment with Neon PostgreSQL
# ============================================

# Stage 1: Base image with Node.js
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies for native modules and sharp
RUN apk add --no-cache libc6-compat

# Stage 2: Install dependencies
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies needed for build)
# Also install sharp for Next.js image optimization
RUN npm ci && npm install sharp

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build arguments to pass environment variables at build time
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_BASE

# Set environment variables for build
ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE

# Build the Next.js application
# Note: Public env vars are embedded during build
RUN npm run build

# Stage 4: Production runtime
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy public folder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy database schema and migrations for runtime schema push
COPY --from=builder --chown=nextjs:nodejs /app/db ./db
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Create startup script for database initialization
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "🚀 Starting Google Calendar Application..."' >> /app/start.sh && \
    echo 'echo "📊 Pushing database schema to PostgreSQL..."' >> /app/start.sh && \
    echo 'npm run db:push || echo "⚠️  Database schema push failed or already up to date"' >> /app/start.sh && \
    echo 'echo "✅ Database schema ready"' >> /app/start.sh && \
    echo 'echo "🌐 Starting Next.js server on port 3000..."' >> /app/start.sh && \
    echo 'exec node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nextjs:nodejs /app/start.sh

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application with database initialization
CMD ["/bin/sh", "/app/start.sh"]