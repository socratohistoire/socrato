import type { HistoricalPeriod } from "../student-dashboard/types.ts";

export type LearningSessionDocument = {
  id: string;
  title: string;
  previewSrc: string;
  previewAlt: string;
  dateLabel?: string;
  sourceLabel: string;
  rightsLabel: string;
};

export type LearningSessionMessage = {
  id: string;
  author: "socrato" | "student" | "system";
  content: string;
};

export type LearningSessionQuestion = {
  id: string;
  number: number;
  prompt: string;
  instruction: string;
  intellectualOperations: Array<{ id: string; label: string }>;
  historicalKnowledgeIds: string[];
  documents: LearningSessionDocument[];
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
  dashboardHref: string;
  source: "local_demo";
  localDemoNotice: string;
};
