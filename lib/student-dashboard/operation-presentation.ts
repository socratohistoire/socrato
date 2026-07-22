import { PROGRESS_STATUS_LABELS } from "./presentation.ts";
import type { IntellectualOperation } from "./types.ts";

export type OperationPresentation = IntellectualOperation & {
  statusLabel: string;
  reviewLabel: "Retravailler";
};

export function presentIntellectualOperations(
  operations: IntellectualOperation[],
): OperationPresentation[] {
  return operations.map((operation) => ({
    ...operation,
    statusLabel: PROGRESS_STATUS_LABELS[operation.status],
    reviewLabel: "Retravailler",
  }));
}
