/**
 * SharedJob - Public job detail page for shared links
 * Accessible without login; Apply button requires auth
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Building2, Briefcase, ExternalLink, Coins,
  Clock, Share2, ArrowLeft, LogIn, Globe, Calendar,
  Sparkles, Flame, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../hooks/useAuthStore';
import SEO from '../components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'https://jobfinder-wog8.onrender.com/api';

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getFreshness(postedAt) {
  if (!postedAt) return null;
  const diff = (Date.now() - new Date(postedAt)) / (1000 * 60 * 60);
  const days = Math.floor(diff / 24);
  if (diff < 24) return { text: 'Posted today', color: 'text-emerald-400', icon: <Flame className="w-3.5 h-3.5" /> };
  if (days === 1) return { text: 'Posted yesterday', color: 'text-emerald-400', icon: <Sparkles className="w-3.5 h-3.5" /> };
  if (days <= 7) return { text: `Posted ${days}d ago`, color: 'text-amber-400', icon: <Clock className="w-3.5 h-3.5" /> };
  if (days <= 30) return { text: `Posted ${Math.ceil(days / 7)}w ago`, color: 'text-dark-400', icon: <Calendar className="w-3.5 h-3.5" /> };
  return null;
}

export default function SharedJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${API_URL}/jobs/${id}`);
        setJob(res.data.job || res.data);
      } catch {
        setError('This job is no longer available or could not be found.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    if (job?.url) {
      window.open(job.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/jobs/${id}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied to clipboard!'));
  };

  const freshness = job ? getFreshness(job.postedAt) : null;
  const cleanDesc = job ? stripHtml(job.description) : '';

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {job && (
        <SEO
          title={`${job.title} at ${job.company} | GoAxonAI`}
          description={cleanDesc.slice(0, 155)}
          canonical={`https://www.goaxonai.in/jobs/${id}`}
        />
      )}

      {/* Top nav bar */}
      <header className="border-b border-dark-800/60 bg-dark-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
              G
            </div>
            <span className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">
              GoAxonAI
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-primary-500/15 text-primary-400 hover:bg-primary-500/25 transition-all border border-primary-500/30"
              >
                Browse Jobs <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm px-3 py-1.5 rounded-lg text-dark-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-500 to-orange-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-dark-800 rounded-xl w-2/3" />
            <div className="h-5 bg-dark-800 rounded-xl w-1/3" />
            <div className="h-4 bg-dark-800 rounded-xl w-1/2 mt-2" />
            <div className="h-40 bg-dark-800 rounded-2xl mt-6" />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-dark-800 flex items-center justify-center">
              <Globe className="w-8 h-8 text-dark-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Job Not Found</h2>
            <p className="text-dark-400 mb-6">{error}</p>
            <Link
              to={isAuthenticated ? '/dashboard' : '/'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-orange-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              {isAuthenticated ? 'Back to Dashboard' : 'Go Home'}
            </Link>
          </div>
        )}

        {/* Job content */}
        {!loading && job && (
          <div className="space-y-6">

            {/* Job header card */}
            <div className="card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="badge badge-source text-[11px]">{job.source}</span>
                    {freshness && (
                      <span className={`flex items-center gap-1 text-xs font-medium ${freshness.color}`}>
                        {freshness.icon}
                        {freshness.text}
                      </span>
                    )}
                    {job.isRemote && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                        Remote
                      </span>
                    )}
                    {job.isIndiaEligible && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
                        India
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                    {job.title}
                  </h1>

                  <div className="flex items-center gap-2 text-primary-400 font-medium mb-4">
                    <div className="w-7 h-7 rounded-lg bg-primary-500/15 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-lg">{job.company}</span>
                  </div>

                  {/* Meta pills */}
                  <div className="flex flex-wrap gap-2">
                    {job.location && (
                      <div className="flex items-center gap-1.5 bg-dark-700/60 px-3 py-1.5 rounded-xl text-sm text-dark-300">
                        <MapPin className="w-4 h-4 text-dark-500" />
                        {job.location}
                      </div>
                    )}
                    {job.experience && (
                      <div className="flex items-center gap-1.5 bg-dark-700/60 px-3 py-1.5 rounded-xl text-sm text-dark-300">
                        <Briefcase className="w-4 h-4 text-dark-500" />
                        {job.experience}
                      </div>
                    )}
                    {job.salary && (
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl text-sm text-emerald-400 font-medium">
                        <Coins className="w-4 h-4" />
                        {job.salary}
                      </div>
                    )}
                    {job.jobType && (
                      <div className="flex items-center gap-1.5 bg-dark-700/60 px-3 py-1.5 rounded-xl text-sm text-dark-300">
                        <Clock className="w-4 h-4 text-dark-500" />
                        {job.jobType}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-dark-700/50">
                <button
                  onClick={handleApply}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary-500/20 text-sm sm:text-base"
                >
                  {isAuthenticated ? (
                    <>Apply Now <ExternalLink className="w-4 h-4" /></>
                  ) : (
                    <>Sign in to Apply <LogIn className="w-4 h-4" /></>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-dark-700/60 text-dark-300 hover:bg-dark-700 hover:text-white border border-dark-600/50 hover:border-primary-500/30 transition-all text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>

              {/* Login prompt for guests */}
              {!isAuthenticated && (
                <div className="mt-4 p-4 rounded-xl bg-primary-500/8 border border-primary-500/20 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-dark-300">
                      <span className="text-white font-medium">Create a free account</span> to apply, track applications, and get AI-powered resume match scores.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      to="/login"
                      state={{ from: { pathname: `/jobs/${id}` } }}
                      className="text-sm px-4 py-2 rounded-lg border border-dark-600 text-dark-300 hover:text-white hover:border-dark-500 transition-all"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-orange-500 text-white font-medium hover:opacity-90 transition-opacity"
                    >
                      Sign up free
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {job.description && (
              <div className="card p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-white mb-4">Job Description</h2>
                {/* If plain text */}
                {!job.description.includes('<') ? (
                  <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                ) : (
                  /* Safe HTML rendering — stripping all tags and showing clean text */
                  <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-line">
                    {cleanDesc}
                  </p>
                )}
              </div>
            )}

            {/* Skills tags if available */}
            {job.tags && job.tags.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Skills & Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="card p-6 sm:p-8 bg-gradient-to-br from-primary-500/10 via-dark-850 to-orange-500/8 border-primary-500/20">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 text-primary-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Powered by GoAxonAI
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Find your perfect job with AI</h3>
                <p className="text-dark-400 text-sm mb-5">
                  Get AI resume match scores, auto-apply with AxonApply, and discover hundreds of curated jobs daily.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity text-sm"
                  >
                    Get started free
                  </Link>
                  <Link
                    to={isAuthenticated ? '/dashboard' : '/'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-dark-700/60 text-dark-300 hover:text-white border border-dark-600/50 hover:border-primary-500/30 transition-all text-sm"
                  >
                    Browse all jobs
                  </Link>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800/60 mt-12 py-6 text-center text-xs text-dark-500">
        <Link to="/" className="text-primary-400 hover:text-primary-300 transition-colors">goaxonai.in</Link>
        {' · '}AI-Powered Job Search Platform
      </footer>
    </div>
  );
}
