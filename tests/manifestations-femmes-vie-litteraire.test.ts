import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  MANIFESTATIONS_NEW_SOCIOCULTURAL_EXPRESSION_QUESTION,
  MANIFESTATIONS_WOMEN_LITERARY_LIFE_CHANGE_QUESTION,
  MANIFESTATIONS_WOMEN_LITERARY_LIFE_DOCUMENTS,
} from "../lib/pedagogical-reference/manifestations-socioculturelles-femmes-vie-litteraire.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("documente deux rôles féminins dans la vie littéraire entre 1881 et 1893", () => {
  for (const document of MANIFESTATIONS_WOMEN_LITERARY_LIFE_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
    assert.match(document.rightsStatement, /domaine public/i);
    assert.equal(document.transcription.split(/[.!?](?:\s|$)/).filter((part) => part.trim()).length, 4);
  }
  assert.match(MANIFESTATIONS_WOMEN_LITERARY_LIFE_DOCUMENTS[0].transcription, /nouveauté[\s\S]*réclamer sa place/i);
  assert.match(MANIFESTATIONS_WOMEN_LITERARY_LIFE_DOCUMENTS[1].transcription, /Canadiennes[\s\S]*Nos colonnes/i);
});

test("demande de décrire une manifestation socioculturelle nouvelle sans révéler la réponse", () => {
  assert.deepEqual(validateApprovedQuestion(MANIFESTATIONS_NEW_SOCIOCULTURAL_EXPRESSION_QUESTION), {});
  assert.equal(
    MANIFESTATIONS_NEW_SOCIOCULTURAL_EXPRESSION_QUESTION.prompt,
    "Décrivez une manifestation socioculturelle nouvelle au Québec durant la période 1840-1896.",
  );
  assert.equal(MANIFESTATIONS_NEW_SOCIOCULTURAL_EXPRESSION_QUESTION.operationId, "establish_facts");
  assert.doesNotMatch(MANIFESTATIONS_NEW_SOCIOCULTURAL_EXPRESSION_QUESTION.prompt, /femme|littér|Laure Conan|Coin du feu/i);
  assert.deepEqual(MANIFESTATIONS_NEW_SOCIOCULTURAL_EXPRESSION_QUESTION.historicalDocumentIds, ["MSC-T-005", "MSC-T-006"]);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MANIFESTATIONS_NEW_SOCIOCULTURAL_EXPRESSION_QUESTION.id));
});

test("publie la nouvelle question avec ses deux extraits de quatre phrases", () => {
  const session = createDemoStudentLearningSession(
    "demo-activity-manifestations-nouvelle",
    "manifestations-socioculturelles",
  );
  assert.ok(session);
  assert.equal(session.questions[0]?.id, MANIFESTATIONS_NEW_SOCIOCULTURAL_EXPRESSION_QUESTION.id);
  assert.equal(session.questions[0]?.intellectualOperations[0]?.label, "Établir des faits");
  assert.equal(session.questions[0]?.initialMessages[0]?.content, "J’attends ta réponse.");
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["MSC-T-005", "MSC-T-006"]);
});

test("demande de décrire un changement sans l’annoncer dans la formulation", () => {
  assert.deepEqual(validateApprovedQuestion(MANIFESTATIONS_WOMEN_LITERARY_LIFE_CHANGE_QUESTION), {});
  assert.equal(
    MANIFESTATIONS_WOMEN_LITERARY_LIFE_CHANGE_QUESTION.prompt,
    "Décrivez un changement dans la participation des femmes à la vie littéraire québécoise entre 1880 et 1896.",
  );
  assert.equal(MANIFESTATIONS_WOMEN_LITERARY_LIFE_CHANGE_QUESTION.operationId, "changes_and_continuities");
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MANIFESTATIONS_WOMEN_LITERARY_LIFE_CHANGE_QUESTION.id));
});

test("publie l’aperçu avec les deux documents dans l’ordre chronologique", () => {
  const session = createDemoStudentLearningSession(
    "demo-activity-manifestations-femmes-vie-litteraire",
    "manifestations-socioculturelles",
  );
  assert.ok(session);
  assert.equal(session.questions[0]?.id, MANIFESTATIONS_WOMEN_LITERARY_LIFE_CHANGE_QUESTION.id);
  assert.equal(session.questions[0]?.intellectualOperations[0]?.label, "Déterminer des changements et des continuités");
  assert.equal(session.questions[0]?.initialMessages[0]?.content, "J’attends ta réponse.");
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["MSC-T-005", "MSC-T-006"]);
  assert.deepEqual(session.documentCatalog.map(({ content }) => content.kind), ["historical_excerpt", "historical_excerpt"]);
});
