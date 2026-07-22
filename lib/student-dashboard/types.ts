export type ProgressStatus =
  | "mastered"
  | "consolidate"
  | "needs_work"
  | "not_assessed";

export type ActivityOrigin = "teacher_assigned" | "student_selected";
export type DashboardMode = "teacher-assigned" | "notion-review";

export type StudentActivity = {
  id: string;
  label: "Activité de révision";
  title: string;
  progressPercent: number;
  state: "available" | "in_progress";
  isNew: boolean;
  actionHref: string;
  illustrationSrc: string;
  illustrationPosition: string;
  origin: ActivityOrigin;
};

export type IntellectualOperation = {
  id: string;
  label: string;
  status: ProgressStatus;
  canReview: boolean;
};

export type HistoricalKnowledge = {
  id: string;
  label: string;
  status: ProgressStatus;
  canReview: boolean;
};

export type HistoricalPeriod = {
  startYear?: number;
  endYear?: number;
  displayLabel?: string;
};

export type Notion = {
  id: string;
  title: string;
  description: string;
  historicalPeriod: HistoricalPeriod;
};

export type NotebookRecommendation = {
  pages: string;
  resourceLabel?: string;
  resourceHref?: string;
};

export type TeacherPractice = {
  id: string;
  title: string;
  state: "active" | "completed" | "expired" | "unavailable";
  notionId?: string;
  historicalPeriod?: HistoricalPeriod;
  illustrationSrc: string;
  illustrationPosition: string;
  progressPercent?: number;
};

export type StudentDashboardData = {
  defaultNotionId: string;
  selectedNotionId: string;
  selectedMode: DashboardMode;
  notionContexts: StudentNotionDashboardContext[];
  notions: Notion[];
  teacherPractices: TeacherPractice[];
  source: "local_demo";
};

export type StudentNotionDashboardContext = {
  notionId: string;
  activity: StudentActivity | null;
  notebookRecommendation: NotebookRecommendation | null;
  recommendationEmptyMessage: string;
  operations: IntellectualOperation[];
  historicalKnowledge: HistoricalKnowledge[];
};
