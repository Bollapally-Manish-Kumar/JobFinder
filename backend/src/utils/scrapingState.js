const scrapingState = {
  isRunning: false,
  status: 'idle',
  triggerSource: null,
  startedAt: null,
  finishedAt: null,
  lastSucceededAt: null,
  lastFailedAt: null,
  lastError: null,
  lastResult: null,
  currentRunId: 0
};

export const getScrapingState = () => ({ ...scrapingState });

export async function runTrackedScrapers(runAllScrapers, triggerSource = 'manual') {
  if (scrapingState.isRunning) {
    return {
      started: false,
      reason: 'already-running',
      state: getScrapingState()
    };
  }

  scrapingState.isRunning = true;
  scrapingState.status = 'running';
  scrapingState.triggerSource = triggerSource;
  scrapingState.startedAt = new Date().toISOString();
  scrapingState.finishedAt = null;
  scrapingState.lastError = null;
  scrapingState.lastResult = null;
  scrapingState.currentRunId += 1;

  const runId = scrapingState.currentRunId;

  try {
    const result = await runAllScrapers();
    scrapingState.status = 'succeeded';
    scrapingState.lastSucceededAt = new Date().toISOString();
    scrapingState.lastResult = {
      totalFound: result?.totalFound || 0,
      totalSaved: result?.totalSaved || 0,
      results: result?.results || []
    };

    return {
      started: true,
      runId,
      state: getScrapingState(),
      result
    };
  } catch (error) {
    scrapingState.status = 'failed';
    scrapingState.lastFailedAt = new Date().toISOString();
    scrapingState.lastError = error?.message || 'Unknown scraping error';
    throw error;
  } finally {
    scrapingState.isRunning = false;
    scrapingState.finishedAt = new Date().toISOString();
  }
}