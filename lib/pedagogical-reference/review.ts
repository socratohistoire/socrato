import type { HistoricalRecord } from "./types.ts";

export type ClaimReviewDecision = "pending" | "accepted" | "changes-requested";

export type HistoricalRecordReviewCategory = "program-coverage" | "manual" | "claims" | "chronology" | "actors" | "territories" | "relationships" | "vocabulary" | "misconceptions" | "learning" | "sources";

export interface HistoricalRecordReviewItem {
  id: string;
  category: HistoricalRecordReviewCategory;
}

export interface HistoricalRecordCorrectionRequest {
  itemId: string;
  comment: string;
  status: "open" | "resolved";
  requestedAt: string;
  resolvedAt: string | null;
}

export interface HistoricalRecordReviewDraft {
  decisions: Record<string, ClaimReviewDecision>;
  corrections: Record<string, HistoricalRecordCorrectionRequest>;
  reviewerName: string;
  reviewerComment: string;
  version: string;
  status: "draft" | "changes-requested" | "approved";
  approvedAt: string | null;
}

export function getHistoricalRecordReviewItems(record: HistoricalRecord): HistoricalRecordReviewItem[] {
  return [
    ...record.knowledgePrecisions.map(({ id }) => ({ id, category: "program-coverage" as const })),
    ...record.manual.sections.flatMap(({ paragraphs, tables = [] }) => [
      ...paragraphs.map(({ id }) => ({ id, category: "manual" as const })),
      ...tables.flatMap(({ rows }) => rows.map(({ id }) => ({ id, category: "manual" as const }))),
    ]),
    ...record.narrative.map(({ id }) => ({ id, category: "claims" as const })),
    ...record.chronologicalMarkers.map(({ id }) => ({ id, category: "chronology" as const })),
    ...record.actors.map(({ id }) => ({ id, category: "actors" as const })),
    ...record.territories.map(({ id }) => ({ id, category: "territories" as const })),
    ...record.relationships.map(({ id }) => ({ id, category: "relationships" as const })),
    ...record.vocabulary.map(({ id }) => ({ id, category: "vocabulary" as const })),
    ...record.misconceptions.map(({ id }) => ({ id, category: "misconceptions" as const })),
    ...record.expectedLearning.map(({ id }) => ({ id, category: "learning" as const })),
    ...record.sourceCatalog.map(({ id }) => ({ id: `source:${id}`, category: "sources" as const })),
  ];
}

export function createHistoricalRecordReviewDraft(record: HistoricalRecord): HistoricalRecordReviewDraft {
  return {
    decisions: Object.fromEntries(getHistoricalRecordReviewItems(record).map(({ id }) => [id, "pending"])),
    corrections: {},
    reviewerName: "",
    reviewerComment: "",
    version: "1.0",
    status: "draft",
    approvedAt: null,
  };
}

export function acceptHistoricalRecordReviewItems(review: HistoricalRecordReviewDraft, itemIds: readonly string[]): HistoricalRecordReviewDraft {
  return {
    ...review,
    status: "draft",
    approvedAt: null,
    decisions: {
      ...review.decisions,
      ...Object.fromEntries(itemIds.map((id) => [id, review.decisions[id] === "changes-requested" || review.corrections[id]?.status === "open" ? "changes-requested" : "accepted"])),
    },
  };
}

export function canApproveHistoricalRecord(record: HistoricalRecord, review: HistoricalRecordReviewDraft) {
  const currentItemIds = new Set(getHistoricalRecordReviewItems(record).map(({ id }) => id));
  return [...currentItemIds].every((id) => review.decisions[id] === "accepted")
    && Object.values(review.corrections).every(({ itemId, status }) => !currentItemIds.has(itemId) || status === "resolved")
    && review.reviewerName.trim().length > 0
    && review.version.trim().length > 0;
}

export function countHistoricalRecordReview(record: HistoricalRecord, review: HistoricalRecordReviewDraft) {
  const items = getHistoricalRecordReviewItems(record);
  const accepted = items.filter(({ id }) => review.decisions[id] === "accepted" && review.corrections[id]?.status !== "open").length;
  const changesRequested = items.filter(({ id }) => review.decisions[id] === "changes-requested" || review.corrections[id]?.status === "open").length;
  return { accepted, changesRequested, pending: items.length - accepted - changesRequested, total: items.length };
}
