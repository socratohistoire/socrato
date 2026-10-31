import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  EGLISE_BOURGET_SOCIETE_CIVILE_DOCUMENT,
  EGLISE_DESSAULLES_LIBERTE_CITOYEN_DOCUMENT,
  EGLISE_ULTRAMONTAINS_ANTICLERICAUX_DOCUMENTS,
  EGLISE_ULTRAMONTAINS_ANTICLERICAUX_QUESTION,
} from "../lib/pedagogical-reference/eglise-ultramontains-anticlericaux.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("présente deux sources primaires opposées en quatre phrases chacune", () => {
  assert.deepEqual(EGLISE_ULTRAMONTAINS_ANTICLERICAUX_DOCUMENTS.map(({ id }) => id), ["EGL-T-001", "EGL-T-002"]);
  for (const document of EGLISE_ULTRAMONTAINS_ANTICLERICAUX_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
  }
  const countSentences = (text: string) => text.replace(/[«»]/g, "").split(/[.!?](?:\s|$)/).filter((part) => part.trim()).length;
  assert.equal(countSentences(EGLISE_BOURGET_SOCIETE_CIVILE_DOCUMENT.transcription), 4);
  assert.equal(countSentences(EGLISE_DESSAULLES_LIBERTE_CITOYEN_DOCUMENT.transcription), 4);
  assert.match(EGLISE_BOURGET_SOCIETE_CIVILE_DOCUMENT.transcription, /approuvées par l’Église[\s\S]*pasteurs[\s\S]*institut littéraire[\s\S]*jetés au feu/i);
  assert.match(EGLISE_DESSAULLES_LIBERTE_CITOYEN_DOCUMENT.transcription, /clergé comme corps religieux[\s\S]*domaine temporel[\s\S]*liberté de penser[\s\S]*censure des livres/i);
});

test("demande d’expliquer une divergence sans révéler les positions", () => {
  assert.deepEqual(validateApprovedQuestion(EGLISE_ULTRAMONTAINS_ANTICLERICAUX_QUESTION), {});
  assert.equal(
    EGLISE_ULTRAMONTAINS_ANTICLERICAUX_QUESTION.prompt,
    "Expliquez une divergence entre les ultramontains et les anticléricaux concernant l’organisation de la société québécoise au XIXe siècle.",
  );
  assert.equal(EGLISE_ULTRAMONTAINS_ANTICLERICAUX_QUESTION.operationId, "differences_and_similarities");
  assert.match(EGLISE_ULTRAMONTAINS_ANTICLERICAUX_QUESTION.expectedAnswer, /lecture[\s\S]*bibliothèques[\s\S]*liberté de penser[\s\S]*censure religieuse/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === EGLISE_ULTRAMONTAINS_ANTICLERICAUX_QUESTION.id));
});

test("publie l’aperçu avec les deux documents dans l’ordre", () => {
  const session = createDemoStudentLearningSession(
    "demo-activity-eglise-ultramontains-anticlericaux",
    "presence-de-l-eglise-catholique",
  );
  assert.ok(session);
  assert.equal(session.questions[0]?.id, EGLISE_ULTRAMONTAINS_ANTICLERICAUX_QUESTION.id);
  assert.equal(session.questions[0]?.intellectualOperations[0]?.label, "Dégager des différences et des similitudes");
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["EGL-T-001", "EGL-T-002"]);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ displayOrder }) => displayOrder), [1, 2]);
});
