import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  POLITIQUE_NATIONALE_CAUSAL_LINKS_DOCUMENTS,
  POLITIQUE_NATIONALE_CAUSAL_LINKS_NEW_DOCUMENTS,
  POLITIQUE_NATIONALE_TARIFF_RAILWAY_SETTLEMENT_CAUSAL_QUESTION,
} from "../lib/pedagogical-reference/politique-nationale-causal-links.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

function sentenceCount(text: string) {
  return text.match(/[.!?](?:\s|$)/g)?.length ?? 0;
}

test("la question fait établir des liens de causalité entre les trois composantes", () => {
  assert.deepEqual(validateApprovedQuestion(POLITIQUE_NATIONALE_TARIFF_RAILWAY_SETTLEMENT_CAUSAL_QUESTION), {});
  assert.equal(POLITIQUE_NATIONALE_TARIFF_RAILWAY_SETTLEMENT_CAUSAL_QUESTION.operationId, "causal_connections");
  assert.match(POLITIQUE_NATIONALE_TARIFF_RAILWAY_SETTLEMENT_CAUSAL_QUESTION.prompt, /tarifs douaniers.*chemin de fer Canadien Pacifique.*colonisation de l’Ouest/i);
  assert.deepEqual(POLITIQUE_NATIONALE_TARIFF_RAILWAY_SETTLEMENT_CAUSAL_QUESTION.historicalDocumentIds, ["PN-T-001", "PN-T-003", "PN-T-004"]);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === POLITIQUE_NATIONALE_TARIFF_RAILWAY_SETTLEMENT_CAUSAL_QUESTION.id));
});

test("les trois documents historiques comptent chacun trois ou quatre phrases", () => {
  assert.equal(POLITIQUE_NATIONALE_CAUSAL_LINKS_DOCUMENTS.length, 3);
  for (const document of POLITIQUE_NATIONALE_CAUSAL_LINKS_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
    assert.ok(sentenceCount(document.transcription) >= 3);
    assert.ok(sentenceCount(document.transcription) <= 4);
    assert.ok(ACTE_UNION_DOCUMENTS.some(({ id }) => id === document.id));
  }
  assert.equal(POLITIQUE_NATIONALE_CAUSAL_LINKS_NEW_DOCUMENTS.length, 2);
});

test("l’aperçu élève présente la question et ses trois documents", () => {
  const session = createDemoStudentLearningSession("demo-activity-politique-nationale-causalite", "politique-nationale");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, POLITIQUE_NATIONALE_TARIFF_RAILWAY_SETTLEMENT_CAUSAL_QUESTION.id);
  assert.deepEqual(session.documentCatalog.map(({ id }) => id), ["PN-T-003", "PN-T-004", "PN-T-001"]);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["PN-T-001", "PN-T-003", "PN-T-004"]);
});
