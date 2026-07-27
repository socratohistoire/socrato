import type { PedagogicalQuestionDefinition, StructuredResponseAnalysis } from "./types.ts";

const DISPOSITIONS = new Set(["substantive", "too_short", "off_topic", "incomprehensible", "nonsense_or_spam", "inappropriate"]);
const OUTCOMES = new Set(["satisfactory", "partially_satisfactory", "insufficient", "non_exploitable"]);
const LEVELS = new Set(["demonstrated", "partial", "not_demonstrated", "not_assessed"]);
const ACTIONS = new Set(["complete_question", "request_revision", "offer_hint", "handle_non_exploitable"]);
const CONFIDENCE = new Set(["low", "medium", "high"]);
const ALLOWED_KEYS = new Set([
  "responseDisposition", "pedagogicalOutcome", "historicalAccuracy", "documentUse",
  "justificationQuality", "primaryOperationPerformance", "demonstratedKnowledgeIds",
  "observedOperationIds", "usedDocumentIds", "observedStrengths", "missingElements",
  "nextAction", "confidence",
]);

export class InvalidAnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAnalysisError";
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function ensureKnownIds(values: string[], allowed: readonly string[], label: string) {
  const allowedIds = new Set(allowed);
  if (values.some((value) => !allowedIds.has(value))) {
    throw new InvalidAnalysisError(`L’analyse contient un identifiant ${label} non autorisé.`);
  }
}

export function validateStructuredAnalysis(
  candidate: unknown,
  question: PedagogicalQuestionDefinition,
): StructuredResponseAnalysis {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new InvalidAnalysisError("L’analyse doit être un objet structuré.");
  }
  const record = candidate as Record<string, unknown>;
  if (Object.keys(record).some((key) => !ALLOWED_KEYS.has(key))) {
    throw new InvalidAnalysisError("L’analyse contient un champ non autorisé.");
  }
  if (!DISPOSITIONS.has(String(record.responseDisposition))
    || !OUTCOMES.has(String(record.pedagogicalOutcome))
    || !LEVELS.has(String(record.historicalAccuracy))
    || !LEVELS.has(String(record.documentUse))
    || !LEVELS.has(String(record.justificationQuality))
    || !LEVELS.has(String(record.primaryOperationPerformance))
    || !ACTIONS.has(String(record.nextAction))
    || !CONFIDENCE.has(String(record.confidence))) {
    throw new InvalidAnalysisError("L’analyse contient une valeur de contrat invalide.");
  }
  for (const key of ["demonstratedKnowledgeIds", "observedOperationIds", "usedDocumentIds", "observedStrengths", "missingElements"] as const) {
    if (!isStringArray(record[key])) throw new InvalidAnalysisError(`Le champ ${key} doit être une liste de textes.`);
  }
  ensureKnownIds(record.demonstratedKnowledgeIds as string[], question.historicalKnowledgeIds, "de connaissance");
  ensureKnownIds(record.observedOperationIds as string[], question.operationIds, "d’opération");
  ensureKnownIds(record.usedDocumentIds as string[], question.documentIds, "de document");

  const disposition = record.responseDisposition as StructuredResponseAnalysis["responseDisposition"];
  const outcome = record.pedagogicalOutcome as StructuredResponseAnalysis["pedagogicalOutcome"];
  const nextAction = record.nextAction as StructuredResponseAnalysis["nextAction"];
  if (disposition !== "substantive" && (outcome !== "non_exploitable" || nextAction !== "handle_non_exploitable")) {
    throw new InvalidAnalysisError("Une réponse non exploitable ne peut pas demander une transition pédagogique ordinaire.");
  }
  const expectedAction = {
    satisfactory: "complete_question",
    partially_satisfactory: "request_revision",
    insufficient: "offer_hint",
    non_exploitable: "handle_non_exploitable",
  }[outcome];
  if (nextAction !== expectedAction) throw new InvalidAnalysisError("La transition demandée ne correspond pas au résultat.");

  return record as StructuredResponseAnalysis;
}

export function neutralAnalysis(): StructuredResponseAnalysis {
  return {
    responseDisposition: "incomprehensible",
    pedagogicalOutcome: "non_exploitable",
    historicalAccuracy: "not_assessed",
    documentUse: "not_assessed",
    justificationQuality: "not_assessed",
    primaryOperationPerformance: "not_assessed",
    demonstratedKnowledgeIds: [],
    observedOperationIds: [],
    usedDocumentIds: [],
    observedStrengths: [],
    missingElements: ["L’analyse locale n’a pas pu être validée."],
    nextAction: "handle_non_exploitable",
    confidence: "low",
  };
}
