require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const fs         = require('fs');
const path       = require('path');
const { supabase } = require('./lib/supabase');

const authRoutes    = require('./routes/auth-supabase');
const productRoutes = require('./routes/products');
const serviceRoutes = require('./routes/services');
const orderRoutes   = require('./routes/orders');
const adminRoutes   = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const cartRoutes    = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/contact',  contactRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test basic Supabase connectivity
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    let dbStatus = 'connected';
    let missingTables = [];
    
    if (error) {
      dbStatus = 'disconnected';
      if (error.message && error.message.includes('schema cache')) {
        missingTables.push('contacts');
      }
    }
    
    // Test contacts table if profiles worked
    if (dbStatus === 'connected') {
      const { error: contactError } = await supabase.from('contacts').select('id').limit(1);
      if (contactError && contactError.message && contactError.message.includes('schema cache')) {
        missingTables.push('contacts');
      }
    }
    
    res.json({
      status:   'OK',
      message:  'SKAY backend running',
      database: dbStatus,
      missingTables: missingTables.length > 0 ? missingTables : null,
      setupGuide: missingTables.length > 0 ? 'See BACKEND_DATABASE_SETUP.md' : null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: err.message,
    });
  }
});

// ── Serve frontend ────────────────────────────────────────
const frontendDir = path.join(__dirname, '..', 'frontend');
const frontendDistPath = path.join(frontendDir, 'dist');
const frontendPath = fs.existsSync(frontendDistPath) ? frontendDistPath : frontendDir;
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// ── Supabase connection check ─────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  Supabase credentials missing. Add to backend/.env:');
  console.warn('   SUPABASE_URL=your_supabase_url');
  console.warn('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
} else {
  console.log('✅ Supabase configured');
}

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`🚀 SKAY backend running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Frontend: ${fs.existsSync(frontendDistPath) ? 'served from frontend/dist' : 'served separately (open frontend/index.html)'}`);
});

// Handle port already in use error
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error('\nTo fix this:');
    console.error('1. Kill the process using port 5000:');
    console.error('   Windows: netstat -ano | findstr :5000');
    console.error('   Then: taskkill /PID <PID> /F');
    console.error('\n2. Or use a different port:');
    console.error('   set PORT=5001 && npm start');
    console.error('   (Windows PowerShell: $env:PORT = 5001; npm start)\n');
    process.exit(1);
  }
  throw err;
});

module.exports = app;