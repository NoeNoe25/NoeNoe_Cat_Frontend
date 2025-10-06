# ===== Multi-stage Build =====
# Build stage
FROM node:18-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Runtime stage
FROM node:18-alpine

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["npm", "start"]