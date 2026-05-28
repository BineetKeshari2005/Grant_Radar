import { MatchResult } from './matchingEngine';
import { ExtractedProfile } from './extractionService';

export function generateExplanation(profile: ExtractedProfile, match: MatchResult): string {
  const opp = match.opportunity;
  const breakdown = match.breakdown;
  
  const explanations: string[] = [];

  // Skill explanation
  if (breakdown.skillScore >= 30) {
    explanations.push(`Strong skill alignment: Your background heavily overlaps with the requirements for this ${opp.category}.`);
  } else if (breakdown.skillScore >= 15) {
    explanations.push(`Relevant skills: Some of your technical skills align with what they are looking for.`);
  } else if (profile.skills.length > 0 && opp.tags && opp.tags.length > 0) {
    explanations.push(`Skill gap warning: This role may require technical skills outside your primary stack.`);
  }

  // Category/Interest explanation
  if (breakdown.categoryScore >= 15) {
    explanations.push(`Interest match: This aligns perfectly with your focus areas.`);
  }

  // Experience explanation
  if (breakdown.experienceScore >= 12) {
    explanations.push(`Experience fit: As a ${profile.experience_level || 'professional'}, you are well-positioned for this level of opportunity.`);
  } else if (breakdown.experienceScore === 0) {
    explanations.push(`Experience mismatch: Note that this opportunity typically targets a different career stage.`);
  }

  // Location explanation
  const isRemote = opp.remote_type === 'remote' || opp.remote_type === 'fully remote';
  if (breakdown.locationScore >= 10) {
    if (isRemote) {
      explanations.push(`Accessible location: This is a remote opportunity, making it flexible for your location.`);
    } else {
      explanations.push(`Geographic match: You meet the location criteria for this program.`);
    }
  }

  // Bonus/Demographic explanation
  if (breakdown.demographicScore >= 5 || breakdown.bonusScore >= 5) {
    let bonusText = "Added bonuses: ";
    const reasons = [];
    if (profile.is_student && opp.student_eligible) reasons.push("it is student-friendly");
    if (profile.entrepreneurship && breakdown.bonusScore > 0) reasons.push("your startup experience is highly valued here");
    if (profile.research_background && breakdown.bonusScore > 0) reasons.push("your research background gives you an edge");
    if (profile.leadership_experience && breakdown.bonusScore > 0) reasons.push("they are looking for your leadership experience");
    
    if (reasons.length > 0) {
      bonusText += reasons.join(" and ") + ".";
      explanations.push(bonusText);
    }
  }

  // Combine and format
  if (explanations.length === 0) {
    return "This opportunity is a general match based on your overall profile.";
  }

  return explanations.join(" ");
}
