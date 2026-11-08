# Production Dockerfile for Google Cloud Run
FROM node:22-slim

# Install sqlite3/build essentials if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first for optimal caching
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Build production assets
RUN npm run build

# Cloud Run defaults to listening on port 8080
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Run the production server binding to 0.0.0.0 and PORT
CMD ["npm", "start"]
