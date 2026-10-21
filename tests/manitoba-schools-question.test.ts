import test from "node:test";
import assert from "node:assert/strict";
import { MANITOBA_SCHOOLS_DOCUMENT, TACHE_MANITOBA_SCHOOLS_VIEWPOINT_DOCUMENT, FEDERAL_PROVINCIAL_RELATIONS_PRIMARY_DOCUMENTS } from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { MANITOBA_SCHOOLS_CONFLICT_QUESTION, PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("Manitoba schools question explains provincial authority and conditional federal remedy", () => {
  const q = MANITOBA_SCHOOLS_CONFLICT_QUESTION;
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === q.id));
  assert.deepEqual(q.historicalDocumentIds, ["RFP-T-006", "RFP-T-018"]);
  assert.equal(q.operationId, "causal_connections");
  assert.match(q.expectedAnswer, /1890/);
  assert.match(q.expectedAnswer, /grief scolaire, recours fédéral et tension avec l’autonomie provinciale/);
  assert.match(q.expectedAnswer, /Ne pas exiger le nom de Taché/);
  assert.match(q.instruction, /chaîne causale/);
  assert.equal(q.review.approvedAt, null);
  assert.ok(FEDERAL_PROVINCIAL_RELATIONS_PRIMARY_DOCUMENTS.some(({ id }) => id === "RFP-T-006"));
  assert.deepEqual(validateHistoricalDocument(MANITOBA_SCHOOLS_DOCUMENT), {});
  assert.deepEqual(validateHistoricalDocument(TACHE_MANITOBA_SCHOOLS_VIEWPOINT_DOCUMENT), {});
  for (const text of ["province est responsable", "minorités", "appel", "Parlement du Canada", "corriger la situation"]) assert.ok(MANITOBA_SCHOOLS_DOCUMENT.transcription.includes(text));
  assert.match(MANITOBA_SCHOOLS_DOCUMENT.rightsStatement, /Adaptation en français actuel/);
  assert.match(TACHE_MANITOBA_SCHOOLS_VIEWPOINT_DOCUMENT.transcription, /autorités fédérales.*catholiques.*protestants/);
  assert.equal(TACHE_MANITOBA_SCHOOLS_VIEWPOINT_DOCUMENT.transcription.match(/\[…\]/g)?.length, 2);
});
