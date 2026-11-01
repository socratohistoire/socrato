import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_QUESTION } from "../lib/pedagogical-reference/migrations-chronological-association.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("situe trois mouvements migratoires au moyen de repères chronologiques larges", () => {
  assert.deepEqual(validateApprovedQuestion(MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_QUESTION), {});
  assert.equal(MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_QUESTION.operationId, "time_and_space");
  assert.deepEqual(
    MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_QUESTION.associationInteraction.targets.map(({ label }) => label),
    ["Vers 1847", "Années 1850 à 1870", "Années 1880 à 1890"],
  );
  assert.deepEqual(
    MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_QUESTION.associationInteraction.targets.map(({ correctItemId }) => correctItemId),
    ["irish-immigration", "new-england-emigration", "quebec-colonization"],
  );
  assert.match(MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_QUESTION.instruction, /non ses dates exactes de début et de fin/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_QUESTION.id));
});

test("publie la question interactive dans un aperçu Socrato", () => {
  const session = createDemoStudentLearningSession("demo-activity-migrations-chronological-association", "migrations");
  assert.ok(session);
  assert.equal(session.activityTitle, "Repères chronologiques des migrations");
  assert.equal(session.questions[0]?.id, MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_QUESTION.id);
  assert.equal(session.questions[0]?.type, "interactive_association");
  assert.equal(session.questions[0]?.intellectualOperations[0]?.label, "Situer dans le temps et dans l’espace");
  assert.equal(session.questions[0]?.associationInteraction?.items.length, 3);
  assert.deepEqual(session.questions[0]?.documentRelations, []);
});

test("affiche les erreurs dans une fenêtre à fermer avant la correction", () => {
  const view = readFileSync("app/eleve/activite/[activityId]/session-view.tsx", "utf8");
  const styles = readFileSync("app/eleve/activite/[activityId]/session.css", "utf8");
  assert.match(view, /setFeedback\(nextFeedback\);\s*setReviewDialogOpen\(true\);/);
  assert.doesNotMatch(view, /if \(hasCauseLayer\) setReviewDialogOpen\(true\)/);
  assert.match(view, /Fermer et corriger mes réponses/);
  assert.match(styles, /association-question--compact-dates \.timeline-question__footer p\{font-size:clamp\(16px,1\.25vw,18px\)/);
});
