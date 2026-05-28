import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const [activeRes, savedRes, deadlineRes] = await Promise.all([
      supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('saved_opportunities').select('*', { count: 'exact', head: true }),
      supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('deadline', now.toISOString())
        .lte('deadline', nextWeek.toISOString())
    ]);

    if (activeRes.error) throw activeRes.error;
    if (savedRes.error) throw savedRes.error;
    if (deadlineRes.error) throw deadlineRes.error;

    return NextResponse.json({
      activeOpportunities: activeRes.count || 0,
      savedOpportunities: savedRes.count || 0,
      deadlinesThisWeek: deadlineRes.count || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
