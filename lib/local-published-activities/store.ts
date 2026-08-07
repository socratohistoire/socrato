import { ACTIVITY_CONTRACT_VERSION, normalizePublishedActivityContract, type ActivityPublicationStatus, type PublishedActivityContract } from "../activity-contract/index.ts";

export const LOCAL_PUBLISHED_ACTIVITIES_KEY = "socrato-local-published-activities-v1";
export type LocalActivityPublicationStatus = ActivityPublicationStatus;
export type LocalPublishedActivity = PublishedActivityContract;

type LocalStorageAdapter = Pick<Storage, "getItem" | "setItem">;

export function readLocalPublishedActivities(storage: Pick<Storage, "getItem">): LocalPublishedActivity[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(LOCAL_PUBLISHED_ACTIVITIES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.flatMap((activity) => {
      const normalized = normalizePublishedActivityContract(activity);
      return normalized ? [normalized] : [];
    }) : [];
  } catch {
    return [];
  }
}

export function saveLocalPublishedActivity(storage: LocalStorageAdapter, activity: LocalPublishedActivity) {
  const existing = readLocalPublishedActivities(storage).filter(({ id }) => id !== activity.id);
  storage.setItem(LOCAL_PUBLISHED_ACTIVITIES_KEY, JSON.stringify([activity, ...existing].slice(0, 50)));
  return activity;
}

export function setLocalPublishedActivityStatus(storage: LocalStorageAdapter, activityId: string, publicationStatus: LocalActivityPublicationStatus, now = new Date()) {
  const activities = readLocalPublishedActivities(storage).map((activity) => activity.id === activityId ? { ...activity, publicationStatus, updatedAt: now.toISOString() } : activity);
  storage.setItem(LOCAL_PUBLISHED_ACTIVITIES_KEY, JSON.stringify(activities));
  return activities;
}

export function createLocalPublishedActivity(input: Omit<LocalPublishedActivity, "schemaVersion" | "id" | "publishedAt" | "updatedAt" | "publicationStatus">, now = new Date()): LocalPublishedActivity {
  const timestamp = now.getTime();
  const timestampIso = now.toISOString();
  return {
    ...input,
    schemaVersion: ACTIVITY_CONTRACT_VERSION,
    publicationStatus: "published",
    id: `activity-local-${timestamp}`,
    title: input.title.trim() || "Activité sans titre",
    publishedAt: timestampIso,
    updatedAt: timestampIso,
  };
}
