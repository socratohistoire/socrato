import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_DOCUMENTS,
  MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_QUESTION,
  MIGRATIONS_INDUSTRIALIZATION_URBAN_MOVEMENT_DOCUMENT,
  MIGRATIONS_RAILWAY_NEW_ENGLAND_MOVEMENT_DOCUMENT,
} from "../lib/pedagogical-reference/migrations-industrialization-transport.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("documente deux influences distinctes sur les déplacements de population", () => {
  assert.deepEqual(MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_DOCUMENTS.map(({ id }) => id), ["MIG-T-012", "MIG-T-013"]);
  for (const document of MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
    assert.equal(document.transcription.split(/[.!?](?:[ »”]|\s|$)/).filter(Boolean).length, 4);
  }
  assert.match(MIGRATIONS_INDUSTRIALIZATION_URBAN_MOVEMENT_DOCUMENT.transcription, /campagnes du Canada français[\s\S]*ateliers industriels[\s\S]*filatures de coton[\s\S]*emplois/i);
  assert.match(MIGRATIONS_RAILWAY_NEW_ENGLAND_MOVEMENT_DOCUMENT.transcription, /Montréal[\s\S]*Portland[\s\S]*Boston[\s\S]*lendemain/i);
  assert.match(MIGRATIONS_INDUSTRIALIZATION_URBAN_MOVEMENT_DOCUMENT.rightsStatement, /domaine public/i);
  assert.match(MIGRATIONS_RAILWAY_NEW_ENGLAND_MOVEMENT_DOCUMENT.rightsStatement, /domaine public/i);
});

test("exige deux liens de causalité entre 1840 et 1896", () => {
  assert.deepEqual(validateApprovedQuestion(MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_QUESTION), {});
  assert.equal(
    MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_QUESTION.prompt,
    "Expliquez comment l’industrialisation et le développement des transports influencent les déplacements de population au Québec entre 1840 et 1896. Dans votre réponse, établissez un lien de causalité pour chacun de ces facteurs.",
  );
  assert.equal(MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_QUESTION.operationId, "causal_connections");
  assert.match(MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_QUESTION.expectedAnswer, /filatures[\s\S]*familles canadiennes-françaises[\s\S]*chemin de fer[\s\S]*émigration/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_QUESTION.id));
});

test("publie un aperçu avec les deux documents dans l’ordre", () => {
  const session = createDemoStudentLearningSession("demo-activity-migrations-industrialization-transport", "migrations");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_QUESTION.id);
  assert.equal(session.questions[0]?.intellectualOperations[0]?.label, "Établir des liens de causalité");
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["MIG-T-012", "MIG-T-013"]);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ displayOrder }) => displayOrder), [1, 2]);
  const beaugrand = session.documentCatalog.find(({ id }) => id === "MIG-T-012");
  const timetable = session.documentCatalog.find(({ id }) => id === "MIG-T-013");
  assert.equal(beaugrand?.content.kind === "historical_excerpt" ? beaugrand.content.adapted : undefined, false);
  assert.equal(timetable?.content.kind === "historical_excerpt" ? timetable.content.adapted : undefined, true);
});
