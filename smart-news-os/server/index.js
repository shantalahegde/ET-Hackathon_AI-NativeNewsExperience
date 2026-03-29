// Smart News OS - Main Server Entry Point
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const chatRoutes = require('./routes/chat');
const videoRoutes = require('./routes/video');
const translateRoutes = require('./routes/translate');

app.use('/auth', authRoutes);
app.use('/news', newsRoutes);
app.use('/chat', chatRoutes);
app.use('/video', videoRoutes);
app.use('/translate', translateRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Smart News OS API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      database: !!process.env.DB_HOST,
      openai: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key'),
      newsapi: !!(process.env.NEWS_API_KEY && process.env.NEWS_API_KEY !== 'your_newsapi_key_from_newsapi_org')
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║         🚀 Smart News OS Server             ║
║──────────────────────────────────────────────║
║  Running on: http://localhost:${PORT}          ║
║  Environment: ${process.env.NODE_ENV || 'development'}               ║
║──────────────────────────────────────────────║
║  API:     ${process.env.NEWS_API_KEY ? '✅ NewsAPI Connected' : '⚠️  NewsAPI: Sample Data'}         ║
║  AI:      ${process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key' ? '✅ OpenAI Connected' : '⚠️  OpenAI: Mock Mode'}          ║
║  DB:      Checking MySQL...                  ║
╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
