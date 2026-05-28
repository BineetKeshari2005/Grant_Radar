import { NextResponse } from 'next/server';
import { runAllScrapers } from '@/services/scrapers/scraperRunner';
import { processRawOpportunities } from '@/services/opportunitiesService';
import { markExpiredOpportunities } from '@/services/opportunities/expiryService';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const secret = process.env.PIPELINE_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scrapeSummary = await runAllScrapers();
    const aiSummary = await processRawOpportunities();
    const expiredCount = await markExpiredOpportunities();

    return NextResponse.json({
      success: true,
      scrapers: scrapeSummary,
      aiProcessing: aiSummary,
      expiredMarked: expiredCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
