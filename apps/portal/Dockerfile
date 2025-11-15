# Builder stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy the entire standalone build output from dist
COPY dist/apps/portal/.next/standalone .

# Copy the .next directory with all build artifacts to where the config expects it
# The distDir in required-server-files.json points to: ../../dist/apps/portal/.next
# From apps/portal/, that means we need dist/apps/portal/.next at the correct location
COPY dist/apps/portal/.next ./dist/apps/portal/.next

# Copy static files - Next.js standalone doesn't include public directory by default
# These need to be copied to the apps/portal directory where the server runs
COPY apps/portal/public ./apps/portal/public

# Runtime stage
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/apps/portal

# Create non-root user
RUN addgroup -S lems && adduser -S portal -G lems

# Copy everything from builder (includes standalone structure, static files, and public)
# This gives us the complete runtime structure that Next.js expects
COPY --from=builder --chown=portal:lems /app /app

USER portal

EXPOSE 4201

# Run the server from the apps/portal directory where it expects to find ../../dist/apps/portal/.next
CMD ["node", "server.js"]
