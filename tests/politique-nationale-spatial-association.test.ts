import assert from "node:assert/strict";
import test from "node:test";
import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { POLITIQUE_NATIONALE_SPATIAL_ASSOCIATION_QUESTION } from "../lib/pedagogical-reference/politique-nationale-spatial-association.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("prépare une association spatiale avec trois mesures de la Politique nationale", () => {
  const interaction = POLITIQUE_NATIONALE_SPATIAL_ASSOCIATION_QUESTION.associationInteraction;
  assert.equal(POLITIQUE_NATIONALE_SPATIAL_ASSOCIATION_QUESTION.operationId, "time_and_space");
  assert.match(POLITIQUE_NATIONALE_SPATIAL_ASSOCIATION_QUESTION.prompt, /En 1882.*Place chaque mesure au bon endroit/s);
  assert.equal(interaction.map.imageUrl, "/historical-documents/politique-nationale-carte-1882-interactive.png");
  assert.equal(interaction.items.length, 3);
  assert.equal(interaction.targets.length, 3);
  assert.ok(interaction.targets.every(({ zone }) => zone.width > 0 && zone.height > 0));
  assert.deepEqual(validateApprovedQuestion(POLITIQUE_NATIONALE_SPATIAL_ASSOCIATION_QUESTION), {});
});

test("publie la question et son aperçu interactif", () => {
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === POLITIQUE_NATIONALE_SPATIAL_ASSOCIATION_QUESTION.id));
  const session = createDemoStudentLearningSession("demo-activity-politique-nationale-espaces", "politique-nationale");
  assert.equal(session?.questions[0]?.type, "interactive_association");
  assert.equal(session?.questions[0]?.associationInteraction?.map?.dropLabel, "Mesure");
  assert.equal(session?.documentCatalog.length, 0);
});
