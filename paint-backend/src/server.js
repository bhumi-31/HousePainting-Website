require('dotenv').config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDatabase = require('./config/database');

dotenv.config();

connectDatabase();

const app = express();

//middlewares
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://15.206.178.240',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());

// Rate Limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

app.use('/upload', require('./routes/uploadRoutes'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));


//home route

app.get('/', (req, res) => {
  res.json({
    sucess: true,
    message: 'Painting website is live!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });

});

//health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'Server is healthy',
    uptime: Math.floor(process.uptime()) + ' seconds'
  });
});

app.use('/auth', require('./routes/authRoutes'));
app.use('/services', require('./routes/serviceRoutes'));
app.use('/portfolio', require('./routes/projectRoutes'));
// app.use('/upload', require('./routes/uploadRoutes'));
app.use('/reviews', require('./routes/reviewRoutes'));
app.use('/quotes', require('./routes/quoteRoutes'));
app.use('/contact', require('./routes/contactRoutes'));
app.use('/ai', require('./routes/aiRoutes'));

//error handling

app.use((err, req, res, next) => {
  console.error('Error: ', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log('');
  console.log('===========================================');
  console.log('SERVER STARTED SUCCESSFULLY');
  console.log('===========================================');
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log('===========================================');
  console.log('');
});