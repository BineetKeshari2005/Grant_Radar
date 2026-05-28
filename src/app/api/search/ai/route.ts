import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { parseNaturalQuery } from '@/services/ai/naturalSearch';

export async function POST(request: Request) {
  try {
    const { query, sort, page = 1, pageSize = 12 } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const filters = await parseNaturalQuery(query);
    
    let dbQuery = supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    if (filters.search) {
      dbQuery = dbQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.category) {
      dbQuery = dbQuery.eq('category', filters.category);
    }
    if (filters.country) {
      dbQuery = dbQuery.ilike('country', `%${filters.country}%`);
    }
    if (filters.remote_type) {
      dbQuery = dbQuery.eq('remote_type', filters.remote_type);
    }
    if (filters.student_eligible === true) {
      dbQuery = dbQuery.eq('student_eligible', true);
    }
    if (filters.women_founder_friendly === true) {
      dbQuery = dbQuery.eq('women_founder_friendly', true);
    }
    if (filters.indian_applicant_eligible === true) {
      dbQuery = dbQuery.eq('indian_applicant_eligible', true);
    }

    if (sort === 'deadline') {
      dbQuery = dbQuery.order('deadline', { ascending: true, nullsFirst: false });
    } else if (sort === 'funding') {
      dbQuery = dbQuery.order('funding_amount', { ascending: false, nullsFirst: false });
    } else {
      dbQuery = dbQuery.order('created_at', { ascending: false });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    dbQuery = dbQuery.range(from, to);

    const { data, count, error } = await dbQuery;

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      filters_applied: filters
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
