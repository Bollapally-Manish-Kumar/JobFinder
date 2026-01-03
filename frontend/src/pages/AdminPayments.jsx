/**
 * Admin Payments Page
 * Manage pending payments - approve or reject UTR submissions
 * ONLY accessible by admin@jobfinder.com
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Shield,
  AlertTriangle,
  User,
  CreditCard,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../hooks/useAuthStore';

const ADMIN_EMAIL = 'admin@jobfinder.com';

function AdminPayments() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) {
      setUnauthorized(true);
      toast.error('Access denied. Admin only.');
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  }, [user, navigate]);

  // Fetch payments
  const fetchPayments = async () => {
    if (user?.email !== ADMIN_EMAIL) return;
    
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        api.get('/payments/admin/pending'),
        api.get('/payments/admin/all')
      ]);
      setPendingPayments(pendingRes.data.payments || []);
      setAllPayments(allRes.data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      if (error.response?.status === 403) {
        setUnauthorized(true);
        toast.error('Access denied. Admin only.');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        toast.error('Failed to fetch payments');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      fetchPayments();
    }
  }, [user]);

  // Approve payment
  const handleApprove = async (paymentId) => {
    setProcessing(paymentId);
    try {
      await api.post(`/payments/admin/approve/${paymentId}`);
      toast.success('Payment approved! User now has premium access.');
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve payment');
    } finally {
      setProcessing(null);
    }
  };

  // Reject payment
  const handleReject = async (paymentId) => {
    setProcessing(paymentId);
    try {
      await api.post(`/payments/admin/reject/${paymentId}`, { 
        reason: rejectReason || 'Payment could not be verified' 
      });
      toast.success('Payment rejected');
      setShowRejectModal(null);
      setRejectReason('');
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject payment');
    } finally {
      setProcessing(null);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'verified':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
            <CheckCircle className="w-3 h-3" /> Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Get plan badge
  const getPlanBadge = (plan) => {
    switch(plan) {
      case 'PRO_PLUS':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
            ₹59 Pro Plus
          </span>
        );
      case 'AI':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
            ₹29 AI Match
          </span>
        );
      case 'BASIC_PLUS':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
            ₹9 Basic Plus
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-dark-500/20 text-dark-400 text-xs rounded-full">
            {plan}
          </span>
        );
    }
  };

  // Payment Card Component
  const PaymentCard = ({ payment, showActions = false }) => (
    <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* User & Payment Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-dark-400" />
            <span className="text-white font-medium">{payment.user?.name || payment.user?.email || 'Unknown'}</span>
            {getStatusBadge(payment.status)}
            {getPlanBadge(payment.plan)}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-dark-400">UTR Number</p>
              <p className="text-white font-mono">{payment.utr}</p>
            </div>
            <div>
              <p className="text-dark-400">Amount</p>
              <p className="text-white">₹{payment.amount}</p>
            </div>
            <div>
              <p className="text-dark-400">Submitted</p>
              <p className="text-white">{formatDate(payment.createdAt)}</p>
            </div>
            <div>
              <p className="text-dark-400">Email</p>
              <p className="text-white truncate">{payment.user?.email}</p>
            </div>
          </div>

          {payment.rejectionReason && (
            <p className="mt-2 text-sm text-red-400">
              Rejection reason: {payment.rejectionReason}
            </p>
          )}
        </div>

        {/* Actions */}
        {showActions && payment.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(payment.id)}
              disabled={processing === payment.id}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => setShowRejectModal(payment.id)}
              disabled={processing === payment.id}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Show unauthorized message if not admin
  if (unauthorized) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-dark-400">This area is restricted to administrators only.</p>
          <p className="text-dark-400 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin: Payment Management</h1>
            <p className="text-dark-400">Review and approve UTR payment submissions</p>
          </div>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingPayments.length}</p>
              <p className="text-dark-400 text-sm">Pending</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {allPayments.filter(p => p.status === 'verified').length}
              </p>
              <p className="text-dark-400 text-sm">Verified</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {allPayments.filter(p => p.status === 'rejected').length}
              </p>
              <p className="text-dark-400 text-sm">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-700 text-dark-400 hover:text-white'
          }`}
        >
          Pending ({pendingPayments.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-700 text-dark-400 hover:text-white'
          }`}
        >
          All Payments ({allPayments.length})
        </button>
      </div>

      {/* Payment List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-dark-400">Loading payments...</p>
        </div>
      ) : activeTab === 'pending' ? (
        pendingPayments.length === 0 ? (
          <div className="card p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
            <p className="text-dark-400">No pending payments to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPayments.map(payment => (
              <PaymentCard key={payment.id} payment={payment} showActions />
            ))}
          </div>
        )
      ) : (
        allPayments.length === 0 ? (
          <div className="card p-12 text-center">
            <CreditCard className="w-12 h-12 text-dark-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No payments yet</h3>
            <p className="text-dark-400">Payment history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allPayments.map(payment => (
              <PaymentCard key={payment.id} payment={payment} showActions={payment.status === 'pending'} />
            ))}
          </div>
        )
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Reject Payment</h3>
            </div>
            
            <p className="text-dark-400 mb-4">
              Are you sure you want to reject this payment? Please provide a reason.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder:text-dark-400 focus:outline-none focus:border-red-500 mb-4"
              rows={3}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {processing ? 'Rejecting...' : 'Reject Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPayments;
