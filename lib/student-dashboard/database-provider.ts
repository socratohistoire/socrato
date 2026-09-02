import { getSocratoDatabase } from "../server/database.ts";
import { getActivityDashboardUrl, prioritizeDashboardActivities } from "./selection.ts";
import type { StudentDashboardProvider } from "./provider.ts";
import type { ActivityStatus, ActivitySummary, ActivityType, HistoricalKnowledge, IntellectualOperation, ProgressStatus, StudentActivity, StudentDashboardData } from "./types.ts";
import { canonicalHistoricalKnowledgeId, getHistoricalKnowledgeForNotion, HISTORICAL_KNOWLEDGE_CATALOG } from "./historical-knowledge-catalog.ts";
import { createCatalogLearningSessionQuestions } from "../student-learning-session/demo-provider.ts";
import type { StudentQuestionRuntimeProgress } from "../student-progress/types.ts";
import { getSharedStrengths, getSharedSummaryDetails } from "./shared-summary-details.ts";
import { activityTitleWithoutStudentIdentity } from "../activity-title.ts";

type ActivityRow = {
  id: string;
  title: string;
  work_type: ActivityType;
  notion_ids: string[];
  operation_id: string | null;
  published_at: Date;
  question_count: number;
  question_ids: string[];
  state: ActivityStatus | null;
  current_question_index: number | null;
  total_questions: number | null;
  operation_results: unknown;
  historical_knowledge_results: unknown;
  question_runtime: StudentQuestionRuntimeProgress[] | null;
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
const progressStatus = (value: unknown): ProgressStatus => value === "mastered" || value === "consolidate" || value === "needs_work" || value === "covered"
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

function cautiousKnowledgeStatus(left: ProgressStatus | undefined, right: ProgressStatus): ProgressStatus {
  const rank: Record<ProgressStatus, number> = { needs_work: 0, consolidate: 1, mastered: 2, covered: 3, not_assessed: 4 };
  return !left || rank[right] < rank[left] ? right : left;
}

function operationProcessAdvice(operationId: string, context = "") {
  if (/differences|similarities/iu.test(operationId)) return "Compare les deux éléments avec un même critère, formule la différence ou la similitude, puis appuie-la avec un fait historique précis.";
  if (/causes|consequences/iu.test(operationId)) return "Distingue ce qui explique la situation de ce qui en découle, puis formule explicitement le lien entre la cause et la conséquence.";
  if (/causal/iu.test(operationId)) return "Nomme la cause, explique le mécanisme qui relie les faits, puis formule la conséquence.";
  if (/changes|continuities/iu.test(operationId)) return "Compare le même aspect avant et après un repère précis, puis indique clairement ce qui change ou ce qui demeure.";
  if (/time|space/iu.test(operationId)) return "Associe chaque fait à un repère temporel ou géographique exact, puis vérifie leur ordre ou leur emplacement.";
  if (/relationships/iu.test(operationId)) return "Nomme les deux faits et explique précisément la relation qui les unit.";
  if (/deux|plusieurs|autre|encore|oubli|manqu/iu.test(context)) {
    return "Repère le nombre d’éléments demandé dans la consigne, puis prépare une réponse distincte pour chacun. Avant d’envoyer, compte tes éléments et vérifie que chacun est justifié par le document approprié.";
  }
  return "Sélectionne un fait historique exact et pertinent, formule-le dans tes propres mots, puis vérifie qu’il répond directement à la question.";
}

export function difficultyAsStatement(value: string) {
  const difficulty = value.trim();
  if (!difficulty.endsWith("?")) return difficulty;
  const sourceQuestion = difficulty.match(/^D’après\s+([^,]+),\s*qu’arrive-t-il à\s+(.+)\?$/iu);
  if (sourceQuestion) {
    return `Tu devais encore préciser ce qui arrive à ${sourceQuestion[2]}, en t’appuyant sur ${sourceQuestion[1]}.`;
  }
  const otherElement = difficulty.match(/^Quelle autre\s+(.+)\?$/iu);
  if (otherElement) return `Tu devais encore ajouter l’autre élément demandé par la consigne et le justifier avec le document pertinent.`;
  const namedAttribute = difficulty.match(/^Quel(?:le)?\s+est\s+((?:le|la|l’).+)\?$/iu);
  if (namedAttribute) return `Tu dois encore préciser ${namedAttribute[1].trim()}.`;
  const pluralElements = difficulty.match(/^Qu(?:els|elles)\s+sont\s+(?:le|la|les|l’)?\s*(.+)\?$/iu);
  if (pluralElements) return `Tu dois encore identifier précisément ${pluralElements[1].trim()}.`;
  if (/^Pourquoi\b/iu.test(difficulty)) return "Tu dois encore expliquer clairement la cause demandée et l’appuyer avec les faits ou les documents pertinents.";
  if (/^Comment\b/iu.test(difficulty)) return "Tu dois encore expliquer clairement le mécanisme ou la transformation demandée et l’appuyer avec les faits pertinents.";
  if (/^Combien\b/iu.test(difficulty)) return "Tu dois encore préciser le nombre demandé et identifier chacun des éléments concernés.";
  const causalActions = difficulty.match(/^(Quel|Quelle|Quels|Quelles)\s+(.+?)\s+(déclenche(?:nt)?|provoque(?:nt)?|entraîne(?:nt)?|mène(?:nt)?)\s+(.+)\?$/iu);
  if (causalActions) {
    const plural = /^Quels|Quelles$/iu.test(causalActions[1]);
    const subjectArticle = plural ? "les" : /^Quelle$/iu.test(causalActions[1]) ? "la" : "le";
    const consequence = causalActions[4].trim();
    const linkedConsequence = /^les\s+/iu.test(consequence) ? `aux ${consequence.replace(/^les\s+/iu, "")}`
      : /^le\s+/iu.test(consequence) ? `au ${consequence.replace(/^le\s+/iu, "")}`
        : /^la\s+/iu.test(consequence) ? `à la ${consequence.replace(/^la\s+/iu, "")}` : `à ${consequence}`;
    return `Tu dois encore préciser ${subjectArticle} ${causalActions[2].trim()} et expliquer comment ${plural ? "ces éléments conduisent" : "cet élément conduit"} ${linkedConsequence}.`;
  }
  if (/^Qu(?:el|elle|els|elles)\b/iu.test(difficulty)) return "Tu dois encore identifier précisément l’élément ou les éléments demandés par la consigne et les justifier avec le document pertinent.";
  return "Tu dois encore traiter précisément l’élément demandé par la consigne et le justifier avec les faits ou les documents pertinents.";
}

function operationTargetFromRuntime(row: ActivityRow, operations: IntellectualOperation[]) {
  const runtime = row.question_runtime ?? [];
  const questions = new Map(createCatalogLearningSessionQuestions(row.question_ids).questions.map((question) => [question.id, question]));
  const priority = runtime.find(({ questionId, attemptNumber, hintLevel, instructionOmissionObserved, lastAnalysis }) => {
    const question = questions.get(questionId);
    const operation = question ? operations.find(({ id }) => id === question.primaryOperationId) : undefined;
    return Boolean(operation && operation.status === "needs_work"
      && (attemptNumber > 1 || hintLevel > 0 || instructionOmissionObserved || lastAnalysis?.pedagogicalOutcome !== "satisfactory"));
  });
  if (!priority) return null;
  const question = questions.get(priority.questionId);
  if (!question) return null;
  const operation = operations.find(({ id }) => id === question.primaryOperationId);
  if (!operation || operation.status === "mastered" || operation.status === "consolidate") return null;
  const recordedError = priority.lastAnalysis?.missingElements?.at(-1) ?? priority.observedDifficulties?.at(-1);
  if (!recordedError) return null;
  // Certains replis techniques historiques ont enregistré une phrase passe-partout.
  // Dans ce cas, on repart de la consigne réelle afin que le bilan reste lié à
  // la question et à l’opération évaluée.
  const rawError = /identifier précisément l[’']élément ou les éléments demandés|ajoute un fait historique précis|explique clairement le lien avec ta réponse/iu.test(recordedError)
    ? question.prompt
    : recordedError;
  const achievement = priority.lastAnalysis?.observedStrengths.find((entry) => entry.trim().length >= 30
    && !/il (?:manque|reste)|tu dois|incorrect|inverse de ce que/iu.test(entry))?.trim();
  const namedSubjectMatch = rawError.match(/nom (du|de la|de l[’'])(.+?)(?:,\s*selon.+)?\?$/iu);
  const namedSubject = namedSubjectMatch
    ? `${namedSubjectMatch[1].toLocaleLowerCase("fr-CA") === "du" ? "le " : namedSubjectMatch[1].toLocaleLowerCase("fr-CA") === "de la" ? "la " : "l’"}${namedSubjectMatch[2].trim()}`
    : undefined;
  const namedObject = namedSubject?.startsWith("le ") ? `au ${namedSubject.slice(3)}`
    : namedSubject?.startsWith("la ") ? `à la ${namedSubject.slice(3)}`
      : namedSubject?.startsWith("l’") ? `à l’${namedSubject.slice(2)}` : undefined;
  const correction = namedObject
    ? `Il te reste à repérer dans l’extrait le nom donné ${namedObject}.`
    : difficultyAsStatement(rawError).replace(/^Tu dois encore/iu, "Il te reste à");
  const error = achievement ? `${achievement.replace(/[?.!]?$/u, ".")} ${correction}` : correction;
  const number = runtime.findIndex(({ questionId }) => questionId === priority.questionId) + 1;
  return {
    operationId: operation.id,
    entry: `${operation.label}\nDifficulté observée\n${error}\nComment travailler cette opération\n${operationProcessAdvice(operation.id, `${question.prompt} ${error}`)}`,
  };
}

function operationTargetFromLegacyEntry(entry: string | undefined, operations: IntellectualOperation[]) {
  if (!entry || (!entry.includes("\nQuestion\n") && !entry.includes("\nDifficulté observée\n") && !/^Reprendre le point essentiel\n/iu.test(entry))) return null;
  const savedTitle = entry.split("\n", 1)[0];
  const concernsDebtAndPopulation = /population/iu.test(entry) && /dette|mise en commun/iu.test(entry);
  const operationId = operations.find(({ label }) => label === savedTitle)?.id
    ?? (concernsDebtAndPopulation
    ? "causes_and_consequences"
    : /1840.+1841|1841.+1840|ordre chronologique/iu.test(entry)
      ? "time_and_space"
      : /compar|différence|similitude/iu.test(entry)
        ? "differences_and_similarities"
        : undefined);
  const operation = operations.find(({ id }) => id === operationId);
  if (!operation || operation.status === "mastered" || operation.status === "consolidate") return null;
  const questionMarker = entry.includes("\nDifficulté observée\n") ? "\nDifficulté observée\n" : "\nÀ vérifier\n";
  const progressMarker = entry.includes("\nComment travailler cette opération\n") ? "\nComment travailler cette opération\n" : "\nComment progresser\n";
  const verificationStart = entry.indexOf(questionMarker);
  const progressStart = entry.indexOf(progressMarker);
  let verification = verificationStart >= 0 && progressStart > verificationStart
    ? entry.slice(verificationStart + questionMarker.length, progressStart).trim()
    : entry.split("\n").slice(-1)[0];
  if (operation.id === "causes_and_consequences" && concernsDebtAndPopulation) {
    verification = "Tu as d’abord inversé les données des deux colonies et tu n’as pas relié cet écart financier à l’opposition du Canada-Est. La cause et la conséquence devaient être distinguées puis reliées explicitement.";
  }
  verification = difficultyAsStatement(verification);
  return {
    operationId: operation.id,
    entry: `${operation.label}\nDifficulté observée\n${verification}\nComment travailler cette opération\n${operationProcessAdvice(operation.id, entry)}`,
  };
}

function fallbackStrengthsFromRuntime(row: ActivityRow, operations: IntellectualOperation[]) {
  const runtime = [...(row.question_runtime ?? [])].reverse().find(({ status, lastAnalysis }) => status === "completed" && lastAnalysis?.pedagogicalOutcome === "satisfactory");
  if (!runtime) return ["Tu as persévéré jusqu’à compléter les opérations intellectuelles demandées."];
  const question = createCatalogLearningSessionQuestions(row.question_ids).questions.find(({ id }) => id === runtime.questionId);
  const operation = question ? operations.find(({ id }) => id === question.primaryOperationId) : undefined;
  const title = operation?.label ?? "Faire progresser ton raisonnement historique";
  const observation = runtime.lastAnalysis?.observedStrengths.find((entry) => entry.trim().length > 20)
    ?? `Après avoir repris ton raisonnement, tu as réussi à appliquer cette opération avec des faits historiques pertinents.`;
  return [`${title}\n${observation}`];
}

function consolidationProgress(value: unknown): ActivitySummary["consolidationProgress"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (!["improving", "consolidated", "continue"].includes(String(item.state))
    || !["socrato_proposed", "teacher_assigned"].includes(String(item.source))
    || ![item.completedAt, item.previousLevel, item.currentLevel, item.observation].every((entry) => typeof entry === "string")) return null;
  return {
    state: item.state as "improving" | "consolidated" | "continue",
    source: item.source as "socrato_proposed" | "teacher_assigned",
    completedAt: formatDate(new Date(item.completedAt as string)),
    previousLevel: item.previousLevel as string,
    currentLevel: item.currentLevel as string,
    observation: item.observation as string,
    strategyKey: typeof item.strategyKey === "string" ? item.strategyKey : undefined,
    strategyLabel: typeof item.strategyLabel === "string" ? item.strategyLabel : undefined,
    attemptNumber: Number.isInteger(item.attemptNumber) ? item.attemptNumber as number : undefined,
    targetOperationId: typeof item.targetOperationId === "string" ? item.targetOperationId : undefined,
  };
}

function toStudentActivity(row: ActivityRow): StudentActivity {
  const parsedOutcome = jsonValue(row.outcome_summary);
  const outcome = parsedOutcome && typeof parsedOutcome === "object" ? parsedOutcome as Record<string, unknown> : null;
  const effectiveState: ActivityStatus = outcome ? "completed" : row.state ?? "not_started";
  const total = row.total_questions ?? row.question_count;
  const current = row.current_question_index ?? 0;
  const percentage = effectiveState === "completed" ? 100 : total > 0 ? Math.min(99, Math.round((current / total) * 100)) : 0;
  const notionId = row.notion_ids[0] ?? "acte-union";
  const params = new URLSearchParams({ notion: notionId, mode: "teacher-assigned" });
  const recordedHistoricalKnowledge = row.question_runtime?.length ? [] : knowledgeResults(row.historical_knowledge_results);
  const recordedKnowledgeById = new Map<string, HistoricalKnowledge>();
  for (const item of recordedHistoricalKnowledge) {
    const id = canonicalHistoricalKnowledgeId(item.id);
    const previous = recordedKnowledgeById.get(id);
    recordedKnowledgeById.set(id, { ...item, id, status: cautiousKnowledgeStatus(previous?.status, item.status) });
  }
  const questionsById = new Map(createCatalogLearningSessionQuestions(row.question_ids).questions.map((question) => [question.id, question]));
  for (const runtime of row.question_runtime ?? []) {
    if (runtime.status !== "completed") continue;
    const question = questionsById.get(runtime.questionId);
    if (!question) continue;
    const analysis = runtime.lastAnalysis;
    for (const rawId of question.historicalKnowledgeIds) {
      const id = canonicalHistoricalKnowledgeId(rawId);
      const demonstrated = analysis?.demonstratedKnowledgeIds.some((candidate) => canonicalHistoricalKnowledgeId(candidate) === id) ?? false;
      const status: ProgressStatus = !demonstrated ? "covered"
        : analysis?.historicalAccuracy === "demonstrated" ? runtime.attemptNumber <= 1 && runtime.hintLevel === 0 ? "mastered" : "consolidate"
        : analysis?.historicalAccuracy === "partial" ? "consolidate" : "needs_work";
      const previous = recordedKnowledgeById.get(id);
      recordedKnowledgeById.set(id, { id, label: previous?.label ?? id, status: cautiousKnowledgeStatus(previous?.status, status) });
    }
  }
  let historicalKnowledge = getHistoricalKnowledgeForNotion(HISTORICAL_KNOWLEDGE_CATALOG, notionId).map(({ id, label }) => {
    const recorded = recordedKnowledgeById.get(id);
    return recorded ? { ...recorded, label } : { id, label, status: "not_assessed" as const };
  });
  for (const item of recordedKnowledgeById.values()) {
    if (!historicalKnowledge.some(({ id }) => id === item.id)) historicalKnowledge.push(item);
  }
  const outcomeStrings = (key: string) => outcome && Array.isArray(outcome[key]) ? outcome[key].filter((value): value is string => typeof value === "string") : [];
  let operations = operationResults(row.operation_results, row.operation_id);
  const summaryDetails = getSharedSummaryDetails({
    consolidationTargets: outcomeStrings("consolidationTargets"),
    readingAdvice: typeof outcome?.readingAdvice === "string" ? outcome.readingAdvice : undefined,
    questionRuntime: row.question_runtime,
    genericResultLabels: [...operations, ...historicalKnowledge].map(({ label }) => label),
  });
  const legacyOperationTarget = operationTargetFromLegacyEntry(summaryDetails.consolidationTargets[0], operations);
  const runtimeOperationTarget = operationTargetFromRuntime(row, operations) ?? legacyOperationTarget;
  if (runtimeOperationTarget) summaryDetails.consolidationTargets = [runtimeOperationTarget.entry];
  else if (!operations.some(({ status }) => status === "needs_work")) summaryDetails.consolidationTargets = [];
  const recommendation = outcome?.recommendation && typeof outcome.recommendation === "object" && "label" in outcome.recommendation && typeof outcome.recommendation.label === "string" ? outcome.recommendation.label : null;
  let recommendedOperationIds = outcome?.recommendation && typeof outcome.recommendation === "object" && "targetOperationIds" in outcome.recommendation && Array.isArray(outcome.recommendation.targetOperationIds)
    ? outcome.recommendation.targetOperationIds.filter((id): id is string => typeof id === "string") : [];
  if (runtimeOperationTarget) recommendedOperationIds = [runtimeOperationTarget.operationId, ...recommendedOperationIds.filter((id) => id !== runtimeOperationTarget.operationId)];
  const recommendedHistoricalKnowledgeIds = outcome?.recommendation && typeof outcome.recommendation === "object" && "targetHistoricalKnowledgeIds" in outcome.recommendation && Array.isArray(outcome.recommendation.targetHistoricalKnowledgeIds)
    ? outcome.recommendation.targetHistoricalKnowledgeIds.filter((id): id is string => typeof id === "string") : [];
  const savedConsolidationProgress = consolidationProgress(outcome?.consolidationProgress);
  // Une réponse encore insatisfaisante au troisième essai demeure prioritaire,
  // même si l’analyse avait reconnu une partie de l’opération ou des connaissances.
  for (const runtime of row.question_runtime ?? []) {
    if (runtime.attemptNumber < 3 || runtime.lastAnalysis?.pedagogicalOutcome === "satisfactory") continue;
    const question = questionsById.get(runtime.questionId);
    if (!question) continue;
    operations = operations.map((item) => item.id === question.primaryOperationId ? { ...item, status: "needs_work" } : item);
    for (const rawId of question.historicalKnowledgeIds) {
      const id = canonicalHistoricalKnowledgeId(rawId);
      const previous = recordedKnowledgeById.get(id);
      if (previous) recordedKnowledgeById.set(id, { ...previous, status: "needs_work" });
      historicalKnowledge = historicalKnowledge.map((item) => item.id === id ? { ...item, status: "needs_work" } : item);
    }
  }
  // Une consolidation réussie règle ensuite la difficulté ciblée, sans effacer
  // les autres difficultés persistantes de l’activité initiale.
  if (savedConsolidationProgress?.state === "consolidated" && savedConsolidationProgress.targetOperationId) {
    operations = operations.map((item) => item.id === savedConsolidationProgress.targetOperationId ? { ...item, status: "mastered" } : item);
  }
  const persistentRuntimeTarget = operationTargetFromRuntime(row, operations);
  if (persistentRuntimeTarget) {
    summaryDetails.consolidationTargets = [persistentRuntimeTarget.entry];
    recommendedOperationIds = [
      persistentRuntimeTarget.operationId,
      ...recommendedOperationIds.filter((id) => id !== persistentRuntimeTarget.operationId),
    ];
  }
  // La fiche enseignante et le bilan élève utilisent exactement la même sélection.
  const strengths = getSharedStrengths({
    savedStrengths: outcomeStrings("strengths"),
    questionRuntime: row.question_runtime,
    questionIds: row.question_ids,
    operationLabels: operationTitles,
  });
  return {
    id: row.id,
    activityTitle: activityTitleWithoutStudentIdentity(row.title),
    activityType: row.work_type,
    publicationDate: formatDate(row.published_at),
    historicalPeriod: notionId === "acte-union" ? { startYear: 1840, endYear: 1896 } : { displayLabel: "Histoire du Québec et du Canada" },
    notionIds: row.notion_ids,
    historicalKnowledgeIds: historicalKnowledge.map(({ id }) => id),
    durationMinutes: 0,
    progressPercentage: percentage,
    activityStatus: effectiveState,
    origin: "teacher_assigned",
    isRecent: false,
    actionHref: effectiveState === "completed" ? `${getActivityDashboardUrl(row.id)}#bilan` : `/eleve/activite/${encodeURIComponent(row.id)}?${params.toString()}`,
    operations,
    historicalKnowledge,
    summary: outcome ? { state: "server_structured", strengths, consolidationTargets: summaryDetails.consolidationTargets, readingAdvice: summaryDetails.readingAdvice, recommendation, consolidationActivity: recommendation, recommendedOperationIds, recommendedHistoricalKnowledgeIds, consolidationProgress: savedConsolidationProgress } : { state: "pending", strengths: [], consolidationTargets: [], recommendation: null, consolidationActivity: null, consolidationProgress: null },
  };
}

export class DatabaseStudentDashboardProvider implements StudentDashboardProvider {
  async getForAnonymousStudent(anonymousStudentId: string, requestedActivityId?: string): Promise<StudentDashboardData> {
    const sql = getSocratoDatabase();
    const rows = await sql<ActivityRow[]>`
      select distinct on (a.id) a.id, a.title, a.work_type, a.notion_ids, a.operation_id, a.question_ids, a.published_at,
        cardinality(a.question_ids)::int as question_count, p.state, p.current_question_index, p.total_questions,
        p.operation_results, p.historical_knowledge_results, p.question_runtime, p.outcome_summary
      from socrato.group_memberships gm
      join socrato.groups g on g.id = gm.group_id and g.archived_at is null
      join socrato.activity_group_assignments aga on aga.group_id = g.id
      join socrato.activities a on a.id = aga.activity_id and a.publication_status = ${"published"}
      left join lateral (
        select sp.state, sp.current_question_index, sp.total_questions, sp.operation_results, sp.historical_knowledge_results, sp.question_runtime,
          outcomes.summary as outcome_summary
        from socrato.student_progress sp
        left join socrato.student_outcomes outcomes on outcomes.session_id = sp.session_id
        where sp.student_id = ${anonymousStudentId} and sp.activity_id = a.id and sp.group_id = g.id
        order by sp.updated_at desc limit 1
      ) p on true
      where gm.student_id = ${anonymousStudentId} and gm.active = true
        and (aga.id not like 'personal-%' or aga.id = 'personal-' || a.id || '-' || ${anonymousStudentId})
      order by a.id, a.published_at desc
    `;
    const chronologicallySortedActivities = [...rows]
      .sort((left, right) => new Date(right.published_at).getTime() - new Date(left.published_at).getTime())
      .map((row, index) => ({ ...toStudentActivity(row), isRecent: index === 0 }));
    const activities = prioritizeDashboardActivities(chronologicallySortedActivities);
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
