import { NextResponse } from 'next/server';
import { runAllScrapers } from '@/services/scrapers/scraperRunner';
import { processRawOpportunities } from '@/services/opportunitiesService';

export async function POST() {
  try {
    // 1. Run Scrapers
    const scrapeSummary = await runAllScrapers();
    
    // 2. Process Raw with AI
    const aiSummary = await processRawOpportunities();

    let totalFound = 0;
    let totalInserted = 0;
    
    scrapeSummary.forEach(s => {
      totalFound += s.found;
      totalInserted += s.inserted;
    });

    return NextResponse.json({
      success: true,
      scraped: totalFound,
      inserted: totalInserted,
      aiSuccess: aiSummary.success,
      aiFailed: aiSummary.failed,
      sources: scrapeSummary.map(s => ({
        name: s.name,
        status: s.failed ? 'error' : 'success'
      }))
    });

  } catch (error: any) {
    console.error('Scrape run error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
