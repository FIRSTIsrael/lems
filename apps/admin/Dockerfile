# Builder stage - Install dependencies and build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev && \
  npm cache clean --force

# Copy built admin app from dist
COPY dist/apps/admin .

# Runtime stage - Minimal image with only what's needed
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV PORT=4201
ENV HOSTNAME="0.0.0.0"

WORKDIR /app

# Create non-root user
RUN addgroup -S lems && adduser -S admin -G lems

# Copy standalone build and dependencies from builder
COPY --from=builder --chown=admin:lems /app/node_modules ./node_modules
COPY --from=builder --chown=admin:lems /app/.next/standalone ./
COPY --from=builder --chown=admin:lems /app/.next/static ./.next/static
COPY --from=builder --chown=admin:lems /app/public ./public

USER admin

EXPOSE 4201

CMD ["node", "apps/admin/server.js"]
