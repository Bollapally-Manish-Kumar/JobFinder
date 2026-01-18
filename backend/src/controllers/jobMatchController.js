/**
 * Job Match Controller
 * Handles job detail views with AI-powered resume matching
 * Usage limits: BASIC=1, BASIC_PLUS=3, AI=5, PRO_PLUS=6, ULTIMATE=Unlimited
 */

import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { generateCompletion, GROQ_MODEL } from '../utils/groqClient.js';

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

    const atsTemplate = `
% ATS-FRIENDLY LATEX RESUME TEMPLATE
\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{titlesec}

% ATS-friendly simple formatting
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{12pt}{6pt}

\\begin{document}

% HEADER
\\begin{center}
{\\LARGE\\bfseries FULL NAME}\\\\[4pt]
Location $|$ Phone $|$ \\href{mailto:email@email.com}{email@email.com} $|$ \\href{https://linkedin.com/in/username}{LinkedIn} $|$ \\href{https://github.com/username}{GitHub}
\\end{center}

\\section{Professional Summary}
Brief 2-3 sentence summary highlighting relevant experience for target role.

\\section{Technical Skills}
\\textbf{Languages:} Python, JavaScript, Java, C++\\\\
\\textbf{Frameworks:} React, Node.js, Django\\\\
\\textbf{Tools:} Git, Docker, AWS, MongoDB\\\\
\\textbf{Concepts:} Machine Learning, REST APIs, Agile

\\section{Experience}
\\textbf{Job Title} \\hfill Start -- End\\\\
\\textit{Company Name, Location}
\\begin{itemize}[leftmargin=*, nosep, topsep=3pt]
\\item Achievement with metrics and impact
\\item Another accomplishment using action verbs
\\end{itemize}

\\section{Projects}
\\textbf{Project Name} | Technologies \\hfill Date
\\begin{itemize}[leftmargin=*, nosep, topsep=3pt]
\\item What you built and the problem it solved
\\item Technologies used and results achieved
\\end{itemize}

\\section{Education}
\\textbf{Degree} \\hfill Year\\\\
\\textit{University Name, Location}\\\\
GPA: X.XX, Relevant Coursework: Course1, Course2

\\section{Certifications}
Certification Name -- Issuing Organization (Year)

\\end{document}
`;

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

=== ATS-FRIENDLY TEMPLATE TO USE ===
${atsTemplate}

=== CRITICAL INSTRUCTIONS ===
1. USE ONLY REAL DATA from the candidate's resume above - DO NOT invent any information
2. Extract: Name, Phone, Email, LinkedIn, GitHub, Location, Education, Experience, Skills, Projects
3. Fill in the template with the candidate's ACTUAL information
4. Write a Professional Summary tailored for "${job.title}" at "${job.company}"
5. Reorder skills to prioritize those matching the job description
6. Use strong action verbs: Developed, Implemented, Built, Designed, Led, Optimized, Created
7. Include metrics/numbers where available (e.g., "Improved performance by 40%")
8. Remove sections with no data (if no certifications, remove that section)
9. ESCAPE special characters: & → \\&, % → \\%, # → \\#, _ → \\_
10. Keep resume to 1 page for freshers, 2 pages max for experienced

OUTPUT: Return ONLY the complete LaTeX code starting with \\documentclass. No explanations, no markdown code blocks.`;

    const latexCode = await generateCompletion(prompt, {
      maxTokens: 6000,
      temperature: 0.15
    });

    // Clean the response (remove markdown code blocks if present)
    let cleanedLatex = latexCode
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
