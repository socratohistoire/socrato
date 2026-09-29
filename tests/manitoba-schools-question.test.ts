import test from "node:test";
import assert from "node:assert/strict";
import { MANITOBA_SCHOOLS_DOCUMENT, FEDERAL_PROVINCIAL_RELATIONS_PRIMARY_DOCUMENTS } from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { MANITOBA_SCHOOLS_CONFLICT_QUESTION, PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("Manitoba schools question explains provincial authority and conditional federal remedy", () => {
  const q = MANITOBA_SCHOOLS_CONFLICT_QUESTION;
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === q.id));
  assert.deepEqual(q.historicalDocumentIds, ["RFP-T-006"]);
  assert.equal(q.operationId, "causal_connections");
  assert.match(q.expectedAnswer, /1890/);
  assert.match(q.expectedAnswer, /autonomie/);
  assert.match(q.expectedAnswer, /certaines conditions/);
  assert.equal(q.review.approvedAt, null);
  assert.ok(FEDERAL_PROVINCIAL_RELATIONS_PRIMARY_DOCUMENTS.some(({ id }) => id === "RFP-T-006"));
  assert.deepEqual(validateHistoricalDocument(MANITOBA_SCHOOLS_DOCUMENT), {});
  for (const text of ["exclusivement", "minorité", "appel", "ne serait pas dûment", "lois propres à y remédier"]) assert.ok(MANITOBA_SCHOOLS_DOCUMENT.transcription.includes(text));
});
