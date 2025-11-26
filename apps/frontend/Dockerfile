# Builder stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy the entire standalone build output from dist
COPY dist/apps/frontend/.next/standalone .

# Copy the .next directory with all build artifacts to where the config expects it
# The distDir in required-server-files.json points to: ../../dist/apps/frontend/.next
# From apps/frontend/, that means we need dist/apps/frontend/.next at the correct location
COPY dist/apps/frontend/.next ./dist/apps/frontend/.next

# Copy static files - Next.js standalone doesn't include public directory by default
# These need to be copied to the apps/frontend directory where the server runs
COPY apps/frontend/public ./apps/frontend/public

# Runtime stage
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV PORT=4200
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/apps/frontend

# Create non-root user
RUN addgroup -S lems && adduser -S frontend -G lems

# Copy everything from builder (includes standalone structure, static files, and public)
# This gives us the complete runtime structure that Next.js expects
COPY --from=builder --chown=frontend:lems /app /app

USER frontend

EXPOSE 4200

# Run the server from the apps/frontend directory where it expects to find ../../dist/apps/frontend/.next
CMD ["node", "server.js"]
