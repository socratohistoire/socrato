import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  MIGRATIONS_INNU_HUNTING_FISHING_TERRITORY_DOCUMENT,
  MIGRATIONS_INNU_TERRITORIAL_PROTEST_DOCUMENT,
  MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_DOCUMENTS,
  MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_QUESTION,
} from "../lib/pedagogical-reference/migrations-saguenay-innu-consequence.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("documente la revendication territoriale innue et les effets de la colonisation", () => {
  assert.deepEqual(MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_DOCUMENTS.map(({ id }) => id), ["MIG-T-010", "MIG-T-011"]);
  for (const document of MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
    assert.equal(document.transcription.split(/[.!?](?:[ »”]|\s|$)/).filter(Boolean).length, 4);
  }
  assert.match(MIGRATIONS_INNU_TERRITORIAL_PROTEST_DOCUMENT.transcription, /temps immémorial[\s\S]*terrains de chasse[\s\S]*ne vendre aucun[\s\S]*droits de possession/i);
  assert.match(MIGRATIONS_INNU_HUNTING_FISHING_TERRITORY_DOCUMENT.transcription, /1838[\s\S]*appauvrissement[\s\S]*chasse et de pêche[\s\S]*1856[\s\S]*Mashteuiatsh/i);
});

test("situe précisément la conséquence entre 1838 et 1896", () => {
  assert.deepEqual(validateApprovedQuestion(MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_QUESTION), {});
  assert.equal(
    MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_QUESTION.prompt,
    "Expliquez une conséquence de l’ouverture à la colonisation du Saguenay–Lac-Saint-Jean, entre 1838 et 1896.",
  );
  assert.equal(MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_QUESTION.operationId, "causes_and_consequences");
  assert.match(MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_QUESTION.expectedAnswer, /vente de lots[\s\S]*appauvrissement[\s\S]*chasse et de pêche[\s\S]*Mashteuiatsh/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_QUESTION.id));
});

test("publie un aperçu avec le protêt et la synthèse dans l’ordre", () => {
  const session = createDemoStudentLearningSession("demo-activity-migrations-saguenay-innu-consequence", "migrations");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_QUESTION.id);
  assert.equal(session.questions[0]?.intellectualOperations[0]?.label, "Déterminer des causes et des conséquences");
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["MIG-T-010", "MIG-T-011"]);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ displayOrder }) => displayOrder), [1, 2]);
});
