/**
 * Payment Controller - Plan-Based Subscription System
 * 
 * Plans:
 * - BASIC: ₹0 (Free) - View 1 job only
 * - BASIC_PLUS: ₹10 - All jobs + resume builder  
 * - AI: ₹20 - Everything + AI Job Match
 * - PRO_PLUS: ₹30 - Everything + ATS Score + Skill Gap
 * 
 * IMPORTANT: NO AUTO-UNLOCK
 * All payments require admin approval before access is granted
 */

import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { getUserFeatures } from '../middleware/planCheck.js';

// Plan configurations
const PLANS = {
  BASIC_PLUS: {
    amount: 10,
    days: 30,
    name: 'Basic Plus',
    features: ['All jobs', 'Resume builder', 'Save jobs']
  },
  AI: {
    amount: 20,
    days: 30,
    name: 'AI Job Match',
    features: ['All Basic Plus features', 'AI job matching', 'Personalized recommendations']
  },
  PRO_PLUS: {
    amount: 30,
    days: 30,
    name: 'Pro Plus',
    features: ['All AI features', 'ATS score analysis', 'Skill gap insights']
  }
};

// UPI Details from environment variables
const UPI_DETAILS = {
  upiId: process.env.UPI_ID || 'jobfinderplus@upi',
  name: process.env.UPI_NAME || 'JobFinder Plus',
  qrCodeUrl: '/upi-qr.png'
};

/**
 * Get UPI payment details and plans
 * GET /api/payments/upi-details
 */
export const getUpiDetails = asyncHandler(async (req, res) => {
  res.json({
    upiId: UPI_DETAILS.upiId,
    name: UPI_DETAILS.name,
    qrCodeUrl: UPI_DETAILS.qrCodeUrl,
    plans: PLANS
  });
});

/**
 * Validate UTR format - Must be exactly 12 digits
 */
const isValidUTR = (utr) => {
  return /^\d{12}$/.test(utr);
};

/**
 * Submit UTR for verification (PENDING status only)
 * POST /api/payments/submit-utr
 * 
 * ⚠️ IMPORTANT: This does NOT unlock any features
 * Admin must manually approve before access is granted
 */
export const submitUTR = asyncHandler(async (req, res) => {
  const { utr, plan, amount } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!utr || !plan) {
    return res.status(400).json({
      error: 'UTR and plan are required'
    });
  }

  // Convert plan to uppercase enum value
  const planKey = plan.toUpperCase().replace('-', '_');
  
  // Validate plan
  if (!PLANS[planKey]) {
    return res.status(400).json({
      error: 'Invalid plan. Choose BASIC_PLUS, AI, or PRO_PLUS',
      validPlans: Object.keys(PLANS)
    });
  }

  // Normalize UTR (remove spaces)
  const normalizedUTR = utr.trim().replace(/\s/g, '');

  // RULE 1: UTR FORMAT VALIDATION
  if (!isValidUTR(normalizedUTR)) {
    return res.status(400).json({
      error: 'Invalid UTR format. UTR must be exactly 12 digits.',
      code: 'INVALID_UTR_FORMAT'
    });
  }

  // RULE 2: DUPLICATE UTR CHECK
  const existingPayment = await prisma.payment.findUnique({
    where: { utr: normalizedUTR }
  });

  if (existingPayment) {
    return res.status(400).json({
      error: 'This UTR has already been used.',
      code: 'DUPLICATE_UTR'
    });
  }

  // RULE 3: RATE LIMITING - 1 pending per 5 minutes
  const recentPayment = await prisma.payment.findFirst({
    where: {
      userId,
      status: 'pending',
      createdAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000)
      }
    }
  });

  if (recentPayment) {
    return res.status(429).json({
      error: 'You have a pending payment. Please wait for admin verification.',
      code: 'PENDING_PAYMENT_EXISTS'
    });
  }

  // RULE 4: CREATE PAYMENT AS PENDING
  // ⚠️ NO ACCESS UNLOCKED - Must wait for admin approval
  const expectedAmount = PLANS[planKey].amount;
  
  const payment = await prisma.payment.create({
    data: {
      userId,
      utr: normalizedUTR,
      amount: expectedAmount,
      plan: planKey,
      status: 'pending',
      method: 'upi'
    }
  });

  res.json({
    success: true,
    message: 'Payment submitted! Access will be activated after admin verification (within 1 hour).',
    payment: {
      id: payment.id,
      status: 'pending',
      plan: PLANS[planKey].name,
      amount: expectedAmount,
      utr: normalizedUTR
    },
    // Clear message that no access is granted yet
    accessGranted: false,
    note: 'Your payment is pending verification. No features have been unlocked yet.'
  });
});

