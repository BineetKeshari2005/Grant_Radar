import { BaseScraper, RawOpportunity } from './baseScraper';

export class DevpostScraper extends BaseScraper {
  name = 'Devpost';
  sourceUrl = 'https://devpost.com/hackathons';

  async scrape(): Promise<RawOpportunity[]> {
    const html = await this.fetchHtml(this.sourceUrl);
    const $ = this.parseWithCheerio(html);
    const results: RawOpportunity[] = [];

    $('.hackathon-tile').each((_, el) => {
      const titleEl = $(el).find('h3');
      const title = titleEl.text().trim();
      const link = $(el).find('a').attr('href');
      const tagline = $(el).find('.tagline').text().trim() || '';
      const deadline = $(el).find('.submission-period').text().trim() || '';
      const prize = $(el).find('.prize').text().trim() || '';

      if (title && link) {
        results.push({
          title,
          sourceUrl: link,
          rawText: `Hackathon: ${title}\nTagline: ${tagline}\nDeadline: ${deadline}\nPrize: ${prize}`
        });
      }
    });

    return results.slice(0, 15);
  }
}
