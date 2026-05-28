import { openai } from './aiClient';

export async function categorizeOpportunity(title: string, description: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You categorize opportunities. Return ONLY ONE of these EXACT strings: scholarship, fellowship, accelerator, grant, competition, conference, exchange_program, government_scheme, giveaway, other. No other text.'
        },
        {
          role: 'user',
          content: `Title: ${title}\nDescription: ${description}`
        }
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const cat = response.choices[0]?.message?.content?.trim().toLowerCase() || 'other';
    const valid = [
      'scholarship', 'fellowship', 'accelerator', 'grant', 
      'competition', 'conference', 'exchange_program', 
      'government_scheme', 'giveaway', 'other'
    ];
    
    return valid.includes(cat) ? cat : 'other';
  } catch (error) {
    console.error('Error categorizing opportunity:', error);
    return 'other';
  }
}
