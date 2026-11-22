import { createEmptyApprovedQuestion } from "./approved-question.ts";
import { createEmptyHistoricalRecord } from "./historical-record.ts";
import { createEmptyNotionReferenceCard } from "./reference-card.ts";
import { ACTE_UNION_HISTORICAL_RECORD } from "./records/acte-union.ts";
import { INDUSTRIALIZATION_HISTORICAL_RECORD } from "./records/economic-transformations.ts";
import type { ApprovedQuestion, HistoricalRecord, NotionReferenceCard } from "./types.ts";

export interface PedagogicalReferencePilot {
  knowledgeHeadingId: string;
  historicalRecord: HistoricalRecord;
  referenceCard: NotionReferenceCard;
  questionDraft: ApprovedQuestion;
}

const PILOT_RECORDS = {
  "acte-union": ACTE_UNION_HISTORICAL_RECORD,
  "premiere-phase-d-industrialisation": INDUSTRIALIZATION_HISTORICAL_RECORD,
  "revolution-tranquille": {
    ...createEmptyHistoricalRecord("revolution-tranquille"),
    status: "draft",
    title: "Dossier historique — Révolution tranquille",
    scope: "Structure pilote créée; contenu historique à documenter et à faire valider.",
  },
} satisfies Record<string, HistoricalRecord>;

const PILOT_HEADING_IDS = ["acte-union", "premiere-phase-d-industrialisation", "revolution-tranquille"] as const;

export const PEDAGOGICAL_REFERENCE_PILOTS: readonly PedagogicalReferencePilot[] = PILOT_HEADING_IDS.map(
  (knowledgeHeadingId) => ({
    knowledgeHeadingId,
    historicalRecord: PILOT_RECORDS[knowledgeHeadingId],
    referenceCard: {
      ...createEmptyNotionReferenceCard(knowledgeHeadingId),
      status: "draft",
      editorialNotes: "Structure pilote reliée au dossier historique; contenu concis à rédiger après documentation.",
    },
    questionDraft: createEmptyApprovedQuestion(knowledgeHeadingId, 1),
  }),
);
