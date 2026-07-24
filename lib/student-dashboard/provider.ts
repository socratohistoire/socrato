import type { StudentDashboardData } from "./types.ts";

export interface StudentDashboardProvider {
  getForAnonymousStudent(
    anonymousStudentId: string,
    requestedActivityId?: string,
  ): Promise<StudentDashboardData>;
}
