import { NextResponse } from 'next/server';
import { extractOpportunity } from '@/services/ai/opportunityExtractor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText, title, sourceUrl } = body;

    if (!rawText || !title || !sourceUrl) {
      return NextResponse.json({ error: 'rawText, title, and sourceUrl are required' }, { status: 400 });
    }

    const result = await extractOpportunity(rawText, title, sourceUrl);

    if (!result) {
      return NextResponse.json({ error: 'Failed to extract opportunity' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
