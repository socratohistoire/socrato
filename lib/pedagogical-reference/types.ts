export type SecondaryFourPeriodId = "1840-1896" | "1896-1945" | "1945-1980" | "1980-present";

export interface OfficialProgramSource {
  title: string;
  publisher: "Gouvernement du Québec";
  url: string;
  overviewPage: number;
  synthesisPages: readonly number[];
}

export interface SecondaryFourKnowledgeHeading {
  id: string;
  officialLabel: string;
  officialOrder: number;
  orderWithinPeriod: number;
  periodId: SecondaryFourPeriodId;
  sourcePages: readonly number[];
  inventoryStatus: "verified-official";
}

export interface SecondaryFourPeriod {
  id: SecondaryFourPeriodId;
  officialOrder: number;
  startYear: number;
  endYear: number | null;
  officialPeriodLabel: string;
  officialSocialReality: string;
  particularConcepts: readonly string[];
  commonConcepts: readonly ["Culture", "Économie", "Pouvoir", "Société", "Territoire"];
  sourcePages: readonly number[];
  knowledgeHeadings: readonly SecondaryFourKnowledgeHeading[];
}

export type ReferenceCardStatus =
  | "not-started"
  | "draft"
  | "ready-for-review"
  | "changes-requested"
  | "approved"
  | "needs-review";

export type IntellectualOperationId =
  | "time_and_space"
  | "establish_facts"
  | "differences_and_similarities"
  | "causes_and_consequences"
  | "changes_and_continuities"
  | "relationships_between_facts"
  | "causal_connections";

export type ReferenceSourceKind =
  | "official-program"
  | "government"
  | "academic"
  | "museum-or-archive"
  | "reference-work"
  | "other";

export interface ReferenceSource {
  id: string;
  kind: ReferenceSourceKind;
  title: string;
  creator?: string;
  publisher: string;
  publicationYear?: number;
  url?: string;
  locator: string;
  rightsNote?: string;
  verificationStatus: "to-verify" | "verified" | "rejected";
}

export interface SourcedStatement {
  id: string;
  text: string;
  sourceIds: readonly string[];
}

export interface ChronologicalMarker extends SourcedStatement {
  dateLabel: string;
  sortYear?: number;
}

export interface HistoricalActor extends SourcedStatement {
  actorType: "person" | "group" | "institution";
  name: string;
}

export interface HistoricalRelationship extends SourcedStatement {
  relationshipType: "cause" | "consequence" | "change" | "continuity" | "connection";
  relatedKnowledgeHeadingIds: readonly string[];
}

export interface HistoricalClaim extends SourcedStatement {
  claimKind: "fact" | "interpretation" | "nuance";
}

export interface SourcedVocabularyEntry extends SourcedStatement {
  term: string;
}

export interface SourcedMisconception extends SourcedStatement {
  misconception: string;
}

export interface ExpectedLearningObjective extends SourcedStatement {
  origin: "socrato-editorial-derivation";
  programBasis: string;
  knowledgeFocus: readonly string[];
  operationIds: readonly IntellectualOperationId[];
}

export interface HistoricalManualSection {
  id: string;
  title: string;
  purpose: string;
  paragraphs: readonly HistoricalClaim[];
  tables?: readonly HistoricalManualTable[];
}

export interface HistoricalManualTableRow extends SourcedStatement {
  cells: readonly string[];
}

export interface HistoricalManualTable {
  id: string;
  title: string;
  introduction: string;
  columns: readonly string[];
  rows: readonly HistoricalManualTableRow[];
}

export interface HistoricalReferenceManual {
  title: string;
  purpose: string;
  audience: "internal-pedagogical-reference";
  editorialMethod?: string;
  scopeBoundary?: string;
  sections: readonly HistoricalManualSection[];
}

export type KnowledgePrecisionCoverageStatus = "complete" | "partial" | "missing";

export interface OfficialKnowledgePrecisionCoverage extends SourcedStatement {
  officialOrder: number;
  officialLabel: string;
  coverageStatus: KnowledgePrecisionCoverageStatus;
  linkedStatementIds: readonly string[];
}

