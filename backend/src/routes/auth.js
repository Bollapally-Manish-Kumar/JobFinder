/**
 * Authentication Routes
 * Handles user registration, login, profile, and Google OAuth
 */

import express from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Frontend URL for OAuth redirects
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// =====================
// Local Auth Routes
// =====================
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// =====================
// Google OAuth Routes
// =====================

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow - redirects user to Google login
 */
router.get('/google', (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_not_configured`);
  }
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })(req, res, next);
});

/**
 * GET /api/auth/google/callback
 * Google OAuth callback - receives auth code, exchanges for token
 * On success: redirects to frontend with JWT token
 * On failure: redirects to frontend with error
 */
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed`
  }, (err, data) => {
    // Handle authentication errors
    if (err || !data) {
      console.error('[Google OAuth] Callback error:', err);
      return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
    }

    // Extract token from passport callback
    const { token } = data;
    
    if (!token) {
      return res.redirect(`${FRONTEND_URL}/login?error=token_generation_failed`);
    }

    // Redirect to frontend with token
    console.log('[Google OAuth] Success - redirecting with token');
    res.redirect(`${FRONTEND_URL}/oauth-success?token=${token}`);
    
  })(req, res, next);
});

export default router;
