FROM oven/bun:1.3-debian AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user and group
# Install passwd package (contains groupadd/useradd) if not already available
RUN if ! command -v groupadd >/dev/null 2>&1; then \
    apt-get update && \
    apt-get install -y --no-install-recommends passwd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*; \
    fi && \
    groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs

# Copy necessary files with proper ownership
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Add security labels
LABEL org.opencontainers.image.title="go-links" \
    org.opencontainers.image.description="Link shortener application" \
    org.opencontainers.image.authors="GitHub Actions" 

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "run", "start"]

