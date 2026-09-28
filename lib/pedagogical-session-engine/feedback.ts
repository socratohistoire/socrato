import type { PedagogicalFeedback, PedagogicalQuestionDefinition, StructuredResponseAnalysis } from "./types.ts";
import type { HelpRequestKind } from "./help-request.ts";

function joinParts(parts: Array<string | undefined>) {
  return parts.filter((part): part is string => Boolean(part)).join(" ");
}

function joinConversationParts(parts: Array<string | undefined>) {
  return parts.filter((part): part is string => Boolean(part)).join("\n\n");
}

function replaceDocumentIds(value: string | undefined, question: PedagogicalQuestionDefinition) {
  if (!value) return value;
  return question.evaluationContext?.approvedDocuments.reduce(
    (text, document) => text.replaceAll(document.id, document.title),
    value,
  ) ?? value;
}

function keepOnlyQuestion(value: string | undefined) {
  if (!value?.includes("?")) return value;
  const end = value.indexOf("?") + 1;
  const beforeQuestion = value.slice(0, end);
  const separator = Math.max(beforeQuestion.lastIndexOf(":"), beforeQuestion.lastIndexOf(";"), beforeQuestion.lastIndexOf("."));
  const question = beforeQuestion.slice(separator + 1).trim();
  return question ? `${question[0].toLocaleUpperCase("fr-CA")}${question.slice(1)}` : value;
}

const ACTIVITY_SUCCESS_CLOSINGS = [
  "Bravo, c’est réussi.",
  "Excellent, objectif atteint.",
  "C’est réussi. Beau travail.",
  "Parfait, cette question est réussie.",
  "Très bien, ton raisonnement est juste.",
  "Voilà une réponse réussie.",
] as const;

const QUESTION_SUCCESS_CLOSINGS = [
  "Très bien, on continue.",
  "Excellent, passons à la suite.",
  "C’est réussi. On poursuit?",
  "Beau travail. Continuons.",
  "Tu peux passer à la suite.",
  "C’est complet. On continue.",
] as const;

const SUCCESS_OPENINGS = [
  "Oui!", "Exact!", "Bien vu!", "Très juste!", "Tout à fait!", "Beau constat!", "Tu y es!", "C’est bien ça!",
] as const;

const PARTIAL_OPENINGS = [
  "Bonne piste!", "Bon début!", "Oui, en partie.", "Tu avances bien.", "Une partie est juste.", "Voilà un premier élément.", "Cette observation est juste.",
] as const;

function stableVariant<T>(values: readonly T[], seed: string) {
  const index = Array.from(seed).reduce((total, character) => total + character.codePointAt(0)!, 0) % values.length;
  return values[index];
}

function ensureBriefOpening(acknowledgement: string | undefined, outcome: StructuredResponseAnalysis["pedagogicalOutcome"], seed: string) {
  if (!acknowledgement || outcome === "non_exploitable") return acknowledgement;
  const alreadyHasBriefOpening = /^[^.!?]{1,24}!(?:\s|$)/u.test(acknowledgement)
    || PARTIAL_OPENINGS.some((opening) => acknowledgement.toLocaleLowerCase("fr-CA").startsWith(opening.toLocaleLowerCase("fr-CA")));
  if (alreadyHasBriefOpening) return acknowledgement;
  const openings = outcome === "satisfactory" ? SUCCESS_OPENINGS : PARTIAL_OPENINGS;
  return `${stableVariant(openings, seed)} ${acknowledgement}`;
}

