import { LOCAL_ACADEMIC_CONTEXT, LOCAL_STUDENT_GROUP_ID, LOCAL_TEACHER_ID, teacherOwnsAssignment, teacherOwnsGroup } from "../academic-context/index.ts";

export function isSafeTeacherContextId(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
}

export function isAuthorizedLocalTeacherGroupContext(activityId: string, groupId: string) {
  return isSafeTeacherContextId(activityId)
    && isSafeTeacherContextId(groupId)
    && groupId === LOCAL_STUDENT_GROUP_ID
    && teacherOwnsGroup(LOCAL_ACADEMIC_CONTEXT, LOCAL_TEACHER_ID, groupId)
    && (teacherOwnsAssignment(LOCAL_ACADEMIC_CONTEXT, LOCAL_TEACHER_ID, activityId) || /^activity-local-[0-9]+$/.test(activityId));
}
