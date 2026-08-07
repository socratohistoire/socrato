import assert from "node:assert/strict";
import test from "node:test";
import type { PedagogicalQuestionDefinition } from "../lib/pedagogical-session-engine/types.ts";

const question = {
  id: "q-1", notionId: "acte-union", primaryOperationId: "causes_and_consequences",
  operationIds: ["causes_and_consequences"], historicalKnowledgeIds: ["knowledge-1"],
  documentIds: ["document-1"], requiredDocumentIds: ["document-1"], hintSequence: { 1: "Indice 1", 2: "Indice 2" },
} satisfies PedagogicalQuestionDefinition;

const response = {
  sessionId: "session-secret", activityId: "activity-1", questionId: "q-1", notionId: "acte-union",
  primaryOperationId: "causes_and_consequences", operationIds: ["causes_and_consequences"],
  historicalKnowledgeIds: ["knowledge-1"], documentIds: ["document-1"], attemptNumber: 1, hintLevel: 0 as const,
  content: "Le document montre une conséquence politique de l’Acte d’Union.",
};

const validAnalysis = {
  responseDisposition: "substantive", pedagogicalOutcome: "partially_satisfactory",
  historicalAccuracy: "partial", documentUse: "partial", justificationQuality: "partial",
  primaryOperationPerformance: "partial", demonstratedKnowledgeIds: ["knowledge-1"],
  observedOperationIds: ["causes_and_consequences"], usedDocumentIds: ["document-1"],
  observedStrengths: ["Un lien historique pertinent est amorcé."], missingElements: ["Précise la conséquence."],
  nextAction: "request_revision", confidence: "medium",
};

test("envoie une requête sans conservation et valide la sortie structurée", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  let requestBody: Record<string, unknown> | undefined;
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(validAnalysis) }] }] }), { status: 200 });
  } });
  assert.deepEqual(await analyzer.analyze(response, question), validAnalysis);
  assert.equal(requestBody?.store, false);
  assert.equal(requestBody?.model, "test-model");
  assert.equal(JSON.stringify(requestBody).includes("session-secret"), false);
});

test("refuse les identifiants inventés par le modèle", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: JSON.stringify({ ...validAnalysis, demonstratedKnowledgeIds: ["invented"] }) }] }],
  }), { status: 200 }) });
  await assert.rejects(() => analyzer.analyze(response, question), /non autorisé/);
});

test("échoue fermé lorsque la configuration est absente", async () => {
  const { createConfiguredOpenAIPedagogicalAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  assert.throws(() => createConfiguredOpenAIPedagogicalAnalyzer({}), /OPENAI_API_KEY/);
});
