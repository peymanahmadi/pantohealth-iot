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

# Copy consumer app
COPY apps/consumer ./apps/consumer

# Install dependencies
RUN npm install

# Build the consumer app
RUN npm run build consumer

# Expose port (matches CONSUMER_PORT=3000)
EXPOSE 3000

# Start the consumer app
CMD ["npm", "run", "start:consumer"]