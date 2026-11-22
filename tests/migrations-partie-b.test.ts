import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MIGRATIONS_ACTIVITY_ID,
  MIGRATIONS_DOCUMENTS,
  MIGRATIONS_INSTRUCTION,
  MIGRATIONS_TITLE,
  MIGRATIONS_SCHEMA_FIELDS,
  emptyMigrationsDraft,
  migrationsMissingCount,
  migrationsRelationScore,
  restoreMigrationsDraft,
} from "../lib/migrations-partie-b.ts";
import { MIGRATIONS_CORRECTION, MIGRATIONS_DOCUMENT_FEEDBACK } from "../lib/migrations-partie-b-correction.ts";

test("le schéma sépare les deux mouvements et ne demande qu’une information par précision", () => {
  assert.match(MIGRATIONS_INSTRUCTION, /déplacements de population.*1840.*1896/);
  assert.doesNotMatch(MIGRATIONS_TITLE + MIGRATIONS_INSTRUCTION, /migrations|mouvements migratoires/i, "le titre et la consigne ne donnent pas la réponse à l’objet sur 2 points");
  assert.doesNotMatch(MIGRATIONS_INSTRUCTION, /évolution de la démographie|Utile|À discriminer/);
  assert.deepEqual(MIGRATIONS_SCHEMA_FIELDS.map(({ id }) => id), ["object", "us_destination", "us_causes", "colonization", "transatlantic", "famine", "quarantine"]);
  const fields = Object.fromEntries(MIGRATIONS_SCHEMA_FIELDS.map(({ id, prompt }) => [id, prompt]));
  assert.equal(fields.us_destination, "Nommez précisément la région des États-Unis vers laquelle émigrent les Canadiens français.");
  assert.match(fields.us_causes, /une cause/);
  assert.match(fields.transatlantic, /pays d’origine.*années 1840/);
  assert.doesNotMatch(fields.transatlantic, /ce qui provoque/);
  assert.match(fields.famine, /événement.*départ/);
  assert.equal(fields.quarantine, "Décrivez une mesure appliquée à leur arrivée.");
  assert.match(MIGRATIONS_CORRECTION.us_destination.answer, /Nouvelle-Angleterre/);
  assert.match(MIGRATIONS_CORRECTION.us_destination.criteria, /pays, mais ne précise pas la région/);
});

test("la carte de Socrato situe les déplacements sans donner le nom de la région à trouver", () => {
  const document = MIGRATIONS_DOCUMENTS.find(({ number }) => number === 2)!;
  assert.ok("image" in document);
  assert.match(document.image.url, /migrations-canadiens-francais-etats-unis-section-b\.png$/);
  assert.equal(document.image.width, 1588);
  assert.equal(document.image.height, 600);
  assert.match(document.source, /Socrato.*Natural Earth.*pédagogique/);
  assert.match(document.fullSource, /schématiques.*ne représentent pas des effectifs/);
  assert.doesNotMatch(document.title + document.note + document.source + document.image.alt, /Nouvelle-Angleterre|Détroit|recensement|Terre-Neuve/);
  const map = readFileSync(new URL("../public/historical-documents/migrations-canadiens-francais-etats-unis-section-b.svg", import.meta.url), "utf8");
  assert.match(map, /ÉTATS-UNIS/);
  assert.match(map, /Direction des déplacements de population/);
  assert.match(map, /route--local/);
  assert.doesNotMatch(map, /NOUVELLE-ANGLETERRE|Nouvelle-Angleterre/);
});

test("la grille applique la dépendance à l’élément central pour les neuf combinaisons", () => {
  for (const [central, expected] of [
    ["correct", [1, 2, 3]],
    ["partial", [0, 1, 2]],
    ["incorrect", [0, 0, 1]],
  ] as const) {
    for (const details of [0, 1, 2] as const) assert.equal(migrationsRelationScore(central, details), expected[details]);
  }
  assert.equal(2 + migrationsRelationScore("correct", 2) + migrationsRelationScore("correct", 2), 8);
  assert.equal(migrationsRelationScore("incorrect", 2), 1, "deux détails corrects ne compensent pas un élément central incorrect");
});

