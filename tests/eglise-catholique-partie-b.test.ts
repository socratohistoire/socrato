import test from "node:test";
import assert from "node:assert/strict";
import {
  EGLISE_CATHOLIQUE_DOCUMENTS,
  EGLISE_CATHOLIQUE_INSTRUCTION,
  EGLISE_CATHOLIQUE_SCHEMA_FIELDS,
  EGLISE_CATHOLIQUE_TITLE,
  assessEgliseCatholiqueAnswer,
  egliseCatholiqueMissingCount,
  emptyEgliseCatholiqueDraft,
  expectedEgliseCatholiqueDocumentChoice,
  restoreEgliseCatholiqueDraft,
  type EgliseCatholiqueSchemaFieldId,
} from "../lib/eglise-catholique-partie-b.ts";

test("le bandeau et la consigne ne donnent pas l’objet de la description", () => {
  assert.equal(EGLISE_CATHOLIQUE_TITLE, "Le Québec, 1840-1896");
  assert.doesNotMatch(EGLISE_CATHOLIQUE_TITLE, /Église|catholique/i);
  assert.doesNotMatch(EGLISE_CATHOLIQUE_INSTRUCTION, /Église|catholique/i);
  assert.match(EGLISE_CATHOLIQUE_SCHEMA_FIELDS[0].prompt, /institution/i);
});

test("le schéma couvre les quatre précisions officielles et deux manifestations sociales", () => {
  assert.equal(EGLISE_CATHOLIQUE_SCHEMA_FIELDS.length, 7);
  const content = JSON.stringify(EGLISE_CATHOLIQUE_SCHEMA_FIELDS);
  assert.match(content, /ultramontanisme/i);
  assert.match(content, /anticléricalisme/i);
  assert.match(content, /nationalisme de survivance/i);
  assert.match(content, /dualisme confessionnel/i);
  assert.match(content, /éducation/i);
  assert.match(content, /soins de santé|œuvres de charité/i);
});

