import type { PedagogicalFeedback, PedagogicalQuestionDefinition, StructuredResponseAnalysis } from "./types.ts";

function joinParts(parts: Array<string | undefined>) {
  return parts.filter((part): part is string => Boolean(part)).join(" ");
}

export function createPedagogicalFeedback(
  analysis: StructuredResponseAnalysis,
  question: PedagogicalQuestionDefinition,
  nonExploitableCount: number,
): PedagogicalFeedback {
  if (analysis.responseDisposition === "inappropriate") {
    const assessment = "Revenons calmement à la question d’histoire.";
    return { assessment, studentFacingText: assessment, relatedRuleIds: ["PED-NONEXP-011", "PED-NONEXP-012"] };
  }
  if (analysis.pedagogicalOutcome === "non_exploitable") {
    const assessment = nonExploitableCount <= 1
      ? "Je n’arrive pas encore à interpréter cette réponse comme une idée historique."
      : nonExploitableCount === 2
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

  const acknowledgement = analysis.observedStrengths[0];
  const missingElement = analysis.missingElements[0];
  if (analysis.historicalAccuracy === "not_assessed" && analysis.primaryOperationPerformance === "not_assessed") {
    const assessment = "Ta réponse a bien été reçue. Pour poursuivre, ajoute un fait précis tiré des documents et explique le lien que tu établis.";
    return {
      assessment,
      studentFacingText: assessment,
      technicalNotice: "Démonstration locale : ta réponse n’est pas réellement évaluée.",
      relatedRuleIds: ["PED-FDBK-004", "PED-FDBK-006", "PED-AI-009"],
    };
  }
  if (analysis.pedagogicalOutcome === "satisfactory") {
    const assessment = "Ta réponse satisfait les critères structurés de cette démonstration.";
    return { acknowledgement, assessment, studentFacingText: joinParts([acknowledgement, assessment]), relatedRuleIds: ["PED-FDBK-004", "PED-FDBK-011"] };
  }
  const assessment = analysis.pedagogicalOutcome === "partially_satisfactory"
    ? "Ton idée est pertinente, mais le raisonnement doit être précisé."
    : "Le raisonnement attendu n’est pas encore démontré.";
  const priorityPrompt = analysis.pedagogicalOutcome === "partially_satisfactory"
    ? "Quel fait précis permet de justifier le lien que tu proposes?"
    : "Quel élément du document peux-tu d’abord établir comme fait?";
  const resourceDirection = question.documentIds[0] ? "Observe un document autorisé avant de reprendre." : undefined;
  return {
    acknowledgement, assessment, missingElement, priorityPrompt, resourceDirection,
    studentFacingText: joinParts([acknowledgement, assessment, missingElement, priorityPrompt, resourceDirection]),
    relatedRuleIds: ["PED-FDBK-004", "PED-FDBK-006", "PED-FDBK-009"],
  };
}
