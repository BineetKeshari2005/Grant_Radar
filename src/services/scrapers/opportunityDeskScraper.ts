import { BaseScraper, RawOpportunity } from './baseScraper';

export class OpportunityDeskScraper extends BaseScraper {
  name = 'OpportunityDesk';
  sourceUrl = 'https://opportunitydesk.org';

  async scrape(): Promise<RawOpportunity[]> {
    const html = await this.fetchHtml(this.sourceUrl);
    const $ = this.parseWithCheerio(html);
    const results: RawOpportunity[] = [];

    $('article, .post').each((_, el) => {
      const titleEl = $(el).find('h2, h3').first();
      const title = titleEl.text().trim();
      const link = titleEl.find('a').attr('href') || $(el).find('a').first().attr('href');
      const snippet = $(el).find('p').first().text().trim() || '';

      if (title && link) {
        results.push({
          title,
          sourceUrl: link,
          rawText: `${title}\n\n${snippet}`
        });
      }
    });

    return results.slice(0, 15);
  }
}
