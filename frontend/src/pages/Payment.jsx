/**
 * Payment Page - UPI with UTR verification
 * 5-tier plan system:
 * - BASIC (Free) - 1 AI match trial
 * - BASIC_PLUS (₹10/month) - 3 AI matches
 * - AI (₹20/month) - 5 AI matches
 * - PRO_PLUS (₹30/month) - 6 AI matches
 * - ULTIMATE (₹50/month) - Unlimited AI + LaTeX resume
 */

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  Smartphone,
  Calendar,
  Shield,
  Sparkles,
  Loader2,
  Zap,
  Brain,
  Copy,
  ExternalLink,
  AlertCircle,
  Clock,
  Crown,
  X,
  Infinity,
  FileCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import paymentService from '../services/paymentService';
import useAuthStore from '../hooks/useAuthStore';
import SEO from '../components/SEO';

// Plan definitions
const PLANS = {
  BASIC_PLUS: {
    id: 'BASIC_PLUS',
    name: 'Basic Plus',
    price: 10,
    icon: Zap,
    color: 'primary',
    gradient: 'from-primary-500 to-blue-500',
    aiMatches: 3,
    features: [
      '3 AI job matches',
      'Unlimited job access',
      'Resume builder',
      'Save & track jobs',
      'Verified badge'
    ]
  },
  AI: {
    id: 'AI',
    name: 'AI Pro',
    price: 20,
    icon: Brain,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    recommended: true,
    aiMatches: 5,
    features: [
      '5 AI job matches',
      'All Basic Plus features',
      'Match score analysis',
      'Skills gap insights',
      'Personalized recommendations'
    ]
  },
  PRO_PLUS: {
    id: 'PRO_PLUS',
    name: 'Pro Plus',
    price: 30,
    icon: Crown,
    color: 'yellow',
    gradient: 'from-yellow-500 to-orange-500',
    aiMatches: 6,
    features: [
      '6 AI job matches',
      'All AI Pro features',
      'Priority support',
      'Advanced analytics',
      'Early access to features'
    ]
  },
  ULTIMATE: {
    id: 'ULTIMATE',
    name: 'Ultimate',
    price: 50,
    icon: Infinity,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    aiMatches: 'Unlimited',
    popular: true,
    features: [
      'Unlimited AI job matches',
      'All Pro Plus features',
      'New: LaTeX resume generator',
      'Job-specific tailored resumes',
      'ATS-optimized formatting',
      'Priority AI processing'
    ]
  }
};

