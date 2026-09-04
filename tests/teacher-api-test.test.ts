import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getQuestionsForKnowledgeHeading } from "../lib/pedagogical-reference/index.ts";
import { createPedagogicalQuestionDefinition } from "../lib/pedagogical-session-engine/question-context.ts";
import { createCatalogLearningSessionQuestions } from "../lib/student-learning-session/demo-provider.ts";

test("expose les questions de l’Acte d’Union avec leur vrai contexte Sol", () => {
  const approved = getQuestionsForKnowledgeHeading("acte-union");
  const catalog = createCatalogLearningSessionQuestions(approved.map(({ id }) => id));
  assert.equal(catalog.questions.length, 34);
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

test("date la création de l’alliance politique Baldwin–La Fontaine", () => {
  const question = getQuestionsForKnowledgeHeading("gouvernement-responsable")
    .find(({ id }) => id === "question:gouvernement-responsable:short-answer-001");
  assert.ok(question);
  assert.equal(question.prompt, "Explique une contrainte qui a poussé Baldwin et La Fontaine à créer une alliance politique en 1841.");
  assert.deepEqual(question.historicalDocumentIds, ["AU-D-001", "GR-T-008", "GR-T-009"]);
  assert.match(question.instruction, /l’adresse de La Fontaine et la lettre de Baldwin/);
  const catalog = createCatalogLearningSessionQuestions([question.id]);
  const laFontaine = catalog.documents.find(({ id }) => id === "GR-T-008");
  const baldwin = catalog.documents.find(({ id }) => id === "GR-T-009");
  assert.match(laFontaine?.content.kind === "historical_excerpt" ? laFontaine.content.excerpt : "", /L’unité d’action est nécessaire plus que jamais/);
  assert.match(baldwin?.content.kind === "historical_excerpt" ? baldwin.content.excerpt : "", /cimentera fortement l’union entre les réformistes/);
  assert.doesNotMatch(baldwin?.content.kind === "historical_excerpt" ? baldwin.content.excerpt : "", /La Fontaine affirme|L’unité d’action/);
});

test("analyse les questions du gouvernement responsable avec leur propre monographie", () => {
  const approved = getQuestionsForKnowledgeHeading("gouvernement-responsable");
  const catalog = createCatalogLearningSessionQuestions(approved.map(({ id }) => id));
  assert.equal(catalog.questions.length, 15);
  for (const question of catalog.questions) {
    const definition = createPedagogicalQuestionDefinition(question, "gouvernement-responsable", "Gouvernement responsable", catalog.documents);
    assert.equal(definition.evaluationContext?.referenceMonograph.id, "historical-record:gouvernement-responsable");
  }
});

test("fournit quatre sources primaires distinctes et pertinentes pour la question 12 sur l’instabilité", () => {
  const question = getQuestionsForKnowledgeHeading("gouvernement-responsable")
    .find(({ id }) => id === "question:gouvernement-responsable:short-answer-005");
  assert.ok(question);
  const catalog = createCatalogLearningSessionQuestions([question.id]);
  assert.deepEqual(catalog.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["GR-T-011", "GR-T-012", "GR-T-013", "GR-T-007"]);
  assert.equal(catalog.documents.length, 4);
  for (const document of catalog.documents) {
    assert.equal(document.content.kind, "historical_excerpt");
    assert.match(document.content.kind === "historical_excerpt" ? document.content.excerpt : "", /\[…\]/);
  }
});

test("ignore une question retirée dans une activité déjà publiée", () => {
  const catalog = createCatalogLearningSessionQuestions([
    "question:acte-union:short-answer-006",
    "question:acte-union:001",
  ]);
  assert.deepEqual(catalog.questions.map(({ id }) => id), ["question:acte-union:001"]);
  assert.equal(catalog.questions[0]?.number, 1);
});

test("ajoute un second extrait sur l’avancement politique à la question d’assimilation", () => {
  const approved = getQuestionsForKnowledgeHeading("acte-union");
  const question = approved.find(({ id }) => id === "question:acte-union:document-interpretation-009");
  assert.ok(question);
  assert.deepEqual(question.historicalDocumentIds, ["historical-presentation:acte-union:durham-anglicisation", "historical-presentation:acte-union:durham-anglicisation-avancement"]);
  assert.match(question.prompt, /deux extraits sur le projet d’anglicisation/);
  assert.match(question.prompt, /nomme deux moyens proposés par lord Durham/);
  assert.match(question.prompt, /explique comment chacun contribuerait/);
  assert.doesNotMatch(question.prompt, /union législative/);
  assert.match(question.instruction, /progression de l’anglais/);
  assert.match(question.instruction, /immigration anglaise/);
  assert.match(question.instruction, /accéder aux fonctions politiques/);
  assert.match(question.expectedAnswer, /Deux moyens correctement relevés et deux liens de cause à effet suffisent/);
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

test("signale la confusion entre Russell et Durham dans la comparaison de la question 15", () => {
  const question = getQuestionsForKnowledgeHeading("acte-union")
    .find(({ id }) => id === "question:acte-union:document-interpretation-004");
  assert.ok(question);
  assert.ok(question.commonErrors.includes("Attribuer les recommandations à Russell plutôt qu’à Durham."));
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

test("ajoute les tableaux des dettes et des populations à la question 10", () => {
  const question = getQuestionsForKnowledgeHeading("acte-union")
    .find(({ id }) => id === "question:acte-union:short-answer-003");
  assert.ok(question);
  assert.deepEqual(question.historicalDocumentIds, ["AU-G-001", "AU-G-002"]);
  assert.match(question.prompt, /compare la population et la dette/);
  assert.match(question.prompt, /avantage particulièrement le Haut-Canada/);
  const catalog = createCatalogLearningSessionQuestions([question.id]);
  const debtDocument = catalog.documents.find(({ id }) => id === "AU-G-001");
  assert.equal(debtDocument?.content.kind, "comparison_table");
  assert.deepEqual(debtDocument?.content.kind === "comparison_table" ? debtDocument.content.rows : [], [
    { label: "Bas-Canada", value: "≈ 133 000 £" },
    { label: "Haut-Canada", value: "≈ 1 540 000 £" },
  ]);
  const populationDocument = catalog.documents.find(({ id }) => id === "AU-G-002");
  assert.equal(populationDocument?.content.kind, "comparison_table");
  assert.deepEqual(populationDocument?.content.kind === "comparison_table" ? populationDocument.content.rows : [], [
    { label: "Bas-Canada", value: "≈ 650 000" },
    { label: "Haut-Canada", value: "≈ 450 000" },
  ]);
});

test("remplace le schéma politique par le tableau des populations à la question 17", () => {
  const question = getQuestionsForKnowledgeHeading("acte-union")
    .find(({ id }) => id === "question:acte-union:document-interpretation-006");
  assert.ok(question);
  assert.deepEqual(question.historicalDocumentIds, ["AU-G-001", "AU-G-002"]);
  assert.match(question.instruction, /tableau des populations/);
  assert.doesNotMatch(question.instruction, /schéma de la structure politique/);
});

test("n’exige pas une relance géographique après une transformation territoriale complète", () => {
  const question = getQuestionsForKnowledgeHeading("acte-union")
    .find(({ id }) => id === "question:acte-union:document-interpretation-010");
  assert.ok(question);
  assert.match(question.expectedAnswer, /Cette réponse est complète même si l’élève ne précise pas explicitement/);
  assert.match(question.expectedAnswer, /constitue un enrichissement facultatif/);
  assert.doesNotMatch(question.instruction, /établis la correspondance/);
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
  assert.match(dashboard, /Réviser les questions/);
  assert.match(page, /Révision complète des \$\{catalog\.questions\.length\} questions/);
  assert.match(page, /StudentLearningSessionView/);
  assert.match(page, /teacherPreview/);
  assert.match(page, /teacherApiTest/);
  assert.match(page, /persistProgress=\{false\}/);
  assert.match(studentView, /analyzeTeacherTestResponse/);
  assert.match(studentView, /isMultipleChoice/);
  assert.match(studentView, /InteractiveTimelineQuestion/);
  assert.match(studentView, /InteractiveAssociationQuestion/);
  assert.match(action, /attemptNumber: request\.attemptNumber/);
  assert.match(page, /query\.notion === "gouvernement-responsable"/);
  assert.match(page, /getQuestionsForKnowledgeHeading\(notionId\)/);
  assert.match(studentView, /notionId: data\.notionId/);
  assert.match(action, /getQuestionsForKnowledgeHeading\(notionId\)/);
  assert.match(action, /createPedagogicalQuestionDefinition\(question, notionId, notionTitle/);
  assert.match(action, /analyzeWithFallback\(response, definition, analyzer, new LocalDeterministicResponseAnalyzer\(\)\)/);
  assert.doesNotMatch(action, /catch \{[\s\S]*analyzer\.analyze\(response, definition\)/);
});
