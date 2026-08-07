import { getSocratoDatabase } from "./database";
import type { TeacherActor } from "../authentication/teacher-session";
import type { TeacherGroupDetailRecord } from "../teacher-group-detail/types";

export type StoredTeacherGroupSummary = { id: string; name: string; studentCount: number };
export type StoredTeacherStudentDetail = {
  id: string;
  displayLabel: string;
  groupId: string;
  groupName: string;
  assignedActivityTitle: string | null;
  activityState: "completed" | "in_progress" | "not_started";
  progressPercentage: number;
  strengths: string[];
  consolidationTargets: string[];
  teacher: TeacherActor;
  groups: StoredTeacherGroupSummary[];
};

function parseSummary(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    try { value = JSON.parse(value) as unknown; } catch { return null; }
  }
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function summaryStrings(value: unknown, key: string) {
  const summary = parseSummary(value);
  return summary && Array.isArray(summary[key]) ? summary[key].filter((item): item is string => typeof item === "string") : [];
}

export async function listStoredTeacherGroups(teacherId: string): Promise<StoredTeacherGroupSummary[]> {
  try {
    const sql = getSocratoDatabase();
    const rows = await sql<{ id: string; name: string; student_count: number }[]>`
      select g.id, g.display_name as name, count(gm.student_id)::int as student_count
      from socrato.groups g
      left join socrato.group_memberships gm on gm.group_id = g.id and gm.active = true
      where g.teacher_id = ${teacherId} and g.archived_at is null
      group by g.id, g.display_name, g.created_at
      order by g.created_at asc
    `;
    return rows.map((row) => ({ id: row.id, name: row.name, studentCount: row.student_count }));
  } catch { return []; }
}

export async function getStoredTeacherGroupDetail(teacher: TeacherActor, groupId: string): Promise<TeacherGroupDetailRecord | null> {
  try {
    const sql = getSocratoDatabase();
    const groups = await listStoredTeacherGroups(teacher.id);
    const group = groups.find((item) => item.id === groupId);
    if (!group) return null;
    const activities = await sql<{ id: string; title: string }[]>`
      select a.id, a.title
      from socrato.activity_group_assignments aga
      join socrato.activities a on a.id = aga.activity_id
      where aga.group_id = ${groupId} and a.teacher_id = ${teacher.id} and a.publication_status = 'published'
      order by a.published_at desc
      limit 1
    `;
    const activity = activities[0] ?? null;
    const students = await sql<{ id: string; display_alias: string; activity_state: "completed" | "in_progress" | "not_started" | null; current_question_index: number | null; total_questions: number | null; outcome_summary: unknown }[]>`
      select s.id, s.display_alias, progress.state as activity_state,
        progress.current_question_index, progress.total_questions, progress.outcome_summary
      from socrato.students s
      join socrato.group_memberships gm on gm.student_id = s.id and gm.active = true
      join socrato.groups g on g.id = gm.group_id
      left join lateral (
        select sp.state, sp.current_question_index, sp.total_questions, outcomes.summary as outcome_summary
        from socrato.student_progress sp
        left join socrato.student_outcomes outcomes on outcomes.session_id = sp.session_id
        where sp.student_id = s.id and sp.group_id = g.id
          and sp.activity_id = ${activity?.id ?? "no-activity"}
        order by sp.updated_at desc
        limit 1
      ) progress on true
      where g.id = ${groupId} and g.teacher_id = ${teacher.id} and s.archived_at is null
      order by s.display_alias asc
    `;
    const completedStudentCount = students.filter(({ activity_state }) => activity_state === "completed").length;
    const startedStudentCount = students.filter(({ activity_state }) => activity_state === "in_progress").length;
    const initials = teacher.displayName.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
    return {
      source: "server", activityId: activity?.id ?? "no-activity", activityTitle: activity?.title ?? "Aucune activité en cours", groupId, groupName: group.name,
      completedStudentCount, targetedStudentCount: students.length,
      socratoSummary: activity
        ? { mastery: completedStudentCount > 0 ? `${completedStudentCount} élève${completedStudentCount > 1 ? "s ont" : " a"} terminé l’activité.` : startedStudentCount > 0 ? `${startedStudentCount} élève${startedStudentCount > 1 ? "s ont" : " a"} commencé l’activité.` : "Aucun élève n’a encore commencé l’activité.", mainChallenge: "Les résultats apparaîtront au fur et à mesure de la participation." }
        : { mastery: "Aucun résultat disponible pour le moment.", mainChallenge: "Créez une première activité pour commencer le suivi de ce groupe." },
      teacher: { displayLabel: teacher.displayName, roleLabel: teacher.email ?? "Compte enseignant", initials }, groups,
      students: students.map((student) => ({
        id: student.id,
        displayLabel: student.display_alias,
        activityState: student.activity_state ?? "not_started",
        priority: "normal",
        mainDifficulty: student.activity_state === "completed" ? summaryStrings(student.outcome_summary, "consolidationTargets")[0] ?? "Aucun élément prioritaire à consolider" : student.activity_state === "in_progress" ? "Bilan en préparation" : "Aucun résultat disponible",
        progressPercentage: student.activity_state === "completed" ? 100 : student.total_questions ? Math.min(99, Math.round(((student.current_question_index ?? 0) / student.total_questions) * 100)) : 0,
        studentDetailHref: `/teacher/groups/${encodeURIComponent(groupId)}/students/${encodeURIComponent(student.id)}`,
      })),
    };
  } catch { return null; }
}

