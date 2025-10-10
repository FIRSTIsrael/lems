# Builder stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy the entire standalone build output from dist
COPY dist/apps/admin/.next/standalone .

# Copy static assets (JS chunks, CSS, etc.) - these are served by Next.js
COPY dist/apps/admin/.next/static ./.next/static

# Copy public assets
COPY dist/apps/admin/public ./public

# Runtime stage
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV PORT=4201
ENV HOSTNAME="0.0.0.0"

WORKDIR /app

# Create non-root user
RUN addgroup -S lems && adduser -S admin -G lems

# Copy everything from builder (includes standalone structure, static files, and public)
# This gives us the complete runtime structure that Next.js expects
COPY --from=builder --chown=admin:lems /app ./

USER admin

EXPOSE 4201

# The standalone build already has the server at apps/admin/server.js
CMD ["node", "apps/admin/server.js"]
