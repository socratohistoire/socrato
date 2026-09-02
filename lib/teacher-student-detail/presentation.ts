import type { TeacherStudentDetailRecord, TeacherStudentDetailViewModel, TeacherStudentResultStatus } from "./types.ts";
import { PROGRESS_STATUS_LABELS } from "../student-dashboard/presentation.ts";

export const TEACHER_STUDENT_RESULT_LABELS: Record<TeacherStudentResultStatus, string> = {
  mastered: PROGRESS_STATUS_LABELS.mastered,
  consolidate: PROGRESS_STATUS_LABELS.consolidate,
  needs_work: PROGRESS_STATUS_LABELS.needs_work,
};

export function createTeacherStudentDetailViewModel(record: TeacherStudentDetailRecord): TeacherStudentDetailViewModel {
  return {
    ...record,
    groupReturnHref: `/teacher/activities/${encodeURIComponent(record.activityId)}/groups/${encodeURIComponent(record.groupId)}`,
    teacherReturnHref: `/teacher?activity=${encodeURIComponent(record.activityId)}`,
  };
}
