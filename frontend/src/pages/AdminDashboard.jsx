/**
 * Admin Dashboard Page
 * Admin-only page for:
 * - QR code upload for payments
 * - Job upload with AI auto-fill
 * - Payment request management
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Briefcase, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Image
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import paymentService from '../services/paymentService';
import useAuthStore from '../hooks/useAuthStore';

const ADMIN_EMAIL = 'admin@jobfinder.com';

function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState('jobs');
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  
  // Job Upload State
  const [jobTitle, setJobTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [creatingJob, setCreatingJob] = useState(false);
  const [adminJobs, setAdminJobs] = useState([]);
  
  // QR Upload State
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [currentQrUrl, setCurrentQrUrl] = useState(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  
  // Payment Requests State
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processing, setProcessing] = useState(null);

  // Check if user is admin (by role or email)
  const isAdmin = user?.role === 'ADMIN' || user?.email === ADMIN_EMAIL;

  // Check admin access
  useEffect(() => {
    if (user && !isAdmin) {
      setUnauthorized(true);
      toast.error('Access denied. Admin only.');
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  }, [user, navigate, isAdmin]);

  // Fetch initial data
  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAdminJobs(),
        fetchQrData(),
        fetchPendingRequests()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminJobs = async () => {
    try {
      const response = await api.get('/admin/jobs');
      setAdminJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch admin jobs:', error);
    }
  };

  const fetchQrData = async () => {
    try {
      const data = await paymentService.getPaymentQR();
      if (data.qrUrl) {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        setCurrentQrUrl(data.qrUrl.startsWith('http') ? data.qrUrl : `${apiBaseUrl}${data.qrUrl}`);
      }
    } catch (error) {
      console.error('Failed to fetch QR data:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const data = await paymentService.getPendingRequests();
      setPendingRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  };

  // Job Creation with AI
  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    if (!jobTitle.trim() || !jobUrl.trim()) {
      toast.error('Job title and URL are required');
      return;
    }

    try {
      new URL(jobUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setCreatingJob(true);
    
    try {
      const response = await api.post('/admin/jobs', {
        title: jobTitle.trim(),
        url: jobUrl.trim()
      });

      if (response.data.success) {
        toast.success('Job created with AI auto-fill!');
        setJobTitle('');
        setJobUrl('');
        fetchAdminJobs();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to create job';
      toast.error(errorMsg);
    } finally {
      setCreatingJob(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Delete this job?')) return;
    
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      toast.success('Job deleted');
      fetchAdminJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  // QR Code Upload
  const handleQrFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setQrFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setQrPreview(e.target?.result);
    reader.readAsDataURL(file);
  };

  const handleUploadQr = async () => {
    if (!qrFile) {
      toast.error('Please select a QR code image');
      return;
    }

    setUploadingQr(true);

    try {
      const result = await paymentService.uploadQRCode(qrFile);
      toast.success('QR code uploaded successfully!');
      setQrFile(null);
      setQrPreview(null);
      fetchQrData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload QR code');
    } finally {
      setUploadingQr(false);
    }
  };

  // Payment Request Actions
  const handleApproveRequest = async (requestId) => {
    setProcessing(requestId);
    try {
      await paymentService.approveRequest(requestId);
      toast.success('Payment approved! User plan upgraded.');
      fetchPendingRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = prompt('Rejection reason (optional):');
    
    setProcessing(requestId);
    try {
      await paymentService.rejectRequest(requestId, reason || 'Payment could not be verified');
      toast.success('Payment rejected');
      fetchPendingRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  // Unauthorized view
  if (unauthorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-dark-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            activeTab === 'jobs' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Job Upload
        </button>
        <button
          onClick={() => setActiveTab('qr')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            activeTab === 'qr' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400'
          }`}
        >
          <QrCode className="w-4 h-4" />
          QR Code
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            activeTab === 'payments' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          Payments
          {pendingRequests.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Job Upload Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Create Job Form */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-400" />
              Add New Job (AI Auto-Fill)
            </h2>
            
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1">Job Title *</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Software Engineer"
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-dark-400 mb-1">Job URL *</label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://company.com/careers/job-123"
                  className="input w-full"
                  required
                />
              </div>

              <div className="bg-dark-700/50 rounded-lg p-3 text-sm text-dark-400">
                <p className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary-400" />
                  AI will automatically fetch and fill: company, location, description, experience level, job type, and category.
                </p>
              </div>

              <button
                type="submit"
                disabled={creatingJob}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {creatingJob ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating with AI...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Job
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Admin Jobs List */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Admin-Uploaded Jobs ({adminJobs.length})
              </h2>
              <button onClick={fetchAdminJobs} className="btn-secondary text-sm">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {adminJobs.length === 0 ? (
              <p className="text-dark-400 text-center py-8">No jobs uploaded yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {adminJobs.map((job) => (
                  <div key={job.id} className="bg-dark-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{job.title}</h3>
                      <p className="text-sm text-primary-400">{job.company}</p>
                      <p className="text-xs text-dark-500">{job.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-dark-400 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 text-dark-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Tab */}
      {activeTab === 'qr' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary-400" />
            Payment QR Code
          </h2>

          {/* Current QR Code */}
          {currentQrUrl && (
            <div className="mb-6">
              <p className="text-sm text-dark-400 mb-2">Current QR Code:</p>
              <div className="bg-white rounded-lg p-4 inline-block">
                <img 
                  src={currentQrUrl} 
                  alt="Current Payment QR" 
                  className="w-48 h-48 object-contain"
                />
              </div>
            </div>
          )}

          {/* Upload New QR */}
          <div className="border-t border-dark-700 pt-6">
            <p className="text-sm text-dark-400 mb-4">Upload new QR code:</p>
            
            <label className="block w-full p-8 border-2 border-dashed border-dark-600 rounded-xl hover:border-primary-500 transition-colors cursor-pointer text-center mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleQrFileSelect}
                className="hidden"
              />
              {qrPreview ? (
                <img src={qrPreview} alt="Preview" className="w-32 h-32 mx-auto object-contain" />
              ) : (
                <>
                  <Image className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                  <p className="text-white font-medium mb-1">Click to select QR image</p>
                  <p className="text-sm text-dark-500">PNG, JPG, WebP • Max 5MB</p>
                </>
              )}
            </label>

            {qrFile && (
              <div className="flex items-center justify-between bg-dark-700 rounded-lg p-3 mb-4">
                <span className="text-white">{qrFile.name}</span>
                <button onClick={() => { setQrFile(null); setQrPreview(null); }} className="text-red-400">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            )}

            <button
              onClick={handleUploadQr}
              disabled={!qrFile || uploadingQr}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
            >
              {uploadingQr ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload QR Code
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Pending Payment Requests ({pendingRequests.length})
            </h2>
            <button onClick={fetchPendingRequests} className="btn-secondary text-sm">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <p className="text-dark-400 text-center py-8">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-dark-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">{request.user?.email}</p>
                      <p className="text-sm text-primary-400">{request.plan} • ₹{request.amount}</p>
                      {request.utr && (
                        <p className="text-xs text-dark-400 font-mono mt-1">UTR: {request.utr}</p>
                      )}
                      <p className="text-xs text-dark-500 mt-1">
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={processing === request.id}
                        className="btn-primary text-sm flex items-center gap-1 px-3 py-2"
                      >
                        {processing === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={processing === request.id}
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm flex items-center gap-1 px-3 py-2 rounded-lg"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
