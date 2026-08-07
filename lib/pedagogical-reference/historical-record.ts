import { SECONDARY_FOUR_KNOWLEDGE_HEADINGS } from "./secondary-four.ts";
import type { HistoricalRecord, SourcedStatement } from "./types.ts";

export type HistoricalRecordValidationErrors = Partial<Record<"identity" | "content" | "sources" | "approval", string>>;

function statements(record: HistoricalRecord): SourcedStatement[] {
  return [
    ...record.knowledgePrecisions,
    ...record.manual.sections.flatMap(({ paragraphs, tables = [] }) => [
      ...paragraphs,
      ...tables.flatMap(({ rows }) => rows),
    ]),
    ...record.narrative,
    ...record.chronologicalMarkers,
    ...record.actors,
    ...record.territories,
    ...record.relationships,
    ...record.vocabulary,
    ...record.misconceptions,
    ...record.expectedLearning,
  ];
}

export function createEmptyHistoricalRecord(knowledgeHeadingId: string): HistoricalRecord {
  if (!SECONDARY_FOUR_KNOWLEDGE_HEADINGS.some(({ id }) => id === knowledgeHeadingId)) {
    throw new Error(`Rubrique de connaissances inconnue : ${knowledgeHeadingId}`);
  }
  return {
    schemaVersion: 1,
    id: `historical-record:${knowledgeHeadingId}`,
    knowledgeHeadingId,
    status: "not-started",
    title: "",
    scope: "",
    knowledgePrecisions: [],
    manual: {
      title: "",
      purpose: "",
      audience: "internal-pedagogical-reference",
      sections: [],
    },
    narrative: [],
    chronologicalMarkers: [],
    actors: [],
    territories: [],
    relationships: [],
    vocabulary: [],
    misconceptions: [],
    expectedLearning: [],
    sourceCatalog: [],
    editorialNotes: "",
    version: null,
    approvedAt: null,
  };
}

export function validateHistoricalRecord(record: HistoricalRecord): HistoricalRecordValidationErrors {
  const errors: HistoricalRecordValidationErrors = {};
  const headingIds = new Set(SECONDARY_FOUR_KNOWLEDGE_HEADINGS.map(({ id }) => id));
  const verifiedSourceIds = new Set(record.sourceCatalog.filter(({ verificationStatus }) => verificationStatus === "verified").map(({ id }) => id));
  const contentStatementIds = new Set(statements(record).filter(({ id }) => !record.knowledgePrecisions.some((precision) => precision.id === id)).map(({ id }) => id));
  const reviewable = record.status === "ready-for-review" || record.status === "approved";
  if (!headingIds.has(record.knowledgeHeadingId) || record.id !== `historical-record:${record.knowledgeHeadingId}`) {
    errors.identity = "Le dossier doit pointer vers une rubrique officielle et utiliser son identifiant canonique.";
  }
  if (reviewable && (!record.title.trim()
    || !record.scope.trim()
    || !record.manual.title.trim()
    || !record.manual.purpose.trim()
    || record.knowledgePrecisions.length === 0
    || record.knowledgePrecisions.some(({ officialLabel, coverageStatus, linkedStatementIds }) => !officialLabel.trim() || coverageStatus !== "complete" || linkedStatementIds.length === 0 || linkedStatementIds.some((id) => !contentStatementIds.has(id)))
    || record.manual.sections.length === 0
    || record.manual.sections.some(({ title, purpose, paragraphs }) => !title.trim() || !purpose.trim() || paragraphs.length === 0)
    || record.narrative.length === 0
    || record.expectedLearning.some(({ origin, programBasis, knowledgeFocus, operationIds }) => origin !== "socrato-editorial-derivation" || !programBasis.trim() || knowledgeFocus.length === 0 || operationIds.length === 0))) {
    errors.content = "Un dossier prêt à valider exige un titre, une portée, un manuel interne complet et un récit historique.";
  }
  if (new Set(record.sourceCatalog.map(({ id }) => id)).size !== record.sourceCatalog.length
    || (reviewable && statements(record).some(({ sourceIds }) => sourceIds.length === 0 || sourceIds.some((id) => !verifiedSourceIds.has(id))))) {
    errors.sources = "Chaque information historique doit pointer vers une source vérifiée et unique.";
  }
  if (record.status === "approved" && (!record.version || !record.approvedAt)) {
    errors.approval = "Un dossier approuvé exige une version et une date d’approbation.";
  }
  return errors;
}
