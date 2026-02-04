import { getDb } from "./db";
import { candidateScores, scoringWeights } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { AggregatedScore, ScoringWeights } from "./agents/scoreAggregator";

/**
 * Save multi-agent scoring results to database
 */
export async function saveCandidateScore(
  screeningId: number,
  resumeId: number,
  aggregatedScore: AggregatedScore,
  ranking: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(candidateScores).values({
    screeningId,
    resumeId,
    overallScore: aggregatedScore.overallScore.toString(),
    skillsScore: aggregatedScore.skillsScore.toString(),
    experienceScore: aggregatedScore.experienceScore.toString(),
    educationScore: aggregatedScore.educationScore.toString(),
    cultureScore: aggregatedScore.cultureScore.toString(),
    skillsDetails: JSON.stringify(aggregatedScore.skillsDetails),
    experienceDetails: JSON.stringify(aggregatedScore.experienceDetails),
    educationDetails: JSON.stringify(aggregatedScore.educationDetails),
    cultureDetails: JSON.stringify(aggregatedScore.cultureDetails),
    keyHighlights: JSON.stringify(aggregatedScore.skillsDetails.matched),
    strengths: JSON.stringify([
      ...aggregatedScore.skillsDetails.matched,
      ...aggregatedScore.cultureDetails.softSkills,
    ]),
    weaknesses: JSON.stringify([
      ...aggregatedScore.skillsDetails.missing,
      ...aggregatedScore.cultureDetails.indicators.filter((i) => i.includes("lack")),
    ]),
    relevantExperience: JSON.stringify(aggregatedScore.experienceDetails.relevantRoles),
    ranking,
  });
}

/**
 * Get or create scoring weights for a screening
 */
export async function getScoringWeights(screeningId: number): Promise<ScoringWeights> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(scoringWeights)
    .where(eq(scoringWeights.screeningId, screeningId))
    .limit(1);

  if (result.length > 0) {
    const weights = result[0];
    return {
      skills: parseFloat(weights.skillsWeight as any),
      experience: parseFloat(weights.experienceWeight as any),
      education: parseFloat(weights.educationWeight as any),
      culture: parseFloat(weights.cultureWeight as any),
    };
  }

  // Create default weights
  await db.insert(scoringWeights).values({
    screeningId,
    skillsWeight: "0.40",
    experienceWeight: "0.35",
    educationWeight: "0.15",
    cultureWeight: "0.10",
  });

  return {
    skills: 0.4,
    experience: 0.35,
    education: 0.15,
    culture: 0.1,
  };
}

/**
 * Update scoring weights for a screening
 */
export async function updateScoringWeights(
  screeningId: number,
  weights: ScoringWeights
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(scoringWeights)
    .where(eq(scoringWeights.screeningId, screeningId))
    .limit(1);

  if (existing.length > 0) {
    return db
      .update(scoringWeights)
      .set({
        skillsWeight: weights.skills.toString(),
        experienceWeight: weights.experience.toString(),
        educationWeight: weights.education.toString(),
        cultureWeight: weights.culture.toString(),
      })
      .where(eq(scoringWeights.screeningId, screeningId));
  } else {
    return db.insert(scoringWeights).values({
      screeningId,
      skillsWeight: weights.skills.toString(),
      experienceWeight: weights.experience.toString(),
      educationWeight: weights.education.toString(),
      cultureWeight: weights.culture.toString(),
    });
  }
}
