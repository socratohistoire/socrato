import type { ResponseAnalyzer } from "./ports.ts";
import type { PedagogicalQuestionDefinition, StudentResponse } from "./types.ts";

export async function analyzeWithFallback(
  response: StudentResponse,
  question: PedagogicalQuestionDefinition,
  primaryAnalyzer: ResponseAnalyzer,
  fallbackAnalyzer: ResponseAnalyzer,
): Promise<{ analysis: unknown; usedFallback: boolean }> {
  try {
    return { analysis: await primaryAnalyzer.analyze(response, question), usedFallback: false };
  } catch {
    return { analysis: await fallbackAnalyzer.analyze(response, question), usedFallback: true };
  }
}
