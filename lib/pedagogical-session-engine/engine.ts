import { createPedagogicalFeedback } from "./feedback.ts";
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

function turnHintIntoQuestion(text: string) {
  const trimmed = text.trim();
  if (trimmed.endsWith("?")) return trimmed;
  const statement = trimmed.replace(/[.!…]+$/, "");
  return `${statement}. Comment peux-tu utiliser cet indice pour répondre à la question?`;
}

function hintFor(question: PedagogicalQuestionDefinition, level: ExplicitHintLevel): PedagogicalHint {
  return {
    level,
    text: turnHintIntoQuestion(question.hintSequence[level]),
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

function resultStatus(analysis: StructuredResponseAnalysis): ResultStatus {
  if (analysis.pedagogicalOutcome === "satisfactory") return "mastered";
  if (analysis.pedagogicalOutcome === "partially_satisfactory") return "to_consolidate";
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
  const status = resultStatus(analysis);
  const demonstratedOperationIds = analysis.observedOperationIds.filter((id) => question.operationIds.includes(id));
  const demonstratedKnowledgeIds = analysis.demonstratedKnowledgeIds.filter((id) => question.historicalKnowledgeIds.includes(id));
  const result: QuestionResult = {
    sessionId: state.sessionId, activityId: state.activityId, questionId: question.id, notionId: question.notionId,
    primaryOperationId: question.primaryOperationId, operationIds: [...question.operationIds], historicalKnowledgeIds: [...question.historicalKnowledgeIds], documentIds: [...question.documentIds],
    attemptNumber: runtime.attemptNumber, hintLevel: runtime.hintLevel, status,
    advancedMastery: status === "mastered" && advancedMastery(analysis, question),
    demonstratedKnowledgeIds,
    demonstratedOperationIds,
    observedStrengths: [...analysis.observedStrengths],
    consolidationTargets: [...analysis.missingElements],
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
  if (attemptNumber > MAX_PEDAGOGICAL_ATTEMPTS) throw new Error("Le maximum de trois tentatives est déjà atteint.");
  const response: StudentResponse = {
    sessionId: state.sessionId, activityId: state.activityId, questionId: question.id, notionId: question.notionId,
    primaryOperationId: question.primaryOperationId, operationIds: [...question.operationIds], historicalKnowledgeIds: [...question.historicalKnowledgeIds], documentIds: [...question.documentIds],
    attemptNumber, hintLevel: runtime.hintLevel, content,
  };
  let analysis: StructuredResponseAnalysis;
  try {
    analysis = validateStructuredAnalysis(await analyzer.analyze(response, question), question);
  } catch {
    analysis = neutralAnalysis();
  }
  const nonExploitableCount = runtime.nonExploitableCount + (analysis.pedagogicalOutcome === "non_exploitable" ? 1 : 0);
  const offeredHintLevel = analysis.responseDisposition === "too_short" ? nextHintLevel(runtime) : null;
  const updatedRuntime: QuestionRuntimeState = {
    ...runtime,
    attemptNumber,
    nonExploitableCount,
    lastAnalysis: analysis,
    status: "awaiting_response",
    hintLevel: offeredHintLevel ?? runtime.hintLevel,
    hintRequestCount: runtime.hintRequestCount + (offeredHintLevel ? 1 : 0),
  };
  const feedback = createPedagogicalFeedback(analysis, question, nonExploitableCount);
  const mustComplete = analysis.pedagogicalOutcome === "satisfactory" || attemptNumber >= MAX_PEDAGOGICAL_ATTEMPTS;
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
