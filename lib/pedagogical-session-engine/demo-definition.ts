import type { LearningSessionQuestion, StudentLearningSessionData } from "../student-learning-session/types.ts";
import type { ExplicitHintLevel, PedagogicalQuestionDefinition, PedagogicalSessionDefinition } from "./types.ts";

function hintSequence(question: LearningSessionQuestion): Record<ExplicitHintLevel, string> {
  return {
    1: question.documentRelations.length
      ? "Observe le document 1 et relève précisément les populations et le nombre de députés indiqués, sans encore tirer de conclusion."
      : "Repère une connaissance précise liée à la question, sans encore tirer de conclusion.",
    2: "Structure ta réponse ainsi : Je relève que… Ensuite, j’explique le lien en indiquant que… Appuie chaque étape sur les documents demandés sans compléter la conclusion à l’avance.",
  };
}

function questionDefinition(question: LearningSessionQuestion, notionId: string): PedagogicalQuestionDefinition {
  return {
    id: question.id,
    notionId,
    primaryOperationId: question.primaryOperationId,
    operationIds: question.intellectualOperations.map(({ id }) => id),
    historicalKnowledgeIds: [...question.historicalKnowledgeIds],
    documentIds: question.documentRelations.map(({ documentId }) => documentId),
    requiredDocumentIds: question.requiredDocumentIds ?? question.documentRelations.map(({ documentId }) => documentId),
    hintSequence: hintSequence(question),
  };
}

export function createDemoPedagogicalDefinition(data: StudentLearningSessionData): PedagogicalSessionDefinition {
  return {
    sessionId: data.id,
    activityId: data.activityId,
    notionId: data.notionId,
    dashboardHref: data.dashboardHref,
    questions: data.questions.map((question) => questionDefinition(question, data.notionId)),
  };
}
