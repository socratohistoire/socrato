import { CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID } from "../teacher-activity-creator/intellectual-operation-learning.ts";
import type { ResponseAnalyzer } from "./ports.ts";
import type { PedagogicalQuestionDefinition, StructuredResponseAnalysis, StudentResponse } from "./types.ts";

function containsAny(content: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(content));
}

function guidedAnalysis(
  question: PedagogicalQuestionDefinition,
  options: Pick<StructuredResponseAnalysis, "pedagogicalOutcome" | "historicalAccuracy" | "documentUse" | "justificationQuality" | "primaryOperationPerformance" | "observedStrengths" | "missingElements" | "nextAction"> & {
    usedDocumentIds?: string[];
    demonstrated?: boolean;
  },
): StructuredResponseAnalysis {
  const { demonstrated = false, ...analysis } = options;
  return {
    responseDisposition: "substantive",
    demonstratedKnowledgeIds: demonstrated ? [...question.historicalKnowledgeIds] : [],
    observedOperationIds: demonstrated ? [...question.operationIds] : [],
    usedDocumentIds: options.usedDocumentIds ?? [],
    confidence: "high",
    ...analysis,
  };
}

/** Guidage déterministe du parcours cause → événement → conséquence. */
export class CausesConsequencesLearningAnalyzer implements ResponseAnalyzer {
  async analyze(response: StudentResponse, question: PedagogicalQuestionDefinition): Promise<StructuredResponseAnalysis> {
    if (question.id !== CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID) {
      throw new Error("Ce guide est réservé à l’activité sur les causes et les conséquences.");
    }

    const content = response.content.trim();
    const documentIds = question.documentIds;
    const stage = response.attemptNumber;

    if (stage === 1) {
      const identifiesEvent = containsAny(content, [/rébellion/iu, /patriote/iu, /1837(?:\s*[–—-]\s*1838)?/u]);
      return guidedAnalysis(question, identifiesEvent ? {
        pedagogicalOutcome: "partially_satisfactory",
        historicalAccuracy: "demonstrated",
        documentUse: "partial",
        justificationQuality: "not_assessed",
        primaryOperationPerformance: "partial",
        observedStrengths: ["Oui. Tu as bien identifié l’événement central : les Rébellions des Patriotes de 1837-1838."],
        missingElements: ["Observe maintenant le document 1. Quelle décision de Londres pourrait expliquer le mécontentement qui précède les Rébellions?"],
        nextAction: "request_revision",
        usedDocumentIds: documentIds.slice(1, 2),
      } : {
        pedagogicalOutcome: "insufficient",
        historicalAccuracy: "partial",
        documentUse: "partial",
        justificationQuality: "not_assessed",
        primaryOperationPerformance: "not_demonstrated",
        observedStrengths: ["Tu as commencé à observer les sources."],
        missingElements: ["Regarde le document 2 : quel événement historique est décrit dans ce texte?"],
        nextAction: "offer_hint",
        usedDocumentIds: documentIds.slice(1, 2),
      });
    }

    if (stage === 2) {
      const identifiesCause = containsAny(content, [/refus/iu, /londres/iu, /russell/iu, /réforme/iu, /conseil\s+législatif/iu, /responsabilit/iu, /gouverneur/iu]);
      return guidedAnalysis(question, identifiesCause ? {
        pedagogicalOutcome: "partially_satisfactory",
        historicalAccuracy: "demonstrated",
        documentUse: "demonstrated",
        justificationQuality: "partial",
        primaryOperationPerformance: "partial",
        observedStrengths: ["Exact. Le refus de Londres d’accorder les réformes demandées nourrit le mécontentement : c’est une cause des Rébellions."],
        missingElements: ["Passons à ce qui arrive après. D’après le document 3, quelle conséquence des Rébellions est liée à la mission confiée à lord Durham?"],
        nextAction: "request_revision",
        usedDocumentIds: documentIds.slice(0, 1),
      } : {
        pedagogicalOutcome: "insufficient",
        historicalAccuracy: "partial",
        documentUse: "partial",
        justificationQuality: "not_assessed",
        primaryOperationPerformance: "partial",
        observedStrengths: ["Tu cherches maintenant ce qui se passe avant l’événement."],
        missingElements: ["Dans le document 1, Londres accepte-t-elle ou refuse-t-elle les réformes réclamées? En quoi cette décision peut-elle provoquer du mécontentement?"],
        nextAction: "offer_hint",
        usedDocumentIds: documentIds.slice(0, 1),
      });
    }

    const identifiesConsequence = containsAny(content, [/durham/iu, /enquêt/iu, /rapport/iu, /recommand/iu, /mission/iu, /réforme/iu, /haut-canada/iu, /bas-canada/iu]);
    return guidedAnalysis(question, identifiesConsequence ? {
      pedagogicalOutcome: "satisfactory",
      historicalAccuracy: "demonstrated",
      documentUse: "demonstrated",
      justificationQuality: "demonstrated",
      primaryOperationPerformance: "demonstrated",
      observedStrengths: ["Tu as établi la chaîne complète : le refus des réformes contribue au mécontentement, les Rébellions éclatent, puis Durham est envoyé pour enquêter et recommander des changements."],
      missingElements: ["Une cause explique ce qui mène à l’événement; une conséquence est ce qui en découle."],
      nextAction: "complete_question",
      usedDocumentIds: [...documentIds],
      demonstrated: true,
    } : {
      pedagogicalOutcome: "partially_satisfactory",
      historicalAccuracy: "partial",
      documentUse: "partial",
      justificationQuality: "partial",
      primaryOperationPerformance: "partial",
      observedStrengths: ["Tu as déjà distingué l’événement et sa cause."],
      missingElements: ["Le document 3 indique que Durham vient enquêter et proposer des réformes : cette mission se situe-t-elle avant ou après les Rébellions, et est-ce donc une cause ou une conséquence?"],
      nextAction: "request_revision",
      usedDocumentIds: documentIds.slice(2, 3),
    });
  }
}
