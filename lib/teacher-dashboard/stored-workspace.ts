import type { TeacherActor } from "../authentication/teacher-session.ts";
import type { StoredTeacherGroupSummary } from "../server/teacher-groups.ts";
import type { TeacherActivitySummary, TeacherDashboardData } from "./types.ts";

const EMPTY_ACTIVITY: TeacherActivitySummary = {
  id: "teacher-workspace-empty",
  summaryVersion: "empty-v1",
  activityType: "revision",
  customTitle: "Aucune activité en cours",
  publishedAt: "1970-01-01T00:00:00.000Z",
  targetedGroupIds: [],
  completedStudentCount: 0,
  startedStudentCount: 0,
  targetedStudentCount: 0,
  resultAvailability: "awaiting_results",
  groupPortraits: [],
  highPriorityStudents: [],
};

function initials(displayName: string) {
  return displayName.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "S";
}

/** Builds the normal local workspace exclusively from groups persisted by onboarding. */
export function createStoredTeacherDashboardData(teacher: TeacherActor, groups: readonly StoredTeacherGroupSummary[]): TeacherDashboardData {
  return {
    source: "stored_teacher_workspace",
    hasCreatedActivity: false,
    teacher: {
      id: teacher.id,
      firstName: teacher.displayName.trim().split(/\s+/)[0],
      displayLabel: teacher.displayName,
      roleLabel: teacher.email ?? "Compte enseignant local",
      initials: initials(teacher.displayName),
    },
    weekLabel: "Espace enseignant",
    activities: [EMPTY_ACTIVITY],
    selectedActivityId: EMPTY_ACTIVITY.id,
    groupBriefings: [],
    supportCandidates: [],
    groups: groups.map((group) => ({
      ...group,
      currentActivity: null,
      currentActivityType: null,
      dueDate: null,
      latestActivity: null,
      historicalKnowledgeToReview: [],
      intellectualOperationsToReview: [],
      accessCodeManagementAvailable: true,
    })),
  };
}
