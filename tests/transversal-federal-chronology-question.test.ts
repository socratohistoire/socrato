import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { TRANSVERSAL_FEDERAL_CHRONOLOGY_QUESTION } from "../lib/pedagogical-reference/transversal-federal-chronology-question.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("crée une chronologie interactive transversale pour les trois notions demandées", () => {
  const question = TRANSVERSAL_FEDERAL_CHRONOLOGY_QUESTION;

  assert.equal(question.scope, "transversal");
  assert.equal(question.format, "interactive-timeline");
  assert.equal(question.operationId, "time_and_space");
  assert.deepEqual(question.relatedKnowledgeHeadingIds, [
    "affaires-indiennes",
    "acte-de-l-amerique-du-nord-britannique",
    "relations-federales-provinciales",
  ]);
  assert.deepEqual(question.timelineInteraction.dates, ["1844", "1864", "1867", "1869-1870", "1876", "1885"]);
  assert.equal(question.timelineInteraction.entries.length, 6);
  assert.equal(question.historicalDocumentIds.length, 6);
  assert.equal(question.sourceCatalog.length, 6);
  assert.deepEqual(validateApprovedQuestion(question), {});
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === question.id));
  assert.ok(question.timelineInteraction.entries.every(({ imageUrl }) => existsSync(fileURLToPath(new URL(`../public${imageUrl}`, import.meta.url)))));

  const coalition = question.timelineInteraction.entries.find(({ id }) => id === "transversal-federal-timeline-coalition");
  const coalitionImages = coalition && "imageUrls" in coalition ? coalition.imageUrls : undefined;
  assert.deepEqual(coalitionImages, [
    "/historical-documents/gr-coalition-macdonald-1863.jpg",
    "/historical-documents/gr-coalition-cartier-1863.jpg",
    "/historical-documents/gr-coalition-brown.jpg",
  ]);
  assert.ok(coalitionImages?.every((imageUrl) => existsSync(fileURLToPath(new URL(`../public${imageUrl}`, import.meta.url)))));

  const indianAct = question.timelineInteraction.entries.find(({ id }) => id === "transversal-federal-timeline-indian-act");
  assert.equal(indianAct?.imageUrl, "/historical-documents/indian-act-1876-first-page.jpg");
});

test("ouvre directement la chronologie transversale dans l’aperçu interactif", () => {
  const session = createDemoStudentLearningSession("demo-activity-timeline", "acte-de-l-amerique-du-nord-britannique", "teacher-assigned");

  assert.ok(session);
  assert.equal(session.notionTitle, "Affaires indiennes · AANB · Relations fédérales-provinciales");
  assert.equal(session.questions[0]?.id, TRANSVERSAL_FEDERAL_CHRONOLOGY_QUESTION.id);
  assert.equal(session.questions[0]?.type, "interactive_timeline");
  assert.deepEqual(session.questions[0]?.timelineInteraction?.dates, ["1844", "1864", "1867", "1869-1870", "1876", "1885"]);
});
