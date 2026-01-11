/**
 * Arbeitnow API Scraper
 * Free job API - no API key required
 * Focus on remote and tech jobs
 * 
 * API Docs: https://www.arbeitnow.com/api/job-board-api
 * Rate Limit: Generous (no strict limit documented)
 */

import axios from 'axios';
import prisma from '../utils/prisma.js';
import { normalizeJob } from './classifyJob.js';

export class ArbeitnowScraper {
  constructor() {
    this.name = 'Arbeitnow';
    this.baseUrl = 'https://www.arbeitnow.com/api/job-board-api';
  }

  /**
   * Fetch jobs from Arbeitnow API
   * NO FALLBACK - only returns real API results
   */
  async scrape() {
    console.log(`[${this.name}] Fetching jobs from API...`);
    
    let allJobs = [];
    let saved = 0;
    let skipped = 0;

    try {
      const response = await axios.get(this.baseUrl, {
        timeout: 20000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });

      if (response.data && response.data.data) {
        // Filter for tech/software jobs
        const jobs = response.data.data.filter(job => this.isTechJob(job));

        allJobs = jobs.map(job => ({
          title: job.title,
          company: job.company_name,
          location: job.location || 'Not Specified',
          description: job.description,
          salary: null,
          url: job.url,
          postedAt: job.created_at,
          remote: job.remote === true // Pass remote flag for detection
        }));

        console.log(`[${this.name}] Found ${allJobs.length} tech jobs`);
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

  /**
   * Check if job is tech-related
   */
  isTechJob(job) {
    const text = `${job.title} ${job.description || ''} ${job.tags?.join(' ') || ''}`.toLowerCase();
    const techKeywords = [
      'software', 'developer', 'engineer', 'programming', 'python', 'java',
      'javascript', 'react', 'node', 'aws', 'cloud', 'devops', 'data',
      'machine learning', 'ai', 'frontend', 'backend', 'full stack',
      'mobile', 'ios', 'android', 'web', 'api', 'database', 'sql',
      'typescript', 'golang', 'rust', 'c++', 'kubernetes', 'docker'
    ];
    
    return techKeywords.some(keyword => text.includes(keyword));
  }
}

// Export function for direct use
export async function scrapeArbeitnow() {
  const scraper = new ArbeitnowScraper();
  return await scraper.scrape();
}
