/**
 * Run All Legal API Scrapers
 * Uses ONLY public, documented job APIs - NO web scraping
 * 
 * Legal Sources:
 * - Adzuna API (official job aggregator)
 * - Arbeitnow API (free, no key required)
 * - Remotive API (free remote jobs)
 * - The Muse API (free, no key required)
 * - Jobicy API (free remote jobs)
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

// Import ONLY legal API-based scrapers
import { AdzunaScraper } from './AdzunaScraper.js';
import { ArbeitnowScraper } from './ArbeitnowScraper.js';
import { RemotiveScraper } from './RemotiveAPIScraper.js';
import { TheMuseScraper } from './TheMuseScraper.js';
import { JobicyScraper } from './JobicyScraper.js';

/**
 * Run all legal API scrapers sequentially
 * NO fallback data - only real API results
 */
export async function runAllScrapers() {
  console.log('═══════════════════════════════════════════');
  console.log('🚀 JobFinder+ Legal Job Sync');
  console.log('═══════════════════════════════════════════');
  console.log(`Started at: ${new Date().toLocaleString()}`);
  console.log('');
  console.log('📋 Using ONLY public APIs:');
  console.log('   • Adzuna API (official job aggregator)');
  console.log('   • Arbeitnow API (free remote jobs)');
  console.log('   • Remotive API (remote tech jobs)');
  console.log('   • The Muse API (quality job listings)');
  console.log('   • Jobicy API (remote tech jobs)');
  console.log('');

  // Only use legal API-based scrapers
  const scrapers = [
    new AdzunaScraper(),
    new ArbeitnowScraper(),
    new RemotiveScraper(),
    new TheMuseScraper(),
    new JobicyScraper()
  ];

  const results = [];
  let totalFound = 0;
  let totalSaved = 0;

  for (const scraper of scrapers) {
    try {
      console.log(`\n📡 [${scraper.name}] Fetching from API...`);

      // Support both .run() and .scrape() methods
      const scrapeMethod = scraper.run || scraper.scrape;
      const result = await scrapeMethod.call(scraper);

      results.push({
        source: scraper.name,
        found: result.found || 0,
        saved: result.saved || 0
      });
      totalFound += result.found || 0;
      totalSaved += result.saved || 0;
    } catch (error) {
      console.error(`❌ [${scraper.name}] Error:`, error.message);
      results.push({
        source: scraper.name,
        error: error.message,
        found: 0,
        saved: 0
      });
    }

    // Respect rate limits - delay between API calls
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Print summary
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 SYNC SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log('');

  console.log('Source          | Found | Saved | Status');
  console.log('----------------|-------|-------|--------');

  for (const result of results) {
    const status = result.error ? '❌ Error' : '✅ OK';
    const found = String(result.found || 0).padStart(5);
    const saved = String(result.saved || 0).padStart(5);
    const name = result.source.padEnd(15);
    console.log(`${name} | ${found} | ${saved} | ${status}`);
  }

  console.log('----------------|-------|-------|--------');
  console.log(`${'TOTAL'.padEnd(15)} | ${String(totalFound).padStart(5)} | ${String(totalSaved).padStart(5)} |`);
  console.log('');

  if (totalSaved === 0 && totalFound === 0) {
    console.log('ℹ️  No new jobs found from APIs');
  } else if (totalSaved === 0) {
    console.log('ℹ️  All jobs already exist in database (no duplicates added)');
  } else {
    console.log(`✅ Added ${totalSaved} new jobs to database`);
  }

  console.log(`Completed at: ${new Date().toLocaleString()}`);
  console.log('═══════════════════════════════════════════');

  return {
    results,
    totalFound,
    totalSaved
  };
}

// Run if called directly
if (process.argv[1] && process.argv[1].includes('runAll')) {
  runAllScrapers()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

export default runAllScrapers;
