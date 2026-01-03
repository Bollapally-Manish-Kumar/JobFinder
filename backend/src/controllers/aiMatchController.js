/**
 * AI Job Match Controller
 * Uses Groq API (llama3-70b-8192) to analyze resume and match with jobs
 */

import prisma from '../utils/prisma.js';
import { generateCompletion, GROQ_MODEL } from '../utils/groqClient.js';

/**
 * Analyze resume and match with top jobs
 * POST /api/ai-match/analyze
 */
export const analyzeResumeMatch = async (req, res) => {
  try {
    // Check API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({
        error: 'AI service not configured',
        message: 'Please set GROQ_API_KEY in environment.'
      });
    }

    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Please provide a valid resume text (at least 50 characters)'
      });
    }

    console.log(`[AI Match] 🚀 Starting analysis using Groq (${GROQ_MODEL})...`);

    // Step 1: Extract key skills from resume
    const skillsPrompt = `Analyze this resume and extract key information.

RESUME:
${resumeText.substring(0, 3000)}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "technicalSkills": ["skill1", "skill2"],
  "experienceLevel": "entry|junior|mid|senior",
  "domains": ["web", "mobile"],
  "keywords": ["keyword1", "keyword2"]
}`;

    const skillsText = await generateCompletion(skillsPrompt, {
      temperature: 0.3,
      max_tokens: 1024
    });
    
    // Parse resume profile from response
    let resumeProfile;
    try {
      const cleanJson = skillsText.replace(/```json\n?|\n?```/g, '').trim();
      resumeProfile = JSON.parse(cleanJson);
    } catch (e) {
      console.log('[AI Match] ⚠️ Could not parse skills, using fallback');
      resumeProfile = {
        technicalSkills: ['JavaScript', 'Python'],
        experienceLevel: 'entry',
        domains: ['software'],
        keywords: []
      };
    }

    console.log('[AI Match] ✅ Resume profile extracted');

    // Step 2: Get jobs from database
    const jobs = await prisma.job.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        description: true,
        url: true,
        source: true,
        salary: true,
        type: true,
        isRemote: true,
        isIndiaEligible: true,
        postedAt: true
      }
    });

    if (jobs.length === 0) {
      return res.json({
        success: true,
        matches: [],
        message: 'No jobs available for matching'
      });
    }

    console.log(`[AI Match] Comparing against ${jobs.length} jobs...`);

    // Step 3: Create job summaries for matching
    const jobSummaries = jobs.map((j, i) => 
      `[${i}] ${j.title} at ${j.company} | ${j.location} | ${(j.description || '').substring(0, 200)}`
    ).join('\n');

    // Step 4: Ask Groq to match resume with jobs
    const matchPrompt = `You are a job matching expert. Find the TOP 5 best matching jobs for this candidate.

CANDIDATE PROFILE:
- Skills: ${resumeProfile.technicalSkills.join(', ')}
- Experience Level: ${resumeProfile.experienceLevel}
- Domains: ${resumeProfile.domains.join(', ')}
- Keywords: ${resumeProfile.keywords.join(', ')}

AVAILABLE JOBS:
${jobSummaries.substring(0, 8000)}

TASK: Analyze each job and score how well the candidate matches. Return the TOP 5 best matches.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "jobIndex": 0,
    "matchScore": 85,
    "reasons": ["Strong skills match", "Experience level aligns"],
    "missingSkills": ["Kubernetes", "AWS"]
  }
]

Rules:
- matchScore must be 0-100
- Include 2-3 specific reasons for the match
- List any skills from the job that the candidate is missing
- Sort by matchScore descending
- Return exactly 5 matches`;

    const matchText = await generateCompletion(matchPrompt, {
      temperature: 0.3,
      max_tokens: 2048
    });
    
    // Parse match results
    let matchResults;
    try {
      const cleanJson = matchText.replace(/```json\n?|\n?```/g, '').trim();
      matchResults = JSON.parse(cleanJson);
    } catch (e) {
      console.log('[AI Match] ⚠️ Could not parse matches, using fallback');
      matchResults = jobs.slice(0, 5).map((_, i) => ({
        jobIndex: i,
        matchScore: 70 - (i * 5),
        reasons: ['Skills may align with requirements'],
        missingSkills: ['Review job description']
      }));
    }

    // Build final response with job details
    const matches = matchResults
      .filter(m => m.jobIndex >= 0 && m.jobIndex < jobs.length)
      .slice(0, 5)
      .map(m => ({
        job: jobs[m.jobIndex],
        matchScore: Math.min(100, Math.max(0, m.matchScore)),
        reasons: m.reasons || [],
        missingSkills: m.missingSkills || []
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    console.log(`[AI Match] ✅ Found ${matches.length} matches`);

    res.json({
      success: true,
      resumeProfile,
      matches,
      analyzedJobs: jobs.length
    });

  } catch (error) {
    console.error('[AI Match] ❌ Error:', error.message);

    // Handle Groq-specific errors
    if (error.status === 429 || error.message?.includes('rate limit')) {
      return res.status(429).json({
        error: 'Rate limited',
        message: 'AI service limit reached. Please try again in a few minutes.'
      });
    }

    if (error.status === 401 || error.message?.includes('API key')) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'AI service is not properly configured'
      });
    }

    res.status(503).json({
      error: 'AI service temporarily unavailable',
      message: 'Failed to analyze resume. Please try again.'
    });
  }
};

/**
 * Check if user has paid for AI Match feature
 * GET /api/ai-match/check-access
 */
export const checkAccess = async (req, res) => {
  try {
    const user = req.user;

    // Admin always has access, or AI/PRO_PLUS plan with verified payment
    const hasAccess = user.role === 'ADMIN' || 
      (user.paymentVerified && (user.plan === 'AI' || user.plan === 'PRO_PLUS'));

    res.json({
      hasAccess,
      plan: user.plan,
      isAdmin: user.role === 'ADMIN',
      paymentVerified: user.paymentVerified
    });
  } catch (error) {
    console.error('[AI Match] Check access error:', error);
    res.status(500).json({ error: 'Failed to check access' });
  }
};
