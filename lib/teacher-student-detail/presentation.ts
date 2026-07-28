import type { TeacherStudentDetailRecord, TeacherStudentDetailViewModel, TeacherStudentResultStatus } from "./types.ts";

export const TEACHER_STUDENT_RESULT_LABELS: Record<TeacherStudentResultStatus, string> = {
  mastered: "Maîtrisée",
  consolidate: "À consolider",
  needs_work: "À travailler",
};

export function createTeacherStudentDetailViewModel(record: TeacherStudentDetailRecord): TeacherStudentDetailViewModel {
  return {
    ...record,
    groupReturnHref: `/teacher/activities/${encodeURIComponent(record.activityId)}/groups/${encodeURIComponent(record.groupId)}`,
    teacherReturnHref: `/teacher?activity=${encodeURIComponent(record.activityId)}`,
  };
}
