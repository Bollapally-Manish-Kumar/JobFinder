/**
 * Job Classification Utilities
 * Detects job type and category from title/description
 * Used by all API-based scrapers for consistent classification
 */

// Job type constants
export const JOB_TYPES = {
  INTERNSHIP: 'INTERNSHIP',
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT'
};

// Job category constants
export const JOB_CATEGORIES = {
  SOFTWARE: 'SOFTWARE',
  DATA: 'DATA',
  AI_ML: 'AI_ML',
  NON_TECH: 'NON_TECH'
};

/**
 * Detect job type from title and description
 * @param {string} title - Job title
 * @param {string} description - Job description (optional)
 * @returns {string} Job type enum value
 */
export function detectJobType(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();

  // Check for internship indicators
  if (
    text.includes('intern') ||
    text.includes('internship') ||
    text.includes('trainee') ||
    text.includes('apprentice') ||
    text.includes('graduate trainee')
  ) {
    return JOB_TYPES.INTERNSHIP;
  }

  // Check for part-time indicators
  if (
    text.includes('part-time') ||
    text.includes('part time') ||
    text.includes('parttime') ||
    text.includes('half-time')
  ) {
    return JOB_TYPES.PART_TIME;
  }

  // Check for contract indicators
  if (
    text.includes('contract') ||
    text.includes('freelance') ||
    text.includes('temporary') ||
    text.includes('consultant')
  ) {
    return JOB_TYPES.CONTRACT;
  }

  // Default to full-time
  return JOB_TYPES.FULL_TIME;
}

/**
 * Detect job category from title and description
 * @param {string} title - Job title
 * @param {string} description - Job description (optional)
 * @returns {string} Job category enum value
 */
export function detectJobCategory(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();

  // AI/ML keywords (check first - more specific)
  if (
    text.includes('machine learning') ||
    text.includes('deep learning') ||
    text.includes('artificial intelligence') ||
    text.includes(' ai ') ||
    text.includes(' ml ') ||
    text.includes('nlp') ||
    text.includes('computer vision') ||
    text.includes('neural network') ||
    text.includes('tensorflow') ||
    text.includes('pytorch')
  ) {
    return JOB_CATEGORIES.AI_ML;
  }

  // Data keywords
  if (
    text.includes('data scientist') ||
    text.includes('data engineer') ||
    text.includes('data analyst') ||
    text.includes('big data') ||
    text.includes('analytics') ||
    text.includes('business intelligence') ||
    text.includes('etl') ||
    text.includes('data warehouse') ||
    text.includes('sql') ||
    text.includes('tableau') ||
    text.includes('power bi')
  ) {
    return JOB_CATEGORIES.DATA;
  }

  // Software/Tech keywords
  if (
    text.includes('software') ||
    text.includes('developer') ||
    text.includes('engineer') ||
    text.includes('programmer') ||
    text.includes('frontend') ||
    text.includes('backend') ||
    text.includes('full stack') ||
    text.includes('fullstack') ||
    text.includes('devops') ||
    text.includes('cloud') ||
    text.includes('java') ||
    text.includes('python') ||
    text.includes('javascript') ||
    text.includes('react') ||
    text.includes('node') ||
    text.includes('aws') ||
    text.includes('azure') ||
    text.includes('kubernetes') ||
    text.includes('docker') ||
    text.includes('api') ||
    text.includes('web') ||
    text.includes('mobile') ||
    text.includes('ios') ||
    text.includes('android') ||
    text.includes('qa') ||
    text.includes('test') ||
    text.includes('sdet') ||
    text.includes('automation')
  ) {
    return JOB_CATEGORIES.SOFTWARE;
  }

  // Default to non-tech
  return JOB_CATEGORIES.NON_TECH;
}

/**
 * Detect if job is India eligible
 * @param {string} location - Job location
 * @param {string} description - Job description
 * @param {boolean} isRemote - Is remote job
 * @returns {boolean} Is India eligible
 */
export function detectIndiaEligibility(location = '', description = '', isRemote = false) {
  // Remote jobs are India eligible
  if (isRemote) return true;
  
  const text = `${location} ${description}`.toLowerCase();
  
  // Check for India indicators
  if (
    text.includes('india') ||
    text.includes('bangalore') ||
    text.includes('bengaluru') ||
    text.includes('mumbai') ||
    text.includes('delhi') ||
    text.includes('hyderabad') ||
    text.includes('chennai') ||
    text.includes('pune') ||
    text.includes('kolkata') ||
    text.includes('noida') ||
    text.includes('gurgaon') ||
    text.includes('gurugram') ||
    text.includes('asia') ||
    text.includes('apac') ||
    text.includes('worldwide') ||
    text.includes('global') ||
    text.includes('anywhere')
  ) {
    return true;
  }
  
  return false;
}

/**
 * Detect if job is remote
 * @param {string} location - Job location
 * @param {string} description - Job description
 * @param {object} rawJob - Raw job data (may have remote flag)
 * @returns {boolean} Is remote job
 */
export function detectRemote(location = '', description = '', rawJob = {}) {
  // Check explicit remote flag
  if (rawJob.remote === true) return true;
  
  const text = `${location} ${description}`.toLowerCase();
  
  return (
    text.includes('remote') ||
    text.includes('work from home') ||
    text.includes('wfh') ||
    text.includes('anywhere') ||
    text.includes('distributed')
  );
}

/**
 * Normalize job data to consistent schema
 * @param {object} rawJob - Raw job data from API
 * @param {string} source - Source name (Adzuna, Arbeitnow, etc.)
 * @returns {object} Normalized job object
 */
export function normalizeJob(rawJob, source) {
  const isRemote = detectRemote(rawJob.location || '', rawJob.description || '', rawJob);
  const isIndiaEligible = detectIndiaEligibility(rawJob.location || '', rawJob.description || '', isRemote);
  
  return {
    title: rawJob.title?.trim() || 'Untitled Position',
    company: rawJob.company?.trim() || 'Unknown Company',
    location: rawJob.location?.trim() || 'Not Specified',
    experience: rawJob.experience || null,
    salary: rawJob.salary || null,
    description: rawJob.description?.substring(0, 2000) || null,
    source,
    url: rawJob.url,
    verified: true,
    type: detectJobType(rawJob.title || '', rawJob.description || ''),
    category: detectJobCategory(rawJob.title || '', rawJob.description || ''),
    isIndiaEligible,
    isRemote,
    postedAt: rawJob.postedAt ? new Date(rawJob.postedAt) : new Date()
  };
}
