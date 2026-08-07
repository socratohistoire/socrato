"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { authorizeStudentActivityScope, type StudentActivityScopeRepository } from "@/lib/student-data-boundaries/authorize";
import { getStudentAccessRuntime, STUDENT_SESSION_COOKIE } from "@/lib/student-access/local-runtime";
import { getSocratoDatabase } from "@/lib/server/database";
import type { PedagogicalSummary } from "@/lib/pedagogical-session-engine";
import type { StudentProgressContract } from "@/lib/student-progress/types";
import { validateStudentProgressTransition, type PersistedProgressSnapshot, type StudentProgressSubmissionGuard } from "@/lib/student-progress/server-transition";

const STATES = new Set(["not_started", "in_progress", "completed"]);
const RESULT_STATUSES = new Set(["mastered", "to_consolidate", "to_work_on"]);

function validSummary(value: unknown): value is PedagogicalSummary {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const stringArray = (input: unknown) => Array.isArray(input) && input.every((entry) => typeof entry === "string");
  const results = (input: unknown) => Array.isArray(input) && input.every((entry) => entry && typeof entry === "object" && typeof (entry as Record<string, unknown>).id === "string" && RESULT_STATUSES.has(String((entry as Record<string, unknown>).status)));
  return typeof item.sessionId === "string" && typeof item.activityId === "string" && typeof item.notionId === "string"
    && typeof item.encouragement === "string" && stringArray(item.strengths) && stringArray(item.consolidationTargets)
    && results(item.operationResults) && results(item.historicalKnowledgeResults) && Array.isArray(item.workbookReferences)
    && typeof item.localDemoNotice === "string" && typeof item.completedAt === "string" && Number.isFinite(Date.parse(item.completedAt));
}

function validProgress(value: unknown): value is StudentProgressContract {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const validResults = (results: unknown) => Array.isArray(results) && results.every((result) => result && typeof result === "object" && typeof (result as Record<string, unknown>).id === "string" && RESULT_STATUSES.has(String((result as Record<string, unknown>).status)));
  const validRuntime = (runtime: unknown) => Array.isArray(runtime) && runtime.every((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const question = entry as Record<string, unknown>;
    return typeof question.questionId === "string" && Number.isInteger(question.attemptNumber) && Number(question.attemptNumber) >= 0 && Number(question.attemptNumber) <= 3
      && [0, 1, 2].includes(Number(question.hintLevel)) && Number.isInteger(question.hintRequestCount) && Number(question.hintRequestCount) >= 0
      && Number.isInteger(question.nonExploitableCount) && Number(question.nonExploitableCount) >= 0
      && ["presented", "awaiting_response", "completed"].includes(String(question.status));
  });
  return (item.schemaVersion === 1 || item.schemaVersion === 2) && typeof item.activityId === "string" && typeof item.notionId === "string"
    && STATES.has(String(item.state)) && Number.isInteger(item.currentQuestionIndex) && Number.isInteger(item.totalQuestions)
    && Array.isArray(item.completedQuestionIds) && item.completedQuestionIds.every((id) => typeof id === "string")
    && validResults(item.operationResults) && validResults(item.historicalKnowledgeResults)
    && (item.schemaVersion === 1 || validRuntime(item.questionRuntime));
}

