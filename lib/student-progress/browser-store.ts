import type { PedagogicalSessionState, ResultStatus } from "../pedagogical-session-engine/types.ts";
import type { StudentDashboardData } from "../student-dashboard/types.ts";
import { LEGACY_STUDENT_PROGRESS_CONTRACT_VERSION, STUDENT_PROGRESS_CONTRACT_VERSION, STUDENT_PROGRESS_CONVERSATION_VERSION, type StudentProgressContract, type StudentQuestionRuntimeProgress } from "./types.ts";
import { LOCAL_STUDENT_GROUP_ID, LOCAL_STUDENT_ID } from "../academic-context/local-context.ts";

export const STUDENT_PROGRESS_STORAGE_KEY = "socrato-student-progress-v1";
export const LOCAL_DEMO_STUDENT_ID = LOCAL_STUDENT_ID;
export const LOCAL_DEMO_GROUP_ID = LOCAL_STUDENT_GROUP_ID;

type ProgressStorage = Pick<Storage, "getItem" | "setItem">;

const PROGRESS_STATES = new Set(["not_started", "in_progress", "completed"]);
const RESULT_STATUSES = new Set(["mastered", "to_consolidate", "to_work_on"]);

function isResultEntry(value: unknown): value is StudentProgressContract["operationResults"][number] {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === "string" && RESULT_STATUSES.has(String(entry.status));
}

function isStudentProgressContract(value: unknown): value is StudentProgressContract {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  const validRuntime = (runtime: unknown): runtime is StudentQuestionRuntimeProgress[] => Array.isArray(runtime) && runtime.every((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const item = entry as Record<string, unknown>;
    return typeof item.questionId === "string" && Number.isInteger(item.attemptNumber) && Number(item.attemptNumber) >= 0 && Number(item.attemptNumber) <= 5
      && [0, 1, 2].includes(Number(item.hintLevel)) && Number.isInteger(item.hintRequestCount) && Number(item.hintRequestCount) >= 0
      && Number.isInteger(item.nonExploitableCount) && Number(item.nonExploitableCount) >= 0
      && ["presented", "awaiting_response", "completed"].includes(String(item.status));
  });
  return (record.schemaVersion === LEGACY_STUDENT_PROGRESS_CONTRACT_VERSION || record.schemaVersion === STUDENT_PROGRESS_CONTRACT_VERSION || record.schemaVersion === STUDENT_PROGRESS_CONVERSATION_VERSION)
    && ["studentId", "groupId", "activityId", "sessionId", "notionId", "startedAt", "updatedAt"].every((key) => typeof record[key] === "string")
    && PROGRESS_STATES.has(String(record.state))
    && Number.isInteger(record.currentQuestionIndex)
    && Number.isInteger(record.totalQuestions)
    && Array.isArray(record.completedQuestionIds)
    && record.completedQuestionIds.every((id) => typeof id === "string")
    && Array.isArray(record.operationResults)
    && record.operationResults.every(isResultEntry)
    && Array.isArray(record.historicalKnowledgeResults)
    && record.historicalKnowledgeResults.every(isResultEntry)
    && (record.completedAt === null || typeof record.completedAt === "string")
    && (record.schemaVersion === LEGACY_STUDENT_PROGRESS_CONTRACT_VERSION || validRuntime(record.questionRuntime));
}

function strongestStatus(left: ResultStatus | undefined, right: ResultStatus): ResultStatus {
  const rank: Record<ResultStatus, number> = { to_work_on: 0, to_consolidate: 1, mastered: 2 };
  return !left || rank[right] > rank[left] ? right : left;
}

function resultEntries(entries: Array<{ id: string; status: ResultStatus }>) {
  const statuses = new Map<string, ResultStatus>();
  for (const { id, status } of entries) statuses.set(id, strongestStatus(statuses.get(id), status));
  return [...statuses].map(([id, status]) => ({ id, status }));
}

export function createStudentProgressContract(
  state: PedagogicalSessionState,
  now = new Date(),
): Extract<StudentProgressContract, { schemaVersion: typeof STUDENT_PROGRESS_CONVERSATION_VERSION }> {
  const completedQuestions = state.questionStates.filter(({ status, result }) => status === "completed" && result);
  const hasStarted = state.currentQuestionIndex > 0 || state.questionStates.some(({ attemptNumber, hintRequestCount, status }) => attemptNumber > 0 || hintRequestCount > 0 || status !== "presented");
  const operationResults = completedQuestions.flatMap(({ result }) => result!.operationIds.map((id) => ({ id, status: result!.status })));
  const historicalKnowledgeResults = completedQuestions.flatMap(({ result }) => result!.historicalKnowledgeIds.map((id) => ({ id, status: result!.status })));
  const timestamp = now.toISOString();
  return {
    schemaVersion: STUDENT_PROGRESS_CONVERSATION_VERSION,
    studentId: LOCAL_DEMO_STUDENT_ID,
    groupId: LOCAL_DEMO_GROUP_ID,
    activityId: state.activityId,
    sessionId: state.sessionId,
    notionId: state.notionId,
    state: state.status === "completed" ? "completed" : completedQuestions.length || hasStarted ? "in_progress" : "not_started",
    currentQuestionIndex: state.currentQuestionIndex,
    totalQuestions: state.questionStates.length,
    completedQuestionIds: completedQuestions.map(({ questionId }) => questionId),
    questionRuntime: state.questionStates.map(({ questionId, attemptNumber, hintLevel, hintRequestCount, nonExploitableCount, status, lastAnalysis }) => ({
      questionId, attemptNumber, hintLevel, hintRequestCount, nonExploitableCount, status, ...(lastAnalysis ? { lastAnalysis } : {}),
    })),
    operationResults: state.summary?.operationResults ?? resultEntries(operationResults),
    historicalKnowledgeResults: state.summary?.historicalKnowledgeResults ?? resultEntries(historicalKnowledgeResults),
    startedAt: timestamp,
    updatedAt: timestamp,
    completedAt: state.summary?.completedAt ?? null,
  };
}

