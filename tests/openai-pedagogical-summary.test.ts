import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createConfiguredOpenAISummaryWriter, writePersonalizedSummary } from "../lib/pedagogical-session-engine/openai-summary.ts";
import type { PedagogicalSummary } from "../lib/pedagogical-session-engine/types.ts";

const base: PedagogicalSummary = {
  sessionId: "session-1",
  activityId: "activity-1",
  notionId: "acte-union",
  encouragement: "Bravo, tu as terminé l’activité.",
  strengths: ["Tu établis correctement la différence entre 1840 et 1841."],
  consolidationTargets: ["Relie plus clairement la population à la représentation politique."],
  operationResults: [{ id: "differences_and_similarities", status: "mastered" }],
  historicalKnowledgeResults: [{ id: "acte-union", status: "to_consolidate" }],
  recommendation: { kind: "optional_consolidation", targetOperationIds: [], targetHistoricalKnowledgeIds: ["acte-union"], label: "Reprends une courte activité ciblée." },
  workbookReferences: [],
  localDemoNotice: "",
  completedAt: "2026-08-09T20:00:00.000Z",
};

function responseWith(value: unknown) {
  return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(value) }] }] }), { status: 200 });
}

test("Sol rédige le bilan sans pouvoir modifier les niveaux calculés", async () => {
  let requestBody = "";
  const personalized = await writePersonalizedSummary(base, {
    apiKey: "test-key",
    model: "gpt-5.6-sol",
    fetch: async (_input, init) => {
      requestBody = String(init?.body ?? "");
      return responseWith({
        encouragement: "Bravo pour ton travail attentif. Tu as persévéré jusqu’au bout.",
        strengths: ["Tu distingues correctement l’adoption de l’entrée en vigueur de l’Acte d’Union."],
        consolidationTargets: ["Explique davantage le lien entre population et représentation."],
        recommendationLabel: "Reprends une courte comparaison à partir des deux tableaux.",
      });
    },
  });
  assert.deepEqual(personalized.operationResults, base.operationResults);
  assert.deepEqual(personalized.historicalKnowledgeResults, base.historicalKnowledgeResults);
  assert.deepEqual(personalized.recommendation?.targetHistoricalKnowledgeIds, ["acte-union"]);
  assert.match(personalized.encouragement, /persévéré/);
  assert.match(requestBody, /"store":false/);
  assert.match(requestBody, /avec ses propres mots/);
  assert.match(requestBody, /ne demande jamais de retrouver un passage exact/);
  assert.doesNotMatch(requestBody, /studentResponse|conversation|transcription/);
});

test("refuse une rédaction Sol qui ne respecte pas le contrat", async () => {
  await assert.rejects(() => writePersonalizedSummary(base, {
    apiKey: "test-key",
    model: "gpt-5.6-sol",
    fetch: async () => responseWith({ encouragement: "", strengths: [], consolidationTargets: [], recommendationLabel: "" }),
  }));
});

test("branche le rédacteur seulement à la fin d’une activité serveur", async () => {
  const view = await readFile(new URL("../app/eleve/activite/[activityId]/session-view.tsx", import.meta.url), "utf8");
  const action = await readFile(new URL("../app/eleve/activite/summary-actions.ts", import.meta.url), "utf8");
  assert.match(view, /data\.source === "server" && nextState\.summary/);
  assert.match(view, /personalizeCompletedStudentSummary/);
  assert.match(action, /usedFallback: true/);
  assert.match(action, /publication_status/);
  assert.doesNotMatch(action, /studentResponse|conversation|transcription/);
});

test("utilise Sol par défaut pour rédiger le bilan final", async () => {
  let requestBody: Record<string, unknown> | undefined;
  await createConfiguredOpenAISummaryWriter(base, { OPENAI_API_KEY: "test-key" }, async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    return responseWith({
      encouragement: "Bravo pour ton travail.", strengths: base.strengths,
      consolidationTargets: base.consolidationTargets, recommendationLabel: "Reprends une courte comparaison ciblée.",
    });
  });
  assert.equal(requestBody?.model, "gpt-5.6-sol");
});
