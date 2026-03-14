import { useState } from 'react';
import { X, Sparkles, User, MapPin, Briefcase, Target, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 1, title: 'Career Goal', icon: Target },
  { id: 2, title: 'Experience', icon: Briefcase },
  { id: 3, title: 'Preferences', icon: MapPin },
  { id: 4, title: 'Finish', icon: CheckCircle2 },
];

function OnboardingWizard({ userName, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState({
    targetRole: '',
    experienceLevel: 'FRESHER',
    preferredLocation: '',
    workMode: 'HYBRID',
    targetSalary: '',
  });

  const stepPct = (currentStep / steps.length) * 100;

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));

  const goNext = () => {
    if (currentStep < steps.length) setCurrentStep((s) => s + 1);
  };

  const goPrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const finish = () => {
    onComplete?.(data);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-dark-700/70 bg-[#0F1115] shadow-2xl shadow-black/40 overflow-hidden">
        <div className="relative px-6 md:px-8 pt-6 pb-4 border-b border-dark-800/70">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/70 transition-colors"
            aria-label="Close onboarding"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Setup
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Welcome, {userName || 'there'}!</h2>
          <p className="text-dark-300 mt-1">Let us personalize your job feed in under 30 seconds.</p>

          <div className="mt-4 h-2 bg-dark-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-orange-500 transition-all duration-300" style={{ width: `${stepPct}%` }} />
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {steps.map((step) => {
              const Icon = step.icon;
              const active = step.id <= currentStep;
              return (
                <div key={step.id} className={`flex items-center gap-1.5 ${active ? 'text-primary-300' : 'text-dark-500'}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate sm:inline">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 md:px-8 py-6 min-h-[280px]">
          {currentStep === 1 && (
            <div>
              <label className="text-sm text-dark-300 mb-2 block">What role are you targeting?</label>
              <input
                value={data.targetRole}
                onChange={(e) => update({ targetRole: e.target.value })}
                placeholder="Ex: Frontend Developer, Data Analyst"
                className="input"
              />
              <p className="text-xs text-dark-500 mt-2">This helps rank better jobs first.</p>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <label className="text-sm text-dark-300 mb-2 block">Your experience level</label>
              <div className="grid sm:grid-cols-3 gap-2">
                {['FRESHER', 'MID', 'SENIOR'].map((level) => (
                  <button
                    key={level}
                    onClick={() => update({ experienceLevel: level })}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all ${data.experienceLevel === level
                      ? 'border-primary-500/60 bg-primary-500/15 text-primary-300'
                      : 'border-dark-700 bg-dark-800/60 text-dark-300 hover:text-white hover:border-dark-600'
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-dark-300 mb-2 block">Preferred Location</label>
                <input
                  value={data.preferredLocation}
                  onChange={(e) => update({ preferredLocation: e.target.value })}
                  placeholder="Ex: Bengaluru, Remote"
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm text-dark-300 mb-2 block">Work Mode</label>
                <select
                  value={data.workMode}
                  onChange={(e) => update({ workMode: e.target.value })}
                  className="input"
                >
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ONSITE">Onsite</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm text-dark-300 mb-2 block">Target Salary (optional)</label>
                <input
                  value={data.targetSalary}
                  onChange={(e) => update({ targetSalary: e.target.value })}
                  placeholder="Ex: 8 LPA / 12 LPA"
                  className="input"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-primary-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
                <User className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Setup Complete</h3>
              <p className="text-dark-300 max-w-md mx-auto leading-relaxed">
                Your dashboard is now personalized. You can edit these preferences later from Profile.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 md:px-8 py-4 border-t border-dark-800/70 flex items-center justify-between bg-dark-900/40">
          <button
            onClick={goPrev}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dark-700 text-dark-300 hover:text-white hover:bg-dark-800/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-orange-500 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={finish}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              Start Exploring
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingWizard;
