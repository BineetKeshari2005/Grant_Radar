import { supabase } from '@/lib/supabaseClient';
import { extractOpportunity } from './ai/opportunityExtractor';

export async function processRawOpportunities() {
  let processed = 0;
  let success = 0;
  let failed = 0;

  try {
    const { data: rawOpps, error } = await supabase
      .from('opportunities')
      .select('*')
      .or('status.eq.raw,and(status.eq.active,raw_text.not.is.null,title.not.is.null,description.is.null)')
      .limit(20);

    if (error || !rawOpps) {
      console.error('Error fetching opportunities to process:', error);
      return { processed, success, failed };
    }

    for (const opp of rawOpps) {
      processed++;
      if (!opp.raw_text) {
        failed++;
        continue;
      }

      try {
        const extracted: any = await extractOpportunity(opp.raw_text, opp.title, opp.source_url);

        if (extracted) {
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
              funding_amount: extracted.fundingAmount || extracted.funding_amount || null,
              deadline: extracted.deadline || null,
              application_link: extracted.applicationLink || extracted.application_link || opp.source_url,
              tags: extracted.tags || [],
              remote_type: extracted.remoteType || extracted.remote_type || null,
              women_founder_friendly: extracted.womenFounderFriendly || extracted.women_founder_friendly || false,
              indian_applicant_eligible: extracted.indianApplicantEligible || extracted.indian_applicant_eligible || false,
              student_eligible: extracted.studentEligible || extracted.student_eligible || false,
              age_limit: extracted.ageLimit || extracted.age_limit || null,
              application_fee: extracted.applicationFee || extracted.application_fee || null,
              status: 'active'
            })
            .eq('id', opp.id);

          if (updateError) {
            console.error(`Error updating opportunity ${opp.id}:`, updateError);
            failed++;
          } else {
            success++;
          }
        } else {
          failed++;
          await supabase.from('opportunities').update({ status: 'expired' }).eq('id', opp.id);
        }
      } catch (err) {
        console.error(`AI extraction error for ${opp.id}:`, err);
        failed++;
      }
    }
  } catch (err) {
    console.error('processRawOpportunities outer error:', err);
  }

  console.log(`Processed: ${processed}, Success: ${success}, Failed: ${failed}`);
  return { processed, success, failed };
}
