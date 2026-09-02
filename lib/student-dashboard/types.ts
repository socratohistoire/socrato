export type ProgressStatus = "mastered" | "consolidate" | "needs_work" | "covered" | "not_assessed";
export type ActivityOrigin = "teacher_assigned" | "student_selected";
export type DashboardMode = "teacher-assigned" | "notion-review";
export type ActivityType = "revision" | "enrichment" | "development";
export type ActivityStatus = "not_started" | "in_progress" | "completed";

export type HistoricalPeriod = { startYear?: number; endYear?: number; displayLabel?: string };
export type Notion = { id: string; title: string; description: string; historicalPeriod: HistoricalPeriod };
export type IntellectualOperation = { id: string; label: string; status: ProgressStatus };
export type HistoricalKnowledge = { id: string; label: string; status: ProgressStatus };

export type ActivitySummary = {
  state: "pending" | "local_demo_structured" | "server_structured";
  strengths: string[];
  consolidationTargets: string[];
  readingAdvice?: string;
  recommendation: string | null;
  consolidationActivity: string | null;
  recommendedOperationIds?: string[];
  recommendedHistoricalKnowledgeIds?: string[];
  consolidationProgress: {
    state: "improving" | "consolidated" | "continue";
    source: "socrato_proposed" | "teacher_assigned";
    completedAt: string;
    previousLevel: string;
    currentLevel: string;
    observation: string;
    strategyKey?: string;
    strategyLabel?: string;
    attemptNumber?: number;
    targetOperationId?: string;
  } | null;
};

export type StudentActivity = {
  id: string;
  activityTitle: string;
  activityType: ActivityType;
  publicationDate: string;
  historicalPeriod: HistoricalPeriod;
  notionIds: string[];
  historicalKnowledgeIds: string[];
  durationMinutes: number;
  progressPercentage: number;
  activityStatus: ActivityStatus;
  origin: ActivityOrigin;
  isRecent: boolean;
  actionHref: string;
  operations: IntellectualOperation[];
  historicalKnowledge: HistoricalKnowledge[];
  summary: ActivitySummary;
};

export type StudentDashboardData = {
  defaultActivityId: string;
  selectedActivityId: string;
  activities: StudentActivity[];
  notions: Notion[];
  source: "local_demo" | "server";
};
