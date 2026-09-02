export type TeacherGroupActivityState = "completed" | "in_progress" | "not_started";
export type TeacherGroupStudentPriority = "high" | "medium" | "normal";
export type TeacherGroupPriorityFilter = "all" | "high" | "medium";
export type TeacherGroupStateFilter = "all" | TeacherGroupActivityState;

export type TeacherGroupStudent = {
  id: string;
  displayLabel: string;
  activityState: TeacherGroupActivityState;
  priority: TeacherGroupStudentPriority;
  mainDifficulty: string;
  progressPercentage?: number;
  studentDetailHref?: string;
};

export type TeacherGroupDetailRecord = {
  source: "local_demo" | "server";
  activityId: string;
  activityTitle: string;
  groupId: string;
  groupName: string;
  completedStudentCount: number;
  targetedStudentCount: number;
  socratoSummary: {
    mastery: string;
    mainChallenge: string;
  };
  teacher: {
    displayLabel: string;
    roleLabel: string;
    initials: string;
  };
  groups: readonly {
    id: string;
    name: string;
    studentCount: number;
  }[];
  students: readonly TeacherGroupStudent[];
};

export type TeacherGroupDetailViewModel = TeacherGroupDetailRecord & {
  participationPercentage: number;
  socratoSummaryText: string;
  returnHref: string;
};
