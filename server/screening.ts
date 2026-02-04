import { invokeLLM } from "./_core/llm";

interface ScoreResult {
  overallScore: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  keyHighlights: string[];
  strengths: string[];
  weaknesses: string[];
  relevantExperience: string[];
}

/**
 * Extract text from resume using LLM
 */
export async function extractResumeText(resumeText: string): Promise<{
  candidateName: string;
  extractedText: string;
}> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert resume parser. Extract the candidate's name and provide a clean, structured summary of their resume content.",
      },
      {
        role: "user",
        content: `Parse this resume and extract the candidate name and key information:\n\n${resumeText}`,
      },
    ],
  });

  const messageContent = response.choices[0]?.message.content;
  const content = typeof messageContent === "string" ? messageContent : "";

  // Extract candidate name from response
  const nameMatch = content.match(/(?:Name|Candidate):\s*([^\n]+)/i);
  const candidateName = nameMatch ? nameMatch[1].trim() : "Unknown";

  return {
    candidateName,
    extractedText: content,
  };
}

/**
 * Score a resume against job requirements using LLM
 */
export async function scoreResume(
  jobDescription: string,
  resumeText: string,
  candidateName: string
): Promise<ScoreResult> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert recruiter and hiring manager. Analyze the candidate's resume against the job requirements and provide a detailed scoring assessment. Return your analysis in the following JSON format:
{
  "overallScore": <0-100>,
  "skillsMatch": <0-100>,
  "experienceMatch": <0-100>,
  "educationMatch": <0-100>,
  "keyHighlights": [<list of 3-5 key strengths relevant to the job>],
  "strengths": [<list of 3-5 candidate strengths>],
  "weaknesses": [<list of 2-3 areas for improvement or gaps>],
  "relevantExperience": [<list of 2-3 most relevant past experiences>]
}`,
      },
      {
        role: "user",
        content: `Job Description:\n${jobDescription}\n\nCandidate: ${candidateName}\n\nResume:\n${resumeText}\n\nProvide the scoring assessment in JSON format only.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "resume_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            overallScore: { type: "number", description: "Overall match score 0-100" },
            skillsMatch: { type: "number", description: "Skills match percentage 0-100" },
            experienceMatch: { type: "number", description: "Experience match percentage 0-100" },
            educationMatch: { type: "number", description: "Education match percentage 0-100" },
            keyHighlights: {
              type: "array",
              items: { type: "string" },
              description: "Key highlights relevant to the job",
            },
            strengths: {
              type: "array",
              items: { type: "string" },
              description: "Candidate strengths",
            },
            weaknesses: {
              type: "array",
              items: { type: "string" },
              description: "Areas for improvement or gaps",
            },
            relevantExperience: {
              type: "array",
              items: { type: "string" },
              description: "Most relevant past experiences",
            },
          },
          required: ["overallScore", "skillsMatch", "experienceMatch", "educationMatch", "keyHighlights", "strengths", "weaknesses", "relevantExperience"],
          additionalProperties: false,
        },
      },
    },
  });

  const messageContent = response.choices[0]?.message.content;
  if (!messageContent) {
    throw new Error("Failed to get scoring response from LLM");
  }

  const content = typeof messageContent === "string" ? messageContent : "";
  if (!content) {
    throw new Error("Failed to parse scoring response - content is not a string");
  }

  try {
    const scoreData = JSON.parse(content);
    return {
      overallScore: Math.min(100, Math.max(0, scoreData.overallScore || 0)),
      skillsMatch: Math.min(100, Math.max(0, scoreData.skillsMatch || 0)),
      experienceMatch: Math.min(100, Math.max(0, scoreData.experienceMatch || 0)),
      educationMatch: Math.min(100, Math.max(0, scoreData.educationMatch || 0)),
      keyHighlights: Array.isArray(scoreData.keyHighlights) ? scoreData.keyHighlights : [],
      strengths: Array.isArray(scoreData.strengths) ? scoreData.strengths : [],
      weaknesses: Array.isArray(scoreData.weaknesses) ? scoreData.weaknesses : [],
      relevantExperience: Array.isArray(scoreData.relevantExperience) ? scoreData.relevantExperience : [],
    };
  } catch (error) {
    console.error("Error parsing score response:", error);
    throw new Error("Failed to parse scoring response");
  }
}

/**
 * Extract text from PDF or DOCX file
 */
export async function extractTextFromFile(fileBuffer: Buffer, mimeType: string): Promise<string> {
  // For now, return a placeholder. In production, you'd use libraries like:
  // - pdf-parse for PDFs
  // - docx for DOCX files
  // For this MVP, we'll use the LLM to process the file content

  if (mimeType === "application/pdf") {
    // In production, use pdf-parse library
    return "[PDF content would be extracted here]";
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    // In production, use docx library
    return "[DOCX content would be extracted here]";
  }

  return fileBuffer.toString("utf-8");
}
