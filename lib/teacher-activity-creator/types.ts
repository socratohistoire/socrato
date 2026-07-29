import type { LearningSessionDocument } from "../student-learning-session/types.ts";

export type WorkType = "revision" | "enrichment" | "development";
export type ProgressionMode = "fixed" | "timed" | "timed-capped" | "incomplete";

export type ActivityCreatorGroup = { id: string; name: string };
export type ActivityCreatorNotion = { id: string; title: string; hasApprovedDocuments: boolean };
export type IntellectualOperation = { id: string; label: string };

export type ActivityCreatorCatalog = {
  source: "local_demo";
  groups: ActivityCreatorGroup[];
  notions: ActivityCreatorNotion[];
  operations: IntellectualOperation[];
  documents: LearningSessionDocument[];
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
  operationLabel: string;
  notionTitle: string;
  question: string;
  instruction: string;
  guidance: string[];
  documents: LearningSessionDocument[];
};
