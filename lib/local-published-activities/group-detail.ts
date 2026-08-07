import type { PedagogicalSummary } from "../pedagogical-session-engine/types.ts";
import type { TeacherGroupDetailRecord } from "../teacher-group-detail/types.ts";
import type { LocalPublishedActivity } from "./store.ts";
import type { StudentProgressContract } from "../student-progress/types.ts";
import { LOCAL_STUDENT_ID } from "../academic-context/local-context.ts";

export function applyLocalActivityToGroupDetail(
  base: TeacherGroupDetailRecord,
  activity: LocalPublishedActivity,
  outcome?: PedagogicalSummary,
  progress?: StudentProgressContract,
): TeacherGroupDetailRecord {
  const completed = Boolean(outcome) || progress?.state === "completed";
  const inProgress = !completed && progress?.state === "in_progress";
  const progressPercentage = progress ? Math.round((progress.completedQuestionIds.length / Math.max(1, progress.totalQuestions)) * 100) : 0;
  const hasDifficulty = outcome?.operationResults.some(({ status }) => status !== "mastered")
    || outcome?.historicalKnowledgeResults.some(({ status }) => status !== "mastered");
  return {
    ...base,
    activityId: activity.id,
    activityTitle: activity.title,
    completedStudentCount: completed ? 1 : 0,
    socratoSummary: completed ? {
      mastery: outcome?.strengths[0] ?? "Un premier bilan structuré est maintenant disponible.",
      mainChallenge: outcome?.consolidationTargets[0] ?? "Aucun défi prioritaire n’a encore été dégagé.",
    } : {
      mastery: inProgress ? `Un élève a commencé l’activité et sa progression est de ${progressPercentage} %.` : "Aucun élève local n’a encore terminé cette activité.",
      mainChallenge: inProgress ? "Aucune conclusion pédagogique n’est produite avant la fin de l’activité." : "La synthèse apparaîtra après la réception d’un premier bilan structuré.",
    },
    students: [{
      id: LOCAL_STUDENT_ID,
      displayLabel: "Élève local (fictif)",
      activityState: completed ? "completed" : inProgress ? "in_progress" : "not_started",
      progressPercentage,
      priority: hasDifficulty ? "high" : "normal",
      mainDifficulty: outcome?.consolidationTargets[0] ?? (completed ? "Aucune difficulté prioritaire dégagée" : inProgress ? `Progression actuelle : ${progressPercentage} %` : "Activité non commencée"),
      studentDetailHref: completed ? `/teacher/activities/${encodeURIComponent(activity.id)}/groups/${encodeURIComponent(base.groupId)}/students/${LOCAL_STUDENT_ID}` : undefined,
    }],
  };
}
