import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { RIEL_EXECUTION_DOCUMENTS } from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { PEDAGOGICAL_QUESTION_CATALOG, RIEL_EXECUTION_TENSIONS_QUESTION } from "../lib/pedagogical-reference/question-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("Riel question compares two opposing viewpoints with Lecomte's engraving", () => {
  const question = RIEL_EXECUTION_TENSIONS_QUESTION;
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === question.id));
  assert.deepEqual(question.historicalDocumentIds, ["RFP-I-001", "RFP-T-004", "RFP-T-029"]);
  assert.equal(question.operationId, "differences_and_similarities");
  assert.match(question.prompt, /Compare les deux points de vue/);
  assert.match(question.expectedAnswer, /martyr.*mérité son sort/);
  const [image, opposingExecution, supportingExecution] = RIEL_EXECUTION_DOCUMENTS;
  assert.equal(image.kind, "image");
  assert.equal(image.creator, "J. Lecomte");
  assert.ok(existsSync(new URL(`../public${image.assetUrl}`, import.meta.url)));
  assert.match(opposingExecution.transcription, /martyr/);
  assert.equal(opposingExecution.creator, "Honoré Mercier");
  assert.match(supportingExecution.transcription, /mérité son sort/);
  assert.equal(opposingExecution.transcription.split(/[.!?](?:\s|$)/).filter(Boolean).length, 4);
  assert.equal(supportingExecution.transcription.split(/[.!?](?:\s|$)/).filter(Boolean).length, 4);
  assert.match(supportingExecution.rightsStatement, /Adaptation française/);
  for (const document of RIEL_EXECUTION_DOCUMENTS) assert.deepEqual(validateHistoricalDocument(document), {});
});