/**
 * Get current subscription status
 * GET /api/payments/status
 */
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      plan: true,
      paymentVerified: true,
      paidAt: true,
      expiresAt: true
    }
  });

  const features = getUserFeatures(user);
  
  res.json({
    subscription: {
      plan: user.plan,
      planName: PLANS[user.plan]?.name || 'Free',
      isActive: user.paymentVerified && user.expiresAt && new Date() < new Date(user.expiresAt),
      paymentVerified: user.paymentVerified,
      paidAt: user.paidAt,
      expiresAt: user.expiresAt,
      daysRemaining: features.daysRemaining
    },
    features
  });
});

/**
 * Get payment history
 * GET /api/payments/history
 */
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  res.json({
    payments: payments.map(p => ({
      id: p.id,
      utr: p.utr,
      amount: p.amount,
      plan: p.plan,
      planName: PLANS[p.plan]?.name || p.plan,
      status: p.status,
      method: p.method,
      rejectionReason: p.rejectionReason,
      createdAt: p.createdAt,
      verifiedAt: p.verifiedAt
    }))
  });
});

/**
 * Check if user has AI Job Match access
 * GET /api/payments/ai-access
 */
export const checkAiAccess = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { plan: true, paymentVerified: true, expiresAt: true }
  });

  // AI access requires AI or PRO_PLUS plan with verified payment
  const hasAccess = 
    user.paymentVerified && 
    user.expiresAt && 
    new Date() < new Date(user.expiresAt) &&
    ['AI', 'PRO_PLUS'].includes(user.plan);

  res.json({ 
    hasAccess,
    plan: user.plan,
    requiredPlan: 'AI or PRO_PLUS'
  });
});

/**
 * Get payment by ID
 * GET /api/payments/status/:paymentId
 */
export const getPaymentById = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.id;

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId }
  });

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  res.json({
    payment: {
      id: payment.id,
      utr: payment.utr,
      amount: payment.amount,
      plan: payment.plan,
      planName: PLANS[payment.plan]?.name || payment.plan,
      status: payment.status,
      rejectionReason: payment.rejectionReason,
      createdAt: payment.createdAt,
      verifiedAt: payment.verifiedAt
    }
  });
});

// =====================
// ADMIN FUNCTIONS
// =====================

/**
 * Admin: Get pending payments
 * GET /api/payments/admin/pending
 */
export const getPendingPayments = asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { status: 'pending' },
    include: {
      user: {
        select: { email: true, name: true, plan: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  res.json({ 
    payments: payments.map(p => ({
      ...p,
      planName: PLANS[p.plan]?.name || p.plan,
      expectedAmount: PLANS[p.plan]?.amount
    }))
  });
});

/**
 * Admin: Get all payments
 * GET /api/payments/admin/all
 */
export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    include: {
      user: {
        select: { email: true, name: true, plan: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  res.json({ 
    payments: payments.map(p => ({
      ...p,
      planName: PLANS[p.plan]?.name || p.plan
    }))
  });
});

/**
 * Admin: Approve payment
 * POST /api/payments/admin/approve/:paymentId
 * 
 * This is where access is ACTUALLY granted:
 * - Sets user.plan to the purchased plan
 * - Sets paymentVerified = true
 * - Sets paidAt = now
 * - Sets expiresAt = now + 30 days
 */
export const approvePayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const adminId = req.user.id;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: { select: { email: true } } }
  });

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  if (payment.status !== 'pending') {
    return res.status(400).json({ error: 'Payment is not pending' });
  }

  // Calculate expiry date
  const paidAt = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (PLANS[payment.plan]?.days || 30));

  // Update payment status
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'verified',
      verifiedAt: paidAt,
      verifiedBy: adminId
    }
  });

  // ✅ NOW unlock access for user
  await prisma.user.update({
    where: { id: payment.userId },
    data: {
      plan: payment.plan,
      paymentVerified: true,
      paidAt: paidAt,
      expiresAt: expiresAt
    }
  });

  console.log(`[Admin] Payment approved: ${payment.user.email} -> ${payment.plan} (expires: ${expiresAt.toISOString()})`);

  res.json({ 
    success: true, 
    message: `Payment approved! User upgraded to ${PLANS[payment.plan]?.name || payment.plan}`,
    userEmail: payment.user.email,
    plan: payment.plan,
    expiresAt
  });
});

/**
 * Admin: Reject payment
 * POST /api/payments/admin/reject/:paymentId
 */
export const rejectPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { reason } = req.body;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: { select: { email: true } } }
  });

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'rejected',
      rejectionReason: reason || 'Payment could not be verified'
    }
  });

  console.log(`[Admin] Payment rejected: ${payment.user.email} - ${reason || 'No reason provided'}`);

  res.json({ 
    success: true, 
    message: 'Payment rejected',
    reason: reason || 'Payment could not be verified'
  });
});

/**
 * Generate UPI deep link
 */
export const generateUpiLink = (upiId, name, amount, note) => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: amount.toString(),
    cu: 'INR',
    tn: note
  });
  return `upi://pay?${params.toString()}`;
};
