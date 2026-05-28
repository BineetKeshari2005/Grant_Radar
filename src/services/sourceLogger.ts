import { supabase } from '@/lib/supabaseClient';

export async function logSource(name: string, url: string, status: string, found: number, errorMsg?: string) {
  try {
    const { error } = await supabase
      .from('source_logs')
      .insert({
        source_name: name,
        source_url: url,
        status,
        opportunities_found: found,
        error_message: errorMsg || null
      });

    if (error) {
      console.error('Failed to log source:', error);
    }
  } catch (e) {
    console.error('Error logging source:', e);
  }
}
