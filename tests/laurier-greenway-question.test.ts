import test from "node:test";
import assert from "node:assert/strict";
import { LAURIER_GREENWAY_AGREEMENT_DOCUMENT } from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { LAURIER_GREENWAY_RESTORATION_QUESTION, PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("Laurier-Greenway comparison distinguishes conditional concessions from restoration", () => {
  const q = LAURIER_GREENWAY_RESTORATION_QUESTION;
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === q.id));
  assert.deepEqual(q.historicalDocumentIds, ["RFP-T-006", "RFP-T-008"]);
  assert.equal(q.operationId, "changes_and_continuities");
  assert.equal(q.prompt, "Quelles concessions le compromis Laurier-Greenway de 1896 accorde-t-il à la minorité catholique du Manitoba, et pourquoi ne répondent-elles pas entièrement à ses revendications scolaires?");
  assert.match(q.instruction, /explique leurs limites/);
  assert.match(q.expectedAnswer, /ne rétablit pas/);
  assert.equal(q.sourceCatalog.length, 2);
  assert.equal(q.review.approvedAt, null);
  assert.deepEqual(validateHistoricalDocument(LAURIER_GREENWAY_AGREEMENT_DOCUMENT), {});
  assert.match(LAURIER_GREENWAY_AGREEMENT_DOCUMENT.transcription, /Aucune séparation/);
  assert.match(LAURIER_GREENWAY_AGREEMENT_DOCUMENT.rightsStatement, /Traduction française/);
});
