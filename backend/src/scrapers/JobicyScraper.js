/**
 * Jobicy API Scraper
 * Free remote job API - no API key required
 * Focus on remote tech/software jobs
 * 
 * API: https://jobicy.com/api/v2/remote-jobs
 */

import axios from 'axios';
import prisma from '../utils/prisma.js';
import { normalizeJob } from './classifyJob.js';

export class JobicyScraper {
  constructor() {
    this.name = 'Jobicy';
    this.baseUrl = 'https://jobicy.com/api/v2/remote-jobs';
  }

  /**
   * Fetch jobs from Jobicy API
   */
  async scrape() {
    console.log(`[${this.name}] Fetching jobs from API...`);
    
    let allJobs = [];
    let saved = 0;
    let skipped = 0;

    try {
      // Fetch different categories
      const categories = ['dev', 'devops', 'data', 'design'];
      
      for (const category of categories) {
        try {
          const response = await axios.get(this.baseUrl, {
            params: {
              count: 50,
              geo: 'worldwide',
              industry: category
            },
            timeout: 15000,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          if (response.data && response.data.jobs) {
            const jobs = response.data.jobs.map(job => ({
              title: job.jobTitle,
              company: job.companyName,
              location: job.jobGeo || 'Remote',
              description: job.jobDescription || job.jobExcerpt || '',
              salary: job.annualSalaryMin && job.annualSalaryMax 
                ? `$${job.annualSalaryMin} - $${job.annualSalaryMax}` 
                : null,
              url: job.url,
              postedAt: job.pubDate,
              remote: true,
              type: job.jobType
            }));

            allJobs.push(...jobs);
          }
        } catch (err) {
          console.log(`[${this.name}] Category ${category} error: ${err.message}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Remove duplicates by URL
      const uniqueJobs = [...new Map(allJobs.map(job => [job.url, job])).values()];
      console.log(`[${this.name}] Found ${uniqueJobs.length} remote tech jobs`);
      allJobs = uniqueJobs;

    } catch (error) {
      console.log(`[${this.name}] API error: ${error.message}`);
      return { found: 0, saved: 0, skipped: 0 };
    }

    // Save jobs to database
    for (const rawJob of allJobs) {
      if (!rawJob.url) continue;

      try {
        const existing = await prisma.job.findUnique({
          where: { url: rawJob.url }
        });

        if (existing) {
          skipped++;
          continue;
        }

        const normalizedJob = normalizeJob(rawJob, this.name);
        
        await prisma.job.create({
          data: normalizedJob
        });
        
        saved++;
      } catch (error) {
        if (!error.message?.includes('Unique constraint')) {
          console.error(`[${this.name}] Error saving job:`, error.message);
        }
        skipped++;
      }
    }

    console.log(`[${this.name}] ✅ Saved: ${saved}, Skipped (duplicates): ${skipped}`);
    return { found: allJobs.length, saved, skipped };
  }
}

export default JobicyScraper;
