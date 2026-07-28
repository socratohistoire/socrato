import type { TeacherStudentDetailRecord } from "./types.ts";

export interface TeacherStudentDetailProvider {
  getStudentDetail(activityId: string, groupId: string, studentId: string): Promise<TeacherStudentDetailRecord | null>;
}
