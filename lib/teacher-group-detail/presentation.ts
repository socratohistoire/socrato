import type { TeacherGroupActivityState, TeacherGroupDetailRecord, TeacherGroupDetailViewModel, TeacherGroupPriorityFilter, TeacherGroupStateFilter, TeacherGroupStudent } from "./types.ts";

export const TEACHER_GROUP_STATE_LABELS: Record<TeacherGroupActivityState, string> = {
  completed: "Terminée",
  in_progress: "En cours",
  not_started: "Non commencée",
};

export function filterTeacherGroupStudents(students: readonly TeacherGroupStudent[], priority: TeacherGroupPriorityFilter, state: TeacherGroupStateFilter) {
  return students.filter((student) => (priority === "all" || student.priority === priority) && (state === "all" || student.activityState === state));
}

export function createTeacherGroupDetailViewModel(record: TeacherGroupDetailRecord): TeacherGroupDetailViewModel {
  const participationPercentage = record.targetedStudentCount === 0
    ? 0
    : Math.min(100, Math.max(0, Math.round((record.completedStudentCount / record.targetedStudentCount) * 100)));
  return {
    ...record,
    participationPercentage,
    socratoSummaryText: `${record.socratoSummary.mastery} ${record.socratoSummary.mainChallenge}`,
    returnHref: `/teacher?activity=${encodeURIComponent(record.activityId)}`,
  };
}
