# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Backend & Runtime
FROM node:22-alpine
WORKDIR /app
# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Install backend deps
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production

# Copy backend code
COPY server/ ./

# Copy built frontend
COPY --from=frontend-builder /app/client/dist ../client/dist

# Environment variables
ENV PORT=3001
ENV NODE_ENV=production
ENV DATA_DIR=/app/data

# Create data directory
RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "server.js"]
