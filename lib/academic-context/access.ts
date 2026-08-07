import type { AcademicActivityAssignment, AcademicContext } from "./types.ts";

export function teacherOwnsGroup(context: AcademicContext, teacherId: string, groupId: string) {
  return context.groups.some((group) => group.id === groupId && group.teacherId === teacherId);
}

export function teacherCanAccessStudent(context: AcademicContext, teacherId: string, studentId: string) {
  const student = context.students.find(({ id }) => id === studentId);
  return Boolean(student && teacherOwnsGroup(context, teacherId, student.groupId));
}

export function teacherOwnsAssignment(context: AcademicContext, teacherId: string, activityId: string) {
  return context.assignments.some((assignment) => assignment.activityId === activityId && assignment.teacherId === teacherId);
}

export function studentCanAccessAssignment(context: AcademicContext, studentId: string, assignment: AcademicActivityAssignment) {
  const student = context.students.find(({ id }) => id === studentId);
  return Boolean(student && context.teachers.some(({ id }) => id === assignment.teacherId) && teacherOwnsGroup(context, assignment.teacherId, student.groupId) && assignment.groupIds.includes(student.groupId));
}

export function studentCanAccessActivity(context: AcademicContext, studentId: string, activityId: string) {
  const assignment = context.assignments.find((item) => item.activityId === activityId);
  return Boolean(assignment && studentCanAccessAssignment(context, studentId, assignment));
}
