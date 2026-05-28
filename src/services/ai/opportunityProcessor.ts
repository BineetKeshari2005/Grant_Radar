import { supabase } from '@/lib/supabaseClient';
import { extractOpportunity } from './opportunityExtractor';

export async function processRawOpportunities() {
  let aiSuccess = 0;
  let aiFailed = 0;

  // Fetch up to 20 raw opportunities to process
  const { data: rawOpps, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('status', 'raw')
    .limit(20);

  if (error || !rawOpps) {
    console.error('Error fetching raw opportunities:', error);
    return { aiSuccess, aiFailed };
  }

  for (const opp of rawOpps) {
    if (!opp.raw_text) {
      aiFailed++;
      continue;
    }

    try {
      const extracted: any = await extractOpportunity(opp.raw_text, opp.title, opp.source_url);

      if (extracted) {
        // Update the opportunity with extracted data and set status to active
        const { error: updateError } = await supabase
          .from('opportunities')
          .update({
            title: extracted.title || opp.title,
            organization: extracted.organization || 'Unknown',
            country: extracted.country || null,
            region: extracted.region || null,
            category: extracted.category || 'other',
            description: extracted.description || opp.raw_text.substring(0, 500),
            eligibility: extracted.eligibility || null,
            funding_amount: extracted.funding_amount || null,
            deadline: extracted.deadline || null,
            application_link: extracted.application_link || opp.source_url,
            tags: extracted.tags || [],
            remote_type: extracted.remote_type || null,
            women_founder_friendly: extracted.women_founder_friendly || false,
            indian_applicant_eligible: extracted.indian_applicant_eligible || false,
            student_eligible: extracted.student_eligible || false,
            age_limit: extracted.age_limit || null,
            application_fee: extracted.application_fee || null,
            status: 'active'
          })
          .eq('id', opp.id);

        if (updateError) {
          console.error(`Error updating opportunity ${opp.id}:`, updateError);
          aiFailed++;
        } else {
          aiSuccess++;
        }
      } else {
        aiFailed++;
        // Mark as expired so we don't keep trying
        await supabase.from('opportunities').update({ status: 'expired' }).eq('id', opp.id);
      }
    } catch (error) {
      console.error(`AI extraction error for ${opp.id}:`, error);
      aiFailed++;
    }
  }

  return { aiSuccess, aiFailed };
}
