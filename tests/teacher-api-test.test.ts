import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getQuestionsForKnowledgeHeading } from "../lib/pedagogical-reference/index.ts";
import { createPedagogicalQuestionDefinition } from "../lib/pedagogical-session-engine/question-context.ts";
import { createCatalogLearningSessionQuestions } from "../lib/student-learning-session/demo-provider.ts";

test("expose les questions de l’Acte d’Union avec leur vrai contexte Sol", () => {
  const approved = getQuestionsForKnowledgeHeading("acte-union");
  const catalog = createCatalogLearningSessionQuestions(approved.map(({ id }) => id));
  assert.equal(catalog.questions.length, 37);
  for (const [index, question] of catalog.questions.entries()) {
    assert.equal(question.localHint, approved[index]?.instruction);
    assert.equal(question.evaluationGuide?.expectedAnswer, approved[index]?.expectedAnswer);
    assert.deepEqual(question.evaluationGuide?.commonErrors, approved[index]?.commonErrors);
    assert.notEqual(question.localHint, "Repère les éléments importants de la question et des documents, puis formule une réponse précise.");
    const definition = createPedagogicalQuestionDefinition(question, "acte-union", "Acte d’Union", catalog.documents);
    assert.equal(definition.evaluationContext?.referenceMonograph.id, "historical-record:acte-union");
    assert.equal(definition.evaluationContext?.pedagogicalRules.length, 6);
    const rules = definition.evaluationContext?.pedagogicalRules.join(" ") ?? "";
    assert.match(rules, /réponse réelle et les acquis des tours précédents/);
    assert.match(rules, /Augmente progressivement l’aide/);
    assert.match(rules, /ton naturel et sans structure répétitive/);
    assert.match(rules, /N’invente aucun fait/);
    assert.deepEqual(definition.evaluationContext?.approvedDocuments.map(({ id }) => id), question.documentRelations.map(({ documentId }) => documentId));
  }
});

test("centre la question d’assimilation sur le seul extrait qui explicite l’intention de Durham", () => {
  const approved = getQuestionsForKnowledgeHeading("acte-union");
  const question = approved.find(({ id }) => id === "question:acte-union:document-interpretation-009");
  assert.ok(question);
  assert.deepEqual(question.historicalDocumentIds, ["historical-presentation:acte-union:durham-anglicisation"]);
  assert.match(question.prompt, /extrait sur le projet d’anglicisation/);
  assert.doesNotMatch(question.prompt, /union législative/);
  assert.match(question.instruction, /deux moyens proposés dans l’extrait/);
});

test("distingue les titres visibles des documents 3 et 4 de la question 28", () => {
  const approved = getQuestionsForKnowledgeHeading("acte-union");
  const question = approved.find(({ id }) => id === "question:acte-union:development-002");
  assert.ok(question);
  const catalog = createCatalogLearningSessionQuestions([question.id]);
  const documents = new Map(catalog.documents.map((document) => [document.id, document.typeLabel]));
  assert.equal(documents.get("AU-T-006"), "Suspension du régime représentatif");
  assert.equal(documents.get("AU-T-009"), "Données sur les Patriotes emprisonnés");
  assert.notEqual(documents.get("AU-T-006"), "Document sur les conséquences des Rébellions");
  assert.notEqual(documents.get("AU-T-009"), "Document sur les conséquences des Rébellions");
});

test("ajoute un quatrième document sur l’exécutif à la comparaison Durham–Acte d’Union", () => {
  const approved = getQuestionsForKnowledgeHeading("acte-union");
  const question = approved.find(({ id }) => id === "question:acte-union:document-interpretation-004");
  assert.ok(question);
  assert.equal(question.historicalDocumentIds.length, 4);
  assert.equal(question.historicalDocumentIds[3], "AU-T-013");
  const catalog = createCatalogLearningSessionQuestions([question.id]);
  const executiveDocument = catalog.documents.find(({ id }) => id === "AU-T-013");
  assert.equal(executiveDocument?.title, "Le Conseil exécutif demeure sous l’autorité de la Couronne");
  assert.match(executiveDocument?.content.kind === "historical_excerpt" ? executiveDocument.content.excerpt : "", /Conseil exécutif que Sa Majesté peut nommer/);

  const question29 = approved.find(({ id }) => id === "question:acte-union:development-003");
  assert.ok(question29);
  assert.equal(question29.historicalDocumentIds.length, 4);
  assert.equal(question29.historicalDocumentIds[3], "AU-T-013");
});

test("formule le premier indice Durham–Acte d’Union comme une question chaleureuse", () => {
  const question = getQuestionsForKnowledgeHeading("acte-union")
    .find(({ id }) => id === "question:acte-union:development-003");
  assert.ok(question);
  assert.equal(question.instruction, "Commençons par la ressemblance : quelle recommandation de Durham reconnais-tu dans l’Acte d’Union?");
  assert.doesNotMatch(question.instruction, /^1\.|\b2\./);
});

test("ajoute le tableau démographique comme troisième document de la question 30", () => {
  const question = getQuestionsForKnowledgeHeading("acte-union")
    .find(({ id }) => id === "question:acte-union:development-004");
  assert.ok(question);
  assert.deepEqual(question.historicalDocumentIds, ["AU-G-001", "AU-D-001", "AU-G-002"]);
  assert.match(question.prompt, /trois documents/);
  const catalog = createCatalogLearningSessionQuestions([question.id]);
  const populationDocument = catalog.documents.find(({ id }) => id === "AU-G-002");
  assert.equal(populationDocument?.id, "AU-G-002");
  assert.equal(populationDocument?.title, "Population au moment de l’Union");
  assert.equal(populationDocument?.content.kind, "comparison_table");
});

test("réserve le banc d’essai à l’enseignant et ne touche pas à la progression élève", async () => {
  const page = await readFile(new URL("../app/teacher/api-test/page.tsx", import.meta.url), "utf8");
  const action = await readFile(new URL("../app/teacher/api-test/actions.ts", import.meta.url), "utf8");
  const studentView = await readFile(new URL("../app/eleve/activite/[activityId]/session-view.tsx", import.meta.url), "utf8");
  const dashboard = await readFile(new URL("../app/teacher/teacher-dashboard-view.tsx", import.meta.url), "utf8");
  assert.match(page, /requireTeacherActor/);
  assert.match(action, /requireTeacherActor/);
  assert.match(action, /createConfiguredOpenAIPedagogicalAnalyzer/);
  assert.doesNotMatch(action, /student-progress|saveProgress|transitionStudentProgress/);
  assert.match(dashboard, /href="\/teacher\/api-test"/);
  assert.match(page, /StudentLearningSessionView/);
  assert.match(page, /teacherPreview/);
  assert.match(page, /teacherApiTest/);
  assert.match(page, /persistProgress=\{false\}/);
  assert.match(studentView, /analyzeActeUnionTestResponse/);
  assert.match(studentView, /isMultipleChoice/);
  assert.match(studentView, /InteractiveTimelineQuestion/);
  assert.match(studentView, /InteractiveAssociationQuestion/);
  assert.match(action, /attemptNumber: request\.attemptNumber/);
});
