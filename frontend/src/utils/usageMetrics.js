export const USAGE_STORAGE_KEYS = {
  aiMatches: 'usage_ai_matches',
  resumeBuilds: 'usage_resume_builds',
  trackedApps: 'usage_tracked_apps'
};

const toSafeCount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

export const readUsageStats = () => {
  if (typeof window === 'undefined') {
    return { aiMatches: 0, resumeBuilds: 0, trackedApps: 0 };
  }

  try {
    return {
      aiMatches: toSafeCount(localStorage.getItem(USAGE_STORAGE_KEYS.aiMatches) || '0'),
      resumeBuilds: toSafeCount(localStorage.getItem(USAGE_STORAGE_KEYS.resumeBuilds) || '0'),
      trackedApps: toSafeCount(localStorage.getItem(USAGE_STORAGE_KEYS.trackedApps) || '0')
    };
  } catch {
    return { aiMatches: 0, resumeBuilds: 0, trackedApps: 0 };
  }
};

export const incrementUsageMetric = (metric) => {
  const storageKey = USAGE_STORAGE_KEYS[metric];
  if (!storageKey) return 0;

  if (typeof window === 'undefined') return 0;

  try {
    const nextValue = toSafeCount(localStorage.getItem(storageKey) || '0') + 1;
    localStorage.setItem(storageKey, String(nextValue));
    window.dispatchEvent(new CustomEvent('goaxonai:usage-updated', {
      detail: {
        metric,
        value: nextValue,
        stats: readUsageStats()
      }
    }));

    return nextValue;
  } catch {
    return 0;
  }
};