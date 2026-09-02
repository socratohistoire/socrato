import { createPedagogicalFeedback } from "./feedback.ts";
import { explicitHelpRequestKind } from "./help-request.ts";
import type { PedagogicalClock, ResponseAnalyzer, SummaryProducer, WorkbookReferenceProvider } from "./ports.ts";
import { produceLocalStructuredSummary } from "./summary.ts";
import type {
  ExplicitHintLevel,
  PedagogicalHint,
  PedagogicalQuestionDefinition,
  PedagogicalSessionDefinition,
  PedagogicalSessionState,
  PedagogicalTransition,
  QuestionResult,
  QuestionRuntimeState,
  ResultStatus,
  StructuredResponseAnalysis,
  StudentResponse,
} from "./types.ts";
import { MAX_EXPLICIT_HINT_LEVEL, MAX_PEDAGOGICAL_ATTEMPTS } from "./types.ts";
import { neutralAnalysis, validateStructuredAnalysis } from "./validation.ts";

const systemClock: PedagogicalClock = { now: () => new Date() };

export function pedagogicalQuestionAttemptLimit(question: PedagogicalQuestionDefinition) {
  return question.maxAttempts === null ? null : question.maxAttempts ?? MAX_PEDAGOGICAL_ATTEMPTS;
}

function identifiers(definition: PedagogicalSessionDefinition, question: PedagogicalQuestionDefinition) {
  return {
    sessionId: definition.sessionId,
    activityId: definition.activityId,
    questionId: question.id,
    notionId: question.notionId,
    primaryOperationId: question.primaryOperationId,
    operationIds: [...question.operationIds],
    historicalKnowledgeIds: [...question.historicalKnowledgeIds],
    documentIds: [...question.documentIds],
  };
}

function validateDefinition(definition: PedagogicalSessionDefinition) {
  if (!definition.sessionId || !definition.activityId || !definition.notionId || !definition.questions.length) {
    throw new Error("La définition de séance pédagogique est incomplète.");
  }
  for (const question of definition.questions) {
    if (!question.operationIds.includes(question.primaryOperationId)) throw new Error("L’opération principale doit appartenir à la question.");
    if (question.requiredDocumentIds.some((id) => !question.documentIds.includes(id))) throw new Error("Un document requis n’appartient pas à la question.");
  }
}

export function createPedagogicalSession(definition: PedagogicalSessionDefinition): PedagogicalSessionState {
  validateDefinition(definition);
  return {
    sessionId: definition.sessionId,
    activityId: definition.activityId,
    notionId: definition.notionId,
    dashboardHref: definition.dashboardHref,
    status: "active",
    currentQuestionIndex: 0,
    questionStates: definition.questions.map((question, index) => ({
      ...identifiers(definition, question),
      attemptNumber: 0,
      hintLevel: 0,
      hintRequestCount: 0,
      nonExploitableCount: 0,
      status: index === 0 ? "presented" : "awaiting_response",
    })),
  };
}

function currentDefinition(definition: PedagogicalSessionDefinition, state: PedagogicalSessionState) {
  const question = definition.questions[state.currentQuestionIndex];
  const runtime = state.questionStates[state.currentQuestionIndex];
  if (!question || !runtime || state.status !== "active") throw new Error("La séance ne contient aucune question active.");
  return { question, runtime };
}

function nextHintLevel(runtime: QuestionRuntimeState): ExplicitHintLevel | null {
  if (runtime.hintLevel >= MAX_EXPLICIT_HINT_LEVEL) return null;
  return (runtime.hintLevel + 1) as ExplicitHintLevel;
}

function hintFor(question: PedagogicalQuestionDefinition, level: ExplicitHintLevel): PedagogicalHint {
  return {
    level,
    text: question.hintSequence[level],
    documentId: level === 1 ? question.documentIds[0] : undefined,
    relatedRuleIds: ["PED-HINT-001", "PED-HINT-003", "PED-HINT-004"],
  };
}

export function requestNextHint(
  definition: PedagogicalSessionDefinition,
  state: PedagogicalSessionState,
): PedagogicalTransition {
  const { question, runtime } = currentDefinition(definition, state);
  const level = nextHintLevel(runtime);
  if (level === null) return { state, questionCompleted: false, sessionCompleted: false };
  const updatedRuntime = { ...runtime, hintLevel: level, hintRequestCount: runtime.hintRequestCount + 1 };
  const questionStates = state.questionStates.with(state.currentQuestionIndex, updatedRuntime);
  return { state: { ...state, questionStates }, hint: hintFor(question, level), questionCompleted: false, sessionCompleted: false };
}