function Payment() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [utr, setUtr] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [upiDetails, setUpiDetails] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [qrImageError, setQrImageError] = useState(false);

  const { user, updateUser } = useAuthStore();

  // Fetch initial data
  useEffect(() => {
    fetchSubscription();
    fetchHistory();
    fetchUpiDetails();
    fetchQRData();
  }, []);

  const fetchQRData = async () => {
    try {
      const data = await paymentService.getPaymentQR();
      console.log('QR Data received:', data);
      setQrData(data);
    } catch (error) {
      console.error('Failed to fetch QR data:', error);
      // Set fallback QR data if API fails
      setQrData({
        qrUrl: '/uploads/qr/payment-qr.jpg',
        upiId: '9030405493@upi'
      });
    }
  };

  const fetchUpiDetails = async () => {
    try {
      const data = await paymentService.getUpiDetails();
      setUpiDetails(data);
    } catch (error) {
      console.error('Failed to fetch UPI details:', error);
    }
  };

  const fetchSubscription = async () => {
    try {
      const data = await paymentService.getSubscriptionStatus();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await paymentService.getPaymentHistory();
      setPaymentHistory(data.payments);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  // Open payment modal with selected plan
  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
    setUtr('');
    setQrImageError(false); // Reset QR error state when opening modal
  };

  // Copy UPI ID
  const copyUpiId = () => {
    if (upiDetails?.upiId) {
      navigator.clipboard.writeText(upiDetails.upiId);
      toast.success('UPI ID copied!');
    }
  };

  // Open UPI app
  const openUpiApp = () => {
    const plan = PLANS[selectedPlan];
    if (!plan) return;
    const upiLink = paymentService.generateUpiLink(
      upiDetails?.upiId || '9030405493@upi',
      upiDetails?.name || 'GoAxon AI',
      plan.price,
      `GoAxon AI ${plan.name} Plan`
    );
    window.location.href = upiLink;
  };

  // Submit UTR for verification
  const handleSubmitUTR = async () => {
    if (!utr.trim()) {
      toast.error('Please enter UTR number');
      return;
    }

    if (!/^\d{12}$/.test(utr.trim())) {
      toast.error('UTR must be exactly 12 digits');
      return;
    }

    setLoading(true);

    try {
      const plan = PLANS[selectedPlan];
      const result = await paymentService.submitUTR(utr.trim(), selectedPlan, plan.price);

      if (result.success) {
        toast.success(result.message, { duration: 5000 });
        setShowPaymentModal(false);
        setUtr('');
        fetchHistory();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Payment submission failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Get current plan level
  const currentPlan = user?.plan || 'BASIC';
  const isAdmin = user?.role === 'ADMIN';
  const isPaid = isAdmin || (user?.paymentVerified && currentPlan !== 'BASIC');

  // Check if user has a pending payment
  const hasPendingPayment = paymentHistory.some(p => p.status === 'pending');

  // Payment Modal
  const planDetails = selectedPlan ? PLANS[selectedPlan] : null;

  // Use GitHub raw URL for reliable QR image access (always works)
  const GITHUB_QR_URL = 'https://raw.githubusercontent.com/Bollapally-Manish-Kumar/JobFinder/main/backend/uploads/qr/payment-qr.jpg';
  // Only use API URL if it's a full HTTP URL, otherwise use GitHub
  const fullQrUrl = (qrData?.qrUrl && qrData.qrUrl.startsWith('http')) ? qrData.qrUrl : GITHUB_QR_URL;

  const paymentModalContent = showPaymentModal && planDetails && (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowPaymentModal(false)}
          className="absolute top-4 right-4 text-dark-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6 text-center">
          Pay ₹{planDetails.price} for {planDetails.name}
        </h2>

        {/* Step 1: Pay via UPI - QR Code Display */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">1</div>
            <span className="font-medium text-white">Scan QR or Pay via UPI</span>
          </div>

          {/* QR Code Display - Always show */}
          {!qrImageError && (
            <div className="bg-white rounded-lg p-4 mb-4 flex flex-col items-center">
              <img
                src={fullQrUrl}
                alt="Payment QR Code"
                className="w-48 h-48 object-contain"
                onError={(e) => {
                  console.error('QR image failed to load:', fullQrUrl);
                  setQrImageError(true);
                }}
              />
              <p className="text-dark-800 text-sm mt-2 font-medium">Scan to pay ₹{planDetails.price}</p>
            </div>
          )}

          {/* Only show UPI ID if QR failed to load */}
          {qrImageError && (
            <div className="bg-dark-700 rounded-lg p-4 mb-3">
              <p className="text-sm text-dark-400 mb-2">Send ₹{planDetails.price} to this UPI ID:</p>
              <div className="flex items-center justify-between bg-dark-600 rounded-lg px-4 py-3">
                <span className="text-white font-mono">{qrData?.upiId || upiDetails?.upiId || '9030405493@upi'}</span>
                <button onClick={copyUpiId} className="text-primary-400 hover:text-primary-300">
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={openUpiApp}
            className="w-full btn-secondary flex items-center justify-center gap-2 py-3"
          >
            <Smartphone className="w-5 h-5" />
            Open UPI App to Pay ₹{planDetails.price}
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Step 2: Enter UTR */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">2</div>
            <span className="font-medium text-white">Enter UTR Number</span>
          </div>

          <div className="bg-dark-700/50 border border-dark-600 rounded-lg p-3 mb-3">
            <p className="text-xs text-dark-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              After payment, find UTR/Reference ID in your UPI app's transaction history. It must be exactly 12 digits.
            </p>
          </div>

          <input
            type="text"
            placeholder="Enter 12-digit UTR number"
            value={utr}
            onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
            className="input w-full mb-3 font-mono tracking-wider text-center text-lg"
            maxLength={12}
            autoFocus
          />

          <button
            onClick={handleSubmitUTR}
            disabled={loading || utr.trim().length !== 12}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Submit for Verification
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="flex items-center justify-center gap-2 text-sm text-dark-500">
          <Clock className="w-4 h-4" />
          Admin will verify within 1 hour
        </div>
      </div>
    </div>
  );

  // Pending payment notice
  const pendingNotice = hasPendingPayment && (
    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
      <Clock className="w-5 h-5 text-yellow-500" />
      <div>
        <p className="text-yellow-400 font-medium">Payment Pending Verification</p>
        <p className="text-sm text-dark-400">Admin will verify your payment within 1 hour</p>
      </div>
    </div>
  );

  // If paid subscriber, show subscription status
  if (isPaid && subscription?.isActive) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Subscription Status</h1>

        {pendingNotice}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Current Subscription */}
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {PLANS[currentPlan]?.name || currentPlan} Active
              </h2>
              <p className="text-dark-400">You have access to premium features</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">Current Plan</span>
                <span className="text-primary-400 font-medium">{PLANS[currentPlan]?.name || currentPlan}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">Status</span>
                <span className="text-green-400 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">Started</span>
                <span className="text-white">
                  {subscription.paidAt ? new Date(subscription.paidAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">Expires</span>
                <span className="text-white">
                  {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">Days Remaining</span>
                <span className="text-primary-400 font-medium">{subscription.daysRemaining} days</span>
              </div>
            </div>

            {/* Features included */}
            <div className="mb-6">
              <p className="text-sm text-dark-400 mb-3">Features included:</p>
              <ul className="space-y-2">
                {(PLANS[currentPlan]?.features || []).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-dark-300">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Upgrade options - only show if not on ULTIMATE (highest) plan */}
          {currentPlan !== 'ULTIMATE' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Upgrade Your Plan</h3>

              {Object.entries(PLANS)
                .filter(([planId]) => {
                  const planOrder = ['BASIC', 'BASIC_PLUS', 'AI', 'PRO_PLUS', 'ULTIMATE'];
                  return planOrder.indexOf(planId) > planOrder.indexOf(currentPlan);
                })
                .map(([planId, plan]) => {
                  const IconComponent = plan.icon;
                  return (
                    <div key={planId} className="card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{plan.name}</h4>
                            <p className="text-sm text-dark-400">₹{plan.price}/month</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectPlan(planId)}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r ${plan.gradient} text-white`}
                        >
                          Upgrade
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Payment History</h2>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">UTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3 text-sm text-white">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {PLANS[payment.plan]?.name || payment.plan}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">₹{payment.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${payment.status === 'verified'
                          ? 'bg-green-500/20 text-green-400'
                          : payment.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-dark-400 font-mono">{payment.utr || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {paymentModalContent}
      </div>
    );
  }

  // Payment page for non-subscribers or free users
  return (
    <div>
      <SEO
        title="Pricing & Plans | GoAxonAI"
        description="Choose your GoAxonAI plan. Get AI job matching, resume builder, and career tools. Plans starting at ₹10/month. Pay via UPI."
        keywords="pricing, plans, subscription, AI job matching, resume builder, GoAxonAI pricing"
        url="https://www.goaxonai.in/payment"
      />
      <h1 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h1>
      <p className="text-dark-400 mb-8">Pay via UPI • Admin verified • 30 days access</p>

      {pendingNotice}

      <div className="grid lg:grid-cols-3 gap-6">
        {Object.entries(PLANS).map(([planId, plan]) => {
          const IconComponent = plan.icon;
          const isProPlus = planId === 'PRO_PLUS';
          return (
            <div
              key={planId}
              className={`card p-6 relative overflow-hidden ${plan.recommended ? 'border-2 border-purple-500/50' : ''} ${isProPlus ? 'border-2 border-yellow-500/50' : ''}`}
            >
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r ${plan.gradient} opacity-20 rounded-full blur-3xl`} />

              {plan.recommended && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  RECOMMENDED
                </div>
              )}

              {isProPlus && (
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                    PRO
                  </span>
                </div>
              )}

              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{plan.name}</h2>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl text-dark-400">₹</span>
                    <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-dark-400">/ month</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-dark-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Pay button */}
                <div className="relative">
                  <button
                    onClick={() => handleSelectPlan(planId)}
                    className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white transition-all`}
                  >
                    <Smartphone className="w-5 h-5" />
                    Pay ₹{plan.price}
                  </button>
                  {isProPlus && (
                    <span className="coming-soon-badge absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-dark-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-primary-500/30 whitespace-nowrap border border-primary-400">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security note */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-dark-500">
        <Shield className="w-4 h-4" />
        Secure UPI payment • Admin verified activation
      </div>

      {/* Payment History for free users */}
      {paymentHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Payment History</h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">Plan</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">UTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {paymentHistory.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 text-sm text-white">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {PLANS[payment.plan]?.name || payment.plan}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">₹{payment.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${payment.status === 'verified'
                        ? 'bg-green-500/20 text-green-400'
                        : payment.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-400 font-mono">{payment.utr || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {paymentModalContent}
    </div>
  );
}

export default Payment;
