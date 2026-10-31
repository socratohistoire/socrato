import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  POLITIQUE_NATIONALE_CPR_FUNCTIONS_COMPARISON_QUESTION,
  POLITIQUE_NATIONALE_CPR_FUNCTIONS_DOCUMENTS,
  POLITIQUE_NATIONALE_CPR_TERRITORIAL_FUNCTION_DOCUMENT,
} from "../lib/pedagogical-reference/politique-nationale-cpr-functions-comparison.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("la question compare les fonctions économique et territoriale du Canadien Pacifique", () => {
  assert.deepEqual(validateApprovedQuestion(POLITIQUE_NATIONALE_CPR_FUNCTIONS_COMPARISON_QUESTION), {});
  assert.equal(POLITIQUE_NATIONALE_CPR_FUNCTIONS_COMPARISON_QUESTION.prompt, "Entre 1878 et 1886, compare la fonction économique et la fonction territoriale du Canadien Pacifique.");
  assert.equal(POLITIQUE_NATIONALE_CPR_FUNCTIONS_COMPARISON_QUESTION.operationId, "differences_and_similarities");
  assert.deepEqual(POLITIQUE_NATIONALE_CPR_FUNCTIONS_COMPARISON_QUESTION.historicalDocumentIds, ["PN-T-006", "PN-T-008"]);
  assert.deepEqual(POLITIQUE_NATIONALE_CPR_FUNCTIONS_COMPARISON_QUESTION.distractors, []);
  assert.match(POLITIQUE_NATIONALE_CPR_FUNCTIONS_COMPARISON_QUESTION.expectedAnswer, /circulation des marchandises/i);
  assert.match(POLITIQUE_NATIONALE_CPR_FUNCTIONS_COMPARISON_QUESTION.expectedAnswer, /unification du territoire/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === POLITIQUE_NATIONALE_CPR_FUNCTIONS_COMPARISON_QUESTION.id));
});

test("les deux documents complémentaires sont disponibles", () => {
  assert.equal(POLITIQUE_NATIONALE_CPR_FUNCTIONS_DOCUMENTS.length, 2);
  assert.deepEqual(validateHistoricalDocument(POLITIQUE_NATIONALE_CPR_TERRITORIAL_FUNCTION_DOCUMENT), {});
  for (const document of POLITIQUE_NATIONALE_CPR_FUNCTIONS_DOCUMENTS) {
    assert.ok(ACTE_UNION_DOCUMENTS.some(({ id }) => id === document.id));
  }
  assert.match(POLITIQUE_NATIONALE_CPR_FUNCTIONS_DOCUMENTS[0].transcription, /grain|marché|industries/i);
  assert.match(POLITIQUE_NATIONALE_CPR_FUNCTIONS_DOCUMENTS[1].transcription, /pays uni|expression géographique/i);
});

test("l’aperçu élève présente les deux fonctions dans le bon ordre", () => {
  const session = createDemoStudentLearningSession("demo-activity-politique-nationale-fonctions-cpr", "politique-nationale");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, POLITIQUE_NATIONALE_CPR_FUNCTIONS_COMPARISON_QUESTION.id);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["PN-T-006", "PN-T-008"]);
  assert.equal(session.questions[0]?.initialMessages[0]?.content, "J’attends ta réponse.");
});
