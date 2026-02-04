import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createScreening, getUserScreenings, getScreeningById, createResume, getScreeningResumes, getScreeningCandidateScores } from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { multiAgentScreeningRouter } from "./routers-multi-agent";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  screening: router({
    screenCandidates: multiAgentScreeningRouter._def.procedures.screenCandidates,
    getDetailedScore: multiAgentScreeningRouter._def.procedures.getDetailedScore,
    updateWeights: multiAgentScreeningRouter._def.procedures.updateWeights,
    create: protectedProcedure
      .input(
        z.object({
          jobTitle: z.string().min(1, "Job title is required"),
          jobDescription: z.string().min(1, "Job description is required"),
          jobFile: z.instanceof(File).optional(),
          resumes: z.array(z.instanceof(File)).min(1, "At least one resume is required"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Process job file if provided
          let jobFileUrl: string | undefined;
          let jobFileKey: string | undefined;

          if (input.jobFile) {
            const buffer = await input.jobFile.arrayBuffer();
            const fileKey = `screenings/${ctx.user.id}/${nanoid()}-${input.jobFile.name}`;
            const result = await storagePut(fileKey, Buffer.from(buffer), input.jobFile.type);
            jobFileUrl = result.url;
            jobFileKey = result.key;
          }

          // Create screening record
          const screeningResult = await createScreening(
            ctx.user.id,
            input.jobTitle,
            input.jobDescription,
            jobFileUrl,
            jobFileKey
          );

          const screeningId = (screeningResult as any).insertId as number;

          // Process and store resumes
          for (const resumeFile of input.resumes) {
            const buffer = await resumeFile.arrayBuffer();
            const fileKey = `resumes/${ctx.user.id}/${screeningId}/${nanoid()}-${resumeFile.name}`;
            const result = await storagePut(fileKey, Buffer.from(buffer), resumeFile.type);

            await createResume(
              screeningId,
              resumeFile.name,
              result.url,
              result.key
            );
          }

          return {
            screeningId,
            success: true,
          };
        } catch (error) {
          console.error("Error creating screening:", error);
          throw new Error("Failed to create screening");
        }
      }),

    getById: protectedProcedure
      .input(z.object({ screeningId: z.number() }))
      .query(async ({ ctx, input }) => {
        const screening = await getScreeningById(input.screeningId);

        if (!screening || screening.userId !== ctx.user.id) {
          throw new Error("Screening not found or access denied");
        }

        return screening;
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserScreenings(ctx.user.id);
    }),

    getResumes: protectedProcedure
      .input(z.object({ screeningId: z.number() }))
      .query(async ({ ctx, input }) => {
        const screening = await getScreeningById(input.screeningId);

        if (!screening || screening.userId !== ctx.user.id) {
          throw new Error("Screening not found or access denied");
        }

        return getScreeningResumes(input.screeningId);
      }),

    getCandidateScores: protectedProcedure
      .input(z.object({ screeningId: z.number() }))
      .query(async ({ ctx, input }) => {
        const screening = await getScreeningById(input.screeningId);

        if (!screening || screening.userId !== ctx.user.id) {
          throw new Error("Screening not found or access denied");
        }

        return getScreeningCandidateScores(input.screeningId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
