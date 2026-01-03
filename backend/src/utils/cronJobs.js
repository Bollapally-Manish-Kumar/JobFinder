/**
 * Job Scraper Cron Jobs
 * Automatically scrapes jobs every 2 hours
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

  // Optional: Run immediately on startup if jobs are stale (older than 2 hours)
  checkAndRunIfStale();
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
