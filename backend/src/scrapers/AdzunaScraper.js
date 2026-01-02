/**
 * Adzuna API Scraper
 * Official job aggregator API - legal and reliable
 * 
 * API Docs: https://developer.adzuna.com/
 * Rate Limit: 250 requests/month (free tier)
 * 
 * CORRECT API FORMAT:
 * https://api.adzuna.com/v1/api/jobs/{country}/search/{page}
 * ?app_id=XXX&app_key=YYY&results_per_page=20&what=software
 */

import axios from 'axios';
import prisma from '../utils/prisma.js';
import { normalizeJob } from './classifyJob.js';

// Base URL for Adzuna API
const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

// Search queries to find software jobs
const SEARCH_QUERIES = ['software', 'developer', 'engineer', 'data scientist'];

// Countries to search (lowercase required in URL path)
const COUNTRIES = ['in', 'gb', 'us'];

export class AdzunaScraper {
  constructor() {
    this.name = 'Adzuna';
    this.appId = process.env.ADZUNA_APP_ID;
    this.apiKey = process.env.ADZUNA_API_KEY;
    
    // Validate API keys
    if (!this.appId || !this.apiKey) {
      console.warn('[Adzuna] ⚠️ Missing API credentials. Set ADZUNA_APP_ID and ADZUNA_API_KEY in .env');
    }
  }

  /**
   * Search Adzuna API for jobs
   * Country MUST be in URL path, not query params
   * @param {string} query - Search query (what)
   * @param {string} country - Country code lowercase (in, gb, us)
   * @param {number} page - Page number (default 1)
   * @returns {Array} Array of job objects
   */
  async searchJobs(query, country = 'in', page = 1) {
    if (!this.appId || !this.apiKey) {
      console.log(`[${this.name}] Skipping - no API credentials`);
      return [];
    }

    try {
      // CORRECT FORMAT: country in URL path, not params
      const url = `${BASE_URL}/${country}/search/${page}`;
      
      const response = await axios.get(url, {
        params: {
          app_id: this.appId,
          app_key: this.apiKey,
          results_per_page: 20,
          what: query,
          content_type: 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data && response.data.results) {
        console.log(`[${this.name}] Found ${response.data.results.length} jobs for "${query}" in ${country.toUpperCase()}`);
        
        return response.data.results.map(job => ({
          title: job.title,
          company: job.company?.display_name || 'Unknown Company',
          location: job.location?.display_name || country.toUpperCase(),
          description: job.description,
          salary: job.salary_min && job.salary_max 
            ? `${job.salary_min} - ${job.salary_max}`
            : null,
          url: job.redirect_url,
          postedAt: job.created ? new Date(job.created) : null
        }));
      }

      return [];
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`[${this.name}] Rate limited - will retry later`);
      } else if (error.response?.status === 400) {
        console.log(`[${this.name}] Bad request for "${query}" in ${country}: Check API params`);
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        console.log(`[${this.name}] Timeout for "${query}" in ${country} - API may be slow`);
      } else {
        console.log(`[${this.name}] API error: ${error.code || error.response?.status || error.message}`);
      }
      return [];
    }
  }

  /**
   * Main scrape method - searches for jobs
   * NO FALLBACK - only returns real API results
   */
  async scrape() {
    console.log(`[${this.name}] Starting job search...`);
    
    if (!this.appId || !this.apiKey) {
      console.log(`[${this.name}] ❌ No API credentials - skipping`);
      return { found: 0, saved: 0, skipped: 0 };
    }

    let allJobs = [];
    let saved = 0;
    let skipped = 0;

    // Search India first (primary market), then others
    // Limit to save API calls (250/month free tier)
    for (const country of COUNTRIES) {
      for (const query of SEARCH_QUERIES.slice(0, 2)) { // Only 2 queries per country
        console.log(`[${this.name}] Searching "${query}" in ${country.toUpperCase()}...`);
        
        const jobs = await this.searchJobs(query, country, 1);
        allJobs = allJobs.concat(jobs);

        // Delay between requests (be nice to API)
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`[${this.name}] Total jobs found: ${allJobs.length}`);

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
        // Unique constraint violation = duplicate
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
export async function scrapeAdzuna() {
  const scraper = new AdzunaScraper();
  return await scraper.scrape();
}