export function createPedagogicalFeedback(
  analysis: StructuredResponseAnalysis,
  question: PedagogicalQuestionDefinition,
  nonExploitableCount: number,
  questionClosing = false,
  helpRequest: HelpRequestKind | false = false,
  activityClosing = false,
): PedagogicalFeedback {
  const closingAssessment = activityClosing
    ? "Nous garderons cette question à retravailler dans ton bilan."
    : "Nous allons poursuivre avec la prochaine question et garder celle-ci à retravailler.";
  if (analysis.responseDisposition === "inappropriate") {
    const assessment = questionClosing
      ? closingAssessment
      : "Revenons calmement à la question d’histoire.";
    return { assessment, studentFacingText: assessment, relatedRuleIds: ["PED-NONEXP-011", "PED-NONEXP-012"] };
  }
  if (analysis.pedagogicalOutcome === "non_exploitable") {
    if (helpRequest) {
      const assessment = {
        forgotten: "Ce n’est pas grave, on va la retrouver ensemble.",
        needs_method: "Bien sûr. Commençons une étape à la fois avec cet indice.",
        asks_for_answer: "Je ne vais pas faire le travail à ta place, mais je vais t’aider à construire ta réponse.",
        general: "Bien sûr, je vais t’aider avec un indice.",
      }[helpRequest];
      return {
        assessment,
        studentFacingText: assessment,
        relatedRuleIds: ["PED-NONEXP-003", "PED-NONEXP-004", "PED-NONEXP-005"],
      };
    }
    if (questionClosing) {
      const assessment = closingAssessment;
      return { assessment, studentFacingText: assessment, relatedRuleIds: ["PED-NONEXP-003", "PED-NONEXP-005"] };
    }
    if (["playful_diversion", "off_topic", "nonsense_or_spam"].includes(analysis.responseDisposition)) {
      const assessment = replaceDocumentIds(analysis.observedStrengths[0], question)
        ?? (nonExploitableCount <= 1 ? "D’accord." : "Je te suis.");
      const bridge = nonExploitableCount <= 1
        ? "Revenons tranquillement à notre enquête historique."
        : "Reprenons maintenant la question d’histoire.";
      const tailoredPrompt = replaceDocumentIds(analysis.missingElements[0], question);
      const priorityPrompt = (tailoredPrompt?.includes("?") ? keepOnlyQuestion(tailoredPrompt) : undefined)
        ?? (nonExploitableCount <= 1 ? "Quelle idée historique peux-tu proposer?" : "Quelle idée, même très courte, est directement liée à la question?");
      return {
        assessment,
        priorityPrompt,
        studentFacingText: joinParts([assessment, bridge, priorityPrompt]),
        relatedRuleIds: ["PED-NONEXP-003", "PED-NONEXP-004", "PED-NONEXP-005"],
      };
    }
    if (nonExploitableCount <= 1) {
      const assessment = "Est-ce que tu pourrais développer davantage ton idée ?";
      return {
        assessment,
        studentFacingText: assessment,
        relatedRuleIds: ["PED-NONEXP-003", "PED-NONEXP-004", "PED-NONEXP-005"],
      };
    }
    const assessment = nonExploitableCount === 2
        ? "Appuie-toi sur un document précis et formule une idée historique."
        : "Utilise une structure simple : un fait, puis le lien que tu établis.";
    const priorityPrompt = nonExploitableCount < 3 ? "Peux-tu reformuler une seule idée liée à la question?" : undefined;
    return {
      assessment, priorityPrompt,
      resourceDirection: question.documentIds[0] ? "Tu peux observer le premier document associé à la question." : undefined,
      studentFacingText: joinParts([assessment, priorityPrompt]),
      relatedRuleIds: ["PED-NONEXP-003", "PED-NONEXP-004", "PED-NONEXP-005"],
    };
  }

  const acknowledgement = ensureBriefOpening(
    replaceDocumentIds(analysis.observedStrengths[0], question),
    analysis.pedagogicalOutcome,
    `${question.id}:${analysis.observedStrengths[0] ?? ""}`,
  );
  const missingElement = replaceDocumentIds(analysis.missingElements[0], question);
  if (questionClosing && analysis.pedagogicalOutcome !== "satisfactory") {
    const assessment = "Tu as fait trois essais sérieux. Ce point reste à consolider et sera pris en compte dans ton bilan pour déterminer la prochaine étape la plus utile.";
    return {
      acknowledgement,
      assessment,
      missingElement,
      studentFacingText: joinParts([acknowledgement, assessment]),
      relatedRuleIds: ["PED-FDBK-004", "PED-FDBK-006", "PED-FDBK-009"],
    };
  }
  if (analysis.historicalAccuracy === "not_assessed" && analysis.primaryOperationPerformance === "not_assessed") {
    const assessment = "Merci pour ta réponse. On va avancer ensemble : ajoute un fait précis et explique le lien que tu établis.";
    return {
      assessment,
      studentFacingText: assessment,
      relatedRuleIds: ["PED-FDBK-004", "PED-FDBK-006", "PED-AI-009"],
    };
  }
  if (acknowledgement && !missingElement && analysis.pedagogicalOutcome !== "satisfactory") {
    return {
      acknowledgement,
      assessment: acknowledgement,
      studentFacingText: acknowledgement,
      relatedRuleIds: ["PED-FDBK-004", "PED-FDBK-006", "PED-FDBK-009"],
    };
  }
  if (analysis.pedagogicalOutcome === "satisfactory") {
    const assessment = stableVariant(activityClosing ? ACTIVITY_SUCCESS_CLOSINGS : QUESTION_SUCCESS_CLOSINGS, `${question.id}:${acknowledgement ?? ""}`);
    const conciseEnrichment = missingElement?.replace(/^\s*précision(?:\s+facultative)?\s*:\s*/i, "");
    const enrichment = conciseEnrichment ? `À retenir aussi\n${conciseEnrichment}` : undefined;
    return {
      acknowledgement, assessment, missingElement,
      studentFacingText: joinConversationParts([
        acknowledgement,
        enrichment,
        assessment,
      ]),
      relatedRuleIds: ["PED-FDBK-004", "PED-FDBK-011"],
    };
  }
  const tailoredGuidance = missingElement?.includes("?") ? missingElement : undefined;
  const priorityPrompt = tailoredGuidance ?? (analysis.pedagogicalOutcome === "partially_satisfactory"
    ? "Quel fait précis permet de justifier le lien que tu proposes?"
    : "Quel élément du document peux-tu d’abord établir comme fait?");
  return {
    acknowledgement, assessment: acknowledgement ?? "Poursuivons ensemble.", missingElement, priorityPrompt,
    studentFacingText: joinConversationParts([
      acknowledgement,
      tailoredGuidance ? `Prochaine étape\n${tailoredGuidance}` : missingElement,
      tailoredGuidance ? undefined : `Prochaine étape\n${priorityPrompt}`,
    ]),
    relatedRuleIds: ["PED-FDBK-004", "PED-FDBK-006", "PED-FDBK-009"],
  };
}
