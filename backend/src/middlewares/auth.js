/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 * Updated for plan-based subscription system
 */

import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { checkAndDowngradeExpired, hasFeatureAccess, getUserFeatures } from '../middleware/planCheck.js';

/**
 * Middleware to verify JWT token
 * Attaches user object to req.user if valid
 * Auto-downgrades expired subscriptions
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data from database
    let user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        paymentVerified: true,
        paidAt: true,
        expiresAt: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    // Auto-downgrade if subscription expired
    user = await checkAndDowngradeExpired(user);
    
    // Attach features to user object
    user.features = getUserFeatures(user);

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for public routes that show more data to logged-in users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        paymentVerified: true,
        expiresAt: true
      }
    });

    if (user) {
      user = await checkAndDowngradeExpired(user);
      user.features = getUserFeatures(user);
    }

    req.user = user;
    next();
  } catch {
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if user has paid subscription (BASIC_PLUS or higher)
 */
export const requirePaid = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  
  // Admin always has access
  if (req.user.role === 'ADMIN') {
    return next();
  }
  
  // Check if user has any paid plan and is verified
  const hasPaidAccess = req.user.paymentVerified && 
    req.user.plan !== 'BASIC' &&
    req.user.expiresAt && 
    new Date() < new Date(req.user.expiresAt);
  
  if (!hasPaidAccess) {
    return res.status(403).json({ 
      error: 'Paid subscription required.',
      code: 'PAYMENT_REQUIRED',
      currentPlan: req.user.plan,
      upgrade: true
    });
  }
  
  next();
};

/**
 * Middleware to require AI plan (₹29+)
 */
export const requireAIPlan = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  
  // Admin always has access
  if (req.user.role === 'ADMIN') {
    return next();
  }
  
  const hasAIAccess = req.user.paymentVerified && 
    ['AI', 'PRO_PLUS'].includes(req.user.plan) &&
    req.user.expiresAt && 
    new Date() < new Date(req.user.expiresAt);
  
  if (!hasAIAccess) {
    return res.status(403).json({ 
      error: 'AI Job Match plan required (₹29/month)',
      code: 'AI_PLAN_REQUIRED',
      currentPlan: req.user.plan,
      requiredPlan: 'AI or PRO_PLUS',
      upgrade: true
    });
  }
  
  next();
};

/**
 * Admin middleware - check role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Admin access required.',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};
