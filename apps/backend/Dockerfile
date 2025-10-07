FROM node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=3333
ENV NODE_ENV=production

# All application configuration (both sensitive and non-sensitive) is provided
# at runtime via environment variables in docker-compose.yml
# The backend reads these using process.env at runtime.
# No build-time configuration needed since we copy pre-built code.

WORKDIR /app

RUN addgroup -S lems && adduser -S backend -G lems

COPY dist/apps/backend backend
RUN chown -R backend:lems .

# Install Chromium for Puppeteer
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app/backend
RUN npm i --omit=dev && npx puppeteer browsers install chrome

# Setup Puppeteer directories
RUN mkdir -p /home/backend/Downloads /app && \
  chown -R backend:lems /home/backend && \
  chown -R backend:lems /app

USER backend

EXPOSE 3333

CMD ["node", "main.js"]

