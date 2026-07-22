import type { StudentDashboardData } from "./types.ts";

export interface StudentDashboardProvider {
  getForAnonymousStudent(
    anonymousStudentId: string,
    requestedNotionId?: string,
    requestedMode?: string,
  ): Promise<StudentDashboardData>;
}