export async function saveStudentProgressToDatabase(progress: StudentProgressContract, guard?: StudentProgressSubmissionGuard) {
  if (!validProgress(progress)) return { ok: false as const, error: "La progression transmise est invalide." };
  if (guard && (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(guard.submissionId)
    || typeof guard.expectedQuestionId !== "string" || !Number.isInteger(guard.expectedCurrentQuestionIndex) || guard.expectedCurrentQuestionIndex < 0)) {
    return { ok: false as const, error: "L’identifiant de soumission est invalide." };
  }
  const token = (await cookies()).get(STUDENT_SESSION_COOKIE)?.value;
  const studentSession = token ? await getStudentAccessRuntime().sessions.findActiveByToken(token) : null;
  if (!studentSession) return { ok: false as const, error: "La session élève n’est plus valide." };
  const sql = getSocratoDatabase();
  const repository: StudentActivityScopeRepository = {
    async findAssignedActivity(studentId, activityId) {
      const rows = await sql<{ group_id: string; notion_ids: string[]; question_ids: string[] }[]>`
        select g.id as group_id, a.notion_ids, a.question_ids
        from socrato.group_memberships gm
        join socrato.groups g on g.id = gm.group_id and g.archived_at is null
        join socrato.activity_group_assignments aga on aga.group_id = g.id
        join socrato.activities a on a.id = aga.activity_id and a.publication_status = ${"published"}
        where gm.student_id = ${studentId} and gm.active = true and a.id = ${activityId}
        limit 1
      `;
      return rows[0] ? { groupId: rows[0].group_id, notionIds: rows[0].notion_ids, questionIds: rows[0].question_ids } : null;
    },
  };
  const scope = await authorizeStudentActivityScope(repository, studentSession.anonymousStudentId, progress.activityId);
  if (!scope) return { ok: false as const, error: "Cette activité n’est pas assignée à cet élève." };
  if (!scope.notionIds.includes(progress.notionId) || progress.totalQuestions !== scope.questionIds.length) return { ok: false as const, error: "La progression ne correspond pas à l’activité assignée." };
  const allowedQuestionIds = new Set(scope.questionIds);
  if (progress.completedQuestionIds.some((id) => !allowedQuestionIds.has(id)) || progress.currentQuestionIndex < 0 || progress.currentQuestionIndex >= progress.totalQuestions) return { ok: false as const, error: "La progression contient une question non autorisée." };
  if (progress.state === "completed" && progress.completedQuestionIds.length !== progress.totalQuestions) return { ok: false as const, error: "L’activité ne peut pas être terminée avant toutes les questions." };
  if (progress.schemaVersion === 2) {
    const runtimeIds = new Set(progress.questionRuntime.map(({ questionId }) => questionId));
    const completedIds = new Set(progress.completedQuestionIds);
    if (runtimeIds.size !== progress.questionRuntime.length || progress.questionRuntime.length !== progress.totalQuestions
      || progress.questionRuntime.some(({ questionId, status }) => !allowedQuestionIds.has(questionId) || (status === "completed") !== completedIds.has(questionId))) {
      return { ok: false as const, error: "L’état des questions contient une question non autorisée." };
    }
  }
  if (guard && scope.questionIds[guard.expectedCurrentQuestionIndex] !== guard.expectedQuestionId) return { ok: false as const, error: "Cette question n’est plus la question active." };

  try {
    const persistence = await sql.begin(async (tx) => {
      const existing = await tx<{ id: string; started_at: Date }[]>`
        select id, started_at from socrato.learning_sessions
        where activity_id = ${progress.activityId} and student_id = ${studentSession.anonymousStudentId} and group_id = ${scope.groupId}
        order by started_at desc limit 1 for update
      `;
      const learningSessionId = existing[0]?.id ?? `learning-session-${randomUUID()}`;
      if (!existing[0]) await tx`
        insert into socrato.learning_sessions (id, activity_id, student_id, group_id)
        values (${learningSessionId}, ${progress.activityId}, ${studentSession.anonymousStudentId}, ${scope.groupId})
      `;

      if (guard) {
        const duplicate = await tx<{ activity_id: string; question_id: string; expected_question_index: number; resulting_question_index: number }[]>`
          select activity_id, question_id, expected_question_index, resulting_question_index from socrato.student_progress_submissions
          where id = ${guard.submissionId}::uuid and student_id = ${studentSession.anonymousStudentId}
          limit 1
        `;
        if (duplicate[0]) {
          const sameSubmission = duplicate[0].activity_id === progress.activityId
            && duplicate[0].question_id === guard.expectedQuestionId
            && duplicate[0].expected_question_index === guard.expectedCurrentQuestionIndex
            && duplicate[0].resulting_question_index === progress.currentQuestionIndex;
          return sameSubmission ? { duplicate: true as const } : { conflict: true as const };
        }

        const persistedRows = await tx<{
          activity_id: string; notion_id: string; state: PersistedProgressSnapshot["state"];
          current_question_index: number; total_questions: number; completed_question_ids: string[];
        }[]>`
          select activity_id, notion_id, state, current_question_index, total_questions, completed_question_ids
          from socrato.student_progress where session_id = ${learningSessionId} for update
        `;
        const persisted = persistedRows[0] ? {
          activityId: persistedRows[0].activity_id,
          notionId: persistedRows[0].notion_id,
          state: persistedRows[0].state,
          currentQuestionIndex: persistedRows[0].current_question_index,
          totalQuestions: persistedRows[0].total_questions,
          completedQuestionIds: persistedRows[0].completed_question_ids,
        } : {
          activityId: progress.activityId,
          notionId: progress.notionId,
          state: "not_started" as const,
          currentQuestionIndex: 0,
          totalQuestions: progress.totalQuestions,
          completedQuestionIds: [],
        };
        const transition = validateStudentProgressTransition(persisted, progress, guard);
        if (!transition.ok) return { conflict: true as const };
      }

      const completedAt = progress.state === "completed" ? new Date().toISOString() : null;
      await tx`
        insert into socrato.student_progress (
          session_id, schema_version, activity_id, student_id, group_id, notion_id, state,
          current_question_index, total_questions, completed_question_ids, operation_results,
          historical_knowledge_results, question_runtime, started_at, updated_at, completed_at
        ) values (
          ${learningSessionId}, ${progress.schemaVersion}, ${progress.activityId}, ${studentSession.anonymousStudentId}, ${scope.groupId}, ${progress.notionId}, ${progress.state},
          ${progress.currentQuestionIndex}, ${progress.totalQuestions}, ${progress.completedQuestionIds}, ${tx.json(progress.operationResults)},
          ${tx.json(progress.historicalKnowledgeResults)}, ${tx.json(progress.schemaVersion === 2 ? progress.questionRuntime : [])},
          ${existing[0]?.started_at?.toISOString() ?? new Date().toISOString()}, ${new Date().toISOString()}, ${completedAt}
        )
        on conflict (session_id) do update set
          schema_version = excluded.schema_version, state = excluded.state, current_question_index = excluded.current_question_index,
          completed_question_ids = excluded.completed_question_ids, operation_results = excluded.operation_results,
          historical_knowledge_results = excluded.historical_knowledge_results, question_runtime = excluded.question_runtime, updated_at = excluded.updated_at,
          completed_at = excluded.completed_at
      `;
      if (guard) await tx`
        insert into socrato.student_progress_submissions (
          id, session_id, student_id, activity_id, question_id, expected_question_index, resulting_question_index
        ) values (
          ${guard.submissionId}::uuid, ${learningSessionId}, ${studentSession.anonymousStudentId}, ${progress.activityId},
          ${guard.expectedQuestionId}, ${guard.expectedCurrentQuestionIndex}, ${progress.currentQuestionIndex}
        )
      `;
      if (completedAt) await tx`update socrato.learning_sessions set completed_at = ${completedAt} where id = ${learningSessionId}`;
      return { saved: true as const };
    });
    if (persistence.conflict) return { ok: false as const, conflict: true as const, error: "La séance a changé dans un autre onglet. Recharge la page pour reprendre au bon endroit." };
    return { ok: true as const, duplicate: Boolean(persistence.duplicate) };
  } catch {
    return { ok: false as const, error: "La progression n’a pas pu être enregistrée." };
  }
}

