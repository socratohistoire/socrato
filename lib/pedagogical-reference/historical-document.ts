import { INTELLECTUAL_OPERATION_IDS } from "./intellectual-operations.ts";
import { SECONDARY_FOUR_KNOWLEDGE_HEADINGS } from "./secondary-four.ts";
import type { IntellectualOperationId, SecondaryFourPeriodId } from "./types.ts";

export type HistoricalDocumentKind = "map" | "law-or-official-text" | "statistics" | "political-diagram" | "image" | "newspaper" | "other";
export type HistoricalDocumentStatus = "research-needed" | "draft" | "ready-for-review" | "approved" | "rejected";
export type HistoricalDocumentPresentationKind = "excerpt" | "data-table" | "image" | "map" | "diagram";
export type HistoricalDocumentPresentationStatus = "draft" | "ready-for-review" | "approved" | "rejected";

export interface HistoricalDocumentCandidate {
  id: string;
  needId: string;
  title: string;
  historicalDate: string;
  creator: string;
  holdingInstitution: string;
  sourceUrl: string;
  sourceLocator: string;
  rightsAssessment: string;
  strengths: readonly string[];
  limitations: readonly string[];
  recommendation: "preferred" | "alternative" | "context-only";
}

export interface HistoricalDocumentAdaptationDraft {
  id: string;
  title: string;
  status: "draft";
  previewUrl: string;
  editableAssetUrl: string;
  originalAssetUrl: string;
  sourceUrl: string;
  cartographicReferenceUrl: string;
  cartographicReferenceStatement: string;
  attribution: string;
  rightsAssessment: string;
  modifications: readonly string[];
  validationNotes: readonly string[];
}

export interface HistoricalDocumentRecord {
  schemaVersion: 1;
  id: string;
  title: string;
  kind: HistoricalDocumentKind;
  status: HistoricalDocumentStatus;
  periodIds: readonly SecondaryFourPeriodId[];
  knowledgeHeadingIds: readonly string[];
  operationIds: readonly IntellectualOperationId[];
  historicalDate: string;
  creator: string;
  holdingInstitution: string;
  sourceUrl: string;
  sourceLocator: string;
  assetUrl: string;
  rightsStatement: string;
  transcription: string;
  accessibleDescription: string;
  historicalContext: string;
  observationGuide: readonly string[];
  interpretationCautions: readonly string[];
  pedagogicalUses: readonly string[];
  version: string | null;
  approvedAt: string | null;
}

export interface HistoricalDocumentStudentPresentation {
  schemaVersion: 1;
  id: string;
  documentId: string;
  title: string;
  kind: HistoricalDocumentPresentationKind;
  status: HistoricalDocumentPresentationStatus;
  contentSelectionStatus: "retained" | "not-retained";
  periodIds: readonly SecondaryFourPeriodId[];
  knowledgeHeadingIds: readonly string[];
  operationIds: readonly IntellectualOperationId[];
  typeLabel: string;
  dateLabel: string;
  authorLabel: string;
  originalDocumentLabel: string;
  studentText: string;
  sourceLabel: string;
  sourceUrls: readonly string[];
  sourceSegmentLocators: readonly string[];
  rightsLabel: string;
  editorialNote: string;
  accessibleDescription: string;
  historicalContext: string;
  pointOfView: string;
  observationGuide: readonly string[];
  interpretationCautions: readonly string[];
  pedagogicalUses: readonly string[];
  version: string | null;
  approvedAt: string | null;
}

export type HistoricalDocumentValidationErrors = Partial<Record<"identity" | "classification" | "provenance" | "accessibility" | "pedagogy" | "approval", string>>;
export type HistoricalDocumentPresentationValidationErrors = Partial<Record<"identity" | "classification" | "source" | "studentContent" | "pedagogy" | "approval", string>>;

export function createHistoricalDocumentResearchNeed(input: Pick<HistoricalDocumentRecord, "id" | "title" | "kind" | "periodIds" | "knowledgeHeadingIds" | "operationIds" | "pedagogicalUses">): HistoricalDocumentRecord {
  return {
    schemaVersion: 1,
    ...input,
    status: "research-needed",
    historicalDate: "",
    creator: "",
    holdingInstitution: "",
    sourceUrl: "",
    sourceLocator: "",
    assetUrl: "",
    rightsStatement: "",
    transcription: "",
    accessibleDescription: "",
    historicalContext: "",
    observationGuide: [],
    interpretationCautions: [],
    version: null,
    approvedAt: null,
  };
}

