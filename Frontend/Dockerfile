# ==============================================================================
#  DeployVerse Frontend — Dockerfile
#
#  Stage 1 (build): Node 22 Alpine — runs `npm run build` to produce dist/
#  Stage 2 (serve): nginx Alpine  — serves dist/ with custom nginx.conf
#
#  nginx.conf responsibilities:
#    • SPA fallback (try_files) so React routes don't 404 on reload
#    • Reverse proxy /api/* → http://deployverse-backend:5000 (K8s ClusterIP)
#    • Gzip, security headers, static asset caching
# ==============================================================================

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy source — .env.production is included so Vite bakes VITE_API_URL=""
# (empty string means relative paths → nginx proxy handles /api routing)
COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine

# Remove the default nginx config and replace with ours
RUN rm /etc/nginx/conf.d/default.conf

# Copy built static assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/deployverse.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