function advancedMastery(analysis: StructuredResponseAnalysis, question: PedagogicalQuestionDefinition) {
  return analysis.historicalAccuracy === "demonstrated"
    && analysis.primaryOperationPerformance === "demonstrated"
    && analysis.justificationQuality === "demonstrated"
    && (!question.requiredDocumentIds.length || (analysis.documentUse === "demonstrated"
      && question.requiredDocumentIds.every((id) => analysis.usedDocumentIds.includes(id))));
}

function resultStatus(analysis: StructuredResponseAnalysis, runtime: QuestionRuntimeState, question: PedagogicalQuestionDefinition): ResultStatus {
  if (analysis.pedagogicalOutcome === "satisfactory") return runtime.attemptNumber > 1 || runtime.hintLevel > 0 ? "to_consolidate" : "mastered";
  const attemptLimit = pedagogicalQuestionAttemptLimit(question);
  if (attemptLimit !== null && runtime.attemptNumber >= attemptLimit) return "to_work_on";
  if (analysis.pedagogicalOutcome === "partially_satisfactory") return "to_consolidate";
  return "to_work_on";
}

function asksForMultipleElements(question: PedagogicalQuestionDefinition) {
  const instruction = `${question.questionPrompt ?? question.evaluationContext?.questionPrompt ?? ""} ${question.instruction ?? question.evaluationContext?.instruction ?? ""}`;
  return /\b(deux|trois|plusieurs|au moins|d’une part|d'autre part|d’autre part|ainsi que)\b|\b(et|puis)\b/iu.test(instruction);
}

function assessmentStatus(level: StructuredResponseAnalysis["historicalAccuracy"]): ResultStatus {
  if (level === "demonstrated") return "mastered";
  if (level === "partial") return "to_consolidate";
  return "to_work_on";
}

function completeQuestion(
  definition: PedagogicalSessionDefinition,
  state: PedagogicalSessionState,
  question: PedagogicalQuestionDefinition,
  runtime: QuestionRuntimeState,
  analysis: StructuredResponseAnalysis,
  clock: PedagogicalClock,
): PedagogicalSessionState {
  const status = resultStatus(analysis, runtime, question);
  const attemptLimit = pedagogicalQuestionAttemptLimit(question);
  const exhaustedWithoutSuccess = attemptLimit !== null && runtime.attemptNumber >= attemptLimit
    && analysis.pedagogicalOutcome !== "satisfactory";
  const demonstratedOperationIds = analysis.observedOperationIds.filter((id) => question.operationIds.includes(id));
  const demonstratedKnowledgeIds = analysis.demonstratedKnowledgeIds.filter((id) => question.historicalKnowledgeIds.includes(id));
  const operationAssessments = question.operationIds
    .filter((id) => id === question.primaryOperationId || demonstratedOperationIds.includes(id))
    .map((id) => ({
    id,
    status: id !== question.primaryOperationId && demonstratedOperationIds.includes(id)
      ? analysis.pedagogicalOutcome === "satisfactory" ? "to_consolidate" as const : "mastered" as const
      : exhaustedWithoutSuccess && assessmentStatus(analysis.primaryOperationPerformance) !== "mastered"
        ? "to_work_on" as const
      : analysis.pedagogicalOutcome === "satisfactory"
      && status === "to_consolidate"
      && assessmentStatus(analysis.primaryOperationPerformance) === "mastered" ? "to_consolidate" as const
      : assessmentStatus(analysis.primaryOperationPerformance),
  }));
  const historicalKnowledgeAssessments = question.historicalKnowledgeIds.map((id) => ({
    id,
    status: demonstratedKnowledgeIds.includes(id)
      ? analysis.pedagogicalOutcome === "satisfactory" && status === "to_consolidate" && assessmentStatus(analysis.historicalAccuracy) === "mastered"
        ? "to_consolidate" as const
        : assessmentStatus(analysis.historicalAccuracy)
      : "to_work_on" as const,
  }));
  const result: QuestionResult = {
    sessionId: state.sessionId, activityId: state.activityId, questionId: question.id, notionId: question.notionId,
    primaryOperationId: question.primaryOperationId, operationIds: [...question.operationIds], historicalKnowledgeIds: [...question.historicalKnowledgeIds], documentIds: [...question.documentIds],
    attemptNumber: runtime.attemptNumber, hintLevel: runtime.hintLevel, status,
    advancedMastery: status === "mastered" && advancedMastery(analysis, question),
    demonstratedKnowledgeIds,
    demonstratedOperationIds,
    operationAssessments,
    historicalKnowledgeAssessments,
    requiredDocumentIds: [...question.requiredDocumentIds],
    usedDocumentIds: analysis.usedDocumentIds.filter((id) => question.documentIds.includes(id)),
    documentUse: analysis.documentUse,
    justificationQuality: analysis.justificationQuality,
    observedStrengths: [...analysis.observedStrengths],
    consolidationTargets: status !== "mastered" ? [...new Set([...(runtime.observedDifficulties ?? []), ...analysis.missingElements])] : [],
    instructionOmissionObserved: runtime.instructionOmissionObserved,
    questionPrompt: question.questionPrompt ?? question.evaluationContext?.questionPrompt,
    omittedInstructionElements: [...(runtime.omittedInstructionElements ?? [])],
    completedAt: clock.now().toISOString(),
  };
  const questionStates = state.questionStates.with(state.currentQuestionIndex, { ...runtime, status: "completed", result });
  const nextIndex = state.currentQuestionIndex + 1;
  if (nextIndex >= definition.questions.length) return { ...state, status: "completed", questionStates };
  return { ...state, currentQuestionIndex: nextIndex, questionStates };
}

export async function submitStudentResponse(
  definition: PedagogicalSessionDefinition,
  state: PedagogicalSessionState,
  content: string,
  analyzer: ResponseAnalyzer,
  clock: PedagogicalClock = systemClock,
): Promise<PedagogicalTransition> {
  const { question, runtime } = currentDefinition(definition, state);
  const attemptNumber = runtime.attemptNumber + 1;
  const attemptLimit = pedagogicalQuestionAttemptLimit(question);
  if (attemptLimit !== null && attemptNumber > attemptLimit) throw new Error(`Le maximum de ${attemptLimit} tentatives est déjà atteint.`);
  const response: StudentResponse = {
    sessionId: state.sessionId, activityId: state.activityId, questionId: question.id, notionId: question.notionId,
    primaryOperationId: question.primaryOperationId, operationIds: [...question.operationIds], historicalKnowledgeIds: [...question.historicalKnowledgeIds], documentIds: [...question.documentIds],
    attemptNumber, hintLevel: runtime.hintLevel, content,
    priorTurn: runtime.lastAnalysis ? {
      pedagogicalOutcome: runtime.lastAnalysis.pedagogicalOutcome,
      observedStrengths: [...runtime.lastAnalysis.observedStrengths],
      missingElements: [...runtime.lastAnalysis.missingElements],
    } : undefined,
  };
  let analysis: StructuredResponseAnalysis;
  let analysisUnavailable = false;
  const explicitHelpRequest = explicitHelpRequestKind(content);
  try {
    analysis = explicitHelpRequest ? neutralAnalysis() : validateStructuredAnalysis(await analyzer.analyze(response, question), question);
  } catch {
    analysis = neutralAnalysis();
    analysisUnavailable = true;
  }
  const helpRequest = explicitHelpRequest
    ?? (analysis.responseDisposition === "answer_request" ? "asks_for_answer"
      : analysis.responseDisposition === "help_request" ? "general" : null);
  const requestsHelp = helpRequest !== null;
  const recordedAttemptNumber = requestsHelp || analysisUnavailable ? runtime.attemptNumber : attemptNumber;
  const nonExploitableCount = runtime.nonExploitableCount + (!requestsHelp && !analysisUnavailable && analysis.pedagogicalOutcome === "non_exploitable" ? 1 : 0);
  const offeredHintLevel = requestsHelp ? nextHintLevel(runtime) : null;
  const instructionOmissionDetected = attemptNumber === 1
    && analysis.responseDisposition === "substantive"
    && analysis.pedagogicalOutcome === "partially_satisfactory"
    && analysis.missingElements.some((element) => /\b(deuxième|second(?:e)?|élément manquant|oubli(?:é)?|n['’]a pas été|pas (?:été )?(?:expliqué|nommé|indiqué|traité)|ne répond pas à|partie de la consigne)\b/iu.test(element))
    && asksForMultipleElements(question);
  const observedDifficulties = analysis.responseDisposition === "substantive"
    && analysis.pedagogicalOutcome === "partially_satisfactory"
    ? [...new Set([...(runtime.observedDifficulties ?? []), ...analysis.missingElements])]
    : [...(runtime.observedDifficulties ?? [])];
  const updatedRuntime: QuestionRuntimeState = {
    ...runtime,
    attemptNumber: recordedAttemptNumber,
    nonExploitableCount,
    lastAnalysis: analysis,
    status: "awaiting_response",
    hintLevel: offeredHintLevel ?? runtime.hintLevel,
    hintRequestCount: runtime.hintRequestCount + (offeredHintLevel ? 1 : 0),
    instructionOmissionObserved: runtime.instructionOmissionObserved || instructionOmissionDetected,
    omittedInstructionElements: runtime.omittedInstructionElements ?? (instructionOmissionDetected ? [...analysis.missingElements] : []),
    observedDifficulties,
  };
  const mustComplete = analysis.pedagogicalOutcome === "satisfactory" || (attemptLimit !== null && recordedAttemptNumber >= attemptLimit);
  const feedback = analysisUnavailable ? {
    assessment: "Socrato ne peut pas analyser ta réponse pour le moment. Elle reste affichée et cette tentative ne compte pas; tu pourras réessayer lorsque le service sera rétabli.",
    studentFacingText: "Socrato ne peut pas analyser ta réponse pour le moment. Elle reste affichée et cette tentative ne compte pas; tu pourras réessayer lorsque le service sera rétabli.",
    technicalNotice: "L’analyse pédagogique est temporairement indisponible.",
    relatedRuleIds: ["PED-AI-009"],
  } : createPedagogicalFeedback(analysis, question, nonExploitableCount, mustComplete, helpRequest ?? false, state.currentQuestionIndex === definition.questions.length - 1);
  let nextState = { ...state, questionStates: state.questionStates.with(state.currentQuestionIndex, updatedRuntime) };
  if (mustComplete) nextState = completeQuestion(definition, nextState, question, updatedRuntime, analysis, clock);
  return {
    state: nextState,
    feedback,
    hint: offeredHintLevel ? hintFor(question, offeredHintLevel) : undefined,
    questionCompleted: mustComplete,
    sessionCompleted: nextState.status === "completed",
  };
}

export async function finalizePedagogicalSession(
  state: PedagogicalSessionState,
  summaryProducer?: SummaryProducer,
  workbookProvider?: WorkbookReferenceProvider,
): Promise<PedagogicalSessionState> {
  if (state.status !== "completed") throw new Error("La séance doit être terminée avant la production du bilan.");
  const workedKnowledgeIds = [...new Set(state.questionStates.flatMap(({ result }) => result?.demonstratedKnowledgeIds ?? []))];
  const references = workbookProvider ? await workbookProvider.findApprovedForKnowledgeIds(workedKnowledgeIds) : [];
  const summary = summaryProducer
    ? await summaryProducer.produce(state, references)
    : produceLocalStructuredSummary(state, references);
  return { ...state, summary };
}

export function skipQuestionAfterAnalysisUnavailable(
  definition: PedagogicalSessionDefinition,
  state: PedagogicalSessionState,
): PedagogicalTransition {
  const { runtime } = currentDefinition(definition, state);
  const questionStates = state.questionStates.with(state.currentQuestionIndex, {
    ...runtime,
    status: "completed" as const,
    skippedWithoutEvaluation: true,
  });
  const nextIndex = state.currentQuestionIndex + 1;
  const sessionCompleted = nextIndex >= definition.questions.length;
  const nextState: PedagogicalSessionState = sessionCompleted
    ? { ...state, status: "completed", questionStates }
    : { ...state, currentQuestionIndex: nextIndex, questionStates };
  return {
    state: nextState,
    feedback: {
      assessment: "Ta réponse est conservée sans évaluation.",
      studentFacingText: "Ta réponse est conservée. Cette question ne comptera ni comme réussite ni comme difficulté dans ton bilan.",
      technicalNotice: "Question passée en mode dégradé après l’indisponibilité de l’analyse.",
      relatedRuleIds: ["PED-AI-009"],
    },
    questionCompleted: true,
    sessionCompleted,
  };
}