export async function saveStudentOutcomeToDatabase(summary: PedagogicalSummary) {
  if (!validSummary(summary)) return { ok: false as const, error: "Le bilan transmis est invalide." };
  const token = (await cookies()).get(STUDENT_SESSION_COOKIE)?.value;
  const studentSession = token ? await getStudentAccessRuntime().sessions.findActiveByToken(token) : null;
  if (!studentSession) return { ok: false as const, error: "La session élève n’est plus valide." };
  try {
    const sql = getSocratoDatabase();
    const sessions = await sql<{ session_id: string; notion_ids: string[]; progress_state: string | null }[]>`
      select ls.id as session_id, a.notion_ids, sp.state as progress_state
      from socrato.learning_sessions ls
      join socrato.activities a on a.id = ls.activity_id and a.publication_status = ${"published"}
      join socrato.activity_group_assignments aga on aga.activity_id = a.id and aga.group_id = ls.group_id
      join socrato.group_memberships gm on gm.group_id = ls.group_id and gm.student_id = ls.student_id and gm.active = true
      left join socrato.student_progress sp on sp.session_id = ls.id
      where ls.student_id = ${studentSession.anonymousStudentId} and ls.activity_id = ${summary.activityId}
      order by ls.started_at desc
      limit 1
    `;
    const session = sessions[0];
    if (!session || session.progress_state !== "completed" || !session.notion_ids.includes(summary.notionId)) return { ok: false as const, error: "Le bilan ne correspond pas à une activité terminée." };
    await sql`
      insert into socrato.student_outcomes (session_id, student_id, activity_id, summary, completed_at)
      values (${session.session_id}, ${studentSession.anonymousStudentId}, ${summary.activityId}, ${sql.json(summary)}, ${summary.completedAt})
      on conflict (session_id) do update set summary = excluded.summary, completed_at = excluded.completed_at
    `;
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Le bilan n’a pas pu être enregistré." };
  }
}
