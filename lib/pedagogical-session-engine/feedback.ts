import type { PedagogicalFeedback, PedagogicalQuestionDefinition, StructuredResponseAnalysis } from "./types.ts";

function joinParts(parts: Array<string | undefined>) {
  return parts.filter((part): part is string => Boolean(part)).join(" ");
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

export function createPedagogicalFeedback(
  analysis: StructuredResponseAnalysis,
  question: PedagogicalQuestionDefinition,
  nonExploitableCount: number,
  questionClosing = false,
  helpRequested = false,
): PedagogicalFeedback {
  if (analysis.responseDisposition === "inappropriate") {
    const assessment = questionClosing
      ? "Nous allons poursuivre avec la prochaine question et garder celle-ci à retravailler."
      : "Revenons calmement à la question d’histoire.";
    return { assessment, studentFacingText: assessment, relatedRuleIds: ["PED-NONEXP-011", "PED-NONEXP-012"] };
  }
  if (analysis.pedagogicalOutcome === "non_exploitable") {
    if (helpRequested) {
      const assessment = "Ce n’est pas grave si tu ne t’en souviens plus. Je vais t’aider avec un autre indice.";
      return {
        assessment,
        studentFacingText: assessment,
        relatedRuleIds: ["PED-NONEXP-003", "PED-NONEXP-004", "PED-NONEXP-005"],
      };
    }
    if (questionClosing) {
      const assessment = "Nous allons poursuivre et garder cette question à retravailler.";
      return { assessment, studentFacingText: assessment, relatedRuleIds: ["PED-NONEXP-003", "PED-NONEXP-005"] };
    }
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

  const acknowledgement = replaceDocumentIds(analysis.observedStrengths[0], question);
  const missingElement = replaceDocumentIds(analysis.missingElements[0], question);
  if (questionClosing && analysis.pedagogicalOutcome !== "satisfactory") {
    const assessment = "Tu as fait trois essais sérieux. Il reste un élément historique à préciser; nous garderons ce point à consolider.";
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
  if (analysis.pedagogicalOutcome === "satisfactory") {
    const assessment = "Bravo, ta réponse est réussie.";
    const enrichment = missingElement ? `À retenir aussi : ${missingElement}` : undefined;
    return { acknowledgement, assessment, missingElement, studentFacingText: joinParts([acknowledgement, assessment, enrichment]), relatedRuleIds: ["PED-FDBK-004", "PED-FDBK-011"] };
  }
  const assessment = analysis.pedagogicalOutcome === "partially_satisfactory"
    ? "C’est un bon début. Il reste un lien à préciser."
    : "Merci pour ta réponse. On va avancer ensemble.";
  const tailoredQuestion = missingElement?.includes("?") ? keepOnlyQuestion(missingElement) : undefined;
  const priorityPrompt = tailoredQuestion ?? (analysis.pedagogicalOutcome === "partially_satisfactory"
    ? "Quel fait précis permet de justifier le lien que tu proposes?"
    : "Quel élément du document peux-tu d’abord établir comme fait?");
  return {
    acknowledgement, assessment, missingElement, priorityPrompt,
    studentFacingText: joinParts([acknowledgement, assessment, tailoredQuestion ? undefined : missingElement, priorityPrompt]),
    relatedRuleIds: ["PED-FDBK-004", "PED-FDBK-006", "PED-FDBK-009"],
  };
}
