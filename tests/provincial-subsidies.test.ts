import test from "node:test";
import assert from "node:assert/strict";
import { PROVINCIAL_SUBSIDIES_QUESTION as q } from "../lib/pedagogical-reference/provincial-subsidies-question.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { ACTE_UNION_DOCUMENTS } from "../lib/student-learning-session/document-catalog.ts";

test("subventions : explique une demande avec deux sources primaires existantes", () => {
  assert.equal(q.prompt, "Explique pourquoi les provinces réclament une augmentation des subventions fédérales.");
  assert.equal(q.operationId, "causal_connections");
  assert.equal(PEDAGOGICAL_QUESTION_CATALOG.filter(({id}) => id === q.id).length, 1);
  assert.deepEqual(q.historicalDocumentIds, ["RFP-T-009", "RFP-T-013"]);
  for (const id of q.historicalDocumentIds) {
    const matches = ACTE_UNION_DOCUMENTS.filter(d => d.id === id);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].content.kind, "historical_excerpt");
    assert.ok(matches[0].intellectualOperationIds.includes(q.operationId));
  }
  assert.match(q.expectedAnswer, /dépenses supplémentaires/);
  assert.match(q.expectedAnswer, /formulation équivalente/);
  assert.match(q.expectedAnswer, /péréquation/);
});
