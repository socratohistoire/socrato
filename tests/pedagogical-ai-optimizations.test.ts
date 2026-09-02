import assert from "node:assert/strict";
import test from "node:test";
import { analyzeWithFallback } from "../lib/pedagogical-session-engine/analyze-with-fallback.ts";
import { recordAICall } from "../lib/pedagogical-session-engine/ai-call-tracking.ts";
import type { ResponseAnalyzer } from "../lib/pedagogical-session-engine/ports.ts";
import type { PedagogicalQuestionDefinition, StructuredResponseAnalysis, StudentResponse } from "../lib/pedagogical-session-engine/types.ts";

const question = {
  id: "q-1", notionId: "notion-1", primaryOperationId: "operation-1", operationIds: ["operation-1"],
  historicalKnowledgeIds: ["knowledge-1"], documentIds: [], requiredDocumentIds: [], hintSequence: { 1: "Indice", 2: "Indice" },
} satisfies PedagogicalQuestionDefinition;

const response = {
  sessionId: "session-1", activityId: "activity-1", questionId: "q-1", notionId: "notion-1",
  primaryOperationId: "operation-1", operationIds: ["operation-1"], historicalKnowledgeIds: ["knowledge-1"],
  documentIds: [], attemptNumber: 1, hintLevel: 0, content: "Texte élève secret",
} satisfies StudentResponse;

const localAnalysis = {
  responseDisposition: "substantive", pedagogicalOutcome: "insufficient", historicalAccuracy: "not_demonstrated",
  documentUse: "not_assessed", justificationQuality: "not_demonstrated", primaryOperationPerformance: "not_demonstrated",
  demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [], observedStrengths: [],
  missingElements: ["Question ciblée?"], nextAction: "offer_hint", confidence: "high",
} satisfies StructuredResponseAnalysis;

test("utilise l’analyse locale sans transformer une panne IA en nouvel essai élève", async () => {
  const failing: ResponseAnalyzer = { analyze: async () => { throw new Error("indisponible"); } };
  const local: ResponseAnalyzer = { analyze: async () => localAnalysis };
  const result = await analyzeWithFallback(response, question, failing, local);
  assert.equal(result.usedFallback, true);
  assert.deepEqual(result.analysis, localAnalysis);
  assert.equal(response.attemptNumber, 1);
});

test("journalise uniquement les métadonnées nécessaires au suivi des coûts", () => {
  const events: unknown[][] = [];
  const original = console.info;
  console.info = (...values: unknown[]) => { events.push(values); };
  try {
    recordAICall({ model: "gpt-5.6-terra", callType: "pedagogical_analysis", activityId: "activity-1", questionId: "q-1" });
  } finally {
    console.info = original;
  }
  assert.deepEqual(events, [["[ai-call]", { model: "gpt-5.6-terra", callType: "pedagogical_analysis", activityId: "activity-1", questionId: "q-1" }]]);
  assert.doesNotMatch(JSON.stringify(events), /Texte élève secret/);
});
