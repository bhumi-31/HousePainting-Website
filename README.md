# House Painting Web Application

![Docker](https://img.shields.io/badge/docker-ready-blue?logo=docker)
![Node.js](https://img.shields.io/badge/node-%3E=18-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/mongodb-atlas-brightgreen?logo=mongodb)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 🖼️ Screenshots

> _Add your own screenshots below!_

![Home Page Demo](./screenshots/homepage.png)
![Admin Dashboard Demo](./screenshots/admin-dashboard.png)

---

## Features
- Customer-facing website: service listings, project gallery, reviews, contact/quote forms
- Admin dashboard: manage services, projects, quotes, reviews, contacts
- Image upload (HEIC to JPG conversion, Cloudinary integration)
- Instagram & WhatsApp integration
- Responsive, modern UI (Tailwind CSS)
- Dockerized for easy deployment

---

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/) (for containerized setup)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB
- [Cloudinary](https://cloudinary.com/) account for image uploads

---

## Local Development Setup

### 1. Clone the repository
```sh
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Environment Variables
Create a `.env` file in both `paint-backend/` and (optionally) `paint-frontend/`.

**Backend example (`paint-backend/.env`):**
```
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

**Frontend example (`paint-frontend/.env`):**
```
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Install dependencies
```sh
cd paint-backend
npm install
cd ../paint-frontend
npm install
```

### 4. Run locally (without Docker)
Open two terminals:

**Backend:**
```sh
cd paint-backend
npm run dev
```

**Frontend:**
```sh
cd paint-frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### 5. Run with Docker
Ensure Docker is running, then from the project root:
```sh
docker-compose up -d --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## Admin Access
- Register a user, then set their role to `admin` in the database or use the script in `paint-backend/src/scripts/createAdmin.js`.

---

## Project Structure
```
House Painting/
├── paint-backend/    # Express.js API, MongoDB models, controllers, routes
├── paint-frontend/   # React (Vite) frontend, Tailwind CSS, admin dashboard
├── docker-compose.yml
└── README.md
```

---

## Deployment
- Deploy using Docker to any cloud provider, or use Vercel (frontend) and Render/Heroku (backend).
- Update environment variables for production.

---

## Troubleshooting
- Ensure all environment variables are set.
- Check Docker logs with `docker-compose logs` if containers fail.
- For image upload issues, verify Cloudinary credentials.

---

## License
MIT

---

**Made with ❤️ for the house painting business!**