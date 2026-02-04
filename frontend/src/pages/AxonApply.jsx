/**
 * AxonApply™ - AI-Assisted Job Application Agent
 * Main feature page for GoAxonAI
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Shield,
  Brain,
  FileText,
  CheckCircle,
  XCircle,
  Chrome,
  ArrowRight,
  Upload,
  Settings,
  MousePointer,
  Eye,
  Clock,
  Target,
  Sparkles,
  AlertTriangle,
  Lock,
  Building,
  MapPin,
  Briefcase,
  ChevronRight,
  Play,
  Star
} from 'lucide-react';
import useAuthStore from '../hooks/useAuthStore';
import SEO from '../components/SEO';

function AxonApply() {
  const { user, token, refreshUser } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('not_connected');
  const [lastConnectedAt, setLastConnectedAt] = useState(null);

  // Refresh user data on mount to get latest profile fields
  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, []);

  // Check if user has access (Ultimate plan or above)
  const hasAccess = user?.role === 'ADMIN' || (user?.paymentVerified && user?.plan === 'ULTIMATE');

  const steps = [
    {
      icon: Upload,
      title: 'Upload Resumes',
      description: 'Add multiple resume versions for different job types'
    },
    {
      icon: Chrome,
      title: 'Install Extension',
      description: 'Add AxonApply™ Chrome extension to your browser'
    },
    {
      icon: Settings,
      title: 'Set Preferences',
      description: 'Define role, location, salary expectations'
    },
    {
      icon: MousePointer,
      title: 'Click Apply',
      description: 'Agent fills forms, you review and submit'
    }
  ];

  const features = [
    {
      icon: Brain,
      title: 'Resume Intelligence',
      description: 'Auto-selects the best resume for each job description',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Question Intelligence',
      description: 'Detects experience, notice period, eligibility questions and auto-fills',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Skip Logic',
      description: 'Skips paid posts, referral-only jobs, scams automatically',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      title: 'Apply History',
      description: 'Track every application: company, role, resume used, date',
      color: 'from-orange-500 to-yellow-500'
    }
  ];

  const allowed = [
    'Fill application forms with your data',
    'Upload your resume / CV automatically',
    'Answer common questions from your profile',
    'Choose resume version per job type',
    'Skip irrelevant or low-quality jobs',
    'Track all applied jobs in one place'
  ];

  const notAllowed = [
    'Break captchas or bypass security',
    'Apply silently in background',
    'Store your login credentials',
    'Fake answers or impersonate',
    'Spam applications to every job'
  ];

  const platforms = [
    { name: 'Company Career Pages', status: 'full', icon: Building },
    { name: 'Greenhouse', status: 'full', icon: Building },
    { name: 'Lever', status: 'full', icon: Building },
    { name: 'Workable', status: 'full', icon: Building },
    { name: 'Indeed', status: 'partial', icon: Briefcase },
    { name: 'Naukri', status: 'partial', icon: Briefcase },
    { name: 'LinkedIn', status: 'assist', icon: Briefcase }
  ];

  const connectExtension = () => {
    if (!user || !token) return;

    // Parse name into first/last
    const nameParts = (user.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const payload = {
      authToken: token,
      profile: {
        fullName: user.name || '',
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
        // Location fields (if available in user object)
        city: user.city || user.location || '',
        country: user.country || 'India',
        // Work details (if available)
        experienceYears: user.experienceYears ?? undefined,
        currentCompany: user.currentCompany || '',
        currentTitle: user.headline || user.currentTitle || '',
        // Links (if available)
        linkedin: user.linkedin || '',
        portfolio: user.portfolio || user.github || ''
      },
      resume: null,
      preferences: {
        roles: user.preferredRoles || [],
        locations: user.preferredLocations || []
      }
    };

    console.log('[AxonApply] Sending profile to extension:', payload.profile);
    window.postMessage({ type: 'AXONAPPLY_CONNECT', payload }, window.location.origin);
  };

  useEffect(() => {
    const handler = (event) => {
      if (event?.data?.type === 'AXONAPPLY_CONNECTED_ACK') {
        setConnectionStatus('connected');
        setLastConnectedAt(new Date());
      }
      // Handle extension errors (e.g., context invalidated)
      if (event?.data?.type === 'AXONAPPLY_ERROR') {
        setConnectionStatus('error');
        console.error('[AxonApply] Extension error:', event.data.error);
        alert(event.data.error || 'Extension error. Please refresh the page.');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (connectionStatus === 'not_connected') {
      setConnectionStatus('reconnect_required');
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-dark-900">
      <SEO
        title="AxonApply™ - AI-Assisted Job Application Agent | GoAxonAI"
        description="Fill job applications faster with AxonApply™. AI agent that fills forms, uploads resumes, and answers questions — with you in control. Legal, safe, and smart."
        keywords="AxonApply, AI job application, auto fill job forms, job application assistant, GoAxonAI, smart apply"
        url="https://www.goaxonai.in/axon-apply"
      />

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-semibold text-sm">Main Feature</span>
              <span className="px-2 py-0.5 bg-orange-500 text-black text-xs font-bold rounded-full">NEW</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
              AxonApply<span className="text-orange-500">™</span>
            </h1>
            <p className="text-xl md:text-2xl text-dark-300 max-w-3xl mx-auto">
              AI-Assisted Job Application Agent
            </p>
            <p className="text-lg text-orange-400 mt-2 font-medium">
              Fills applications <span className="text-white">with you</span> — faster, safer, smarter.
            </p>
          </div>

          {/* Value Prop */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 rounded-full border border-dark-700">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-dark-300 text-sm">Legal & Safe</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 rounded-full border border-dark-700">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-dark-300 text-sm">10x Faster</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 rounded-full border border-dark-700">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-dark-300 text-sm">You Stay in Control</span>
            </div>
          </div>

          {/* CTA */}
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02] transition-all"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-dark-600 rounded-xl font-semibold text-white hover:bg-dark-800/50 transition-all"
              >
                <Play className="w-5 h-5" />
                Login
              </Link>
            </div>
          ) : hasAccess ? (
            <div className="flex flex-col items-center gap-4">
              <Link
                to="/axonapply/install"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02] transition-all"
              >
                <Chrome className="w-5 h-5" />
                Install AxonApply™ Extension
              </Link>
              <button
                onClick={connectExtension}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-dark-800/70 border border-dark-700 rounded-xl font-semibold text-white hover:bg-dark-800 transition-all"
              >
                <Sparkles className="w-5 h-5 text-orange-400" />
                Connect Extension
              </button>
              <div className="text-xs text-dark-400">
                Status:{' '}
                {connectionStatus === 'connected' && (
                  <span className="text-green-400">Connected</span>
                )}
                {connectionStatus === 'reconnect_required' && (
                  <span className="text-yellow-400">Reconnect required</span>
                )}
                {connectionStatus === 'not_connected' && (
                  <span className="text-yellow-400">Not connected</span>
                )}
                {lastConnectedAt && (
                  <span className="ml-2">• Last: {lastConnectedAt.toLocaleTimeString()}</span>
                )}
              </div>
              <p className="text-green-400 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                You have Ultimate access
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Link
                to="/payment"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02] transition-all"
              >
                <Lock className="w-5 h-5" />
                Upgrade to Ultimate – ₹50/mo
              </Link>
              <p className="text-dark-400 text-sm">
                AxonApply™ is available in the Ultimate plan
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-dark-800/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How AxonApply™ Works</h2>
            <p className="text-dark-400">Simple 4-step process. You stay in control.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-2xl border transition-all cursor-pointer ${
                  activeStep === index
                    ? 'bg-orange-500/10 border-orange-500/50'
                    : 'bg-dark-800/50 border-dark-700 hover:border-orange-500/30'
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <step.icon className={`w-10 h-10 mb-4 ${activeStep === index ? 'text-orange-400' : 'text-dark-400'}`} />
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-dark-400 text-sm">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Final Submit Note */}
          <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 max-w-2xl mx-auto">
            <Shield className="w-6 h-6 text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm">
              <strong>You click the final Submit button.</strong> This keeps you legally compliant and in full control.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Smart Advantages</h2>
            <p className="text-dark-400">More than just form filling — it's intelligent.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-dark-800/50 rounded-2xl p-6 border border-dark-700 hover:border-dark-600 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-dark-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do / Don't Do */}
      <section className="py-16 bg-dark-800/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Safe & Transparent</h2>
            <p className="text-dark-400">We believe in ethical automation. Here's exactly what AxonApply™ does.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Allowed */}
            <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">What AxonApply™ Does</h3>
              </div>
              <ul className="space-y-3">
                {allowed.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-dark-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Allowed */}
            <div className="bg-red-500/5 rounded-2xl p-6 border border-red-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">What We Never Do</h3>
              </div>
              <ul className="space-y-3">
                {notAllowed.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-dark-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Support */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Platform Support</h2>
            <p className="text-dark-400">Works where you apply most</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className="bg-dark-800/50 rounded-xl p-4 border border-dark-700 text-center"
              >
                <platform.icon className="w-8 h-8 mx-auto mb-2 text-dark-400" />
                <p className="text-white font-medium text-sm mb-1">{platform.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  platform.status === 'full'
                    ? 'bg-green-500/20 text-green-400'
                    : platform.status === 'partial'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {platform.status === 'full' ? 'Full Support' : platform.status === 'partial' ? 'Partial' : 'Assist Mode'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extension Install Section */}
      <section id="install-extension" className="py-16 bg-dark-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 mb-6">
            <Chrome className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Get the Chrome Extension</h2>
          <p className="text-dark-400 mb-8 max-w-xl mx-auto">
            AxonApply™ works via a Chrome extension that runs in your browser, using your own login sessions. Safe, private, and under your control.
          </p>
          <p className="text-dark-500 text-sm mb-6">
            Download the AxonApply™ extension ZIP and use Chrome Developer Mode → Load Unpacked. No servers or code setup required. See the
            {' '}
            <a href="/axonapply/install" className="text-orange-400 hover:text-orange-300 underline">install guide</a>.
          </p>

          {hasAccess ? (
            <div className="space-y-4">
              <Link
                to="/axonapply/install"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02] transition-all"
              >
                <Chrome className="w-5 h-5" />
                Install via Developer Mode
              </Link>
              <p className="text-dark-500 text-sm">No Chrome Web Store required</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Link
                to={user ? "/payment" : "/register"}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02] transition-all"
              >
                <Star className="w-5 h-5" />
                {user ? 'Upgrade to Ultimate' : 'Get Started'}
              </Link>
              <p className="text-dark-500 text-sm">AxonApply™ requires Ultimate plan (₹50/mo)</p>
            </div>
          )}
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-8 border-t border-dark-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-dark-500 text-sm">
            <Shield className="w-4 h-4 inline mr-2" />
            GoAxonAI provides AI-assisted application tools. Applications are submitted <strong className="text-dark-400">only with explicit user action</strong>.
          </p>
        </div>
      </section>
    </div>
  );
}

export default AxonApply;
