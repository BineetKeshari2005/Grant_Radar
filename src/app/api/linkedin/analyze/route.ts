import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { extractProfileData } from '@/services/analyzer/extractionService';
import { rankMatches, OpportunityMatchData } from '@/services/analyzer/matchingEngine';
import { generateExplanation } from '@/services/analyzer/explanationService';

export const maxDuration = 60; // Allow more time for AI processing

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input } = body;

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Input must be a string containing LinkedIn profile data or description.' }, { status: 400 });
    }

    // 1. Extract Profile using AI
    const { profile, confidence, error: extractionError } = await extractProfileData(input);
    
    if (extractionError || !profile) {
      return NextResponse.json({ error: extractionError || 'Failed to extract profile.' }, { status: 500 });
    }

    if (confidence < 0.1) {
      return NextResponse.json({ 
        error: 'Profile too incomplete to analyze. Please provide more detailed professional information.',
        profile 
      }, { status: 400 });
    }

    // 2. Fetch Active Opportunities
    // Let's only fetch the columns we need for matching
    const { data: opportunities, error: dbError } = await supabase
      .from('opportunities')
      .select('id, title, organization, category, tags, country, remote_type, student_eligible, women_founder_friendly, indian_applicant_eligible, deadline, funding_amount, description, application_link, source_url')
      .eq('status', 'active');

    if (dbError) {
      console.error('Supabase query error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch opportunities.' }, { status: 500 });
    }

    if (!opportunities || opportunities.length === 0) {
      return NextResponse.json({ profile, matches: [] });
    }

    // Convert to OpportunityMatchData
    const typedOpportunities: OpportunityMatchData[] = opportunities.map(opp => ({
      ...opp,
      tags: opp.tags || [],
      student_eligible: opp.student_eligible ?? false,
      women_founder_friendly: opp.women_founder_friendly ?? false,
      indian_applicant_eligible: opp.indian_applicant_eligible ?? false,
    }));

    // 3. Score and Rank Opportunities
    const rankedMatches = rankMatches(profile, typedOpportunities);

    // 4. Generate Explanations
    const results = rankedMatches.map(match => ({
      opportunity: match.opportunity,
      matchScore: match.score,
      explanation: generateExplanation(profile, match),
      breakdown: match.breakdown
    }));

    // 5. Optionally Store the Profile (Fire and Forget)
    // Assuming auth might be present in a real scenario, we just save the profile anonymously here
    const { error: insertError } = await supabase
      .from('analyzed_profiles')
      .insert([{
        name: profile.name,
        current_title: profile.current_title,
        current_company: profile.current_company,
        skills: profile.skills,
        experience_years: profile.experience_years,
        experience_level: profile.experience_level,
        location: profile.location,
        education: profile.education,
        languages: profile.languages,
        interests: profile.interests,
        certifications: profile.certifications,
        is_student: profile.is_student,
        leadership_experience: profile.leadership_experience,
        entrepreneurship: profile.entrepreneurship,
        research_background: profile.research_background,
        target_interests: profile.target_interests,
        raw_input: input,
        extraction_confidence: confidence
      }]);
      
    if (insertError) {
      console.warn("Could not save profile to analyzed_profiles table (table might not exist yet):", insertError.message);
    }

    return NextResponse.json({
      profile,
      matches: results
    });

  } catch (err: any) {
    console.error('LinkedIn Analyze Error:', err);
    return NextResponse.json({ error: err.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
