# 🏠 Chandan House Painting

![Docker](https://img.shields.io/badge/docker-ready-blue?logo=docker)
![Node.js](https://img.shields.io/badge/node-%3E=18-green?logo=node.js)
![React](https://img.shields.io/badge/react-18-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/mongodb-atlas-brightgreen?logo=mongodb)
![AWS](https://img.shields.io/badge/AWS-EC2-orange?logo=amazon-aws)

A full-stack web application for a professional house painting business serving Ontario, Canada. Features customer-facing website, quote calculator, AI room visualizer, and admin dashboard.

🌐 **Live Site**: [http://15.206.178.240](http://15.206.178.240)

---

## 🖼️ Screenshots

> _Add your own screenshots below!_

![Home Page Demo](./screenshots/homepage.png)
![Admin Dashboard Demo](./screenshots/admin-dashboard.png)

---

## ✨ Features

### Customer Features
- 🎨 Browse painting services (Interior, Exterior, Deck & Fence, Commercial)
- 💰 Instant quote calculator with price estimates
- 📸 Project portfolio gallery
- ⭐ Customer reviews and ratings
- 🤖 AI Room Visualizer (powered by HuggingFace)
- 📧 Contact form with email notifications
- 🔐 User authentication (Email + Google Sign-In)
- 🔑 Password reset & change password functionality

### Admin Features
- 📊 Dashboard with analytics
- 🛠️ Manage services, projects, quotes
- 📝 Review management (approve/reject)
- 💵 Quote pricing & discount management
- 📧 Automated email notifications

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Shadcn UI |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT, Google OAuth 2.0 |
| Images | Cloudinary |
| AI | HuggingFace API |
| Email | Nodemailer (Gmail SMTP) |
| Deployment | Docker, AWS EC2 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Docker & Docker Compose
- MongoDB Atlas account
- Cloudinary account
- Google OAuth credentials (optional)

### Local Development

```bash
# Clone the repository
git clone https://github.com/bhumi-31/HousePainting-Website.git
cd HousePainting-Website

# Install dependencies
cd paint-backend && npm install
cd ../paint-frontend && npm install

# Create environment files (see below)

# Run backend
cd paint-backend && npm run dev

# Run frontend (new terminal)
cd paint-frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

### Docker Deployment

```bash
# Build and run with Docker
docker-compose up --build -d

# View logs
docker-compose logs -f
```

---

## ⚙️ Environment Variables

### Backend (`paint-backend/.env`)

```env
NODE_ENV=production
PORT=8000

# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Your Name <your-email@gmail.com>

# Frontend URL (for email links)
FRONTEND_URL=http://your-domain.com

# HuggingFace (for AI features)
HUGGINGFACE_API_KEY=your-huggingface-api-key
```

### Frontend (`paint-frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 📁 Project Structure

```
HousePainting-Website/
├── paint-backend/           # Express.js API
│   ├── src/
│   │   ├── config/          # Database, email config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, upload middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Email service
│   │   └── server.js        # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── paint-frontend/          # React + Vite
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── context/         # Auth context
│   │   ├── lib/             # API helpers
│   │   ├── pages/           # Page components
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml       # Container orchestration
└── README.md
```

---

## 🌐 AWS EC2 Deployment

1. Launch EC2 instance (Ubuntu 24.04, t3.micro)
2. Configure Security Group (ports 22, 80, 443, 8000)
3. Install Docker: `sudo apt install docker.io docker-compose`
4. Clone repo and configure `.env` files
5. Run: `docker-compose up --build -d`

See [DOCKER_README.md](./DOCKER_README.md) for detailed instructions.

---

##  Admin Access

1. Register a user account
2. In MongoDB, update the user's role to `admin`:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```
3. Access admin dashboard at `/admin`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Add frontend URL to backend CORS origins in `server.js` |
| MongoDB connection fails | Check `MONGO_URI` and MongoDB Atlas IP whitelist |
| Email not sending | Verify Gmail app password (not regular password) |
| Docker build fails | Clear cache: `docker-compose build --no-cache` |
| Google Sign-In fails | Requires domain (not IP address) |

---

## 📄 License

MIT License - feel free to use for your own business!

---

**Made with ❤️ by Bhumika Narula**