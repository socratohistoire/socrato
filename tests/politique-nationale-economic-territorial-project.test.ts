import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import {
  POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_DOCUMENTS,
  POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_QUESTION,
} from "../lib/pedagogical-reference/politique-nationale-economic-territorial-project.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("la question relie les quatre composantes du projet économique et territorial", () => {
  assert.deepEqual(validateApprovedQuestion(POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_QUESTION), {});
  assert.equal(POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_QUESTION.prompt, "Explique comment la crise de 1873, le tarif protecteur, le Canadien Pacifique et la colonisation de l’Ouest forment un même projet économique et territorial.");
  assert.equal(POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_QUESTION.operationId, "causal_connections");
  assert.deepEqual(POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_QUESTION.historicalDocumentIds, ["PN-S-002", "PN-T-001", "PN-T-003", "PN-T-004"]);
  assert.deepEqual(POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_QUESTION.distractors, []);
  assert.match(POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_QUESTION.expectedAnswer, /25 millions de dollars/i);
  assert.match(POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_QUESTION.expectedAnswer, /projet économique/i);
  assert.match(POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_QUESTION.expectedAnswer, /territorial/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_QUESTION.id));
});

test("les quatre documents sont disponibles dans la séance", () => {
  assert.equal(POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_DOCUMENTS.length, 4);
  for (const document of POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_DOCUMENTS) {
    assert.ok(ACTE_UNION_DOCUMENTS.some(({ id }) => id === document.id));
  }
});

test("l’aperçu élève présente les quatre documents dans l’ordre de la chaîne", () => {
  const session = createDemoStudentLearningSession("demo-activity-politique-nationale-projet-economique-territorial", "politique-nationale");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_QUESTION.id);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["PN-S-002", "PN-T-001", "PN-T-003", "PN-T-004"]);
  assert.equal(session.questions[0]?.initialMessages[0]?.content, "J’attends ta réponse.");
});
