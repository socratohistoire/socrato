import test from "node:test";
import assert from "node:assert/strict";
import { LAURIER_GREENWAY_GREENWAY_SPEECH_DOCUMENT, LAURIER_GREENWAY_LAURIER_SPEECH_DOCUMENT } from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { LAURIER_GREENWAY_RESTORATION_QUESTION, PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("Laurier-Greenway interpretation defines the compromise through concessions and continuity", () => {
  const q = LAURIER_GREENWAY_RESTORATION_QUESTION;
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === q.id));
  assert.deepEqual(q.historicalDocumentIds, ["RFP-T-019", "RFP-T-020"]);
  assert.equal(q.operationId, "changes_and_continuities");
  assert.match(q.prompt, /une entente qui sera reconnue comme étant le compromis Laurier-Greenway/);
  assert.match(q.prompt, /un changement et une continuité/);
  assert.match(q.instruction, /un indice de chaque document/);
  assert.match(q.expectedAnswer, /Comme changement/);
  assert.match(q.expectedAnswer, /ne sont pas rétablies/);
  assert.equal(q.sourceCatalog.length, 2);
  assert.equal(q.review.approvedAt, null);
  assert.deepEqual(validateHistoricalDocument(LAURIER_GREENWAY_LAURIER_SPEECH_DOCUMENT), {});
  assert.deepEqual(validateHistoricalDocument(LAURIER_GREENWAY_GREENWAY_SPEECH_DOCUMENT), {});
  assert.match(LAURIER_GREENWAY_LAURIER_SPEECH_DOCUMENT.transcription, /enseignement de sa foi religieuse/);
  assert.match(LAURIER_GREENWAY_GREENWAY_SPEECH_DOCUMENT.transcription, /rétablir le système scolaire qui existait avant 1890/);
  assert.match(LAURIER_GREENWAY_LAURIER_SPEECH_DOCUMENT.rightsStatement, /transcrit fidèlement/);
  assert.match(LAURIER_GREENWAY_GREENWAY_SPEECH_DOCUMENT.rightsStatement, /Adaptation en français actuel/);
});
