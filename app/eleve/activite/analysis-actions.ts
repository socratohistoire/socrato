"use server";

import { cookies } from "next/headers";
import { getStudentAccessRuntime, STUDENT_SESSION_COOKIE } from "@/lib/student-access/local-runtime";
import { DatabaseStudentLearningSessionProvider } from "@/lib/student-learning-session/database-provider";
import { LocalDeterministicResponseAnalyzer } from "@/lib/pedagogical-session-engine/local-analyzer";
import { createConfiguredOpenAIPedagogicalAnalyzer } from "@/lib/pedagogical-session-engine/openai-analyzer";
import { createPedagogicalQuestionDefinition } from "@/lib/pedagogical-session-engine/question-context";
import type { StudentResponse } from "@/lib/pedagogical-session-engine/types";
import { validateStructuredAnalysis } from "@/lib/pedagogical-session-engine/validation";

type AnalysisRequest = {
  activityId: string;
  questionId: string;
  attemptNumber: number;
  hintLevel: 0 | 1 | 2;
  content: string;
  priorTurn?: StudentResponse["priorTurn"];
};

function validIdentifier(value: unknown, maximumLength = 120): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximumLength && /^[a-z0-9]+(?:[-:][a-z0-9]+)*$/.test(value);
}

function validRequest(value: AnalysisRequest) {
  return validIdentifier(value.activityId) && validIdentifier(value.questionId)
    && Number.isInteger(value.attemptNumber) && value.attemptNumber >= 1 && value.attemptNumber <= 5
    && [0, 1, 2].includes(value.hintLevel)
    && typeof value.content === "string" && value.content.trim().length > 0 && value.content.length <= 10_000
    && validPriorTurn(value.priorTurn);
}

function validPriorTurn(value: AnalysisRequest["priorTurn"]) {
  if (value === undefined) return true;
  return ["satisfactory", "partially_satisfactory", "insufficient", "non_exploitable"].includes(value.pedagogicalOutcome)
    && [value.observedStrengths, value.missingElements].every((items) => Array.isArray(items) && items.length <= 4
      && items.every((item) => typeof item === "string" && item.length <= 500));
}

function configuredAnalyzer() {
  const mode = process.env.SOCRATO_PEDAGOGICAL_ANALYZER ?? "local";
  if (mode === "openai") return createConfiguredOpenAIPedagogicalAnalyzer();
  if (mode === "local") return new LocalDeterministicResponseAnalyzer();
  throw new Error("Le fournisseur d’analyse pédagogique est inconnu.");
}

export async function analyzeAuthorizedStudentResponse(request: AnalysisRequest) {
  if (!validRequest(request)) return { ok: false as const, error: "La réponse transmise est invalide." };
  const token = (await cookies()).get(STUDENT_SESSION_COOKIE)?.value;
  const studentSession = token ? await getStudentAccessRuntime().sessions.findActiveByToken(token) : null;
  if (!studentSession) return { ok: false as const, error: "La session élève n’est plus valide." };

  try {
    const learningSession = await new DatabaseStudentLearningSessionProvider().getForAnonymousStudent(
      studentSession.anonymousStudentId,
      request.activityId,
    );
    const question = learningSession?.questions.find(({ id }) => id === request.questionId);
    if (!learningSession || !question) return { ok: false as const, error: "Cette question n’appartient pas à l’activité assignée." };
    const definition = createPedagogicalQuestionDefinition(question, learningSession.notionId, learningSession.notionTitle, learningSession.documentCatalog);
    const response: StudentResponse = {
      sessionId: learningSession.id,
      activityId: learningSession.activityId,
      questionId: definition.id,
      notionId: definition.notionId,
      primaryOperationId: definition.primaryOperationId,
      operationIds: [...definition.operationIds],
      historicalKnowledgeIds: [...definition.historicalKnowledgeIds],
      documentIds: [...definition.documentIds],
      attemptNumber: request.attemptNumber,
      hintLevel: request.hintLevel,
      content: request.content,
      priorTurn: request.priorTurn,
    };
    const analysis = validateStructuredAnalysis(await configuredAnalyzer().analyze(response, definition), definition);
    return { ok: true as const, analysis };
  } catch {
    return { ok: false as const, error: "Socrato n’a pas pu analyser cette réponse. Réessaie dans un instant." };
  }
}
