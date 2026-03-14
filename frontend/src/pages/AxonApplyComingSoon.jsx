/**
 * AxonApply™ Coming Soon Page
 */

import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Sparkles, Shield, MousePointer, Clock, CheckCircle, Chrome, FileText, Brain } from 'lucide-react';
import SEO from '../components/SEO';

const features = [
  {
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    glow: 'rgba(168,85,247,0.25)',
    title: 'AI Form Filler',
    desc: 'AI reads the job form and fills every field using your profile — in seconds.',
  },
  {
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59,130,246,0.25)',
    title: 'Resume Tailoring',
    desc: 'Auto-selects and formats your best resume version to match each job.',
  },
  {
    icon: MousePointer,
    color: 'from-orange-500 to-yellow-500',
    glow: 'rgba(249,115,22,0.25)',
    title: 'You Stay in Control',
    desc: 'Every application is reviewed and submitted by you — never auto-sent.',
  },
  {
    icon: Shield,
    color: 'from-green-500 to-emerald-500',
    glow: 'rgba(34,197,94,0.25)',
    title: 'Safe & Compliant',
    desc: 'Works with platform ToS. No fake profiles, no spam.',
  },
];

const steps = [
  { num: '01', text: 'Install the AxonApply Chrome Extension' },
  { num: '02', text: 'Open any job listing on LinkedIn, Naukri, or Indeed' },
  { num: '03', text: 'Click "AxonApply" — AI fills the form instantly' },
  { num: '04', text: 'Review, tweak, and submit with one click' },
];

function AxonApplyComingSoon() {
  return (
    <div className="min-h-screen bg-[#0F1115] relative overflow-hidden">
      <SEO
        title="AxonApply™ - AI Job Application Agent | Coming Soon"
        description="AxonApply™ is an AI-assisted job application agent that fills forms, uploads resumes, and answers questions — with you in full control. Coming soon to GoAxonAI."
        keywords="AI job application, auto apply jobs, job application automation, AxonApply, GoAxonAI"
        url="https://www.goaxonai.in/axon-apply"
      />

      {/* Background glow orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-orange-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-purple-500/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-20">

        {/* Back link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors text-sm mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Hero */}
        <div className="text-center mb-14">
          {/* Icon */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl blur-3xl opacity-40 animate-pulse scale-150" />
            <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-2xl shadow-orange-500/40">
              <Zap className="w-10 h-10 md:w-14 md:h-14 text-white" />
            </div>
            <div className="absolute -top-3 -right-3 px-2.5 py-1 bg-[#0F1115] border border-orange-500/60 rounded-full text-orange-400 text-[11px] font-bold tracking-wider animate-pulse">
              COMING SOON
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-3 tracking-tight">
            AxonApply<span className="text-orange-500">™</span>
          </h1>
          <p className="text-lg md:text-2xl font-medium mb-6">
            <span className="animate-gradient-text">Your AI Job Application Agent</span>
          </p>
          <p className="text-dark-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Fills job forms in seconds using your profile, tailors your resume for each role, and lets <span className="text-white font-semibold">you review before submitting</span> — always.
          </p>

          {/* Status pill */}
          <div className="inline-flex items-center gap-2.5 mt-8 px-5 py-2.5 bg-dark-800/80 border border-orange-500/30 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
            </span>
            <span className="text-dark-300 text-sm">In active development — launching soon</span>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group relative bg-dark-800/50 border border-dark-700/60 rounded-2xl p-5 hover:border-dark-600 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${f.glow} 0%, transparent 70%)` }}
                />
                <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="relative text-white font-bold text-base mb-1.5">{f.title}</h3>
                <p className="relative text-dark-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* How it will work */}
        <div className="bg-dark-800/40 border border-dark-700/50 rounded-3xl p-6 md:p-8 mb-14">
          <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            How AxonApply™ Works
          </h2>
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <span className="text-orange-400 font-bold text-sm">{s.num}</span>
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-dark-200 text-sm md:text-base">{s.text}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute left-[1.25rem] mt-12 w-px h-4 bg-dark-700 hidden" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chrome Extension teaser */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-orange-500/10 via-yellow-500/5 to-transparent border border-orange-500/20 rounded-2xl p-5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
            <Chrome className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-white font-semibold text-sm md:text-base">Chrome Extension Available (Beta)</p>
            <p className="text-dark-400 text-xs md:text-sm mt-0.5">Install now and be first to access when AxonApply™ goes live.</p>
          </div>
          <Link
            to="/axonapply/install"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-black text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02] transition-all"
          >
            <Chrome className="w-4 h-4" />
            Install Extension
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3 text-sm text-dark-400">
          {['No auto-submit', 'GDPR Safe', 'No fake profiles', 'You control every click'].map((badge) => (
            <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-800/60 border border-dark-700 rounded-full">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              {badge}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}

export default AxonApplyComingSoon;
