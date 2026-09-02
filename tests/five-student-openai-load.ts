import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import { createConfiguredOpenAIPedagogicalAnalyzer } from "../lib/pedagogical-session-engine/openai-analyzer.ts";
import { createPedagogicalQuestionDefinition } from "../lib/pedagogical-session-engine/question-context.ts";
import type { StudentResponse } from "../lib/pedagogical-session-engine/types.ts";
import { createCatalogLearningSessionQuestions } from "../lib/student-learning-session/demo-provider.ts";

const STUDENTS = Number(process.env.SOCRATO_OPENAI_LOAD_STUDENTS ?? 5);
const QUESTION_ID = "question:acte-union:short-answer-005";
const ANSWER = "En 1840, le Parlement britannique adopte l’Acte d’Union. En 1841, la loi entre en vigueur et crée la Province du Canada.";

test("cinq élèves obtiennent simultanément une analyse IA réelle", async () => {
  assert.ok(Number.isInteger(STUDENTS) && STUDENTS >= 1 && STUDENTS <= 30, "Le palier autorisé doit contenir de 1 à 30 élèves.");
  assert.ok(process.env.OPENAI_API_KEY, "OPENAI_API_KEY doit être configurée.");
  const catalog = createCatalogLearningSessionQuestions([QUESTION_ID]);
  const question = catalog.questions[0];
  assert.ok(question, "La question de charge doit exister dans le catalogue.");
  const definition = createPedagogicalQuestionDefinition(question, "acte-union", "Acte d’union", catalog.documents);
  const startedAt = performance.now();

  const calls = await Promise.allSettled(Array.from({ length: STUDENTS }, async (_, index) => {
    const analyzer = createConfiguredOpenAIPedagogicalAnalyzer();
    const response: StudentResponse = {
      sessionId: `openai-load-session-${index + 1}`, activityId: "openai-load-activity", questionId: definition.id,
      notionId: definition.notionId, primaryOperationId: definition.primaryOperationId, operationIds: [...definition.operationIds],
      historicalKnowledgeIds: [...definition.historicalKnowledgeIds], documentIds: [...definition.documentIds],
      attemptNumber: 1, hintLevel: 0, content: ANSWER,
    };
    const callStartedAt = performance.now();
    const analysis = await analyzer.analyze(response, definition);
    return { student: index + 1, durationMs: Math.round(performance.now() - callStartedAt), outcome: analysis.pedagogicalOutcome, disposition: analysis.responseDisposition };
  }));

  const successes = calls.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  const failures = calls.flatMap((result) => result.status === "rejected" ? [result.reason instanceof Error ? result.reason.message : String(result.reason)] : []);
  const durations = successes.map(({ durationMs }) => durationMs).sort((a, b) => a - b);
  assert.equal(failures.length, 0, failures.join(" | "));
  assert.equal(successes.length, STUDENTS);
  assert.ok(successes.every(({ disposition }) => disposition === "substantive"));
  console.log(JSON.stringify({ students: STUDENTS, successes: successes.length, failures: failures.length, medianMs: durations[Math.floor(durations.length / 2)], maximumMs: durations.at(-1), totalMs: Math.round(performance.now() - startedAt), outcomes: successes.map(({ outcome }) => outcome) }));
});
