import test from "node:test";
import assert from "node:assert/strict";
import { MANITOBA_1870_DOCUMENT, FEDERAL_PROVINCIAL_RELATIONS_PRIMARY_DOCUMENTS } from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { MANITOBA_RESISTANCE_CONSEQUENCE_QUESTION, PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("Manitoba consequence question pairs a pertinent law with an unrelated railway excerpt", () => {
  const question = MANITOBA_RESISTANCE_CONSEQUENCE_QUESTION;
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === question.id));
  assert.deepEqual(question.historicalDocumentIds, ["RFP-T-005", "AANB-T-004"]);
  assert.equal(question.operationId, "causes_and_consequences");
  assert.match(question.instruction, /Un seul/);
  assert.match(question.expectedAnswer, /cinquième province/);
  assert.match(question.expectedAnswer, /document 2.*à écarter/);
  assert.equal(question.status, "ready-for-review");
  assert.equal(question.review.approvedAt, null);
  assert.ok(FEDERAL_PROVINCIAL_RELATIONS_PRIMARY_DOCUMENTS.some(({ id }) => id === "RFP-T-005"));
  assert.deepEqual(validateHistoricalDocument(MANITOBA_1870_DOCUMENT), {});
  assert.equal(MANITOBA_1870_DOCUMENT.transcription.split(/[.!?]+/).filter(part => part.trim()).length, 3);
  assert.match(MANITOBA_1870_DOCUMENT.sourceLocator, /articles 1, 4 et 9/);
});
