import test from "node:test";
import assert from "node:assert/strict";
import { CONFERENCE_1887_DOCUMENTS, CONFERENCE_1887_QUESTION } from "../lib/pedagogical-reference/conference-1887.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";

test("1887: libellé exact et trois extraits primaires accessibles aux élèves", () => {
  const q = CONFERENCE_1887_QUESTION;
  assert.equal(q.prompt, "Quelles revendications les premiers ministres provinciaux défendent-ils lors de la conférence interprovinciale de 1887?");
  assert.equal(q.operationId, "establish_facts");
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({id}) => id === q.id));
  assert.deepEqual(q.historicalDocumentIds, ["RFP-T-011", "RFP-T-012", "RFP-T-013"]);
  for (const doc of CONFERENCE_1887_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(doc), {});
    const student = ACTE_UNION_DOCUMENTS.find(({id}) => id === doc.id);
    assert.equal(student?.content.kind, "historical_excerpt");
    assert.ok(student?.historicalKnowledgeIds.includes("conference-interprovinciale"));
    assert.match(student?.rightsLabel ?? "", /Traduction française/);
  }
  assert.match(q.expectedAnswer, /formulation équivalente/);
  assert.match(q.expectedAnswer, /politique et financière/);
});
