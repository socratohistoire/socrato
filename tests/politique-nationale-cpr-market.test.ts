import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import {
  POLITIQUE_NATIONALE_CPR_MARKET_DOCUMENTS,
  POLITIQUE_NATIONALE_CPR_MARKET_QUESTION,
} from "../lib/pedagogical-reference/politique-nationale-cpr-market.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("la question relie la colonisation de l’Ouest au développement du marché intérieur", () => {
  assert.deepEqual(validateApprovedQuestion(POLITIQUE_NATIONALE_CPR_MARKET_QUESTION), {});
  assert.equal(POLITIQUE_NATIONALE_CPR_MARKET_QUESTION.prompt, "Explique comment le Canadien Pacifique relie la colonisation de l’Ouest au développement du marché intérieur.");
  assert.equal(POLITIQUE_NATIONALE_CPR_MARKET_QUESTION.operationId, "causal_connections");
  assert.deepEqual(POLITIQUE_NATIONALE_CPR_MARKET_QUESTION.historicalDocumentIds, ["PN-T-006", "PN-T-007"]);
  assert.deepEqual(POLITIQUE_NATIONALE_CPR_MARKET_QUESTION.distractors, ["PN-T-007"]);
  assert.match(POLITIQUE_NATIONALE_CPR_MARKET_QUESTION.expectedAnswer, /Ouest agricole à l’Est manufacturier/i);
  assert.match(POLITIQUE_NATIONALE_CPR_MARKET_QUESTION.expectedAnswer, /marché intérieur canadien/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === POLITIQUE_NATIONALE_CPR_MARKET_QUESTION.id));
});

test("les deux nouveaux documents sont disponibles et la lettre militaire doit être discriminée", () => {
  assert.equal(POLITIQUE_NATIONALE_CPR_MARKET_DOCUMENTS.length, 2);
  for (const document of POLITIQUE_NATIONALE_CPR_MARKET_DOCUMENTS) {
    assert.ok(ACTE_UNION_DOCUMENTS.some(({ id }) => id === document.id));
  }
  assert.match(POLITIQUE_NATIONALE_CPR_MARKET_DOCUMENTS[0].transcription, /Prairies|grain|marché/i);
  assert.match(POLITIQUE_NATIONALE_CPR_MARKET_DOCUMENTS[0].transcription, /industries de l’Est/i);
  assert.match(POLITIQUE_NATIONALE_CPR_MARKET_DOCUMENTS[1].transcription, /cavaliers montés/i);
});

test("l’aperçu élève présente d’abord le discours utile, puis la lettre à discriminer", () => {
  const session = createDemoStudentLearningSession("demo-activity-politique-nationale-marche-interieur", "politique-nationale");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, POLITIQUE_NATIONALE_CPR_MARKET_QUESTION.id);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["PN-T-006", "PN-T-007"]);
  assert.equal(session.questions[0]?.initialMessages[0]?.content, "J’attends ta réponse.");
});
