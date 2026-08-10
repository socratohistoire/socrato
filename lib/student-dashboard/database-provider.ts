import { getSocratoDatabase } from "../server/database.ts";
import { getActivityDashboardUrl } from "./selection.ts";
import type { StudentDashboardProvider } from "./provider.ts";
import type { ActivityStatus, ActivityType, HistoricalKnowledge, IntellectualOperation, ProgressStatus, StudentActivity, StudentDashboardData } from "./types.ts";
import { getHistoricalKnowledgeForNotion, HISTORICAL_KNOWLEDGE_CATALOG } from "./historical-knowledge-catalog.ts";

type ActivityRow = {
  id: string;
  title: string;
  work_type: ActivityType;
  notion_ids: string[];
  operation_id: string | null;
  published_at: Date;
  question_count: number;
  state: ActivityStatus | null;
  current_question_index: number | null;
  total_questions: number | null;
  operation_results: unknown;
  historical_knowledge_results: unknown;
  outcome_summary: unknown;
};

const notionTitles: Record<string, string> = { "acte-union": "Acte d’union", industrialisation: "Industrialisation" };
const operationTitles: Record<string, string> = {
  time_and_space: "Situer dans le temps et dans l’espace",
  establish_facts: "Établir des faits",
  differences_and_similarities: "Dégager des différences et des similitudes",
  causes_and_consequences: "Déterminer des causes et des conséquences",
  causal_connections: "Établir des liens de causalité",
  relationships_between_facts: "Mettre en relation des faits",
  changes_and_continuities: "Déterminer des changements et des continuités",
};
const formatDate = (value: Date) => new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Toronto" }).format(new Date(value));
const progressStatus = (value: unknown): ProgressStatus => value === "mastered" || value === "consolidate" || value === "needs_work"
  ? value
  : value === "to_consolidate"
    ? "consolidate"
    : value === "to_work_on"
      ? "needs_work"
      : "not_assessed";
const jsonValue = (value: unknown) => {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value) as unknown; } catch { return value; }
};

function operationResults(value: unknown, fallbackId: string | null): IntellectualOperation[] {
  value = jsonValue(value);
  if (Array.isArray(value)) return value.flatMap((item) => typeof item === "object" && item !== null && "id" in item && typeof item.id === "string" ? [{ id: item.id, label: "label" in item && typeof item.label === "string" ? item.label : operationTitles[item.id] ?? item.id, status: progressStatus("status" in item ? item.status : undefined) }] : []);
  return fallbackId ? [{ id: fallbackId, label: operationTitles[fallbackId] ?? fallbackId, status: "not_assessed" }] : [];
}

function knowledgeResults(value: unknown): HistoricalKnowledge[] {
  value = jsonValue(value);
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => typeof item === "object" && item !== null && "id" in item && typeof item.id === "string" ? [{ id: item.id, label: "label" in item && typeof item.label === "string" ? item.label : notionTitles[item.id] ?? item.id, status: progressStatus("status" in item ? item.status : undefined) }] : []);
}

