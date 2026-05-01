const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

const { supabase, isSupabaseConfigured } = require('./lib/supabase');

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error('[Startup] Missing required environment variables:', missingEnv.join(', '));
  process.exit(1);
}

if (!isSupabaseConfigured) {
  console.error('[Startup] Supabase configuration invalid. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180',
  'http://localhost:5181',
];

const envOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));
const localhostPattern = /^http:\/\/(127\.0\.0\.1|localhost):\d+$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || localhostPattern.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Not allowed by CORS for origin ${origin}`));
    },
    credentials: true,
  })
);

app.options('*', cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  if (req.method !== 'GET') {
    console.log('Body:', req.body);
  }
  next();
});

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', quoteRoutes);
app.use('/api/inquiries', quoteRoutes);
app.use('/api', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', feedbackRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SKAY Backend API',
    data: {
      version: '2.1.0',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'OK',
    data: {
      time: new Date(),
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'OK',
    data: {
      time: new Date(),
      services: {
        supabaseConfigured: isSupabaseConfigured,
        stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
      },
    },
  });
});

app.get('/api/test-db', async (req, res) => {
  if (!isSupabaseConfigured || !supabase) {
    console.error('[Test DB] Supabase not configured');
    return res.status(500).json({
      success: false,
      message: 'Supabase is not configured',
      error: { code: 'SUPABASE_NOT_CONFIGURED' },
    });
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('id')
      .limit(1);

    console.log('[Test DB] result', { data, error });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Supabase test query failed',
        error,
      });
    }

    return res.json({
      success: true,
      message: 'Supabase connection test passed',
      data,
    });
  } catch (err) {
    console.error('[Test DB] unexpected error', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Unexpected error during Supabase test',
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    });
  }
});

app.use((err, req, res, next) => {
  console.error('[Unhandled Route Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Server error',
    error: process.env.NODE_ENV === 'production' ? undefined : {
      name: err.name,
      message: err.message,
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

const server = app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('SKAY BACKEND STARTUP');
  console.log('========================================');
  console.log('SERVICE STATUS:');
  console.log(`  Stripe: ${process.env.STRIPE_SECRET_KEY ? '✓ LOADED' : '✗ MISSING'}`);
  console.log(`  Supabase: ${isSupabaseConfigured ? '✓ READY' : '✗ NOT CONFIGURED'}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================\n');
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log('✓ Endpoints ready:');
  console.log('  - GET  /api/health');
  console.log('  - GET  /api/test-db');
  console.log('  - POST /api/feedback');
  console.log('  - POST /api/auth/...');
  console.log('  - POST /api/orders');
  console.log('  - POST /api/admin/...');
  console.log('');
});

server.on('error', (err) => {
  console.error('[Server] failed to start', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server] Port ${PORT} is already in use`);
  }
  process.exit(1);
});
