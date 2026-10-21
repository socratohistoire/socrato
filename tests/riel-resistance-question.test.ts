import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { RIEL_RESISTANCE_DOCUMENTS, RIEL_TRIAL_PHOTOGRAPH } from "../lib/pedagogical-reference/riel-resistance-documents.ts";
import { RIEL_RESISTANCE_CAUSES_QUESTION } from "../lib/pedagogical-reference/riel-resistance-question.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("Riel causes question adds an execution document that students must discriminate", () => {
  const q = RIEL_RESISTANCE_CAUSES_QUESTION;
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === q.id));
  assert.equal(q.operationId, "causes_and_consequences");
  assert.equal(q.prompt, "Nomme deux causes qui auraient contribué au deuxième soulèvement des Métis en 1885.");
  assert.match(q.expectedAnswer, /Une courte énumération de deux causes justes suffit/);
  assert.deepEqual(q.historicalDocumentIds, ["RFP-I-003", "RFP-T-010", "RFP-T-021", "RFP-T-004"]);
  assert.match(q.expectedAnswer, /arpentage/i);
  assert.match(q.expectedAnswer, /colons|terres/i);
  assert.match(q.expectedAnswer, /pression foncière forme un seul élément/i);
  assert.match(q.expectedAnswer, /échec des pétitions/i);
  assert.match(q.expectedAnswer, /deux causes séparées/i);
  assert.match(q.expectedAnswer, /document 4/i);
  assert.match(q.expectedAnswer, /conséquence et non une cause/i);
  assert.match(q.expectedAnswer, /erreur chronologique/i);
  assert.match(q.expectedAnswer, /Conserver toute autre cause juste/i);
  for (const document of RIEL_RESISTANCE_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
    assert.ok(ACTE_UNION_DOCUMENTS.some(({ id }) => id === document.id));
  }
  assert.ok(existsSync(new URL(`../public${RIEL_TRIAL_PHOTOGRAPH.assetUrl}`, import.meta.url)));
  const content = ACTE_UNION_DOCUMENTS.find(({ id }) => id === "RFP-I-003")!.content;
  assert.equal(content.kind, "historical_image");
  if (content.kind === "historical_image") assert.match(content.visibleCaption ?? "", /Louis Riel.*jury/);
  assert.equal(q.review.approvedAt, null);
});
