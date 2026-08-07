export const STUDENT_PROGRESS_CONTRACT_VERSION = 2 as const;
export const LEGACY_STUDENT_PROGRESS_CONTRACT_VERSION = 1 as const;

export type StudentProgressResultStatus = "mastered" | "to_consolidate" | "to_work_on";
export type StudentProgressState = "not_started" | "in_progress" | "completed";

export type StudentQuestionRuntimeProgress = {
  questionId: string;
  attemptNumber: number;
  hintLevel: 0 | 1 | 2;
  hintRequestCount: number;
  nonExploitableCount: number;
  status: "presented" | "awaiting_response" | "completed";
};

type StudentProgressContractBase = {
  studentId: string;
  groupId: string;
  activityId: string;
  sessionId: string;
  notionId: string;
  state: StudentProgressState;
  currentQuestionIndex: number;
  totalQuestions: number;
  completedQuestionIds: string[];
  operationResults: Array<{ id: string; status: StudentProgressResultStatus }>;
  historicalKnowledgeResults: Array<{ id: string; status: StudentProgressResultStatus }>;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type StudentProgressContract = StudentProgressContractBase & (
  | { schemaVersion: typeof LEGACY_STUDENT_PROGRESS_CONTRACT_VERSION }
  | { schemaVersion: typeof STUDENT_PROGRESS_CONTRACT_VERSION; questionRuntime: StudentQuestionRuntimeProgress[] }
);
