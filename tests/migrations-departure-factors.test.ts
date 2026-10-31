import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import { MIGRATIONS_DEPARTURE_FACTORS_QUESTION, MIGRATIONS_NEW_ENGLAND_COMMUNITIES_CONSEQUENCE_DOCUMENT } from "../lib/pedagogical-reference/migrations-departure-factors.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("demande d’expliquer deux facteurs distincts du départ", () => {
  assert.deepEqual(validateApprovedQuestion(MIGRATIONS_DEPARTURE_FACTORS_QUESTION), {});
  assert.equal(
    MIGRATIONS_DEPARTURE_FACTORS_QUESTION.prompt,
    "Entre 1840 et 1896, expliquez deux facteurs qui contribuent au départ de familles des milieux ruraux du Québec vers les États-Unis.",
  );
  assert.equal(MIGRATIONS_DEPARTURE_FACTORS_QUESTION.operationId, "causes_and_consequences");
  assert.deepEqual(MIGRATIONS_DEPARTURE_FACTORS_QUESTION.historicalDocumentIds, ["MIG-T-003", "MIG-T-005"]);
  assert.deepEqual(MIGRATIONS_DEPARTURE_FACTORS_QUESTION.distractors, ["MIG-T-005"]);
  assert.match(MIGRATIONS_DEPARTURE_FACTORS_QUESTION.expectedAnswer, /endettement/i);
  assert.match(MIGRATIONS_DEPARTURE_FACTORS_QUESTION.expectedAnswer, /mauvaises récoltes|difficultés agricoles/i);
  assert.match(MIGRATIONS_DEPARTURE_FACTORS_QUESTION.expectedAnswer, /marchés|voies de communication/i);
  assert.match(MIGRATIONS_DEPARTURE_FACTORS_QUESTION.expectedAnswer, /conséquence/i);
  assert.deepEqual(validateHistoricalDocument(MIGRATIONS_NEW_ENGLAND_COMMUNITIES_CONSEQUENCE_DOCUMENT), {});
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MIGRATIONS_DEPARTURE_FACTORS_QUESTION.id));
});

test("publie le rapport de 1849 et un document-conséquence à discriminer", () => {
  const session = createDemoStudentLearningSession("demo-activity-migrations-departure-factors", "migrations");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, MIGRATIONS_DEPARTURE_FACTORS_QUESTION.id);
  assert.equal(session.questions[0]?.intellectualOperations[0]?.label, "Déterminer des causes et des conséquences");
  assert.deepEqual(session.questions[0]?.documentRelations, [
    { documentId: "MIG-T-003", displayOrder: 1 },
    { documentId: "MIG-T-005", displayOrder: 2 },
  ]);
  assert.equal(session.documentCatalog[0]?.content.kind, "historical_excerpt");
  assert.equal(session.documentCatalog[1]?.content.kind, "historical_excerpt");
});
