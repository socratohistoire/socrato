import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  MANIFESTATIONS_CANADIEN_ERRANT_DOCUMENT,
  MANIFESTATIONS_GARNEAU_PATRIOTISM_DOCUMENT,
  MANIFESTATIONS_OEUVRES_PATRIOTIQUES_QUESTION,
} from "../lib/pedagogical-reference/manifestations-socioculturelles-oeuvres-patriotiques.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("présente deux sources primaires complémentaires sur le patriotisme", () => {
  assert.deepEqual(validateHistoricalDocument(MANIFESTATIONS_CANADIEN_ERRANT_DOCUMENT), {});
  assert.deepEqual(validateHistoricalDocument(MANIFESTATIONS_GARNEAU_PATRIOTISM_DOCUMENT), {});
  assert.match(MANIFESTATIONS_CANADIEN_ERRANT_DOCUMENT.transcription, /banni de ses foyers[\s\S]*pays malheureux/i);
  assert.match(MANIFESTATIONS_GARNEAU_PATRIOTISM_DOCUMENT.transcription, /préserver leur identité[\s\S]*Union des Canadas[\s\S]*langue des Canadiens français[\s\S]*droits électoraux/i);
  assert.equal((MANIFESTATIONS_GARNEAU_PATRIOTISM_DOCUMENT.transcription.match(/\[…\]/g) ?? []).length, 2);
  assert.match(MANIFESTATIONS_GARNEAU_PATRIOTISM_DOCUMENT.rightsStatement, /Adaptation en français actuel[\s\S]*pas une citation intégrale/i);
});

test("relie le contexte politique à la production d’œuvres patriotiques", () => {
  assert.deepEqual(validateApprovedQuestion(MANIFESTATIONS_OEUVRES_PATRIOTIQUES_QUESTION), {});
  assert.equal(MANIFESTATIONS_OEUVRES_PATRIOTIQUES_QUESTION.operationId, "causal_connections");
  assert.deepEqual(MANIFESTATIONS_OEUVRES_PATRIOTIQUES_QUESTION.historicalDocumentIds, ["MSC-T-001", "MSC-T-004"]);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MANIFESTATIONS_OEUVRES_PATRIOTIQUES_QUESTION.id));
});

test("publie l’aperçu avec la chanson et l’extrait de Garneau", () => {
  const session = createDemoStudentLearningSession("demo-activity-manifestations-oeuvres-patriotiques", "manifestations-socioculturelles");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, MANIFESTATIONS_OEUVRES_PATRIOTIQUES_QUESTION.id);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["MSC-T-001", "MSC-T-004"]);
  assert.deepEqual(session.documentCatalog.map(({ content }) => content.kind), ["historical_excerpt", "historical_excerpt"]);
  assert.equal(session.documentCatalog[1]?.content.kind === "historical_excerpt" && session.documentCatalog[1].content.adapted, true);
});
