import type { HistoricalPeriod } from "../student-dashboard/types.ts";

export type LearningSessionDocumentContent =
  | {
      kind: "population_table";
      rows: Array<{ region: string; population: string; representatives: string }>;
    }
  | { kind: "historical_excerpt"; excerpt: string }
  | { kind: "historical_image"; localSrc: string; alt: string; description: string };

export type LearningSessionDocument = {
  id: string;
  title: string;
  typeLabel: string;
  dateLabel?: string;
  authorLabel?: string;
  institutionLabel?: string;
  originalDocumentLabel?: string;
  publicationLabel?: string;
  sourceLabel: string;
  sourceUrls: string[];
  rightsLabel: string;
  editorialNote?: string;
  content: LearningSessionDocumentContent;
  historicalKnowledgeIds: string[];
  intellectualOperationIds: string[];
};

export type LearningSessionQuestionDocument = {
  documentId: string;
  displayOrder: number;
};

export type LearningSessionMessage = {
  id: string;
  author: "socrato" | "student" | "system";
  content: string;
};

export type LearningSessionQuestion = {
  id: string;
  type: "question_with_documents" | "question_without_documents";
  number: number;
  prompt: string;
  instruction: string;
  primaryOperationId: string;
  featuredDocumentId?: string;
  intellectualOperations: Array<{ id: string; label: string }>;
  historicalKnowledgeIds: string[];
  documentRelations: LearningSessionQuestionDocument[];
  localHint: string;
  initialMessages: LearningSessionMessage[];
};

export type StudentLearningSessionData = {
  id: string;
  activityId: string;
  activityTitle: string;
  origin: "teacher_assigned" | "student_selected";
  notionId: string;
  notionTitle: string;
  historicalPeriod: HistoricalPeriod;
  currentQuestionIndex: number;
  questions: LearningSessionQuestion[];
  documentCatalog: LearningSessionDocument[];
  dashboardHref: string;
  source: "local_demo";
  localDemoNotice: string;
};
