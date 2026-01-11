/**
 * Admin Job Controller - AI-Powered Job Upload
 * 
 * Admin uploads:
 * - Job title
 * - Job URL
 * 
 * AI auto-fills:
 * - Company
 * - Location
 * - Description
 * - Experience
 * - Job Type
 * - Category
 */

import prisma from '../utils/prisma.js';
import { generateCompletion, GROQ_MODEL } from '../utils/groqClient.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Fetch webpage content with timeout and error handling
 */
const fetchWebpageContent = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      maxRedirects: 5
    });

    const $ = cheerio.load(response.data);

    // Remove scripts, styles, and other non-content elements
    $('script, style, nav, footer, header, aside, form, iframe, noscript').remove();

    // Extract relevant content
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    
    // Try to find job-related content
    const jobContent = [];
    
    // Look for common job description containers
    const selectors = [
      '.job-description', '.job-details', '.job-content',
      '#job-description', '#job-details', '#job-content',
      '[class*="job"]', '[class*="description"]',
      'main', 'article', '.content', '#content'
    ];

    for (const selector of selectors) {
      const content = $(selector).text().trim();
      if (content && content.length > 100) {
        jobContent.push(content);
        break;
      }
    }

    // Fallback to body text
    if (jobContent.length === 0) {
      const bodyText = $('body').text()
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000);
      jobContent.push(bodyText);
    }

    return {
      title,
      metaDescription,
      content: jobContent.join('\n').substring(0, 8000)
    };
  } catch (error) {
    console.error(`[Admin Job] Failed to fetch ${url}:`, error.message);
    throw new Error(`Unable to fetch job page: ${error.message}`);
  }
};

/**
 * Use Groq AI to extract job details from webpage content
 */
const extractJobDetails = async (pageContent, jobTitle, jobUrl) => {
  const prompt = `You are a job data extraction expert. Analyze this job posting and extract structured data.

JOB TITLE PROVIDED: ${jobTitle}
JOB URL: ${jobUrl}

PAGE CONTENT:
${pageContent.content.substring(0, 6000)}

TITLE FROM PAGE: ${pageContent.title}
META DESCRIPTION: ${pageContent.metaDescription}

Extract and return ONLY a valid JSON object with these fields:
{
  "company": "Company name (extract from content/URL)",
  "location": "Job location (city, country, or 'Remote')",
  "description": "Brief job description (max 500 chars)",
  "experience": "Required experience (e.g., '2-4 years', 'Entry Level', 'Senior')",
  "salary": "Salary if mentioned, or null",
  "type": "FULL_TIME|PART_TIME|CONTRACT|INTERNSHIP",
  "category": "SOFTWARE|DATA|AI_ML|DEVOPS|DESIGN|MARKETING|HR|FINANCE|NON_TECH",
  "isRemote": true/false,
  "isIndiaEligible": true/false (based on location/requirements)
}

Rules:
- Use the provided job title, not extracted one
- Extract company from domain/content if not explicit
- Set reasonable defaults if data is missing
- description should be clean text, no HTML
- Return ONLY valid JSON, no markdown`;

  try {
    const response = await generateCompletion(prompt, {
      temperature: 0.3,
      max_tokens: 1024
    });

    // Parse JSON from response
    const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('[Admin Job] AI extraction failed:', error.message);
    
    // Return defaults if AI fails
    return {
      company: extractCompanyFromUrl(jobUrl),
      location: 'Not specified',
      description: pageContent.metaDescription || 'Job description not available',
      experience: 'Not specified',
      salary: null,
      type: 'FULL_TIME',
      category: 'SOFTWARE',
      isRemote: false,
      isIndiaEligible: false
    };
  }
};

/**
 * Extract company name from URL as fallback
 */
const extractCompanyFromUrl = (url) => {
  try {
    const hostname = new URL(url).hostname;
    // Remove common prefixes/suffixes
    let company = hostname
      .replace(/^www\./, '')
      .replace(/\.(com|org|net|io|co|jobs|careers).*$/, '')
      .replace(/[-_]/g, ' ');
    
    // Capitalize first letter of each word
    return company.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch {
    return 'Unknown Company';
  }
};

/**
 * Validate URL format and accessibility
 */
const validateUrl = async (url) => {
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  // Check if URL is accessible
  try {
    await axios.head(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
  } catch (error) {
    // HEAD might not be allowed, try GET
    try {
      await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        maxContentLength: 1000 // Just check accessibility
      });
    } catch {
      throw new Error('URL is not accessible');
    }
  }
};

/**
 * Admin: Upload a single job with AI auto-fill
 * POST /api/admin/jobs
 */
