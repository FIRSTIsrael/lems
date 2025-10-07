FROM node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=3333
ENV NODE_ENV=production

# Non-sensitive configuration only
# These are safe to bake into the image as they're not secrets
ARG DB_NAME
ENV DB_NAME=$DB_NAME
ARG PG_HOST
ENV PG_HOST=$PG_HOST
ARG PG_PORT
ENV PG_PORT=$PG_PORT
ARG PG_USER
ENV PG_USER=$PG_USER
ARG RECAPTCHA
ENV RECAPTCHA=$RECAPTCHA
ARG LEMS_DOMAIN
ENV LEMS_DOMAIN=$LEMS_DOMAIN
ARG SCHEDULER_URL
ENV SCHEDULER_URL=$SCHEDULER_URL
ARG DIGITALOCEAN_ENDPOINT
ENV DIGITALOCEAN_ENDPOINT=$DIGITALOCEAN_ENDPOINT
ARG DIGITALOCEAN_SPACE
ENV DIGITALOCEAN_SPACE=$DIGITALOCEAN_SPACE

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

