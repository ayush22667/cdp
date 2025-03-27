FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the port React dev server runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
