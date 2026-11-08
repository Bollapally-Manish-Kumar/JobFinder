/**
 * Job Match Controller
 * Handles job detail views with AI-powered resume matching
 * Usage limits: BASIC=1, BASIC_PLUS=3, AI=5, PRO_PLUS=6, ULTIMATE=Unlimited
 */

import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { generateCompletion, GROQ_LATEX_MODEL, GROQ_MODEL } from '../utils/groqClient.js';

// Plan hierarchy and AI match limits
const PLAN_CONFIG = {
  BASIC: { level: 0, aiMatchLimit: 1, name: 'Free Trial' },
  BASIC_PLUS: { level: 1, aiMatchLimit: 3, name: 'Basic Plus' },
  AI: { level: 2, aiMatchLimit: 5, name: 'AI Pro' },
  PRO_PLUS: { level: 3, aiMatchLimit: 6, name: 'Pro Plus' },
  ULTIMATE: { level: 4, aiMatchLimit: Infinity, name: 'Ultimate' }
};

/**
 * Check if user can use AI Match (has remaining uses)
 */
const getAIUsageStatus = (user) => {
  const planConfig = PLAN_CONFIG[user.plan] || PLAN_CONFIG.BASIC;
  const used = user.aiMatchCount || 0;
  const limit = planConfig.aiMatchLimit;
  const remaining = Math.max(0, limit - used);
  
  return {
    canUse: remaining > 0 || limit === Infinity,
    used,
    limit,
    remaining: limit === Infinity ? 'Unlimited' : remaining,
    isUnlimited: limit === Infinity,
    planName: planConfig.name
  };
};

/**
 * Increment AI match usage count
 */
const incrementAIUsage = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { aiMatchCount: { increment: 1 } }
  });
};

/**
 * Get job details with resume match analysis
 * GET /api/jobs/:id/details
 */
export const getJobDetails = asyncHandler(async (req, res) => {
  const { id: jobId } = req.params;
  const userId = req.user.id;

  // Fetch job
  const job = await prisma.job.findUnique({
    where: { id: jobId }
  });

  if (!job) {
    return res.status(404).json({
      error: 'Job not found',
      message: 'This job listing may have been removed.'
    });
  }

  // Fetch user with resume and usage info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      plan: true,
      paymentVerified: true,
      resumeText: true,
      resumeUploadedAt: true,
      aiMatchCount: true
    }
  });

  // Check if user saved this job
  const savedJob = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: { userId, jobId }
    }
  });

  // Check if user applied to this job
  const application = await prisma.jobApplication.findUnique({
    where: {
      userId_jobId: { userId, jobId }
    }
  });

  // Get AI usage status
  const usageStatus = getAIUsageStatus(user);

  // Build base response
  const response = {
    success: true,
    job: {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      experience: job.experience,
      salary: job.salary,
      description: job.description,
      type: job.type,
      category: job.category,
      isRemote: job.isRemote,
      isIndiaEligible: job.isIndiaEligible,
      source: job.source,
      url: job.url,
      postedAt: job.postedAt,
      createdAt: job.createdAt
    },
    userStatus: {
      isSaved: !!savedJob,
      applicationStatus: application?.status || null,
      appliedAt: application?.appliedAt || null
    },
    aiUsage: usageStatus,
    match: null
  };

  // Check if user can use AI Match
  if (!usageStatus.canUse) {
    response.match = {
      accessDenied: true,
      message: `You've used all ${usageStatus.limit} AI matches for your ${usageStatus.planName} plan. Upgrade to get more!`,
      usedAll: true,
      upgradeRequired: true
    };
    return res.json(response);
  }

  // Check if resume is uploaded
  if (!user.resumeText) {
    response.match = {
      resumeRequired: true,
      message: 'Upload your resume in Profile to see match analysis'
    };
    return res.json(response);
  }

  // Perform AI Match Analysis and increment usage
  try {
    console.log(`[JobMatch] Analyzing match for job ${jobId} and user ${userId}`);
    console.log(`[JobMatch] User plan: ${user.plan}, Used: ${usageStatus.used}/${usageStatus.limit}`);
    
    const matchResult = await analyzeJobMatch(user.resumeText, job);
    
    // Increment usage count (only after successful analysis)
    await incrementAIUsage(userId);
    
    // Update usage in response
    response.aiUsage.used = usageStatus.used + 1;
    response.aiUsage.remaining = usageStatus.isUnlimited ? 'Unlimited' : usageStatus.remaining - 1;
    
    response.match = matchResult;
    
    console.log(`[JobMatch] ✅ Match score: ${matchResult.score}%`);
  } catch (error) {
    console.error('[JobMatch] AI analysis failed:', error);
    response.match = {
      error: true,
      message: 'Could not analyze match. Please try again later.'
    };
  }

  res.json(response);
});

/**
 * Analyze job match using Groq AI
 */
