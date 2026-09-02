import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import { authenticateStudentAccess } from "../lib/student-access/authenticate.ts";
import { createDatabaseStudentAccessRuntime } from "../lib/student-access/database-runtime.ts";
import { InMemoryStudentAccessRateLimiter } from "../lib/student-access/rate-limiter.ts";
import { getSocratoDatabase } from "../lib/server/database.ts";
import { createPedagogicalSession, finalizePedagogicalSession, submitStudentResponse } from "../lib/pedagogical-session-engine/engine.ts";
import type { ResponseAnalyzer } from "../lib/pedagogical-session-engine/ports.ts";
import type { PedagogicalSessionDefinition, StructuredResponseAnalysis } from "../lib/pedagogical-session-engine/types.ts";
import { createStudentProgressContract } from "../lib/student-progress/browser-store.ts";

const STUDENTS = 30;
const QUESTIONS = 3;
const PREFIX = "load30-database";
const GROUP_ID = `${PREFIX}-group`;
const ACTIVITY_ID = `${PREFIX}-activity`;
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

function code(index: number) {
  let suffix = "", value = index;
  for (let position = 0; position < 4; position += 1) { suffix = ALPHABET[value % ALPHABET.length] + suffix; value = Math.floor(value / ALPHABET.length); }
  return `DBTESTDB${suffix}`;
}

class LocalSuccessAnalyzer implements ResponseAnalyzer {
  calls = 0;
  async analyze(): Promise<StructuredResponseAnalysis> {
    this.calls += 1;
    return { responseDisposition: "substantive", pedagogicalOutcome: "satisfactory", historicalAccuracy: "demonstrated", documentUse: "demonstrated", justificationQuality: "demonstrated", primaryOperationPerformance: "demonstrated", demonstratedKnowledgeIds: ["knowledge-load"], observedOperationIds: ["establish_facts"], usedDocumentIds: [], observedStrengths: ["Fait exact."], missingElements: [], nextAction: "complete_question", confidence: "high" };
  }
}

function activity(studentId: string): PedagogicalSessionDefinition {
  return { sessionId: `${PREFIX}-engine-${studentId}`, activityId: ACTIVITY_ID, notionId: "notion-load", dashboardHref: "/eleve/tableau-de-bord", questions: Array.from({ length: QUESTIONS }, (_, index) => ({ id: `${PREFIX}-question-${index + 1}`, notionId: "notion-load", questionPrompt: `Question ${index + 1}`, instruction: "Réponds avec un fait précis.", primaryOperationId: "establish_facts", operationIds: ["establish_facts"], historicalKnowledgeIds: ["knowledge-load"], documentIds: [], requiredDocumentIds: [], hintSequence: { 1: "Repère le fait.", 2: "Nomme et explique le fait." } })) };
}

