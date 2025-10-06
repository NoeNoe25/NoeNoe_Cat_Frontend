# FROM node:18-alpine

# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .

# EXPOSE 3000
# CMD ["npm", "start"]

FROM node:18-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app source
COPY . .

# Build React app
RUN npm run build

# Optional: expose port if you'll use it later
EXPOSE 3000

# Default command (can be overridden)
CMD ["npm", "start"]
