import test from "node:test";
import assert from "node:assert/strict";
import { FEDERAL_REVENUE_TABLE, GOVERNMENT_REVENUE_DOCUMENTS } from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { GOVERNMENT_REVENUE_COMPARISON_QUESTION, PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("Revenue comparison pairs a rendered primary table with a constitutional excerpt", () => {
  const q = GOVERNMENT_REVENUE_COMPARISON_QUESTION;
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === q.id));
  assert.deepEqual(q.historicalDocumentIds, ["RFP-S-001", "RFP-T-009"]);
  assert.equal(q.operationId, "differences_and_similarities");
  assert.match(q.expectedAnswer, /pas réservée exclusivement/);
  assert.equal(q.sourceCatalog.length, 2);
  assert.equal(q.review.approvedAt, null);
  for (const document of GOVERNMENT_REVENUE_DOCUMENTS) assert.deepEqual(validateHistoricalDocument(document), {});
  assert.equal(FEDERAL_REVENUE_TABLE.rows[0].value, "757 409,97");
  assert.equal(FEDERAL_REVENUE_TABLE.rows.length, 3);
  assert.equal(ACTE_UNION_DOCUMENTS.find(({ id }) => id === "RFP-S-001")?.content.kind, "comparison_table");
  assert.equal(ACTE_UNION_DOCUMENTS.find(({ id }) => id === "RFP-T-009")?.content.kind, "historical_excerpt");
});
