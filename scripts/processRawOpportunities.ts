import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { processRawOpportunities } from '../src/services/opportunitiesService';

async function main() {
  console.log('Starting AI processing...');
  const result = await processRawOpportunities();
  console.log('Processing Complete:', result);
}

main();
