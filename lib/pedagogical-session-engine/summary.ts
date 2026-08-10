import type { SummaryProducer } from "./ports.ts";
import type {
  PedagogicalResultEntry,
  PedagogicalSessionState,
  PedagogicalSummary,
  QuestionResult,
  ResultStatus,
  WorkbookReference,
} from "./types.ts";

function mostCautiousStatus(current: ResultStatus | undefined, candidate: ResultStatus): ResultStatus {
  const rank: Record<ResultStatus, number> = { to_work_on: 0, to_consolidate: 1, mastered: 2 };
  return !current || rank[candidate] < rank[current] ? candidate : current;
}

function aggregate(results: QuestionResult[], field: "operationIds" | "historicalKnowledgeIds"): PedagogicalResultEntry[] {
  const statuses = new Map<string, ResultStatus>();
  for (const result of results) {
    const assessments = field === "operationIds" ? result.operationAssessments : result.historicalKnowledgeAssessments;
    const entries = assessments ?? result[field].map((id) => ({ id, status: result.status }));
    for (const { id, status } of entries) statuses.set(id, mostCautiousStatus(statuses.get(id), status));
  }
  return [...statuses].map(([id, status]) => ({ id, status }));
}

export function produceLocalStructuredSummary(
  state: PedagogicalSessionState,
  workbookReferences: WorkbookReference[],
  completedAt = new Date().toISOString(),
): PedagogicalSummary {
  const results = state.questionStates.flatMap(({ result }) => result ? [result] : []);
  const operationResults = aggregate(results, "operationIds");
  const historicalKnowledgeResults = aggregate(results, "historicalKnowledgeIds");
  const strengths = [...new Set(results.flatMap(({ observedStrengths }) => observedStrengths))];
  const consolidationTargets = [...new Set(results.flatMap(({ consolidationTargets }) => consolidationTargets))];
  const targetOperationIds = operationResults.filter(({ status }) => status !== "mastered").map(({ id }) => id);
  const targetHistoricalKnowledgeIds = historicalKnowledgeResults.filter(({ status }) => status !== "mastered").map(({ id }) => id);
  const recommendation = targetOperationIds.length || targetHistoricalKnowledgeIds.length ? {
    kind: "optional_consolidation" as const,
    targetOperationIds,
    targetHistoricalKnowledgeIds,
    label: "Reprends les éléments à consolider dans une courte activité ciblée.",
  } : undefined;

  return {
    sessionId: state.sessionId,
    activityId: state.activityId,
    notionId: state.notionId,
    encouragement: "Bravo, tu as terminé l’activité. Voici le bilan de ton travail.",
    strengths,
    consolidationTargets,
    operationResults,
    historicalKnowledgeResults,
    recommendation,
    workbookReferences: workbookReferences.filter(({ approvedByTeacher, historicalKnowledgeIds }) =>
      approvedByTeacher && historicalKnowledgeIds.some((id) => historicalKnowledgeResults.some((result) => result.id === id))),
    localDemoNotice: "",
    completedAt,
  };
}

export class LocalStructuredSummaryProducer implements SummaryProducer {
  async produce(state: PedagogicalSessionState, workbookReferences: WorkbookReference[]) {
    return produceLocalStructuredSummary(state, workbookReferences);
  }
}
