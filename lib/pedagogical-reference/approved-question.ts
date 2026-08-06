import { INTELLECTUAL_OPERATION_IDS } from "./reference-card.ts";
import { SECONDARY_FOUR_KNOWLEDGE_HEADINGS } from "./secondary-four.ts";
import type { ApprovedQuestion } from "./types.ts";

export type ApprovedQuestionValidationErrors = Partial<Record<"identity" | "content" | "sources" | "approval", string>>;

export function createEmptyApprovedQuestion(knowledgeHeadingId: string, sequence: number): ApprovedQuestion {
  if (!SECONDARY_FOUR_KNOWLEDGE_HEADINGS.some(({ id }) => id === knowledgeHeadingId)) {
    throw new Error(`Rubrique de connaissances inconnue : ${knowledgeHeadingId}`);
  }
  if (!Number.isInteger(sequence) || sequence < 1) throw new Error("La séquence de question doit être positive.");
  return {
    schemaVersion: 1,
    id: `question:${knowledgeHeadingId}:${String(sequence).padStart(3, "0")}`,
    scope: "notional",
    knowledgeHeadingId,
    relatedKnowledgeHeadingIds: [knowledgeHeadingId],
    referenceCardId: `reference-card:${knowledgeHeadingId}`,
    historicalRecordId: `historical-record:${knowledgeHeadingId}`,
    status: "not-started",
    format: "short-answer",
    prompt: "",
    instruction: "",
    expectedAnswer: "",
    historicalDocumentIds: [],
    commonErrors: [],
    distractors: [],
    operationId: "establish_facts",
    sourceIds: [],
    sourceCatalog: [],
    rationale: "",
    review: {
      documented: false,
      historicallyVerified: false,
      pedagogicallyVerified: false,
      biasAndLanguageReviewed: false,
      approvedBy: null,
      approvedVersion: null,
      approvedAt: null,
    },
  };
}

export function validateApprovedQuestion(question: ApprovedQuestion): ApprovedQuestionValidationErrors {
  const errors: ApprovedQuestionValidationErrors = {};
  const headingIds = new Set(SECONDARY_FOUR_KNOWLEDGE_HEADINGS.map(({ id }) => id));
  const verifiedSourceIds = new Set(question.sourceCatalog.filter(({ verificationStatus }) => verificationStatus === "verified").map(({ id }) => id));
  const reviewable = question.status === "ready-for-review" || question.status === "approved";
  const relatedHeadingIds = new Set(question.relatedKnowledgeHeadingIds);
  if (!headingIds.has(question.knowledgeHeadingId)
    || !question.relatedKnowledgeHeadingIds.every((id) => headingIds.has(id))
    || !relatedHeadingIds.has(question.knowledgeHeadingId)
    || (question.scope === "notional" && relatedHeadingIds.size !== 1)
    || (question.scope === "transversal" && relatedHeadingIds.size < 2)
    || question.referenceCardId !== `reference-card:${question.knowledgeHeadingId}`
    || question.historicalRecordId !== `historical-record:${question.knowledgeHeadingId}`) {
    errors.identity = "La question doit pointer vers le dossier et la fiche de la même rubrique officielle.";
  }
  if (!INTELLECTUAL_OPERATION_IDS.includes(question.operationId)
    || (reviewable && (!question.prompt.trim() || !question.instruction.trim() || !question.expectedAnswer.trim() || !question.rationale.trim()))
    || (question.format === "multiple-choice" && (question.distractors.length < 3 || question.answerOptions?.length !== 4 || question.answerOptions.filter(({ correct }) => correct).length !== 1))) {
    errors.content = "La question doit être complète et conforme à son format et à une opération canonique.";
  }
  const requiresHistoricalDocument = question.format !== "multiple-choice" && question.format !== "short-answer";
  if (reviewable && (question.sourceIds.length === 0 || (requiresHistoricalDocument && question.historicalDocumentIds.length === 0) || question.sourceIds.some((id) => !verifiedSourceIds.has(id)))) {
    errors.sources = "Une question prête à valider doit être documentée par des sources vérifiées.";
  }
  if (question.status === "approved") {
    const checks = [question.review.documented, question.review.historicallyVerified, question.review.pedagogicallyVerified, question.review.biasAndLanguageReviewed];
    if (!checks.every(Boolean) || !question.review.approvedBy || !question.review.approvedVersion || !question.review.approvedAt) {
      errors.approval = "Une question approuvée exige tous les contrôles, un responsable, une version et une date.";
    }
  }
  return errors;
}
