import type { PedagogicalSummary, ResultStatus } from "../pedagogical-session-engine/types.ts";
import { INTELLECTUAL_OPERATIONS } from "../pedagogical-reference/intellectual-operations.ts";
import { ACTE_UNION_HISTORICAL_KNOWLEDGE } from "../student-dashboard/historical-knowledge-catalog.ts";
import type { TeacherStudentDetailRecord, TeacherStudentResultStatus } from "../teacher-student-detail/types.ts";
import type { LocalPublishedActivity } from "./store.ts";
import { LOCAL_STUDENT_ID } from "../academic-context/local-context.ts";
import { assessStudentPriority } from "../server/student-priority.ts";

function resultStatus(status: ResultStatus): TeacherStudentResultStatus {
  return status === "mastered" ? "mastered" : status === "to_consolidate" ? "consolidate" : "needs_work";
}

function formatCompletedAt(value: string) {
  return new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Toronto" }).format(new Date(value));
}

export function applyLocalActivityToStudentDetail(
  base: TeacherStudentDetailRecord,
  activity: LocalPublishedActivity,
  outcome: PedagogicalSummary,
): TeacherStudentDetailRecord {
  const operationLabels = new Map<string, string>(INTELLECTUAL_OPERATIONS.map(({ id, officialLabel }) => [id, officialLabel]));
  const knowledgeLabels = new Map<string, string>(ACTE_UNION_HISTORICAL_KNOWLEDGE.map(({ id, label }) => [id, label]));
  const operations = outcome.operationResults.flatMap(({ id, status }) => {
    const label = operationLabels.get(id);
    return label ? [{ id, label, status: resultStatus(status) }] : [];
  });
  const historicalKnowledge = outcome.historicalKnowledgeResults.flatMap(({ id, status }) => {
    const label = knowledgeLabels.get(id);
    return label ? [{ id, label, status: resultStatus(status) }] : [];
  });
  const requiresConsolidation = [...operations, ...historicalKnowledge].some(({ status }) => status !== "mastered");
  const priorityAssessment = assessStudentPriority(outcome.operationResults, outcome.historicalKnowledgeResults);
  const strength = outcome.strengths[0] ?? "L’élève a mené l’activité jusqu’à son terme.";
  const difficulty = outcome.consolidationTargets[0] ?? "Aucune difficulté prioritaire n’a été dégagée.";
  const nextStep = outcome.recommendation?.label ?? (requiresConsolidation ? "Reprendre les éléments indiqués dans le bilan structuré." : "Poursuivre avec une nouvelle activité lorsque ce sera pertinent.");
  return {
    ...base,
    activityId: activity.id,
    activityTitle: activity.title,
    studentId: LOCAL_STUDENT_ID,
    studentDisplayLabel: "Élève local (fictif)",
    studentFirstName: "Élève",
    priorityLabel: priorityAssessment.level === "high" ? "Priorité élevée" : priorityAssessment.level === "medium" ? "À surveiller" : "Suivi normal",
    socratoSummary: `${outcome.encouragement} ${requiresConsolidation ? difficulty : strength}`,
    pedagogicalSummary: { strength, mainDifficulty: difficulty, consolidationPath: nextStep },
    consolidationProgress: {
      state: requiresConsolidation ? "continue" : "consolidated",
      source: "teacher_assigned",
      completedAt: formatCompletedAt(outcome.completedAt),
      previousLevel: "Activité commencée",
      currentLevel: requiresConsolidation ? "À consolider" : "Maîtrisée",
      observation: outcome.encouragement,
    },
    operations,
    historicalKnowledge,
  };
}
