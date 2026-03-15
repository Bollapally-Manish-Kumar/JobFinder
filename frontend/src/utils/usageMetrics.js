export const USAGE_STORAGE_KEYS = {
  aiMatches: 'usage_ai_matches',
  resumeBuilds: 'usage_resume_builds',
  trackedApps: 'usage_tracked_apps'
};

export const readUsageStats = () => ({
  aiMatches: Number(localStorage.getItem(USAGE_STORAGE_KEYS.aiMatches) || '0'),
  resumeBuilds: Number(localStorage.getItem(USAGE_STORAGE_KEYS.resumeBuilds) || '0'),
  trackedApps: Number(localStorage.getItem(USAGE_STORAGE_KEYS.trackedApps) || '0')
});

export const incrementUsageMetric = (metric) => {
  const storageKey = USAGE_STORAGE_KEYS[metric];
  if (!storageKey) return 0;

  const nextValue = Number(localStorage.getItem(storageKey) || '0') + 1;
  localStorage.setItem(storageKey, String(nextValue));
  window.dispatchEvent(new CustomEvent('goaxonai:usage-updated', {
    detail: {
      metric,
      value: nextValue,
      stats: readUsageStats()
    }
  }));

  return nextValue;
};