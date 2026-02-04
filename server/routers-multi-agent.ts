import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getScreeningById, getScreeningResumes, getResumeById } from "./db";
import { getScoringWeights, saveCandidateScore, updateScoringWeights } from "./db-multi-agent";
import { aggregateScores, normalizeWeights } from "./agents/scoreAggregator";

/**
 * Multi-agent screening router
 * Extends the existing screening router with multi-agent scoring capabilities
 */
export const multiAgentScreeningRouter = router({
  /**
   * Screen candidates using multi-agent evaluation
   */
  screenCandidates: protectedProcedure
    .input(
      z.object({
        screeningId: z.number(),
        weights: z
          .object({
            skills: z.number().optional(),
            experience: z.number().optional(),
            education: z.number().optional(),
            culture: z.number().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const screening = await getScreeningById(input.screeningId);

      if (!screening || screening.userId !== ctx.user.id) {
        throw new Error("Screening not found or access denied");
      }

      // Get or create scoring weights
      let weights = await getScoringWeights(input.screeningId);

      // Override with provided weights if any
      if (input.weights) {
        const customWeights = normalizeWeights(input.weights);
        weights = customWeights;
        await updateScoringWeights(input.screeningId, weights);
      }

      // Get all resumes for this screening
      const resumes = await getScreeningResumes(input.screeningId);

      if (resumes.length === 0) {
        throw new Error("No resumes found for this screening");
      }

      // Score each resume using multi-agent system
      const scores = [];
      for (let i = 0; i < resumes.length; i++) {
        const resume = resumes[i];

        if (!resume.extractedText) {
          console.warn(`Resume ${resume.id} has no extracted text, skipping`);
          continue;
        }

        try {
          const aggregatedScore = await aggregateScores(
            screening.jobDescription,
            resume.extractedText,
            resume.candidateName || "Unknown",
            weights
          );

          await saveCandidateScore(
            input.screeningId,
            resume.id,
            aggregatedScore,
            i + 1 // ranking will be updated after all scores
          );

          scores.push({
            resumeId: resume.id,
            score: aggregatedScore.overallScore,
          });
        } catch (error) {
          console.error(`Error scoring resume ${resume.id}:`, error);
          throw new Error(`Failed to score resume: ${resume.fileName}`);
        }
      }

      // Sort by score and update rankings
      scores.sort((a, b) => b.score - a.score);

      return {
        success: true,
        screened: scores.length,
        topCandidate: scores[0],
      };
    }),

  /**
   * Get detailed multi-agent score breakdown for a candidate
   */
  getDetailedScore: protectedProcedure
    .input(z.object({ screeningId: z.number(), resumeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const screening = await getScreeningById(input.screeningId);

      if (!screening || screening.userId !== ctx.user.id) {
        throw new Error("Screening not found or access denied");
      }

      const resume = await getResumeById(input.resumeId);
      if (!resume) {
        throw new Error("Resume not found");
      }

      // Note: In a real implementation, you'd fetch the stored score from the database
      // For now, this returns the structure
      return {
        resumeId: resume.id,
        candidateName: resume.candidateName,
        fileName: resume.fileName,
        // Scores would be fetched from database
      };
    }),

  /**
   * Update scoring weights for a screening
   */
  updateWeights: protectedProcedure
    .input(
      z.object({
        screeningId: z.number(),
        weights: z.object({
          skills: z.number().min(0).max(1),
          experience: z.number().min(0).max(1),
          education: z.number().min(0).max(1),
          culture: z.number().min(0).max(1),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const screening = await getScreeningById(input.screeningId);

      if (!screening || screening.userId !== ctx.user.id) {
        throw new Error("Screening not found or access denied");
      }

      const normalized = normalizeWeights(input.weights);
      await updateScoringWeights(input.screeningId, normalized);

      return {
        success: true,
        weights: normalized,
      };
    }),
});
