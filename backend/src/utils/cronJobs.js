/**
 * Job Scraper Cron Jobs
 * Automatically scrapes jobs every 2 hours
 * Automatically deletes jobs older than 7 days
 */

import cron from 'node-cron';
import { runAllScrapers } from '../scrapers/runAll.js';

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
  console.log('📅 Initializing cron jobs...');

  // Run job scraper every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`\n🔄 [${timestamp}] Starting scheduled job scraping...`);
    
    try {
      await runAllScrapers();
      console.log(`✅ [${timestamp}] Scheduled job scraping completed successfully`);
    } catch (error) {
      console.error(`❌ [${timestamp}] Scheduled job scraping failed:`, error.message);
    }
  }, {
    timezone: "Asia/Kolkata" // Adjust to your timezone
  });

  console.log('✅ Cron job scheduled: Job scraping every 2 hours');

  // Delete old jobs every day at midnight
  cron.schedule('0 0 * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`\n🗑️ [${timestamp}] Starting old job cleanup...`);
    
    try {
      await deleteOldJobs();
      console.log(`✅ [${timestamp}] Old job cleanup completed successfully`);
    } catch (error) {
      console.error(`❌ [${timestamp}] Old job cleanup failed:`, error.message);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  console.log('✅ Cron job scheduled: Delete jobs older than 7 days (daily at midnight)');

  // Optional: Run immediately on startup if jobs are stale (older than 2 hours)
  checkAndRunIfStale();
  
  // Also clean up old jobs on startup
  deleteOldJobs();
}

/**
 * Delete jobs older than 7 days
 */
async function deleteOldJobs() {
  try {
    const prisma = (await import('../utils/prisma.js')).default;
    
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // First, delete related SavedJobs for old jobs
    const oldJobs = await prisma.job.findMany({
      where: { createdAt: { lt: sevenDaysAgo } },
      select: { id: true }
    });
    
    const oldJobIds = oldJobs.map(j => j.id);
    
    if (oldJobIds.length === 0) {
      console.log('✅ No old jobs to delete');
      return;
    }
    
    // Delete related saved jobs first
    const deletedSavedJobs = await prisma.savedJob.deleteMany({
      where: { jobId: { in: oldJobIds } }
    });
    
    // Delete related applications
    const deletedApplications = await prisma.jobApplication.deleteMany({
      where: { jobId: { in: oldJobIds } }
    });
    
    // Delete the old jobs
    const deletedJobs = await prisma.job.deleteMany({
      where: { createdAt: { lt: sevenDaysAgo } }
    });
    
    console.log(`🗑️ Deleted ${deletedJobs.count} jobs older than 7 days`);
    if (deletedSavedJobs.count > 0) {
      console.log(`   └─ Also removed ${deletedSavedJobs.count} saved job references`);
    }
    if (deletedApplications.count > 0) {
      console.log(`   └─ Also removed ${deletedApplications.count} application references`);
    }
  } catch (error) {
    console.error('❌ Error deleting old jobs:', error.message);
  }
}

/**
 * Check if jobs are stale and run scraper if needed
 */
async function checkAndRunIfStale() {
  try {
    const prisma = (await import('../utils/prisma.js')).default;
    
    // Get the most recent job by createdAt
    const latestJob = await prisma.job.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    if (!latestJob) {
      console.log('📭 No jobs found in database. Running initial sync...');
      await runAllScrapers();
      return;
    }

    const hoursSinceLastSync = (Date.now() - latestJob.createdAt.getTime()) / (1000 * 60 * 60);
    
    // Run if jobs are older than 2 hours
    if (hoursSinceLastSync > 2) {
      console.log(`⏰ Jobs are ${Math.floor(hoursSinceLastSync)}h old. Running refresh...`);
      await runAllScrapers();
    } else {
      const minutesSinceLastSync = Math.floor(hoursSinceLastSync * 60);
      console.log(`✅ Jobs are fresh (${minutesSinceLastSync} minutes old)`);
    }
  } catch (error) {
    console.error('❌ Error checking job staleness:', error.message);
  }
}

export default initializeCronJobs;
