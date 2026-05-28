import { supabase } from '@/lib/supabaseClient';

export async function isDuplicate(sourceUrl: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('id')
    .eq('source_url', sourceUrl)
    .limit(1);

  if (error) {
    console.error('Error checking duplicate:', error);
    return false;
  }

  return data && data.length > 0;
}

export async function insertOpportunity(data: object): Promise<boolean> {
  const { error } = await supabase
    .from('opportunities')
    .insert(data);

  if (error) {
    console.error('Error inserting opportunity:', error);
    return false;
  }

  return true;
}
