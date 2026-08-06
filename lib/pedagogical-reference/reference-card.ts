import { SECONDARY_FOUR_KNOWLEDGE_HEADINGS } from "./secondary-four.ts";
import { INTELLECTUAL_OPERATION_IDS } from "./intellectual-operations.ts";
import type {
  NotionReferenceCard,
  ReferenceValidationChecklist,
  SourcedStatement,
} from "./types.ts";

export { INTELLECTUAL_OPERATION_IDS } from "./intellectual-operations.ts";

export const EMPTY_REFERENCE_VALIDATION_CHECKLIST: ReferenceValidationChecklist = {
  alignedWithOfficialProgram: false,
  historicallyAccurate: false,
  sufficientlySourced: false,
  neutralAndNuanced: false,
  appropriateForSecondaryFour: false,
  internallyConsistent: false,
  pedagogicallyRelevant: false,
  documentLinksReviewed: false,
};

export function createEmptyNotionReferenceCard(knowledgeHeadingId: string): NotionReferenceCard {
  if (!SECONDARY_FOUR_KNOWLEDGE_HEADINGS.some(({ id }) => id === knowledgeHeadingId)) {
    throw new Error(`Rubrique de connaissances inconnue : ${knowledgeHeadingId}`);
  }

  return {
    schemaVersion: 2,
    id: `reference-card:${knowledgeHeadingId}`,
    historicalRecordId: `historical-record:${knowledgeHeadingId}`,
    knowledgeHeadingId,
    status: "not-started",
    summary: null,
    context: null,
    historicalSignificance: null,
    chronologicalMarkers: [],
    actors: [],
    territories: [],
    relationships: [],
    vocabulary: [],
    commonConfusions: [],
    expectedDepth: "",
    compatibleOperationIds: [],
    sourceCatalog: [],
    associatedDocumentIds: [],
    editorialNotes: "",
    validation: {
      checklist: { ...EMPTY_REFERENCE_VALIDATION_CHECKLIST },
      reviewerComment: "",
      approvedVersion: null,
      approvedAt: null,
    },
  };
}

export type ReferenceCardValidationErrors = Partial<
  Record<"heading" | "core" | "sources" | "operations" | "relationships" | "review", string>
>;

function allStatements(card: NotionReferenceCard): SourcedStatement[] {
  return [
    card.summary,
    card.context,
    card.historicalSignificance,
    ...card.chronologicalMarkers,
    ...card.actors,
    ...card.territories,
    ...card.relationships,
    ...card.vocabulary,
    ...card.commonConfusions,
  ].filter((statement): statement is SourcedStatement => statement !== null);
}

export function validateNotionReferenceCard(card: NotionReferenceCard): ReferenceCardValidationErrors {
  const errors: ReferenceCardValidationErrors = {};
  const headingIds = new Set(SECONDARY_FOUR_KNOWLEDGE_HEADINGS.map(({ id }) => id));
  const sourceIds = new Set(card.sourceCatalog.filter(({ verificationStatus }) => verificationStatus === "verified").map(({ id }) => id));

  if (!headingIds.has(card.knowledgeHeadingId)) errors.heading = "La rubrique officielle est inconnue.";

  const needsCompleteReview = card.status === "ready-for-review" || card.status === "approved";
  if (needsCompleteReview && (!card.summary?.text.trim() || !card.context?.text.trim() || !card.historicalSignificance?.text.trim() || !card.expectedDepth.trim())) {
    errors.core = "La synthèse, le contexte, l’importance historique et la profondeur attendue sont obligatoires.";
  }

  if (new Set(card.sourceCatalog.map(({ id }) => id)).size !== card.sourceCatalog.length) {
    errors.sources = "Chaque source doit posséder un identifiant unique.";
  } else if (needsCompleteReview && sourceIds.size === 0) {
    errors.sources = "Au moins une source vérifiée est obligatoire.";
  } else if (needsCompleteReview && allStatements(card).some(({ sourceIds: statementSourceIds }) => statementSourceIds.length === 0 || statementSourceIds.some((id) => !sourceIds.has(id)))) {
    errors.sources = "Chaque affirmation doit être reliée à une source vérifiée.";
  }

  if (new Set(card.compatibleOperationIds).size !== card.compatibleOperationIds.length || card.compatibleOperationIds.some((id) => !INTELLECTUAL_OPERATION_IDS.includes(id))) {
    errors.operations = "Les opérations compatibles doivent être canoniques et uniques.";
  }

  if (card.relationships.some(({ relatedKnowledgeHeadingIds }) => relatedKnowledgeHeadingIds.some((id) => !headingIds.has(id)))) {
    errors.relationships = "Une relation pointe vers une rubrique officielle inconnue.";
  }

  if (card.status === "approved") {
    const checklistComplete = Object.values(card.validation.checklist).every(Boolean);
    if (!checklistComplete || !card.validation.approvedVersion || !card.validation.approvedAt) {
      errors.review = "Une fiche approuvée exige la liste de validation complète, une version et une date.";
    }
  }

  return errors;
}

export function isNotionReferenceCardReady(card: NotionReferenceCard) {
  return (card.status === "ready-for-review" || card.status === "approved")
    && Object.keys(validateNotionReferenceCard(card)).length === 0;
}
