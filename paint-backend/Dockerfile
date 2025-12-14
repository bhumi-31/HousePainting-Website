# ============================================
# DOCKERFILE FOR BACKEND (Node.js + Express)
# ============================================
# Think of this as a "recipe" to build a container
# Each line is a step in building your app's environment

# Step 1: Start with a base image (Node.js v18)
# Like choosing a pre-configured computer with Node.js installed
FROM node:18-alpine

# Step 2: Set working directory inside the container
# This is like "cd /app" - all commands run from here
WORKDIR /app

# Step 3: Copy package files first (for better caching)
# Docker caches each step, so we copy package.json first
# If dependencies don't change, Docker uses cached node_modules
COPY package*.json ./

# Step 4: Install dependencies
# Same as running "npm install" on your machine
RUN npm install

# Step 5: Copy the rest of the application code
# Now we copy all our source files
COPY . .

# Step 6: Expose the port the app runs on
# This tells Docker "the app listens on port 8000"
EXPOSE 8000

# Step 7: Command to start the application
# This runs when the container starts
CMD ["npm", "start"]
