import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  POLITIQUE_NATIONALE_TARIFF_COMPARISON_DOCUMENTS,
  POLITIQUE_NATIONALE_TARIFF_EFFECTS_COMPARISON_QUESTION,
} from "../lib/pedagogical-reference/politique-nationale-tariff-comparison.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

function sentenceCount(text: string) {
  return text.match(/[.!?](?:\s|$)/g)?.length ?? 0;
}

test("la comparaison du tarif protecteur est une question notionnelle prête à réviser", () => {
  assert.deepEqual(validateApprovedQuestion(POLITIQUE_NATIONALE_TARIFF_EFFECTS_COMPARISON_QUESTION), {});
  assert.equal(POLITIQUE_NATIONALE_TARIFF_EFFECTS_COMPARISON_QUESTION.prompt, "Après l’adoption du tarif protecteur de la Politique nationale en 1879, compare un effet de ce tarif pour un manufacturier du Québec ou de l’Ontario et pour un agriculteur des Prairies.");
  assert.equal(POLITIQUE_NATIONALE_TARIFF_EFFECTS_COMPARISON_QUESTION.operationId, "differences_and_similarities");
  assert.deepEqual(POLITIQUE_NATIONALE_TARIFF_EFFECTS_COMPARISON_QUESTION.historicalDocumentIds, ["PN-T-001", "PN-T-002"]);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === POLITIQUE_NATIONALE_TARIFF_EFFECTS_COMPARISON_QUESTION.id));
});

test("les deux extraits historiques comptent chacun trois ou quatre phrases", () => {
  assert.equal(POLITIQUE_NATIONALE_TARIFF_COMPARISON_DOCUMENTS.length, 2);
  for (const document of POLITIQUE_NATIONALE_TARIFF_COMPARISON_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
    assert.ok(sentenceCount(document.transcription) >= 3);
    assert.ok(sentenceCount(document.transcription) <= 4);
    assert.match(document.rightsStatement, /traduction et adaptation pédagogique/i);
    assert.ok(ACTE_UNION_DOCUMENTS.some(({ id }) => id === document.id));
  }
});

test("la page élève de démonstration présente la question et ses deux documents", () => {
  const session = createDemoStudentLearningSession("demo-activity-politique-nationale", "politique-nationale");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, POLITIQUE_NATIONALE_TARIFF_EFFECTS_COMPARISON_QUESTION.id);
  assert.deepEqual(session.documentCatalog.map(({ id }) => id), ["PN-T-001", "PN-T-002"]);
});
