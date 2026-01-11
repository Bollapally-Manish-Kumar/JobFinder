/**
 * PDF Resume Controller
 * Handles PDF upload, text extraction, and AI job matching
 */

import { generateCompletion, GROQ_MODEL } from '../utils/groqClient.js';
import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { deleteFile } from '../middlewares/upload.js';
import fs from 'fs';

// Dynamic import for pdf-parse to avoid module resolution issues
let pdfParse = null;
const getPdfParser = async () => {
  if (!pdfParse) {
    const module = await import('pdf-parse');
    pdfParse = module.default || module;
  }
  return pdfParse;
};

/**
 * Extract text from PDF file
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const pdf = await getPdfParser();
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    // Clean up extracted text
    let text = data.text
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      text,
      pages: data.numpages,
      info: data.info
    };
  } catch (error) {
    console.error('[PDF] Extraction error:', error.message);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
};

/**
 * Analyze resume with Groq AI and match with jobs
 */
const analyzeAndMatch = async (resumeText, jobs) => {
  // Step 1: Extract skills from resume
  const skillsPrompt = `Analyze this resume and extract key information.

RESUME:
${resumeText.substring(0, 4000)}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "name": "Candidate name if found",
  "email": "Email if found",
  "phone": "Phone if found",
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["communication", "teamwork"],
  "experienceLevel": "entry|junior|mid|senior",
  "yearsOfExperience": 2,
  "domains": ["web", "mobile", "data"],
  "education": "Highest degree",
  "keywords": ["keyword1", "keyword2"]
}`;

  let resumeProfile;
  try {
    const skillsResponse = await generateCompletion(skillsPrompt, {
      temperature: 0.3,
      max_tokens: 1024
    });
    
    const cleanJson = skillsResponse.replace(/```json\n?|\n?```/g, '').trim();
    resumeProfile = JSON.parse(cleanJson);
  } catch (error) {
    console.log('[PDF AI] ⚠️ Could not parse resume profile, using fallback');
    resumeProfile = {
      technicalSkills: [],
      softSkills: [],
      experienceLevel: 'entry',
      yearsOfExperience: 0,
      domains: ['software'],
      keywords: []
    };
  }

  // Step 2: Create job summaries
  const jobSummaries = jobs.map((job, index) => 
    `[${index}] ${job.title} at ${job.company} | ${job.location} | ${job.type || 'FULL_TIME'} | ${(job.description || '').substring(0, 150)}`
  ).join('\n');

  // Step 3: Match resume with jobs
  const matchPrompt = `You are an expert job matcher. Find the TOP 5 best jobs for this candidate.

CANDIDATE PROFILE:
- Technical Skills: ${resumeProfile.technicalSkills?.join(', ') || 'Not specified'}
- Soft Skills: ${resumeProfile.softSkills?.join(', ') || 'Not specified'}
- Experience Level: ${resumeProfile.experienceLevel || 'entry'}
- Years of Experience: ${resumeProfile.yearsOfExperience || 0}
- Domains: ${resumeProfile.domains?.join(', ') || 'general'}
- Keywords: ${resumeProfile.keywords?.join(', ') || ''}

AVAILABLE JOBS (${jobs.length} total):
${jobSummaries.substring(0, 8000)}

TASK: Score each job based on how well the candidate matches. Return TOP 5.

Return ONLY a valid JSON array with this exact structure:
[
  {
    "jobIndex": 0,
    "matchScore": 85,
    "reasons": ["Strong Python skills match", "Experience level aligns"],
    "missingSkills": ["Kubernetes", "AWS"],
    "advice": "Consider learning AWS to strengthen your application"
  }
]

Rules:
- matchScore: 0-100 (be realistic)
- reasons: 2-3 specific reasons why this job matches
- missingSkills: skills from job that candidate lacks
- advice: 1 sentence actionable advice
- Sort by matchScore (highest first)
- Return exactly 5 matches`;

  let matchResults;
  try {
    const matchResponse = await generateCompletion(matchPrompt, {
      temperature: 0.3,
      max_tokens: 2048
    });
    
    const cleanJson = matchResponse.replace(/```json\n?|\n?```/g, '').trim();
    matchResults = JSON.parse(cleanJson);
  } catch (error) {
    console.log('[PDF AI] ⚠️ Could not parse match results, using fallback');
    matchResults = jobs.slice(0, 5).map((_, index) => ({
      jobIndex: index,
      matchScore: 70 - (index * 5),
      reasons: ['Skills may align with requirements'],
      missingSkills: [],
      advice: 'Review job description for specific requirements'
    }));
  }

  return { resumeProfile, matchResults };
};

