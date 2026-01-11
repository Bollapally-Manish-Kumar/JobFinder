/**
 * Payment Routes
 * Handles UPI payment with UTR verification + QR-based payment system
 */

import express from 'express';
import { 
  getUpiDetails,
  submitUTR,
  getPaymentStatus,
  getPaymentById,
  getPaymentHistory,
  checkAiAccess,
  getPendingPayments,
  getAllPayments,
  approvePayment,
  rejectPayment
} from '../controllers/paymentController.js';
import {
  getPaymentQR,
  submitPaymentRequest,
  getUserPaymentRequests,
  getPendingRequests,
  getAllRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
  uploadQRCode
} from '../controllers/qrPaymentController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { uploadQR, handleUploadError } from '../middlewares/upload.js';

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

// =============================================
// NEW QR-BASED PAYMENT SYSTEM
// =============================================

// Get QR code and payment info
router.get('/qr', getPaymentQR);

// Submit payment request with UTR
router.post('/submit', submitPaymentRequest);

// Get user's payment requests
router.get('/requests', getUserPaymentRequests);

// Admin: QR code management
router.post('/admin/upload-qr', requireAdmin, uploadQR.single('qr'), handleUploadError, uploadQRCode);

// Admin: Payment requests management
router.get('/admin/requests/pending', requireAdmin, getPendingRequests);
router.get('/admin/requests/all', requireAdmin, getAllRequests);
router.post('/admin/requests/approve/:requestId', requireAdmin, approvePaymentRequest);
router.post('/admin/requests/reject/:requestId', requireAdmin, rejectPaymentRequest);

// =============================================
// LEGACY UPI PAYMENT SYSTEM (kept for compatibility)
// =============================================

// Get UPI payment details (UPI ID, QR code, plans)
router.get('/upi-details', getUpiDetails);

// Submit UTR for verification
router.post('/submit-utr', submitUTR);

// Get subscription status
router.get('/status', getPaymentStatus);

// Get specific payment by ID
router.get('/status/:paymentId', getPaymentById);

// Get payment history
router.get('/history', getPaymentHistory);

// Check AI Match access
router.get('/ai-access', checkAiAccess);

// Admin routes - PROTECTED (only admin@jobfinder.com)
router.get('/admin/pending', requireAdmin, getPendingPayments);
router.get('/admin/all', requireAdmin, getAllPayments);
router.post('/admin/approve/:paymentId', requireAdmin, approvePayment);
router.post('/admin/reject/:paymentId', requireAdmin, rejectPayment);

export default router;
