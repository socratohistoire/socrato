import { getSocratoDatabase } from "./database";
import type { TeacherActor } from "../authentication/teacher-session";
import type { TeacherGroupDetailRecord } from "../teacher-group-detail/types";
import { INTELLECTUAL_OPERATIONS } from "../pedagogical-reference/intellectual-operations";
import { canonicalHistoricalKnowledgeId, HISTORICAL_KNOWLEDGE_CATALOG } from "../student-dashboard/historical-knowledge-catalog";
import { createCatalogLearningSessionQuestions } from "../student-learning-session/demo-provider";
import type { StudentQuestionRuntimeProgress } from "../student-progress/types";
import { assessStudentPriority } from "./student-priority";
import { compareStudentsByFamilyName } from "../student-display-order";
import { decryptStudentAccessCode } from "../student-access/code-encryption";
import { getSharedStrengths, getSharedSummaryDetails } from "../student-dashboard/shared-summary-details";
import { activityTitleWithoutStudentIdentity } from "../activity-title";
import { getConsolidationStrategyKey } from "../student-dashboard/selection";

export type StoredStudentResultStatus = "mastered" | "consolidate" | "needs_work" | "covered";
export type StoredStudentResult = { id: string; label: string; status: StoredStudentResultStatus };

export type StoredTeacherGroupSummary = { id: string; name: string; studentCount: number };
export type StoredTeacherStudentDetail = {
  id: string;
  displayLabel: string;
  groupId: string;
  groupName: string;
  assignedActivityTitle: string | null;
  activityState: "completed" | "in_progress" | "not_started";
  progressPercentage: number;
  strengths: string[];
  consolidationTargets: string[];
  operations: StoredStudentResult[];
  historicalKnowledge: StoredStudentResult[];
  teacher: TeacherActor;
  groups: StoredTeacherGroupSummary[];
};

function parseSummary(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    try { value = JSON.parse(value) as unknown; } catch { return null; }
  }
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function summaryStrings(value: unknown, key: string) {
  const summary = parseSummary(value);
  return summary && Array.isArray(summary[key]) ? summary[key].filter((item): item is string => typeof item === "string") : [];
}

function summaryText(value: unknown, key: string) {
  const summary = parseSummary(value);
  return summary && typeof summary[key] === "string" ? summary[key] : undefined;
}

function consolidatedStrategyKey(value: unknown) {
  const summary = parseSummary(value);
  const progress = summary?.consolidationProgress;
  if (!progress || typeof progress !== "object" || Array.isArray(progress)) return undefined;
  const item = progress as Record<string, unknown>;
  return item.state === "consolidated" && typeof item.strategyKey === "string" ? item.strategyKey : undefined;
}

function resultStatus(value: unknown): StoredStudentResultStatus | null {
  if (value === "mastered") return "mastered";
  if (value === "to_consolidate" || value === "consolidate") return "consolidate";
  if (value === "to_work_on" || value === "needs_work") return "needs_work";
  if (value === "covered") return "covered";
  return null;
}

function storedResults(value: unknown, labels: Map<string, string>): StoredStudentResult[] {
  if (typeof value === "string") {
    try { value = JSON.parse(value) as unknown; } catch { return []; }
  }
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const result = item as Record<string, unknown>;
    const status = resultStatus(result.status);
    if (typeof result.id !== "string" || !status) return [];
    const label = typeof result.label === "string" ? result.label : labels.get(result.id);
    return label ? [{ id: result.id, label, status }] : [];
  });
}

function mergeStoredResult(target: Map<string, StoredStudentResult>, item: StoredStudentResult) {
  const rank: Record<StoredStudentResultStatus, number> = { needs_work: 0, consolidate: 1, mastered: 2, covered: 3 };
  const previous = target.get(item.id);
  if (!previous || rank[item.status] < rank[previous.status]) target.set(item.id, item);
}

export async function listStoredTeacherGroups(teacherId: string): Promise<StoredTeacherGroupSummary[]> {
  try {
    const sql = getSocratoDatabase();
    const rows = await sql<{ id: string; name: string; student_count: number }[]>`
      select g.id, g.display_name as name, count(gm.student_id)::int as student_count
      from socrato.groups g
      left join socrato.group_memberships gm on gm.group_id = g.id and gm.active = true
      where g.teacher_id = ${teacherId} and g.archived_at is null
      group by g.id, g.display_name, g.created_at
      order by g.created_at asc
    `;
    return rows.map((row) => ({ id: row.id, name: row.name, studentCount: row.student_count }));
  } catch { return []; }
}

