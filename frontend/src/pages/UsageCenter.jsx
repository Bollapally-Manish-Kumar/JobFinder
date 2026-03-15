import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, BarChart3, Sparkles, HelpCircle, Send, Bot, UserCircle2 } from 'lucide-react';
import useAuthStore from '../hooks/useAuthStore';
import SEO from '../components/SEO';
import { readUsageStats } from '../utils/usageMetrics';

function UsageCenter() {
  const { user } = useAuthStore();
  const [openFaq, setOpenFaq] = useState(-1);
  const [usageStats, setUsageStats] = useState(() => readUsageStats());
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: 'Hi! I am Axon Assistant. Ask me about usage limits, plans, AxonMatch, AxonResume, or application tracking.',
    },
  ]);

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

  const suggestionPrompts = [
    'What does Unlimited mean?',
    'How do I increase limits?',
    'Does AxonApply auto-submit?',
    'Where is my application tracker?',
  ];

  const getBotReply = (rawQuestion) => {
    const question = String(rawQuestion || '').toLowerCase();

    if (question.includes('unlimited')) {
      return 'Unlimited means there is no hard cap. Your bar is only a lightweight activity indicator, not a consumption limit.';
    }

    if (question.includes('increase') || question.includes('upgrade') || question.includes('limit') || question.includes('plan')) {
      return 'You can increase your limits by upgrading your plan. Open Billing or Plan settings from your dashboard to compare plans and switch instantly.';
    }

    if (question.includes('auto-submit') || question.includes('autosubmit') || question.includes('submit')) {
      return 'AxonApply does not auto-submit. It helps fill details, but the final submit action is always yours.';
    }

    if (question.includes('tracker') || question.includes('application') || question.includes('my applications')) {
      return 'Go to My Applications to track each job across Applied, Interview, Offer, and Rejected stages.';
    }

    if (question.includes('resume') || question.includes('latex')) {
      return 'AxonResume helps build tailored resumes. If you are on an eligible plan, you can also generate a LaTeX version for clean formatting.';
    }

    if (question.includes('match') || question.includes('score')) {
      return 'AxonMatch compares your profile and resume with the job and returns a fit score plus actionable improvement suggestions.';
    }

    if (question.includes('privacy') || question.includes('safe') || question.includes('data')) {
      return 'Your usage counters and guidance tools are designed to support your workflow. For account-specific support, contact the support option in your dashboard.';
    }

    return 'I can help with plans, limits, AxonApply safety, AxonMatch, AxonResume, and tracking. Try asking one of the quick prompts below.';
  };

  const sendChatMessage = (messageText) => {
    const text = String(messageText || '').trim();
    if (!text) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text,
    };

    const botMessage = {
      id: Date.now() + 1,
      role: 'bot',
      text: getBotReply(text),
    };

    setChatMessages((prev) => [...prev, userMessage, botMessage]);
    setChatInput('');
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    sendChatMessage(chatInput);
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

          <div className="mt-5 rounded-xl border border-dark-700 bg-dark-900/40 overflow-hidden">
            <div className="px-3 py-2 border-b border-dark-700 flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary-400" />
              <p className="text-sm text-white font-medium">Usage Assistant Chat</p>
            </div>

            <div className="max-h-56 overflow-y-auto px-3 py-2 space-y-2">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && <Bot className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />}

                  <div
                    className={`max-w-[85%] rounded-xl px-2.5 py-2 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-500/20 border border-primary-500/40 text-primary-100'
                        : 'bg-dark-800 border border-dark-700 text-dark-300'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.role === 'user' && <UserCircle2 className="w-4 h-4 text-primary-300 mt-0.5 shrink-0" />}
                </div>
              ))}
            </div>

            <div className="px-3 pb-2">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {suggestionPrompts.map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    onClick={() => sendChatMessage(prompt)}
                    className="text-[11px] px-2 py-1 rounded-md border border-dark-700 bg-dark-800 text-dark-300 hover:text-white hover:border-dark-600 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask your doubt..."
                  className="w-full rounded-lg border border-dark-700 bg-dark-800 px-3 py-2 text-xs text-white placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg border border-primary-500/40 bg-primary-500/20 p-2 text-primary-200 hover:bg-primary-500/30 transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
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
