/**
 * Job Controller
 * Handles job listings with blur logic for unpaid users
 */

import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

/**
 * Blur job data for unpaid users
 * Only first job is fully visible, rest are blurred
 */
const blurJobData = (job, index, hasPaidAccess) => {
  // Paid users see everything
  if (hasPaidAccess) {
    return { ...job, isLocked: false };
  }
  
  // Free users: only first job is fully visible
  if (index === 0) {
    return { ...job, isLocked: false };
  }
  
  // Blur remaining jobs for free users
  return {
    id: job.id,
    title: job.title.substring(0, 3) + '***',
    company: job.company.substring(0, 2) + '***',
    location: '***',
    experience: '***',
    salary: '***',
    description: null,
    source: job.source,
    url: null,
    verified: job.verified,
    createdAt: job.createdAt,
    isLocked: true
  };
};

/**
 * Get all jobs with pagination
 * GET /api/jobs
 */
export const getJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  // Filter parameters
  const { source, location, company, type, category, search, isIndiaEligible, isRemote } = req.query;

  // Build filter
  const where = {};
  
  if (source) where.source = source;
  if (company) where.company = { contains: company };
  if (type) where.type = type;
  if (category) where.category = category;
  if (location) where.location = { contains: location };
  
  // Boolean filters
  if (isIndiaEligible === 'true') where.isIndiaEligible = true;
  if (isRemote === 'true') where.isRemote = true;
  
  // Search across title, company, description
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { company: { contains: search } },
      { description: { contains: search } }
    ];
  }

  // Get total count
  const total = await prisma.job.count({ where });

  // Get jobs
  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    select: {
      id: true,
      title: true,
      company: true,
      location: true,
      experience: true,
      salary: true,
      description: true,
      source: true,
      url: true,
      verified: true,
      type: true,
      category: true,
      createdAt: true,
      postedAt: true
    }
  });

  // Apply blur logic based on user's paid status
  const hasPaidAccess = req.user?.paymentVerified && req.user?.plan !== 'BASIC';
  const processedJobs = jobs.map((job, index) => blurJobData(job, index, hasPaidAccess));

  res.json({
    jobs: processedJobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    hasPaidAccess
  });
});

/**
 * Search jobs
 * GET /api/jobs/search
 */
export const searchJobs = asyncHandler(async (req, res) => {
  const { q, location, experience, source } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build search filter
  const where = {
    AND: []
  };

  if (q) {
    where.AND.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ]
    });
  }

  if (location) {
    where.AND.push({ location: { contains: location, mode: 'insensitive' } });
  }

  if (experience) {
    where.AND.push({ experience: { contains: experience, mode: 'insensitive' } });
  }

  if (source) {
    where.AND.push({ source });
  }

  // Remove empty AND array
  if (where.AND.length === 0) delete where.AND;

  const total = await prisma.job.count({ where });

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  const hasPaidAccess = req.user?.paymentVerified && req.user?.plan !== 'BASIC';
  const processedJobs = jobs.map((job, index) => blurJobData(job, index, hasPaidAccess));

  res.json({
    jobs: processedJobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    hasPaidAccess
  });
});

/**
 * Get single job by ID
 * GET /api/jobs/:id
 */
export const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await prisma.job.findUnique({
    where: { id }
  });

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Check if user has saved this job
  let isSaved = false;
  if (req.user) {
    const savedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: req.user.id,
          jobId: id
        }
      }
    });
    isSaved = !!savedJob;
  }

  // For unpaid users, check if they can view this job
  const hasPaidAccess = req.user?.paymentVerified && req.user?.plan !== 'BASIC';
  
  res.json({
    job: {
      ...job,
      isLocked: false
    },
    isSaved,
    hasPaidAccess
  });
});

/**
 * Get user's saved jobs
 * GET /api/jobs/user/saved
 */
export const getSavedJobs = asyncHandler(async (req, res) => {
  const savedJobs = await prisma.savedJob.findMany({
    where: { userId: req.user.id },
    include: {
      job: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const jobs = savedJobs.map(sj => ({
    ...sj.job,
    savedAt: sj.createdAt
  }));

  res.json({ jobs });
});

/**
 * Save a job
 * POST /api/jobs/:id/save
 */
export const saveJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if job exists
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Check if already saved
  const existing = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId: req.user.id,
        jobId: id
      }
    }
  });

  if (existing) {
    return res.status(400).json({ error: 'Job already saved' });
  }

  // Save job
  await prisma.savedJob.create({
    data: {
      userId: req.user.id,
      jobId: id
    }
  });

  res.json({ message: 'Job saved successfully' });
});

/**
 * Unsave a job
 * DELETE /api/jobs/:id/save
 */
export const unsaveJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.savedJob.delete({
    where: {
      userId_jobId: {
        userId: req.user.id,
        jobId: id
      }
    }
  });

  res.json({ message: 'Job removed from saved' });
});

/**
 * Get filter options (companies, types, categories, locations)
 * GET /api/jobs/filters
 */
/**
 * Get sync status - jobs added today
 * GET /api/jobs/sync-status
 */
export const getSyncStatus = asyncHandler(async (req, res) => {
  // Get today's date boundaries
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Count jobs added today
  const jobsAddedToday = await prisma.job.count({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  // Get total jobs
  const totalJobs = await prisma.job.count();

  // Get last job added
  const lastJob = await prisma.job.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true, source: true }
  });

  // Get jobs by source added today
  const sourceBreakdown = await prisma.job.groupBy({
    by: ['source'],
    _count: { id: true },
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  res.json({
    jobsAddedToday,
    totalJobs,
    lastSyncAt: lastJob?.createdAt || null,
    lastSource: lastJob?.source || null,
    sourceBreakdown: sourceBreakdown.map(s => ({
      source: s.source,
      count: s._count.id
    }))
  });
});

export const getFilters = asyncHandler(async (req, res) => {
  // Get unique companies
  const companies = await prisma.job.findMany({
    distinct: ['company'],
    select: { company: true },
    orderBy: { company: 'asc' }
  });

  // Get unique sources
  const sources = await prisma.job.findMany({
    distinct: ['source'],
    select: { source: true },
    orderBy: { source: 'asc' }
  });

  // Get unique types
  const types = await prisma.job.findMany({
    distinct: ['type'],
    select: { type: true },
    where: { type: { not: null } }
  });

  // Get unique categories
  const categories = await prisma.job.findMany({
    distinct: ['category'],
    select: { category: true },
    where: { category: { not: null } }
  });

  // Get unique locations (top 20)
  const locations = await prisma.job.findMany({
    distinct: ['location'],
    select: { location: true },
    take: 20
  });

  res.json({
    companies: companies.map(c => c.company).filter(Boolean),
    sources: sources.map(s => s.source).filter(Boolean),
    types: types.map(t => t.type).filter(Boolean),
    categories: categories.map(c => c.category).filter(Boolean),
    locations: locations.map(l => l.location).filter(Boolean)
  });
});
