import OpenAI from 'openai';
import { z } from 'zod';

// We use OpenAI SDK but point it to Groq if OPENAI_API_KEY is not present
const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
const baseURL = process.env.OPENAI_API_KEY ? undefined : 'https://api.groq.com/openai/v1';

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
});

const model = process.env.OPENAI_API_KEY ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile';

export const ProfileSchema = z.object({
  name: z.string().nullable().describe("The person's full name"),
  current_title: z.string().nullable().describe("Current job title (e.g. Senior Software Engineer)"),
  current_company: z.string().nullable().describe("Current employer"),
  skills: z.array(z.string()).describe("List of technical and professional skills"),
  experience_years: z.number().nullable().describe("Total years of professional experience"),
  experience_level: z.enum(["entry", "junior", "mid", "senior"]).nullable().describe("Calculated from years: entry (0-2), junior (2-5), mid (5-10), senior (10+)"),
  location: z.string().nullable().describe("Primary location/country"),
  education: z.array(z.string()).describe("Degrees, schools, fields"),
  languages: z.array(z.string()).describe("Languages spoken"),
  interests: z.array(z.string()).describe("Professional interests/focus areas"),
  certifications: z.array(z.string()).describe("Relevant certifications"),
  is_student: z.boolean().describe("Whether currently a student"),
  leadership_experience: z.boolean().describe("Whether they have leadership/management experience"),
  entrepreneurship: z.boolean().describe("Whether they founded companies or have startup experience"),
  research_background: z.boolean().describe("Whether they have research/academic background"),
  target_interests: z.array(z.string()).describe("What they're looking for (e.g. Fellowship, Accelerator)"),
});

export type ExtractedProfile = z.infer<typeof ProfileSchema>;

export async function extractProfileData(rawInput: string): Promise<{ profile: ExtractedProfile | null; confidence: number; error?: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert AI extraction system. Your job is to extract structured professional data from LinkedIn profiles, resumes, or user descriptions.
You MUST respond with a JSON object strictly following this schema:
{
  "name": string | null,
  "current_title": string | null,
  "current_company": string | null,
  "skills": string[],
  "experience_years": number | null,
  "experience_level": "entry" | "junior" | "mid" | "senior" | null,
  "location": string | null,
  "education": string[],
  "languages": string[],
  "interests": string[],
  "certifications": string[],
  "is_student": boolean,
  "leadership_experience": boolean,
  "entrepreneurship": boolean,
  "research_background": boolean,
  "target_interests": string[]
}

Rules:
1. Be STRICT. If a field is missing or unclear, use null for strings/numbers or false for booleans. Do not guess.
2. Ensure skills and interests are extracted as clean, concise strings.
3. Calculate 'experience_level' based on 'experience_years' (entry: 0-2, junior: 2-5, mid: 5-10, senior: 10+). If unknown, use null.
4. If the input is just a URL without any profile text, you obviously cannot extract data, return empty/null fields.
5. Provide valid JSON.`
        },
        {
          role: "user",
          content: `Extract data from the following profile input:\n\n${rawInput}`
        }
      ],
      temperature: 0,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from AI.");
    }

    const parsedData = JSON.parse(content);
    
    // Validate with Zod
    const validatedData = ProfileSchema.parse(parsedData);
    
    // Calculate confidence based on fields that actually matter for matching
    // Boolean fields (is_student, leadership, etc.) are excluded since false is a valid answer, not "missing"
    let score = 0;
    const maxScore = 10;
    
    if (validatedData.name) score += 1;
    if (validatedData.current_title) score += 1;
    if (validatedData.skills.length > 0) score += 2;       // Weighted higher — critical for matching
    if (validatedData.experience_years !== null) score += 1;
    if (validatedData.experience_level) score += 1;
    if (validatedData.location) score += 1;
    if (validatedData.education.length > 0) score += 1;
    if (validatedData.interests.length > 0) score += 1.5;   // Weighted higher — critical for matching
    if (validatedData.target_interests.length > 0) score += 0.5;
    
    const confidence = score / maxScore;

    return { profile: validatedData, confidence };
    
  } catch (error) {
    console.error("Profile Extraction Error:", error);
    return { profile: null, confidence: 0, error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}
