import { invokeLLM } from "../_core/llm";

export interface ExperienceEvaluation {
  score: number; // 0-100
  yearsOfExperience: number;
  seniority: string; // junior, mid, senior, lead
  hasLeadership: boolean;
  relevantRoles: string[];
  reasoning: string;
}

/**
 * Experience Agent: Evaluates professional experience match
 */
export async function evaluateExperience(
  jobDescription: string,
  resumeText: string,
  candidateName: string
): Promise<ExperienceEvaluation> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an experience evaluator. Analyze job requirements and candidate background to assess experience match.

Return your analysis in JSON format:
{
  "score": <0-100>,
  "yearsOfExperience": <number>,
  "seniority": "<junior|mid|senior|lead>",
  "hasLeadership": <boolean>,
  "relevantRoles": [<list of candidate's roles relevant to the job>],
  "reasoning": "<brief explanation of experience match>"
}`,
      },
      {
        role: "user",
        content: `Job Description:\n${jobDescription}\n\nCandidate: ${candidateName}\n\nResume:\n${resumeText}\n\nEvaluate the professional experience match. Return JSON only.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "experience_evaluation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            score: { type: "number", description: "Experience match score 0-100" },
            yearsOfExperience: { type: "number", description: "Total years of experience" },
            seniority: {
              type: "string",
              enum: ["junior", "mid", "senior", "lead"],
              description: "Career level",
            },
            hasLeadership: { type: "boolean", description: "Has leadership experience" },
            relevantRoles: {
              type: "array",
              items: { type: "string" },
              description: "Relevant job titles/roles",
            },
            reasoning: { type: "string", description: "Explanation of the score" },
          },
          required: ["score", "yearsOfExperience", "seniority", "hasLeadership", "relevantRoles", "reasoning"],
          additionalProperties: false,
        },
      },
    },
  });

  const messageContent = response.choices[0]?.message.content;
  if (!messageContent) {
    throw new Error("Failed to get experience evaluation from LLM");
  }

  const content = typeof messageContent === "string" ? messageContent : "";
  if (!content) {
    throw new Error("Experience evaluation response is not a string");
  }

  try {
    const evaluation = JSON.parse(content);
    return {
      score: Math.min(100, Math.max(0, evaluation.score || 0)),
      yearsOfExperience: evaluation.yearsOfExperience || 0,
      seniority: ["junior", "mid", "senior", "lead"].includes(evaluation.seniority)
        ? evaluation.seniority
        : "mid",
      hasLeadership: evaluation.hasLeadership || false,
      relevantRoles: Array.isArray(evaluation.relevantRoles) ? evaluation.relevantRoles : [],
      reasoning: evaluation.reasoning || "No reasoning provided",
    };
  } catch (error) {
    console.error("Error parsing experience evaluation:", error);
    throw new Error("Failed to parse experience evaluation");
  }
}
