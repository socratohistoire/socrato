const LOCAL_ACTIVITY_ID = "activity-revision-01";
const LOCAL_GROUP_ID = "group-demo-401";
const LOCAL_STUDENT_ID = "student-demo-a17";

export function isSafeTeacherStudentContextId(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
}

export function isAuthorizedLocalTeacherStudentContext(activityId: string, groupId: string, studentId: string) {
  return isSafeTeacherStudentContextId(activityId)
    && isSafeTeacherStudentContextId(groupId)
    && isSafeTeacherStudentContextId(studentId)
    && activityId === LOCAL_ACTIVITY_ID
    && groupId === LOCAL_GROUP_ID
    && studentId === LOCAL_STUDENT_ID;
}