export async function getStoredTeacherStudentDetail(teacher: TeacherActor, groupId: string, studentId: string): Promise<StoredTeacherStudentDetail | null> {
  try {
    const sql = getSocratoDatabase();
    const rows = await sql<{ student_id: string; display_alias: string; group_id: string; group_name: string; activity_title: string | null; activity_state: "completed" | "in_progress" | "not_started" | null; current_question_index: number | null; total_questions: number | null; outcome_summary: unknown }[]>`
      select s.id as student_id, s.display_alias, g.id as group_id, g.display_name as group_name,
        activity.title as activity_title, activity.activity_state, activity.current_question_index,
        activity.total_questions, activity.outcome_summary
      from socrato.students s
      join socrato.group_memberships gm on gm.student_id = s.id and gm.active = true
      join socrato.groups g on g.id = gm.group_id and g.archived_at is null
      left join lateral (
        select a.title, sp.state as activity_state, sp.current_question_index, sp.total_questions,
          outcomes.summary as outcome_summary
        from socrato.activity_group_assignments aga
        join socrato.activities a on a.id = aga.activity_id
        left join socrato.student_progress sp on sp.activity_id = a.id and sp.student_id = s.id and sp.group_id = g.id
        left join socrato.student_outcomes outcomes on outcomes.session_id = sp.session_id
        where aga.group_id = g.id and a.teacher_id = ${teacher.id} and a.publication_status = 'published'
        order by a.published_at desc, sp.updated_at desc nulls last
        limit 1
      ) activity on true
      where s.id = ${studentId} and g.id = ${groupId} and g.teacher_id = ${teacher.id} and s.archived_at is null
      limit 1
    `;
    const student = rows[0];
    if (!student) return null;
    return {
      id: student.student_id,
      displayLabel: student.display_alias,
      groupId: student.group_id,
      groupName: student.group_name,
      assignedActivityTitle: student.activity_title,
      activityState: student.activity_state ?? "not_started",
      progressPercentage: student.activity_state === "completed" ? 100 : student.total_questions ? Math.min(99, Math.round(((student.current_question_index ?? 0) / student.total_questions) * 100)) : 0,
      strengths: summaryStrings(student.outcome_summary, "strengths"),
      consolidationTargets: summaryStrings(student.outcome_summary, "consolidationTargets"),
      teacher,
      groups: await listStoredTeacherGroups(teacher.id),
    };
  } catch { return null; }
}
