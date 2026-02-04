/**
 * AxonApply™ Coming Soon Page
 */

import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Bell, Sparkles, Shield, MousePointer, Clock } from 'lucide-react';
import SEO from '../components/SEO';

function AxonApplyComingSoon() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <SEO
        title="AxonApply™ Coming Soon | GoAxonAI"
        description="AxonApply™ - AI-assisted job application agent. Coming soon to GoAxonAI."
      />

      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl blur-2xl opacity-30 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 px-3 py-1 bg-dark-800 border border-orange-500/50 rounded-full text-orange-400 text-xs font-bold">
            SOON
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          AxonApply™
        </h1>
        <p className="text-xl md:text-2xl text-orange-400 font-semibold mb-6">
          Coming Soon
        </p>

        {/* Description */}
        <p className="text-dark-300 text-lg mb-8 max-w-lg mx-auto">
          AI-assisted job application agent that fills forms, uploads resumes, and answers questions — <span className="text-white font-medium">with you in full control</span>.
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
            <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-dark-300">Legal & Safe</p>
          </div>
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
            <MousePointer className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-dark-300">You Review & Submit</p>
          </div>
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
            <Sparkles className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-dark-300">AI-Powered</p>
          </div>
        </div>

        {/* Status */}
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-dark-800/80 border border-dark-700 rounded-full mb-8">
          <Clock className="w-5 h-5 text-orange-400 animate-pulse" />
          <span className="text-dark-300">We're building something amazing</span>
        </div>

        {/* Back Button */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white hover:bg-dark-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AxonApplyComingSoon;
