/**
 * Remotive API Scraper
 * Free remote jobs API - no API key required
 * 
 * API Docs: https://remotive.com/api-documentation
 * Rate Limit: Reasonable (no strict limit)
 * 
 * IMPORTANT: NO FALLBACK JOBS - only real API results
 */

import axios from 'axios';
import prisma from '../utils/prisma.js';
import { normalizeJob } from './classifyJob.js';

export class RemotiveScraper {
  constructor() {
    this.name = 'Remotive';
    this.baseUrl = 'https://remotive.com/api/remote-jobs';
  }

  /**
   * Fetch remote jobs from Remotive API
   * NO FALLBACK - only returns real API results
   */
  async scrape() {
    console.log(`[${this.name}] Fetching jobs from API...`);
    
    let allJobs = [];
    let saved = 0;
    let skipped = 0;

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          category: 'software-dev', // Focus on software development
          limit: 30
        },
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': process.env.USER_AGENT || 'JobFinderBot/1.0'
        }
      });

      if (response.data && response.data.jobs) {
        const jobs = response.data.jobs.slice(0, 30);

        allJobs = jobs.map(job => ({
          title: job.title,
          company: job.company_name,
          location: 'Remote',
          description: job.description,
          salary: job.salary || null,
          url: job.url,
          postedAt: job.publication_date
        }));

        console.log(`[${this.name}] Found ${allJobs.length} remote jobs`);
      }
    } catch (error) {
      console.log(`[${this.name}] API error: ${error.message}`);
      // NO FALLBACK - return empty results
      return { found: 0, saved: 0, skipped: 0 };
    }

    // Save jobs to database (deduplicate by URL)
    for (const rawJob of allJobs) {
      if (!rawJob.url) continue;

      try {
        // Check if job already exists
        const existing = await prisma.job.findUnique({
          where: { url: rawJob.url }
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Normalize and save new job
        const normalizedJob = normalizeJob(rawJob, this.name);
        
        // Strip HTML from description if present
        if (normalizedJob.description) {
          normalizedJob.description = normalizedJob.description
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 2000);
        }
        
        await prisma.job.create({
          data: normalizedJob
        });
        
        saved++;
      } catch (error) {
        if (error.code === 'P2002') {
          skipped++;
        } else {
          console.error(`[${this.name}] Error saving job: ${error.message}`);
        }
      }
    }

    console.log(`[${this.name}] ✅ Saved: ${saved}, Skipped (duplicates): ${skipped}`);
    
    return { 
      found: allJobs.length, 
      saved, 
      skipped 
    };
  }
}

// Export function for direct use
export async function scrapeRemotive() {
  const scraper = new RemotiveScraper();
  return await scraper.scrape();
}
