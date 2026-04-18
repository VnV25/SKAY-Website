require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { supabase } = require('./lib/supabase');

// Routes
const authRoutes = require('./routes/auth-supabase');
const productRoutes = require('./routes/products');
const serviceRoutes = require('./routes/services');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');

const app = express();

// ─────────────────────────────────────────
// ✅ CORS CONFIG (FIXED)
// ─────────────────────────────────────────
const allowedOrigins = [
  "https://skay-website-6yb6-9k0a2ko3d-vnv25s-projects.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / server calls

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error("❌ CORS blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// ✅ Handle preflight requests
app.options('*', cors());

// ─────────────────────────────────────────
// ✅ BODY PARSING
// ─────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────
// 📁 Static Files
// ─────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─────────────────────────────────────────
// 🚀 API ROUTES
// ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// ─────────────────────────────────────────
// ❤️ HEALTH CHECK
// ─────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    let dbStatus = 'connected';
    let missingTables = [];

    if (error) {
      dbStatus = 'disconnected';
      if (error.message?.includes('schema cache')) {
        missingTables.push('contacts');
      }
    }

    if (dbStatus === 'connected') {
      const { error: contactError } = await supabase
        .from('contacts')
        .select('id')
        .limit(1);

      if (contactError?.message?.includes('schema cache')) {
        missingTables.push('contacts');
      }
    }

    res.json({
      status: 'OK',
      message: 'SKAY backend running',
      database: dbStatus,
      missingTables: missingTables.length ? missingTables : null,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: err.message
    });
  }
});

// ─────────────────────────────────────────
// 🌐 FRONTEND SERVE (Optional)
// ─────────────────────────────────────────
const frontendDir = path.join(__dirname, '..', 'frontend');
const frontendDistPath = path.join(frontendDir, 'dist');
const frontendPath = fs.existsSync(frontendDistPath) ? frontendDistPath : frontendDir;

app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// ─────────────────────────────────────────
// ❌ GLOBAL ERROR HANDLER
// ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

// ─────────────────────────────────────────
// 🔌 SUPABASE CHECK
// ─────────────────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ Missing Supabase credentials');
} else {
  console.log('✅ Supabase configured');
}

// ─────────────────────────────────────────
// 🚀 START SERVER
// ─────────────────────────────────────────
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health: /api/health`);
});

// Handle port errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} already in use`);
    process.exit(1);
  }
  throw err;
});

module.exports = app;