import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { RIEL_RESISTANCE_DOCUMENTS, RIEL_TRIAL_PHOTOGRAPH } from "../lib/pedagogical-reference/riel-resistance-documents.ts";
import { RIEL_RESISTANCE_CAUSES_QUESTION } from "../lib/pedagogical-reference/riel-resistance-question.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("Riel causes question connects a trial photograph and translated primary testimony", () => {
  const q = RIEL_RESISTANCE_CAUSES_QUESTION;
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === q.id));
  assert.equal(q.operationId, "causes_and_consequences");
  assert.match(q.prompt, /^Selon Louis Riel/);
  assert.deepEqual(q.historicalDocumentIds, ["RFP-I-003", "RFP-T-010"]);
  for (const document of RIEL_RESISTANCE_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
    assert.ok(ACTE_UNION_DOCUMENTS.some(({ id }) => id === document.id));
  }
  assert.ok(existsSync(new URL(`../public${RIEL_TRIAL_PHOTOGRAPH.assetUrl}`, import.meta.url)));
  const content = ACTE_UNION_DOCUMENTS.find(({ id }) => id === "RFP-I-003")!.content;
  assert.equal(content.kind, "historical_image");
  if (content.kind === "historical_image") assert.match(content.visibleCaption ?? "", /Fitzpatrick/);
  assert.equal(q.review.approvedAt, null);
});
