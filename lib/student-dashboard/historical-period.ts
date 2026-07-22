import type { HistoricalPeriod } from "./types.ts";

export function getHistoricalPeriodLabel(
  period?: HistoricalPeriod,
): string | null {
  if (!period) return null;
  if (period.displayLabel) return period.displayLabel;
  if (period.startYear === undefined || period.endYear === undefined) return null;

  return `${period.startYear}–${period.endYear}`;
}