export function readStudentProgress(storage: Pick<Storage, "getItem">): Record<string, StudentProgressContract> {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(STUDENT_PROGRESS_STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => isStudentProgressContract(value)));
  } catch {
    return {};
  }
}

export function saveStudentProgress(storage: ProgressStorage, progress: StudentProgressContract) {
  const records = readStudentProgress(storage);
  const previous = records[progress.activityId];
  const next = { ...progress, startedAt: previous?.startedAt ?? progress.startedAt };
  storage.setItem(STUDENT_PROGRESS_STORAGE_KEY, JSON.stringify({ ...records, [progress.activityId]: next }));
  return next;
}

export function clearStudentProgress(storage: ProgressStorage, activityId: string) {
  const records = readStudentProgress(storage);
  delete records[activityId];
  storage.setItem(STUDENT_PROGRESS_STORAGE_KEY, JSON.stringify(records));
}

export function applyStoredStudentProgress(data: StudentDashboardData, storage: Pick<Storage, "getItem">): StudentDashboardData {
  const records = readStudentProgress(storage);
  return {
    ...data,
    activities: data.activities.map((activity) => {
      const progress = records[activity.id];
      if (!progress || progress.state === "not_started") return activity;
      return {
        ...activity,
        activityStatus: progress.state,
        progressPercentage: progress.state === "completed" ? 100 : Math.round((progress.completedQuestionIds.length / Math.max(1, progress.totalQuestions)) * 100),
        isRecent: false,
      };
    }),
  };
}

export function restoreStudentProgress(state: PedagogicalSessionState, progress: StudentProgressContract | undefined): PedagogicalSessionState {
  if (!progress || progress.activityId !== state.activityId || progress.totalQuestions !== state.questionStates.length || progress.state === "not_started") return state;
  const completedIds = new Set(progress.completedQuestionIds);
  const operationStatuses = new Map(progress.operationResults.map(({ id, status }) => [id, status]));
  const knowledgeStatuses = new Map(progress.historicalKnowledgeResults.map(({ id, status }) => [id, status]));
  const runtimeByQuestion = new Map((progress.schemaVersion === STUDENT_PROGRESS_CONTRACT_VERSION || progress.schemaVersion === STUDENT_PROGRESS_CONVERSATION_VERSION ? progress.questionRuntime : []).map((runtime) => [runtime.questionId, runtime]));
  const questionStates = state.questionStates.map((question) => {
    const runtime = runtimeByQuestion.get(question.questionId);
    const restoredQuestion = runtime ? {
      ...question,
      attemptNumber: runtime.attemptNumber,
      hintLevel: runtime.hintLevel,
      hintRequestCount: runtime.hintRequestCount,
      nonExploitableCount: runtime.nonExploitableCount,
      status: runtime.status,
      ...(runtime.lastAnalysis ? { lastAnalysis: runtime.lastAnalysis } : {}),
    } : question;
    if (!completedIds.has(question.questionId)) return restoredQuestion;
    const status = operationStatuses.get(question.primaryOperationId)
      ?? question.historicalKnowledgeIds.map((id) => knowledgeStatuses.get(id)).find(Boolean)
      ?? "to_consolidate";
    return {
      ...restoredQuestion,
      status: "completed" as const,
      result: {
        sessionId: state.sessionId, activityId: state.activityId, questionId: question.questionId, notionId: question.notionId,
        primaryOperationId: question.primaryOperationId, operationIds: question.operationIds,
        historicalKnowledgeIds: question.historicalKnowledgeIds, documentIds: question.documentIds,
        attemptNumber: Math.max(1, question.attemptNumber), hintLevel: question.hintLevel, status,
        advancedMastery: false, demonstratedKnowledgeIds: [], demonstratedOperationIds: [], observedStrengths: [], consolidationTargets: [],
        completedAt: progress.updatedAt,
      },
    };
  });
  const firstUnfinished = questionStates.findIndex(({ status }) => status !== "completed");
  const currentQuestionIndex = firstUnfinished === -1 ? questionStates.length - 1 : firstUnfinished;
  return { ...state, currentQuestionIndex: Math.max(0, currentQuestionIndex), questionStates };
}
