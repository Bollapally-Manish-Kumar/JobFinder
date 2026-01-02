/**
 * The Muse API Scraper
 * Free job API - no API key required
 * Quality job listings from top companies
 * 
 * API Docs: https://www.themuse.com/developers/api/v2
 * Endpoint: https://www.themuse.com/api/public/jobs
 * Rate Limit: 500 requests/hour
 */

import axios from 'axios';
import prisma from '../utils/prisma.js';
import { normalizeJob } from './classifyJob.js';

export class TheMuseScraper {
  constructor() {
    this.name = 'TheMuse';
    this.baseUrl = 'https://www.themuse.com/api/public/jobs';
  }

  /**
   * Strip HTML tags from text
   */
  stripHtml(html) {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Fetch jobs from The Muse API
   * NO FALLBACK - only returns real API results
   */
  async scrape() {
    console.log(`[${this.name}] Fetching jobs from API...`);
    
    let allJobs = [];
    let saved = 0;
    let skipped = 0;

    try {
      // Fetch software engineering jobs
      const response = await axios.get(this.baseUrl, {
        params: {
          category: 'Software Engineering',
          page: 0,
          descending: true
        },
        timeout: 20000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': process.env.USER_AGENT || 'JobFinderBot/1.0'
        }
      });

      if (response.data && response.data.results) {
        const jobs = response.data.results;

        allJobs = jobs.map(job => {
          const locations = job.locations?.map(l => l.name).join(', ') || 'Not Specified';
          const url = job.refs?.landing_page || 
            `https://www.themuse.com/jobs/${job.company?.short_name || 'company'}/${job.short_name || job.id}`;
          
          return {
            title: job.name,
            company: job.company?.name || 'Unknown',
            location: locations,
            description: this.stripHtml(job.contents),
            salary: null,
            url: url,
            postedAt: job.publication_date,
            remote: locations.toLowerCase().includes('remote') || 
                    locations.toLowerCase().includes('flexible')
          };
        });

        console.log(`[${this.name}] Found ${allJobs.length} software engineering jobs`);
      }
    } catch (error) {
      console.log(`[${this.name}] API error: ${error.message}`);
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
export async function scrapeTheMuse() {
  const scraper = new TheMuseScraper();
  return await scraper.scrape();
}
