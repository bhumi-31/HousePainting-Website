# 🐳 Docker Setup Guide

## What is Docker?

Docker is like a "shipping container" for your app. It packages your code + all dependencies into a single container that runs the same everywhere!

**Without Docker:**
- Install Node.js, MongoDB, configure everything... takes 30+ minutes

**With Docker:**
- Run one command, everything works! Takes 2 minutes

---

## 📁 Files Created

```
House Painting/
├── docker-compose.yml           # Orchestrates all containers
├── paint-backend/
│   ├── Dockerfile               # Recipe to build backend container
│   └── .dockerignore            # Files to ignore when building
├── paint-frontend/
│   ├── Dockerfile               # Recipe to build frontend container
│   ├── nginx.conf               # Web server configuration
│   └── .dockerignore            # Files to ignore when building
```

---

## 🚀 How to Run

### Prerequisites
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/

### Start Everything
```bash
# Navigate to project folder
cd "House Painting"

# Build and start all containers
docker-compose up --build

# Or run in background (detached mode)
docker-compose up --build -d
```

### Access Your App
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### Stop Everything
```bash
# Stop all containers
docker-compose down

# Stop and remove all data (including database)
docker-compose down -v
```

---

## 🔧 Useful Commands

```bash
# View running containers
docker ps

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend

# Rebuild a specific service
docker-compose build backend

# Open shell inside container
docker exec -it paint-backend sh
docker exec -it paint-frontend sh

# Remove all unused Docker data
docker system prune -a
```

---

## ⚙️ Environment Variables

Update these in `docker-compose.yml` before deploying:

```yaml
environment:
  JWT_SECRET: change-this-to-something-secure
  CLOUDINARY_CLOUD_NAME: your_cloud_name
  CLOUDINARY_API_KEY: your_api_key
  CLOUDINARY_API_SECRET: your_api_secret
  EMAIL_USER: your_email@gmail.com
  EMAIL_PASS: your_app_password
  GOOGLE_CLIENT_ID: your_google_client_id
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Docker Network                    │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Frontend   │  │   Backend    │  │  MongoDB  │ │
│  │   (Nginx)    │──│  (Node.js)   │──│ (Database)│ │
│  │   Port 80    │  │   Port 5000  │  │ Port 27017│ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
         │
         ▼
    User's Browser
```

---

## 🤔 Explaining to Others

**Simple Explanation:**
> "Docker is like a lunchbox for code. Everything the app needs is packed inside, so it runs the same on any computer."

**Technical Explanation:**
> "Docker containerizes our application into isolated environments. The frontend runs in an Nginx container, the backend in a Node.js container, and MongoDB in its own container. Docker Compose orchestrates these services, managing networking and dependencies automatically."

---

## ❓ Common Issues

### Port already in use
```bash
# Find what's using port 80
lsof -i :80

# Use different port in docker-compose.yml
ports:
  - "3000:80"  # Access at localhost:3000 instead
```

### Container won't start
```bash
# Check logs for errors
docker-compose logs backend

# Rebuild from scratch
docker-compose down
docker-compose up --build
```

### MongoDB connection issues
Make sure the MongoDB container is running:
```bash
docker ps | grep mongodb
```

---

## 🎉 You're Done!

Your app is now containerized and ready for deployment!

Next steps for production:
1. Deploy to cloud (AWS, DigitalOcean, etc.)
2. Set up SSL/HTTPS
3. Configure proper secrets management
