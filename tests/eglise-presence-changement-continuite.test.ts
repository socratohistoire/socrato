import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  EGLISE_BOURGET_EDUCATION_1841_DOCUMENT,
  EGLISE_PRESENCE_CHANGEMENT_CONTINUITE_QUESTION,
} from "../lib/pedagogical-reference/eglise-presence-changement-continuite.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("documente la revendication éducative de Bourget en 1841", () => {
  assert.deepEqual(validateHistoricalDocument(EGLISE_BOURGET_EDUCATION_1841_DOCUMENT), {});
  assert.match(EGLISE_BOURGET_EDUCATION_1841_DOCUMENT.transcription, /éducation du peuple[\s\S]*influence/i);
  assert.match(EGLISE_BOURGET_EDUCATION_1841_DOCUMENT.sourceLocator, /p\. 7-8/);
  assert.match(EGLISE_BOURGET_EDUCATION_1841_DOCUMENT.title, /1841/);
  assert.match(EGLISE_BOURGET_EDUCATION_1841_DOCUMENT.rightsStatement, /domaine public/i);
});

test("demande un changement ou une continuité à partir de deux époques", () => {
  assert.deepEqual(validateApprovedQuestion(EGLISE_PRESENCE_CHANGEMENT_CONTINUITE_QUESTION), {});
  assert.equal(EGLISE_PRESENCE_CHANGEMENT_CONTINUITE_QUESTION.operationId, "changes_and_continuities");
  assert.match(EGLISE_PRESENCE_CHANGEMENT_CONTINUITE_QUESTION.prompt, /changement ou une continuité/);
  assert.deepEqual(EGLISE_PRESENCE_CHANGEMENT_CONTINUITE_QUESTION.historicalDocumentIds, ["EGL-T-007", "EGL-T-004"]);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === EGLISE_PRESENCE_CHANGEMENT_CONTINUITE_QUESTION.id));
});

test("publie la question et ses deux extraits dans une séance", () => {
  const session = createDemoStudentLearningSession(
    "demo-activity-eglise-presence-changement-continuite",
    "presence-de-l-eglise-catholique",
  );
  assert.ok(session);
  assert.equal(session.questions[0]?.id, EGLISE_PRESENCE_CHANGEMENT_CONTINUITE_QUESTION.id);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["EGL-T-007", "EGL-T-004"]);
  assert.equal(session.documentCatalog.length, 2);
});
