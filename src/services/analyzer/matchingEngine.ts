import { ExtractedProfile } from './extractionService';

export interface OpportunityMatchData {
  id: string;
  title: string;
  organization: string;
  category: string;
  tags: string[];
  country: string | null;
  remote_type: string | null;
  student_eligible: boolean;
  women_founder_friendly: boolean;
  indian_applicant_eligible: boolean;
  deadline: string | null;
  funding_amount: string | null;
  description: string;
  application_link?: string;
  source_url?: string;
}

export interface MatchResult {
  opportunity: OpportunityMatchData;
  score: number;
  breakdown: {
    skillScore: number;
    categoryScore: number;
    experienceScore: number;
    locationScore: number;
    demographicScore: number;
    bonusScore: number;
  };
}

// Simple Levenshtein distance for fuzzy matching
function getEditDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[b.length][a.length];
}

// Fuzzy matches a skill against a target tag
function isFuzzyMatch(skill: string, tag: string): boolean {
  const s1 = skill.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = tag.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!s1 || !s2) return false;
  
  // Exact match or substring match
  if (s1.includes(s2) || s2.includes(s1)) return true;
  
  // Very simple abbreviations: JS -> Javascript, ML -> Machine Learning
  if (s1 === 'js' && s2.includes('javascript')) return true;
  if (s2 === 'js' && s1.includes('javascript')) return true;
  if (s1 === 'ml' && s2.includes('machinelearning')) return true;
  if (s2 === 'ml' && s1.includes('machinelearning')) return true;
  if (s1 === 'ai' && s2.includes('artificialintelligence')) return true;
  if (s2 === 'ai' && s1.includes('artificialintelligence')) return true;

  // Edit distance check (allow 1 typo for every 4 characters)
  const distance = getEditDistance(s1, s2);
  const maxAllowedDistance = Math.floor(Math.max(s1.length, s2.length) / 4);
  
  return distance <= maxAllowedDistance;
}

export function scoreOpportunity(profile: ExtractedProfile, opp: OpportunityMatchData): MatchResult {
  let skillScore = 0;
  let categoryScore = 0;
  let experienceScore = 0;
  let locationScore = 0;
  let demographicScore = 0;
  let bonusScore = 0;

  // 1. Skill Matching (40 max)
  const oppTags = opp.tags || [];
  if (profile.skills.length > 0 && oppTags.length > 0) {
    let matchedSkills = 0;
    for (const skill of profile.skills) {
      if (oppTags.some(tag => isFuzzyMatch(skill, tag))) {
        matchedSkills++;
      }
    }
    skillScore = Math.min(40, (matchedSkills / profile.skills.length) * 40);
  } else if (profile.skills.length === 0 && oppTags.length === 0) {
    // Both empty, give neutral score to avoid punishing
    skillScore = 20;
  } else if (profile.skills.length > 0 && oppTags.length === 0) {
    // Opp has no tags, fallback to checking description/title (basic keyword search)
    let matchedSkills = 0;
    const text = (opp.title + " " + opp.description).toLowerCase();
    for (const skill of profile.skills) {
      if (text.includes(skill.toLowerCase())) {
        matchedSkills++;
      }
    }
    skillScore = Math.min(40, (matchedSkills / profile.skills.length) * 40);
  }

  // 2. Category Alignment (20 max)
  const combinedInterests = [...profile.interests, ...profile.target_interests].map(i => i.toLowerCase());
  const oppCategory = opp.category.toLowerCase().replace('_', ' ');
  
  if (combinedInterests.some(i => i.includes(oppCategory) || oppCategory.includes(i))) {
    categoryScore = 20;
  } else if (combinedInterests.some(i => (i.includes('startup') || i.includes('founder')) && oppCategory.includes('accelerator'))) {
    categoryScore = 15;
  } else if (combinedInterests.length === 0) {
    categoryScore = 10; // Neutral if user specified nothing
  }

  // 3. Experience Level Match (15 max)
  const level = profile.experience_level;
  if (level === 'entry' && oppCategory.includes('scholarship')) experienceScore = 15;
  else if (level === 'senior' && oppCategory.includes('accelerator')) experienceScore = 15;
  else if (level === 'mid' && oppCategory.includes('fellowship')) experienceScore = 12;
  else if (!level) experienceScore = 10; // Default if unknown
  else experienceScore = 5; // Slight base score for any level

  // 4. Location/Geography Match (15 max)
  const userLoc = (profile.location || '').toLowerCase();
  const oppCountry = (opp.country || '').toLowerCase();
  const isRemote = opp.remote_type === 'remote' || opp.remote_type === 'fully remote';
  
  if (!oppCountry || oppCountry === 'global' || oppCountry === 'international') {
    locationScore = 15; // Full points for global
  } else if (userLoc && (userLoc.includes(oppCountry) || oppCountry.includes(userLoc))) {
    locationScore = 15; // Exact match
  } else if (isRemote) {
    locationScore = 10; // Remote offers flexibility
  } else if (opp.indian_applicant_eligible && userLoc.includes('india')) {
    locationScore = 15;
  } else {
    locationScore = 0;
  }

  // 5. Demographic Eligibility (10 max)
  if (profile.is_student && opp.student_eligible) demographicScore += 5;
  if (opp.indian_applicant_eligible && userLoc.includes('india')) demographicScore += 5;
  // Assume generic 5 points if they match any specific flag they care about
  if (demographicScore === 0) demographicScore = 5; // Neutral base
  demographicScore = Math.min(10, demographicScore);

  // 6. Special Bonuses (+5 each)
  if (profile.entrepreneurship && (oppCategory.includes('accelerator') || oppCategory.includes('grant'))) bonusScore += 5;
  if (profile.research_background && (oppCategory.includes('fellowship') || oppCategory.includes('research'))) bonusScore += 5;
  if (profile.leadership_experience && opp.description.toLowerCase().includes('leadership')) bonusScore += 5;

  const totalScore = skillScore + categoryScore + experienceScore + locationScore + demographicScore + bonusScore;
  const finalScore = Math.min(100, Math.round(totalScore));

  return {
    opportunity: opp,
    score: finalScore,
    breakdown: {
      skillScore: Math.round(skillScore),
      categoryScore: Math.round(categoryScore),
      experienceScore: Math.round(experienceScore),
      locationScore: Math.round(locationScore),
      demographicScore: Math.round(demographicScore),
      bonusScore: Math.round(bonusScore)
    }
  };
}

export function rankMatches(profile: ExtractedProfile, opportunities: OpportunityMatchData[]): MatchResult[] {
  const scored = opportunities.map(opp => scoreOpportunity(profile, opp));
  
  // Filter out weak matches (< 35) and sort descending
  return scored
    .filter(match => match.score >= 35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Take top 10
}
