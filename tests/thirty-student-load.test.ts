import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { performance } from "node:perf_hooks";
import test from "node:test";
import { authenticateStudentAccess } from "../lib/student-access/authenticate.ts";
import { HmacAccessCodeLookup } from "../lib/student-access/lookup.ts";
import { InMemoryStudentAccessRateLimiter } from "../lib/student-access/rate-limiter.ts";
import type { StudentAccessCodeRepository, StudentAccessCredential } from "../lib/student-access/repository.ts";
import type { StudentSession, StudentSessionRepository } from "../lib/student-access/session.ts";
import { createPedagogicalSession, finalizePedagogicalSession, submitStudentResponse } from "../lib/pedagogical-session-engine/engine.ts";
import type { PedagogicalSessionDefinition, StructuredResponseAnalysis } from "../lib/pedagogical-session-engine/types.ts";
import type { ResponseAnalyzer } from "../lib/pedagogical-session-engine/ports.ts";
import { createStudentProgressContract } from "../lib/student-progress/browser-store.ts";

const STUDENT_COUNT = 30;
const QUESTION_COUNT = 3;
const ACTIVITY_ID = "activity-load-test-30";
const GROUP_ID = "group-load-test-30";
const NOW = new Date("2026-08-29T16:00:00.000Z");
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

function accessCode(index: number) {
  let suffix = "";
  let value = index;
  for (let position = 0; position < 4; position += 1) {
    suffix = CODE_ALPHABET[value % CODE_ALPHABET.length] + suffix;
    value = Math.floor(value / CODE_ALPHABET.length);
  }
  return `TESTTEST${suffix}`;
}

class LoadCodeRepository implements StudentAccessCodeRepository {
  constructor(private readonly credentials: Map<string, StudentAccessCredential>) {}
  async findByLookupDigest(digest: string) { return this.credentials.get(digest) ?? null; }
}

class LoadSessionRepository implements StudentSessionRepository {
  readonly sessions = new Map<string, StudentSession>();
  async create(input: { anonymousStudentId: string; credentialId: string }) {
    const session = { ...input, token: randomBytes(24).toString("base64url"), expiresAt: new Date(NOW.getTime() + 3_600_000) };
    this.sessions.set(session.token, session);
    return session;
  }
  async findActiveByToken(token: string) { return this.sessions.get(token) ?? null; }
  async revokeByToken(token: string) { this.sessions.delete(token); }
}

class SuccessfulLocalAnalyzer implements ResponseAnalyzer {
  calls = 0;
  async analyze(): Promise<StructuredResponseAnalysis> {
    this.calls += 1;
    await Promise.resolve();
    return {
      responseDisposition: "substantive", pedagogicalOutcome: "satisfactory", historicalAccuracy: "demonstrated",
      documentUse: "demonstrated", justificationQuality: "demonstrated", primaryOperationPerformance: "demonstrated",
      demonstratedKnowledgeIds: ["knowledge-load"], observedOperationIds: ["establish_facts"], usedDocumentIds: [],
      observedStrengths: ["Réponse exacte et bien expliquée."], missingElements: [], nextAction: "complete_question", confidence: "high",
    };
  }
}

function definition(studentId: string): PedagogicalSessionDefinition {
  return {
    sessionId: `session-${studentId}`, activityId: ACTIVITY_ID, notionId: "notion-load", dashboardHref: "/eleve/tableau-de-bord",
    questions: Array.from({ length: QUESTION_COUNT }, (_, index) => ({
      id: `question-load-${index + 1}`, notionId: "notion-load", questionPrompt: `Question ${index + 1}`,
      instruction: "Réponds avec un fait précis.", primaryOperationId: "establish_facts", operationIds: ["establish_facts"],
      historicalKnowledgeIds: ["knowledge-load"], documentIds: [], requiredDocumentIds: [],
      hintSequence: { 1: "Repère le fait principal.", 2: "Nomme le fait et explique-le." },
    })),
  };
}

test("30 élèves se connectent et terminent trois questions sans IA réelle", async () => {
  const lookup = new HmacAccessCodeLookup("thirty-student-load-test-only");
  const credentials = new Map<string, StudentAccessCredential>();
  for (let index = 0; index < STUDENT_COUNT; index += 1) {
    const code = accessCode(index);
    credentials.set(lookup.digest(code), {
      credentialId: `credential-load-${index + 1}`, anonymousStudentId: `student-load-${index + 1}`,
      lookupDigest: lookup.digest(code), status: "active", expiresAt: new Date("2027-01-01T00:00:00.000Z"), membershipActive: true,
    });
  }
  const sessions = new LoadSessionRepository();
  const progress = new Map<string, ReturnType<typeof createStudentProgressContract>>();
  const outcomes = new Map<string, NonNullable<Awaited<ReturnType<typeof finalizePedagogicalSession>>["summary"]>>();
  const analyzer = new SuccessfulLocalAnalyzer();
  const startedAt = performance.now();

  const results = await Promise.all(Array.from({ length: STUDENT_COUNT }, async (_, index) => {
    const studentId = `student-load-${index + 1}`;
    const authentication = await authenticateStudentAccess(accessCode(index), `client-load-${index + 1}`, {
      lookup, codes: new LoadCodeRepository(credentials), sessions, rateLimiter: new InMemoryStudentAccessRateLimiter(), now: () => NOW,
    });
    assert.equal(authentication.success, true);
    if (!authentication.success) return;
    assert.equal(authentication.session.anonymousStudentId, studentId);

    const activity = definition(studentId);
    let state = createPedagogicalSession(activity);
    for (let questionIndex = 0; questionIndex < QUESTION_COUNT; questionIndex += 1) {
      const transition = await submitStudentResponse(activity, state, "Réponse locale exacte.", analyzer, { now: () => NOW });
      state = transition.state;
      progress.set(studentId, createStudentProgressContract(state, NOW));
    }
    state = await finalizePedagogicalSession(state);
    progress.set(studentId, createStudentProgressContract(state, NOW));
    outcomes.set(studentId, state.summary!);
    return studentId;
  }));

  const durationMs = performance.now() - startedAt;
  assert.equal(results.filter(Boolean).length, STUDENT_COUNT);
  assert.equal(sessions.sessions.size, STUDENT_COUNT);
  assert.equal(progress.size, STUDENT_COUNT);
  assert.equal(outcomes.size, STUDENT_COUNT);
  assert.equal(analyzer.calls, STUDENT_COUNT * QUESTION_COUNT);
  assert.equal(new Set([...sessions.sessions.values()].map(({ anonymousStudentId }) => anonymousStudentId)).size, STUDENT_COUNT);
  for (let index = 0; index < STUDENT_COUNT; index += 1) {
    const studentId = `student-load-${index + 1}`;
    const saved = progress.get(studentId)!;
    const summary = outcomes.get(studentId)!;
    assert.equal(saved.state, "completed");
    assert.equal(saved.completedQuestionIds.length, QUESTION_COUNT);
    assert.equal(saved.operationResults[0]?.status, "mastered");
    assert.equal(summary.activityId, ACTIVITY_ID);
    assert.equal(summary.operationResults[0]?.status, "mastered");
  }
  assert.ok(durationMs < 5_000, `Le test local a pris ${Math.round(durationMs)} ms.`);
  console.log(JSON.stringify({ groupId: GROUP_ID, students: STUDENT_COUNT, questionsPerStudent: QUESTION_COUNT, connections: sessions.sessions.size, savedProgress: progress.size, savedOutcomes: outcomes.size, analyses: analyzer.calls, durationMs: Math.round(durationMs) }));
});
