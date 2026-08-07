import { isAuthorizedLocalTeacherStudentContext } from "./access.ts";
import type { TeacherStudentDetailProvider } from "./provider.ts";
import type { TeacherStudentDetailRecord } from "./types.ts";
import { createLocalTeacherDashboardData } from "../teacher-dashboard/local-provider.ts";
import { LOCAL_STUDENT_ID } from "../academic-context/local-context.ts";

export function isLocalTeacherStudentDetailEnabled(environment = process.env.NODE_ENV) {
  return environment !== "production";
}

const LOCAL_STUDENT_DETAIL: TeacherStudentDetailRecord = {
  source: "local_demo",
  activityId: "activity-revision-01",
  activityTitle: "Révision avant l’évaluation 1",
  groupId: "group-demo-401",
  groupName: "Groupe fictif 401",
  studentId: "student-demo-a17",
  studentDisplayLabel: "Liam B. (fictif)",
  studentFirstName: "Liam",
  activityStateLabel: "Activité terminée",
  priorityLabel: "Priorité élevée",
  socratoSummary: "La consolidation montre une progression. Liam repère maintenant les faits principaux avec plus de précision; la justification à l’aide des documents demeure à poursuivre.",
  pedagogicalSummary: {
    strength: "Repère correctement les faits historiques importants.",
    mainDifficulty: "Justifier une réponse à l’aide des documents.",
    consolidationPath: "Reprendre une courte activité guidée sur l’utilisation des preuves.",
  },
  consolidationProgress: {
    state: "improving",
    source: "teacher_assigned",
    completedAt: "28 avril 2025",
    previousLevel: "À consolider",
    currentLevel: "En progression",
    observation: "L’établissement des faits s’est amélioré depuis le bilan initial. La mise en relation des faits exige encore un accompagnement.",
  },
  operations: [
    { id: "establish_facts", label: "Établir des faits", status: "mastered" },
    { id: "causes-and-consequences", label: "Déterminer des causes et des conséquences", status: "mastered" },
    { id: "relate_facts", label: "Mettre en relation des faits", status: "consolidate" },
  ],
  historicalKnowledge: [
    { id: "contexte-acte-union", label: "Contexte de l’Acte d’union", status: "mastered" },
    { id: "representation-egale-deux-canadas", label: "Représentation égale des deux Canadas", status: "consolidate" },
    { id: "rapport-durham", label: "Rapport Durham", status: "consolidate" },
  ],
  teacher: { displayLabel: "Enseignante fictive", roleLabel: "Profil local de démonstration", initials: "EF" },
  groups: [
    { id: "group-demo-401", name: "Groupe fictif 401", studentCount: 24 },
    { id: "group-demo-402", name: "Groupe fictif 402", studentCount: 23 },
    { id: "group-demo-403", name: "Groupe fictif 403", studentCount: 25 },
    { id: "group-demo-404", name: "Groupe fictif 404", studentCount: 22 },
    { id: "group-demo-405", name: "Groupe fictif 405", studentCount: 24 },
    { id: "group-demo-406", name: "Groupe fictif 406", studentCount: 23 },
    { id: "group-demo-407", name: "Groupe fictif 407", studentCount: 26 },
  ],
};

export class LocalTeacherStudentDetailProvider implements TeacherStudentDetailProvider {
  constructor(private readonly environment = process.env.NODE_ENV) {}

  async getStudentDetail(activityId: string, groupId: string, studentId: string) {
    if (!isLocalTeacherStudentDetailEnabled(this.environment)) throw new Error("The local teacher student detail provider is disabled in production.");
    if (!isAuthorizedLocalTeacherStudentContext(activityId, groupId, studentId)) return null;
    if (/^activity-local-[0-9]+$/.test(activityId) && studentId === LOCAL_STUDENT_ID) {
      const dashboard = createLocalTeacherDashboardData();
      const group = dashboard.groups.find(({ id }) => id === groupId);
      if (!group) return null;
      return {
        ...LOCAL_STUDENT_DETAIL,
        activityId,
        activityTitle: "Activité publiée localement",
        groupId,
        groupName: group.name,
        studentId,
        studentDisplayLabel: "Élève local (fictif)",
        studentFirstName: "Élève",
        priorityLabel: "Suivi normal" as const,
        teacher: dashboard.teacher,
        groups: dashboard.groups,
        operations: [],
        historicalKnowledge: [],
      };
    }
    return LOCAL_STUDENT_DETAIL;
  }
}
