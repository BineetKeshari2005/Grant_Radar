import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { runAllScrapers } from '../src/services/scrapers/scraperRunner';

async function main() {
  console.log('Starting scrapers...');
  const summary = await runAllScrapers();
  console.log('Scraper Summary:');
  console.dir(summary, { depth: null });
}

main();
