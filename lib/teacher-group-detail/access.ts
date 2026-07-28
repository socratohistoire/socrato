const LOCAL_TEACHER_ACTIVITY_IDS = new Set(["activity-revision-01"]);
const LOCAL_TEACHER_GROUP_IDS = new Set(["group-demo-401"]);

export function isSafeTeacherContextId(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
}

export function isAuthorizedLocalTeacherGroupContext(activityId: string, groupId: string) {
  return isSafeTeacherContextId(activityId)
    && isSafeTeacherContextId(groupId)
    && LOCAL_TEACHER_ACTIVITY_IDS.has(activityId)
    && LOCAL_TEACHER_GROUP_IDS.has(groupId);
}
