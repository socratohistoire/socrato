import { isAuthorizedLocalTeacherGroupContext } from "./access.ts";
import type { TeacherGroupDetailProvider } from "./provider.ts";
import type { TeacherGroupDetailRecord } from "./types.ts";

export function isLocalTeacherGroupDetailEnabled(environment = process.env.NODE_ENV) {
  return environment !== "production";
}

const LOCAL_GROUP_DETAIL: TeacherGroupDetailRecord = {
  source: "local_demo",
  activityId: "activity-revision-01",
  activityTitle: "Révision avant l’évaluation 1",
  groupId: "group-demo-401",
  groupName: "Groupe fictif 401",
  completedStudentCount: 21,
  targetedStudentCount: 24,
  socratoSummary: {
    mastery: "Le groupe maîtrise généralement les connaissances ciblées.",
    mainChallenge: "La justification à l’aide des documents demeure le principal défi.",
  },
  teacher: {
    displayLabel: "Enseignante fictive",
    roleLabel: "Profil local de démonstration",
    initials: "EF",
  },
  groups: [
    { id: "group-demo-401", name: "Groupe fictif 401", studentCount: 24 },
    { id: "group-demo-402", name: "Groupe fictif 402", studentCount: 23 },
    { id: "group-demo-403", name: "Groupe fictif 403", studentCount: 25 },
    { id: "group-demo-404", name: "Groupe fictif 404", studentCount: 22 },
    { id: "group-demo-405", name: "Groupe fictif 405", studentCount: 24 },
    { id: "group-demo-406", name: "Groupe fictif 406", studentCount: 23 },
    { id: "group-demo-407", name: "Groupe fictif 407", studentCount: 26 },
  ],
  students: [
    { id: "student-demo-a17", displayLabel: "Liam B. (fictif)", activityState: "completed", priority: "high", mainDifficulty: "Justifier une réponse avec les documents", studentDetailHref: "/teacher/activities/activity-revision-01/groups/group-demo-401/students/student-demo-a17" },
    { id: "student-demo-b08", displayLabel: "Maya L. (fictive)", activityState: "completed", priority: "high", mainDifficulty: "Relier précisément les causes et les conséquences" },
    { id: "student-demo-d22", displayLabel: "Sofia P. (fictive)", activityState: "in_progress", priority: "high", mainDifficulty: "Sélectionner un fait historique pertinent" },
    { id: "student-demo-e14", displayLabel: "Émile R. (fictif)", activityState: "completed", priority: "normal", mainDifficulty: "Développer la justification historique" },
    { id: "student-demo-n09", displayLabel: "Nora T. (fictive)", activityState: "in_progress", priority: "normal", mainDifficulty: "Comparer deux documents différents" },
    { id: "student-demo-c03", displayLabel: "Adam C. (fictif)", activityState: "not_started", priority: "normal", mainDifficulty: "Activité non commencée" },
  ],
};

export class LocalTeacherGroupDetailProvider implements TeacherGroupDetailProvider {
  constructor(private readonly environment = process.env.NODE_ENV) {}

  async getGroupDetail(activityId: string, groupId: string) {
    if (!isLocalTeacherGroupDetailEnabled(this.environment)) {
      throw new Error("The local teacher group detail provider is disabled in production.");
    }
    if (!isAuthorizedLocalTeacherGroupContext(activityId, groupId)) return null;
    return LOCAL_GROUP_DETAIL;
  }
}
