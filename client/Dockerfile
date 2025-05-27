# Use official Node.js Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies (including devDependencies)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite in development mode, listening on all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
