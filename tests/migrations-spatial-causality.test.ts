import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { validateApprovedQuestion } from "../lib/pedagogical-reference/approved-question.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import {
  MIGRATIONS_EMIGRATION_CAUSES_REPORT_DOCUMENT,
  MIGRATIONS_IRISH_FAMINE_DOCUMENT,
  MIGRATIONS_NATURAL_EARTH_MAP_SOURCE,
  MIGRATIONS_RURAL_EXODUS_DOCUMENT,
  MIGRATIONS_SPATIAL_CAUSALITY_QUESTION,
} from "../lib/pedagogical-reference/migrations-spatial-causality.ts";
import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";

test("prépare une carte publique couvrant le Canada, l’Atlantique, les États-Unis et l’Europe", () => {
  const mapPath = "public/historical-documents/migrations-atlantique-canada-europe-natural-earth.svg";
  assert.equal(existsSync(mapPath), true);
  const svg = readFileSync(mapPath, "utf8");
  assert.match(svg, /CANADA/);
  assert.match(svg, /ÉTATS-UNIS/);
  assert.match(svg, /EUROPE/);
  assert.match(svg, /OCÉAN ATLANTIQUE/);
  assert.match(svg, /MOUVEMENTS MIGRATOIRES AU CANADA ET AU QUÉBEC · 1840–1896/);
  assert.match(svg, /AGRANDISSEMENT DU QUÉBEC/);
  assert.match(svg, /SUD DU QUÉBEC/);
  assert.doesNotMatch(svg, /NORD DE LA NOUVELLE-ANGLETERRE/);
  assert.match(svg, /MONTRÉAL ET ENVIRONS/);
  assert.equal((svg.match(/route route--new-england/g) ?? []).length, 3);
  assert.equal((svg.match(/route route--local route--rural/g) ?? []).length, 3);
  assert.match(svg, /<path class="route" d="M 638\.4 418\.2 Q 501\.2 315\.8 332\.8 354\.5"\/>/);
  assert.match(svg, /<circle class="route-origin" cx="638\.4" cy="418\.2" r="8"\/>/);
  assert.match(svg, /\.route--local\{stroke:#315f78;/);
  assert.match(svg, /id="arrow-local"[^>]+><path[^>]+fill="#315f78"/);
  assert.match(svg, /y="666\.076923076923">Saguenay–Lac-Saint-Jean<\/text>/);
  assert.match(svg, /y="710\.2307692307692">Laurentides<\/text>/);
  assert.doesNotMatch(svg, /COMMENT LIRE LA CARTE/);
  assert.match(MIGRATIONS_NATURAL_EARTH_MAP_SOURCE.rightsNote ?? "", /domaine public/i);
});

test("valide les trois nouveaux documents historiques de la banque", () => {
  assert.deepEqual(validateHistoricalDocument(MIGRATIONS_EMIGRATION_CAUSES_REPORT_DOCUMENT), {});
  assert.deepEqual(validateHistoricalDocument(MIGRATIONS_IRISH_FAMINE_DOCUMENT), {});
  assert.deepEqual(validateHistoricalDocument(MIGRATIONS_RURAL_EXODUS_DOCUMENT), {});
});

test("associe cinq mouvements à cinq documents-causes numérotés", () => {
  const interaction = MIGRATIONS_SPATIAL_CAUSALITY_QUESTION.associationInteraction;
  assert.deepEqual(validateApprovedQuestion(MIGRATIONS_SPATIAL_CAUSALITY_QUESTION), {});
  assert.equal(interaction.items.length, 5);
  assert.equal(interaction.targets.length, 5);
  assert.deepEqual(interaction.causeDocuments.map(({ number }) => number), [1, 2, 3, 4, 5]);
  assert.ok(interaction.causeDocuments.every((document) => !("shortTitle" in document)));
  assert.equal(interaction.causeTargets.length, 5);
  assert.equal(new Set(interaction.causeTargets.map(({ correctDocumentId }) => correctDocumentId)).size, 5);
  assert.ok(interaction.targets.every(({ zone }) => zone.width > 0 && zone.height > 0));
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.some(({ id }) => id === MIGRATIONS_SPATIAL_CAUSALITY_QUESTION.id));
});

test("publie un aperçu avec la carte et les cinq documents dans l’ordre de la banque", () => {
  const session = createDemoStudentLearningSession("demo-activity-migrations-mouvements-causes", "migrations");
  assert.ok(session);
  assert.equal(session.questions[0]?.type, "interactive_association");
  assert.equal(session.questions[0]?.associationInteraction?.map?.imageUrl, "/historical-documents/migrations-atlantique-canada-europe-natural-earth.svg?v=compact-height");
  assert.deepEqual(session.documentCatalog.map(({ id }) => id), ["MIG-T-001", "MIG-T-003", "MIG-I-001", "MIG-T-004", "PN-I-001"]);
  assert.deepEqual(session.questions[0]?.documentRelations.map(({ documentId }) => documentId), ["MIG-T-003", "PN-I-001", "MIG-I-001", "MIG-T-001", "MIG-T-004"]);
});

test("permet d’agrandir chaque document de la banque sans conserver les cercles de départ", () => {
  const view = readFileSync("app/eleve/activite/[activityId]/session-view.tsx", "utf8");
  const map = readFileSync("public/historical-documents/migrations-atlantique-canada-europe-natural-earth.svg", "utf8");
  assert.match(view, /migration-document-expand/);
  assert.match(view, /expandedCauseDocument/);
  assert.match(view, /closest\("button, details, a"\)/);
  assert.doesNotMatch(map, /route-origin--new-england|route-origin--local/);
});
