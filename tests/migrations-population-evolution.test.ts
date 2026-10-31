import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  MIGRATIONS_POPULATION_EVOLUTION_QUESTION,
  MIGRATIONS_URBAN_POPULATION_EVOLUTION_DOCUMENT,
} from "../lib/pedagogical-reference/migrations-population-evolution.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("documente l’évolution de la part de la population urbaine au Québec", () => {
  assert.deepEqual(validateHistoricalDocument(MIGRATIONS_URBAN_POPULATION_EVOLUTION_DOCUMENT), {});
  assert.equal(MIGRATIONS_URBAN_POPULATION_EVOLUTION_DOCUMENT.kind, "statistics");
  assert.match(MIGRATIONS_URBAN_POPULATION_EVOLUTION_DOCUMENT.transcription, /1871[^]*19,5 %[^]*1891[^]*29,2 %/);
});

test("demande le mouvement qui contribue à expliquer l’évolution", () => {
  assert.deepEqual(validateApprovedQuestion(MIGRATIONS_POPULATION_EVOLUTION_QUESTION), {});
  assert.equal(
    MIGRATIONS_POPULATION_EVOLUTION_QUESTION.prompt,
    "Quel mouvement de population contribue à expliquer l’évolution présentée dans le document 1?",
  );
  assert.equal(MIGRATIONS_POPULATION_EVOLUTION_QUESTION.operationId, "causes_and_consequences");
  assert.match(MIGRATIONS_POPULATION_EVOLUTION_QUESTION.expectedAnswer, /exode rural/i);
  assert.match(MIGRATIONS_POPULATION_EVOLUTION_QUESTION.expectedAnswer, /campagnes[^]*villes/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MIGRATIONS_POPULATION_EVOLUTION_QUESTION.id));
});

test("publie un aperçu avec le tableau statistique comme document 1", () => {
  const session = createDemoStudentLearningSession("demo-activity-migrations-evolution-population", "migrations");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, MIGRATIONS_POPULATION_EVOLUTION_QUESTION.id);
  assert.equal(session.questions[0]?.intellectualOperations[0]?.label, "Déterminer des causes et des conséquences");
  assert.deepEqual(session.questions[0]?.documentRelations, [{ documentId: "MIG-S-001", displayOrder: 1 }]);
  assert.equal(session.documentCatalog[0]?.content.kind, "comparison_table");
  if (session.documentCatalog[0]?.content.kind === "comparison_table") {
    assert.deepEqual(session.documentCatalog[0].content.rows.map(({ label, value }) => [label, value]), [
      ["1871", "19,5 %"],
      ["1881", "22,8 %"],
      ["1891", "29,2 %"],
    ]);
  }
});
