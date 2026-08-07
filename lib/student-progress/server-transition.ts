import type { StudentProgressContract } from "./types.ts";

export type StudentProgressSubmissionGuard = {
  submissionId: string;
  expectedQuestionId: string;
  expectedCurrentQuestionIndex: number;
};

export type PersistedProgressSnapshot = Pick<
  StudentProgressContract,
  "activityId" | "notionId" | "state" | "currentQuestionIndex" | "totalQuestions" | "completedQuestionIds"
>;

export type StudentProgressTransitionValidation =
  | { ok: true }
  | { ok: false; reason: "stale_question" | "progress_regression" | "invalid_transition" };

export function validateStudentProgressTransition(
  current: PersistedProgressSnapshot,
  incoming: StudentProgressContract,
  guard: StudentProgressSubmissionGuard,
): StudentProgressTransitionValidation {
  if (
    current.activityId !== incoming.activityId
    || current.notionId !== incoming.notionId
    || current.totalQuestions !== incoming.totalQuestions
    || current.currentQuestionIndex !== guard.expectedCurrentQuestionIndex
  ) return { ok: false, reason: "stale_question" };

  const currentCompleted = new Set(current.completedQuestionIds);
  const incomingCompleted = new Set(incoming.completedQuestionIds);
  if ([...currentCompleted].some((id) => !incomingCompleted.has(id))) return { ok: false, reason: "progress_regression" };
  if (current.state === "completed" && incoming.state !== "completed") return { ok: false, reason: "progress_regression" };
  if (incoming.currentQuestionIndex < current.currentQuestionIndex || incoming.currentQuestionIndex > current.currentQuestionIndex + 1) {
    return { ok: false, reason: "invalid_transition" };
  }

  const newlyCompleted = [...incomingCompleted].filter((id) => !currentCompleted.has(id));
  if (newlyCompleted.some((id) => id !== guard.expectedQuestionId) || newlyCompleted.length > 1) {
    return { ok: false, reason: "invalid_transition" };
  }
  if (incoming.currentQuestionIndex > current.currentQuestionIndex && !incomingCompleted.has(guard.expectedQuestionId)) {
    return { ok: false, reason: "invalid_transition" };
  }
  return { ok: true };
}
