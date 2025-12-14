# ============================================
# DOCKERFILE FOR FRONTEND (React + Vite)
# ============================================
# This is a "multi-stage" build - more efficient!
# Stage 1: Build the app, Stage 2: Serve it

# -------- STAGE 1: BUILD --------
# Use Node.js to build the React app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the production version
# This creates optimized files in /app/dist folder
RUN npm run build

# -------- STAGE 2: SERVE --------
# Use Nginx (a fast web server) to serve the built files
# This makes the final image much smaller!
FROM nginx:alpine

# Copy the built files from Stage 1 to Nginx's web folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (standard web port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
