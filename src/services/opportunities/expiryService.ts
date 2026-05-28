import { supabase } from '@/lib/supabaseClient';

export async function markExpiredOpportunities(): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('opportunities')
      .update({ status: 'expired' })
      .lt('deadline', today)
      .eq('status', 'active')
      .select('id');

    if (error) throw error;

    return data ? data.length : 0;
  } catch (error) {
    console.error('Error marking expired opportunities:', error);
    return 0;
  }
}
