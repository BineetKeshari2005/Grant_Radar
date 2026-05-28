import OpenAI from 'openai';

let _openai: OpenAI | null = null;

export const openai: OpenAI = new Proxy({} as OpenAI, {
  get(_target, prop) {
    if (!_openai) {
      if (!process.env.GROQ_API_KEY) {
        throw new Error('Missing GROQ_API_KEY environment variable');
      }
      _openai = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }
    return (_openai as any)[prop];
  }
});
