import type { StudentSessionRepository } from "../student-access/session.ts";
import type { StudentDashboardProvider } from "./provider.ts";
import type { StudentDashboardData } from "./types.ts";

export async function loadAuthorizedStudentDashboard(
  token: string | undefined,
  sessions: StudentSessionRepository,
  provider: StudentDashboardProvider,
  requestedActivityId?: string,
): Promise<StudentDashboardData | null> {
  if (!token) {
    return null;
  }

  const session = await sessions.findActiveByToken(token);
  if (!session) {
    return null;
  }

  return provider.getForAnonymousStudent(
    session.anonymousStudentId,
    requestedActivityId,
  );
}
