import type { ActivityConfiguration, ActivityCreatorCatalog, ActivityPreview } from "./types.ts";
import { CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID } from "./intellectual-operation-learning.ts";

type BalancedRevisionFormat = "multiple-choice" | "short-answer" | "document-interpretation";

export function getActivityQuestionCategory(format: ActivityCreatorCatalog["questions"][number]["format"]): BalancedRevisionFormat | "other" {
  if (format === "interactive-timeline" || format === "interactive-association") return "document-interpretation";
  if (format === "development-150") return "other";
  if (format === "multiple-choice" || format === "short-answer" || format === "document-interpretation") return format;
  return "other";
}

function createBalancedRevisionFormatPlan(questionCount: number): BalancedRevisionFormat[] {
  const multipleChoiceCount = Math.round(questionCount * 0.2);
  const multipleChoiceIndexes = new Set(Array.from(
    { length: multipleChoiceCount },
    (_, index) => Math.floor(index * questionCount / multipleChoiceCount),
  ));
  let openQuestionIndex = 0;

  return Array.from({ length: questionCount }, (_, index) => {
    if (multipleChoiceIndexes.has(index)) return "multiple-choice";
    const format = openQuestionIndex % 2 === 0 ? "document-interpretation" : "short-answer";
    openQuestionIndex += 1;
    return format;
  });
}

export function getEligibleActivityQuestions(config: ActivityConfiguration, catalog: ActivityCreatorCatalog) {
  const notion = catalog.notions.find(({ id }) => id === config.notionIds[0]) ?? catalog.notions[0];
  const selectedNotionIds = new Set(config.notionIds.length > 0 ? config.notionIds : [notion.id]);
  const availableDocumentIds = new Set(catalog.documents.map(({ id }) => id));
  const isCompleteActeUnionRevision = config.workType === "revision" && notion.id === "acte-union";

  return catalog.questions.filter(({ status, format, relatedKnowledgeHeadingIds, operationId, historicalDocumentIds }) =>
    status === "approved"
    && relatedKnowledgeHeadingIds.some((id) => selectedNotionIds.has(id))
    && (config.workType === "development" ? format === "development-150" : config.workType === "revision" || format !== "development-150")
    && (!config.operationId || operationId === config.operationId)
    && (isCompleteActeUnionRevision || format === "interactive-timeline" || format === "interactive-association" || format === "development-150" || historicalDocumentIds.every((id) => availableDocumentIds.has(id))),
  );
}

export function isHistoricalPeriodReview(config: ActivityConfiguration, catalog: ActivityCreatorCatalog) {
  const selectedIds = new Set(config.notionIds);
  return Array.from(new Set(catalog.notions.map(({ periodId }) => periodId))).some((periodId) => {
    const periodNotionIds = catalog.notions.filter((notion) => notion.periodId === periodId).map(({ id }) => id);
    return periodNotionIds.length > 0 && periodNotionIds.every((id) => selectedIds.has(id));
  });
}

function seededQuestionOrder(questionId: string, seed: number) {
  let value = seed >>> 0;
  for (let index = 0; index < questionId.length; index += 1) value = Math.imul(value ^ questionId.charCodeAt(index), 16777619) >>> 0;
  return value;
}

