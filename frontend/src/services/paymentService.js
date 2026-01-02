/**
 * Payment Service - UPI with UTR verification
 */

import api from './api';

export const paymentService = {
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
      tn: transactionNote || `JobFinder+ ${amount === 10 ? 'Basic' : 'AI Match'} Plan`
    });
    return `upi://pay?${params.toString()}`;
  }
};

export default paymentService;
