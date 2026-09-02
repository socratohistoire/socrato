import type { StudentQuestionRuntimeProgress } from "../student-progress/types";
import { createCatalogLearningSessionQuestions } from "../student-learning-session/demo-provider.ts";

type SharedSummaryDetailsInput = {
  consolidationTargets: string[];
  readingAdvice?: string;
  questionRuntime: StudentQuestionRuntimeProgress[] | null;
  genericResultLabels: string[];
};

type SharedStrengthsInput = {
  savedStrengths: string[];
  questionRuntime: StudentQuestionRuntimeProgress[] | null;
  questionIds: string[];
  operationLabels: Record<string, string>;
};

const normalized = (value: string) => value.trim().toLocaleLowerCase("fr-CA");
const asksForMultipleElements = (prompt: string | undefined) => Boolean(prompt && /\b(deux|trois|plusieurs|au moins|d’une part|d'autre part|d’autre part|ainsi que)\b|\b(et|puis)\b/iu.test(prompt));
const describesInstructionOmission = (value: string) => /\b(deuxième|second(?:e)?|élément manquant|oubli(?:é)?|n['’]a pas été|pas (?:été )?(?:expliqué|nommé|indiqué|traité)|ne répond pas à|partie de la consigne)\b/iu.test(value);

export function getSharedStrengths(input: SharedStrengthsInput) {
  const strengths: string[] = [];
  const questions = new Map(createCatalogLearningSessionQuestions(input.questionIds).questions.map((question) => [question.id, question]));
  for (const runtime of input.questionRuntime ?? []) {
    if (runtime.lastAnalysis?.pedagogicalOutcome !== "satisfactory") continue;
    const observation = runtime.lastAnalysis?.observedStrengths.find((entry) => entry.trim().length >= 35
      && !/correctement mobilisé|démarche demandée|réponse (?:est )?réussie|bonne réponse/iu.test(entry));
    if (!observation) continue;
    const operationId = questions.get(runtime.questionId)?.primaryOperationId;
    const subtitle = operationId ? input.operationLabels[operationId] ?? operationId : "Raisonnement historique";
    const comment = observation.trim().split(/(?<=\.)\s+/u)[0];
    const entry = `${subtitle}\n${comment}`;
    if (!strengths.includes(entry)) strengths.push(entry);
    if (strengths.length === 2) break;
  }
  if (!strengths.length) return [];
  const entries = [...strengths, ...input.savedStrengths.filter((entry) => /^Tu (?:connais|comprends) bien/iu.test(entry))];
  const distinct = [...new Set(entries)];
  if (distinct.length < 2) return distinct;
  const firstEvidence = distinct[0].split("\n").slice(1).join(" ").trim();
  return firstEvidence && distinct[1].includes(firstEvidence) ? [distinct[0]] : distinct.slice(0, 2);
}

export function getSharedSummaryDetails(input: SharedSummaryDetailsInput) {
  const genericLabels = new Set(input.genericResultLabels.map(normalized));
  const savedTargets = input.consolidationTargets.filter((target) => !genericLabels.has(normalized(target)));
  const runtimeTargets = [...new Set((input.questionRuntime ?? []).flatMap((runtime, index) => {
    const difficulties = runtime.status === "completed"
      ? runtime.observedDifficulties?.length ? runtime.observedDifficulties : runtime.lastAnalysis?.pedagogicalOutcome !== "satisfactory" ? runtime.lastAnalysis?.missingElements ?? [] : []
      : [];
    return difficulties.slice(0, 1).map((difficulty) => `Opération intellectuelle à consolider\nDifficulté observée\n${difficulty}\nComment travailler cette opération\nReprends les faits pertinents, organise-les selon la relation demandée, puis vérifie que ta réponse réalise bien l’opération intellectuelle.`);
  }))];
  const examples = (input.questionRuntime ?? []).flatMap((runtime, index) => {
    const omissionDetails = [...(runtime.omittedInstructionElements ?? []), ...(runtime.observedDifficulties ?? [])];
    const inferredOmission = Boolean(asksForMultipleElements(runtime.questionPrompt)
      && omissionDetails.length > 0
      && (runtime.attemptNumber > 1 || omissionDetails.some(describesInstructionOmission)));
    if (!inferredOmission) return [];
    return [[
    `À la question ${index + 1}${runtime.questionPrompt ? ` : « ${runtime.questionPrompt} »` : ""}`,
    runtime.omittedInstructionElements?.[0] || runtime.observedDifficulties?.[0]
      ? `L’élément qui manquait était : ${runtime.omittedInstructionElements?.[0] ?? runtime.observedDifficulties?.[0]}`
      : undefined,
  ].filter(Boolean).join(" ")];
  });
  const runtimeReadingAdvice = examples.length
    ? `Décomposer la consigne\nQuestion\n${examples[0].split(" L’élément qui manquait était :")[0]}.\nÀ vérifier\n${examples[0].split("L’élément qui manquait était : ")[1] ?? "Une partie de la consigne n’a pas été traitée."}\nComment progresser\nÀ ta prochaine question, repère le verbe de la consigne et vérifie que tu as répondu à toutes les parties avant d’envoyer ta réponse.`
    : undefined;

  const savedReadingAdvice = input.readingAdvice && /^Décomposer la consigne\n/iu.test(input.readingAdvice) && !examples.length
    ? undefined : input.readingAdvice;
  return {
    consolidationTargets: savedTargets.length ? savedTargets : runtimeTargets,
    readingAdvice: savedReadingAdvice ?? runtimeReadingAdvice,
  };
}
