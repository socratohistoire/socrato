import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import {
  MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_DOCUMENTS,
  MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_QUESTION,
} from "../lib/pedagogical-reference/migrations-emigration-colonization-causality.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("formule un lien causal sans renvoyer à des numéros de documents", () => {
  assert.deepEqual(validateApprovedQuestion(MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_QUESTION), {});
  assert.equal(
    MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_QUESTION.prompt,
    "Établissez un lien de causalité entre l’émigration des Canadiens français vers les États-Unis et le financement de chemins de colonisation au Québec à la fin du XIXe siècle.",
  );
  assert.doesNotMatch(MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_QUESTION.prompt, /document/i);
  assert.doesNotMatch(MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_QUESTION.instruction, /document/i);
  assert.equal(MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_QUESTION.operationId, "causal_connections");
  assert.match(MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_QUESTION.expectedAnswer, /États-Unis[\s\S]*chemins de colonisation[\s\S]*Lac-Saint-Jean/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_QUESTION.id));
});

test("publie les facteurs de départ avant l’intervention à relier", () => {
  assert.deepEqual(MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_DOCUMENTS.map(({ id }) => id), ["MIG-T-002", "MIG-T-003", "MIG-T-001"]);
  const session = createDemoStudentLearningSession(
    "demo-activity-migrations-emigration-colonization-causality",
    "migrations",
  );
  assert.ok(session);
  assert.equal(session.questions[0]?.id, MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_QUESTION.id);
  assert.equal(session.questions[0]?.intellectualOperations[0]?.label, "Établir des liens de causalité");
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["MIG-T-002", "MIG-T-003", "MIG-T-001"]);
  assert.deepEqual(session.documentCatalog.map(({ id }) => id), ["MIG-T-001", "MIG-T-002", "MIG-T-003"]);
});
