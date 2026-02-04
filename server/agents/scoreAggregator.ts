import { evaluateSkills, SkillsEvaluation } from "./skillsAgent";
import { evaluateExperience, ExperienceEvaluation } from "./experienceAgent";
import { evaluateEducation, EducationEvaluation } from "./educationAgent";
import { evaluateCulture, CultureEvaluation } from "./cultureAgent";

export interface ScoringWeights {
  skills: number; // 0-1
  experience: number; // 0-1
  education: number; // 0-1
  culture: number; // 0-1
}

export interface AggregatedScore {
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  cultureScore: number;
  skillsDetails: SkillsEvaluation;
  experienceDetails: ExperienceEvaluation;
  educationDetails: EducationEvaluation;
  cultureDetails: CultureEvaluation;
  breakdown: {
    skillsContribution: number;
    experienceContribution: number;
    educationContribution: number;
    cultureContribution: number;
  };
}

/**
 * Default scoring weights (40% skills, 35% experience, 15% education, 10% culture)
 */
export const DEFAULT_WEIGHTS: ScoringWeights = {
  skills: 0.4,
  experience: 0.35,
  education: 0.15,
  culture: 0.1,
};

/**
 * Score Aggregator: Combines all agent scores with configurable weights
 */
export async function aggregateScores(
  jobDescription: string,
  resumeText: string,
  candidateName: string,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): Promise<AggregatedScore> {
  // Validate weights sum to 1.0
  const totalWeight = weights.skills + weights.experience + weights.education + weights.culture;
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    console.warn(`Weights don't sum to 1.0 (total: ${totalWeight}), normalizing...`);
  }

  // Run all agents in parallel
  const [skillsDetails, experienceDetails, educationDetails, cultureDetails] = await Promise.all([
    evaluateSkills(jobDescription, resumeText, candidateName),
    evaluateExperience(jobDescription, resumeText, candidateName),
    evaluateEducation(jobDescription, resumeText, candidateName),
    evaluateCulture(jobDescription, resumeText, candidateName),
  ]);

  // Calculate weighted contributions
  const skillsContribution = skillsDetails.score * weights.skills;
  const experienceContribution = experienceDetails.score * weights.experience;
  const educationContribution = educationDetails.score * weights.education;
  const cultureContribution = cultureDetails.score * weights.culture;

  // Calculate overall score
  const overallScore = Math.round(
    skillsContribution + experienceContribution + educationContribution + cultureContribution
  );

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    skillsScore: skillsDetails.score,
    experienceScore: experienceDetails.score,
    educationScore: educationDetails.score,
    cultureScore: cultureDetails.score,
    skillsDetails,
    experienceDetails,
    educationDetails,
    cultureDetails,
    breakdown: {
      skillsContribution: Math.round(skillsContribution),
      experienceContribution: Math.round(experienceContribution),
      educationContribution: Math.round(educationContribution),
      cultureContribution: Math.round(cultureContribution),
    },
  };
}

/**
 * Get default weights for a screening
 */
export function getDefaultWeights(): ScoringWeights {
  return { ...DEFAULT_WEIGHTS };
}

/**
 * Normalize weights to sum to 1.0
 */
export function normalizeWeights(weights: Partial<ScoringWeights>): ScoringWeights {
  const normalized = {
    skills: weights.skills ?? DEFAULT_WEIGHTS.skills,
    experience: weights.experience ?? DEFAULT_WEIGHTS.experience,
    education: weights.education ?? DEFAULT_WEIGHTS.education,
    culture: weights.culture ?? DEFAULT_WEIGHTS.culture,
  };

  const total = normalized.skills + normalized.experience + normalized.education + normalized.culture;

  if (total === 0) {
    return DEFAULT_WEIGHTS;
  }

  return {
    skills: normalized.skills / total,
    experience: normalized.experience / total,
    education: normalized.education / total,
    culture: normalized.culture / total,
  };
}