export function validateHistoricalDocument(document: HistoricalDocumentRecord): HistoricalDocumentValidationErrors {
  const errors: HistoricalDocumentValidationErrors = {};
  const headingIds = new Set(SECONDARY_FOUR_KNOWLEDGE_HEADINGS.map(({ id }) => id));
  const operationIds = new Set<string>(INTELLECTUAL_OPERATION_IDS);
  const reviewable = document.status === "ready-for-review" || document.status === "approved";

  if (!document.id.trim() || !document.title.trim()) errors.identity = "Le document exige un identifiant stable et un titre.";
  if (document.periodIds.length === 0 || document.knowledgeHeadingIds.length === 0 || document.knowledgeHeadingIds.some((id) => !headingIds.has(id)) || document.operationIds.some((id) => !operationIds.has(id))) {
    errors.classification = "Le document doit être relié à une période, une notion officielle et uniquement à des opérations reconnues.";
  }
  if (reviewable && (!document.holdingInstitution.trim() || !document.sourceUrl.trim() || !document.sourceLocator.trim() || !document.assetUrl.trim() || !document.rightsStatement.trim())) {
    errors.provenance = "Un document prêt à valider exige une provenance précise, le fichier consulté et des droits documentés.";
  }
  if (reviewable && !document.accessibleDescription.trim()) errors.accessibility = "Une description accessible est obligatoire avant la validation.";
  if (reviewable && (!document.historicalContext.trim() || document.observationGuide.length === 0 || document.pedagogicalUses.length === 0)) {
    errors.pedagogy = "Le contexte, les éléments à observer et les usages pédagogiques doivent être documentés.";
  }
  if (document.status === "approved" && (!document.version || !document.approvedAt || Object.keys({ ...errors }).length > 0)) {
    errors.approval = "Un document approuvé doit être complet, versionné et daté.";
  }
  return errors;
}

export function validateHistoricalDocumentPresentation(presentation: HistoricalDocumentStudentPresentation, parentDocument?: HistoricalDocumentRecord): HistoricalDocumentPresentationValidationErrors {
  const errors: HistoricalDocumentPresentationValidationErrors = {};
  const headingIds = new Set(SECONDARY_FOUR_KNOWLEDGE_HEADINGS.map(({ id }) => id));
  const operationIds = new Set<string>(INTELLECTUAL_OPERATION_IDS);
  const reviewable = presentation.status === "ready-for-review" || presentation.status === "approved";

  if (!presentation.id.trim() || !presentation.documentId.trim() || !presentation.title.trim()) errors.identity = "La présentation exige un identifiant, un document source et un titre.";
  if (presentation.periodIds.length === 0 || presentation.knowledgeHeadingIds.length === 0 || presentation.knowledgeHeadingIds.some((id) => !headingIds.has(id)) || presentation.operationIds.length === 0 || presentation.operationIds.some((id) => !operationIds.has(id))) {
    errors.classification = "La présentation doit être reliée à une période, une notion et au moins une opération reconnue.";
  }
  if (reviewable && (!presentation.sourceLabel.trim() || presentation.sourceUrls.length === 0 || presentation.sourceSegmentLocators.length === 0 || !presentation.rightsLabel.trim())) {
    errors.source = "Une présentation prête à valider exige la source, les segments utilisés et les droits de diffusion.";
  }
  if (reviewable && (!presentation.studentText.trim() || !presentation.editorialNote.trim() || !presentation.accessibleDescription.trim())) {
    errors.studentContent = "Le contenu exact montré à l’élève, son traitement éditorial et sa description accessible sont obligatoires.";
  }
  if (reviewable && (!presentation.historicalContext.trim() || !presentation.pointOfView.trim() || presentation.observationGuide.length === 0 || presentation.interpretationCautions.length === 0 || presentation.pedagogicalUses.length === 0)) {
    errors.pedagogy = "Le contexte, le point de vue, les observations, les précautions et les usages pédagogiques doivent être documentés.";
  }
  if (reviewable && parentDocument && parentDocument.id !== presentation.documentId) errors.source = "La présentation ne correspond pas au document historique fourni.";
  if (presentation.status === "approved" && (!parentDocument || parentDocument.status !== "approved" || !presentation.version || !presentation.approvedAt || Object.keys({ ...errors }).length > 0)) {
    errors.approval = "Une présentation ne peut être approuvée qu’après son document source; elle doit aussi être complète, versionnée et datée.";
  }
  return errors;
}