/**
 * Upload PDF and analyze for job matching
 * POST /api/ai-match/upload-pdf
 */
export const uploadAndAnalyzePDF = asyncHandler(async (req, res) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded',
      message: 'Please upload a PDF file (max 2MB)'
    });
  }

  const filePath = req.file.path;
  console.log(`[PDF] 📄 Processing: ${req.file.originalname}`);

  try {
    // Check Groq API
    if (!process.env.GROQ_API_KEY) {
      throw new Error('AI service not configured');
    }

    // Extract text from PDF
    console.log('[PDF] 📝 Extracting text...');
    const { text, pages } = await extractTextFromPDF(filePath);

    if (!text || text.length < 50) {
      return res.status(400).json({
        error: 'Invalid PDF',
        message: 'Could not extract enough text from PDF. Please upload a text-based PDF.'
      });
    }

    console.log(`[PDF] ✅ Extracted ${text.length} chars from ${pages} pages`);

    // Get jobs from database
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
        category: true,
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

    // Analyze and match
    console.log(`[PDF] 🤖 Analyzing with Groq (${GROQ_MODEL})...`);
    const { resumeProfile, matchResults } = await analyzeAndMatch(text, jobs);

    // Build response with job details
    const matches = matchResults
      .filter(m => m.jobIndex >= 0 && m.jobIndex < jobs.length)
      .slice(0, 5)
      .map(m => ({
        job: jobs[m.jobIndex],
        matchScore: Math.min(100, Math.max(0, m.matchScore)),
        reasons: m.reasons || [],
        missingSkills: m.missingSkills || [],
        advice: m.advice || ''
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    console.log(`[PDF] ✅ Found ${matches.length} matches`);

    res.json({
      success: true,
      resumeProfile,
      matches,
      analyzedJobs: jobs.length,
      pdfInfo: {
        pages,
        textLength: text.length
      }
    });

  } catch (error) {
    console.error('[PDF] ❌ Error:', error.message);

    // Handle specific errors
    if (error.message?.includes('rate limit') || error.status === 429) {
      return res.status(429).json({
        error: 'Rate limited',
        message: 'AI service limit reached. Please try again in a few minutes.'
      });
    }

    if (error.message?.includes('API key') || error.status === 401) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'AI service is not properly configured'
      });
    }

    res.status(500).json({
      error: 'Analysis failed',
      message: error.message || 'Failed to analyze resume'
    });

  } finally {
    // ALWAYS delete the uploaded PDF
    try {
      await deleteFile(filePath);
      console.log('[PDF] 🗑️ Temp file deleted');
    } catch (e) {
      console.error('[PDF] Failed to delete temp file:', e.message);
    }
  }
});

/**
 * Get supported file types info
 * GET /api/ai-match/upload-info
 */
export const getUploadInfo = asyncHandler(async (req, res) => {
  res.json({
    supportedTypes: ['application/pdf'],
    maxSize: '2MB',
    maxSizeBytes: 2 * 1024 * 1024,
    tips: [
      'Upload a text-based PDF (not scanned images)',
      'Include your skills, experience, and education',
      'Keep resume under 3 pages for best results'
    ]
  });
});

export default {
  uploadAndAnalyzePDF,
  getUploadInfo
};
