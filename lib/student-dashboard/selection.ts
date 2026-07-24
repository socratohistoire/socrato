import type { DashboardMode, StudentActivity, StudentDashboardData } from "./types.ts";

export function resolveSelectedActivityId(
  data: Pick<StudentDashboardData, "defaultActivityId" | "activities">,
  requestedActivityId?: string,
): string {
  return requestedActivityId && data.activities.some(({ id }) => id === requestedActivityId)
    ? requestedActivityId
    : data.defaultActivityId;
}

export function getSelectedActivity(data: StudentDashboardData): StudentActivity {
  const activity = data.activities.find(({ id }) => id === data.selectedActivityId)
    ?? data.activities.find(({ id }) => id === data.defaultActivityId);
  if (!activity) throw new Error("Le tableau de bord ne contient aucune activité par défaut.");
  return activity;
}

export function getActivityDashboardUrl(activityId: string): string {
  return `/eleve/tableau-de-bord?activity=${encodeURIComponent(activityId)}#activite`;
}

export function getDashboardUrl(
  notionId: string,
  mode: DashboardMode,
  activityId?: string,
): string {
  if (activityId) return getActivityDashboardUrl(activityId);
  return `/eleve/tableau-de-bord?mode=${mode}&notion=${encodeURIComponent(notionId)}#activite`;
}

export function getLearningSessionUrl(activityId: string, notionId: string, mode: DashboardMode): string {
  const params = new URLSearchParams({ notion: notionId, mode });
  return `/eleve/activite/${encodeURIComponent(activityId)}?${params.toString()}`;
}
