import type { LocalPublishedActivity } from "../local-published-activities/store.ts";
import type { TeacherActivityDraft } from "../teacher-activity-drafts/types.ts";

export const LOCAL_MIGRATION_BUNDLE_VERSION = 1 as const;

export type MigrationExclusionReason = "demonstration_data" | "already_on_server" | "requires_verified_student_identity";
export type MigrationExclusion = { kind: "activity" | "progress" | "outcome"; id: string; reason: MigrationExclusionReason };

export type LocalMigrationPreview = {
  schemaVersion: typeof LOCAL_MIGRATION_BUNDLE_VERSION;
  dryRun: true;
  createdAt: string;
  activities: LocalPublishedActivity[];
  activeDraft: TeacherActivityDraft | null;
  excluded: MigrationExclusion[];
  requiresGroupMapping: boolean;
  checksum: string;
};
