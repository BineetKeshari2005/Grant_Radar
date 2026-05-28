import { NextResponse } from 'next/server';
import { processRawOpportunities } from '@/services/opportunitiesService';

export async function POST() {
  try {
    const stats = await processRawOpportunities();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
