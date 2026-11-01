import assert from "node:assert/strict";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  MIGRATIONS_CLONAKILTY_FAMINE_IMAGE_DOCUMENT,
  MIGRATIONS_CANADA_LAND_OPPORTUNITY_DOCUMENT,
  MIGRATIONS_FAMINE_GROSSE_ILE_DOCUMENTS,
  MIGRATIONS_FAMINE_GROSSE_ILE_QUESTION,
  MIGRATIONS_GROSSE_ILE_1847_STATISTICS_DOCUMENT,
  MIGRATIONS_ROBERT_WHYTE_INSPECTION_DOCUMENT,
} from "../lib/pedagogical-reference/migrations-famine-grosse-ile.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("documente la famine, l’arrivée massive, l’inspection sanitaire et l’accès à la terre avec quatre sources", () => {
  assert.deepEqual(MIGRATIONS_FAMINE_GROSSE_ILE_DOCUMENTS.map(({ id }) => id), ["MIG-I-002", "MIG-S-002", "MIG-T-006", "MIG-T-007"]);
  for (const document of MIGRATIONS_FAMINE_GROSSE_ILE_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
  }
  assert.match(MIGRATIONS_CLONAKILTY_FAMINE_IMAGE_DOCUMENT.assetUrl, /migrations-clonakilty-famine-1847\.jpg$/);
  assert.match(MIGRATIONS_GROSSE_ILE_1847_STATISTICS_DOCUMENT.transcription, /98 106[\s\S]*8 691[\s\S]*3 238/);
  assert.equal(
    MIGRATIONS_ROBERT_WHYTE_INSPECTION_DOCUMENT.transcription.split(/[.!?](?:[ »”]|\s|$)/).filter(Boolean).length,
    4,
  );
  assert.equal(
    MIGRATIONS_CANADA_LAND_OPPORTUNITY_DOCUMENT.transcription.split(/[.!?](?:[ »”]|\s|$)/).filter(Boolean).length,
    4,
  );
  assert.match(MIGRATIONS_CANADA_LAND_OPPORTUNITY_DOCUMENT.transcription, /fermes[\s\S]*prix modérés[\s\S]*paiement[\s\S]*marchés/i);
});

test("fait construire la chaîne famine, immigration transatlantique et quarantaine", () => {
  assert.deepEqual(validateApprovedQuestion(MIGRATIONS_FAMINE_GROSSE_ILE_QUESTION), {});
  assert.equal(
    MIGRATIONS_FAMINE_GROSSE_ILE_QUESTION.prompt,
    "Expliquez le lien entre la Grande Famine en Irlande, l’immigration transatlantique de 1847 et le rôle joué par Grosse-Île au Québec.",
  );
  assert.equal(MIGRATIONS_FAMINE_GROSSE_ILE_QUESTION.operationId, "causal_connections");
  assert.match(MIGRATIONS_FAMINE_GROSSE_ILE_QUESTION.instruction, /une fonction précise[\s\S]*inspection[\s\S]*suffit[\s\S]*facultatives/i);
  assert.match(MIGRATIONS_FAMINE_GROSSE_ILE_QUESTION.expectedAnswer, /Réponse minimale attendue[\s\S]*Grande Famine[\s\S]*traverser l’Atlantique[\s\S]*inspectant les navires et les passagers/i);
  assert.match(MIGRATIONS_FAMINE_GROSSE_ILE_QUESTION.expectedAnswer, /Éléments d’enrichissement facultatifs[\s\S]*terres agricoles[\s\S]*station de quarantaine[\s\S]*hôpital/i);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MIGRATIONS_FAMINE_GROSSE_ILE_QUESTION.id));
});

test("publie un aperçu avec la gravure, les données et les deux extraits", () => {
  const session = createDemoStudentLearningSession("demo-activity-migrations-famine-grosse-ile", "migrations");
  assert.ok(session);
  assert.equal(session.questions[0]?.id, MIGRATIONS_FAMINE_GROSSE_ILE_QUESTION.id);
  assert.equal(session.questions[0]?.intellectualOperations[0]?.label, "Établir des liens de causalité");
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["MIG-I-002", "MIG-S-002", "MIG-T-006", "MIG-T-007"]);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ displayOrder }) => displayOrder), [1, 2, 3, 4]);
});
