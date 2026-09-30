import test from "node:test";
import assert from "node:assert/strict";
import { PROVINCIAL_DISALLOWANCE_QUESTION as question, PROVINCIAL_DISALLOWANCE_ACT_DOCUMENT as document } from "../lib/pedagogical-reference/provincial-disallowance.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("désaveu : question causale avec loi et journal primaires, sans doublon", () => {
  assert.equal(question.prompt, "Pourquoi le pouvoir du gouvernement fédéral de désavouer une loi provinciale suscite-t-il l’opposition de dirigeants provinciaux?");
  assert.equal(question.operationId, "causes_and_consequences");
  assert.equal(PEDAGOGICAL_QUESTION_CATALOG.filter(({id}) => id === question.id).length, 1);
  assert.deepEqual(question.historicalDocumentIds, ["RFP-T-014", "RFP-T-012"]);
  assert.deepEqual(validateHistoricalDocument(document), {});
  for (const id of question.historicalDocumentIds) {
    const matches = ACTE_UNION_DOCUMENTS.filter(d => d.id === id);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].content.kind, "historical_excerpt");
    assert.ok(matches[0].intellectualOperationIds.includes(question.operationId));
  }
  assert.match(document.transcription, /Art. 90[\s\S]*désaveu/);
  assert.match(document.transcription, /Art. 92[\s\S]*exclusivement/);
  assert.match(question.expectedAnswer, /autonomie/);
  assert.match(question.expectedAnswer, /tribunal/);
});
