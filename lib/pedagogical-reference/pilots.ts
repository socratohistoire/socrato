import { createEmptyApprovedQuestion } from "./approved-question.ts";
import { createEmptyHistoricalRecord } from "./historical-record.ts";
import { createEmptyNotionReferenceCard } from "./reference-card.ts";
import { ACTE_UNION_HISTORICAL_RECORD } from "./records/acte-union.ts";
import type { ApprovedQuestion, HistoricalRecord, NotionReferenceCard } from "./types.ts";

export interface PedagogicalReferencePilot {
  knowledgeHeadingId: string;
  historicalRecord: HistoricalRecord;
  referenceCard: NotionReferenceCard;
  questionDraft: ApprovedQuestion;
}

const PILOT_HEADING_IDS = ["acte-union", "premiere-phase-d-industrialisation", "revolution-tranquille"] as const;

export const PEDAGOGICAL_REFERENCE_PILOTS: readonly PedagogicalReferencePilot[] = PILOT_HEADING_IDS.map(
  (knowledgeHeadingId) => ({
    knowledgeHeadingId,
    historicalRecord: knowledgeHeadingId === "acte-union" ? ACTE_UNION_HISTORICAL_RECORD : {
      ...createEmptyHistoricalRecord(knowledgeHeadingId),
      status: "draft",
      title: knowledgeHeadingId === "premiere-phase-d-industrialisation" ? "Dossier historique — Première phase d’industrialisation"
          : "Dossier historique — Révolution tranquille",
      scope: "Structure pilote créée; contenu historique à documenter et à faire valider.",
    },
    referenceCard: {
      ...createEmptyNotionReferenceCard(knowledgeHeadingId),
      status: "draft",
      editorialNotes: "Structure pilote reliée au dossier historique; contenu concis à rédiger après documentation.",
    },
    questionDraft: createEmptyApprovedQuestion(knowledgeHeadingId, 1),
  }),
);
