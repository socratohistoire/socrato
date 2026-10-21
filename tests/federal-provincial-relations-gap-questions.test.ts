import assert from "node:assert/strict";
import test from "node:test";
import {
  FEDERAL_PROVINCIAL_RELATIONS_GAP_QUESTIONS,
  FEDERAL_SCHOOL_CRISIS_RESPONSES_COMPARISON_QUESTION,
  MACDONALD_NEW_BRUNSWICK_SCHOOLS_RESPONSE_DOCUMENT,
  METIS_RESISTANCES_CONSEQUENCES_COMPARISON_QUESTION,
  PEDAGOGICAL_QUESTION_CATALOG,
  validateApprovedQuestion,
} from "../lib/pedagogical-reference/index.ts";
import { FEDERAL_PROVINCIAL_RELATIONS_PRIMARY_DOCUMENTS } from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";

test("ajoute les deux questions qui complètent la notion", () => {
  assert.deepEqual(FEDERAL_PROVINCIAL_RELATIONS_GAP_QUESTIONS.map(({ id }) => id), [
    "question:relations-federales-provinciales:document-interpretation-015",
    "question:relations-federales-provinciales:document-interpretation-017",
  ]);
  assert.deepEqual(FEDERAL_PROVINCIAL_RELATIONS_GAP_QUESTIONS.map(({ historicalDocumentIds }) => historicalDocumentIds.length), [2, 2]);
  assert.ok(FEDERAL_PROVINCIAL_RELATIONS_GAP_QUESTIONS.every((question) => Object.keys(validateApprovedQuestion(question)).length === 0));
  assert.ok(FEDERAL_PROVINCIAL_RELATIONS_GAP_QUESTIONS.every(({ id }) => PEDAGOGICAL_QUESTION_CATALOG.some((question) => question.id === id)));
});

test("compare les conséquences des deux résistances métisses à partir de deux extraits", () => {
  assert.deepEqual(METIS_RESISTANCES_CONSEQUENCES_COMPARISON_QUESTION.historicalDocumentIds, ["RFP-T-005", "RFP-T-002"]);
  assert.equal(METIS_RESISTANCES_CONSEQUENCES_COMPARISON_QUESTION.operationId, "differences_and_similarities");
  assert.match(METIS_RESISTANCES_CONSEQUENCES_COMPARISON_QUESTION.prompt, /conséquences.*1869-1870.*1885/);
});

test("compare la non-intervention au Nouveau-Brunswick au compromis manitobain", () => {
  assert.deepEqual(FEDERAL_SCHOOL_CRISIS_RESPONSES_COMPARISON_QUESTION.historicalDocumentIds, ["RFP-T-028", "RFP-T-017"]);
  assert.equal(FEDERAL_SCHOOL_CRISIS_RESPONSES_COMPARISON_QUESTION.operationId, "differences_and_similarities");
  assert.match(FEDERAL_SCHOOL_CRISIS_RESPONSES_COMPARISON_QUESTION.prompt, /^Compare.*Nouveau-Brunswick.*Manitoba/);
  assert.doesNotMatch(FEDERAL_SCHOOL_CRISIS_RESPONSES_COMPARISON_QUESTION.prompt, /À partir des deux documents/);
  assert.doesNotMatch(FEDERAL_SCHOOL_CRISIS_RESPONSES_COMPARISON_QUESTION.prompt, /règlement négocié/);
  assert.match(FEDERAL_SCHOOL_CRISIS_RESPONSES_COMPARISON_QUESTION.instruction, /Pour chaque crise.*formule une différence/);
  assert.doesNotMatch(FEDERAL_SCHOOL_CRISIS_RESPONSES_COMPARISON_QUESTION.instruction, /deux concessions/);
  assert.match(FEDERAL_SCHOOL_CRISIS_RESPONSES_COMPARISON_QUESTION.expectedAnswer, /refus d’une intervention directe.*recours à la négociation/);
});

test("rend la lettre de Macdonald accessible comme extrait historique", () => {
  assert.deepEqual(validateHistoricalDocument(MACDONALD_NEW_BRUNSWICK_SCHOOLS_RESPONSE_DOCUMENT), {});
  assert.ok(FEDERAL_PROVINCIAL_RELATIONS_PRIMARY_DOCUMENTS.some(({ id }) => id === "RFP-T-028"));
  const sessionDocument = ACTE_UNION_DOCUMENTS.find(({ id }) => id === "RFP-T-028");
  assert.equal(sessionDocument?.typeLabel, "Correspondance politique");
  assert.equal(sessionDocument?.content.kind, "historical_excerpt");
  assert.ok(sessionDocument?.historicalKnowledgeIds.includes("question-des-ecoles-du-nouveau-brunswick"));
  const agreementDocument = ACTE_UNION_DOCUMENTS.find(({ id }) => id === "RFP-T-017");
  assert.equal(agreementDocument?.typeLabel, "Entente intergouvernementale");
  assert.equal(agreementDocument?.content.kind, "historical_excerpt");
  if (agreementDocument?.content.kind === "historical_excerpt") {
    assert.match(agreementDocument.content.excerpt, /enseignement religieux.*système bilingue/);
    assert.doesNotMatch(agreementDocument.content.excerpt, /Aucune séparation/);
  }
});
