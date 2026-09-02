export type AICallType = "pedagogical_analysis" | "summary";

export type AICallMetadata = {
  model: string;
  callType: AICallType;
  activityId: string;
  questionId: string | null;
  waitDurationMs?: number;
};

/**
 * Records cost-attribution metadata only. Student answers and generated text must
 * never be added to this event.
 */
export function recordAICall(metadata: AICallMetadata) {
  console.info("[ai-call]", metadata);
}
