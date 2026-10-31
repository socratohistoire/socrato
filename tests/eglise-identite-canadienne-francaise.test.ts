import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  EGLISE_IDENTITE_CANADIENNE_FRANCAISE_DOCUMENTS,
  EGLISE_IDENTITE_CANADIENNE_FRANCAISE_QUESTION,
  EGLISE_LAFLECHE_NATIONALITE_CATHOLIQUE_DOCUMENT,
  EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT,
} from "../lib/pedagogical-reference/eglise-identite-canadienne-francaise.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("présente deux documents de quatre phrases sur le peuple et l’éducation", () => {
  assert.deepEqual(EGLISE_IDENTITE_CANADIENNE_FRANCAISE_DOCUMENTS.map(({ id }) => id), ["EGL-T-003", "EGL-T-004"]);
  for (const document of EGLISE_IDENTITE_CANADIENNE_FRANCAISE_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
    assert.equal(document.transcription.split(/[.!?](?:\s|$)/).filter((part) => part.trim()).length, 4);
  }
  assert.match(EGLISE_LAFLECHE_NATIONALITE_CATHOLIQUE_DOCUMENT.transcription, /Canadiens français[\s\S]*mission[\s\S]*religieuse[\s\S]*peuple[\s\S]*catholique/i);
  assert.match(EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT.transcription, /enseignement de la religion[\s\S]*catéchisme[\s\S]*curé[\s\S]*comité catholique/i);
});

test("demande deux liens entre l’action de l’Église et la préservation de l’identité", () => {
  assert.deepEqual(validateApprovedQuestion(EGLISE_IDENTITE_CANADIENNE_FRANCAISE_QUESTION), {});
  assert.equal(
    EGLISE_IDENTITE_CANADIENNE_FRANCAISE_QUESTION.prompt,
    "Expliquez comment l’action de l’Église catholique contribue à la préservation de l’identité canadienne-française entre 1840 et 1896. Indiquez deux éléments.",
  );
  assert.equal(EGLISE_IDENTITE_CANADIENNE_FRANCAISE_QUESTION.operationId, "causal_connections");
  assert.match(EGLISE_IDENTITE_CANADIENNE_FRANCAISE_QUESTION.expectedAnswer, /nationalisme de survivance[\s\S]*enseignement religieux[\s\S]*jeunes générations/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === EGLISE_IDENTITE_CANADIENNE_FRANCAISE_QUESTION.id));
});

test("publie l’aperçu avec les deux documents dans l’ordre", () => {
  const session = createDemoStudentLearningSession(
    "demo-activity-eglise-identite-canadienne-francaise",
    "presence-de-l-eglise-catholique",
  );
  assert.ok(session);
  assert.equal(session.questions[0]?.id, EGLISE_IDENTITE_CANADIENNE_FRANCAISE_QUESTION.id);
  assert.equal(session.questions[0]?.intellectualOperations[0]?.label, "Établir des liens de causalité");
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["EGL-T-003", "EGL-T-004"]);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ displayOrder }) => displayOrder), [1, 2]);
});
