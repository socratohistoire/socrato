import test from "node:test";
import assert from "node:assert/strict";
import { METIS_POLITICAL_OUTCOMES_QUESTION as q } from "../lib/pedagogical-reference/metis-outcomes-question.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";

test("compare les conséquences avec deux preuves et un document à discriminer", () => {
  assert.equal(q.prompt, "Dégage une différence entre les conséquences politiques de la résistance de 1869-1870 et celles de la résistance de 1885.");
  assert.equal(q.operationId, "differences_and_similarities");
  assert.equal(PEDAGOGICAL_QUESTION_CATALOG.filter(({id}) => id === q.id).length, 1);
  assert.deepEqual(q.historicalDocumentIds, ["RFP-T-005", "AANB-T-004", "RFP-T-004"]);
  for (const id of q.historicalDocumentIds) {
    const docs = ACTE_UNION_DOCUMENTS.filter(doc => doc.id === id);
    assert.equal(docs.length, 1);
    assert.equal(docs[0].content.kind, "historical_excerpt");
  }
  assert.match(q.expectedAnswer, /AANB-T-004.*à écarter/);
  assert.match(q.expectedAnswer, /partie des Canadiens français/);
  assert.ok(!q.instruction.includes("AANB-T-004"));
  assert.equal(q.sourceCatalog.length, 3);
});