function toStudentActivity(row: ActivityRow): StudentActivity {
  const total = row.total_questions ?? row.question_count;
  const current = row.current_question_index ?? 0;
  const percentage = row.state === "completed" ? 100 : total > 0 ? Math.min(99, Math.round((current / total) * 100)) : 0;
  const notionId = row.notion_ids[0] ?? "acte-union";
  const params = new URLSearchParams({ notion: notionId, mode: "teacher-assigned" });
  const recordedHistoricalKnowledge = knowledgeResults(row.historical_knowledge_results);
  const recordedKnowledgeById = new Map(recordedHistoricalKnowledge.map((item) => [item.id, item]));
  const historicalKnowledge = getHistoricalKnowledgeForNotion(HISTORICAL_KNOWLEDGE_CATALOG, notionId).map(({ id, label }) =>
    recordedKnowledgeById.get(id) ?? { id, label, status: "not_assessed" as const });
  for (const item of recordedHistoricalKnowledge) {
    if (!historicalKnowledge.some(({ id }) => id === item.id)) historicalKnowledge.push(item);
  }
  const parsedOutcome = jsonValue(row.outcome_summary);
  const outcome = parsedOutcome && typeof parsedOutcome === "object" ? parsedOutcome as Record<string, unknown> : null;
  const outcomeStrings = (key: string) => outcome && Array.isArray(outcome[key]) ? outcome[key].filter((value): value is string => typeof value === "string") : [];
  const recommendation = outcome?.recommendation && typeof outcome.recommendation === "object" && "label" in outcome.recommendation && typeof outcome.recommendation.label === "string" ? outcome.recommendation.label : null;
  return {
    id: row.id,
    activityTitle: row.title,
    activityType: row.work_type,
    publicationDate: formatDate(row.published_at),
    historicalPeriod: notionId === "acte-union" ? { startYear: 1840, endYear: 1896 } : { displayLabel: "Histoire du Québec et du Canada" },
    notionIds: row.notion_ids,
    historicalKnowledgeIds: historicalKnowledge.map(({ id }) => id),
    durationMinutes: 0,
    progressPercentage: percentage,
    activityStatus: row.state ?? "not_started",
    origin: "teacher_assigned",
    isRecent: true,
    actionHref: row.state === "completed" ? `${getActivityDashboardUrl(row.id)}#bilan` : `/eleve/activite/${encodeURIComponent(row.id)}?${params.toString()}`,
    operations: operationResults(row.operation_results, row.operation_id),
    historicalKnowledge,
    summary: outcome ? { state: "server_structured", strengths: outcomeStrings("strengths").length ? outcomeStrings("strengths") : ["Tu as mené l’activité jusqu’à son terme et mobilisé les démarches demandées."], consolidationTargets: outcomeStrings("consolidationTargets").length ? outcomeStrings("consolidationTargets") : ["Continue à justifier tes réponses avec des faits historiques précis."], recommendation, consolidationActivity: recommendation, consolidationProgress: null } : { state: "pending", strengths: [], consolidationTargets: [], recommendation: null, consolidationActivity: null, consolidationProgress: null },
  };
}

export class DatabaseStudentDashboardProvider implements StudentDashboardProvider {
  async getForAnonymousStudent(anonymousStudentId: string, requestedActivityId?: string): Promise<StudentDashboardData> {
    const sql = getSocratoDatabase();
    const rows = await sql<ActivityRow[]>`
      select distinct on (a.id) a.id, a.title, a.work_type, a.notion_ids, a.operation_id, a.published_at,
        cardinality(a.question_ids)::int as question_count, p.state, p.current_question_index, p.total_questions,
        p.operation_results, p.historical_knowledge_results, p.outcome_summary
      from socrato.group_memberships gm
      join socrato.groups g on g.id = gm.group_id and g.archived_at is null
      join socrato.activity_group_assignments aga on aga.group_id = g.id
      join socrato.activities a on a.id = aga.activity_id and a.publication_status = ${"published"}
      left join lateral (
        select sp.state, sp.current_question_index, sp.total_questions, sp.operation_results, sp.historical_knowledge_results,
          outcomes.summary as outcome_summary
        from socrato.student_progress sp
        left join socrato.student_outcomes outcomes on outcomes.session_id = sp.session_id
        where sp.student_id = ${anonymousStudentId} and sp.activity_id = a.id and sp.group_id = g.id
        order by sp.updated_at desc limit 1
      ) p on true
      where gm.student_id = ${anonymousStudentId} and gm.active = true
      order by a.id, a.published_at desc
    `;
    const activities = rows.map(toStudentActivity).sort((left, right) => right.publicationDate.localeCompare(left.publicationDate));
    const defaultActivityId = activities[0]?.id ?? "";
    const selectedActivityId = requestedActivityId && activities.some(({ id }) => id === requestedActivityId) ? requestedActivityId : defaultActivityId;
    const notionIds = [...new Set(activities.flatMap(({ notionIds: ids }) => ids))];
    return {
      source: "server",
      defaultActivityId,
      selectedActivityId,
      activities,
      notions: notionIds.map((id) => ({ id, title: notionTitles[id] ?? id, description: "Notion assignée par l’enseignant.", historicalPeriod: id === "acte-union" ? { startYear: 1840, endYear: 1896 } : { displayLabel: "Histoire du Québec et du Canada" } })),
    };
  }
}