async function analyzeJobMatch(resumeText, job) {
  const jobInfo = `
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Type: ${job.type || 'Not specified'}
Experience: ${job.experience || 'Not specified'}
Description: ${job.description || 'No description available'}
  `.trim();

  const prompt = `You are an expert HR recruiter and resume analyzer. Analyze how well this candidate's resume matches the job posting.

=== JOB POSTING ===
${jobInfo}

=== CANDIDATE RESUME ===
${resumeText.substring(0, 4000)}

=== ANALYSIS TASK ===
Provide a detailed match analysis. Return ONLY valid JSON with this exact structure (no markdown, no explanation):

{
  "score": <number 0-100>,
  "level": "<PERFECT_MATCH|STRONG_MATCH|GOOD_MATCH|PARTIAL_MATCH|WEAK_MATCH>",
  "summary": "<2-3 sentence summary of the match>",
  "skillsMatched": ["<skill1>", "<skill2>", "<skill3>"],
  "skillsMissing": ["<skill1>", "<skill2>"],
  "experienceMatch": "<EXCEEDS|MEETS|BELOW>",
  "recommendations": ["<tip1>", "<tip2>"]
}

SCORING GUIDE:
- 90-100: PERFECT_MATCH - Exceptional fit, exceeds requirements
- 75-89: STRONG_MATCH - Very good fit, meets most requirements  
- 60-74: GOOD_MATCH - Decent fit, meets core requirements
- 40-59: PARTIAL_MATCH - Some relevant skills but gaps exist
- 0-39: WEAK_MATCH - Significant skill gaps

Be objective and helpful. Focus on technical skills, experience level, and job requirements.`;

  const responseText = await generateCompletion(prompt, {
    temperature: 0.3,  // Low temperature for consistent output
    max_tokens: 1024
  });

  // Parse the JSON response
  try {
    // Clean up any markdown artifacts
    let cleanJson = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const result = JSON.parse(cleanJson);
    
    // Validate and normalize the response
    return {
      score: Math.min(100, Math.max(0, parseInt(result.score) || 50)),
      level: result.level || getMatchLevel(result.score),
      summary: result.summary || 'Match analysis completed.',
      skillsMatched: Array.isArray(result.skillsMatched) ? result.skillsMatched.slice(0, 10) : [],
      skillsMissing: Array.isArray(result.skillsMissing) ? result.skillsMissing.slice(0, 5) : [],
      experienceMatch: result.experienceMatch || 'MEETS',
      recommendations: Array.isArray(result.recommendations) ? result.recommendations.slice(0, 3) : []
    };
  } catch (parseError) {
    console.error('[JobMatch] Failed to parse AI response:', parseError);
    
    // Fallback response
    return {
      score: 50,
      level: 'PARTIAL_MATCH',
      summary: 'We analyzed your resume against this job posting.',
      skillsMatched: [],
      skillsMissing: [],
      experienceMatch: 'MEETS',
      recommendations: ['Update your resume to highlight relevant skills for this role.']
    };
  }
}

/**
 * Get match level from score
 */
function getMatchLevel(score) {
  if (score >= 90) return 'PERFECT_MATCH';
  if (score >= 75) return 'STRONG_MATCH';
  if (score >= 60) return 'GOOD_MATCH';
  if (score >= 40) return 'PARTIAL_MATCH';
  return 'WEAK_MATCH';
}

/**
 * Quick match check (without full analysis)
 * GET /api/jobs/:id/quick-match
 */
export const getQuickMatch = asyncHandler(async (req, res) => {
  const { id: jobId } = req.params;
  const userId = req.user.id;

  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      paymentVerified: true,
      resumeText: true,
      aiMatchCount: true
    }
  });

  // Get usage status
  const usageStatus = getAIUsageStatus(user);

  // Quick checks
  if (!usageStatus.canUse) {
    return res.json({
      available: false,
      reason: 'limit_reached',
      aiUsage: usageStatus
    });
  }

  if (!user.resumeText) {
    return res.json({
      available: false,
      reason: 'resume_required'
    });
  }

  // Job exists check
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true }
  });

  if (!job) {
    return res.json({
      available: false,
      reason: 'job_not_found'
    });
  }

  res.json({
    available: true,
    reason: null,
    aiUsage: usageStatus
  });
});

/**
 * Generate LaTeX resume tailored for a specific job
 * POST /api/jobs/:id/generate-latex-resume
 * Only available for ULTIMATE plan users
 */
