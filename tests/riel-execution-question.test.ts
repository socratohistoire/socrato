import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { RIEL_EXECUTION_DOCUMENTS } from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { PEDAGOGICAL_QUESTION_CATALOG, RIEL_EXECUTION_TENSIONS_QUESTION } from "../lib/pedagogical-reference/question-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("Riel question links an authentic commemorative image and three speech sentences", () => {
  const question = RIEL_EXECUTION_TENSIONS_QUESTION;
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === question.id));
  assert.deepEqual(question.historicalDocumentIds, ["RFP-I-001", "RFP-T-004"]);
  assert.equal(question.operationId, "causal_connections");
  assert.match(question.prompt, /une partie/);
  assert.match(question.expectedAnswer, /ni l’unanimité/);
  const [image, speech] = RIEL_EXECUTION_DOCUMENTS;
  assert.equal(image.kind, "image");
  assert.ok(existsSync(new URL(`../public${image.assetUrl}`, import.meta.url)));
  assert.equal(speech.transcription.split(/[.!?]+/).filter(part => part.trim()).length, 3);
  assert.equal((speech.transcription.match(/\[…\]/g) ?? []).length, 2);
  assert.ok(speech.interpretationCautions.some(note => note.includes("adversaire politique")));
  for (const document of RIEL_EXECUTION_DOCUMENTS) assert.deepEqual(validateHistoricalDocument(document), {});
});
