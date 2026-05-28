import * as cheerio from 'cheerio';
import { BaseScraper, RawOpportunity } from './baseScraper';

export class RssScraper extends BaseScraper {
  name = 'RSSFeeds';
  sourceUrl = 'Multiple RSS Feeds';
  
  private feeds = [
    'https://opportunitydesk.org/feed',
    'https://www.idealist.org/feed/opportunities/rss'
  ];

  async scrape(): Promise<RawOpportunity[]> {
    const results: RawOpportunity[] = [];

    for (const feedUrl of this.feeds) {
      try {
        const response = await fetch(feedUrl, {
          headers: { 'User-Agent': 'ScrapeScout AI Bot' }
        });
        if (!response.ok) continue;
        const xml = await response.text();
        const $ = cheerio.load(xml, { xmlMode: true });
        
        $('item').each((_, el) => {
          const title = $(el).find('title').text().trim();
          const link = $(el).find('link').text().trim();
          const desc = $(el).find('description').text().trim();
          
          if (title && link) {
            results.push({
              title,
              sourceUrl: link,
              rawText: `${title}\n\n${desc}`
            });
          }
        });
      } catch (e) {
        console.error(`Error fetching RSS feed ${feedUrl}:`, e);
      }
    }

    return results.slice(0, 30);
  }
}
