/**
 * Profile Page - User profile management with resume upload
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Crown, Calendar, FileText, Upload, Trash2,
  Loader2, CheckCircle, AlertCircle, RefreshCw, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import profileService from '../services/profileService';
import useAuthStore from '../hooks/useAuthStore';
import SEO from '../components/SEO';

// Plan display config
const PLAN_CONFIG = {
  BASIC: { label: 'Basic (Free)', color: 'text-dark-400', bg: 'bg-dark-700' },
  BASIC_PLUS: { label: 'Basic Plus', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  AI: { label: 'AI Pro', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  PRO_PLUS: { label: 'Pro Plus', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  ULTIMATE: { label: 'Ultimate', color: 'text-emerald-400', bg: 'bg-emerald-500/20' }
};

function Profile() {
  const { user, refreshUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await profileService.getProfile();
      setProfile(data.profile);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      const result = await profileService.uploadResume(file);
      toast.success('Resume uploaded successfully!');
      
      // Update local profile state
      setProfile(prev => ({
        ...prev,
        hasResume: true,
        resumeUploadedAt: result.resumeUploadedAt,
        resumeTextPreview: result.preview
      }));
      
      // Refresh user data
      refreshUser?.();
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume? This will disable AI job matching.')) {
      return;
    }

    setDeleting(true);
    try {
      await profileService.deleteResume();
      toast.success('Resume deleted');
      
      // Update local profile state
      setProfile(prev => ({
        ...prev,
        hasResume: false,
        resumeUploadedAt: null,
        resumeTextPreview: null
      }));
    } catch (err) {
      toast.error('Failed to delete resume');
    } finally {
      setDeleting(false);
    }
  };

  const planConfig = PLAN_CONFIG[profile?.plan] || PLAN_CONFIG.BASIC;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <SEO
        title="My Profile | JobFinder+"
        description="Manage your JobFinder+ profile, upload your resume for AI job matching, and view your subscription status."
        url="https://jobfinderplus.vercel.app/profile"
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-7 h-7 text-primary-500" />
          My Profile
        </h1>
        <p className="text-dark-400 mt-1">
          Manage your account and resume for AI job matching
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info Card */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary-500" />
            Account Information
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-dark-400 text-sm">Name</label>
              <p className="text-white font-medium">{profile?.name || 'Not set'}</p>
            </div>

            {/* Email */}
            <div>
              <label className="text-dark-400 text-sm">Email</label>
              <p className="text-white font-medium">{profile?.email}</p>
            </div>

            {/* Plan */}
            <div>
              <label className="text-dark-400 text-sm">Subscription</label>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${planConfig.bg} ${planConfig.color}`}>
                  {planConfig.label}
                </span>
                {profile?.expiresAt && (
                  <span className="text-dark-400 text-sm flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Expires: {new Date(profile.expiresAt).toLocaleDateString()}
                  </span>
                )}
                {profile?.plan === 'BASIC' && (
                  <Link to="/payment" className="text-primary-400 text-sm hover:text-primary-300">
                    Upgrade →
                  </Link>
                )}
              </div>
            </div>

            {/* Member since */}
            <div>
              <label className="text-dark-400 text-sm">Member Since</label>
              <p className="text-white">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Resume Upload Card */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            Resume for AI Job Matching
          </h2>
          <p className="text-dark-400 text-sm mb-4">
            Upload your resume once, and we'll use it to analyze your match with every job automatically.
          </p>

          {/* Current resume status */}
          {profile?.hasResume ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-green-400 font-medium">Resume Uploaded</p>
                    <p className="text-dark-400 text-sm mt-1">
                      Uploaded {profile.resumeUploadedAt ? new Date(profile.resumeUploadedAt).toLocaleDateString() : 'recently'}
                    </p>
                    {profile.resumeTextPreview && (
                      <p className="text-dark-500 text-xs mt-2 line-clamp-2">
                        {profile.resumeTextPreview}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleDeleteResume}
                  disabled={deleting}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete resume"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-medium">No Resume Uploaded</p>
                  <p className="text-dark-400 text-sm mt-1">
                    Upload your resume to enable AI job match analysis
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload button */}
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className={`btn-primary flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {profile?.hasResume ? 'Replace Resume' : 'Upload Resume'}
                </>
              )}
            </label>
            <button
              onClick={fetchProfile}
              className="btn-secondary flex items-center gap-2"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Requirements */}
          <div className="mt-4 text-dark-500 text-xs space-y-1">
            <p>• PDF format only</p>
            <p>• Maximum file size: 2MB</p>
            <p>• Must be text-based (not scanned image)</p>
          </div>
        </div>

        {/* AI Features Info */}
        {profile?.plan === 'BASIC' || profile?.plan === 'BASIC_PLUS' ? (
          <div className="card p-6 bg-gradient-to-br from-purple-500/10 to-primary-500/10 border-purple-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Unlock AI Job Matching
                </h3>
                <p className="text-dark-300 text-sm mb-3">
                  Upgrade to AI Plan (₹20) to see how well your resume matches each job listing.
                  Get personalized skill gap analysis and recommendations.
                </p>
                <Link to="/payment" className="btn-primary inline-flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Upgrade Now
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Profile;
