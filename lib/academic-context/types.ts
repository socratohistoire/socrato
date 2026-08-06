export const ACADEMIC_CONTEXT_VERSION = 1 as const;

export type AcademicTeacher = { id: string; displayLabel: string };
export type AcademicGroup = { id: string; teacherId: string; name: string };
export type AcademicStudent = { id: string; groupId: string; displayLabel: string };
export type AcademicActivityAssignment = { activityId: string; teacherId: string; groupIds: string[] };

export type AcademicContext = {
  schemaVersion: typeof ACADEMIC_CONTEXT_VERSION;
  teachers: AcademicTeacher[];
  groups: AcademicGroup[];
  students: AcademicStudent[];
  assignments: AcademicActivityAssignment[];
};
