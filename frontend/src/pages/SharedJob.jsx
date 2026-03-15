/**
 * SharedJob - Public job detail page for shared links
 * Accessible without login; Apply button requires auth
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Building2, Briefcase, ExternalLink, Coins,
  Clock, Share2, ArrowLeft, LogIn, Globe, Calendar,
  Sparkles, Flame, ChevronRight, CheckCircle2, Zap
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
      <header className="border-b border-dark-800/60 bg-dark-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="GoAxonAI"
              className="w-8 h-8 rounded-xl group-hover:scale-105 transition-transform duration-200"
            />
            <span className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors tracking-tight">
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
            <div className="h-10 bg-dark-800 rounded-xl w-3/4" />
            <div className="h-5 bg-dark-800 rounded-xl w-1/3" />
            <div className="flex gap-2 mt-3">
              <div className="h-8 bg-dark-800 rounded-xl w-28" />
              <div className="h-8 bg-dark-800 rounded-xl w-24" />
              <div className="h-8 bg-dark-800 rounded-xl w-20" />
            </div>
            <div className="h-14 bg-dark-800 rounded-2xl mt-4" />
            <div className="h-48 bg-dark-800 rounded-2xl mt-4" />
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
          <div className="space-y-5">

            {/* Hero job header card */}
            <div className="relative overflow-hidden rounded-2xl border border-dark-700/60 bg-dark-900">
              {/* Decorative blobs */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />

              <div className="relative p-6 sm:p-8">
                {/* Top badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="badge badge-source text-[11px] uppercase tracking-wider">{job.source}</span>
                  {freshness && (
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-dark-800 ${freshness.color}`}>
                      {freshness.icon}
                      {freshness.text}
                    </span>
                  )}
                  {job.isRemote && (
                    <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500/12 text-blue-400 border border-blue-500/25">
                      <Globe className="w-3 h-3" /> Remote
                    </span>
                  )}
                  {job.isIndiaEligible && (
                    <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-500/12 text-orange-400 border border-orange-500/25">
                      <MapPin className="w-3 h-3" /> India
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight tracking-tight">
                  {job.title}
                </h1>

                {/* Company row */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0 border border-primary-500/20">
                    <Building2 className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-primary-400">{job.company}</p>
                    {job.location && (
                      <p className="text-xs text-dark-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{job.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.experience && (
                    <div className="flex items-center gap-1.5 bg-dark-800/80 px-3 py-1.5 rounded-xl text-sm text-dark-300 border border-dark-700/60">
                      <Briefcase className="w-3.5 h-3.5 text-dark-500" />
                      {job.experience}
                    </div>
                  )}
                  {job.salary && (
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl text-sm text-emerald-400 font-semibold border border-emerald-500/20">
                      <Coins className="w-3.5 h-3.5" />
                      {job.salary}
                    </div>
                  )}
                  {job.jobType && (
                    <div className="flex items-center gap-1.5 bg-dark-800/80 px-3 py-1.5 rounded-xl text-sm text-dark-300 border border-dark-700/60">
                      <Clock className="w-3.5 h-3.5 text-dark-500" />
                      {job.jobType}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-dark-700/50">
                  <button
                    onClick={handleApply}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-orange-500 text-white font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary-500/25 text-sm sm:text-base"
                  >
                    {isAuthenticated ? (
                      <>Apply Now <ExternalLink className="w-4 h-4" /></>
                    ) : (
                      <>Sign in to Apply <LogIn className="w-4 h-4" /></>
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-dark-800/80 text-dark-300 hover:bg-dark-700 hover:text-white border border-dark-700/60 hover:border-primary-500/30 transition-all text-sm font-medium"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Login prompt for guests */}
            {!isAuthenticated && (
              <div className="rounded-2xl border border-primary-500/25 bg-gradient-to-r from-primary-500/8 to-orange-500/6 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-primary-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-4 h-4 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-0.5">Sign in to apply & track this job</p>
                      <p className="text-xs text-dark-400">Free account • AI resume match • Auto-apply with AxonApply</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      to="/login"
                      state={{ from: { pathname: `/jobs/${id}` } }}
                      className="text-sm px-4 py-2 rounded-lg border border-dark-600 text-dark-300 hover:text-white hover:border-dark-500 transition-all font-medium"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="text-sm px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-md shadow-primary-500/20"
                    >
                      Sign up free
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {job.description && (
              <div className="rounded-2xl border border-dark-700/60 bg-dark-900 p-6 sm:p-8">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-gradient-to-b from-primary-500 to-orange-500 inline-block" />
                  Job Description
                </h2>
                <p className="text-dark-300 text-sm leading-7 whitespace-pre-line">
                  {cleanDesc}
                </p>
              </div>
            )}

            {/* Skills tags if available */}
            {job.tags && job.tags.length > 0 && (
              <div className="rounded-2xl border border-dark-700/60 bg-dark-900 p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-gradient-to-b from-primary-500 to-orange-500 inline-block" />
                  Skills & Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20 text-sm font-medium hover:bg-primary-500/15 transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="relative overflow-hidden rounded-2xl border border-primary-500/25 bg-dark-900 p-6 sm:p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/12 via-transparent to-orange-500/8 pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative text-center">
                <div className="flex items-center justify-center mb-4">
                  <img src="/logo.png" alt="GoAxonAI" className="w-12 h-12 rounded-2xl shadow-lg shadow-primary-500/20" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 text-primary-400 text-xs font-bold uppercase tracking-wider mb-3 border border-primary-500/20">
                  <Sparkles className="w-3 h-3" />
                  Powered by GoAxonAI
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">Find your perfect job with AI</h3>
                <p className="text-dark-400 text-sm mb-2 max-w-sm mx-auto">
                  Discover hundreds of curated jobs daily. Get AI resume match, auto-apply, and more.
                </p>
                {/* Feature bullets */}
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mb-6 text-xs text-dark-400">
                  {['AI Resume Match', 'Auto-Apply', 'Application Tracker', 'Free Plan Available'].map(f => (
                    <span key={f} className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />{f}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-orange-500 text-white font-bold hover:opacity-90 transition-opacity text-sm shadow-lg shadow-primary-500/25"
                  >
                    Get started free <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={isAuthenticated ? '/dashboard' : '/'}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-dark-800/80 text-dark-300 hover:text-white border border-dark-700/60 hover:border-primary-500/30 transition-all text-sm font-medium"
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
      <footer className="border-t border-dark-800/60 mt-12 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="GoAxonAI" className="w-6 h-6 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs font-semibold text-dark-500 group-hover:text-dark-300 transition-colors">GoAxonAI</span>
          </Link>
          <p className="text-xs text-dark-600">AI-Powered Job Search Platform &middot; <Link to="/disclaimer" className="hover:text-dark-400 transition-colors">Disclaimer</Link></p>
        </div>
      </footer>
    </div>
  );
}
