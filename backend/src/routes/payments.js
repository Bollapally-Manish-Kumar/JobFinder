/**
 * Payment Routes
 * Handles UPI payment with UTR verification
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
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

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
