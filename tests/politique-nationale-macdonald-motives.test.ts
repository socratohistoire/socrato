import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  POLITIQUE_NATIONALE_MACDONALD_MOTIVES_DOCUMENT,
  POLITIQUE_NATIONALE_MACDONALD_MOTIVES_DOCUMENTS,
  POLITIQUE_NATIONALE_MACDONALD_MOTIVES_QUESTION,
} from "../lib/pedagogical-reference/politique-nationale-macdonald-motives.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("les deux extraits associés proviennent de John A. Macdonald", () => {
  assert.deepEqual(validateHistoricalDocument(POLITIQUE_NATIONALE_MACDONALD_MOTIVES_DOCUMENT), {});
  assert.match(POLITIQUE_NATIONALE_MACDONALD_MOTIVES_DOCUMENT.transcription, /^Elle rétablira/);
  assert.match(POLITIQUE_NATIONALE_MACDONALD_MOTIVES_DOCUMENT.transcription, /réciprocité commerciale\.$/);
  assert.equal(POLITIQUE_NATIONALE_MACDONALD_MOTIVES_DOCUMENTS.length, 2);
  for (const document of POLITIQUE_NATIONALE_MACDONALD_MOTIVES_DOCUMENTS) {
    assert.match(document.creator, /John A\. Macdonald/i);
    assert.ok(ACTE_UNION_DOCUMENTS.some(({ id }) => id === document.id));
  }
});

test("la question fait expliquer les motifs de Macdonald et discriminer le document sur la Confédération", () => {
  assert.deepEqual(validateApprovedQuestion(POLITIQUE_NATIONALE_MACDONALD_MOTIVES_QUESTION), {});
  assert.equal(POLITIQUE_NATIONALE_MACDONALD_MOTIVES_QUESTION.prompt, "Pourquoi John A. Macdonald propose-t-il la Politique nationale dans les années 1870?");
  assert.equal(POLITIQUE_NATIONALE_MACDONALD_MOTIVES_QUESTION.operationId, "causes_and_consequences");
  assert.deepEqual(POLITIQUE_NATIONALE_MACDONALD_MOTIVES_QUESTION.historicalDocumentIds, ["PN-T-005", "AANB-T-001"]);
  assert.deepEqual(POLITIQUE_NATIONALE_MACDONALD_MOTIVES_QUESTION.distractors, ["AANB-T-001"]);
  assert.match(POLITIQUE_NATIONALE_MACDONALD_MOTIVES_QUESTION.expectedAnswer, /industries|commerce/i);
  assert.doesNotMatch(POLITIQUE_NATIONALE_MACDONALD_MOTIVES_QUESTION.instruction, /écart|rejet|distracteur|discrim/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === POLITIQUE_NATIONALE_MACDONALD_MOTIVES_QUESTION.id));
});

test("l’aperçu élève présente les deux extraits et la question", () => {
  const session = createDemoStudentLearningSession("demo-activity-politique-nationale-macdonald-motifs", "politique-nationale");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, POLITIQUE_NATIONALE_MACDONALD_MOTIVES_QUESTION.id);
  assert.deepEqual(session.documentCatalog.map(({ id }) => id), ["PN-T-005", "AANB-T-001"]);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["PN-T-005", "AANB-T-001"]);
});
