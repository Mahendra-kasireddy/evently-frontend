# ---------- build stage ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_* build args are baked into the bundle at build time. Override the
# production API URL via --build-arg if it isn't already in .env.
ARG VITE_API_BASE_URL_PRODUCTION
RUN npm run build:prod

# ---------- runtime stage ----------
FROM nginx:1.27-alpine AS runner
# SPA-aware config: history fallback, gzip, long-cache hashed assets.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]