export async function getStoredTeacherGroupIdentity(teacherId: string, groupId: string) {
  const sql = getSocratoDatabase();
  const rows = await sql<{ id: string; name: string }[]>`
    select g.id, g.display_name as name
    from socrato.groups g
    where g.id = ${groupId} and g.teacher_id = ${teacherId} and g.archived_at is null
    limit 1
  `;
  return rows[0] ?? null;
}

export async function listStoredGroupStudentAliases(teacherId: string, groupId: string) {
  try {
    const sql = getSocratoDatabase();
    const rows = await sql<{ alias: string; encrypted_code: string | null }[]>`
      select s.display_alias as alias, credentials.encrypted_code from socrato.students s
      join socrato.group_memberships gm on gm.student_id = s.id and gm.active = true
      join socrato.groups g on g.id = gm.group_id and g.archived_at is null
      left join lateral (select encrypted_code from socrato.student_access_credentials where student_id = s.id and status = 'active' order by created_at desc limit 1) credentials on true
      where g.id = ${groupId} and g.teacher_id = ${teacherId} and s.archived_at is null
    `;
    return rows.map(({ alias, encrypted_code }) => ({ alias, code: decryptStudentAccessCode(encrypted_code) })).sort((a, b) => (a.alias.split(/\s+/).at(-1) ?? "").localeCompare(b.alias.split(/\s+/).at(-1) ?? "", "fr-CA", { sensitivity: "base" }));
  } catch { return []; }
}

