# Paint Frontend

Professional house painting services website built with React and Vite.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🔐 User authentication (Login, Register, Password Reset)
- 🔑 Google OAuth integration
- 📝 Quote request system
- 📧 Contact form
- ⭐ Customer reviews
- 🖼️ Project portfolio
- 👨‍💼 Admin dashboard

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **React Query** - Data fetching

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will run on `http://localhost:5173`

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── assets/          # Images and static files
├── components/      # Reusable UI components
│   ├── home/        # Home page sections
│   ├── layout/      # Layout components
│   └── ui/          # UI primitives
├── context/         # React context providers
├── lib/             # Utilities and API
└── pages/           # Page components
    └── admin/       # Admin dashboard pages
```

## License

MIT
