import type { ResponseAnalyzer } from "./ports.ts";
import type { PedagogicalQuestionDefinition, StructuredResponseAnalysis, StudentResponse } from "./types.ts";

export const LOCAL_ANALYZER_NOTICE = "Démonstration locale — cette analyse déterministe ne constitue pas une véritable évaluation pédagogique.";
export const LOCAL_DEMO_INPUTS = {
  satisfactory: "[demo:satisfactory]",
  partial: "[demo:partial]",
  insufficient: "[demo:insufficient]",
  offTopic: "[demo:off-topic]",
  incomprehensible: "[demo:incomprehensible]",
  inappropriate: "[demo:inappropriate]",
} as const;

export function assertLocalAnalyzerAllowed(environment = process.env.NODE_ENV) {
  if (environment === "production") {
    throw new Error("The local pedagogical response analyzer is disabled in production.");
  }
}

function nonExploitable(disposition: StructuredResponseAnalysis["responseDisposition"]): StructuredResponseAnalysis {
  return {
    responseDisposition: disposition,
    pedagogicalOutcome: "non_exploitable",
    historicalAccuracy: "not_assessed",
    documentUse: "not_assessed",
    justificationQuality: "not_assessed",
    primaryOperationPerformance: "not_assessed",
    demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [], observedStrengths: [],
    missingElements: ["Une réponse historique interprétable est nécessaire."],
    nextAction: "handle_non_exploitable", confidence: "low",
  };
}

function scenarioAnalysis(content: string, question: PedagogicalQuestionDefinition): StructuredResponseAnalysis | null {
  if (content === LOCAL_DEMO_INPUTS.satisfactory) {
    return {
      responseDisposition: "substantive", pedagogicalOutcome: "satisfactory",
      historicalAccuracy: "demonstrated", documentUse: question.requiredDocumentIds.length ? "demonstrated" : "not_assessed",
      justificationQuality: "demonstrated", primaryOperationPerformance: "demonstrated",
      demonstratedKnowledgeIds: [...question.historicalKnowledgeIds], observedOperationIds: [...question.operationIds],
      usedDocumentIds: [...question.requiredDocumentIds], observedStrengths: ["Scénario réservé : les critères structurés sont démontrés."],
      missingElements: [], nextAction: "complete_question", confidence: "high",
    };
  }
  if (content === LOCAL_DEMO_INPUTS.partial) {
    return {
      responseDisposition: "substantive", pedagogicalOutcome: "partially_satisfactory",
      historicalAccuracy: "partial", documentUse: question.documentIds.length ? "partial" : "not_assessed",
      justificationQuality: "partial", primaryOperationPerformance: "partial",
      demonstratedKnowledgeIds: question.historicalKnowledgeIds.slice(0, 1), observedOperationIds: question.operationIds.slice(0, 1),
      usedDocumentIds: question.documentIds.slice(0, 1), observedStrengths: ["Scénario réservé : un élément pertinent est présent."],
      missingElements: ["Scénario réservé : la relation historique doit être précisée."], nextAction: "request_revision", confidence: "high",
    };
  }
  if (content === LOCAL_DEMO_INPUTS.insufficient) {
    return {
      responseDisposition: "substantive", pedagogicalOutcome: "insufficient",
      historicalAccuracy: "not_demonstrated", documentUse: "not_demonstrated", justificationQuality: "not_demonstrated",
      primaryOperationPerformance: "not_demonstrated", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [],
      observedStrengths: [], missingElements: ["Scénario réservé : commence par établir un fait précis."],
      nextAction: "offer_hint", confidence: "high",
    };
  }
  if (content === LOCAL_DEMO_INPUTS.offTopic) return nonExploitable("off_topic");
  if (content === LOCAL_DEMO_INPUTS.incomprehensible) return nonExploitable("incomprehensible");
  if (content === LOCAL_DEMO_INPUTS.inappropriate) return nonExploitable("inappropriate");
  return null;
}

export class LocalDeterministicResponseAnalyzer implements ResponseAnalyzer {
  constructor(environment = process.env.NODE_ENV) {
    assertLocalAnalyzerAllowed(environment);
  }

  async analyze(response: StudentResponse, question: PedagogicalQuestionDefinition): Promise<StructuredResponseAnalysis> {
    const content = response.content.trim();
    const scenario = scenarioAnalysis(content, question);
    if (scenario) return scenario;
    if (!content) return nonExploitable("too_short");
    if (/^[\p{P}\p{S}\p{N}\s]+$/u.test(content)) return nonExploitable("nonsense_or_spam");

    return {
      responseDisposition: "substantive",
      pedagogicalOutcome: "partially_satisfactory",
      historicalAccuracy: "not_assessed",
      documentUse: "not_assessed",
      justificationQuality: "not_assessed",
      primaryOperationPerformance: "not_assessed",
      demonstratedKnowledgeIds: [],
      observedOperationIds: [],
      usedDocumentIds: [],
      observedStrengths: [],
      missingElements: ["L’analyse locale ne peut pas confirmer l’exactitude historique ni la qualité du raisonnement."],
      nextAction: "request_revision",
      confidence: "low",
    };
  }
}
