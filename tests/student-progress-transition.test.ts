import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateStudentProgressTransition, type PersistedProgressSnapshot, type StudentProgressSubmissionGuard } from "../lib/student-progress/server-transition.ts";
import type { StudentProgressContract } from "../lib/student-progress/types.ts";

const current: PersistedProgressSnapshot = {
  activityId: "activity-1", notionId: "notion-1", state: "in_progress", currentQuestionIndex: 1,
  totalQuestions: 3, completedQuestionIds: ["question-1"],
};
const guard: StudentProgressSubmissionGuard = {
  submissionId: "018f1d21-19f0-7c32-9f31-7a953b48db41",
  expectedQuestionId: "question-2", expectedCurrentQuestionIndex: 1,
};

function progress(overrides: Partial<StudentProgressContract> = {}): StudentProgressContract {
  return {
    schemaVersion: 1, studentId: "student-1", groupId: "group-1", activityId: "activity-1",
    sessionId: "session-1", notionId: "notion-1", state: "in_progress", currentQuestionIndex: 1,
    totalQuestions: 3, completedQuestionIds: ["question-1"], operationResults: [], historicalKnowledgeResults: [],
    startedAt: "2026-08-07T16:00:00.000Z", updatedAt: "2026-08-07T16:05:00.000Z", completedAt: null,
    ...overrides,
  } as StudentProgressContract;
}

test("accepte une tentative sur la question courante sans conserver la réponse brute", () => {
  assert.deepEqual(validateStudentProgressTransition(current, progress(), guard), { ok: true });
  assert.equal(JSON.stringify(guard).includes("content"), false);
});

test("accepte l’avancement exact après avoir terminé la question attendue", () => {
  assert.deepEqual(validateStudentProgressTransition(current, progress({ currentQuestionIndex: 2, completedQuestionIds: ["question-1", "question-2"] }), guard), { ok: true });
});

test("refuse une soumission provenant d’une ancienne question", () => {
  assert.deepEqual(validateStudentProgressTransition(current, progress(), { ...guard, expectedCurrentQuestionIndex: 0 }), { ok: false, reason: "stale_question" });
});

test("refuse le recul et le saut de progression", () => {
  assert.deepEqual(validateStudentProgressTransition(current, progress({ completedQuestionIds: [] }), guard), { ok: false, reason: "progress_regression" });
  assert.deepEqual(validateStudentProgressTransition(current, progress({ currentQuestionIndex: 2 }), guard), { ok: false, reason: "invalid_transition" });
  assert.deepEqual(validateStudentProgressTransition(current, progress({ currentQuestionIndex: 2, completedQuestionIds: ["question-1", "question-3"] }), guard), { ok: false, reason: "invalid_transition" });
});

test("réutilise le même reçu après une réponse réseau perdue et ne stocke aucun texte libre", () => {
  const view = readFileSync("app/eleve/activite/[activityId]/session-view.tsx", "utf8");
  const migration = readFileSync("supabase/migrations/20260807163000_durable_student_progress_submissions.sql", "utf8");
  assert.match(view, /pendingSubmissionRef\.current\?\.questionId/);
  assert.match(view, /submissionId: pendingSubmission\.id/);
  assert.match(view, /pendingSubmissionRef\.current = null/);
  assert.doesNotMatch(migration, /content|response_text|transcript|conversation/);
});
