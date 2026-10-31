import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  MIGRATIONS_EXODE_EMIGRATION_COMPARISON_DOCUMENTS,
  MIGRATIONS_EXODE_EMIGRATION_COMPARISON_QUESTION,
  MIGRATIONS_NEW_ENGLAND_MILLS_BEAUGRAND_DOCUMENT,
  MIGRATIONS_RURAL_FAMILIES_MONTREAL_DOCUMENT,
} from "../lib/pedagogical-reference/migrations-exode-emigration-comparison.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("documente deux migrations de familles vers des milieux industriels avec deux nouvelles sources", () => {
  assert.deepEqual(MIGRATIONS_EXODE_EMIGRATION_COMPARISON_DOCUMENTS.map(({ id }) => id), ["MIG-T-008", "MIG-T-009"]);
  for (const document of MIGRATIONS_EXODE_EMIGRATION_COMPARISON_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
    assert.equal(document.transcription.split(/[.!?](?:[ »”]|\s|$)/).filter(Boolean).length, 4);
  }
  assert.match(MIGRATIONS_RURAL_FAMILIES_MONTREAL_DOCUMENT.transcription, /fils non héritiers[\s\S]*terre familiale[\s\S]*emplois salariés[\s\S]*famille/i);
  assert.match(MIGRATIONS_NEW_ENGLAND_MILLS_BEAUGRAND_DOCUMENT.transcription, /récoltes[\s\S]*fermes hypothéquées[\s\S]*filatures[\s\S]*salaires réguliers/i);
});

test("demande une similitude et une différence sans révéler la réponse dans la consigne", () => {
  assert.deepEqual(validateApprovedQuestion(MIGRATIONS_EXODE_EMIGRATION_COMPARISON_QUESTION), {});
  assert.equal(
    MIGRATIONS_EXODE_EMIGRATION_COMPARISON_QUESTION.prompt,
    "Comparez l’exode rural vers Montréal, entre 1845 et 1875, et l’émigration vers la Nouvelle-Angleterre, des années 1850 aux années 1890, en indiquant une similitude et une différence.",
  );
  assert.equal(MIGRATIONS_EXODE_EMIGRATION_COMPARISON_QUESTION.operationId, "differences_and_similarities");
  assert.match(MIGRATIONS_EXODE_EMIGRATION_COMPARISON_QUESTION.expectedAnswer, /difficile[\s\S]*emplois salariés[\s\S]*migration interne[\s\S]*migration internationale/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MIGRATIONS_EXODE_EMIGRATION_COMPARISON_QUESTION.id));
});

test("publie un aperçu avec les deux documents dans l’ordre", () => {
  const session = createDemoStudentLearningSession("demo-activity-migrations-exode-emigration-comparison", "migrations");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, MIGRATIONS_EXODE_EMIGRATION_COMPARISON_QUESTION.id);
  assert.equal(session.questions[0]?.intellectualOperations[0]?.label, "Dégager des différences et des similitudes");
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["MIG-T-008", "MIG-T-009"]);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ displayOrder }) => displayOrder), [1, 2]);
});
