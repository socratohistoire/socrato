import assert from "node:assert/strict";
import test from "node:test";
import type { PedagogicalSessionState, QuestionRuntimeState } from "../lib/pedagogical-session-engine/types.ts";
import { applyStoredStudentProgress, clearStudentProgress, createStudentProgressContract, readStudentProgress, restoreStudentProgress, saveStudentProgress, STUDENT_PROGRESS_STORAGE_KEY } from "../lib/student-progress/index.ts";
import type { StudentDashboardData } from "../lib/student-dashboard/types.ts";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

function question(overrides: Partial<QuestionRuntimeState> = {}): QuestionRuntimeState {
  return {
    sessionId: "session-1", activityId: "activity-1", questionId: "question-1", notionId: "notion-1",
    primaryOperationId: "operation-1", operationIds: ["operation-1"], historicalKnowledgeIds: ["knowledge-1"], documentIds: [],
    attemptNumber: 0, hintLevel: 0, hintRequestCount: 0, nonExploitableCount: 0, status: "presented", ...overrides,
  };
}

function session(questionState = question()): PedagogicalSessionState {
  return { sessionId: "session-1", activityId: "activity-1", notionId: "notion-1", dashboardHref: "/eleve", status: "active", currentQuestionIndex: 0, questionStates: [questionState] };
}

test("creates a minimal versioned record without raw student answers", () => {
  const progress = createStudentProgressContract(session(), new Date("2026-08-05T12:00:00.000Z"));
  assert.equal(progress.schemaVersion, 1);
  assert.equal(progress.state, "not_started");
  assert.equal(progress.studentId, "local-anonymous-student-1");
  const serialized = JSON.stringify(progress);
  for (const forbidden of ["content", "conversation", "transcript", "studentResponse", "messageHistory"]) assert.equal(serialized.includes(forbidden), false);
});

test("marks progress in progress at the first attempt", () => {
  assert.equal(createStudentProgressContract(session(question({ attemptNumber: 1, status: "awaiting_response" }))).state, "in_progress");
});

test("stores only structured completed-question results", () => {
  const completedAt = "2026-08-05T12:05:00.000Z";
  const completedQuestion = question({ status: "completed", attemptNumber: 2, result: {
    sessionId: "session-1", activityId: "activity-1", questionId: "question-1", notionId: "notion-1",
    primaryOperationId: "operation-1", operationIds: ["operation-1"], historicalKnowledgeIds: ["knowledge-1"], documentIds: [],
    attemptNumber: 2, hintLevel: 0, status: "to_consolidate", advancedMastery: false, demonstratedKnowledgeIds: [], demonstratedOperationIds: [], observedStrengths: [], consolidationTargets: [], completedAt,
  }});
  const progress = createStudentProgressContract(session(completedQuestion));
  assert.deepEqual(progress.completedQuestionIds, ["question-1"]);
  assert.deepEqual(progress.operationResults, [{ id: "operation-1", status: "to_consolidate" }]);
  assert.deepEqual(progress.historicalKnowledgeResults, [{ id: "knowledge-1", status: "to_consolidate" }]);
});

test("preserves the original start time and rejects invalid stored records", () => {
  const storage = new MemoryStorage();
  const first = createStudentProgressContract(session(), new Date("2026-08-05T12:00:00.000Z"));
  saveStudentProgress(storage, first);
  const second = createStudentProgressContract(session(question({ attemptNumber: 1 })), new Date("2026-08-05T12:10:00.000Z"));
  const saved = saveStudentProgress(storage, second);
  assert.equal(saved.startedAt, first.startedAt);
  assert.equal(saved.updatedAt, second.updatedAt);
  storage.setItem(STUDENT_PROGRESS_STORAGE_KEY, JSON.stringify({ valid: saved, invalid: { schemaVersion: 99 } }));
  assert.deepEqual(Object.keys(readStudentProgress(storage)), ["valid"]);
});

test("applies stored progress to the student dashboard", () => {
  const storage = new MemoryStorage();
  const progress = { ...createStudentProgressContract(session(question({ attemptNumber: 1 }))), completedQuestionIds: ["question-1"], totalQuestions: 4 };
  saveStudentProgress(storage, progress);
  const activity = {
    id: "activity-1", activityTitle: "Activité", activityType: "revision" as const, publicationDate: "5 août 2026", historicalPeriod: {}, notionIds: ["notion-1"],
    historicalKnowledgeIds: [], durationMinutes: 0, progressPercentage: 0, activityStatus: "not_started" as const, origin: "teacher_assigned" as const,
    isRecent: true, actionHref: "/activite", operations: [], historicalKnowledge: [],
    summary: { state: "pending" as const, strengths: [], consolidationTargets: [], recommendation: null, consolidationActivity: null, consolidationProgress: null },
  };
  const dashboard: StudentDashboardData = { defaultActivityId: activity.id, selectedActivityId: activity.id, activities: [activity], notions: [], source: "local_demo" };
  const restored = applyStoredStudentProgress(dashboard, storage).activities[0];
  assert.equal(restored.activityStatus, "in_progress");
  assert.equal(restored.progressPercentage, 25);
  assert.equal(restored.isRecent, false);
});

test("resumes on the first unfinished question and can clear the record", () => {
  const storage = new MemoryStorage();
  const first = question({ status: "completed", result: {
    sessionId: "session-1", activityId: "activity-1", questionId: "question-1", notionId: "notion-1", primaryOperationId: "operation-1",
    operationIds: ["operation-1"], historicalKnowledgeIds: ["knowledge-1"], documentIds: [], attemptNumber: 1, hintLevel: 0,
    status: "mastered", advancedMastery: false, demonstratedKnowledgeIds: [], demonstratedOperationIds: [], observedStrengths: [], consolidationTargets: [], completedAt: "2026-08-05T12:00:00.000Z",
  }});
  const second = question({ questionId: "question-2", primaryOperationId: "operation-2", operationIds: ["operation-2"] });
  const progressedState = { ...session(first), currentQuestionIndex: 1, questionStates: [first, second] };
  const progress = createStudentProgressContract(progressedState);
  saveStudentProgress(storage, progress);
  const freshState = { ...session(question()), questionStates: [question(), second] };
  const restored = restoreStudentProgress(freshState, progress);
  assert.equal(restored.currentQuestionIndex, 1);
  assert.equal(restored.questionStates[0].status, "completed");
  clearStudentProgress(storage, "activity-1");
  assert.deepEqual(readStudentProgress(storage), {});
});
