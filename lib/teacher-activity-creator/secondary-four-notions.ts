import { SECONDARY_FOUR_KNOWLEDGE_HEADINGS, SECONDARY_FOUR_PERIODS } from "../pedagogical-reference/index.ts";
import type { ActivityCreatorNotion } from "./types.ts";

export const SECONDARY_FOUR_NOTIONS: ActivityCreatorNotion[] = SECONDARY_FOUR_KNOWLEDGE_HEADINGS.map(
  (heading) => {
    const period = SECONDARY_FOUR_PERIODS.find(({ id }) => id === heading.periodId);
    if (!period) throw new Error(`Période historique manquante pour la notion ${heading.officialLabel}.`);

    return {
      id: heading.id,
      title: heading.officialLabel,
      periodId: period.id,
      periodLabel: `${period.officialPeriodLabel} · ${period.officialSocialReality}`,
      hasApprovedDocuments: heading.id === "acte-union",
    };
  },
);
