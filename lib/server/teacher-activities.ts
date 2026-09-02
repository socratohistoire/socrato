import type { TeacherActivitySummary, TeacherGroupBriefing } from "../teacher-dashboard/types.ts";
import { getSocratoDatabase } from "./database.ts";
import { assessStudentPriority } from "./student-priority.ts";

type ActivityRow = {
  id: string;
  title: string;
  work_type: "revision" | "enrichment" | "development";
  published_at: Date;
  updated_at: Date;
  publication_status: "published" | "suspended" | "archived";
  targeted_group_ids: string[];
  targeted_count: number;
  started_count: number;
  completed_count: number;
};

type GroupRow = {
  activity_id: string;
  group_id: string;
  group_name: string;
  targeted_count: number;
  started_count: number;
  completed_count: number;
};

type PriorityStudentRow = {
  activity_id: string;
  student_id: string;
  display_alias: string;
  group_id: string;
  group_name: string;
  operation_results: unknown;
  historical_knowledge_results: unknown;
  outcome_summary: unknown;
};

function firstConsolidationTarget(value: unknown) {
  if (typeof value === "string") {
    try { value = JSON.parse(value) as unknown; } catch { return undefined; }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const targets = (value as { consolidationTargets?: unknown }).consolidationTargets;
  return Array.isArray(targets) && typeof targets[0] === "string" ? targets[0] : undefined;
}

function portrait(row: GroupRow): TeacherGroupBriefing {
  const progressLabel = row.completed_count > 0
    ? `${row.completed_count} élève${row.completed_count > 1 ? "s ont" : " a"} terminé l’activité.`
    : row.started_count > 0
      ? `${row.started_count} élève${row.started_count > 1 ? "s ont" : " a"} commencé l’activité.`
      : "Aucun élève n’a encore commencé l’activité.";
  return {
    id: `portrait-${row.activity_id}-${row.group_id}`,
    activityId: row.activity_id,
    name: row.group_name,
    observation: progressLabel,
    suggestion: row.completed_count > 0 ? "Consultez les résultats pour préparer le suivi du groupe." : "Les résultats apparaîtront au fur et à mesure de la participation.",
    completedStudentCount: row.completed_count,
    targetedStudentCount: row.targeted_count,
    groupDetailHref: `/teacher/groups/${encodeURIComponent(row.group_id)}`,
  };
}

export async function listStoredTeacherActivities(teacherId: string): Promise<TeacherActivitySummary[]> {
  const sql = getSocratoDatabase();
  const [activities, groupRows, priorityRows] = await Promise.all([
    sql<ActivityRow[]>`
      select a.id, a.title, a.work_type, a.published_at, a.updated_at, a.publication_status,
        array_agg(distinct g.id) as targeted_group_ids,
        count(distinct gm.student_id)::int as targeted_count,
        count(distinct sp.student_id) filter (where sp.state in ('in_progress', 'completed'))::int as started_count,
        count(distinct sp.student_id) filter (where sp.state = 'completed')::int as completed_count
      from socrato.activities a
      join socrato.activity_group_assignments aga on aga.activity_id = a.id
      join socrato.groups g on g.id = aga.group_id and g.teacher_id = ${teacherId} and g.archived_at is null
      left join socrato.group_memberships gm on gm.group_id = g.id and gm.active = true
      left join socrato.student_progress sp on sp.activity_id = a.id and sp.group_id = g.id and sp.student_id = gm.student_id
      where a.teacher_id = ${teacherId}
      group by a.id, a.title, a.work_type, a.published_at, a.updated_at, a.publication_status
      order by a.published_at desc
    `,
    sql<GroupRow[]>`
      select a.id as activity_id, g.id as group_id, g.display_name as group_name,
        count(distinct gm.student_id)::int as targeted_count,
        count(distinct sp.student_id) filter (where sp.state in ('in_progress', 'completed'))::int as started_count,
        count(distinct sp.student_id) filter (where sp.state = 'completed')::int as completed_count
      from socrato.activities a
      join socrato.activity_group_assignments aga on aga.activity_id = a.id
      join socrato.groups g on g.id = aga.group_id and g.teacher_id = ${teacherId} and g.archived_at is null
      left join socrato.group_memberships gm on gm.group_id = g.id and gm.active = true
      left join socrato.student_progress sp on sp.activity_id = a.id and sp.group_id = g.id and sp.student_id = gm.student_id
      where a.teacher_id = ${teacherId}
      group by a.id, g.id, g.display_name
    `,
    sql<PriorityStudentRow[]>`
      select a.id as activity_id, s.id as student_id, s.display_alias, g.id as group_id, g.display_name as group_name,
        progress.operation_results, progress.historical_knowledge_results, outcomes.summary as outcome_summary
      from socrato.activities a
      join socrato.activity_group_assignments aga on aga.activity_id = a.id
      join socrato.groups g on g.id = aga.group_id and g.teacher_id = ${teacherId} and g.archived_at is null
      join socrato.group_memberships gm on gm.group_id = g.id and gm.active = true
      join socrato.students s on s.id = gm.student_id and s.archived_at is null
      join lateral (
        select sp.session_id, sp.operation_results, sp.historical_knowledge_results
        from socrato.student_progress sp
        where sp.activity_id = a.id and sp.group_id = g.id and sp.student_id = s.id and sp.state = ${"completed"}
        order by sp.updated_at desc limit 1
      ) progress on true
      left join socrato.student_outcomes outcomes on outcomes.session_id = progress.session_id
      where a.teacher_id = ${teacherId}
    `,
  ]);
  const portraitsByActivity = new Map<string, TeacherGroupBriefing[]>();
  for (const row of groupRows) portraitsByActivity.set(row.activity_id, [...(portraitsByActivity.get(row.activity_id) ?? []), portrait(row)]);
  const priorityByActivity = new Map<string, NonNullable<TeacherActivitySummary["highPriorityStudents"]>[number][]>();
  for (const row of priorityRows) {
    const assessment = assessStudentPriority(row.operation_results, row.historical_knowledge_results);
    if (assessment.level !== "high") continue;
    const student = {
      id: row.student_id,
      displayLabel: row.display_alias,
      groupId: row.group_id,
      groupLabel: row.group_name,
      priority: "high" as const,
      highPriorityReason: "failed_assessment" as const,
      reasonLabel: firstConsolidationTarget(row.outcome_summary) ?? assessment.reason,
      studentPortraitHref: `/teacher/groups/${encodeURIComponent(row.group_id)}/students/${encodeURIComponent(row.student_id)}`,
    };
    priorityByActivity.set(row.activity_id, [...(priorityByActivity.get(row.activity_id) ?? []), student]);
  }
  return activities.map((activity) => ({
    id: activity.id,
    summaryVersion: `server-${activity.updated_at.toISOString()}-${activity.started_count}-${activity.completed_count}`,
    activityType: activity.work_type,
    customTitle: activity.title,
    publishedAt: activity.published_at.toISOString(),
    targetedGroupIds: activity.targeted_group_ids,
    completedStudentCount: activity.completed_count,
    startedStudentCount: activity.started_count,
    targetedStudentCount: activity.targeted_count,
    resultAvailability: activity.completed_count > 0 ? "partial" : "awaiting_results",
    lifecycleStatus: activity.publication_status,
    groupPortraits: portraitsByActivity.get(activity.id) ?? [],
    highPriorityStudents: priorityByActivity.get(activity.id) ?? [],
  }));
}

export async function getStoredTeacherActivityForEditing(teacherId: string, activityId: string) {
  try {
    const sql = getSocratoDatabase();
    const rows = await sql<{ id: string; title: string; work_type: "revision" | "enrichment" | "development"; notion_ids: string[]; operation_id: string | null; question_ids: string[]; published_at: Date; targeted_group_ids: string[] }[]>`
      select a.id, a.title, a.work_type, a.notion_ids, a.operation_id, a.question_ids, a.published_at,
        array_agg(aga.group_id order by aga.group_id) as targeted_group_ids
      from socrato.activities a join socrato.activity_group_assignments aga on aga.activity_id = a.id
      where a.id = ${activityId} and a.teacher_id = ${teacherId}
      group by a.id, a.title, a.work_type, a.notion_ids, a.operation_id, a.question_ids, a.published_at
      limit 1
    `;
    return rows[0] ?? null;
  } catch { return null; }
}