export interface ReferenceValidationChecklist {
  alignedWithOfficialProgram: boolean;
  historicallyAccurate: boolean;
  sufficientlySourced: boolean;
  neutralAndNuanced: boolean;
  appropriateForSecondaryFour: boolean;
  internallyConsistent: boolean;
  pedagogicallyRelevant: boolean;
  documentLinksReviewed: boolean;
}

export interface NotionReferenceCard {
  schemaVersion: 1 | 2;
  id?: string;
  historicalRecordId?: string;
  knowledgeHeadingId: string;
  status: ReferenceCardStatus;
  summary: SourcedStatement | null;
  context: SourcedStatement | null;
  historicalSignificance: SourcedStatement | null;
  chronologicalMarkers: readonly ChronologicalMarker[];
  actors: readonly HistoricalActor[];
  territories: readonly SourcedStatement[];
  relationships: readonly HistoricalRelationship[];
  vocabulary: readonly SourcedStatement[];
  commonConfusions: readonly SourcedStatement[];
  expectedDepth: string;
  compatibleOperationIds: readonly IntellectualOperationId[];
  sourceCatalog: readonly ReferenceSource[];
  associatedDocumentIds: readonly string[];
  editorialNotes: string;
  validation: {
    checklist: ReferenceValidationChecklist;
    reviewerComment: string;
    approvedVersion: string | null;
    approvedAt: string | null;
  };
}

export type EditorialStatus = ReferenceCardStatus;

export interface HistoricalRecord {
  schemaVersion: 1;
  id: string;
  knowledgeHeadingId: string;
  status: EditorialStatus;
  title: string;
  scope: string;
  knowledgePrecisions: readonly OfficialKnowledgePrecisionCoverage[];
  manual: HistoricalReferenceManual;
  narrative: readonly HistoricalClaim[];
  chronologicalMarkers: readonly ChronologicalMarker[];
  actors: readonly HistoricalActor[];
  territories: readonly SourcedStatement[];
  relationships: readonly HistoricalRelationship[];
  vocabulary: readonly SourcedVocabularyEntry[];
  misconceptions: readonly SourcedMisconception[];
  expectedLearning: readonly ExpectedLearningObjective[];
  sourceCatalog: readonly ReferenceSource[];
  editorialNotes: string;
  version: string | null;
  approvedAt: string | null;
}

export type ApprovedQuestionFormat =
  | "multiple-choice"
  | "short-answer"
  | "document-interpretation"
  | "interactive-timeline"
  | "interactive-association"
  | "development-150";
export type ApprovedQuestionScope = "notional" | "transversal";

export interface ApprovedQuestion {
  schemaVersion: 1;
  id: string;
  scope: ApprovedQuestionScope;
  knowledgeHeadingId: string;
  relatedKnowledgeHeadingIds: readonly string[];
  referenceCardId: string;
  historicalRecordId: string;
  status: EditorialStatus;
  format: ApprovedQuestionFormat;
  prompt: string;
  instruction: string;
  expectedAnswer: string;
  historicalDocumentIds: readonly string[];
  commonErrors: readonly string[];
  distractors: readonly string[];
  answerOptions?: readonly {
    label: "A" | "B" | "C" | "D";
    text: string;
    correct: boolean;
  }[];
  operationId: IntellectualOperationId;
  sourceIds: readonly string[];
  sourceCatalog: readonly ReferenceSource[];
  rationale: string;
  timelineInteraction?: {
    documentId: string;
    dates: readonly string[];
    entries: readonly {
      id: string;
      date: string;
      title: string;
      description: string;
      imageUrl: string;
      imageAlt: string;
      credit: string;
    }[];
  };
  associationInteraction?: {
    documentId: string;
    items: readonly { id: string; label: string }[];
    targets: readonly { id: string; description: string; correctItemId: string }[];
  };
  review: {
    documented: boolean;
    historicallyVerified: boolean;
    pedagogicallyVerified: boolean;
    biasAndLanguageReviewed: boolean;
    approvedBy: string | null;
    approvedVersion: string | null;
    approvedAt: string | null;
  };
}
