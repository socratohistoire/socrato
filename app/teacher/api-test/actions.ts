"use server";

import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getQuestionsForKnowledgeHeading } from "@/lib/pedagogical-reference";
import { createPedagogicalFeedback } from "@/lib/pedagogical-session-engine/feedback";
import { createConfiguredOpenAIPedagogicalAnalyzer } from "@/lib/pedagogical-session-engine/openai-analyzer";
import { createPedagogicalQuestionDefinition } from "@/lib/pedagogical-session-engine/question-context";
import type { StudentResponse } from "@/lib/pedagogical-session-engine/types";
import { validateStructuredAnalysis } from "@/lib/pedagogical-session-engine/validation";
import { createCatalogLearningSessionQuestions } from "@/lib/student-learning-session/demo-provider";

type TestRequest = { questionId: string; content: string; attemptNumber: number };

export async function analyzeActeUnionTestResponse(request: TestRequest) {
  await requireTeacherActor();
  if (process.env.SOCRATO_PEDAGOGICAL_ANALYZER !== "openai") {
    return { ok: false as const, error: "Terra n’est pas activée dans la configuration actuelle." };
  }
  if (typeof request?.questionId !== "string" || typeof request?.content !== "string"
    || request.content.trim().length === 0 || request.content.length > 10_000
    || !Number.isInteger(request.attemptNumber) || request.attemptNumber < 1 || request.attemptNumber > 3) {
    return { ok: false as const, error: "Choisissez une question et écrivez une réponse à tester." };
  }
  try {
    const ids = getQuestionsForKnowledgeHeading("acte-union").map(({ id }) => id);
    const catalog = createCatalogLearningSessionQuestions(ids);
    const question = catalog.questions.find(({ id }) => id === request.questionId);
    if (!question) return { ok: false as const, error: "Cette question n’appartient pas au catalogue de l’Acte d’Union." };
    const definition = createPedagogicalQuestionDefinition(question, "acte-union", "Acte d’Union", catalog.documents);
    const response: StudentResponse = {
      sessionId: "teacher-api-test", activityId: "teacher-api-test", questionId: definition.id,
      notionId: definition.notionId, primaryOperationId: definition.primaryOperationId,
      operationIds: [...definition.operationIds], historicalKnowledgeIds: [...definition.historicalKnowledgeIds],
      documentIds: [...definition.documentIds], attemptNumber: request.attemptNumber, hintLevel: 0, content: request.content,
    };
    const analysis = validateStructuredAnalysis(await createConfiguredOpenAIPedagogicalAnalyzer().analyze(response, definition), definition);
    const feedback = createPedagogicalFeedback(analysis, definition, analysis.pedagogicalOutcome === "non_exploitable" ? request.attemptNumber : 0);
    return { ok: true as const, analysis, feedback };
  } catch {
    return { ok: false as const, error: "Terra n’a pas pu analyser cette réponse. Vérifiez la configuration et les crédits, puis réessayez." };
  }
}
