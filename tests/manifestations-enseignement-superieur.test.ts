import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  MANIFESTATIONS_HIGHER_EDUCATION_COMPARISON_QUESTION,
  MANIFESTATIONS_HIGHER_EDUCATION_DOCUMENTS,
} from "../lib/pedagogical-reference/manifestations-socioculturelles-enseignement-superieur.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("documente les développements de Laval et de McGill à partir d’annuaires historiques", () => {
  for (const document of MANIFESTATIONS_HIGHER_EDUCATION_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
    assert.match(document.rightsStatement, /domaine public/i);
    assert.equal(document.transcription.split(/[.!?](?:\s|$)/).filter((part) => part.trim()).length, 4);
  }
  assert.match(MANIFESTATIONS_HIGHER_EDUCATION_DOCUMENTS[0].transcription, /1852[\s\S]*théologie[\s\S]*Montréal/i);
  assert.match(MANIFESTATIONS_HIGHER_EDUCATION_DOCUMENTS[1].transcription, /1852[\s\S]*sciences appliquées[\s\S]*Donalda/i);
});

test("demande explicitement une similitude et une différence", () => {
  assert.deepEqual(validateApprovedQuestion(MANIFESTATIONS_HIGHER_EDUCATION_COMPARISON_QUESTION), {});
  assert.equal(
    MANIFESTATIONS_HIGHER_EDUCATION_COMPARISON_QUESTION.prompt,
    "Comparez le développement de l’enseignement supérieur francophone et anglophone au Québec entre 1852 et 1896. Indiquez une similitude et une différence.",
  );
  assert.equal(MANIFESTATIONS_HIGHER_EDUCATION_COMPARISON_QUESTION.operationId, "differences_and_similarities");
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MANIFESTATIONS_HIGHER_EDUCATION_COMPARISON_QUESTION.id));
});

test("publie l’aperçu avec deux tableaux comparables", () => {
  const session = createDemoStudentLearningSession(
    "demo-activity-manifestations-enseignement-superieur",
    "manifestations-socioculturelles",
  );
  assert.ok(session);
  assert.equal(session.questions[0]?.id, MANIFESTATIONS_HIGHER_EDUCATION_COMPARISON_QUESTION.id);
  assert.equal(session.questions[0]?.intellectualOperations[0]?.label, "Dégager des différences et des similitudes");
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["MSC-D-002", "MSC-D-003"]);
  assert.deepEqual(session.documentCatalog.map(({ content }) => content.kind), ["comparison_table", "comparison_table"]);
});
