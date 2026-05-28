import { openai } from './aiClient';
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionUserPrompt } from './extractionPrompt';
import { repairJson } from './jsonRepair';

export async function extractOpportunity(rawText: string, title: string, sourceUrl: string): Promise<object | null> {
  try {
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: buildExtractionUserPrompt(rawText, title, sourceUrl) }
      ],
      max_tokens: 1500,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '';
    if (!content) return null;

    const repaired = repairJson(content);
    return JSON.parse(repaired);
  } catch (error) {
    console.error('Error extracting opportunity:', error);
    return null;
  }
}
