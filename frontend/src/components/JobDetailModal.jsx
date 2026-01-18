/**
 * Job Detail Modal - Expanded job view with resume match analysis
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X, MapPin, Briefcase, Clock, DollarSign, ExternalLink,
  Bookmark, BookmarkCheck, Loader2, Target, CheckCircle,
  XCircle, AlertCircle, Lock, TrendingUp, Sparkles, FileText,
  FileCode, Download, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import jobService from '../services/jobService';
import useAuthStore from '../hooks/useAuthStore';

// Match level colors and labels
const MATCH_LEVELS = {
  PERFECT_MATCH: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Perfect Match', emoji: '🎯' },
  STRONG_MATCH: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Strong Match', emoji: '💪' },
  GOOD_MATCH: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Good Match', emoji: '👍' },
  PARTIAL_MATCH: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Partial Match', emoji: '🔄' },
  WEAK_MATCH: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Needs Work', emoji: '📈' }
};

function JobDetailModal({ jobId, onClose, onSaveToggle, isSaved: initialSaved }) {
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [match, setMatch] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [generatingLatex, setGeneratingLatex] = useState(false);
  const [latexCode, setLatexCode] = useState(null);

  const { user } = useAuthStore();

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);
    setLatexCode(null);
    try {
      const data = await jobService.getJobDetails(jobId);
      setJob(data.job);
      setMatch(data.match);
      setUserStatus(data.userStatus);
      setAiUsage(data.aiUsage);
      setIsSaved(data.userStatus?.isSaved || false);
    } catch (err) {
      console.error('Failed to load job details:', err);
      setError(err.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    setSaving(true);
    try {
      if (isSaved) {
        await jobService.unsaveJob(jobId);
        toast.success('Job removed from saved');
      } else {
        await jobService.saveJob(jobId);
        toast.success('Job saved!');
      }
      setIsSaved(!isSaved);
      onSaveToggle?.(jobId, !isSaved);
    } catch (err) {
      toast.error('Failed to update saved status');
    } finally {
      setSaving(false);
    }
  };

  const handleApply = () => {
    if (job?.url) {
      window.open(job.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Generate LaTeX resume (ULTIMATE only)
  const handleGenerateLatex = async () => {
    setGeneratingLatex(true);
    try {
      const data = await jobService.generateLatexResume(jobId);
      setLatexCode(data.latex);
      toast.success('LaTeX resume generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate LaTeX resume');
    } finally {
      setGeneratingLatex(false);
    }
  };

  const copyLatexToClipboard = () => {
    if (latexCode) {
      navigator.clipboard.writeText(latexCode);
      toast.success('LaTeX code copied to clipboard!');
    }
  };

  const downloadLatex = () => {
    if (latexCode) {
      const blob = new Blob([latexCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${job?.company?.replace(/\s+/g, '_')}_${job?.title?.replace(/\s+/g, '_')}.tex`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('LaTeX file downloaded!');
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Render match score circle
  const renderMatchScore = () => {
    if (!match) return null;

    // Access denied - show upgrade prompt
    if (match.accessDenied) {
      return (
        <div className="card p-6 bg-gradient-to-br from-dark-800 to-dark-900 border-primary-500/30">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Match Analysis</h3>
            <p className="text-dark-400 text-sm mb-4">{match.message}</p>
            <Link
              to="/payment"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade to AI Plan
            </Link>
          </div>
        </div>
      );
    }

    // Resume required
    if (match.resumeRequired) {
      return (
        <div className="card p-6 bg-gradient-to-br from-dark-800 to-dark-900 border-blue-500/30">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Upload Resume</h3>
            <p className="text-dark-400 text-sm mb-4">{match.message}</p>
            <Link
              to="/profile"
              className="btn-primary inline-flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Go to Profile
            </Link>
          </div>
        </div>
      );
    }

    // Error state
    if (match.error) {
      return (
        <div className="card p-6 bg-dark-800 border-red-500/30">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
            <p className="text-dark-400">{match.message}</p>
          </div>
        </div>
      );
    }

    // Success - show match analysis
    const levelInfo = MATCH_LEVELS[match.level] || MATCH_LEVELS.PARTIAL_MATCH;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (match.score / 100) * circumference;

    return (
      <div className="card p-6 bg-gradient-to-br from-dark-800 to-dark-900">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-500" />
          Resume Match Analysis
        </h3>

        {/* Score Circle */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-dark-700"
              />
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={levelInfo.color}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{match.score}%</span>
              <span className="text-xs text-dark-400">Match</span>
            </div>
          </div>
        </div>

        {/* Match Level Badge */}
        <div className={`text-center mb-4 py-2 px-4 rounded-full ${levelInfo.bg} inline-flex items-center gap-2 mx-auto`}>
          <span>{levelInfo.emoji}</span>
          <span className={`font-semibold ${levelInfo.color}`}>{levelInfo.label}</span>
        </div>

        {/* Summary */}
        {match.summary && (
          <p className="text-dark-300 text-sm mb-4 text-center">{match.summary}</p>
        )}

        {/* Skills Matched */}
        {match.skillsMatched?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Skills You Have
            </h4>
            <div className="flex flex-wrap gap-2">
              {match.skillsMatched.map((skill, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills Missing */}
        {match.skillsMissing?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              Skills to Develop
            </h4>
            <div className="flex flex-wrap gap-2">
              {match.skillsMissing.map((skill, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {match.recommendations?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-400" />
              Recommendations
            </h4>
            <ul className="space-y-1">
              {match.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-dark-300 flex items-start gap-2">
                  <span className="text-primary-400 mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Full screen on mobile, large on desktop */}
      <div className="relative min-h-screen flex items-start justify-center p-0 sm:p-4 sm:pt-10">
        <div className="relative w-full sm:w-[95%] lg:w-[90%] xl:max-w-7xl bg-dark-900 sm:rounded-2xl shadow-2xl border-0 sm:border border-dark-700 min-h-screen sm:min-h-0 sm:max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Job Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-dark-400">{error}</p>
                <button
                  onClick={fetchJobDetails}
                  className="mt-4 btn-secondary"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Job Header */}
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{job.title}</h1>
                  <p className="text-lg text-primary-400 font-medium mb-4">{job.company}</p>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {job.location && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-700 text-dark-300 text-sm">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                    )}
                    {job.type && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-700 text-dark-300 text-sm">
                        <Briefcase className="w-4 h-4" />
                        {job.type.replace('_', ' ')}
                      </span>
                    )}
                    {job.experience && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-700 text-dark-300 text-sm">
                        <Clock className="w-4 h-4" />
                        {job.experience}
                      </span>
                    )}
                    {job.salary && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </span>
                    )}
                    {job.isRemote && (
                      <span className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                        🌐 Remote
                      </span>
                    )}
                    {job.isIndiaEligible && (
                      <span className="px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                        🇮🇳 India Eligible
                      </span>
                    )}
                  </div>

                    {/* Source */}
                  <p className="text-dark-500 text-sm">
                    Source: {job.source} • Posted {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>

                {/* Match Analysis - Full Width */}
                <div className="w-full">
                  {renderMatchScore()}
                </div>

                {/* Description */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Job Description</h3>
                  <div 
                    className="prose prose-invert prose-sm max-w-none text-dark-300 leading-relaxed
                      prose-p:my-3 prose-strong:text-white prose-ul:my-2 prose-li:my-1
                      prose-headings:text-white prose-headings:mt-4 prose-headings:mb-2"
                    dangerouslySetInnerHTML={{ 
                      __html: job.description || '<p>No description available. Click "Apply Now" to view full details on the company website.</p>' 
                    }}
                  />
                </div>

                {/* LaTeX Resume Generator - ULTIMATE only */}
                {user?.plan === 'ULTIMATE' && (
                  <div className="card p-6 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/30">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-emerald-400" />
                      Generate Tailored Resume
                    </h3>
                    <p className="text-dark-400 text-sm mb-4">
                      Create a LaTeX resume specifically tailored for this job posting.
                    </p>
                    
                    {!latexCode ? (
                      <button
                        onClick={handleGenerateLatex}
                        disabled={generatingLatex}
                        className="btn-primary bg-gradient-to-r from-emerald-500 to-teal-500 border-0 flex items-center gap-2"
                      >
                        {generatingLatex ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileCode className="w-4 h-4" />
                            Generate LaTeX Resume
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={copyLatexToClipboard}
                            className="btn-secondary flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Copy Code
                          </button>
                          <button
                            onClick={downloadLatex}
                            className="btn-primary bg-gradient-to-r from-emerald-500 to-teal-500 border-0 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download .tex
                          </button>
                        </div>
                        <div className="bg-dark-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                          <pre className="text-xs text-dark-300 font-mono whitespace-pre-wrap break-all">
                            {latexCode.substring(0, 500)}...
                          </pre>
                        </div>
                        <p className="text-xs text-dark-500">
                          💡 Compile this LaTeX code using Overleaf or any LaTeX editor
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Show LaTeX upgrade prompt for non-ULTIMATE users */}
                {user?.plan !== 'ULTIMATE' && match && !match.accessDenied && !match.resumeRequired && (
                  <div className="card p-4 bg-gradient-to-r from-emerald-900/10 to-teal-900/10 border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCode className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-white text-sm font-medium">Want a tailored LaTeX resume?</p>
                          <p className="text-dark-400 text-xs">Upgrade to Ultimate (₹50) for this feature</p>
                        </div>
                      </div>
                      <Link to="/payment" className="text-emerald-400 text-sm hover:underline">
                        Upgrade →
                      </Link>
                    </div>
                  </div>
                )}

                {/* AI Usage Info */}
                {aiUsage && (
                  <div className="text-center text-sm text-dark-500">
                    AI Matches: {aiUsage.isUnlimited ? '∞ Unlimited' : `${aiUsage.used}/${aiUsage.limit} used`}
                    {!aiUsage.isUnlimited && aiUsage.remaining <= 1 && aiUsage.remaining > 0 && (
                      <span className="text-yellow-400 ml-2">• {aiUsage.remaining} remaining</span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleApply}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Apply Now
                  </button>
                  <button
                    onClick={handleSaveToggle}
                    disabled={saving}
                    className={`btn-secondary flex items-center gap-2 ${isSaved ? 'text-primary-400 border-primary-500' : ''}`}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isSaved ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetailModal;
