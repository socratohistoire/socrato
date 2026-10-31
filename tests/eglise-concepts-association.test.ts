import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  EGLISE_CONCEPTS_ASSOCIATION_DOCUMENTS,
  EGLISE_CONCEPTS_ASSOCIATION_QUESTION,
  EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT,
} from "../lib/pedagogical-reference/eglise-concepts-association.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("associe quatre documents distincts aux quatre concepts", () => {
  assert.deepEqual(validateApprovedQuestion(EGLISE_CONCEPTS_ASSOCIATION_QUESTION), {});
  assert.equal(EGLISE_CONCEPTS_ASSOCIATION_QUESTION.format, "interactive-association");
  assert.deepEqual(EGLISE_CONCEPTS_ASSOCIATION_QUESTION.associationInteraction.targets.map(({ label }) => label), [
    "Anticléricalisme",
    "Ultramontanisme",
    "Dualisme confessionnel",
    "Nationalisme de survivance",
  ]);
  assert.equal(EGLISE_CONCEPTS_ASSOCIATION_QUESTION.associationInteraction.items.length, 4);
  assert.ok(EGLISE_CONCEPTS_ASSOCIATION_QUESTION.associationInteraction.items.every(({ documentId }) => documentId));
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === EGLISE_CONCEPTS_ASSOCIATION_QUESTION.id));
});

test("documente le schéma du dualisme comme une reconstitution fondée sur la loi de 1869", () => {
  assert.deepEqual(validateHistoricalDocument(EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT), {});
  assert.match(EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT.sourceLocator, /1869[\s\S]*chapitre 16[\s\S]*article 2/i);
  assert.match(EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT.rightsStatement, /schéma de synthèse[\s\S]*ne s’agit pas d’un schéma publié au XIXe siècle/i);
  assert.deepEqual(EGLISE_CONCEPTS_ASSOCIATION_DOCUMENTS.map(({ id }) => id), ["EGL-T-002", "EGL-D-005", "EGL-T-001", "EGL-T-003"]);
  const nationalismeDocument = EGLISE_CONCEPTS_ASSOCIATION_DOCUMENTS.find(({ id }) => id === "EGL-T-003");
  assert.ok(nationalismeDocument);
  assert.doesNotMatch(nationalismeDocument.transcription, /\bnation(?:alité)?\b/i);
  assert.match(nationalismeDocument.transcription, /\[peuple\]|\[la collectivité\]/i);
});

test("publie une séance interactive avec les quatre documents intégrés", () => {
  const session = createDemoStudentLearningSession(
    "demo-activity-eglise-concepts-association",
    "presence-de-l-eglise-catholique",
  );
  assert.ok(session);
  assert.equal(session.questions[0]?.id, EGLISE_CONCEPTS_ASSOCIATION_QUESTION.id);
  assert.equal(session.questions[0]?.type, "interactive_association");
  assert.equal(session.questions[0]?.documentRelations.length, 4);
  assert.equal(session.documentCatalog.length, 4);
  assert.equal(session.documentCatalog.find(({ id }) => id === "EGL-D-005")?.content.kind, "historical_image");
});
