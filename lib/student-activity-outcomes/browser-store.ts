import type { PedagogicalSummary, ResultStatus } from "../pedagogical-session-engine/types.ts";
import { ACTE_UNION_HISTORICAL_KNOWLEDGE } from "../student-dashboard/historical-knowledge-catalog.ts";
import type { ProgressStatus, StudentDashboardData } from "../student-dashboard/types.ts";
import { INTELLECTUAL_OPERATIONS } from "../pedagogical-reference/intellectual-operations.ts";
import { getActivityDashboardUrl } from "../student-dashboard/selection.ts";

const STORAGE_KEY = "socrato-student-activity-outcomes-v1";

export type StoredStudentActivityOutcomes = Record<string, PedagogicalSummary>;

export function readStudentActivityOutcomes(storage: Pick<Storage, "getItem">): StoredStudentActivityOutcomes {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) ?? "{}") as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as StoredStudentActivityOutcomes : {};
  } catch {
    return {};
  }
}

export function saveStudentActivityOutcome(storage: Storage, summary: PedagogicalSummary) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...readStudentActivityOutcomes(storage), [summary.activityId]: summary }));
  } catch {
    // La fin du parcours reste utilisable si le stockage du navigateur est indisponible.
  }
}

export function clearStudentActivityOutcome(storage: Storage, activityId: string) {
  try {
    const outcomes = readStudentActivityOutcomes(storage);
    delete outcomes[activityId];
    storage.setItem(STORAGE_KEY, JSON.stringify(outcomes));
  } catch {
    // La relance reste possible même si le stockage du navigateur est indisponible.
  }
}

function dashboardStatus(status: ResultStatus): ProgressStatus {
  return status === "mastered" ? "mastered" : status === "to_consolidate" ? "consolidate" : "needs_work";
}

export function applyStoredStudentActivityOutcomes(data: StudentDashboardData, storage: Storage): StudentDashboardData {
  const outcomes = readStudentActivityOutcomes(storage);
  return {
    ...data,
    activities: data.activities.map((activity) => {
      const outcome = outcomes[activity.id];
      if (!outcome) return activity;
      const operationStatuses = new Map(outcome.operationResults.map(({ id, status }) => [id, dashboardStatus(status)]));
      const knowledgeStatuses = new Map(outcome.historicalKnowledgeResults.map(({ id, status }) => [id, dashboardStatus(status)]));
      const operations = INTELLECTUAL_OPERATIONS
        .filter(({ id }) => operationStatuses.has(id))
        .map(({ id, officialLabel }) => ({ id, label: officialLabel, status: operationStatuses.get(id)! }));
      const historicalKnowledge = ACTE_UNION_HISTORICAL_KNOWLEDGE
        .map(({ id, label }) => ({ id, label, status: knowledgeStatuses.get(id) ?? "not_assessed" as const }))
        .sort((left, right) => Number(left.status === "not_assessed") - Number(right.status === "not_assessed"));
      return {
        ...activity,
        activityStatus: "completed" as const,
        progressPercentage: 100,
        isRecent: false,
        actionHref: `${getActivityDashboardUrl(activity.id)}#bilan`,
        operations,
        historicalKnowledge,
        historicalKnowledgeIds: historicalKnowledge.map(({ id }) => id),
        summary: {
          state: "local_demo_structured" as const,
          strengths: outcome.strengths.length ? outcome.strengths : ["Tu as mené l’activité jusqu’à son terme et mobilisé les démarches demandées."],
          consolidationTargets: outcome.consolidationTargets,
          recommendation: outcome.recommendation?.label ?? null,
          consolidationActivity: outcome.recommendation?.label ?? null,
          consolidationProgress: null,
        },
      };
    }),
  };
}
