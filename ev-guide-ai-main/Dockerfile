# ── Build Stage ──────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Install frontend dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy frontend source and build
COPY index.html vite.config.ts tailwind.config.ts postcss.config.js tsconfig*.json components.json ./
COPY src/ src/
COPY public/ public/

# Build with production API path (relative /api)
ENV VITE_API_BASE_URL=/api
RUN npm run build

# ── Production Stage ─────────────────────────────────────────
FROM node:18-alpine AS production

WORKDIR /app

# Install backend dependencies only
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY server/ ./

# Copy built frontend from builder
COPY --from=builder /app/dist ./public

# Cloud Run provides PORT env variable
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "index.js"]
