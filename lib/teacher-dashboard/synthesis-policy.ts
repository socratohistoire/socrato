import type { TeacherActivitySummary } from "./types.ts";

export const GROUP_SYNTHESIS_COMPLETION_THRESHOLD = 0.75;

export function getGroupsEligibleForSynthesis(activity: TeacherActivitySummary) {
  return activity.groupPortraits.filter((group) => group.targetedStudentCount > 0
    && group.completedStudentCount / group.targetedStudentCount >= GROUP_SYNTHESIS_COMPLETION_THRESHOLD);
}

export function formatGlobalCompletionMessage(activity: TeacherActivitySummary) {
  const completed = activity.completedStudentCount;
  const targeted = activity.targetedStudentCount;
  const completedLabel = completed === 1 ? "1 élève" : `${completed} élèves`;
  const verb = completed === 1 ? "a terminé" : "ont terminé";
  return `Bonjour, pour l’instant, ${completedLabel} sur ${targeted} ${verb} l’activité.`;
}
