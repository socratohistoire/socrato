import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  POLITIQUE_NATIONALE_CRISIS_MANIFESTATION_DOCUMENTS,
  POLITIQUE_NATIONALE_CRISIS_MANIFESTATIONS_QUESTION,
} from "../lib/pedagogical-reference/politique-nationale-crisis-manifestations.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("la question demande seulement de relever deux manifestations de la crise de 1873", () => {
  assert.deepEqual(validateApprovedQuestion(POLITIQUE_NATIONALE_CRISIS_MANIFESTATIONS_QUESTION), {});
  assert.equal(POLITIQUE_NATIONALE_CRISIS_MANIFESTATIONS_QUESTION.prompt, "Relève deux manifestations de la crise économique commencée en 1873.");
  assert.equal(POLITIQUE_NATIONALE_CRISIS_MANIFESTATIONS_QUESTION.operationId, "establish_facts");
  assert.deepEqual(POLITIQUE_NATIONALE_CRISIS_MANIFESTATIONS_QUESTION.historicalDocumentIds, ["PN-S-001", "PN-S-002", "PN-S-003"]);
  assert.deepEqual(POLITIQUE_NATIONALE_CRISIS_MANIFESTATIONS_QUESTION.distractors, ["PN-S-003"]);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === POLITIQUE_NATIONALE_CRISIS_MANIFESTATIONS_QUESTION.id));
});

test("deux tableaux portent sur les années 1870 et le troisième doit être discriminé", () => {
  assert.equal(POLITIQUE_NATIONALE_CRISIS_MANIFESTATION_DOCUMENTS.length, 3);
  for (const document of POLITIQUE_NATIONALE_CRISIS_MANIFESTATION_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
    assert.ok(ACTE_UNION_DOCUMENTS.some(({ id }) => id === document.id));
  }
  assert.deepEqual(POLITIQUE_NATIONALE_CRISIS_MANIFESTATION_DOCUMENTS[0].periodIds, ["1840-1896"]);
  assert.deepEqual(POLITIQUE_NATIONALE_CRISIS_MANIFESTATION_DOCUMENTS[1].periodIds, ["1840-1896"]);
  assert.deepEqual(POLITIQUE_NATIONALE_CRISIS_MANIFESTATION_DOCUMENTS[2].periodIds, ["1896-1945"]);
  assert.equal(POLITIQUE_NATIONALE_CRISIS_MANIFESTATION_DOCUMENTS[2].historicalDate, "1929-1933");
});

test("l’aperçu élève présente la question et les trois tableaux", () => {
  const session = createDemoStudentLearningSession("demo-activity-politique-nationale-crise", "politique-nationale");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, POLITIQUE_NATIONALE_CRISIS_MANIFESTATIONS_QUESTION.id);
  assert.deepEqual(session.documentCatalog.map(({ id }) => id), ["PN-S-001", "PN-S-002", "PN-S-003"]);
});
