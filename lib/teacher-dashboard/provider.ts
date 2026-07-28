import type { TeacherDashboardData } from "./types.ts";

export interface TeacherDashboardProvider {
  getDashboard(teacherAccountId: string): Promise<TeacherDashboardData>;
}
