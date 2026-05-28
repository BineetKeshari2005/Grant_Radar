import { BaseScraper, RawOpportunity } from './baseScraper';

export class YouthOpportunitiesScraper extends BaseScraper {
  name = 'YouthOpportunities';
  sourceUrl = 'https://www.youthop.com/opportunities';

  async scrape(): Promise<RawOpportunity[]> {
    const html = await this.fetchHtml(this.sourceUrl);
    const $ = this.parseWithCheerio(html);
    const results: RawOpportunity[] = [];

    $('article, .opportunity-item').each((_, el) => {
      const titleEl = $(el).find('h2, h3, .title').first();
      const title = titleEl.text().trim();
      const link = titleEl.find('a').attr('href') || $(el).find('a').first().attr('href');
      const snippet = $(el).find('.description, p').text().trim() || '';

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
