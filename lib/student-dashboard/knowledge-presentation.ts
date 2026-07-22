import { PROGRESS_STATUS_LABELS } from "./presentation.ts";
import type { HistoricalKnowledge } from "./types.ts";

export type KnowledgePresentation = HistoricalKnowledge & {
  statusLabel: string;
  reviewLabel: "Retravailler";
};

export function presentHistoricalKnowledge(
  knowledge: HistoricalKnowledge[],
): KnowledgePresentation[] {
  return knowledge.map((item) => ({
    ...item,
    statusLabel: PROGRESS_STATUS_LABELS[item.status],
    reviewLabel: "Retravailler",
  }));
}
