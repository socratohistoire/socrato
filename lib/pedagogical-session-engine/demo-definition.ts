import type { LearningSessionQuestion, StudentLearningSessionData } from "../student-learning-session/types.ts";
import type { ExplicitHintLevel, PedagogicalQuestionDefinition, PedagogicalSessionDefinition } from "./types.ts";

export function createHintSequence(question: LearningSessionQuestion): Record<ExplicitHintLevel, string> {
  return {
    1: question.localHint,
    2: question.primaryOperationId === "causal_connections"
      ? "Explique maintenant le lien entre les trois étapes : comment le refus britannique ferme-t-il la voie aux réformes et contribue-t-il à intensifier le mécontentement? N’en fais pas l’unique cause des Rébellions."
      : question.documentRelations.length === 0
        ? "Découpe la question en éléments simples : réponds d’abord à la première partie, puis ajoute chacun des éléments demandés. Appuie-toi sur tes connaissances sans chercher de document."
        : question.documentRelations.length === 1
          ? `${question.localHint} Ensuite, explique en une phrase comment l’élément observé répond à la question, sans recopier le document.`
          : `${question.localHint} Ensuite, compare ou relie les éléments relevés pour répondre précisément à la question, sans recopier les documents.`,
  };
}

function questionDefinition(question: LearningSessionQuestion, notionId: string): PedagogicalQuestionDefinition {
  return {
    id: question.id,
    notionId,
    questionPrompt: question.prompt,
    instruction: question.instruction,
    primaryOperationId: question.primaryOperationId,
    operationIds: question.intellectualOperations.map(({ id }) => id),
    historicalKnowledgeIds: [...question.historicalKnowledgeIds],
    documentIds: question.documentRelations.map(({ documentId }) => documentId),
    requiredDocumentIds: question.requiredDocumentIds ?? question.documentRelations.map(({ documentId }) => documentId),
    maxAttempts: question.maxAttempts,
    hintSequence: createHintSequence(question),
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
