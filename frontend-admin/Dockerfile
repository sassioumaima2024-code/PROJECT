# Build stage
FROM node:20 AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the application with webpack (disable Turbopack to avoid LightningCSS issues)
RUN npm run build -- --webpack

# Production stage
FROM node:20 AS runner

WORKDIR /app

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs -u 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Change ownership
USER nextjs

# Expose port
EXPOSE 3000

ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