export const createJobWithAI = asyncHandler(async (req, res) => {
  const { title, url } = req.body;

  // Validation
  if (!title || title.trim().length < 3) {
    return res.status(400).json({
      error: 'Invalid title',
      message: 'Job title must be at least 3 characters'
    });
  }

  if (!url) {
    return res.status(400).json({
      error: 'URL required',
      message: 'Job URL is required'
    });
  }

  // Validate URL format and accessibility
  try {
    await validateUrl(url);
  } catch (error) {
    return res.status(400).json({
      error: 'Invalid URL',
      message: error.message
    });
  }

  // Check for duplicate URL
  const existingJob = await prisma.job.findUnique({
    where: { url }
  });

  if (existingJob) {
    return res.status(409).json({
      error: 'Duplicate job',
      message: 'A job with this URL already exists',
      existingJobId: existingJob.id
    });
  }

  console.log(`[Admin Job] 🚀 Processing: ${title}`);
  console.log(`[Admin Job] 🔗 URL: ${url}`);

  // Fetch webpage content
  let pageContent;
  try {
    pageContent = await fetchWebpageContent(url);
    console.log(`[Admin Job] ✅ Page fetched (${pageContent.content.length} chars)`);
  } catch (error) {
    return res.status(400).json({
      error: 'Fetch failed',
      message: error.message
    });
  }

  // Check if Groq API is available
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({
      error: 'AI service not configured',
      message: 'GROQ_API_KEY is not set'
    });
  }

  // Extract job details using AI
  console.log(`[Admin Job] 🤖 Extracting details using Groq (${GROQ_MODEL})...`);
  const extractedData = await extractJobDetails(pageContent, title, url);
  console.log(`[Admin Job] ✅ AI extraction complete`);

  // Create job in database
  const job = await prisma.job.create({
    data: {
      title: title.trim(),
      company: extractedData.company || 'Unknown Company',
      location: extractedData.location || 'Not specified',
      description: extractedData.description?.substring(0, 2000) || null,
      experience: extractedData.experience || null,
      salary: extractedData.salary || null,
      url,
      source: 'ADMIN',
      verified: true,
      type: extractedData.type || 'FULL_TIME',
      category: extractedData.category || 'SOFTWARE',
      isRemote: extractedData.isRemote || false,
      isIndiaEligible: extractedData.isIndiaEligible || false,
      postedAt: new Date()
    }
  });

  console.log(`[Admin Job] ✅ Job created: ${job.id}`);

  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    job: {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      experience: job.experience,
      salary: job.salary,
      type: job.type,
      category: job.category,
      isRemote: job.isRemote,
      isIndiaEligible: job.isIndiaEligible,
      url: job.url,
      source: job.source,
      verified: job.verified
    },
    extractedFrom: {
      pageTitle: pageContent.title,
      contentLength: pageContent.content.length
    }
  });
});

/**
 * Admin: Bulk upload jobs
 * POST /api/admin/jobs/bulk
 */
export const bulkCreateJobs = asyncHandler(async (req, res) => {
  const { jobs } = req.body;

  if (!Array.isArray(jobs) || jobs.length === 0) {
    return res.status(400).json({
      error: 'Invalid input',
      message: 'Please provide an array of jobs with title and url'
    });
  }

  if (jobs.length > 10) {
    return res.status(400).json({
      error: 'Too many jobs',
      message: 'Maximum 10 jobs per bulk upload'
    });
  }

  const results = {
    success: [],
    failed: []
  };

  for (const jobInput of jobs) {
    try {
      const { title, url } = jobInput;

      if (!title || !url) {
        results.failed.push({ title, url, error: 'Missing title or url' });
        continue;
      }

      // Check duplicate
      const existing = await prisma.job.findUnique({ where: { url } });
      if (existing) {
        results.failed.push({ title, url, error: 'Duplicate URL' });
        continue;
      }

      // Fetch and extract
      const pageContent = await fetchWebpageContent(url);
      const extractedData = await extractJobDetails(pageContent, title, url);

      // Create job
      const job = await prisma.job.create({
        data: {
          title: title.trim(),
          company: extractedData.company || 'Unknown Company',
          location: extractedData.location || 'Not specified',
          description: extractedData.description?.substring(0, 2000) || null,
          experience: extractedData.experience || null,
          salary: extractedData.salary || null,
          url,
          source: 'ADMIN',
          verified: true,
          type: extractedData.type || 'FULL_TIME',
          category: extractedData.category || 'SOFTWARE',
          isRemote: extractedData.isRemote || false,
          isIndiaEligible: extractedData.isIndiaEligible || false,
          postedAt: new Date()
        }
      });

      results.success.push({ id: job.id, title: job.title, company: job.company });
    } catch (error) {
      results.failed.push({ 
        title: jobInput.title, 
        url: jobInput.url, 
        error: error.message 
      });
    }
  }

  res.json({
    message: `Created ${results.success.length} jobs, ${results.failed.length} failed`,
    results
  });
});

/**
 * Admin: Get all admin-uploaded jobs
 * GET /api/admin/jobs
 */
export const getAdminJobs = asyncHandler(async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: { source: 'ADMIN' },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  res.json({ jobs, count: jobs.length });
});

/**
 * Admin: Delete a job
 * DELETE /api/admin/jobs/:jobId
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  await prisma.job.delete({ where: { id: jobId } });

  console.log(`[Admin Job] 🗑️ Job deleted: ${jobId}`);

  res.json({
    success: true,
    message: 'Job deleted successfully',
    deletedJobId: jobId
  });
});

export default {
  createJobWithAI,
  bulkCreateJobs,
  getAdminJobs,
  deleteJob
};
