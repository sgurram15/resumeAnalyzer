import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Job screening sessions - each screening is associated with a job description
 */
export const screenings = mysqlTable("screenings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  jobDescription: text("jobDescription").notNull(),
  jobDescriptionFileUrl: varchar("jobDescriptionFileUrl", { length: 512 }),
  jobDescriptionFileKey: varchar("jobDescriptionFileKey", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Screening = typeof screenings.$inferSelect;
export type InsertScreening = typeof screenings.$inferInsert;

/**
 * Resume documents uploaded for screening
 */
export const resumes = mysqlTable("resumes", {
  id: int("id").autoincrement().primaryKey(),
  screeningId: int("screeningId").notNull(),
  candidateName: varchar("candidateName", { length: 255 }),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 512 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  extractedText: text("extractedText"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = typeof resumes.$inferInsert;

/**
 * Candidate scoring results
 */
export const candidateScores = mysqlTable("candidateScores", {
  id: int("id").autoincrement().primaryKey(),
  screeningId: int("screeningId").notNull(),
  resumeId: int("resumeId").notNull(),
  overallScore: decimal("overallScore", { precision: 5, scale: 2 }).notNull(),
  skillsMatch: decimal("skillsMatch", { precision: 5, scale: 2 }),
  experienceMatch: decimal("experienceMatch", { precision: 5, scale: 2 }),
  educationMatch: decimal("educationMatch", { precision: 5, scale: 2 }),
  keyHighlights: text("keyHighlights"), // JSON string
  strengths: text("strengths"), // JSON string
  weaknesses: text("weaknesses"), // JSON string
  relevantExperience: text("relevantExperience"), // JSON string
  ranking: int("ranking"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CandidateScore = typeof candidateScores.$inferSelect;
export type InsertCandidateScore = typeof candidateScores.$inferInsert;