test("le dossier contient dix documents sourcés, six utiles et quatre à discriminer", () => {
  assert.deepEqual(EGLISE_CATHOLIQUE_DOCUMENTS.map(({ number }) => number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  for (const document of EGLISE_CATHOLIQUE_DOCUMENTS) {
    assert.ok(document.links.length);
    assert.ok(document.links.every(({ url }) => new URL(url).protocol === "https:"));
    assert.match(document.source, /Source primaire/i);
  }
  assert.deepEqual(EGLISE_CATHOLIQUE_DOCUMENTS.filter(({ number }) => expectedEgliseCatholiqueDocumentChoice(number) === "exclude").map(({ number }) => number), [7, 8, 9, 10]);
  assert.deepEqual(EGLISE_CATHOLIQUE_DOCUMENTS.filter(({ supports }) => supports !== null).map(({ supports }) => supports).sort(), ["anticlericalism", "confessional_dualism", "education", "social_works", "survival_nationalism", "ultramontanism"]);
});

test("chacun des six documents utiles soutient une seule bulle différente", () => {
  const useful = EGLISE_CATHOLIQUE_DOCUMENTS.filter(({ supports }) => supports !== null);
  assert.equal(useful.length, 6);
  assert.equal(new Set(useful.map(({ supports }) => supports)).size, 6);
  assert.deepEqual(useful.map(({ number }) => number), [1, 2, 3, 4, 5, 6]);
});

test("les extraits recomposés ont trois ou quatre phrases et signalent les crochets", () => {
  const excerpts = EGLISE_CATHOLIQUE_DOCUMENTS.filter((document): document is typeof document & { excerpt: string } => "excerpt" in document);
  assert.deepEqual(excerpts.map(({ number }) => number), [1, 2, 3, 4, 5, 8, 9, 10]);
  for (const document of excerpts) {
    const sentenceMarks = document.excerpt.match(/[.!?](?:[”»]|\s|$)/g) ?? [];
    assert.ok(sentenceMarks.length >= 3 && sentenceMarks.length <= 4, `document ${document.number}: ${sentenceMarks.length} phrases`);
    assert.match(document.excerpt, /\[[^\]]+\]/);
    assert.match(document.note, /recomposé/i);
    assert.match(document.note, /crochets/i);
  }
});

test("le corpus comprend deux documents visuels utiles et un visuel à discriminer", () => {
  const document5 = EGLISE_CATHOLIQUE_DOCUMENTS[4];
  const document6 = EGLISE_CATHOLIQUE_DOCUMENTS[5];
  const document7 = EGLISE_CATHOLIQUE_DOCUMENTS[6];
  assert.ok("image" in document5);
  assert.match(document5.image.url, /eglise-couvent-hochelaga-1890\.jpg$/);
  assert.ok("image" in document6);
  assert.match(document6.image.url, /eglise-hotel-dieu-montreal-1865\.jpg$/);
  assert.ok("image" in document7);
  assert.equal(document7.supports, null);
});

test("la rétroaction locale reconnaît des formulations attendues dans les sept cases", () => {
  const examples: Record<EgliseCatholiqueSchemaFieldId, string[]> = {
    object: ["L’Église catholique", "Le clergé catholique"],
    ultramontanism: ["L’ultramontanisme", "L’Église possède une autorité supérieure au pouvoir civil"],
    anticlericalism: ["L’anticléricalisme", "Les libéraux contestent l’influence du clergé"],
    survival_nationalism: ["Le nationalisme de survivance", "La nation canadienne-française conserve la foi catholique et la langue française"],
    confessional_dualism: ["Le dualisme confessionnel", "Des institutions catholiques et protestantes distinctes"],
    education: ["Les communautés religieuses dirigent des écoles et enseignent"],
    social_works: ["Les religieuses administrent des hôpitaux et soignent les malades"],
  };
  for (const [id, answers] of Object.entries(examples)) {
    for (const answer of answers) assert.equal(assessEgliseCatholiqueAnswer(id as EgliseCatholiqueSchemaFieldId, answer).status, "recognized", `${id}: ${answer}`);
  }
});

test("la rétroaction locale ne valide pas les distracteurs ou les réponses contradictoires", () => {
  for (const [id, answer] of [
    ["object", "Ce n’est pas l’Église catholique"],
    ["education", "Le ministère de l’Éducation créé par le bill 60"],
    ["ultramontanism", "La Loi sur les Indiens"],
    ["social_works", "Il n’y a aucun hôpital"],
    ["object", ""],
  ] as const) assert.notEqual(assessEgliseCatholiqueAnswer(id, answer).status, "recognized", answer);

  for (const [id, answer] of [["education", "Des écoles"], ["social_works", "Des hôpitaux"], ["confessional_dualism", "Des comités"]] as const) {
    assert.equal(assessEgliseCatholiqueAnswer(id, answer).status, "partial", answer);
  }
});

test("la restauration ignore les données mal formées et n’ouvre pas un corrigé incomplet", () => {
  const restored = restoreEgliseCatholiqueDraft({ answers: { object: 9, ultramontanism: "Ultramontanisme" }, choices: { 1: "invalid", 2: "direct" }, submitted: true });
  assert.equal(restored.answers.object, "");
  assert.equal(restored.answers.ultramontanism, "Ultramontanisme");
  assert.equal(restored.choices[1], undefined);
  assert.equal(restored.choices[2], "direct");
  assert.equal(restored.submitted, false);
  assert.deepEqual(restoreEgliseCatholiqueDraft(null), emptyEgliseCatholiqueDraft());
});

test("la complétion exige sept réponses et dix choix binaires", () => {
  const draft = emptyEgliseCatholiqueDraft();
  assert.equal(egliseCatholiqueMissingCount(draft), 17);
  for (const field of EGLISE_CATHOLIQUE_SCHEMA_FIELDS) draft.answers[field.id] = "Une réponse";
  for (const document of EGLISE_CATHOLIQUE_DOCUMENTS) draft.choices[document.number] = expectedEgliseCatholiqueDocumentChoice(document.number);
  assert.equal(egliseCatholiqueMissingCount(draft), 0);
  draft.submitted = true;
  assert.equal(restoreEgliseCatholiqueDraft(draft).submitted, true);
  draft.choices[3] = "";
  assert.equal(egliseCatholiqueMissingCount(draft), 1);
});
