export const STUDENT_PROGRESS_CONTRACT_VERSION = 1 as const;

export type StudentProgressResultStatus = "mastered" | "to_consolidate" | "to_work_on";
export type StudentProgressState = "not_started" | "in_progress" | "completed";

export type StudentProgressContract = {
  schemaVersion: typeof STUDENT_PROGRESS_CONTRACT_VERSION;
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
