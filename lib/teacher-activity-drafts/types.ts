import type { ActivityConfiguration } from "../teacher-activity-creator/types.ts";

export const TEACHER_ACTIVITY_DRAFT_VERSION = 1 as const;
export const ACTIVE_ACTIVITY_DRAFT_ID = "new-activity";

export type TeacherActivityDraft = {
  schemaVersion: typeof TEACHER_ACTIVITY_DRAFT_VERSION;
  draftId: string;
  configuration: ActivityConfiguration;
  questionOverrides: Record<number, string>;
  previewQuestionIndex: number;
  updatedAt: string;
};
