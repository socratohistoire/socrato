import assert from "node:assert/strict";
import test from "node:test";
import {
  FEDERAL_PROVINCIAL_RELATIONS_COVERAGE_DOCUMENTS,
  FEDERAL_PROVINCIAL_RELATIONS_COVERAGE_QUESTIONS,
  INTERPROVINCIAL_CONFERENCE_CAUSES_CLAIMS_QUESTION,
  MACDONALD_MOWAT_FEDERALISM_COMPARISON_QUESTION,
  REVENUE_PROVINCIAL_AUTONOMY_QUESTION,
  SCHOOL_CRISIS_COMPARISON_QUESTION,
} from "../lib/pedagogical-reference/index.ts";
import { FEDERAL_PROVINCIAL_RELATIONS_PRIMARY_DOCUMENTS } from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";

test("ajoute uniquement les quatre questions de couverture conservées", () => {
  assert.deepEqual(FEDERAL_PROVINCIAL_RELATIONS_COVERAGE_QUESTIONS.map(({ id }) => id), [
    "question:relations-federales-provinciales:document-interpretation-019",
    "question:relations-federales-provinciales:document-interpretation-020",
    "question:relations-federales-provinciales:document-interpretation-021",
    "question:relations-federales-provinciales:document-interpretation-022",
  ]);
  assert.ok(FEDERAL_PROVINCIAL_RELATIONS_COVERAGE_QUESTIONS.every(({ historicalDocumentIds }) => historicalDocumentIds.length >= 2));
  assert.ok(FEDERAL_PROVINCIAL_RELATIONS_COVERAGE_QUESTIONS.every(({ sourceIds, historicalDocumentIds }) => sourceIds.length === historicalDocumentIds.length));
});

test("couvre les quatre précisions historiques choisies avec les opérations attendues", () => {
  assert.match(INTERPROVINCIAL_CONFERENCE_CAUSES_CLAIMS_QUESTION.prompt, /Quel est le motif qui amène Honoré Mercier.*deux revendications/);
  assert.doesNotMatch(INTERPROVINCIAL_CONFERENCE_CAUSES_CLAIMS_QUESTION.instruction, /explique à quel problème chacun répond/);
  assert.match(INTERPROVINCIAL_CONFERENCE_CAUSES_CLAIMS_QUESTION.expectedAnswer, /Ne pas exiger.*chaque revendication/);
  assert.deepEqual(INTERPROVINCIAL_CONFERENCE_CAUSES_CLAIMS_QUESTION.historicalDocumentIds, ["RFP-T-024", "RFP-T-025"]);
  assert.equal(INTERPROVINCIAL_CONFERENCE_CAUSES_CLAIMS_QUESTION.operationId, "causal_connections");
  const mercierDocument = FEDERAL_PROVINCIAL_RELATIONS_COVERAGE_DOCUMENTS.find(({ id }) => id === "RFP-T-024");
  assert.match(mercierDocument?.transcription ?? "", /Suppression du pouvoir de désaveu du gouvernement fédéral/);
  assert.doesNotMatch(mercierDocument?.transcription ?? "", /La conférence proposée des gouvernements provinciaux/);
  assert.match(INTERPROVINCIAL_CONFERENCE_CAUSES_CLAIMS_QUESTION.expectedAnswer, /défendent ensemble leur autonomie/);
  const conferenceResolutions = FEDERAL_PROVINCIAL_RELATIONS_COVERAGE_DOCUMENTS.find(({ id }) => id === "RFP-T-025");
  assert.match(conferenceResolutions?.transcription ?? "", /verse déjà des subventions annuelles/);
  assert.match(conferenceResolutions?.transcription ?? "", /jugent ces sommes insuffisantes/);

  assert.match(MACDONALD_MOWAT_FEDERALISM_COMPARISON_QUESTION.prompt, /John A\. Macdonald.*délégués.*présidée par Oliver Mowat/);
  assert.deepEqual(MACDONALD_MOWAT_FEDERALISM_COMPARISON_QUESTION.historicalDocumentIds, ["RFP-T-026", "RFP-T-025"]);
  assert.equal(MACDONALD_MOWAT_FEDERALISM_COMPARISON_QUESTION.operationId, "differences_and_similarities");

  assert.match(REVENUE_PROVINCIAL_AUTONOMY_QUESTION.prompt, /répartition des revenus.*limiter l’autonomie provinciale/);
  assert.deepEqual(REVENUE_PROVINCIAL_AUTONOMY_QUESTION.historicalDocumentIds, ["RFP-S-001", "RFP-T-009"]);
  assert.equal(REVENUE_PROVINCIAL_AUTONOMY_QUESTION.operationId, "relationships_between_facts");

  assert.match(SCHOOL_CRISIS_COMPARISON_QUESTION.prompt, /Nouveau-Brunswick.*Manitoba.*ressemblance.*différence/);
  assert.deepEqual(SCHOOL_CRISIS_COMPARISON_QUESTION.historicalDocumentIds, ["RFP-T-007", "RFP-T-006"]);
  assert.equal(SCHOOL_CRISIS_COMPARISON_QUESTION.operationId, "differences_and_similarities");
  assert.match(SCHOOL_CRISIS_COMPARISON_QUESTION.instruction, /perte du financement public.*droits.*recours/);
  assert.match(SCHOOL_CRISIS_COMPARISON_QUESTION.expectedAnswer, /ne pas exiger.*déduise.*retrait du financement/);

});

test("rend les cinq nouveaux extraits primaires disponibles dans Socrato", () => {
  assert.deepEqual(FEDERAL_PROVINCIAL_RELATIONS_COVERAGE_DOCUMENTS.map(({ id }) => id), ["RFP-T-024", "RFP-T-025", "RFP-T-026", "RFP-T-027", "RFP-T-028"]);
  assert.ok(FEDERAL_PROVINCIAL_RELATIONS_COVERAGE_DOCUMENTS.every(({ status }) => status === "ready-for-review"));
  assert.ok(FEDERAL_PROVINCIAL_RELATIONS_COVERAGE_DOCUMENTS.every((document) => Object.keys(validateHistoricalDocument(document)).length === 0));
  assert.ok(FEDERAL_PROVINCIAL_RELATIONS_COVERAGE_DOCUMENTS.every(({ id }) => FEDERAL_PROVINCIAL_RELATIONS_PRIMARY_DOCUMENTS.some((document) => document.id === id)));
  assert.ok(FEDERAL_PROVINCIAL_RELATIONS_COVERAGE_DOCUMENTS.every(({ id }) => ACTE_UNION_DOCUMENTS.some((document) => document.id === id && document.content.kind === "historical_excerpt")));
});
