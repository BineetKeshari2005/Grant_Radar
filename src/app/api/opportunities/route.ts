import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const country = searchParams.get('country');
    const remote_type = searchParams.get('remote_type');
    const student_eligible = searchParams.get('student_eligible');
    const women_founder_friendly = searchParams.get('women_founder_friendly');
    const indian_applicant_eligible = searchParams.get('indian_applicant_eligible');
    const sort = searchParams.get('sort');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);

    let query = supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (country) {
      query = query.ilike('country', `%${country}%`);
    }
    if (remote_type) {
      query = query.eq('remote_type', remote_type);
    }
    if (student_eligible === 'true') {
      query = query.eq('student_eligible', true);
    }
    if (women_founder_friendly === 'true') {
      query = query.eq('women_founder_friendly', true);
    }
    if (indian_applicant_eligible === 'true') {
      query = query.eq('indian_applicant_eligible', true);
    }

    if (sort === 'deadline') {
      query = query.order('deadline', { ascending: true, nullsFirst: false });
    } else if (sort === 'funding') {
      query = query.order('funding_amount', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data,
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
