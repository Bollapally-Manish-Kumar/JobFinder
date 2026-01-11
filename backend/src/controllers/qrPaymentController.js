/**
 * QR Payment Controller - QR Code-Based Payment System
 * 
 * Plans:
 * - BASIC_PLUS: ₹10 - All jobs + resume builder
 * - AI: ₹20 - Everything + AI Job Match
 * - PRO_PLUS: ₹30 - Everything + ATS Score + Skill Gap
 * 
 * Flow:
 * 1. User sees admin's QR code
 * 2. User pays via UPI
 * 3. User submits UTR
 * 4. Admin approves/rejects
 * 5. Plan unlocked on approval
 */

import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import path from 'path';
import fs from 'fs';
import { getQrUploadsDir } from '../middlewares/upload.js';

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

/**
 * Validate UTR format - Must be exactly 12 digits
 */
const isValidUTR = (utr) => {
  return /^\d{12}$/.test(utr);
};

/**
 * Get QR code URL for payment
 * GET /api/payments/qr
 */
export const getPaymentQR = asyncHandler(async (req, res) => {
  // Check for admin-uploaded QR code
  const qrDir = getQrUploadsDir();
  let qrUrl = null;

  // Look for admin QR image (check multiple possible filenames)
  const possibleFiles = [
    'payment-qr.png', 'payment-qr.jpg', 'payment-qr.jpeg', 'payment-qr.webp',
    'admin-qr.png', 'admin-qr.jpg', 'admin-qr.jpeg', 'admin-qr.webp'
  ];
  for (const file of possibleFiles) {
    const filePath = path.join(qrDir, file);
    if (fs.existsSync(filePath)) {
      qrUrl = `/uploads/qr/${file}`;
      break;
    }
  }

  // Check database for stored QR URL (admin can set this)
  const qrSetting = await prisma.adminSettings.findUnique({
    where: { key: 'payment_qr_url' }
  }).catch(() => null);

  if (qrSetting?.value) {
    qrUrl = qrSetting.value;
  }

  // Fallback to env variable
  if (!qrUrl) {
    qrUrl = process.env.ADMIN_PAYMENT_QR_URL || null;
  }

  res.json({
    qrUrl,
    upiId: process.env.UPI_ID || '9030405493@upi',
    upiName: process.env.UPI_NAME || 'JobFinder Plus',
    plans: PLANS,
    message: qrUrl ? 'Scan QR code to pay' : 'QR code not configured. Use UPI ID.'
  });
});

/**
 * Submit payment request with UTR
 * POST /api/payments/submit
 */
export const submitPaymentRequest = asyncHandler(async (req, res) => {
  const { plan, utr } = req.body;
  const userId = req.user.id;

  // Validate plan
  const planKey = plan?.toUpperCase().replace('-', '_');
  if (!PLANS[planKey]) {
    return res.status(400).json({
      error: 'Invalid plan',
      message: 'Choose BASIC_PLUS, AI, or PRO_PLUS',
      validPlans: Object.keys(PLANS)
    });
  }

  // Validate UTR if provided
  if (utr) {
    const normalizedUTR = utr.trim().replace(/\s/g, '');
    
    if (!isValidUTR(normalizedUTR)) {
      return res.status(400).json({
        error: 'Invalid UTR format',
        message: 'UTR must be exactly 12 digits',
        code: 'INVALID_UTR_FORMAT'
      });
    }

    // Check for duplicate UTR
    const existingPayment = await prisma.payment.findUnique({
      where: { utr: normalizedUTR }
    });

    const existingRequest = await prisma.paymentRequest.findFirst({
      where: { utr: normalizedUTR }
    });

    if (existingPayment || existingRequest) {
      return res.status(400).json({
        error: 'Duplicate UTR',
        message: 'This UTR has already been used.',
        code: 'DUPLICATE_UTR'
      });
    }
  }

  // Check for pending request (rate limiting)
  const pendingRequest = await prisma.paymentRequest.findFirst({
    where: {
      userId,
      status: 'PENDING',
      createdAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes
      }
    }
  });

  if (pendingRequest) {
    return res.status(429).json({
      error: 'Request pending',
      message: 'You have a pending payment request. Please wait for admin verification.',
      code: 'PENDING_REQUEST_EXISTS',
      existingRequest: {
        id: pendingRequest.id,
        plan: pendingRequest.plan,
        createdAt: pendingRequest.createdAt
      }
    });
  }

  // Create payment request
  const paymentRequest = await prisma.paymentRequest.create({
    data: {
      userId,
      plan: planKey,
      amount: PLANS[planKey].amount,
      utr: utr ? utr.trim().replace(/\s/g, '') : null,
      status: 'PENDING'
    }
  });

  console.log(`[Payment] 💳 New payment request: ${paymentRequest.id} | Plan: ${planKey} | User: ${userId}`);

  res.status(201).json({
    success: true,
    message: 'Payment request submitted! Admin will verify soon.',
    request: {
      id: paymentRequest.id,
      plan: planKey,
      amount: PLANS[planKey].amount,
      status: 'PENDING',
      createdAt: paymentRequest.createdAt
    }
  });
});

