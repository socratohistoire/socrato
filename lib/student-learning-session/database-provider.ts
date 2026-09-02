import { getSocratoDatabase } from "../server/database.ts";
import { getActivityDashboardUrl } from "../student-dashboard/selection.ts";
import type { DashboardMode } from "../student-dashboard/types.ts";
import { createCatalogLearningSessionQuestions } from "./demo-provider.ts";
import type { StudentLearningSessionProvider } from "./provider.ts";
import type { StudentLearningSessionData } from "./types.ts";
import { activityTitleWithoutStudentIdentity } from "../activity-title.ts";

type AssignedActivityRow = {
  title: string;
  notion_ids: string[];
  question_ids: string[];
  group_id: string;
  session_id: string | null;
  progress_state: "not_started" | "in_progress" | "completed" | null;
  current_question_index: number | null;
  total_questions: number | null;
  completed_question_ids: string[] | null;
  operation_results: Array<{ id: string; status: "mastered" | "to_consolidate" | "to_work_on" }> | null;
  historical_knowledge_results: Array<{ id: string; status: "mastered" | "to_consolidate" | "to_work_on" }> | null;
  question_runtime: import("../student-progress/types.ts").StudentQuestionRuntimeProgress[] | null;
  started_at: Date | null;
  updated_at: Date | null;
  completed_at: Date | null;
  personal_assignment: boolean;
};

const notionTitles: Record<string, string> = { "acte-union": "Acte d’union", industrialisation: "Industrialisation" };

function resultEntries(value: AssignedActivityRow["operation_results"]) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as NonNullable<AssignedActivityRow["operation_results"]> : [];
  } catch { return []; }
}

export class DatabaseStudentLearningSessionProvider implements StudentLearningSessionProvider {
  async getForAnonymousStudent(
    anonymousStudentId: string,
    activityId: string,
    requestedNotionId?: string,
    requestedMode?: string,
  ): Promise<StudentLearningSessionData | null> {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(activityId) || activityId.length > 100) return null;
    const sql = getSocratoDatabase();
    const rows = await sql<AssignedActivityRow[]>`
      select a.title, a.notion_ids, a.question_ids, g.id as group_id, (aga.id like 'personal-%') as personal_assignment, p.session_id, p.progress_state,
        p.current_question_index, p.total_questions, p.completed_question_ids, p.operation_results,
        p.historical_knowledge_results, p.question_runtime, p.started_at, p.updated_at, p.completed_at
      from socrato.group_memberships gm
      join socrato.groups g on g.id = gm.group_id and g.archived_at is null
      join socrato.activity_group_assignments aga on aga.group_id = g.id
      join socrato.activities a on a.id = aga.activity_id and a.publication_status = ${"published"}
      left join lateral (
        select session_id, state as progress_state, current_question_index, total_questions,
          completed_question_ids, operation_results, historical_knowledge_results, question_runtime, started_at, updated_at, completed_at
        from socrato.student_progress
        where student_id = ${anonymousStudentId} and activity_id = a.id and group_id = g.id
        order by updated_at desc limit 1
      ) p on true
      where gm.student_id = ${anonymousStudentId} and gm.active = true and a.id = ${activityId}
        and (aga.id not like 'personal-%' or aga.id = 'personal-' || a.id || '-' || ${anonymousStudentId})
      order by a.published_at desc
      limit 1
    `;
    const activity = rows[0];
    if (!activity || !activity.question_ids.length) return null;
    const catalogSession = createCatalogLearningSessionQuestions(activity.question_ids);
    if (!catalogSession.questions.length) return null;
    const notionId = requestedNotionId && activity.notion_ids.includes(requestedNotionId) ? requestedNotionId : activity.notion_ids[0] ?? "acte-union";
    const mode: DashboardMode = requestedMode === "notion-review" ? "notion-review" : "teacher-assigned";
    const firstQuestion = catalogSession.questions[0];
    const firstOperation = firstQuestion?.intellectualOperations.find(({ id }) => id === firstQuestion.primaryOperationId);
    const teacherConsolidation = activity.personal_assignment && firstQuestion && firstOperation ? {
      consolidationStrategyLabel: firstOperation.label,
      consolidationContext: {
        parentActivityId: activityId,
        strategyKey: "teacher-guided",
        strategyLabel: firstOperation.label,
        targetOperationId: firstQuestion.primaryOperationId,
        source: "teacher_assigned" as const,
      },
    } : {};
    const progress = activity.session_id && activity.progress_state && activity.total_questions && activity.started_at && activity.updated_at ? {
      schemaVersion: 3 as const,
      studentId: anonymousStudentId,
      groupId: activity.group_id,
      activityId,
      sessionId: activity.session_id,
      notionId,
      state: activity.progress_state,
      currentQuestionIndex: activity.current_question_index ?? 0,
      totalQuestions: activity.total_questions,
      completedQuestionIds: activity.completed_question_ids ?? [],
      questionRuntime: Array.isArray(activity.question_runtime) ? activity.question_runtime : [],
      operationResults: resultEntries(activity.operation_results),
      historicalKnowledgeResults: resultEntries(activity.historical_knowledge_results),
      startedAt: activity.started_at.toISOString(),
      updatedAt: activity.updated_at.toISOString(),
      completedAt: activity.completed_at?.toISOString() ?? null,
    } : undefined;
    return {
      id: `session-${anonymousStudentId}-${activityId}`,
      activityId,
      activityTitle: activityTitleWithoutStudentIdentity(activity.title),
      origin: mode === "notion-review" ? "student_selected" : "teacher_assigned",
      notionId,
      notionTitle: notionTitles[notionId] ?? notionId,
      historicalPeriod: notionId === "acte-union" ? { startYear: 1840, endYear: 1896 } : { displayLabel: "Histoire du Québec et du Canada" },
      currentQuestionIndex: Math.min(activity.current_question_index ?? 0, catalogSession.questions.length - 1),
      progress,
      dashboardHref: getActivityDashboardUrl(activityId),
      source: "server",
      localDemoNotice: "",
      documentCatalog: catalogSession.documents,
      questions: catalogSession.questions,
      ...teacherConsolidation,
    };
  }
}
