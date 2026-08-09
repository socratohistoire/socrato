import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getQuestionsForKnowledgeHeading } from "../lib/pedagogical-reference/index.ts";
import { createPedagogicalQuestionDefinition } from "../lib/pedagogical-session-engine/question-context.ts";
import { createCatalogLearningSessionQuestions } from "../lib/student-learning-session/demo-provider.ts";

test("expose les 37 questions de l’Acte d’Union avec leur vrai contexte Terra", () => {
  const approved = getQuestionsForKnowledgeHeading("acte-union");
  const catalog = createCatalogLearningSessionQuestions(approved.map(({ id }) => id));
  assert.equal(catalog.questions.length, 37);
  for (const question of catalog.questions) {
    const definition = createPedagogicalQuestionDefinition(question, "acte-union", "Acte d’Union", catalog.documents);
    assert.equal(definition.evaluationContext?.referenceMonograph.id, "historical-record:acte-union");
    assert.ok((definition.evaluationContext?.pedagogicalRules.length ?? 0) >= 6);
    assert.deepEqual(definition.evaluationContext?.approvedDocuments.map(({ id }) => id), question.documentRelations.map(({ documentId }) => documentId));
  }
});

test("réserve le banc d’essai à l’enseignant et ne touche pas à la progression élève", async () => {
  const page = await readFile(new URL("../app/teacher/api-test/page.tsx", import.meta.url), "utf8");
  const action = await readFile(new URL("../app/teacher/api-test/actions.ts", import.meta.url), "utf8");
  const view = await readFile(new URL("../app/teacher/api-test/test-view.tsx", import.meta.url), "utf8");
  const dashboard = await readFile(new URL("../app/teacher/teacher-dashboard-view.tsx", import.meta.url), "utf8");
  assert.match(page, /requireTeacherActor/);
  assert.match(action, /requireTeacherActor/);
  assert.match(action, /createConfiguredOpenAIPedagogicalAnalyzer/);
  assert.doesNotMatch(action, /student-progress|saveProgress|transitionStudentProgress/);
  assert.match(dashboard, /href="\/teacher\/api-test"/);
  assert.doesNotMatch(page, /instruction: question\.instruction/);
  assert.doesNotMatch(view, /<dl>|Interprétation|Usage des documents|Confiance/);
});
