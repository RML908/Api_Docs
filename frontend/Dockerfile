# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --frozen-lockfile

COPY . .
RUN npm run build

# ─── Stage 2: Serve with Nginx ───────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Config template: official nginx image renders it with env vars at start
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
# Makes the image's entrypoint export NGINX_LOCAL_RESOLVERS (nameservers from /etc/resolv.conf)
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1 \
    PORT=80 \
    BACKEND_URL=http://backend:8080 \
    LEGACY_API_URL=http://legacy-api:80/

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
