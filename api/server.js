require('dotenv').config();

const express        = require('express');
const helmet         = require('helmet');
const cors           = require('cors');
const rateLimit      = require('express-rate-limit');
const swaggerUi      = require('swagger-ui-express');
const swaggerSpec    = require('./src/config/swagger');
const { testConnection } = require('./src/config/database');
const { auditMiddleware } = require('./src/middleware/audit.middleware');
const errorHandler   = require('./src/middleware/errorHandler');
const routes         = require('./src/routes');

const app  = express();
const PORT = process.env.PORT || 5001;

// ── Security
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.set('trust proxy', 1);

// ── Rate limiting
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
}));

// ── Static uploads
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

// ── Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Audit on write operations
app.use(auditMiddleware);

// ── Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Eagle Box Cricket API Docs',
}));

// ── API routes
app.use('/api/v1', routes);

// ── 404
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` })
);

// ── Global error handler
app.use(errorHandler);

// ── Start
const start = async () => {
  await testConnection();
  const server = app.listen(PORT, () => {
    console.log(`\n🏏 Eagle Box Cricket API v2`);
    console.log(`   Server  → http://localhost:${PORT}`);
    console.log(`   Docs    → http://localhost:${PORT}/api/docs`);
    console.log(`   Health  → http://localhost:${PORT}/health\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Kill the existing process and restart.`);
    } else {
      console.error('Server error:', err.message);
    }
    process.exit(1);
  });

  const shutdown = () => {
    server.close(() => {
      console.log('\n👋 Server shut down cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT',  shutdown);
};

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
