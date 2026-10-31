import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT,
  EGLISE_SYSTEME_SCOLAIRE_COMPOSITION_QUESTION,
} from "../lib/pedagogical-reference/eglise-systeme-scolaire-composition-religieuse.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("documente la composition religieuse du Québec au recensement de 1871", () => {
  assert.deepEqual(validateHistoricalDocument(EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT), {});
  assert.match(EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT.transcription, /1 019 850/);
  assert.match(EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT.transcription, /1 191 516/);
  assert.match(EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT.interpretationCautions.join(" "), /regroupement pédagogique/i);
});

test("relie deux documents à la composition religieuse de la population", () => {
  assert.deepEqual(validateApprovedQuestion(EGLISE_SYSTEME_SCOLAIRE_COMPOSITION_QUESTION), {});
  assert.deepEqual(EGLISE_SYSTEME_SCOLAIRE_COMPOSITION_QUESTION.historicalDocumentIds, ["EGL-D-005", "EGL-S-006"]);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === EGLISE_SYSTEME_SCOLAIRE_COMPOSITION_QUESTION.id));
});

test("publie la question et ses deux documents dans une séance", () => {
  const session = createDemoStudentLearningSession(
    "demo-activity-eglise-systeme-scolaire-composition-religieuse",
    "presence-de-l-eglise-catholique",
  );
  assert.ok(session);
  assert.equal(session.questions[0]?.id, EGLISE_SYSTEME_SCOLAIRE_COMPOSITION_QUESTION.id);
  assert.equal(session.questions[0]?.documentRelations.length, 2);
  assert.equal(session.documentCatalog.length, 2);
  assert.equal(session.documentCatalog.find(({ id }) => id === "EGL-S-006")?.content.kind, "comparison_table");
});
