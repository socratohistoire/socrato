export type AuthorizedStudentActivityScope = {
  groupId: string;
  notionIds: string[];
  questionIds: string[];
};

export interface StudentActivityScopeRepository {
  findAssignedActivity(studentId: string, activityId: string): Promise<AuthorizedStudentActivityScope | null>;
}

const SAFE_ID = /^[a-z0-9]+(?:[-:][a-z0-9]+)*$/;

export async function authorizeStudentActivityScope(
  repository: StudentActivityScopeRepository,
  studentId: string,
  activityId: string,
): Promise<AuthorizedStudentActivityScope | null> {
  if (!SAFE_ID.test(studentId) || !SAFE_ID.test(activityId) || studentId.length > 100 || activityId.length > 100) return null;
  return repository.findAssignedActivity(studentId, activityId);
}
