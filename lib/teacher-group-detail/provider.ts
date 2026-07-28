import type { TeacherGroupDetailRecord } from "./types.ts";

export interface TeacherGroupDetailProvider {
  getGroupDetail(activityId: string, groupId: string): Promise<TeacherGroupDetailRecord | null>;
}
