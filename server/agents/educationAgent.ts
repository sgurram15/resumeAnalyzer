import { invokeLLM } from "../_core/llm";

export interface EducationEvaluation {
  score: number; // 0-100
  degree: string;
  degreeMatch: boolean;
  certifications: string[];
  relevantCertifications: string[];
  reasoning: string;
}

/**
 * Education Agent: Evaluates educational background match
 */
export async function evaluateEducation(
  jobDescription: string,
  resumeText: string,
  candidateName: string
): Promise<EducationEvaluation> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an education evaluator. Analyze job requirements and candidate education to assess educational match.

Return your analysis in JSON format:
{
  "score": <0-100>,
  "degree": "<candidate's degree or 'Self-taught'>",
  "degreeMatch": <boolean>,
  "certifications": [<all certifications candidate has>],
  "relevantCertifications": [<certifications relevant to the job>],
  "reasoning": "<brief explanation of education match>"
}`,
      },
      {
        role: "user",
        content: `Job Description:\n${jobDescription}\n\nCandidate: ${candidateName}\n\nResume:\n${resumeText}\n\nEvaluate the educational background match. Return JSON only.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "education_evaluation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            score: { type: "number", description: "Education match score 0-100" },
            degree: { type: "string", description: "Candidate's degree" },
            degreeMatch: { type: "boolean", description: "Does degree match job requirements" },
            certifications: {
              type: "array",
              items: { type: "string" },
              description: "All certifications",
            },
            relevantCertifications: {
              type: "array",
              items: { type: "string" },
              description: "Relevant certifications",
            },
            reasoning: { type: "string", description: "Explanation of the score" },
          },
          required: ["score", "degree", "degreeMatch", "certifications", "relevantCertifications", "reasoning"],
          additionalProperties: false,
        },
      },
    },
  });

  const messageContent = response.choices[0]?.message.content;
  if (!messageContent) {
    throw new Error("Failed to get education evaluation from LLM");
  }

  const content = typeof messageContent === "string" ? messageContent : "";
  if (!content) {
    throw new Error("Education evaluation response is not a string");
  }

  try {
    const evaluation = JSON.parse(content);
    return {
      score: Math.min(100, Math.max(0, evaluation.score || 0)),
      degree: evaluation.degree || "Not specified",
      degreeMatch: evaluation.degreeMatch || false,
      certifications: Array.isArray(evaluation.certifications) ? evaluation.certifications : [],
      relevantCertifications: Array.isArray(evaluation.relevantCertifications)
        ? evaluation.relevantCertifications
        : [],
      reasoning: evaluation.reasoning || "No reasoning provided",
    };
  } catch (error) {
    console.error("Error parsing education evaluation:", error);
    throw new Error("Failed to parse education evaluation");
  }
}
