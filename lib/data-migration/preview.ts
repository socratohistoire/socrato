import type { SocratoDataRepository } from "../data-repository/types.ts";
import type { LocalPublishedActivity } from "../local-published-activities/store.ts";
import type { TeacherActivityDraft } from "../teacher-activity-drafts/types.ts";
import { LOCAL_MIGRATION_BUNDLE_VERSION, type LocalMigrationPreview, type MigrationExclusion } from "./types.ts";

function isLocallyCreatedActivity(activity: LocalPublishedActivity) {
  return activity.id.startsWith("activity-local-");
}

function withoutLocalGroups(activity: LocalPublishedActivity): LocalPublishedActivity {
  return { ...activity, targetedGroupIds: [] };
}

function sanitizeDraft(draft: TeacherActivityDraft | null) {
  return draft ? { ...draft, configuration: { ...draft.configuration, selectedGroupIds: [] } } : null;
}

function checksum(value: unknown) {
  const serialized = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export async function createLocalMigrationPreview(repository: SocratoDataRepository, serverActivityIds: readonly string[] = [], now = new Date()): Promise<LocalMigrationPreview> {
  const [allActivities, activeDraft, progress, outcomes] = await Promise.all([
    repository.listPublishedActivities(),
    repository.readActiveDraftSummary(),
    repository.listStudentProgress(),
    repository.listStudentOutcomes(),
  ]);
  const serverIds = new Set(serverActivityIds);
  const excluded: MigrationExclusion[] = [];
  const activities = allActivities.flatMap((activity) => {
    if (!isLocallyCreatedActivity(activity)) {
      excluded.push({ kind: "activity", id: activity.id, reason: "demonstration_data" });
      return [];
    }
    if (serverIds.has(activity.id)) {
      excluded.push({ kind: "activity", id: activity.id, reason: "already_on_server" });
      return [];
    }
    return [withoutLocalGroups(activity)];
  });
  for (const item of Object.values(progress)) excluded.push({ kind: "progress", id: item.activityId, reason: "requires_verified_student_identity" });
  for (const [activityId] of Object.entries(outcomes)) excluded.push({ kind: "outcome", id: activityId, reason: "requires_verified_student_identity" });
  const sanitizedDraft = sanitizeDraft(activeDraft);
  const transferable = { activities, activeDraft: sanitizedDraft };
  return {
    schemaVersion: LOCAL_MIGRATION_BUNDLE_VERSION,
    dryRun: true,
    createdAt: now.toISOString(),
    activities,
    activeDraft: sanitizedDraft,
    excluded,
    requiresGroupMapping: activities.length > 0 || Boolean(sanitizedDraft),
    checksum: checksum(transferable),
  };
}
