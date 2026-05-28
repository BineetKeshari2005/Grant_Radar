import { openai } from './aiClient';
import { repairJson } from './jsonRepair';
import { OpportunityFilters } from '@/types';

export async function parseNaturalQuery(query: string): Promise<Partial<OpportunityFilters>> {
  try {
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Parse this search query into structured filters for an opportunity tracker.
Return ONLY JSON with these optional fields:
- category (one of: scholarship, fellowship, accelerator, grant, competition, conference, exchange_program, government_scheme, giveaway, other)
- country (string)
- remote_type (one of: remote, in-person, hybrid)
- student_eligible (boolean)
- women_founder_friendly (boolean)
- indian_applicant_eligible (boolean)
- search (remaining keywords as string)

Example: "remote grants for women in Europe" -> { "remote_type": "remote", "category": "grant", "women_founder_friendly": true, "country": "Europe" }`
        },
        { role: 'user', content: query }
      ],
      max_tokens: 200,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(repairJson(content));
  } catch (error) {
    console.error('Error parsing natural query:', error);
    return {};
  }
}