export const generateLatexResume = asyncHandler(async (req, res) => {
  const { id: jobId } = req.params;
  const userId = req.user.id;

  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      plan: true,
      paymentVerified: true,
      resumeText: true,
      name: true,
      email: true
    }
  });

  // Check ULTIMATE plan
  if (user.plan !== 'ULTIMATE') {
    return res.status(403).json({
      error: 'Ultimate plan required',
      message: 'LaTeX resume generation is only available for Ultimate plan (₹50) users.',
      requiredPlan: 'ULTIMATE'
    });
  }

  // Check resume
  if (!user.resumeText) {
    return res.status(400).json({
      error: 'Resume required',
      message: 'Please upload your resume first in the Profile section.'
    });
  }

  // Fetch job
  const job = await prisma.job.findUnique({
    where: { id: jobId }
  });

  if (!job) {
    return res.status(404).json({
      error: 'Job not found'
    });
  }

  try {
    console.log(`[LaTeX] Generating tailored resume for job ${jobId}`);
    console.log(`[LaTeX] Resume text length: ${user.resumeText.length} characters`);

    const prompt = `You are an expert resume writer specializing in ATS-optimized resumes.

TASK: Create an ATS-friendly LaTeX resume for the candidate, tailored for the target job.

=== TARGET JOB ===
Position: ${job.title}
Company: ${job.company}
Location: ${job.location}
Type: ${job.type || 'Full-time'}

Job Description:
${job.description || 'Not provided'}

=== CANDIDATE'S ACTUAL RESUME DATA ===
${user.resumeText}

=== CANDIDATE EMAIL ===
${user.email}

Use only facts in the resume; do not invent or alter candidate details. Retain the candidate's name and available contact details, every distinct role, project, degree and certification, all relevant skills, and existing metrics. Condense wording, not important achievements. Tailor a brief summary and prioritize supported job keywords naturally. Omit only information absent from the source.

Return a complete compilable, single-column ATS-friendly article document (article class; geometry, fontenc, enumitem, and hidelinks hyperref only). Use clear sections, compact spacing, no custom classes or external assets, and no more than two pages. Escape LaTeX special characters in source text: backslash, {, }, $, &, %, #, _, ^, and ~. Output only LaTeX starting with \\documentclass and ending with \\end{document}; no markdown or explanation.`;

    const latexCode = await generateCompletion(prompt, {
      model: GROQ_LATEX_MODEL,
      maxCompletionTokens: 900,
      reasoningEffort: 'low',
      reasoningFormat: 'hidden',
      maxRetries: 0,
      temperature: 0.6
    });

    console.log('[LaTeX] raw length:', latexCode?.length || 0);

    // Clean the response (remove markdown code blocks if present)
    let cleanedLatex = String(latexCode || '')
      .replace(/```latex\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Ensure it starts with \documentclass
    if (!cleanedLatex.startsWith('\\documentclass')) {
      const docStart = cleanedLatex.indexOf('\\documentclass');
      if (docStart !== -1) {
        cleanedLatex = cleanedLatex.substring(docStart);
      }
    }

    if (
      !cleanedLatex.startsWith('\\documentclass')
      || !cleanedLatex.includes('\\begin{document}')
      || !cleanedLatex.includes('\\end{document}')
    ) {
      console.error('[LaTeX] Groq returned non-LaTeX output:', cleanedLatex.slice(0, 1000));
      return res.status(502).json({
        error: 'AI returned invalid LaTeX',
        message: 'The model did not return valid LaTeX content. Please retry or use a simpler resume prompt.'
      });
    }

    console.log(`[LaTeX] ✅ Generated ${cleanedLatex.length} characters of LaTeX`);

    res.json({
      success: true,
      latex: cleanedLatex,
      job: {
        id: job.id,
        title: job.title,
        company: job.company
      }
    });

  } catch (error) {
    console.error('[LaTeX] Generation failed:', error);
    if (error.status === 429 || error.error?.error?.code === 'rate_limit_exceeded') {
      const retryAfterMs = error.headers?.get?.('retry-after-ms')
        ?? error.headers?.['retry-after-ms'];
      const retryAfterHeader = error.headers?.get?.('retry-after')
        ?? error.headers?.['retry-after'];
      let retryAfterSeconds;

      if (retryAfterMs !== undefined && Number.isFinite(Number(retryAfterMs))) {
        retryAfterSeconds = Math.ceil(Number(retryAfterMs) / 1000);
      } else if (retryAfterHeader !== undefined) {
        const seconds = Number(retryAfterHeader);
        const retryAt = Date.parse(retryAfterHeader);
        if (Number.isFinite(seconds)) {
          retryAfterSeconds = Math.ceil(seconds);
        } else if (Number.isFinite(retryAt)) {
          retryAfterSeconds = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
        }
      }

      if (retryAfterSeconds !== undefined) {
        res.set('Retry-After', String(retryAfterSeconds));
      }
      return res.status(429).json({
        error: 'AI rate limit exceeded',
        message: retryAfterSeconds !== undefined
          ? `AI service is temporarily rate limited. Please try again in ${retryAfterSeconds} seconds.`
          : 'AI service is temporarily rate limited. Please wait a minute before trying again.'
      });
    }

    res.status(500).json({
      error: 'Generation failed',
      message: 'Could not generate LaTeX resume. Please try again later.'
    });
  }
});

export default {
  getJobDetails,
  getQuickMatch,
  generateLatexResume
};
