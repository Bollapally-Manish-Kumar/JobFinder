/**
 * Admin Routes
 * Protected routes for admin operations
 */

import express from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import {
  createJobWithAI,
  bulkCreateJobs,
  getAdminJobs,
  deleteJob
} from '../controllers/adminJobController.js';
import { runAllScrapers } from '../scrapers/runAll.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// =============================================
// SCRAPING STATUS & CONTROL
// =============================================

// Get scraping status
router.get('/scraping/status', async (req, res) => {
  try {
    // Get total jobs count
    const totalJobs = await prisma.job.count();
    
    // Get jobs by source
    const jobsBySource = await prisma.job.groupBy({
      by: ['source'],
      _count: { id: true }
    });
    
    // Get latest job
    const latestJob = await prisma.job.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, source: true, title: true }
    });
    
    // Get jobs added in last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentJobs = await prisma.job.count({
      where: { createdAt: { gte: last24h } }
    });
    
    // Get jobs added in last 2 hours
    const last2h = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const veryRecentJobs = await prisma.job.count({
      where: { createdAt: { gte: last2h } }
    });
    
    const hoursSinceLastSync = latestJob 
      ? ((Date.now() - latestJob.createdAt.getTime()) / (1000 * 60 * 60)).toFixed(2)
      : 'N/A';
    
    res.json({
      success: true,
      status: {
        totalJobs,
        jobsBySource: jobsBySource.reduce((acc, item) => {
          acc[item.source || 'Unknown'] = item._count.id;
          return acc;
        }, {}),
        latestJob: latestJob ? {
          title: latestJob.title,
          source: latestJob.source,
          addedAt: latestJob.createdAt
        } : null,
        hoursSinceLastSync,
        jobsAddedLast24h: recentJobs,
        jobsAddedLast2h: veryRecentJobs,
        nextScheduledRun: 'Every 2 hours (0 */2 * * *)',
        serverTime: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get scraping status', message: error.message });
  }
});

// Manually trigger scraping
router.post('/scraping/trigger', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Scraping started in background. Check logs for progress.',
      startedAt: new Date().toISOString()
    });
    
    // Run in background (don't await)
    runAllScrapers().then(() => {
      console.log('✅ Manual scraping completed');
    }).catch(err => {
      console.error('❌ Manual scraping failed:', err.message);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger scraping', message: error.message });
  }
});

// =============================================
// JOB MANAGEMENT
// =============================================

// Create a single job with AI auto-fill
router.post('/jobs', createJobWithAI);

// Bulk create jobs
router.post('/jobs/bulk', bulkCreateJobs);

// Get all admin-uploaded jobs
router.get('/jobs', getAdminJobs);

// Delete a job
router.delete('/jobs/:jobId', deleteJob);

export default router;
