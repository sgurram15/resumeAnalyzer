import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, screenings, resumes, candidateScores } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Screening queries
export async function createScreening(userId: number, jobTitle: string, jobDescription: string, jobDescriptionFileUrl?: string, jobDescriptionFileKey?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(screenings).values({
    userId,
    jobTitle,
    jobDescription,
    jobDescriptionFileUrl,
    jobDescriptionFileKey,
  });

  return result;
}

export async function getScreeningById(screeningId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(screenings).where(eq(screenings.id, screeningId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserScreenings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(screenings).where(eq(screenings.userId, userId)).orderBy(desc(screenings.createdAt));
}

// Resume queries
export async function createResume(screeningId: number, fileName: string, fileUrl: string, fileKey: string, candidateName?: string, extractedText?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(resumes).values({
    screeningId,
    candidateName,
    fileName,
    fileUrl,
    fileKey,
    extractedText,
  });

  return result;
}

export async function getScreeningResumes(screeningId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(resumes).where(eq(resumes.screeningId, screeningId));
}

export async function getResumeById(resumeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(resumes).where(eq(resumes.id, resumeId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateResumeExtractedText(resumeId: number, extractedText: string, candidateName?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { extractedText };
  if (candidateName) {
    updateData.candidateName = candidateName;
  }

  return db.update(resumes).set(updateData).where(eq(resumes.id, resumeId));
}

// Candidate score queries
export async function createCandidateScore(
  screeningId: number,
  resumeId: number,
  overallScore: number,
  skillsMatch?: number,
  experienceMatch?: number,
  educationMatch?: number,
  keyHighlights?: string,
  strengths?: string,
  weaknesses?: string,
  relevantExperience?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(candidateScores).values({
    screeningId,
    resumeId,
    overallScore: overallScore.toString(),
    skillsMatch: skillsMatch?.toString(),
    experienceMatch: experienceMatch?.toString(),
    educationMatch: educationMatch?.toString(),
    keyHighlights,
    strengths,
    weaknesses,
    relevantExperience,
  });
}

export async function getScreeningCandidateScores(screeningId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(candidateScores).where(eq(candidateScores.screeningId, screeningId)).orderBy(desc(candidateScores.overallScore));
}

export async function getCandidateScoreById(scoreId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(candidateScores).where(eq(candidateScores.id, scoreId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateCandidateScore(
  scoreId: number,
  overallScore: number,
  skillsMatch?: number,
  experienceMatch?: number,
  educationMatch?: number,
  keyHighlights?: string,
  strengths?: string,
  weaknesses?: string,
  relevantExperience?: string,
  ranking?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {
    overallScore: overallScore.toString(),
  };

  if (skillsMatch !== undefined) updateData.skillsMatch = skillsMatch.toString();
  if (experienceMatch !== undefined) updateData.experienceMatch = experienceMatch.toString();
  if (educationMatch !== undefined) updateData.educationMatch = educationMatch.toString();
  if (keyHighlights !== undefined) updateData.keyHighlights = keyHighlights;
  if (strengths !== undefined) updateData.strengths = strengths;
  if (weaknesses !== undefined) updateData.weaknesses = weaknesses;
  if (relevantExperience !== undefined) updateData.relevantExperience = relevantExperience;
  if (ranking !== undefined) updateData.ranking = ranking;

  return db.update(candidateScores).set(updateData).where(eq(candidateScores.id, scoreId));
}
