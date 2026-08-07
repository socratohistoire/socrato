import { LOCAL_ACADEMIC_CONTEXT, LOCAL_STUDENT_ID, LOCAL_TEACHER_ID, teacherCanAccessStudent, teacherOwnsAssignment } from "../academic-context/index.ts";

export function isSafeTeacherStudentContextId(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
}

export function isAuthorizedLocalTeacherStudentContext(activityId: string, groupId: string, studentId: string) {
  return isSafeTeacherStudentContextId(activityId)
    && isSafeTeacherStudentContextId(groupId)
    && isSafeTeacherStudentContextId(studentId)
    && teacherCanAccessStudent(LOCAL_ACADEMIC_CONTEXT, LOCAL_TEACHER_ID, studentId)
    && LOCAL_ACADEMIC_CONTEXT.students.some((student) => student.id === studentId && student.groupId === groupId)
    && ((teacherOwnsAssignment(LOCAL_ACADEMIC_CONTEXT, LOCAL_TEACHER_ID, activityId) && studentId === "student-demo-a17")
      || (/^activity-local-[0-9]+$/.test(activityId) && studentId === LOCAL_STUDENT_ID));
}
