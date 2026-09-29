import test from "node:test";
import assert from "node:assert/strict";
import { NEW_BRUNSWICK_SCHOOLS_DOCUMENT } from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { NEW_BRUNSWICK_SCHOOLS_CHANGE_QUESTION, PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("New Brunswick question links three primary speech sentences and a nuanced answer", () => {
  const q = NEW_BRUNSWICK_SCHOOLS_CHANGE_QUESTION;
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === q.id));
  assert.deepEqual(q.historicalDocumentIds, ["RFP-T-007"]);
  assert.equal(q.operationId, "establish_facts");
  assert.match(q.expectedAnswer, /non confessionnelles/);
  assert.match(q.expectedAnswer, /financement/);
  assert.equal(q.review.approvedAt, null);
  assert.deepEqual(validateHistoricalDocument(NEW_BRUNSWICK_SCHOOLS_DOCUMENT), {});
  assert.equal(NEW_BRUNSWICK_SCHOOLS_DOCUMENT.transcription.split(/[.!?]+/).filter(part => part.trim()).length, 3);
  assert.match(NEW_BRUNSWICK_SCHOOLS_DOCUMENT.historicalDate, /14 mai 1873/);
});
