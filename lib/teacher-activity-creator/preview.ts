import type { ActivityConfiguration, ActivityCreatorCatalog, ActivityPreview } from "./types.ts";

const INITIAL_BALANCED_REVISION_FORMATS = ["multiple-choice", "short-answer", "document-interpretation", "document-interpretation", "short-answer", "multiple-choice"] as const;
const CONTINUED_BALANCED_REVISION_FORMATS = ["document-interpretation", "short-answer", "multiple-choice"] as const;
type BalancedRevisionFormat = (typeof CONTINUED_BALANCED_REVISION_FORMATS)[number];

export function getActivityQuestionCategory(format: ActivityCreatorCatalog["questions"][number]["format"]): BalancedRevisionFormat | "other" {
  if (format === "interactive-timeline" || format === "interactive-association") return "document-interpretation";
  if (format === "multiple-choice" || format === "short-answer" || format === "document-interpretation") return format;
  return "other";
}

function balancedRevisionFormatAt(index: number): BalancedRevisionFormat {
  return index < INITIAL_BALANCED_REVISION_FORMATS.length
    ? INITIAL_BALANCED_REVISION_FORMATS[index]
    : CONTINUED_BALANCED_REVISION_FORMATS[(index - INITIAL_BALANCED_REVISION_FORMATS.length) % CONTINUED_BALANCED_REVISION_FORMATS.length];
}

export function getEligibleActivityQuestions(config: ActivityConfiguration, catalog: ActivityCreatorCatalog) {
  const notion = catalog.notions.find(({ id }) => id === config.notionIds[0]) ?? catalog.notions[0];
  const selectedNotionIds = new Set(config.notionIds.length > 0 ? config.notionIds : [notion.id]);
  const availableDocumentIds = new Set(catalog.documents.map(({ id }) => id));
  const isCompleteActeUnionRevision = config.workType === "revision" && notion.id === "acte-union";

  return catalog.questions.filter(({ status, format, relatedKnowledgeHeadingIds, operationId, historicalDocumentIds }) =>
    status === "approved"
    && (isCompleteActeUnionRevision || relatedKnowledgeHeadingIds.some((id) => selectedNotionIds.has(id)))
    && (config.workType === "development" ? format === "development-150" : format !== "development-150")
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

export function getActivityQuestionSelection(config: ActivityConfiguration, catalog: ActivityCreatorCatalog, previouslyAssignedQuestionIds: readonly string[] = []) {
  const eligible = getEligibleActivityQuestions(config, catalog);
  const reusable = isHistoricalPeriodReview(config, catalog);
  const previouslyAssigned = new Set(previouslyAssignedQuestionIds);
  const available = reusable ? eligible : eligible.filter(({ id }) => !previouslyAssigned.has(id));
  if (config.questionCount === null || config.workType === "development") return available.slice(0, config.questionCount ?? available.length);

  const requestedCount = Math.min(config.questionCount, available.length);
  const selected: typeof available = [];
  const selectedIds = new Set<string>();
  const usedOperations = new Set<string>();
  const usedDocuments = new Set<string>();

  function candidateScore(question: (typeof available)[number]) {
    const newDocuments = question.historicalDocumentIds.filter((id) => !usedDocuments.has(id)).length;
    return (usedOperations.has(question.operationId) ? 0 : 100) + newDocuments * 10;
  }

  function addBestCandidate(format?: BalancedRevisionFormat) {
    const eligibleCandidates = available
      .filter((question) => !selectedIds.has(question.id) && (!format || getActivityQuestionCategory(question.format) === format));
    const candidatesWithoutRepeatedDocuments = eligibleCandidates.filter((question) =>
      question.historicalDocumentIds.every((id) => !usedDocuments.has(id)));
    const hasNonRepeatingCandidateInAnotherFormat = Boolean(format) && available.some((question) =>
      !selectedIds.has(question.id) && question.historicalDocumentIds.every((id) => !usedDocuments.has(id)));
    if (config.workType === "revision" && candidatesWithoutRepeatedDocuments.length === 0 && hasNonRepeatingCandidateInAnotherFormat) return false;
    const candidatePool = config.workType === "revision" && candidatesWithoutRepeatedDocuments.length > 0
      ? candidatesWithoutRepeatedDocuments
      : eligibleCandidates;
    const candidates = candidatePool
      .map((question, index) => ({ question, index, score: candidateScore(question) }))
      .sort((a, b) => b.score - a.score || a.index - b.index);
    const best = candidates[0]?.question;
    if (!best) return false;
    selected.push(best);
    selectedIds.add(best.id);
    usedOperations.add(best.operationId);
    best.historicalDocumentIds.forEach((id) => usedDocuments.add(id));
    return true;
  }

  const formatPlan = Array.from({ length: requestedCount }, (_, index) => balancedRevisionFormatAt(index));
  const firstTimeline = available.find(({ format }) => format === "interactive-timeline");
  if (firstTimeline && selected.length < requestedCount) {
    selected.push(firstTimeline);
    selectedIds.add(firstTimeline.id);
    usedOperations.add(firstTimeline.operationId);
    firstTimeline.historicalDocumentIds.forEach((id) => usedDocuments.add(id));
    const interpretationIndex = formatPlan.indexOf("document-interpretation");
    if (interpretationIndex >= 0) formatPlan.splice(interpretationIndex, 1);
  }

  for (let index = 0; selected.length < requestedCount; index += 1) {
    const targetFormat = formatPlan[index];
    if (!addBestCandidate(targetFormat) && !addBestCandidate()) break;
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
    guidance: [catalogQuestion?.format === "short-answer"
      ? "J’attends ta réponse…"
      : catalogQuestion?.format === "document-interpretation"
        ? "Bonjour, consulte les sources puis réponds à la question."
        : "Bonjour, consulte les sources puis réponds lorsque tu te sens prêt. Je suis là pour t’accompagner si tu as besoin d’un indice."],
    documents: catalogQuestion ? catalog.documents.filter(({ id }) => catalogQuestion.historicalDocumentIds.includes(id)) : [],
    timelineInteraction: catalogQuestion?.timelineInteraction,
    associationInteraction: catalogQuestion?.associationInteraction,
  };
}
