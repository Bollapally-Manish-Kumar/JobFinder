/**
 * Indian API Jobs Scraper
 * Source: https://jobs.indianapi.in
 * 
 * RATE LIMIT: 10 requests/month (strict!)
 * Run this WEEKLY, not daily - separate from runAll.js
 * 
 * Usage: node backend/src/scrapers/IndianAPIScraper.js
 */

import axios from 'axios';
import prisma from '../utils/prisma.js';
import { normalizeJob } from './classifyJob.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load env when run directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const BASE_URL = 'https://jobs.indianapi.in';

export class IndianAPIScraper {
    constructor() {
        this.name = 'IndianAPI';
        this.apiKey = process.env.INDIAN_API_KEY;

        if (!this.apiKey) {
            console.warn('[IndianAPI] ⚠️ Missing API key. Set INDIAN_API_KEY in .env');
        }
    }

    /**
     * Fetch jobs from Indian API
     * @param {number} limit - Max jobs to fetch (default 100 to maximize value)
     */
    async fetchJobs(limit = 100) {
        if (!this.apiKey) {
            console.log(`[${this.name}] Skipping - no API key configured`);
            return [];
        }

        try {
            console.log(`[${this.name}] Fetching up to ${limit} jobs...`);

            const response = await axios.get(`${BASE_URL}/jobs`, {
                headers: {
                    'X-Api-Key': this.apiKey
                },
                params: {
                    limit: limit
                },
                timeout: 30000
            });

            const jobs = response.data?.jobs || response.data || [];

            if (Array.isArray(jobs)) {
                console.log(`[${this.name}] ✅ Received ${jobs.length} jobs from API`);
                return jobs.map(job => ({
                    title: job.title || job.job_title,
                    company: job.company || job.company_name || 'Unknown Company',
                    location: job.location || job.job_location || 'India',
                    description: job.description || job.job_description,
                    salary: job.salary || job.salary_range || null,
                    url: job.url || job.apply_url || job.job_url,
                    type: job.job_type || job.type || 'Full-time',
                    postedAt: job.posted_at || job.date_posted ? new Date(job.posted_at || job.date_posted) : null
                }));
            }

            console.log(`[${this.name}] Unexpected response format`);
            return [];
        } catch (error) {
            if (error.response?.status === 401) {
                console.error(`[${this.name}] ❌ Invalid API key`);
            } else if (error.response?.status === 429) {
                console.error(`[${this.name}] ❌ Rate limit exceeded (10/month)`);
            } else {
                console.error(`[${this.name}] ❌ Error: ${error.message}`);
            }
            return [];
        }
    }

    /**
     * Main scrape method
     */
    async scrape() {
        console.log('═══════════════════════════════════════════');
        console.log(`[${this.name}] 🇮🇳 Indian Jobs API Sync`);
        console.log('═══════════════════════════════════════════');
        console.log('⚠️  REMINDER: 10 requests/month limit!');
        console.log('');

        const jobs = await this.fetchJobs(100);

        if (jobs.length === 0) {
            return { found: 0, saved: 0, skipped: 0 };
        }

        let saved = 0;
        let skipped = 0;

        for (const rawJob of jobs) {
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
                if (error.code === 'P2002') {
                    skipped++;
                } else {
                    console.error(`[${this.name}] Error saving: ${error.message}`);
                }
            }
        }

        console.log('');
        console.log(`[${this.name}] ✅ Results:`);
        console.log(`   Found: ${jobs.length}`);
        console.log(`   Saved: ${saved}`);
        console.log(`   Skipped (duplicates): ${skipped}`);
        console.log('═══════════════════════════════════════════');

        return { found: jobs.length, saved, skipped };
    }
}

// Run if called directly
if (process.argv[1]?.includes('IndianAPIScraper')) {
    const scraper = new IndianAPIScraper();
    scraper.scrape()
        .then(() => {
            console.log('Done!');
            process.exit(0);
        })
        .catch(err => {
            console.error('Fatal error:', err);
            process.exit(1);
        });
}

export default IndianAPIScraper;