export function getActivityQuestionSelection(config: ActivityConfiguration, catalog: ActivityCreatorCatalog, previouslyAssignedQuestionIds: readonly string[] = [], randomSeed?: number) {
  const eligible = getEligibleActivityQuestions(config, catalog);
  const reusable = config.workType === "revision" || isHistoricalPeriodReview(config, catalog);
  const previouslyAssigned = new Set(previouslyAssignedQuestionIds);
  const available = reusable ? eligible : eligible.filter(({ id }) => !previouslyAssigned.has(id));
  if (config.questionCount === null || config.workType === "development") return available.slice(0, config.questionCount ?? available.length);

  const requestedCount = Math.min(config.questionCount, available.length);
  const selected: typeof available = [];
  const selectedIds = new Set<string>();
  const operationUsage = new Map<string, number>();
  const knowledgeUsage = new Map<string, number>();
  const usedDocuments = new Set<string>();
  const selectedNotionIds = new Set(config.notionIds);

  function registerQuestion(question: (typeof available)[number]) {
    selected.push(question);
    selectedIds.add(question.id);
    operationUsage.set(question.operationId, (operationUsage.get(question.operationId) ?? 0) + 1);
    question.relatedKnowledgeHeadingIds
      .filter((id) => selectedNotionIds.size === 0 || selectedNotionIds.has(id))
      .forEach((id) => knowledgeUsage.set(id, (knowledgeUsage.get(id) ?? 0) + 1));
    question.historicalDocumentIds.forEach((id) => usedDocuments.add(id));
  }

  function candidateScore(question: (typeof available)[number]) {
    const relevantKnowledgeIds = question.relatedKnowledgeHeadingIds
      .filter((id) => selectedNotionIds.size === 0 || selectedNotionIds.has(id));
    const knowledgeUse = relevantKnowledgeIds.length > 0
      ? Math.min(...relevantKnowledgeIds.map((id) => knowledgeUsage.get(id) ?? 0))
      : 0;
    const operationUse = operationUsage.get(question.operationId) ?? 0;
    const newDocuments = question.historicalDocumentIds.filter((id) => !usedDocuments.has(id)).length;
    return -knowledgeUse * 1_000 - operationUse * 100 + newDocuments * 10;
  }

  function addBestCandidate(format?: BalancedRevisionFormat | "other") {
    const eligibleCandidates = available
      .filter((question) => !selectedIds.has(question.id) && (!format || getActivityQuestionCategory(question.format) === format));
    const candidatesWithoutRepeatedDocuments = eligibleCandidates.filter((question) =>
      question.historicalDocumentIds.every((id) => !usedDocuments.has(id)));
    const candidatePool = config.workType === "revision" && candidatesWithoutRepeatedDocuments.length > 0
      ? candidatesWithoutRepeatedDocuments
      : eligibleCandidates;
    const candidates = candidatePool
      .map((question, index) => ({ question, index, score: candidateScore(question) }))
      .sort((a, b) => b.score - a.score || (randomSeed === undefined
        ? a.index - b.index
        : seededQuestionOrder(a.question.id, randomSeed) - seededQuestionOrder(b.question.id, randomSeed)));
    const best = candidates[0]?.question;
    if (!best) return false;
    registerQuestion(best);
    return true;
  }

  const formatPlan = createBalancedRevisionFormatPlan(requestedCount);
  const firstTimeline = available.find(({ format }) => format === "interactive-timeline");
  if (firstTimeline && selected.length < requestedCount) {
    registerQuestion(firstTimeline);
    const interpretationIndex = formatPlan.indexOf("document-interpretation");
    if (interpretationIndex >= 0) formatPlan.splice(interpretationIndex, 1);
  }

  for (let index = 0; selected.length < requestedCount; index += 1) {
    const targetFormat = formatPlan[index];
    if (!addBestCandidate(targetFormat) && !addBestCandidate("other") && !addBestCandidate()) break;
  }

  return selected;
}

export function createLocalActivityPreview(config: ActivityConfiguration, catalog: ActivityCreatorCatalog, variant = 0): ActivityPreview {
  const notion = catalog.notions.find(({ id }) => id === config.notionIds[0]) ?? catalog.notions[0];
  const selectedOperation = catalog.operations.find(({ id }) => id === config.operationId);
  const hasDocuments = notion.id === "acte-union";
  const eligibleQuestions = getEligibleActivityQuestions(config, catalog);
  const catalogQuestion = eligibleQuestions.length > 0
    ? eligibleQuestions[variant % eligibleQuestions.length]
    : undefined;
  const questionOperation = catalogQuestion ? catalog.operations.find(({ id }) => id === catalogQuestion.operationId) : undefined;
  const operation = selectedOperation ?? questionOperation ?? catalog.operations[variant % catalog.operations.length];
  const approvedQuestion = catalogQuestion
    ? catalogQuestion.prompt
    : hasDocuments
    ? "Aucune question approuvée n’est encore disponible pour cette sélection."
    : "Formule une question que tu aimerais approfondir à propos de cette notion.";
  const question = approvedQuestion;
  const instruction = config.workType === "development" && catalogQuestion
    ? catalogQuestion.instruction
    : config.workType === "development"
      ? "Aucune question à développement approuvée n’est disponible pour cette sélection."
    : config.workType === "enrichment"
      ? "Justifie ta réponse en croisant précisément les sources approuvées disponibles."
      : catalogQuestion
        ? catalogQuestion.instruction
        : "Explique brièvement pourquoi cette question te semble importante.";
  const previewDocuments = catalogQuestion ? catalog.documents.filter(({ id }) => catalogQuestion.historicalDocumentIds.includes(id)) : [];
  return {
    questionId: catalogQuestion?.id,
    format: catalogQuestion?.format ?? (config.workType === "development" ? "development-150" : "short-answer"),
    answerOptions: catalogQuestion?.answerOptions,
    answerExplanation: catalogQuestion?.expectedAnswer,
    operationId: operation.id,
    operationLabel: operation.label,
    notionTitle: notion.title,
    historicalKnowledgeIds: catalogQuestion?.relatedKnowledgeHeadingIds ?? [notion.id],
    question,
    instruction,
    guidance: [catalogQuestion?.id === CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID
      ? "Aujourd’hui, je vais t’aider à comprendre comment déterminer une cause et une conséquence. Commençons simplement : quel est l’événement historique central présenté dans les trois documents?"
      : previewDocuments.length === 0
      ? "J’attends ta réponse…"
      : "Bonjour, consulte les sources puis réponds à la question."],
    documents: previewDocuments,
    timelineInteraction: catalogQuestion?.timelineInteraction,
    associationInteraction: catalogQuestion?.associationInteraction,
    causalChainInteraction: catalogQuestion?.causalChainInteraction,
  };
}
