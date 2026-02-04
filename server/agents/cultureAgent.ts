import { invokeLLM } from "../_core/llm";

export interface CultureEvaluation {
  score: number; // 0-100
  traits: string[];
  indicators: string[];
  softSkills: string[];
  reasoning: string;
}

/**
 * Culture Agent: Evaluates cultural fit and soft skills
 */
export async function evaluateCulture(
  jobDescription: string,
  resumeText: string,
  candidateName: string
): Promise<CultureEvaluation> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a culture fit evaluator. Analyze job requirements and candidate background to assess cultural fit and soft skills.

Return your analysis in JSON format:
{
  "score": <0-100>,
  "traits": [<cultural traits evident from resume>],
  "indicators": [<specific resume indicators of these traits>],
  "softSkills": [<soft skills demonstrated>],
  "reasoning": "<brief explanation of culture fit score>"
}`,
      },
      {
        role: "user",
        content: `Job Description:\n${jobDescription}\n\nCandidate: ${candidateName}\n\nResume:\n${resumeText}\n\nEvaluate the cultural fit and soft skills. Return JSON only.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "culture_evaluation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            score: { type: "number", description: "Culture fit score 0-100" },
            traits: {
              type: "array",
              items: { type: "string" },
              description: "Cultural traits",
            },
            indicators: {
              type: "array",
              items: { type: "string" },
              description: "Resume indicators of traits",
            },
            softSkills: {
              type: "array",
              items: { type: "string" },
              description: "Soft skills demonstrated",
            },
            reasoning: { type: "string", description: "Explanation of the score" },
          },
          required: ["score", "traits", "indicators", "softSkills", "reasoning"],
          additionalProperties: false,
        },
      },
    },
  });

  const messageContent = response.choices[0]?.message.content;
  if (!messageContent) {
    throw new Error("Failed to get culture evaluation from LLM");
  }

  const content = typeof messageContent === "string" ? messageContent : "";
  if (!content) {
    throw new Error("Culture evaluation response is not a string");
  }

  try {
    const evaluation = JSON.parse(content);
    return {
      score: Math.min(100, Math.max(0, evaluation.score || 0)),
      traits: Array.isArray(evaluation.traits) ? evaluation.traits : [],
      indicators: Array.isArray(evaluation.indicators) ? evaluation.indicators : [],
      softSkills: Array.isArray(evaluation.softSkills) ? evaluation.softSkills : [],
      reasoning: evaluation.reasoning || "No reasoning provided",
    };
  } catch (error) {
    console.error("Error parsing culture evaluation:", error);
    throw new Error("Failed to parse culture evaluation");
  }
}
