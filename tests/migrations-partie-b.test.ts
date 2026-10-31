import test from "node:test";
import assert from "node:assert/strict";
import {
  MIGRATIONS_DOCUMENTS,
  MIGRATIONS_SCHEMA_FIELDS,
  assessMigrationsAnswer,
  emptyMigrationsDraft,
  expectedMigrationsDocumentChoice,
  migrationsMissingCount,
  restoreMigrationsDraft,
  type MigrationsSchemaFieldId,
} from "../lib/migrations-partie-b.ts";

test("la Partie B couvre les quatre précisions officielles de la notion Migrations", () => {
  assert.equal(MIGRATIONS_SCHEMA_FIELDS.length, 7);
  assert.match(MIGRATIONS_SCHEMA_FIELDS[0].prompt, /phénomène démographique/i);
  const content = JSON.stringify(MIGRATIONS_SCHEMA_FIELDS);
  assert.match(content, /exode rural/i);
  assert.match(content, /États-Unis/i);
  assert.match(content, /régions de colonisation/i);
  assert.match(content, /transatlantiques|îles Britanniques/i);
});

test("le dossier contient dix documents sourcés, six utiles et quatre à discriminer", () => {
  assert.deepEqual(MIGRATIONS_DOCUMENTS.map(({ number }) => number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  for (const document of MIGRATIONS_DOCUMENTS) {
    assert.ok(document.links.length);
    assert.ok(document.links.every(({ url }) => new URL(url).protocol === "https:"));
    assert.match(document.source, /Source (primaire|statistique|cartographique)|source primaire|source statistique|source cartographique/i);
  }
  assert.deepEqual(MIGRATIONS_DOCUMENTS.filter(({ number }) => expectedMigrationsDocumentChoice(number) === "exclude").map(({ number }) => number), [7, 8, 9, 10]);
  assert.deepEqual(MIGRATIONS_DOCUMENTS.filter(({ supports }) => supports !== null).map(({ supports }) => supports).sort(), ["colonization", "exode", "quarantine", "transatlantic", "us_causes", "us_destination"]);
  const document8 = MIGRATIONS_DOCUMENTS.find(({ number }) => number === 8);
  assert.ok(document8 && "excerpt" in document8 && !("image" in document8));
  assert.equal(document8.title, "");
  assert.match(document8.excerpt, /8 \$ par semaine.*famille risque d’être séparée/i);
  assert.match(document8.source, /Archives publiques de l’Ontario.*RG 3-9-0-391/i);
  assert.doesNotMatch(JSON.stringify(document8), /Loi sur les Indiens/i);
  const document9 = MIGRATIONS_DOCUMENTS.find(({ number }) => number === 9);
  assert.ok(document9 && "excerpt" in document9 && !("image" in document9));
  assert.equal(document9.title, "");
  assert.match(document9.excerpt, /surpeuplement/i);
  assert.match(document9.source, /Bureau fédéral de la statistique.*1946/i);
  assert.doesNotMatch(JSON.stringify(document9), /Acte de l’Amérique du Nord britannique/i);
  const document10 = MIGRATIONS_DOCUMENTS.find(({ number }) => number === 10);
  assert.ok(document10 && "excerpt" in document10 && !("image" in document10));
  assert.equal(document10.title, "");
  assert.match(document10.excerpt, /Boston.*Halifax.*Nouvelle-Angleterre/i);
  assert.match(document10.source, /Lucy Knox.*Hannah Urquhart.*1776/i);
  assert.doesNotMatch(JSON.stringify(document10), /RÉCIT|migrations-loyalistes-1783-recitus/i);
});

test("chacun des six documents utiles soutient une seule bulle différente", () => {
  const useful = MIGRATIONS_DOCUMENTS.filter(({ supports }) => supports !== null);
  assert.equal(useful.length, 6);
  assert.equal(new Set(useful.map(({ supports }) => supports)).size, 6);
  assert.deepEqual(useful.map(({ number }) => number), [1, 2, 3, 4, 5, 6]);
  const document6 = MIGRATIONS_DOCUMENTS.find(({ number }) => number === 6);
  assert.ok(document6 && "attribution" in document6);
  assert.equal(document6.attribution, "Journal de Robert Whyte, passager irlandais du George");
});

test("les extraits recomposés ont au moins trois phrases et signalent les crochets", () => {
  const excerpts = MIGRATIONS_DOCUMENTS.filter((document): document is typeof document & { excerpt: string } => "excerpt" in document);
  assert.deepEqual(excerpts.map(({ number }) => number), [3, 6, 8, 9, 10]);
  for (const document of excerpts) {
    const sentenceMarks = document.excerpt.match(/[.!?](?:[”»]|\s|$)/g) ?? [];
    assert.ok(sentenceMarks.length >= 3, `document ${document.number}`);
    assert.match(document.excerpt, /\[[^\]]+\]/);
    assert.match(document.note, /recomposé/i);
    assert.match(document.note, /crochets/i);
  }
});

test("le corpus comprend un tableau, deux cartes et une illustration de la famine", () => {
  const document1 = MIGRATIONS_DOCUMENTS[0];
  const document2 = MIGRATIONS_DOCUMENTS[1];
  const document4 = MIGRATIONS_DOCUMENTS[3];
  const document5 = MIGRATIONS_DOCUMENTS[4];
  assert.ok("table" in document1);
  assert.deepEqual(document1.table.rows, [["1871", "19,5 %", "80,5 %"], ["1881", "22,8 %", "77,2 %"], ["1891", "29,2 %", "70,8 %"]]);
  assert.match(document2.image.url, /migrations-canadiens-etats-unis-1890-villes-pays\.png$/);
  assert.match(document4.image.url, /migrations-colonisation-au-nord-1883\.jpg$/);
  assert.match(document5.image.url, /migrations-famine-skibbereen-1847\.jpg$/);
});

test("le pont Victoria est un document à discriminer", () => {
  const document7 = MIGRATIONS_DOCUMENTS[6];
  assert.match(document7.title, /pont Victoria/i);
  assert.match(document7.image.url, /industrialisation-pont-victoria-construction\.jpg$/);
  assert.equal(document7.supports, null);
  assert.equal(expectedMigrationsDocumentChoice(7), "exclude");
});

test("la rétroaction locale reconnaît des formulations attendues dans les sept cases", () => {
  const examples: Record<MigrationsSchemaFieldId, string[]> = {
    object: ["Les migrations"],
    exode: ["L’exode rural", "Des habitants quittent les campagnes pour les villes"],
    us_destination: ["Les États-Unis", "Les villes de Nouvelle-Angleterre"],
    us_causes: ["Les dettes et les mauvaises récoltes", "Les emplois mieux payés en Nouvelle-Angleterre"],
    colonization: ["L’ouverture de régions de colonisation dans les Laurentides", "Le curé Labelle"],
    transatlantic: ["Les Irlandais fuient la Grande Famine", "Les îles Britanniques"],
    quarantine: ["La quarantaine à Grosse-Île", "L’inspection des navires d’immigrants"],
  };
  for (const [id, answers] of Object.entries(examples)) {
    for (const answer of answers) assert.equal(assessMigrationsAnswer(id as MigrationsSchemaFieldId, answer).status, "recognized", `${id}: ${answer}`);
  }
});

test("la rétroaction locale ne valide pas les anachronismes ou les réponses contradictoires", () => {
  for (const [id, answer] of [
    ["object", "Ce ne sont pas des migrations"],
    ["us_destination", "Clifford Sifton et l’immigration de masse de 1900"],
    ["quarantine", "Il n’y a aucune quarantaine"],
    ["exode", "Le baby boom"],
    ["quarantine", ""],
  ] as const) assert.notEqual(assessMigrationsAnswer(id, answer).status, "recognized", answer);

  for (const [id, answer] of [["exode", "Les campagnes"], ["us_destination", "Des villes industrielles"], ["colonization", "Des terres"]] as const) {
    assert.equal(assessMigrationsAnswer(id, answer).status, "partial", answer);
  }
});

test("la restauration ignore les données mal formées et n’ouvre pas un corrigé incomplet", () => {
  const restored = restoreMigrationsDraft({ answers: { object: 9, exode: "Exode rural" }, choices: { 1: "invalid", 2: "direct" }, submitted: true });
  assert.equal(restored.answers.object, "");
  assert.equal(restored.answers.exode, "Exode rural");
  assert.equal(restored.choices[1], undefined);
  assert.equal(restored.choices[2], "direct");
  assert.equal(restored.submitted, false);
  assert.deepEqual(restoreMigrationsDraft(null), emptyMigrationsDraft());
});

test("la complétion exige sept réponses et dix choix binaires", () => {
  const draft = emptyMigrationsDraft();
  assert.equal(migrationsMissingCount(draft), 17);
  for (const field of MIGRATIONS_SCHEMA_FIELDS) draft.answers[field.id] = "Une réponse";
  for (const document of MIGRATIONS_DOCUMENTS) draft.choices[document.number] = expectedMigrationsDocumentChoice(document.number);
  assert.equal(migrationsMissingCount(draft), 0);
  draft.submitted = true;
  assert.equal(restoreMigrationsDraft(draft).submitted, true);
  draft.choices[3] = "";
  assert.equal(migrationsMissingCount(draft), 1);
});
