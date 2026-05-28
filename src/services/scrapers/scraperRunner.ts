import { OpportunityDeskScraper } from './opportunityDeskScraper';
import { YouthOpportunitiesScraper } from './youthOpportunitiesScraper';
import { DevpostScraper } from './devpostScraper';
import { RssScraper } from './rssScraper';
import { isDuplicate, insertOpportunity } from '../deduplicator';
import { logSource } from '../sourceLogger';

export async function runAllScrapers() {
  const scrapers = [
    new OpportunityDeskScraper(),
    new YouthOpportunitiesScraper(),
    new DevpostScraper(),
    new RssScraper()
  ];

  const summary = [];

  for (const scraper of scrapers) {
    let found = 0;
    let inserted = 0;
    let status = 'success';
    let errorMessage = '';

    try {
      const results = await scraper.scrape();
      found = results.length;

      for (const item of results) {
        const duplicate = await isDuplicate(item.sourceUrl);
        if (!duplicate) {
          const success = await insertOpportunity({
            title: item.title,
            raw_text: item.rawText,
            source_url: item.sourceUrl,
            status: 'raw',
            category: 'other', // dummy value required by schema before AI process
            organization: 'Unknown', // dummy value required by schema
            description: 'Raw scraped content', // dummy value required by schema
            application_link: item.sourceUrl, // dummy value required by schema
          });
          if (success) inserted++;
        }
      }
    } catch (error: any) {
      status = 'error';
      errorMessage = error.message;
      console.error(`Scraper ${scraper.name} failed:`, error);
    }

    await logSource(scraper.name, scraper.sourceUrl, status, found, errorMessage);

    summary.push({
      name: scraper.name,
      found,
      inserted,
      failed: status === 'error'
    });
  }

  return summary;
}
