# Builder stage
FROM node:22-alpine AS builder

WORKDIR /app/backend
COPY dist/apps/backend .

# Install dependencies
RUN npm ci --omit=dev && \
  npm cache clean --force

# Runtime stage - Minimal image with only what's needed
FROM node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=3333
ENV NODE_ENV=production

WORKDIR /app

# Create user and group
RUN addgroup -S lems && adduser -S backend -G lems

# Install Chromium from Alpine repositories (more reliable than building from source)
# Also install Puppeteer runtime dependencies
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  udev \
  ttf-opensans

# Copy installed dependencies from builder
COPY --from=builder /app/backend /app/backend

# Copy GraphQL schema files needed by loadLemsGraphQLSchema()
# These are built to dist/apps/backend/graphql/ during the build process
COPY --from=builder /app/backend/graphql /app/backend/graphql

# Setup Puppeteer directories and fix permissions
RUN mkdir -p /home/backend/Downloads && \
  chown -R backend:lems /home/backend && \
  chown -R backend:lems /app

WORKDIR /app/backend

# Setup Puppeteer to use system Chromium (Alpine package)
# This avoids the glob pattern issue and is more reliable in Alpine Linux
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

USER backend

EXPOSE 3333

CMD ["node", "main.js"]

