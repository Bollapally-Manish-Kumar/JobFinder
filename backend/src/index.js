/**
 * JobFinder+ Backend Entry Point
 * Express server with all routes and middleware
 */

// ⚠️ CRITICAL: Catch all errors FIRST
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ UNHANDLED PROMISE REJECTION:', reason);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables (from .env file in local dev, from system in production)
dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config(); // Also check default .env location

console.log('✅ Environment loaded');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : '❌ MISSING');
console.log('   GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'SET' : '❌ MISSING');

// Import Passport and initialize Google OAuth
import passport, { initializePassport } from './config/passport.js';

// Import routes (static imports)
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import paymentRoutes from './routes/payments.js';
import resumeRoutes from './routes/resume.js';
import applicationRoutes from './routes/applicationRoutes.js';
import aiMatchRoutes from './routes/aiMatchRoutes.js';

// Import middleware
import { errorHandler } from './middlewares/errorHandler.js';

// Import cron jobs
import initializeCronJobs from './utils/cronJobs.js';

console.log('✅ All routes imported');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://job-finder-two-kappa.vercel.app"
  ],
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport for Google OAuth
app.use(passport.initialize());
initializePassport();

// Rate limiting - 200 requests per 15 minutes (more generous for testing)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: { error: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth/', authLimiter);

// More lenient rate limit for payment routes
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30, // Increased for admin bulk operations
  message: { error: 'Too many payment requests, please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/payments/', paymentLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai-match', aiMatchRoutes);

console.log('✅ All routes mounted');

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Start server and keep it alive
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 JobFinder+ API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ Server is listening and ready!');
  console.log('');
  console.log('📋 Available routes:');
  console.log('   GET  /api/health');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/jobs');
  console.log('   POST /api/payments/submit-utr');
  console.log('   GET  /api/payments/upi-details');
  console.log('   POST /api/resume/generate');
  
  // Start cron jobs after server is ready
  initializeCronJobs();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Kill the process or use a different port.`);
  } else {
    console.error('❌ Server Error:', err);
  }
});

export default app;
