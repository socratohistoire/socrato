import type { PedagogicalSummary } from "../pedagogical-session-engine/types.ts";
import type { TeacherActivitySummary, TeacherGroupOverview } from "../teacher-dashboard/types.ts";
import { LOCAL_DEMO_STUDENT_GROUP_ID } from "./student-dashboard.ts";
import type { LocalPublishedActivity } from "./store.ts";
import type { StudentProgressContract } from "../student-progress/types.ts";

type ActivitySummaryGroup = Pick<TeacherGroupOverview, "id" | "name" | "studentCount">;

function localGroupPortrait(activity: LocalPublishedActivity, outcome: PedagogicalSummary | undefined, progress: StudentProgressContract | undefined, groups: readonly ActivitySummaryGroup[]) {
  const targetedGroups = groups.filter(({ id }) => activity.targetedGroupIds.includes(id));
  if (targetedGroups.length === 0) return [];
  const hasConsolidation = outcome?.operationResults.some(({ status }) => status !== "mastered")
    || outcome?.historicalKnowledgeResults.some(({ status }) => status !== "mastered");
  const completed = Boolean(outcome) || progress?.state === "completed";
  return targetedGroups.map((group) => ({
    id: `portrait-${activity.id}-${group.id}`,
    activityId: activity.id,
    name: group.name,
    observation: !outcome && !progress
      ? "Aucun résultat disponible pour le moment."
      : completed && hasConsolidation
      ? "Un premier bilan est disponible. Certaines démarches ou connaissances restent à consolider."
      : completed ? "Un premier bilan est disponible et montre une bonne maîtrise des éléments travaillés."
      : `Un élève a commencé l’activité et a réalisé ${progress?.completedQuestionIds.length ?? 0} question${progress?.completedQuestionIds.length === 1 ? "" : "s"} sur ${progress?.totalQuestions ?? 0}.`,
    suggestion: !outcome && !progress
      ? "Les résultats apparaîtront lorsque les élèves commenceront l’activité."
      : outcome?.consolidationTargets[0] ?? (completed ? "Poursuivre l’accompagnement à partir du bilan structuré de l’activité." : "Laisser l’élève poursuivre avant de tirer une conclusion pédagogique."),
    completedStudentCount: completed ? 1 : 0,
    targetedStudentCount: group.studentCount,
    groupDetailHref: group.id === LOCAL_DEMO_STUDENT_GROUP_ID
      ? `/teacher/activities/${encodeURIComponent(activity.id)}/groups/${encodeURIComponent(group.id)}`
      : `/teacher/groups/${encodeURIComponent(group.id)}`,
  }));
}

export function createLocalTeacherActivitySummaries(
  activities: readonly LocalPublishedActivity[],
  groups: readonly ActivitySummaryGroup[],
  outcomes: Readonly<Record<string, PedagogicalSummary>>,
  progressRecords: Readonly<Record<string, StudentProgressContract>> = {},
): TeacherActivitySummary[] {
  return activities.map((activity) => {
    const outcome = outcomes[activity.id];
    const progress = progressRecords[activity.id];
    const completed = Boolean(outcome) || progress?.state === "completed";
    const started = completed || progress?.state === "in_progress";
    const targetedStudentCount = groups
      .filter(({ id }) => activity.targetedGroupIds.includes(id))
      .reduce((total, group) => total + group.studentCount, 0);
    return {
      id: activity.id,
      summaryVersion: outcome
        ? `local-${activity.publicationStatus}-${activity.updatedAt}-${outcome.completedAt}`
        : progress
          ? `local-${activity.publicationStatus}-${activity.updatedAt}-progress-${progress.updatedAt}`
          : `local-${activity.publicationStatus}-${activity.updatedAt}-pending-v1`,
      activityType: activity.workType,
      customTitle: activity.title,
      publishedAt: activity.publishedAt,
      targetedGroupIds: activity.targetedGroupIds,
      completedStudentCount: completed ? 1 : 0,
      startedStudentCount: started ? 1 : 0,
      targetedStudentCount,
      resultAvailability: outcome ? "partial" : "awaiting_results",
      lifecycleStatus: activity.publicationStatus ?? "published",
      socratoObservation: outcome ? {
        strength: outcome.operationResults.some(({ status }) => status === "mastered") ? "historical_knowledge" : undefined,
        difficulty: outcome.operationResults.some(({ status }) => status !== "mastered") ? "incomplete_reasoning" : undefined,
      } : undefined,
      groupPortraits: localGroupPortrait(activity, outcome, progress, groups),
      highPriorityStudents: [],
    };
  });
}