export async function getStoredTeacherGroupDetail(teacher: TeacherActor, groupId: string): Promise<TeacherGroupDetailRecord | null> {
  try {
    const sql = getSocratoDatabase();
    const groups = await listStoredTeacherGroups(teacher.id);
    const group = groups.find((item) => item.id === groupId);
    if (!group) return null;
    const activities = await sql<{ id: string; title: string }[]>`
      select a.id, a.title
      from socrato.activity_group_assignments aga
      join socrato.activities a on a.id = aga.activity_id
      where aga.group_id = ${groupId} and a.teacher_id = ${teacher.id} and a.publication_status = 'published'
        and aga.id not like 'personal-%'
      order by a.published_at desc
      limit 1
    `;
    const activity = activities[0] ?? null;
    const students = await sql<{ id: string; display_alias: string; activity_state: "completed" | "in_progress" | "not_started" | null; current_question_index: number | null; total_questions: number | null; outcome_summary: unknown; operation_results: unknown; historical_knowledge_results: unknown; question_runtime: StudentQuestionRuntimeProgress[] | null }[]>`
      select s.id, s.display_alias, progress.state as activity_state,
        progress.current_question_index, progress.total_questions, progress.outcome_summary,
        progress.operation_results, progress.historical_knowledge_results, progress.question_runtime
      from socrato.students s
      join socrato.group_memberships gm on gm.student_id = s.id and gm.active = true
      join socrato.groups g on g.id = gm.group_id
      left join lateral (
        select sp.state, sp.current_question_index, sp.total_questions, sp.operation_results,
          sp.historical_knowledge_results, sp.question_runtime, outcomes.summary as outcome_summary
        from socrato.student_progress sp
        left join socrato.student_outcomes outcomes on outcomes.session_id = sp.session_id
        where sp.student_id = s.id and sp.group_id = g.id
          and sp.activity_id = ${activity?.id ?? "no-activity"}
        order by sp.updated_at desc
        limit 1
      ) progress on true
      where g.id = ${groupId} and g.teacher_id = ${teacher.id} and s.archived_at is null
      order by s.display_alias asc
    `;
    const completedStudentCount = students.filter(({ activity_state }) => activity_state === "completed").length;
    const startedStudentCount = students.filter(({ activity_state }) => activity_state === "in_progress").length;
    const initials = teacher.displayName.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
    return {
      source: "server", activityId: activity?.id ?? "no-activity", activityTitle: activity?.title ?? "Aucune activité en cours", groupId, groupName: group.name,
      completedStudentCount, targetedStudentCount: students.length,
      socratoSummary: activity
        ? { mastery: completedStudentCount > 0 ? `${completedStudentCount} élève${completedStudentCount > 1 ? "s ont" : " a"} terminé l’activité.` : startedStudentCount > 0 ? `${startedStudentCount} élève${startedStudentCount > 1 ? "s ont" : " a"} commencé l’activité.` : "Aucun élève n’a encore commencé l’activité.", mainChallenge: "Les résultats apparaîtront au fur et à mesure de la participation." }
        : { mastery: "Aucun résultat disponible pour le moment.", mainChallenge: "Créez une première activité pour commencer le suivi de ce groupe." },
      teacher: { displayLabel: teacher.displayName, roleLabel: teacher.email ?? "Compte enseignant", initials }, groups,
      students: students.map((student) => {
        const consolidatedKey = consolidatedStrategyKey(student.outcome_summary);
        const primaryTarget = summaryStrings(student.outcome_summary, "consolidationTargets")
          .find((target) => getConsolidationStrategyKey(target) !== consolidatedKey);
        const savedReadingAdvice = summaryText(student.outcome_summary, "readingAdvice");
        const omissionWasObserved = student.question_runtime?.some((runtime) =>
          [...(runtime.omittedInstructionElements ?? []), ...(runtime.observedDifficulties ?? [])]
            .some((detail) => /\b(deuxième|second(?:e)?|élément manquant|oubli(?:é)?|n['’]a pas été|pas (?:été )?(?:expliqué|nommé|indiqué|traité)|ne répond pas à|partie de la consigne)\b/iu.test(detail))) ?? false;
        const readingAdvice = savedReadingAdvice && getConsolidationStrategyKey(savedReadingAdvice) !== consolidatedKey
          && (!/^Décomposer la consigne\n/iu.test(savedReadingAdvice) || omissionWasObserved) ? savedReadingAdvice : undefined;
        const assessment = primaryTarget || readingAdvice
          ? assessStudentPriority(student.operation_results, student.historical_knowledge_results)
          : { level: "normal" as const, reason: "Aucune intervention prioritaire n’est requise pour le moment." };
        const priorityLabel = (primaryTarget ?? readingAdvice)?.split("\n", 1)[0]?.trim().replace(/[.!?]+$/u, "");
        const completedDifficulty = priorityLabel ? `À retravailler : ${priorityLabel}.` : assessment.reason;
        return ({
        id: student.id,
        displayLabel: student.display_alias,
        activityState: student.activity_state ?? "not_started",
        priority: assessment.level,
        mainDifficulty: student.activity_state === "completed" ? completedDifficulty : student.activity_state === "in_progress" ? "Bilan en préparation" : "Aucun résultat disponible",
        progressPercentage: student.activity_state === "completed" ? 100 : student.total_questions ? Math.min(99, Math.round(((student.current_question_index ?? 0) / student.total_questions) * 100)) : 0,
        studentDetailHref: `/teacher/groups/${encodeURIComponent(groupId)}/students/${encodeURIComponent(student.id)}`,
      }); }).sort(compareStudentsByFamilyName),
    };
  } catch { return null; }
}

export async function getStoredTeacherStudentDetail(teacher: TeacherActor, groupId: string, studentId: string): Promise<StoredTeacherStudentDetail | null> {
  try {
    const sql = getSocratoDatabase();
    const rows = await sql<{ student_id: string; display_alias: string; group_id: string; group_name: string; activity_id: string | null; activity_title: string | null; activity_notion_ids: string[] | null; question_ids: string[] | null; activity_state: "completed" | "in_progress" | "not_started" | null; current_question_index: number | null; total_questions: number | null; operation_results: unknown; historical_knowledge_results: unknown; question_runtime: StudentQuestionRuntimeProgress[] | null; outcome_summary: unknown }[]>`
      select s.id as student_id, s.display_alias, g.id as group_id, g.display_name as group_name,
        activity.id as activity_id, activity.title as activity_title, activity.notion_ids as activity_notion_ids, activity.question_ids, activity.activity_state,
        activity.current_question_index, activity.total_questions, activity.operation_results,
        activity.historical_knowledge_results, activity.question_runtime, activity.outcome_summary
      from socrato.students s
      join socrato.group_memberships gm on gm.student_id = s.id and gm.active = true
      join socrato.groups g on g.id = gm.group_id and g.archived_at is null
      left join lateral (
        select a.id, a.title, a.notion_ids, a.question_ids, sp.state as activity_state, sp.current_question_index, sp.total_questions,
          sp.operation_results, sp.historical_knowledge_results, sp.question_runtime, outcomes.summary as outcome_summary
        from socrato.activity_group_assignments aga
        join socrato.activities a on a.id = aga.activity_id
        left join socrato.student_progress sp on sp.activity_id = a.id and sp.student_id = s.id and sp.group_id = g.id
        left join socrato.student_outcomes outcomes on outcomes.session_id = sp.session_id
        where aga.group_id = g.id and a.teacher_id = ${teacher.id} and a.publication_status = 'published'
          and (aga.id not like 'personal-%' or aga.id = 'personal-' || a.id || '-' || s.id)
        order by (outcomes.summary is not null) desc, sp.completed_at desc nulls last, sp.updated_at desc nulls last, a.published_at desc
        limit 1
      ) activity on true
      where s.id = ${studentId} and g.id = ${groupId} and g.teacher_id = ${teacher.id} and s.archived_at is null
      limit 1
    `;
    const student = rows[0];
    if (!student) return null;
    const operationLabels = new Map(INTELLECTUAL_OPERATIONS.map(({ id, officialLabel }) => [id, officialLabel]));
    const knowledgeLabels = new Map((student.activity_notion_ids ?? []).flatMap((notionId) => HISTORICAL_KNOWLEDGE_CATALOG[notionId] ?? []).map(({ id, label }) => [id, label]));
    const knowledge = new Map<string, StoredStudentResult>();
    for (const item of student.question_runtime?.length ? [] : storedResults(student.historical_knowledge_results, knowledgeLabels)) {
      const id = canonicalHistoricalKnowledgeId(item.id);
      mergeStoredResult(knowledge, { ...item, id, label: knowledgeLabels.get(id) ?? item.label });
    }
    const questions = new Map(createCatalogLearningSessionQuestions(student.question_ids ?? []).questions.map((question) => [question.id, question]));
    for (const runtime of student.question_runtime ?? []) {
      if (runtime.status !== "completed") continue;
      const question = questions.get(runtime.questionId);
      if (!question) continue;
      for (const rawId of question.historicalKnowledgeIds) {
        const id = canonicalHistoricalKnowledgeId(rawId);
        const demonstrated = runtime.lastAnalysis?.demonstratedKnowledgeIds.some((candidate) => canonicalHistoricalKnowledgeId(candidate) === id) ?? false;
        const status: StoredStudentResultStatus = !demonstrated ? "covered"
          : runtime.lastAnalysis?.historicalAccuracy === "demonstrated" ? runtime.attemptNumber <= 1 && runtime.hintLevel === 0 ? "mastered" : "consolidate"
          : runtime.lastAnalysis?.historicalAccuracy === "partial" ? "consolidate" : "needs_work";
        mergeStoredResult(knowledge, { id, label: knowledgeLabels.get(id) ?? id, status });
      }
    }
    const operations = storedResults(student.operation_results, operationLabels);
    const summaryDetails = getSharedSummaryDetails({
      consolidationTargets: summaryStrings(student.outcome_summary, "consolidationTargets"),
      readingAdvice: summaryText(student.outcome_summary, "readingAdvice") ?? undefined,
      questionRuntime: student.question_runtime,
      genericResultLabels: [...operations, ...knowledge.values()].map(({ label }) => label),
    });
    const consolidatedKey = consolidatedStrategyKey(student.outcome_summary);
    return {
      id: student.student_id,
      displayLabel: student.display_alias,
      groupId: student.group_id,
      groupName: student.group_name,
      assignedActivityTitle: student.activity_title ? activityTitleWithoutStudentIdentity(student.activity_title) : null,
      activityState: student.activity_state ?? "not_started",
      progressPercentage: student.activity_state === "completed" ? 100 : student.total_questions ? Math.min(99, Math.round(((student.current_question_index ?? 0) / student.total_questions) * 100)) : 0,
      strengths: getSharedStrengths({
        savedStrengths: summaryStrings(student.outcome_summary, "strengths"),
        questionRuntime: student.question_runtime,
        questionIds: student.question_ids ?? [],
        operationLabels: Object.fromEntries(operationLabels),
      }),
      consolidationTargets: [...new Set([
        ...summaryDetails.consolidationTargets,
        ...(summaryDetails.readingAdvice ? [summaryDetails.readingAdvice] : []),
      ])].filter((target) => getConsolidationStrategyKey(target) !== consolidatedKey),
      operations,
      historicalKnowledge: [...knowledge.values()],
      teacher,
      groups: await listStoredTeacherGroups(teacher.id),
    };
  } catch { return null; }
}