/**
 * Get user's payment requests
 * GET /api/payments/requests
 */
export const getUserPaymentRequests = asyncHandler(async (req, res) => {
  const requests = await prisma.paymentRequest.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  res.json({
    requests,
    currentPlan: req.user.plan,
    paymentVerified: req.user.paymentVerified
  });
});

/**
 * Admin: Get all pending payment requests
 * GET /api/payments/admin/requests/pending
 */
export const getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await prisma.paymentRequest.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          plan: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  res.json({ requests, count: requests.length });
});

/**
 * Admin: Get all payment requests
 * GET /api/payments/admin/requests/all
 */
export const getAllRequests = asyncHandler(async (req, res) => {
  const requests = await prisma.paymentRequest.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          plan: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  res.json({ requests, count: requests.length });
});

/**
 * Admin: Approve payment request
 * POST /api/payments/admin/requests/approve/:requestId
 */
export const approvePaymentRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const adminId = req.user.id;

  // Find the request
  const request = await prisma.paymentRequest.findUnique({
    where: { id: requestId },
    include: { user: true }
  });

  if (!request) {
    return res.status(404).json({ error: 'Payment request not found' });
  }

  if (request.status !== 'PENDING') {
    return res.status(400).json({ 
      error: 'Cannot approve',
      message: `Request already ${request.status.toLowerCase()}`
    });
  }

  const planConfig = PLANS[request.plan];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + planConfig.days * 24 * 60 * 60 * 1000);

  // Transaction: Update request + user
  await prisma.$transaction([
    // Update payment request
    prisma.paymentRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        approvedBy: adminId
      }
    }),
    // Update user plan
    prisma.user.update({
      where: { id: request.userId },
      data: {
        plan: request.plan,
        paymentVerified: true,
        paidAt: now,
        expiresAt
      }
    })
  ]);

  console.log(`[Payment] ✅ Request ${requestId} APPROVED | User: ${request.user.email} | Plan: ${request.plan}`);

  res.json({
    success: true,
    message: `Payment approved! User upgraded to ${planConfig.name}`,
    request: {
      id: requestId,
      status: 'APPROVED',
      plan: request.plan,
      userEmail: request.user.email
    }
  });
});

/**
 * Admin: Reject payment request
 * POST /api/payments/admin/requests/reject/:requestId
 */
export const rejectPaymentRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { reason } = req.body;
  const adminId = req.user.id;

  const request = await prisma.paymentRequest.findUnique({
    where: { id: requestId },
    include: { user: true }
  });

  if (!request) {
    return res.status(404).json({ error: 'Payment request not found' });
  }

  if (request.status !== 'PENDING') {
    return res.status(400).json({ 
      error: 'Cannot reject',
      message: `Request already ${request.status.toLowerCase()}`
    });
  }

  await prisma.paymentRequest.update({
    where: { id: requestId },
    data: {
      status: 'REJECTED',
      rejectionReason: reason || 'Payment could not be verified',
      approvedBy: adminId
    }
  });

  console.log(`[Payment] ❌ Request ${requestId} REJECTED | User: ${request.user.email}`);

  res.json({
    success: true,
    message: 'Payment request rejected',
    request: {
      id: requestId,
      status: 'REJECTED',
      reason: reason || 'Payment could not be verified'
    }
  });
});

/**
 * Admin: Upload QR code
 * POST /api/payments/admin/upload-qr
 */
export const uploadQRCode = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      error: 'No file uploaded',
      message: 'Please upload a QR code image (PNG, JPG, or WebP)'
    });
  }

  const qrUrl = `/uploads/qr/${req.file.filename}`;

  // Store in database
  await prisma.adminSettings.upsert({
    where: { key: 'payment_qr_url' },
    update: { value: qrUrl },
    create: { key: 'payment_qr_url', value: qrUrl }
  });

  console.log(`[Payment] 📷 QR Code uploaded: ${qrUrl}`);

  res.json({
    success: true,
    message: 'QR code uploaded successfully',
    qrUrl
  });
});

export default {
  getPaymentQR,
  submitPaymentRequest,
  getUserPaymentRequests,
  getPendingRequests,
  getAllRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
  uploadQRCode
};
