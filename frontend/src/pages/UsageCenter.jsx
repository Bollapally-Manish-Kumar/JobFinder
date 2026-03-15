import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, BarChart3, Sparkles, HelpCircle } from 'lucide-react';
import useAuthStore from '../hooks/useAuthStore';
import SEO from '../components/SEO';
import { readUsageStats } from '../utils/usageMetrics';

function UsageCenter() {
  const { user } = useAuthStore();
  const [openFaq, setOpenFaq] = useState(-1);
  const [usageStats, setUsageStats] = useState(() => readUsageStats());

  const planLimits = {
    BASIC: { aiMatches: 0, resumeBuilds: 0, trackedApps: 100 },
    BASIC_PLUS: { aiMatches: 0, resumeBuilds: 25, trackedApps: 300 },
    AI: { aiMatches: 200, resumeBuilds: 25, trackedApps: 500 },
    PRO_PLUS: { aiMatches: 500, resumeBuilds: 60, trackedApps: 1000 },
    ULTIMATE: { aiMatches: 'Unlimited', resumeBuilds: 'Unlimited', trackedApps: 'Unlimited' },
    ADMIN: { aiMatches: 'Unlimited', resumeBuilds: 'Unlimited', trackedApps: 'Unlimited' },
  };

  const effectivePlan = user?.role === 'ADMIN' ? 'ADMIN' : (user?.plan || 'BASIC');
  const currentPlanLimits = planLimits[effectivePlan] || planLimits.BASIC;

  useEffect(() => {
    const syncUsageStats = () => setUsageStats(readUsageStats());

    syncUsageStats();
    window.addEventListener('focus', syncUsageStats);
    window.addEventListener('storage', syncUsageStats);
    window.addEventListener('goaxonai:usage-updated', syncUsageStats);

    return () => {
      window.removeEventListener('focus', syncUsageStats);
      window.removeEventListener('storage', syncUsageStats);
      window.removeEventListener('goaxonai:usage-updated', syncUsageStats);
    };
  }, []);

  const faqItems = [
    {
      q: 'Will AxonApply auto-submit applications?',
      a: 'No. GoAxonAI only assists with filling. Submission always requires your explicit click.',
    },
    {
      q: 'Can I use AxonMatch with non-technical resumes?',
      a: 'Yes. It works for technical and non-technical roles, but better resume detail gives better matching quality.',
    },
    {
      q: 'Where do I track applications end-to-end?',
      a: 'Use My Applications to move each job across Applied, Interview, Offer, and Rejected stages.',
    },
  ];

  const getUsagePercent = (value, limit) => {
    if (limit === 'Unlimited') {
      // Unlimited plans should not appear as fully consumed.
      return value > 0 ? 25 : 0;
    }
    if (!limit || limit <= 0) return 0;
    return Math.min(100, Math.round((value / limit) * 100));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <SEO
        title="Usage & Trust Center | GoAxonAI"
        description="View your feature usage, plan limits, and quick answers to common GoAxonAI questions."
        noIndex={true}
      />

      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <BadgeCheck className="w-7 h-7 text-primary-400" />
          Usage & Trust Center
        </h1>
        <p className="text-dark-400 mt-1">Track your feature usage and get quick answers without leaving your workflow.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5 border border-dark-700/70">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-base md:text-lg inline-flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-400" />
              Plan Usage Snapshot
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300">
              {effectivePlan}
            </span>
          </div>

          <div className="space-y-4">
            {[
              { key: 'aiMatches', label: 'AI Match Analyses', value: usageStats.aiMatches },
              { key: 'resumeBuilds', label: 'Resume Generations', value: usageStats.resumeBuilds },
              { key: 'trackedApps', label: 'Tracked Applications', value: usageStats.trackedApps },
            ].map((item) => {
              const limit = currentPlanLimits[item.key];
              const pct = getUsagePercent(item.value, limit);

              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="text-dark-300">{item.label}</span>
                    <span className="text-dark-400">
                      {limit === 'Unlimited' ? `${item.value} / Unlimited` : `${item.value} / ${limit}`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-orange-500 transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-dark-500 mt-4">
            Usage counters update as you use features from AxonMatch, AxonResume, and My Applications.
          </p>

          <button
            onClick={() => setUsageStats(readUsageStats())}
            className="mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            Refresh usage
          </button>
        </div>

        <div className="card p-5 border border-dark-700/70">
          <h3 className="text-white font-semibold mb-3 inline-flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary-400" />
            Trust & Quick Help
          </h3>
          <div className="space-y-2">
            {faqItems.map((item, idx) => (
              <button
                key={item.q}
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full text-left rounded-xl border border-dark-700 bg-dark-800/40 px-3 py-2.5 hover:border-dark-600 transition-colors"
              >
                <p className="text-sm text-white">{item.q}</p>
                {openFaq === idx && <p className="text-xs text-dark-400 mt-1.5 leading-relaxed">{item.a}</p>}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Link to="/ai-match" className="px-2.5 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-dark-300 hover:text-white">Open AxonMatch</Link>
            <Link to="/resume-builder" className="px-2.5 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-dark-300 hover:text-white">Open AxonResume</Link>
            <Link to="/my-applications" className="px-2.5 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-dark-300 hover:text-white">Open Tracker</Link>
          </div>

          <div className="mt-5 p-3 rounded-xl border border-dark-700 bg-dark-800/40 text-xs text-dark-400 leading-relaxed">
            <p className="inline-flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              Safety reminder
            </p>
            <p>GoAxonAI never sends an application without your final action.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsageCenter;
