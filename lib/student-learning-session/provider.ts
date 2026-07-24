import type { StudentLearningSessionData } from "./types.ts";

export interface StudentLearningSessionProvider {
  getForAnonymousStudent(
    anonymousStudentId: string,
    activityId: string,
    requestedNotionId?: string,
    requestedMode?: string,
  ): Promise<StudentLearningSessionData | null>;
}
