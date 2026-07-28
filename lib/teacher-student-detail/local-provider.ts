import { isAuthorizedLocalTeacherStudentContext } from "./access.ts";
import type { TeacherStudentDetailProvider } from "./provider.ts";
import type { TeacherStudentDetailRecord } from "./types.ts";

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
  socratoSummary: "Liam repère correctement les faits principaux. Il doit encore justifier ses réponses à l’aide d’éléments précis tirés des documents.",
  pedagogicalSummary: {
    strength: "Repère correctement les faits historiques importants.",
    mainDifficulty: "Justifier une réponse à l’aide des documents.",
    consolidationPath: "Reprendre une courte activité guidée sur l’utilisation des preuves.",
  },
  operations: [
    { id: "establish_facts", label: "Établir des faits", status: "mastered" },
    { id: "causes-and-consequences", label: "Déterminer des causes et des conséquences", status: "consolidate" },
    { id: "relate_facts", label: "Mettre en relation des faits", status: "needs_work" },
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
    return LOCAL_STUDENT_DETAIL;
  }
}
