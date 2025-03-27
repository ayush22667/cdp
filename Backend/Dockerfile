# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose backend port
EXPOSE 4000

# Start the backend
CMD ["npm", "run", "dev"]
