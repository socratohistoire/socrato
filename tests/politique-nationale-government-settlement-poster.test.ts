import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  POLITIQUE_NATIONALE_FREE_FARMS_GOVERNMENT_POSTER_DOCUMENT,
  POLITIQUE_NATIONALE_FREE_FARMS_MEASURE_QUESTION,
} from "../lib/pedagogical-reference/politique-nationale-government-settlement-poster.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("l’affiche gouvernementale sur les terres gratuites est documentée", () => {
  assert.deepEqual(validateHistoricalDocument(POLITIQUE_NATIONALE_FREE_FARMS_GOVERNMENT_POSTER_DOCUMENT), {});
  assert.equal(POLITIQUE_NATIONALE_FREE_FARMS_GOVERNMENT_POSTER_DOCUMENT.historicalDate, "vers 1890");
  assert.match(POLITIQUE_NATIONALE_FREE_FARMS_GOVERNMENT_POSTER_DOCUMENT.creator, /Gouvernement du Canada/i);
  assert.match(POLITIQUE_NATIONALE_FREE_FARMS_GOVERNMENT_POSTER_DOCUMENT.transcription, /160 acres/i);
  assert.ok(ACTE_UNION_DOCUMENTS.some(({ id }) => id === POLITIQUE_NATIONALE_FREE_FARMS_GOVERNMENT_POSTER_DOCUMENT.id));
});

test("la question demande d’expliquer une mesure de la Politique nationale", () => {
  assert.deepEqual(validateApprovedQuestion(POLITIQUE_NATIONALE_FREE_FARMS_MEASURE_QUESTION), {});
  assert.equal(POLITIQUE_NATIONALE_FREE_FARMS_MEASURE_QUESTION.prompt, "Explique une des mesures de la Politique nationale mise de l’avant par ce document historique.");
  assert.equal(POLITIQUE_NATIONALE_FREE_FARMS_MEASURE_QUESTION.operationId, "establish_facts");
  assert.deepEqual(POLITIQUE_NATIONALE_FREE_FARMS_MEASURE_QUESTION.historicalDocumentIds, ["PN-I-001"]);
  assert.match(POLITIQUE_NATIONALE_FREE_FARMS_MEASURE_QUESTION.expectedAnswer, /colonisation des terres de l’Ouest/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === POLITIQUE_NATIONALE_FREE_FARMS_MEASURE_QUESTION.id));
});

test("l’aperçu élève présente l’affiche et la question", () => {
  const session = createDemoStudentLearningSession("demo-activity-politique-nationale-terres-gratuites", "politique-nationale");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, POLITIQUE_NATIONALE_FREE_FARMS_MEASURE_QUESTION.id);
  assert.deepEqual(session.documentCatalog.map(({ id }) => id), ["PN-I-001"]);
  assert.equal(session.documentCatalog[0]?.content.kind, "historical_image");
});
