export type TeacherDashboardSource = "local_demo";

export type HighPriorityReason = "failed_assessment" | "near_failure";
export type TeacherPriorityLevel = "high" | "medium" | "none";

export type TeacherSupportCandidate = {
  id: string;
  displayLabel: string;
  groupId: string;
  groupLabel: string;
  priority: TeacherPriorityLevel;
  highPriorityReason?: HighPriorityReason;
  reasonLabel: string;
  studentPortraitHref?: string;
};

export type TeacherGroupBriefing = {
  id: string;
  activityId: string;
  name: string;
  observation: string;
  suggestion: string;
  completedStudentCount: number;
  targetedStudentCount: number;
  groupDetailHref?: string;
};

export type TeacherActivityResultAvailability = "available" | "partial" | "awaiting_results";

export type TeacherSocratoObservationSignals = {
  progression?: "good_pace" | "majority_completed" | "improved_since_previous";
  strength?: "historical_knowledge" | "chronology" | "context" | "causality" | "document_interpretation";
  difficulty?: "cause_consequence" | "document_comparison" | "historical_vocabulary" | "incomplete_reasoning" | "missing_justification";
};

export type TeacherActivitySummary = {
  id: string;
  summaryVersion: string;
  activityType: "revision" | "enrichment";
  customTitle: string;
  publishedAt: string;
  targetedGroupIds: readonly string[];
  completedStudentCount: number;
  targetedStudentCount: number;
  resultAvailability: TeacherActivityResultAvailability;
  socratoObservation?: TeacherSocratoObservationSignals;
  groupPortraits: readonly TeacherGroupBriefing[];
  highPriorityStudents: readonly TeacherSupportCandidate[];
};

export type TeacherGroupOverview = {
  id: string;
  name: string;
  studentCount: number;
  currentActivity: string | null;
  currentActivityType: string | null;
  dueDate: string | null;
  latestActivity: string | null;
  historicalKnowledgeToReview: readonly string[];
  intellectualOperationsToReview: readonly string[];
  accessCodeManagementAvailable: boolean;
};

export type TeacherDashboardData = {
  source: TeacherDashboardSource;
  hasCreatedActivity: boolean;
  teacher: {
    id: string;
    firstName?: string;
    displayLabel: string;
    roleLabel: string;
    initials: string;
  };
  weekLabel: string;
  activities: readonly TeacherActivitySummary[];
  selectedActivityId: string | null;
  groupBriefings: readonly TeacherGroupBriefing[];
  supportCandidates: readonly TeacherSupportCandidate[];
  groups: readonly TeacherGroupOverview[];
};

export type TeacherDashboardViewModel = Omit<TeacherDashboardData, "supportCandidates" | "groupBriefings"> & {
  selectedActivity: TeacherActivitySummary;
  groupBriefings: readonly TeacherGroupBriefing[];
  highPriorityStudents: readonly (TeacherSupportCandidate & {
    priority: "high";
    highPriorityReason: HighPriorityReason;
  })[];
};