test("les dix documents sont mélangés, renumérotés et conservent leurs références", () => {
  assert.deepEqual(MIGRATIONS_DOCUMENTS.map(({ number }) => number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(MIGRATIONS_DOCUMENTS.map(({ number }) => MIGRATIONS_DOCUMENT_FEEDBACK[number].useful), [false, true, false, true, true, false, true, false, true, false]);
  for (const document of MIGRATIONS_DOCUMENTS) {
    assert.ok(document.links.length);
    assert.ok(document.links.every(({ url }) => new URL(url).protocol === "https:"));
    assert.ok(document.source.length > 0);
    assert.ok(document.source.split(/\s+/).length <= 22, `source abrégée du document ${document.number}`);
    assert.ok(document.fullSource.length >= document.source.length);
    assert.ok(MIGRATIONS_DOCUMENT_FEEDBACK[document.number]);
    assert.equal("supports" in document, false, "le dossier élève ne révèle pas les cases du corrigé");
  }
  const text = JSON.stringify(MIGRATIONS_DOCUMENTS);
  assert.match(text, /Canadien Pacifique.*1892/);
  assert.doesNotMatch(text, /14 FÉVRIER 1933|Funeral at Skibbereen/);
  assert.match(text, /Bureau fédéral de la statistique.*1946/);
  assert.match(text, /Lucy Knox.*Hannah Urquhart/);
  assert.match(text, /Lord Elgin.*28 juin 1848/);
  const document3 = MIGRATIONS_DOCUMENTS.find(({ number }) => number === 3)!;
  assert.ok("image" in document3);
  assert.match(document3.image.url, /fermes-gratuites-1892\.png$/);
  assert.match(document3.date, /1892/);
  assert.match(MIGRATIONS_DOCUMENT_FEEDBACK[3].explanation, /Manitoba.*retenir les familles au Québec/);
  const document4 = MIGRATIONS_DOCUMENTS.find(({ number }) => number === 4)!;
  assert.ok("image" in document4);
  assert.match(document4.image.url, /clonakilty-famine-1847\.jpg$/);
  assert.match(document4.source, /13 février 1847/);
  assert.doesNotMatch(document4.date + document4.title + document4.note + document4.image.alt, /Irlande/i);
  const document6 = MIGRATIONS_DOCUMENTS.find(({ number }) => number === 6)!;
  assert.ok("excerpt" in document6);
  assert.doesNotMatch(document6.date + document6.excerpt + document6.note, /Nouvelle-Angleterre/i);
  assert.match(MIGRATIONS_CORRECTION.transatlantic.answer, /Angleterre.*Écosse.*Royaume-Uni/);
  assert.match(MIGRATIONS_CORRECTION.transatlantic.criteria, /Ne pas refuser une réponse exacte/);
  assert.match(MIGRATIONS_CORRECTION.famine.criteria, /accepter un autre événement/);
});

test("les références du corrigé suivent la nouvelle numérotation et explicitent les limites documentaires", () => {
  for (const { id } of MIGRATIONS_SCHEMA_FIELDS) {
    assert.ok(MIGRATIONS_CORRECTION[id].answer);
    assert.ok(MIGRATIONS_CORRECTION[id].criteria);
    for (const number of MIGRATIONS_CORRECTION[id].documents) assert.equal(MIGRATIONS_DOCUMENT_FEEDBACK[number].useful, true);
  }
  assert.match(MIGRATIONS_DOCUMENTS[4].source, /Chauveau/);
  assert.match(MIGRATIONS_DOCUMENTS[6].fullSource, /Au nord/);
  assert.match(MIGRATIONS_DOCUMENTS[8].source, /Lord Elgin/);
  assert.match(MIGRATIONS_DOCUMENTS[8].date, /28 JUIN 1848/);
  const document9 = MIGRATIONS_DOCUMENTS[8];
  assert.ok("excerpt" in document9);
  assert.match(document9.excerpt, /Grosse-Île, les immigrants débarqués des navires placés en quarantaine.*autorisation du commandant.*hôpitaux/);
  assert.equal((document9.excerpt.match(/\.(?:\s|\s*»|$)/g) ?? []).length, 4);
  assert.doesNotMatch(document9.excerpt, /Ces mesures visent|propagation de la fièvre/);
  assert.match(document9.excerpt, /\[…\]/);
  assert.doesNotMatch(document9.excerpt, /croyaient|espéraient/);
  assert.match(MIGRATIONS_DOCUMENT_FEEDBACK[2].explanation, /carte pédagogique.*ne mesurent pas le nombre/);
  assert.match(MIGRATIONS_DOCUMENT_FEEDBACK[10].explanation, /ne prouve pas à lui seul/);
  assert.match(MIGRATIONS_CORRECTION.quarantine.criteria, /lieu, pas une mesure/);
  assert.match(MIGRATIONS_CORRECTION.colonization.criteria, /Labelle seul ne décrit pas une mesure/);
  assert.match(MIGRATIONS_CORRECTION.us_causes.criteria, /ne pas exiger deux causes/);
});

test("seuls les six titres demandés sont conservés et les images s’agrandissent dans un dialogue", () => {
  assert.deepEqual(MIGRATIONS_DOCUMENTS.filter(({ title }) => title).map(({ number }) => number), [1, 2, 3, 4, 7, 10]);
  const student = readFileSync(new URL("../app/components/migrations-partie-b.tsx", import.meta.url), "utf8");
  assert.match(student, /aria-haspopup="dialog"/);
  assert.match(student, /dialog\?\.showModal\(\)/);
  assert.match(student, /Fermer la vue agrandie/);
  assert.match(student, /onCancel=/);
  assert.doesNotMatch(student, /<a href=\{document\.image\.url\}/);
  assert.match(student, /<p>\{document\.source\}<\/p>/);
  assert.doesNotMatch(student, /document\.fullSource/);
});

test("le nouveau brouillon exige seulement les sept réponses et ne récupère pas l’ancien schéma", () => {
  assert.notEqual(MIGRATIONS_ACTIVITY_ID, "migrations-partie-b-v1");
  const draft = emptyMigrationsDraft();
  assert.equal(migrationsMissingCount(draft), 7);
  for (const { id } of MIGRATIONS_SCHEMA_FIELDS) draft.answers[id] = "Une réponse";
  assert.equal(migrationsMissingCount(draft), 0);
  draft.submitted = true;
  assert.deepEqual(restoreMigrationsDraft(draft), draft);
  draft.answers.famine = " ";
  assert.equal(restoreMigrationsDraft(draft).submitted, false);
  const restored = restoreMigrationsDraft({ answers: { object: 9, exode: "Exode rural", famine: "x".repeat(3000) }, submitted: true });
  assert.equal(restored.answers.object, "");
  assert.equal("exode" in restored.answers, false);
  assert.equal(restored.answers.famine.length, 2000);
  assert.equal(restored.submitted, false);
  assert.deepEqual(restoreMigrationsDraft(null), emptyMigrationsDraft());
});

test("le corrigé reste dans la route enseignant authentifiée, sans comparaison automatique côté élève", () => {
  const student = readFileSync(new URL("../app/components/migrations-partie-b.tsx", import.meta.url), "utf8");
  const teacher = readFileSync(new URL("../app/teacher/activities/migrations-partie-b/page.tsx", import.meta.url), "utf8");
  const data = readFileSync(new URL("../lib/migrations-partie-b.ts", import.meta.url), "utf8");
  assert.doesNotMatch(student, /assessMigrationsAnswer|MIGRATIONS_CORRECTION|migrations-partie-b-correction|Terminer et comparer|choiceLabels/);
  assert.doesNotMatch(data, /LOCAL_ANSWER_RULES|answer:|supports:/);
  assert.match(student, /teacherMode \? children : null/);
  assert.match(teacher, /await requireTeacherActor\(\)/);
  assert.match(teacher, /MIGRATIONS_CORRECTION/);
  assert.match(student, /<MigrationsRubric \/>/);
  assert.match(student, /Finaliser et télécharger mes réponses/);
});