test("30 élèves écrivent et relisent progression et bilan dans la base réelle", async () => {
  const sql = getSocratoDatabase(), runtime = createDatabaseStudentAccessRuntime(), analyzer = new LocalSuccessAnalyzer(), startedAt = performance.now();
  const cleanup = async () => {
    await sql`delete from socrato.server_sessions where subject_id like ${`${PREFIX}-%`}`;
    await sql`delete from socrato.student_outcomes where student_id like ${`${PREFIX}-%`}`;
    await sql`delete from socrato.student_progress where student_id like ${`${PREFIX}-%`}`;
    await sql`delete from socrato.learning_sessions where student_id like ${`${PREFIX}-%`}`;
    await sql`delete from socrato.activity_group_assignments where activity_id = ${ACTIVITY_ID}`;
    await sql`delete from socrato.activities where id = ${ACTIVITY_ID}`;
    await sql`delete from socrato.student_access_credentials where student_id like ${`${PREFIX}-%`}`;
    await sql`delete from socrato.group_memberships where group_id = ${GROUP_ID}`;
    await sql`delete from socrato.students where id like ${`${PREFIX}-%`}`;
    await sql`delete from socrato.groups where id = ${GROUP_ID}`;
  };
  try {
    await cleanup();
    const owners = await sql<{ school_id: string; teacher_id: string }[]>`select school_id, id as teacher_id from socrato.teachers order by created_at limit 1`;
    assert.ok(owners[0], "Un enseignant doit exister dans la base.");
    const { school_id: schoolId, teacher_id: teacherId } = owners[0];
    await sql`insert into socrato.groups (id, school_id, teacher_id, display_name, school_year) values (${GROUP_ID}, ${schoolId}, ${teacherId}, ${"Charge technique — 30 élèves"}, ${"2026-2027"})`;
    await sql`insert into socrato.activities (id, schema_version, teacher_id, title, work_type, notion_ids, operation_id, question_ids, publication_status, published_at, updated_at) values (${ACTIVITY_ID}, ${1}, ${teacherId}, ${"Charge technique — trois questions"}, ${"revision"}, ${["notion-load"]}, ${"establish_facts"}, ${Array.from({ length: QUESTIONS }, (_, index) => `${PREFIX}-question-${index + 1}`)}, ${"published"}, now(), now())`;
    await sql`insert into socrato.activity_group_assignments (id, activity_id, group_id) values (${`${PREFIX}-assignment`}, ${ACTIVITY_ID}, ${GROUP_ID})`;
    for (let index = 0; index < STUDENTS; index += 1) {
      const studentId = `${PREFIX}-student-${index + 1}`;
      await sql`insert into socrato.students (id, school_id, display_alias) values (${studentId}, ${schoolId}, ${`Élève charge ${index + 1}`})`;
      await sql`insert into socrato.group_memberships (id, group_id, student_id) values (${`${PREFIX}-membership-${index + 1}`}, ${GROUP_ID}, ${studentId})`;
      await sql`insert into socrato.student_access_credentials (id, student_id, lookup_digest, status, expires_at) values (${`${PREFIX}-credential-${index + 1}`}, ${studentId}, ${runtime.lookup.digest(code(index))}, ${"active"}, ${"2027-01-01T00:00:00.000Z"})`;
    }
    const authentications = await Promise.all(Array.from({ length: STUDENTS }, (_, index) => authenticateStudentAccess(code(index), `${PREFIX}-client-${index + 1}`, { lookup: runtime.lookup, codes: runtime.codes, sessions: runtime.sessions, rateLimiter: new InMemoryStudentAccessRateLimiter() })));
    assert.equal(authentications.filter(({ success }) => success).length, STUDENTS);
    await Promise.all(authentications.map(async (authentication, index) => {
      assert.equal(authentication.success, true); if (!authentication.success) return;
      const studentId = `${PREFIX}-student-${index + 1}`, sessionId = `${PREFIX}-learning-${index + 1}`, definition = activity(studentId);
      let state = createPedagogicalSession(definition);
      for (let questionIndex = 0; questionIndex < QUESTIONS; questionIndex += 1) state = (await submitStudentResponse(definition, state, "Réponse locale exacte.", analyzer)).state;
      state = await finalizePedagogicalSession(state);
      const progress = createStudentProgressContract(state);
      await sql.begin(async (tx) => {
        await tx`insert into socrato.learning_sessions (id, activity_id, student_id, group_id, completed_at) values (${sessionId}, ${ACTIVITY_ID}, ${studentId}, ${GROUP_ID}, ${progress.completedAt})`;
        await tx`insert into socrato.student_progress (session_id, schema_version, activity_id, student_id, group_id, notion_id, state, current_question_index, total_questions, completed_question_ids, operation_results, historical_knowledge_results, question_runtime, started_at, updated_at, completed_at) values (${sessionId}, ${progress.schemaVersion}, ${ACTIVITY_ID}, ${studentId}, ${GROUP_ID}, ${progress.notionId}, ${progress.state}, ${progress.currentQuestionIndex}, ${progress.totalQuestions}, ${progress.completedQuestionIds}, ${tx.json(progress.operationResults)}, ${tx.json(progress.historicalKnowledgeResults)}, ${tx.json(progress.questionRuntime)}, ${progress.startedAt}, ${progress.updatedAt}, ${progress.completedAt})`;
        await tx`insert into socrato.student_outcomes (session_id, student_id, activity_id, summary, completed_at) values (${sessionId}, ${studentId}, ${ACTIVITY_ID}, ${tx.json(state.summary!)}, ${state.summary!.completedAt})`;
      });
    }));
    const [sessions, progress, outcomes, isolated] = await Promise.all([
      sql<{ count: number }[]>`select count(*)::int as count from socrato.server_sessions where subject_id like ${`${PREFIX}-%`}`,
      sql<{ count: number }[]>`select count(*)::int as count from socrato.student_progress where activity_id = ${ACTIVITY_ID} and state = 'completed' and cardinality(completed_question_ids) = ${QUESTIONS}`,
      sql<{ count: number }[]>`select count(*)::int as count from socrato.student_outcomes where activity_id = ${ACTIVITY_ID}`,
      sql<{ count: number }[]>`select count(distinct student_id)::int as count from socrato.student_progress where activity_id = ${ACTIVITY_ID}`,
    ]);
    for (const count of [sessions, progress, outcomes, isolated]) assert.equal(count[0]?.count, STUDENTS);
    assert.equal(analyzer.calls, STUDENTS * QUESTIONS);
    console.log(JSON.stringify({ students: STUDENTS, connections: sessions[0]?.count, completedProgress: progress[0]?.count, savedOutcomes: outcomes[0]?.count, isolatedStudents: isolated[0]?.count, localAnalyses: analyzer.calls, durationMs: Math.round(performance.now() - startedAt) }));
  } finally { await cleanup(); await sql.end(); }
});
