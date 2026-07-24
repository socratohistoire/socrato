import type { StudentSessionRepository } from "../student-access/session.ts";
import type { StudentLearningSessionProvider } from "./provider.ts";
import type { StudentLearningSessionData } from "./types.ts";

export async function loadAuthorizedStudentLearningSession(
  token: string | undefined,
  sessions: StudentSessionRepository,
  provider: StudentLearningSessionProvider,
  activityId: string,
  requestedNotionId?: string,
  requestedMode?: string,
): Promise<StudentLearningSessionData | null> {
  if (!token) return null;
  const session = await sessions.findActiveByToken(token);
  if (!session) return null;

  return provider.getForAnonymousStudent(
    session.anonymousStudentId,
    activityId,
    requestedNotionId,
    requestedMode,
  );
}
