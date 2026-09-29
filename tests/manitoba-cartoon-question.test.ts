import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { MANITOBA_NEGOTIATION_CARTOON, MANITOBA_CARTOON_TRANSLATION } from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { MANITOBA_CARTOON_INTERPRETATION_QUESTION, PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("Manitoba cartoon exposes the tomb translation to students and preserves chronology", () => {
  const q = MANITOBA_CARTOON_INTERPRETATION_QUESTION;
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === q.id));
  assert.deepEqual(q.historicalDocumentIds, ["RFP-I-002"]);
  assert.match(q.expectedAnswer, /précède l’accord/);
  assert.deepEqual(validateHistoricalDocument(MANITOBA_NEGOTIATION_CARTOON), {});
  assert.ok(existsSync(new URL(`../public${MANITOBA_NEGOTIATION_CARTOON.assetUrl}`, import.meta.url)));
  const content = ACTE_UNION_DOCUMENTS.find(({ id }) => id === "RFP-I-002")!.content;
  assert.equal(content.kind, "historical_image");
  if (content.kind === "historical_image") assert.equal(content.visibleCaption, MANITOBA_CARTOON_TRANSLATION);
  assert.match(MANITOBA_CARTOON_TRANSLATION, /Ici repose pour de bon/);
});
