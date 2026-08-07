import { ACTIVITY_CONTRACT_VERSION, type ActivityPublicationStatus, type PublishedActivityContract } from "./types.ts";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.length > 0);
}

function publicationStatus(value: unknown): ActivityPublicationStatus {
  return value === "suspended" || value === "archived" ? value : "published";
}

export function normalizePublishedActivityContract(value: unknown): PublishedActivityContract | null {
  if (!value || typeof value !== "object") return null;
  const activity = value as Partial<PublishedActivityContract>;
  if (typeof activity.id !== "string" || !/^activity-[a-z0-9-]+$/.test(activity.id)) return null;
  if (typeof activity.title !== "string") return null;
  if (activity.workType !== "revision" && activity.workType !== "enrichment" && activity.workType !== "development") return null;
  if (typeof activity.publishedAt !== "string" || Number.isNaN(Date.parse(activity.publishedAt))) return null;
  if (!isStringArray(activity.targetedGroupIds) || !isStringArray(activity.notionIds) || !isStringArray(activity.questionIds)) return null;
  if (activity.operationId !== null && typeof activity.operationId !== "string") return null;
  return {
    schemaVersion: ACTIVITY_CONTRACT_VERSION,
    id: activity.id,
    title: activity.title,
    workType: activity.workType,
    publishedAt: activity.publishedAt,
    updatedAt: typeof activity.updatedAt === "string" && !Number.isNaN(Date.parse(activity.updatedAt)) ? activity.updatedAt : activity.publishedAt,
    targetedGroupIds: [...activity.targetedGroupIds],
    notionIds: [...activity.notionIds],
    operationId: activity.operationId,
    questionIds: [...activity.questionIds],
    publicationStatus: publicationStatus(activity.publicationStatus),
  };
}
