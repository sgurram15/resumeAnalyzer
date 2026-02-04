import { invokeLLM } from "../_core/llm";

export interface SkillsEvaluation {
  score: number; // 0-100
  matched: string[];
  missing: string[];
  partial: string[];
  reasoning: string;
}

/**
 * Skills Agent: Evaluates technical skills match between job requirements and candidate
 */
export async function evaluateSkills(
  jobDescription: string,
  resumeText: string,
  candidateName: string
): Promise<SkillsEvaluation> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a technical skills evaluator. Analyze the job requirements and candidate resume to evaluate skills match.
        
Return your analysis in JSON format:
{
  "score": <0-100>,
  "matched": [<list of skills candidate has that match job requirements>],
  "missing": [<list of required skills candidate lacks>],
  "partial": [<list of similar skills that partially match>],
  "reasoning": "<brief explanation of skills match>"
}`,
      },
      {
        role: "user",
        content: `Job Description:\n${jobDescription}\n\nCandidate: ${candidateName}\n\nResume:\n${resumeText}\n\nEvaluate the technical skills match. Return JSON only.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "skills_evaluation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            score: { type: "number", description: "Skills match score 0-100" },
            matched: {
              type: "array",
              items: { type: "string" },
              description: "Skills that match",
            },
            missing: {
              type: "array",
              items: { type: "string" },
              description: "Required skills that are missing",
            },
            partial: {
              type: "array",
              items: { type: "string" },
              description: "Similar skills that partially match",
            },
            reasoning: { type: "string", description: "Explanation of the score" },
          },
          required: ["score", "matched", "missing", "partial", "reasoning"],
          additionalProperties: false,
        },
      },
    },
  });

  const messageContent = response.choices[0]?.message.content;
  if (!messageContent) {
    throw new Error("Failed to get skills evaluation from LLM");
  }

  const content = typeof messageContent === "string" ? messageContent : "";
  if (!content) {
    throw new Error("Skills evaluation response is not a string");
  }

  try {
    const evaluation = JSON.parse(content);
    return {
      score: Math.min(100, Math.max(0, evaluation.score || 0)),
      matched: Array.isArray(evaluation.matched) ? evaluation.matched : [],
      missing: Array.isArray(evaluation.missing) ? evaluation.missing : [],
      partial: Array.isArray(evaluation.partial) ? evaluation.partial : [],
      reasoning: evaluation.reasoning || "No reasoning provided",
    };
  } catch (error) {
    console.error("Error parsing skills evaluation:", error);
    throw new Error("Failed to parse skills evaluation");
  }
}
