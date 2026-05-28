import * as cheerio from 'cheerio';

export interface RawOpportunity {
  title: string;
  rawText: string;
  sourceUrl: string;
}

export abstract class BaseScraper {
  abstract name: string;
  abstract sourceUrl: string;

  abstract scrape(): Promise<RawOpportunity[]>;

  protected async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.text();
  }

  protected parseWithCheerio(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }
}
