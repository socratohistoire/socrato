export type TeacherStudentResultStatus = "mastered" | "consolidate" | "needs_work";

export type TeacherStudentWorkedResult = {
  id: string;
  label: string;
  status: TeacherStudentResultStatus;
};

export type TeacherStudentDetailRecord = {
  source: "local_demo";
  activityId: string;
  activityTitle: string;
  groupId: string;
  groupName: string;
  studentId: string;
  studentDisplayLabel: string;
  studentFirstName: string;
  activityStateLabel: "Activité terminée";
  priorityLabel: "Priorité élevée";
  socratoSummary: string;
  pedagogicalSummary: {
    strength: string;
    mainDifficulty: string;
    consolidationPath: string;
  };
  consolidationProgress: {
    state: "improving" | "consolidated" | "continue";
    source: "socrato_proposed" | "teacher_assigned";
    completedAt: string;
    previousLevel: string;
    currentLevel: string;
    observation: string;
  };
  operations: readonly TeacherStudentWorkedResult[];
  historicalKnowledge: readonly TeacherStudentWorkedResult[];
  teacher: {
    displayLabel: string;
    roleLabel: string;
    initials: string;
  };
  groups: readonly { id: string; name: string; studentCount: number }[];
};

export type TeacherStudentDetailViewModel = TeacherStudentDetailRecord & {
  groupReturnHref: string;
  teacherReturnHref: string;
};
