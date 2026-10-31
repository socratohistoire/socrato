import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  MIGRATIONS_COLONIZATION_INTERVENTION_DOCUMENTS,
  MIGRATIONS_COLONIZATION_INTERVENTION_QUESTION,
  MIGRATIONS_QUEBEC_SETTLEMENT_INTERVENTION_DOCUMENT,
  MIGRATIONS_RURAL_LAND_SHORTAGE_DISTRACTOR_DOCUMENT,
} from "../lib/pedagogical-reference/migrations-colonization-intervention.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("les deux extraits distinguent une intervention de colonisation du manque de terres rurales", () => {
  assert.equal(MIGRATIONS_COLONIZATION_INTERVENTION_DOCUMENTS.length, 2);
  for (const document of MIGRATIONS_COLONIZATION_INTERVENTION_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
  }
  assert.equal(MIGRATIONS_QUEBEC_SETTLEMENT_INTERVENTION_DOCUMENT.creator, "Arthur Buies");
  assert.equal(MIGRATIONS_QUEBEC_SETTLEMENT_INTERVENTION_DOCUMENT.historicalDate, "1880");
  assert.equal(
    MIGRATIONS_QUEBEC_SETTLEMENT_INTERVENTION_DOCUMENT.transcription.split(/[.!?](?:\s|$)/).filter(Boolean).length,
    4,
  );
  assert.match(MIGRATIONS_QUEBEC_SETTLEMENT_INTERVENTION_DOCUMENT.transcription, /gouvernement[\s\S]*chemin[\s\S]*colonisation/i);
  assert.match(MIGRATIONS_QUEBEC_SETTLEMENT_INTERVENTION_DOCUMENT.transcription, /États-Unis[\s\S]*Lac Saint-Jean/i);
  assert.match(MIGRATIONS_RURAL_LAND_SHORTAGE_DISTRACTOR_DOCUMENT.transcription, /terres accessibles|nouvelles fermes/i);
  assert.match(MIGRATIONS_RURAL_LAND_SHORTAGE_DISTRACTOR_DOCUMENT.transcription, /États-Unis|régions du Canada/i);
});

test("la question fait décrire une intervention et discriminer une cause de départ", () => {
  assert.deepEqual(validateApprovedQuestion(MIGRATIONS_COLONIZATION_INTERVENTION_QUESTION), {});
  assert.equal(
    MIGRATIONS_COLONIZATION_INTERVENTION_QUESTION.prompt,
    "Décrivez une intervention mise en œuvre au Québec à la fin du XIXe siècle pour prévenir l’émigration des Canadiens français.",
  );
  assert.equal(MIGRATIONS_COLONIZATION_INTERVENTION_QUESTION.operationId, "establish_facts");
  assert.deepEqual(MIGRATIONS_COLONIZATION_INTERVENTION_QUESTION.historicalDocumentIds, ["MIG-T-001", "MIG-T-002"]);
  assert.deepEqual(MIGRATIONS_COLONIZATION_INTERVENTION_QUESTION.distractors, ["MIG-T-002"]);
  assert.match(MIGRATIONS_COLONIZATION_INTERVENTION_QUESTION.expectedAnswer, /document 1[\s\S]*Lac-Saint-Jean/i);
  assert.match(MIGRATIONS_COLONIZATION_INTERVENTION_QUESTION.expectedAnswer, /gouvernement[\s\S]*chemin Kenogami/i);
  assert.match(MIGRATIONS_COLONIZATION_INTERVENTION_QUESTION.expectedAnswer, /colonisation/i);
  assert.match(MIGRATIONS_COLONIZATION_INTERVENTION_QUESTION.expectedAnswer, /document 2[\s\S]*manque de terres/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MIGRATIONS_COLONIZATION_INTERVENTION_QUESTION.id));
});

test("l’aperçu élève présente la question et les deux extraits dans le bon ordre", () => {
  const session = createDemoStudentLearningSession(
    "demo-activity-migrations-intervention-colonisation",
    "migrations",
  );
  assert.ok(session);
  assert.equal(session.notionTitle, "Migrations");
  assert.equal(session.questions[0]?.id, MIGRATIONS_COLONIZATION_INTERVENTION_QUESTION.id);
  assert.deepEqual(session.documentCatalog.map(({ id }) => id), ["MIG-T-001", "MIG-T-002"]);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["MIG-T-001", "MIG-T-002"]);
});
