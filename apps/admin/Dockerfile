# Builder stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy the entire standalone build output from dist
COPY dist/apps/admin/.next/standalone .

# Copy the .next directory with all build artifacts to where the config expects it
# The distDir in required-server-files.json points to: ../../dist/apps/admin/.next
# From apps/admin/, that means we need dist/apps/admin/.next at the correct location
COPY dist/apps/admin/.next ./dist/apps/admin/.next

# Copy static files - Next.js standalone doesn't include public directory by default
# These need to be copied to the apps/admin directory where the server runs
COPY apps/admin/public ./apps/admin/public

# Runtime stage
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV PORT=4201
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/apps/admin

# Create non-root user
RUN addgroup -S lems && adduser -S admin -G lems

# Copy everything from builder (includes standalone structure, static files, and public)
# This gives us the complete runtime structure that Next.js expects
COPY --from=builder --chown=admin:lems /app /app

USER admin

EXPOSE 4201

# Run the server from the apps/admin directory where it expects to find ../../dist/apps/admin/.next
CMD ["node", "server.js"]
