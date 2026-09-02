import type { ActivityStatus, ActivityType, HistoricalKnowledge, IntellectualOperation, ProgressStatus, StudentActivity } from "./types.ts";

export const DASHBOARD_LABELS = {
  title: "Mon tableau de bord",
  operations: "Mes opérations intellectuelles",
  knowledge: "Mes connaissances historiques",
  activities: "Mes activités",
  summary: "Bilan et recommandations de Socrato",
} as const;

export const PROGRESS_STATUS_LABELS: Record<ProgressStatus, string> = {
  mastered: "Maîtrisée", consolidate: "Maîtrisée avec l’aide de Socrato", needs_work: "À travailler", covered: "Abordée", not_assessed: "Non travaillée",
};

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  not_started: "À commencer", in_progress: "En cours", completed: "Terminée",
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  revision: "Activité de révision", enrichment: "Activité d’enrichissement", development: "Question à développement",
};

export function getActivityActionLabel(activity: StudentActivity): string {
  if (activity.activityStatus === "completed") return "Consulter mon bilan";
  return activity.activityStatus === "not_started" ? "Commencer l’activité" : "Poursuivre l’activité";
}

export function getWorkedOperations(items: IntellectualOperation[]): IntellectualOperation[] {
  return items.filter(({ status }) => status !== "not_assessed");
}

export function getWorkedHistoricalKnowledge(items: HistoricalKnowledge[]): HistoricalKnowledge[] {
  return items.filter(({ status }) => status !== "not_assessed");
}
