import type { TeacherActivitySummary, TeacherGroupBriefing } from "../teacher-dashboard/types.ts";
import { getSocratoDatabase } from "./database.ts";

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
  const [activities, groupRows] = await Promise.all([
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
  ]);
  const portraitsByActivity = new Map<string, TeacherGroupBriefing[]>();
  for (const row of groupRows) portraitsByActivity.set(row.activity_id, [...(portraitsByActivity.get(row.activity_id) ?? []), portrait(row)]);
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
    highPriorityStudents: [],
  }));
}
