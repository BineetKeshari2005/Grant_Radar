import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { runAllScrapers } from '../src/services/scrapers/scraperRunner';
import { processRawOpportunities } from '../src/services/opportunitiesService';
import { markExpiredOpportunities } from '../src/services/opportunities/expiryService';

async function main() {
  console.log('--- STARTING DAILY PIPELINE ---');
  
  console.log('1. Running Scrapers...');
  const scrapeSummary = await runAllScrapers();
  console.log('Scrape Summary:', scrapeSummary);
  
  console.log('2. Processing Raw Opportunities with AI...');
  const aiSummary = await processRawOpportunities();
  console.log('AI Processing Summary:', aiSummary);
  
  console.log('3. Marking Expired Opportunities...');
  const expiredCount = await markExpiredOpportunities();
  console.log(`Expired Opportunities Marked: ${expiredCount}`);

  console.log('--- DAILY PIPELINE COMPLETE ---');
}

main();
