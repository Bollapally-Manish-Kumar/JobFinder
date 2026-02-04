/**
 * Profile Page - User profile management with resume upload
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Crown, Calendar, FileText, Upload, Trash2,
  Loader2, CheckCircle, AlertCircle, RefreshCw, Sparkles,
  Phone, MapPin, Briefcase, Building, Link as LinkIcon, Save, Edit3
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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Form state for profile editing
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    country: 'India',
    linkedin: '',
    portfolio: '',
    experienceYears: '',
    currentCompany: '',
    currentTitle: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await profileService.getProfile();
      setProfile(data.profile);
      // Initialize form data with profile values
      setFormData({
        name: data.profile?.name || '',
        phone: data.profile?.phone || '',
        city: data.profile?.city || '',
        country: data.profile?.country || 'India',
        linkedin: data.profile?.linkedin || '',
        portfolio: data.profile?.portfolio || '',
        experienceYears: data.profile?.experienceYears?.toString() || '',
        currentCompany: data.profile?.currentCompany || '',
        currentTitle: data.profile?.currentTitle || ''
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile(formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      await fetchProfile();
      refreshUser?.();
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to current profile values
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      city: profile?.city || '',
      country: profile?.country || 'India',
      linkedin: profile?.linkedin || '',
      portfolio: profile?.portfolio || '',
      experienceYears: profile?.experienceYears?.toString() || '',
      currentCompany: profile?.currentCompany || '',
      currentTitle: profile?.currentTitle || ''
    });
    setEditing(false);
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
        title="My Profile | GoAxonAI"
        description="Manage your GoAxonAI profile, upload your resume for AxonMatch™, and view your subscription status."
        url="https://www.goaxonai.in/profile"
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              Profile Information
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="btn-secondary text-sm"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="btn-primary text-sm flex items-center gap-2"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            )}
          </div>

          {editing ? (
            /* Editing Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="text-dark-400 text-sm mb-1 block">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="input w-full"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-dark-400 text-sm mb-1 block">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="input w-full"
                />
              </div>

              {/* City */}
              <div>
                <label className="text-dark-400 text-sm mb-1 block">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Mumbai, Delhi, etc."
                  className="input w-full"
                />
              </div>

              {/* Country */}
              <div>
                <label className="text-dark-400 text-sm mb-1 block">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="India"
                  className="input w-full"
                />
              </div>

              {/* Current Title */}
              <div>
                <label className="text-dark-400 text-sm mb-1 block">Current Job Title</label>
                <input
                  type="text"
                  name="currentTitle"
                  value={formData.currentTitle}
                  onChange={handleInputChange}
                  placeholder="Software Engineer, etc."
                  className="input w-full"
                />
              </div>

              {/* Current Company */}
              <div>
                <label className="text-dark-400 text-sm mb-1 block">Current Company</label>
                <input
                  type="text"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleInputChange}
                  placeholder="Your current employer"
                  className="input w-full"
                />
              </div>

              {/* Experience Years */}
              <div>
                <label className="text-dark-400 text-sm mb-1 block">Years of Experience</label>
                <input
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleInputChange}
                  placeholder="0-50"
                  min="0"
                  max="50"
                  className="input w-full"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="text-dark-400 text-sm mb-1 block">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="input w-full"
                />
              </div>

              {/* Portfolio */}
              <div className="md:col-span-2">
                <label className="text-dark-400 text-sm mb-1 block">Portfolio / GitHub URL</label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  placeholder="https://github.com/yourprofile"
                  className="input w-full"
                />
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-4">
              {/* Name */}
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-dark-500" />
                <div>
                  <label className="text-dark-500 text-xs">Name</label>
                  <p className="text-white">{profile?.name || <span className="text-dark-500">Not set</span>}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-dark-500" />
                <div>
                  <label className="text-dark-500 text-xs">Email</label>
                  <p className="text-white">{profile?.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-dark-500" />
                <div>
                  <label className="text-dark-500 text-xs">Phone</label>
                  <p className="text-white">{profile?.phone || <span className="text-dark-500">Not set</span>}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-dark-500" />
                <div>
                  <label className="text-dark-500 text-xs">Location</label>
                  <p className="text-white">
                    {profile?.city || profile?.country 
                      ? `${profile?.city || ''}${profile?.city && profile?.country ? ', ' : ''}${profile?.country || ''}`
                      : <span className="text-dark-500">Not set</span>
                    }
                  </p>
                </div>
              </div>

              {/* Current Role */}
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-dark-500" />
                <div>
                  <label className="text-dark-500 text-xs">Current Role</label>
                  <p className="text-white">
                    {profile?.currentTitle || profile?.currentCompany
                      ? `${profile?.currentTitle || ''}${profile?.currentTitle && profile?.currentCompany ? ' at ' : ''}${profile?.currentCompany || ''}`
                      : <span className="text-dark-500">Not set</span>
                    }
                  </p>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-dark-500" />
                <div>
                  <label className="text-dark-500 text-xs">Experience</label>
                  <p className="text-white">
                    {profile?.experienceYears !== null && profile?.experienceYears !== undefined
                      ? `${profile.experienceYears} year${profile.experienceYears !== 1 ? 's' : ''}`
                      : <span className="text-dark-500">Not set</span>
                    }
                  </p>
                </div>
              </div>

              {/* Links */}
              {(profile?.linkedin || profile?.portfolio) && (
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-dark-500" />
                  <div className="flex gap-4">
                    {profile?.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 text-sm">
                        LinkedIn ↗
                      </a>
                    )}
                    {profile?.portfolio && (
                      <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 text-sm">
                        Portfolio ↗
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Plan */}
              <div className="pt-2 border-t border-dark-700">
                <label className="text-dark-500 text-xs">Subscription</label>
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
                <label className="text-dark-500 text-xs">Member Since</label>
                <p className="text-white text-sm">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* AxonApply tip */}
          {!editing && (!profile?.phone || !profile?.city || !profile?.name) && (
            <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-orange-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Complete your profile to use AxonApply™ auto-fill on job applications.
              </p>
            </div>
          )}
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
