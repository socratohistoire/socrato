import type {
  NotebookRecommendation,
  ProgressStatus,
  StudentActivity,
} from "./types.ts";

export const DASHBOARD_LABELS = {
  title: "Mon tableau de bord",
  activity: "Activité de révision",
  operations: "Mes opérations intellectuelles",
  knowledge: "Connaissances historiques",
  notions: "Réviser par notion",
  teacherPractices: "Pratiques de l’enseignant",
  recommendations: "Recommandations de Socrato",
} as const;

export const PROGRESS_STATUS_LABELS: Record<ProgressStatus, string> = {
  mastered: "Maîtrisée",
  consolidate: "À consolider",
  needs_work: "À travailler",
  not_assessed: "Non travaillée",
};

export function getActivityTitle(activity: StudentActivity | null): string {
  return activity?.title ?? "Aucune activité publiée";
}

export function hasNotebookResource(
  recommendation: NotebookRecommendation | null,
): boolean {
  return Boolean(recommendation?.resourceHref);
}

export function getActivityCardLabel(activity: StudentActivity): string {
  return activity.origin === "student_selected"
    ? "Révision par notion"
    : "Activité de révision";
}

export function getActivityOriginLabel(activity: StudentActivity): string {
  return activity.origin === "student_selected"
    ? "Choisie par toi"
    : "Assignée par ton enseignant";
}

export function getActivityActionLabel(activity: StudentActivity): string {
  return activity.progressPercent === 0
    ? "Commencer l’activité"
    : "Poursuivre l’activité";
}
