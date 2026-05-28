export function repairJson(text: string): string {
  let cleaned = text.trim();
  
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\n?/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\n?/, '');
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\n?```$/, '');
  }
  
  cleaned = cleaned.trim();
  
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch (e) {
    // Attempt to extract from first { to last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    return cleaned; // return original if repair fails
  }
}
