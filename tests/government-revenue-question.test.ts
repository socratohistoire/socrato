import test from "node:test";
import assert from "node:assert/strict";
import { FEDERAL_REVENUE_TABLE, GOVERNMENT_REVENUE_DOCUMENTS, PROVINCIAL_REVENUE_TABLE } from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { GOVERNMENT_REVENUE_COMPARISON_QUESTION, PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("Revenue comparison asks for one difference and one similarity", () => {
  const q = GOVERNMENT_REVENUE_COMPARISON_QUESTION;
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === q.id));
  assert.deepEqual(q.historicalDocumentIds, ["RFP-S-001", "RFP-T-009"]);
  assert.equal(q.operationId, "differences_and_similarities");
  assert.match(q.prompt, /une différence et une similitude/);
  assert.match(q.expectedAnswer, /les deux ordres de gouvernement peuvent prélever des taxes/);
  assert.equal(q.sourceCatalog.length, 2);
  assert.equal(q.review.approvedAt, null);
  for (const document of GOVERNMENT_REVENUE_DOCUMENTS) assert.deepEqual(validateHistoricalDocument(document), {});
  assert.match(FEDERAL_REVENUE_TABLE.rows[0].value, /757 409,97/);
  assert.equal(FEDERAL_REVENUE_TABLE.rows.length, 5);
  assert.equal(ACTE_UNION_DOCUMENTS.find(({ id }) => id === "RFP-S-001")?.content.kind, "comparison_table");
  assert.equal(PROVINCIAL_REVENUE_TABLE.rows.length, 5);
  assert.equal(PROVINCIAL_REVENUE_TABLE.rows[0].value, "Dans la province, pour financer des responsabilités provinciales.");
  assert.equal(ACTE_UNION_DOCUMENTS.find(({ id }) => id === "RFP-T-009")?.content.kind, "comparison_table");
  assert.match(GOVERNMENT_REVENUE_DOCUMENTS[1].transcription, /tous modes[\s\S]*taxation directe[\s\S]*terres[\s\S]*forêts[\s\S]*subventions/);
});
