# Use Node.js 18 as the base image
FROM node:alpine

# Set working directory
WORKDIR /usr/src/app

# Copy root package.json and package-lock.json (if exists)
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig.json ./

# Copy shared libraries
COPY libs ./libs

# Copy producer app
COPY apps/producer ./apps/producer

# Install dependencies
RUN npm install

# Build the producer app
RUN npm run build producer

# Expose port (matches PRODUCER_PORT=4001)
EXPOSE 3001

# Start the producer app
CMD ["npm", "run", "start:producer"]