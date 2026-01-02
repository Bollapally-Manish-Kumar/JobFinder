/**
 * Plan Check Middleware
 * - Auto-downgrades expired subscriptions
 * - Provides feature access guards
 */

import { prisma } from '../utils/prisma.js';

// Plan hierarchy for access checking
const PLAN_HIERARCHY = {
  BASIC: 0,
  BASIC_PLUS: 1,
  AI: 2,
  PRO_PLUS: 3
};

// Feature to minimum plan mapping
const FEATURE_ACCESS = {
  viewAllJobs: 'BASIC_PLUS',    // ₹10+
  resumeBuilder: 'BASIC_PLUS',  // ₹10+
  aiJobMatch: 'AI',             // ₹20+
  atsScore: 'PRO_PLUS',         // ₹30 only
  skillGap: 'PRO_PLUS'          // ₹30 only
};

/**
 * Check if subscription is expired and auto-downgrade
 */
export const checkAndDowngradeExpired = async (user) => {
  if (!user.expiresAt) return user;
  
  const now = new Date();
  const expiresAt = new Date(user.expiresAt);
  
  if (now > expiresAt) {
    // Subscription expired - downgrade to BASIC
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: 'BASIC',
        paymentVerified: false,
        expiresAt: null,
        paidAt: null
      }
    });
    console.log(`[Plan] Auto-downgraded user ${user.email} (expired)`);
    return updatedUser;
  }
  
  return user;
};

/**
 * Middleware: Check plan expiry on every authenticated request
 */
export const planCheckMiddleware = async (req, res, next) => {
  try {
    if (req.user && req.user.expiresAt) {
      req.user = await checkAndDowngradeExpired(req.user);
    }
    next();
  } catch (error) {
    console.error('[PlanCheck] Error:', error.message);
    next(); // Continue even if check fails
  }
};

/**
 * Check if user has access to a feature
 */
export const hasFeatureAccess = (user, feature) => {
  const requiredPlan = FEATURE_ACCESS[feature];
  if (!requiredPlan) return true; // Unknown feature = allow
  
  const userPlanLevel = PLAN_HIERARCHY[user.plan] || 0;
  const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0;
  
  return userPlanLevel >= requiredLevel;
};

/**
 * Middleware factory: Require specific plan level
 */
export const requirePlan = (minimumPlan) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Admin always has full access
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    // Check and update expiry first
    req.user = await checkAndDowngradeExpired(req.user);
    
    // Must be payment verified
    if (!req.user.paymentVerified) {
      return res.status(403).json({
        error: 'Payment verification required',
        message: 'Your payment has not been verified yet',
        currentPlan: req.user.plan,
        requiredPlan: minimumPlan,
        upgrade: true
      });
    }
    
    const userLevel = PLAN_HIERARCHY[req.user.plan] || 0;
    const requiredLevel = PLAN_HIERARCHY[minimumPlan] || 0;
    
    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Upgrade required',
        message: `This feature requires ${minimumPlan} plan or higher`,
        currentPlan: req.user.plan,
        requiredPlan: minimumPlan,
        upgrade: true
      });
    }
    
    next();
  };
};

/**
 * Middleware: Require BASIC_PLUS or higher (₹10+)
 */
export const requireBasicPlus = requirePlan('BASIC_PLUS');

/**
 * Middleware: Require AI plan or higher (₹20+)
 */
export const requireAI = requirePlan('AI');

/**
 * Middleware: Require PRO_PLUS plan (₹30)
 */
export const requireProPlus = requirePlan('PRO_PLUS');

/**
 * Get user's accessible features
 */
export const getUserFeatures = (user) => {
  // Admin has all features
  const isAdmin = user.role === 'ADMIN';
  
  return {
    viewAllJobs: isAdmin || hasFeatureAccess(user, 'viewAllJobs'),
    resumeBuilder: isAdmin || hasFeatureAccess(user, 'resumeBuilder'),
    aiJobMatch: isAdmin || hasFeatureAccess(user, 'aiJobMatch'),
    atsScore: isAdmin || hasFeatureAccess(user, 'atsScore'),
    skillGap: isAdmin || hasFeatureAccess(user, 'skillGap'),
    plan: user.plan,
    isAdmin,
    expiresAt: user.expiresAt,
    daysRemaining: user.expiresAt 
      ? Math.max(0, Math.ceil((new Date(user.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)))
      : isAdmin ? 999 : null
  };
};

export default {
  planCheckMiddleware,
  requirePlan,
  requireBasicPlus,
  requireAI,
  requireProPlus,
  hasFeatureAccess,
  getUserFeatures,
  checkAndDowngradeExpired
};
