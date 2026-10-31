import assert from "node:assert/strict";
import test from "node:test";

import { SOCRATO_INITIAL_RESPONSE_PROMPT } from "../lib/student-learning-session/initial-message.ts";
import { createCatalogLearningSessionQuestions, createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("utilise seulement le message d’attente dans les questions du catalogue", () => {
  const published = createCatalogLearningSessionQuestions([
    "question:manifestations-socioculturelles:short-answer-001",
    "question:manifestations-socioculturelles:short-answer-002",
  ]);
  assert.equal(SOCRATO_INITIAL_RESPONSE_PROMPT, "J’attends ta réponse.");
  for (const question of published.questions) {
    assert.deepEqual(question.initialMessages.map(({ content }) => content), [SOCRATO_INITIAL_RESPONSE_PROMPT]);
  }
});

test("uniformise aussi les activités interactives de démonstration", () => {
  for (const activityId of ["demo-activity-timeline", "demo-activity-association", "demo-activity-causal-chain"]) {
    const session = createDemoStudentLearningSession(activityId, "acte-union");
    assert.ok(session);
    assert.deepEqual(session.questions[0]?.initialMessages.map(({ content }) => content), [SOCRATO_INITIAL_RESPONSE_PROMPT]);
  }
});
