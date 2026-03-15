/**
 * Resume Controller
 * Uses Groq API (llama3-70b-8192) for LaTeX resume generation
 */

import { validationResult } from 'express-validator';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { generateCompletion, GROQ_MODEL } from '../utils/groqClient.js';
import prisma from '../utils/prisma.js';

/**
 * Generate LaTeX resume using Groq API
 * POST /api/resume/generate
 */
export const generateResume = asyncHandler(async (req, res) => {
  try {
    // Check if API key is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({
        error: 'AI Resume service not configured',
        message: 'Please set GROQ_API_KEY in .env'
      });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobDescription, userInfo } = req.body;

    if (!jobDescription || jobDescription.trim().length < 30) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Job description is required (minimum 30 characters)' 
      });
    }

    const profile = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        linkedin: true,
        portfolio: true,
        currentCompany: true,
        currentTitle: true,
        experienceYears: true,
        city: true,
        country: true,
        skills: true,
        highestEducation: true,
        university: true,
        graduationYear: true,
        major: true,
        gpa: true,
        resumeText: true
      }
    });

    const userName = profile?.name || userInfo?.name || '[Your Name]';
    const userEmail = profile?.email || userInfo?.email || '[your.email@example.com]';
    const userPhone = profile?.phone || userInfo?.phone || '[Your Phone]';
    const userLinkedin = profile?.linkedin || userInfo?.linkedin || '';
    const userPortfolio = profile?.portfolio || userInfo?.portfolio || '';
    const userCompany = profile?.currentCompany || '';
    const userTitle = profile?.currentTitle || '';
    const userExperience = profile?.experienceYears !== null && profile?.experienceYears !== undefined
      ? `${profile.experienceYears} years`
      : '';
    const userLocation = [profile?.city, profile?.country].filter(Boolean).join(', ');
    const userSkills = profile?.skills || '';
    const userEducation = [
      profile?.highestEducation,
      profile?.major,
      profile?.university,
      profile?.graduationYear ? `(${profile.graduationYear})` : ''
    ].filter(Boolean).join(' ');
    const resumeText = profile?.resumeText || '';

    console.log(`[Resume] 🚀 Generating resume using Groq (${GROQ_MODEL})...`);

    // Construct prompt for LaTeX resume generation
    const prompt = `You are an expert ATS resume writer. Generate a professional LaTeX resume.

  JOB DESCRIPTION:
  ${jobDescription}

  USER PROFILE (from GoAxonAI profile):
  - Name: ${userName}
  - Email: ${userEmail}
  - Phone: ${userPhone}
  - LinkedIn: ${userLinkedin}
  - Portfolio: ${userPortfolio}
  - Current Role: ${[userTitle, userCompany].filter(Boolean).join(' at ') || 'N/A'}
  - Experience: ${userExperience || 'N/A'}
  - Location: ${userLocation || 'N/A'}
  - Education: ${userEducation || 'N/A'}
  - Skills: ${userSkills || 'N/A'}

  UPLOADED RESUME TEXT (use as primary source of truth, if provided):
  ${resumeText || '[No resume text available]'}

  STRICT REQUIREMENTS:
  1. Use the moderncv package with "classic" style and "blue" color theme
  2. Include these sections: Professional Summary, Technical Skills, Work Experience, Education, Projects
  3. Make content highly relevant to the job description above
  4. Use proper LaTeX syntax and escaping
  5. Output ONLY raw LaTeX code - no markdown, no code blocks, no explanations
  6. Make it ATS-friendly with clear formatting
  7. Keep it to 1-2 pages maximum
  8. If resume text exists, prefer it over inventing details

  Generate the complete LaTeX resume code now:`;

    // Call Groq API
    const responseText = await generateCompletion(prompt, {
      temperature: 0.7,
      max_tokens: 4096
    });

    if (!responseText) {
      console.error('[Resume] ❌ Empty Groq response');
      return res.status(500).json({
        error: 'Generation failed',
        message: 'AI returned an empty response. Please try again.'
      });
    }

    console.log('[Resume] ✅ Resume generated successfully!');

    // Clean up any markdown artifacts that might slip through
    let cleanLatex = responseText.trim();
    
    // Remove markdown code blocks if present
    if (cleanLatex.includes('```latex')) {
      cleanLatex = cleanLatex.replace(/```latex\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanLatex.includes('```tex')) {
      cleanLatex = cleanLatex.replace(/```tex\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanLatex.includes('```')) {
      cleanLatex = cleanLatex.replace(/```\n?/g, '');
    }

    res.json({
      success: true,
      latex: cleanLatex.trim(),
      message: 'Resume generated successfully'
    });

  } catch (error) {
    console.error('[Resume] ❌ Generation error:', error.message);

    // Handle Groq-specific errors
    if (error.status === 401 || error.message?.includes('API key')) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'AI service is not properly configured'
      });
    }

    if (error.status === 429 || error.message?.includes('rate limit')) {
      return res.status(429).json({
        error: 'Rate limited',
        message: 'AI service limit reached. Please try again in a few minutes.'
      });
    }

    if (error.status === 503 || error.message?.includes('unavailable')) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'AI service temporarily unavailable. Please try again.'
      });
    }

    res.status(503).json({
      error: 'AI service temporarily unavailable',
      message: 'Resume generation failed. Please try again.'
    });
  }
});
