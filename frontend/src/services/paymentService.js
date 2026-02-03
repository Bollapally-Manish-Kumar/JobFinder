/**
 * Payment Service - QR-based payment with UTR verification
 */

import api from './api';

export const paymentService = {
  // =============================================
  // NEW QR-BASED PAYMENT SYSTEM
  // =============================================

  // Get QR code and payment info
  getPaymentQR: async () => {
    const response = await api.get('/payments/qr');
    return response.data;
  },

  // Submit payment request with UTR
  submitPaymentRequest: async (plan, utr = null) => {
    const response = await api.post('/payments/submit', { plan, utr });
    return response.data;
  },

  // Get user's payment requests
  getPaymentRequests: async () => {
    const response = await api.get('/payments/requests');
    return response.data;
  },

  // Admin: Upload QR code
  uploadQRCode: async (file) => {
    const formData = new FormData();
    formData.append('qr', file);
    const response = await api.post('/payments/admin/upload-qr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Admin: Get pending payment requests
  getPendingRequests: async () => {
    const response = await api.get('/payments/admin/requests/pending');
    return response.data;
  },

  // Admin: Get all payment requests
  getAllRequests: async () => {
    const response = await api.get('/payments/admin/requests/all');
    return response.data;
  },

  // Admin: Approve payment request
  approveRequest: async (requestId) => {
    const response = await api.post(`/payments/admin/requests/approve/${requestId}`);
    return response.data;
  },

  // Admin: Reject payment request
  rejectRequest: async (requestId, reason) => {
    const response = await api.post(`/payments/admin/requests/reject/${requestId}`, { reason });
    return response.data;
  },

  // =============================================
  // LEGACY UPI PAYMENT SYSTEM (kept for compatibility)
  // =============================================

  // Get UPI payment details (UPI ID, QR code, plans)
  getUpiDetails: async () => {
    const response = await api.get('/payments/upi-details');
    return response.data;
  },

  // Submit UTR for verification
  submitUTR: async (utr, plan, amount) => {
    const response = await api.post('/payments/submit-utr', { 
      utr, 
      plan,
      amount 
    });
    return response.data;
  },

  // Get payment status by ID
  getPaymentById: async (paymentId) => {
    const response = await api.get(`/payments/status/${paymentId}`);
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },

  // Get subscription status
  getSubscriptionStatus: async () => {
    const response = await api.get('/payments/status');
    return response.data;
  },

  // Check AI Match access
  checkAiAccess: async () => {
    const response = await api.get('/payments/ai-access');
    return response.data;
  },

  // Generate UPI deep link for payment apps
  generateUpiLink: (upiId, name, amount, transactionNote) => {
    const params = new URLSearchParams({
      pa: upiId, // Payee address (UPI ID)
      pn: name, // Payee name
      am: amount, // Amount
      cu: 'INR', // Currency
      tn: transactionNote || `GoAxon AI ${amount === 10 ? 'Basic' : 'AI Match'} Plan`
    });
    return `upi://pay?${params.toString()}`;
  }
};

export default paymentService;
