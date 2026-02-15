# Builder stage
FROM node:22-alpine AS builder

WORKDIR /app/backend
COPY dist/apps/backend .

# Install dependencies and Puppeteer Chrome
RUN npm ci --omit=dev && \
  npx puppeteer browsers install chrome && \
  npm cache clean --force

# Runtime stage - Minimal image with only what's needed
FROM node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=3333
ENV NODE_ENV=production

WORKDIR /app

# Create user and group
RUN addgroup -S lems && adduser -S backend -G lems

# Install runtime dependencies needed for Puppeteer Chrome
RUN apk add --no-cache \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  udev \
  ttf-opensans

# Copy installed dependencies and Puppeteer Chrome from builder
COPY --from=builder /app/backend /app/backend
COPY --from=builder /root/.cache/puppeteer /root/.cache/puppeteer

# Copy GraphQL schema files needed by loadLemsGraphQLSchema()
# These are built to dist/apps/backend/graphql/ during the build process
COPY --from=builder /app/backend/graphql /app/backend/graphql

# Setup Puppeteer directories and fix permissions
RUN mkdir -p /home/backend/Downloads && \
  chown -R backend:lems /home/backend && \
  chown -R backend:lems /app && \
  # Find the installed Chrome executable and create a symlink for consistent path
  find /root/.cache/puppeteer -name "chrome" -type f -exec ln -sf {} /usr/local/bin/chrome \; || true

WORKDIR /app/backend

# Setup Puppeteer to use downloaded Chrome via symlink (resolves glob pattern issue)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/local/bin/chrome

USER backend

EXPOSE 3333

CMD ["node", "main.js"]

