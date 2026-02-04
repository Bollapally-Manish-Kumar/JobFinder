/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

/**
 * Generate JWT token for user
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null
    },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      paymentVerified: true,
      createdAt: true
    }
  });

  // Generate token
  const token = generateToken(user.id);

  res.status(201).json({
    message: 'Registration successful',
    user,
    token
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  console.log('[Login] Attempting login for:', email);
  // Note: Never log actual passwords in production

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  console.log('[Login] User found:', user ? 'Yes' : 'No');

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Check if user registered with Google (no password set)
  if (!user.password) {
    return res.status(401).json({ 
      error: 'This account uses Google Sign-In. Please login with Google.',
      authProvider: 'google'
    });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  console.log('[Login] Password match:', isMatch);

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Check if subscription expired - auto downgrade to BASIC
  if (user.paymentVerified && user.expiresAt && new Date() > user.expiresAt) {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: 'BASIC', paymentVerified: false }
    });
    user.plan = 'BASIC';
    user.paymentVerified = false;
  }

  // Generate token
  const token = generateToken(user.id);

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      paymentVerified: user.paymentVerified,
      createdAt: user.createdAt
    },
    token
  });
});

/**
 * Get current user profile
 * GET /api/auth/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      paymentVerified: true,
      paidAt: true,
      expiresAt: true,
      createdAt: true,
      // AxonApply profile fields
      phone: true,
      city: true,
      country: true,
      linkedin: true,
      portfolio: true,
      experienceYears: true,
      currentCompany: true,
      currentTitle: true,
      _count: {
        select: {
          savedJobs: true
        }
      }
    }
  });

  res.json({ user });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      paymentVerified: true,
      createdAt: true
    }
  });

  res.json({
    message: 'Profile updated',
    user
  });
});
