/**
 * SharedJob - Public job detail page for shared links
 * Design matches Home.jsx exactly
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Building2, Briefcase, ExternalLink, Coins,
  Clock, Share2, LogIn, Globe, Calendar, ArrowLeft,
  Sparkles, Flame, ChevronRight, CheckCircle,
  Zap, Target, Brain, FileText, ArrowRight,
  Shield, Star, Users, Rocket
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../hooks/useAuthStore';
import Navbar from '../components/Navbar';
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
  if (diff < 24) return { text: 'Posted today', color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: <Flame className="w-3.5 h-3.5" /> };
  if (days === 1) return { text: 'Posted yesterday', color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: <Sparkles className="w-3.5 h-3.5" /> };
  if (days <= 7) return { text: `Posted ${days}d ago`, color: 'text-amber-400', bg: 'bg-amber-500/15', icon: <Clock className="w-3.5 h-3.5" /> };
  if (days <= 30) return { text: `Posted ${Math.ceil(days / 7)}w ago`, color: 'text-dark-400', bg: 'bg-dark-700/50', icon: <Calendar className="w-3.5 h-3.5" /> };
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
    if (job?.url) window.open(job.url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    const url = `${window.location.origin}/jobs/${id}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied to clipboard!'));
  };

  const freshness = job ? getFreshness(job.postedAt) : null;
  const cleanDesc = job ? stripHtml(job.description) : '';

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      {job && (
        <SEO
          title={`${job.title} at ${job.company} | GoAxonAI`}
          description={cleanDesc.slice(0, 155)}
          canonical={`https://www.goaxonai.in/jobs/${id}`}
        />
      )}

      <Navbar />

      {/* ── Hero Background (same as Home) ── */}
      <div className="relative pt-24 pb-8 sm:pt-28 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-900/95 to-purple-900/20" />
          {/* Orbs */}
          <div className="absolute top-10 -left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary-500/25 rounded-full blur-[90px] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-56 h-56 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-[110px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-full blur-3xl" />
          {/* Particles */}
          <div className="particle w-2 h-2 bg-primary-500/40 top-[20%] left-[10%]" style={{ animationDelay: '0s' }} />
          <div className="particle w-3 h-3 bg-purple-500/35 top-[30%] right-[15%]" style={{ animationDelay: '2s' }} />
          <div className="particle w-2 h-2 bg-pink-500/40 bottom-[20%] left-[20%]" style={{ animationDelay: '4s' }} />
          <div className="particle w-2 h-2 bg-orange-500/30 top-[15%] right-[30%]" style={{ animationDelay: '5s' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* ── Job Content ── */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">

          {/* Loading skeleton */}
          {loading && (
            <div className="animate-pulse space-y-5">
              <div className="h-5 bg-dark-800/80 rounded-full w-24" />
              <div className="h-10 bg-dark-800/80 rounded-2xl w-3/4" />
              <div className="h-6 bg-dark-800/80 rounded-2xl w-1/3" />
              <div className="flex gap-2 mt-2">
                <div className="h-8 bg-dark-800/80 rounded-xl w-28" />
                <div className="h-8 bg-dark-800/80 rounded-xl w-24" />
              </div>
              <div className="h-14 bg-dark-800/80 rounded-2xl" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-800/80 backdrop-blur-xl flex items-center justify-center border border-dark-700/50">
                <Globe className="w-10 h-10 text-dark-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Job Not Found</h2>
              <p className="text-dark-400 mb-8">{error}</p>
              <Link
                to={isAuthenticated ? '/dashboard' : '/'}
                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 hover:scale-[1.02] transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                {isAuthenticated ? 'Back to Dashboard' : 'Go Home'}
              </Link>
            </div>
          )}

          {/* ── Main Job Card ── */}
          {!loading && job && (
            <>
              {/* Source + freshness badges */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="badge badge-source text-[11px] uppercase tracking-wider">{job.source}</span>
                {freshness && (
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${freshness.bg} ${freshness.color}`}>
                    {freshness.icon}{freshness.text}
                  </span>
                )}
                {job.isRemote && (
                  <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/25">
                    <Globe className="w-3 h-3" /> Remote
                  </span>
                )}
                {job.isIndiaEligible && (
                  <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/25">
                    <MapPin className="w-3 h-3" /> India
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.1] mb-4">
                {job.title}
              </h1>

              {/* Company */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/25 to-orange-500/25 flex items-center justify-center flex-shrink-0 border border-primary-500/25">
                  <Building2 className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-primary-400">{job.company}</p>
                  {job.location && (
                    <p className="text-xs text-dark-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{job.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {job.experience && (
                  <div className="flex items-center gap-1.5 bg-dark-800/60 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm text-dark-300 border border-dark-700/60">
                    <Briefcase className="w-3.5 h-3.5 text-dark-500" />{job.experience}
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl text-sm text-emerald-400 font-semibold border border-emerald-500/20">
                    <Coins className="w-3.5 h-3.5" />{job.salary}
                  </div>
                )}
                {job.jobType && (
                  <div className="flex items-center gap-1.5 bg-dark-800/60 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm text-dark-300 border border-dark-700/60">
                    <Clock className="w-3.5 h-3.5 text-dark-500" />{job.jobType}
                  </div>
                )}
              </div>

              {/* CTA Buttons — same style as Home hero */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                <button
                  onClick={handleApply}
                  className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl font-semibold text-white overflow-hidden transition-all hover:shadow-lg hover:shadow-primary-500/25 hover:scale-[1.02] flex items-center justify-center gap-2 text-base"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isAuthenticated ? (
                      <>Apply Now <ExternalLink className="w-5 h-5" /></>
                    ) : (
                      <>Sign in to Apply <LogIn className="w-5 h-5" /></>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={handleShare}
                  className="px-6 py-4 rounded-xl font-semibold text-white border border-dark-700 hover:border-dark-600 hover:bg-dark-800/50 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Job
                </button>
              </div>

              {/* Guest prompt — styled like Home's feature callout */}
              {!isAuthenticated && (
                <div className="group relative mb-2">
                  <div className="absolute -inset-[0.5px] bg-gradient-to-r from-primary-500/50 to-orange-500/50 rounded-2xl blur-sm" />
                  <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-5 border border-primary-500/30 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Create a free account to apply</p>
                        <p className="text-dark-400 text-xs mt-0.5">AI resume match &bull; Application tracker &bull; Auto-apply with AxonApply</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        to="/login"
                        state={{ from: { pathname: `/jobs/${id}` } }}
                        className="px-4 py-2 rounded-xl font-semibold text-white border border-dark-700 hover:border-dark-600 hover:bg-dark-800/50 transition-all text-sm"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        className="group/btn relative px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl font-semibold text-white overflow-hidden transition-all hover:shadow-lg hover:shadow-primary-500/25 hover:scale-[1.02] text-sm flex items-center gap-1.5"
                      >
                        Sign up free <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Job Details Sections ── */}
      {!loading && job && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 space-y-5">
          {/* Description */}
          {job.description && (
            <div className="group relative">
              <div className="absolute -inset-[0.5px] bg-gradient-to-r from-dark-700 to-dark-600 rounded-2xl opacity-60" />
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-dark-700/50">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-gradient-to-b from-primary-500 to-orange-500" />
                  Job Description
                </h2>
                <p className="text-dark-300 text-sm leading-7 whitespace-pre-line">{cleanDesc}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="group relative">
              <div className="absolute -inset-[0.5px] bg-gradient-to-r from-primary-500/20 to-orange-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-dark-700/50 group-hover:border-primary-500/30 transition-all duration-300">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
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
            </div>
          )}
        </div>
      )}

      {/* ── Features Section (Home-style) ── */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-800/30 via-dark-900 to-dark-900" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 font-medium text-xs sm:text-sm tracking-wider uppercase mb-4">
              <Sparkles className="w-4 h-4" />
              Why GoAxonAI
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-2">
              More Than Just <span className="animate-gradient-text">Job Listings</span>
            </h2>
            <p className="text-dark-400 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
              We don't just show jobs. We help you land them.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {/* AxonSearch */}
            <div className="group relative perspective-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-orange-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500" />
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-dark-700/50 group-hover:border-primary-500/50 transition-all duration-500 h-full group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary-500/20">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-primary-500/30">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">AxonSearch™</h3>
                <p className="text-dark-400 text-sm leading-relaxed">AI-powered job aggregation from 50+ sources. One dashboard, all jobs.</p>
                <div className="mt-5 flex items-center gap-2 text-primary-400 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live now
                </div>
              </div>
            </div>

            {/* AxonMatch */}
            <div className="group relative perspective-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500" />
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-dark-700/50 group-hover:border-purple-500/50 transition-all duration-500 h-full group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-purple-500/20">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-purple-500/30">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">AxonMatch™</h3>
                <p className="text-dark-400 text-sm leading-relaxed">AI resume-to-JD match scores. Know exactly which jobs fit you before applying.</p>
                <div className="mt-5 flex items-center gap-2 text-purple-400 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  AI Powered
                </div>
              </div>
            </div>

            {/* AxonApply */}
            <div className="group relative perspective-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-all duration-500 animate-pulse" />
              <div className="relative bg-gradient-to-br from-orange-500/10 to-yellow-500/10 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/40 group-hover:border-orange-400 transition-all duration-500 h-full group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-orange-500/25">
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full text-black text-[10px] font-bold">MAIN</div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-orange-500/30">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">AxonApply™</h3>
                <p className="text-dark-400 text-sm leading-relaxed">AI-assisted application agent. Fills forms & uploads resumes — you stay in control.</p>
                <div className="mt-5 flex items-center gap-2 text-orange-400 text-xs font-medium">
                  <Shield className="w-3.5 h-3.5" />
                  You always submit
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section (identical style to Home) ── */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-primary-500/10 to-purple-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[200px] sm:h-[400px] bg-orange-500/10 rounded-full blur-[100px] sm:blur-[150px]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Find. Match. Apply.
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
              All with AI.
            </span>
          </h2>
          <p className="text-sm sm:text-lg text-dark-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            GoAxonAI helps you <strong className="text-white">find, match, and apply</strong> to jobs using AI — without spam or fake profiles.
            <br className="hidden sm:block" />
            <span className="text-green-400">Applications submitted only with your action.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 hover:scale-[1.02] transition-all text-sm sm:text-base"
            >
              Explore Jobs Free
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border border-dark-600 rounded-xl font-semibold text-white hover:bg-dark-800/50 transition-all text-sm sm:text-base"
            >
              Log in
            </Link>
          </div>
          <p className="text-dark-500 text-xs sm:text-sm mt-3 sm:mt-4">No credit card required</p>
        </div>
      </section>

      {/* ── Footer (same as Home) ── */}
      <footer className="py-10 sm:py-14 border-t border-dark-800 bg-dark-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img src="/logo.png" alt="GoAxonAI" className="w-8 h-8" />
                <span className="text-lg font-bold text-white">GoAxon<span className="text-orange-500">AI</span></span>
              </div>
              <p className="text-dark-400 text-sm">Your AI Brain for Job Hunting.</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link to="/" className="text-dark-400 hover:text-orange-400 transition-colors">Home</Link>
              <Link to="/register" className="text-dark-400 hover:text-orange-400 transition-colors">Sign Up Free</Link>
              <Link to="/ai-match" className="text-dark-400 hover:text-orange-400 transition-colors">AxonMatch™</Link>
              <Link to="/resume-builder" className="text-dark-400 hover:text-orange-400 transition-colors">AxonResume™</Link>
              <Link to="/disclaimer" className="text-dark-400 hover:text-orange-400 transition-colors">Disclaimer</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-dark-500 text-xs">© 2026 GoAxonAI. All rights reserved.</p>
            <p className="text-dark-600 text-xs flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-green-400" />
              Applications submitted only with your explicit action.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

