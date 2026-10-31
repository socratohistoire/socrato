import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import {
  POLITIQUE_NATIONALE_OBJECTIVES_ICONOGRAPHIC_DOCUMENTS,
  POLITIQUE_NATIONALE_OBJECTIVES_ICONOGRAPHIC_QUESTION,
} from "../lib/pedagogical-reference/politique-nationale-objectives-iconography.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("la question fait décrire deux objectifs à partir de trois sources iconographiques", () => {
  assert.deepEqual(validateApprovedQuestion(POLITIQUE_NATIONALE_OBJECTIVES_ICONOGRAPHIC_QUESTION), {});
  assert.equal(POLITIQUE_NATIONALE_OBJECTIVES_ICONOGRAPHIC_QUESTION.prompt, "Décris deux objectifs recherchés par le gouvernement en adoptant la Politique nationale en 1879.");
  assert.equal(POLITIQUE_NATIONALE_OBJECTIVES_ICONOGRAPHIC_QUESTION.operationId, "establish_facts");
  assert.deepEqual(POLITIQUE_NATIONALE_OBJECTIVES_ICONOGRAPHIC_QUESTION.historicalDocumentIds, ["PN-I-002", "PN-I-003", "PN-I-004"]);
  assert.deepEqual(POLITIQUE_NATIONALE_OBJECTIVES_ICONOGRAPHIC_QUESTION.distractors, []);
  assert.match(POLITIQUE_NATIONALE_OBJECTIVES_ICONOGRAPHIC_QUESTION.expectedAnswer, /protéger et à développer la production canadienne/i);
  assert.match(POLITIQUE_NATIONALE_OBJECTIVES_ICONOGRAPHIC_QUESTION.expectedAnswer, /intégrer, peupler et mettre en valeur l’Ouest/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === POLITIQUE_NATIONALE_OBJECTIVES_ICONOGRAPHIC_QUESTION.id));
});

test("les trois nouvelles sources primaires iconographiques sont disponibles", () => {
  assert.equal(POLITIQUE_NATIONALE_OBJECTIVES_ICONOGRAPHIC_DOCUMENTS.length, 3);
  for (const document of POLITIQUE_NATIONALE_OBJECTIVES_ICONOGRAPHIC_DOCUMENTS) {
    const sessionDocument = ACTE_UNION_DOCUMENTS.find(({ id }) => id === document.id);
    assert.ok(sessionDocument);
    assert.equal(sessionDocument.content.kind, "historical_image");
  }
});

test("l’aperçu élève présente les trois documents dans l’ordre", () => {
  const session = createDemoStudentLearningSession("demo-activity-politique-nationale-objectifs-1879", "politique-nationale");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, POLITIQUE_NATIONALE_OBJECTIVES_ICONOGRAPHIC_QUESTION.id);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["PN-I-002", "PN-I-003", "PN-I-004"]);
  assert.equal(session.questions[0]?.initialMessages[0]?.content, "J’attends ta réponse.");
});
