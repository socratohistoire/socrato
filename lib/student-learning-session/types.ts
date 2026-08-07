import type { HistoricalPeriod } from "../student-dashboard/types.ts";
import type { StudentProgressContract } from "../student-progress/types.ts";

export type LearningSessionDocumentContent =
  | {
      kind: "population_table";
      rows: Array<{ region: string; population: string; representatives: string }>;
    }
  | {
      kind: "comparison_table";
      caption: string;
      headers: [string, string];
      rows: Array<{ label: string; value: string }>;
    }
  | {
      kind: "historical_timeline";
      entries: Array<{ date: string; phase: string; title: string; description: string; imageUrl: string; imageAlt: string; credit: string }>;
    }
  | { kind: "political_structure_diagram" }
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
  type: "question_with_documents" | "question_without_documents" | "multiple_choice" | "interactive_timeline" | "interactive_association";
  format?: "multiple-choice" | "short-answer" | "document-interpretation" | "interactive-timeline" | "interactive-association" | "development-150";
  number: number;
  prompt: string;
  instruction: string;
  primaryOperationId: string;
  featuredDocumentId?: string;
  intellectualOperations: Array<{ id: string; label: string }>;
  historicalKnowledgeIds: string[];
  documentRelations: LearningSessionQuestionDocument[];
  requiredDocumentIds?: string[];
  localHint: string;
  initialMessages: LearningSessionMessage[];
  answerOptions?: readonly { label: "A" | "B" | "C" | "D"; text: string; correct: boolean }[];
  answerExplanation?: string;
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
  progress?: StudentProgressContract;
  questions: LearningSessionQuestion[];
  documentCatalog: LearningSessionDocument[];
  dashboardHref: string;
  source: "local_demo" | "server";
  localDemoNotice: string;
};
