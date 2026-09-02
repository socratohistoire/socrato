import type { LearningSessionDocument } from "../student-learning-session/types.ts";
import type { ApprovedQuestion } from "../pedagogical-reference/types.ts";

export type WorkType = "revision" | "enrichment" | "development";
export type ProgressionMode = "fixed" | "timed" | "timed-capped" | "incomplete";

export type ActivityCreatorGroup = { id: string; name: string };
export type ActivityCreatorNotion = {
  id: string;
  title: string;
  periodId: "1840-1896" | "1896-1945" | "1945-1980" | "1980-present";
  periodLabel: string;
  hasApprovedDocuments: boolean;
};
export type IntellectualOperation = { id: string; label: string };

export type ActivityCreatorCatalog = {
  source: "local_demo";
  groups: ActivityCreatorGroup[];
  notions: ActivityCreatorNotion[];
  operations: IntellectualOperation[];
  documents: LearningSessionDocument[];
  questions: readonly ApprovedQuestion[];
};

export type ActivityConfiguration = {
  title: string;
  durationMinutes: number | null;
  questionCount: number | null;
  selectedGroupIds: string[];
  workType: WorkType;
  notionIds: string[];
  operationId: string | null;
  questionValidated: boolean;
};

export type ConfigurationErrors = Partial<Record<"title" | "format" | "groups" | "notions" | "operation" | "question", string>>;

export type ActivityPreview = {
  questionId?: string;
  format: ApprovedQuestion["format"];
  answerOptions?: ApprovedQuestion["answerOptions"];
  answerExplanation?: string;
  operationId: string;
  operationLabel: string;
  notionTitle: string;
  historicalKnowledgeIds: readonly string[];
  question: string;
  instruction: string;
  guidance: string[];
  documents: LearningSessionDocument[];
  timelineInteraction?: ApprovedQuestion["timelineInteraction"];
  associationInteraction?: ApprovedQuestion["associationInteraction"];
  causalChainInteraction?: ApprovedQuestion["causalChainInteraction"];
};
