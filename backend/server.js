const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
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

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', quoteRoutes);
app.use('/api', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'SKAY Backend API',
    version: '2.0.0',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    time: new Date(),
  });
});

app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  res.status(500).json({ message: err.message || 'Server Error' });
});

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

console.log('STRIPE SECRET KEY:', process.env.STRIPE_SECRET_KEY ? 'LOADED' : 'MISSING');

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
