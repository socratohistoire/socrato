"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { authorizeStudentActivityScope, type StudentActivityScopeRepository } from "@/lib/student-data-boundaries/authorize";
import { getStudentAccessRuntime, STUDENT_SESSION_COOKIE } from "@/lib/student-access/local-runtime";
import { getSocratoDatabase } from "@/lib/server/database";
import type { PedagogicalSummary } from "@/lib/pedagogical-session-engine";
import type { StudentProgressContract } from "@/lib/student-progress/types";

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
  return item.schemaVersion === 1 && typeof item.activityId === "string" && typeof item.notionId === "string"
    && STATES.has(String(item.state)) && Number.isInteger(item.currentQuestionIndex) && Number.isInteger(item.totalQuestions)
    && Array.isArray(item.completedQuestionIds) && item.completedQuestionIds.every((id) => typeof id === "string")
    && validResults(item.operationResults) && validResults(item.historicalKnowledgeResults);
}

export async function saveStudentProgressToDatabase(progress: StudentProgressContract) {
  if (!validProgress(progress)) return { ok: false as const, error: "La progression transmise est invalide." };
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

  try {
    await sql.begin(async (tx) => {
      const existing = await tx<{ id: string; started_at: Date }[]>`
        select id, started_at from socrato.learning_sessions
        where activity_id = ${progress.activityId} and student_id = ${studentSession.anonymousStudentId} and group_id = ${scope.groupId}
        order by started_at desc limit 1
      `;
      const learningSessionId = existing[0]?.id ?? `learning-session-${randomUUID()}`;
      if (!existing[0]) await tx`
        insert into socrato.learning_sessions (id, activity_id, student_id, group_id)
        values (${learningSessionId}, ${progress.activityId}, ${studentSession.anonymousStudentId}, ${scope.groupId})
      `;
      const completedAt = progress.state === "completed" ? new Date().toISOString() : null;
      await tx`
        insert into socrato.student_progress (
          session_id, schema_version, activity_id, student_id, group_id, notion_id, state,
          current_question_index, total_questions, completed_question_ids, operation_results,
          historical_knowledge_results, started_at, updated_at, completed_at
        ) values (
          ${learningSessionId}, ${1}, ${progress.activityId}, ${studentSession.anonymousStudentId}, ${scope.groupId}, ${progress.notionId}, ${progress.state},
          ${progress.currentQuestionIndex}, ${progress.totalQuestions}, ${progress.completedQuestionIds}, ${tx.json(progress.operationResults)},
          ${tx.json(progress.historicalKnowledgeResults)}, ${existing[0]?.started_at?.toISOString() ?? new Date().toISOString()}, ${new Date().toISOString()}, ${completedAt}
        )
        on conflict (session_id) do update set
          state = excluded.state, current_question_index = excluded.current_question_index,
          completed_question_ids = excluded.completed_question_ids, operation_results = excluded.operation_results,
          historical_knowledge_results = excluded.historical_knowledge_results, updated_at = excluded.updated_at,
          completed_at = excluded.completed_at
      `;
      if (completedAt) await tx`update socrato.learning_sessions set completed_at = ${completedAt} where id = ${learningSessionId}`;
    });
    return { ok: true as const };
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
