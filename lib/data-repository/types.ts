import type { LocalActivityPublicationStatus, LocalPublishedActivity } from "../local-published-activities/store.ts";
import type { PedagogicalSummary } from "../pedagogical-session-engine/types.ts";
import type { StudentProgressContract } from "../student-progress/types.ts";
import type { StudentDashboardData } from "../student-dashboard/types.ts";
import type { ActivityCreatorCatalog } from "../teacher-activity-creator/types.ts";
import type { TeacherActivityDraft } from "../teacher-activity-drafts/types.ts";

export interface SocratoDataRepository {
  loadStudentDashboard(data: StudentDashboardData, selectedActivityId?: string | null): Promise<StudentDashboardData>;
  listPublishedActivities(): Promise<LocalPublishedActivity[]>;
  savePublishedActivity(activity: LocalPublishedActivity): Promise<void>;
  setPublishedActivityStatus(activityId: string, status: LocalActivityPublicationStatus): Promise<LocalPublishedActivity[]>;
  readActiveDraft(catalog: ActivityCreatorCatalog): Promise<TeacherActivityDraft | null>;
  readActiveDraftSummary(): Promise<TeacherActivityDraft | null>;
  saveDraft(draft: TeacherActivityDraft): Promise<void>;
  clearActiveDraft(): Promise<void>;
  listStudentProgress(): Promise<Record<string, StudentProgressContract>>;
  saveStudentProgress(progress: StudentProgressContract): Promise<StudentProgressContract>;
  clearStudentProgress(activityId: string): Promise<void>;
  listStudentOutcomes(): Promise<Record<string, PedagogicalSummary>>;
  saveStudentOutcome(summary: PedagogicalSummary): Promise<void>;
  clearStudentOutcome(activityId: string): Promise<void>;
}
