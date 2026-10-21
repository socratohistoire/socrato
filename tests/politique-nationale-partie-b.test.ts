import test from "node:test";
import assert from "node:assert/strict";
import {
  POLITIQUE_NATIONALE_DOCUMENTS,
  POLITIQUE_NATIONALE_SCHEMA_FIELDS,
  assessPolitiqueNationaleAnswer,
  emptyPolitiqueNationaleDraft,
  expectedPolitiqueNationaleDocumentChoice,
  politiqueNationaleMissingCount,
  restorePolitiqueNationaleDraft,
  type PolitiqueNationaleSchemaFieldId,
} from "../lib/politique-nationale-partie-b.ts";

test("la Partie B couvre les quatre précisions officielles de la Politique nationale", () => {
  assert.equal(POLITIQUE_NATIONALE_SCHEMA_FIELDS.length, 7);
  const content = JSON.stringify(POLITIQUE_NATIONALE_SCHEMA_FIELDS);
  assert.match(content, /crise économique de 1873/i);
  assert.match(content, /droits de douane|politique tarifaire/i);
  assert.match(content, /Canadien Pacifique/i);
  assert.match(content, /colonisation des terres de l’Ouest/i);
});

test("le dossier contient dix documents sourcés, six utiles et quatre distracteurs", () => {
  assert.deepEqual(POLITIQUE_NATIONALE_DOCUMENTS.map(({ number }) => number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  for (const document of POLITIQUE_NATIONALE_DOCUMENTS) {
    assert.ok(document.links.length);
    assert.ok(document.links.every(({ url }) => new URL(url).protocol === "https:"));
    assert.match(document.source, /Source (primaire|secondaire|statistique)|source primaire|source secondaire/i);
  }
  assert.doesNotMatch(JSON.stringify(POLITIQUE_NATIONALE_DOCUMENTS), /alloprof/i);
  assert.deepEqual(POLITIQUE_NATIONALE_DOCUMENTS.filter(({ number }) => expectedPolitiqueNationaleDocumentChoice(number) === "exclude").map(({ number }) => number), [6, 8, 9, 10]);
  assert.deepEqual(POLITIQUE_NATIONALE_DOCUMENTS.filter(({ supports }) => supports !== null).map(({ supports }) => supports).sort(), ["adoption", "context", "industrial", "railway", "settlement", "tariff"]);
  const document8 = POLITIQUE_NATIONALE_DOCUMENTS.find(({ number }) => number === 8);
  assert.ok(document8 && "excerpt" in document8 && !("image" in document8));
  assert.match(document8.title, /Alexander Mackenzie/i);
  assert.match(document8.excerpt, /loi électorale/i);
  assert.match(document8.excerpt, /Cour suprême/i);
  assert.match(document8.source, /Kingston.*27 juin 1877/i);
});

test("les documents 9 et 10 sont deux extraits historiques à discriminer", () => {
  const document9 = POLITIQUE_NATIONALE_DOCUMENTS[8];
  const document10 = POLITIQUE_NATIONALE_DOCUMENTS[9];
  assert.match(document9.excerpt, /Loi sur les Indiens de 1876/i);
  assert.match(document10.excerpt, /Aucune femme ne peut voter/i);
  assert.equal(document9.supports, null);
  assert.equal(document10.supports, null);
  assert.equal(expectedPolitiqueNationaleDocumentChoice(9), "exclude");
  assert.equal(expectedPolitiqueNationaleDocumentChoice(10), "exclude");
});

test("les documents 1 et 4 présentent les données sans fournir l’interprétation attendue", () => {
  const document1 = POLITIQUE_NATIONALE_DOCUMENTS[0];
  const document4 = POLITIQUE_NATIONALE_DOCUMENTS[3];
  assert.deepEqual(document1.table.rows.map(([year]) => year), ["1872", "1873", "1874", "1875", "1876", "1877", "1878", "1879"]);
  assert.match(document1.table.headers[1], /bouvillons.*¢\/lb/i);
  assert.match(document1.note, /cents par livre/i);
  assert.doesNotMatch(JSON.stringify(document1), /1913\s*=\s*100|indice des prix/i);
  assert.doesNotMatch(document4.excerpt, /politique nationale/i);
  assert.equal(document4.note, "");
  assert.match(document4.excerpt, /industrie textile|meuneries|fonderies/i);
});

test("le document 2 distingue le premier ministre du ministre des Finances", () => {
  const document2 = POLITIQUE_NATIONALE_DOCUMENTS[1];
  assert.match(document2.excerpt, /Tilley, ministre des Finances/i);
  assert.match(document2.excerpt, /tarif douanier proposé sur les produits importés/i);
  assert.match(document2.excerpt, /droit de 25 % de leur valeur/i);
  assert.match(document2.excerpt, /droit de 35 % de leur valeur/i);
  assert.match(document2.note, /premier ministre est John A\. Macdonald/i);
  assert.match(POLITIQUE_NATIONALE_SCHEMA_FIELDS.find(({ id }) => id === "adoption")!.prompt, /premier ministre/i);
});

test("le document ferroviaire utile n’est plus doublé par un autre chemin de fer", () => {
  const document5 = POLITIQUE_NATIONALE_DOCUMENTS[4];
  const document6 = POLITIQUE_NATIONALE_DOCUMENTS[5];
  assert.match(document5.title, /Canadien Pacifique/i);
  assert.equal(document5.supports, "railway");
  assert.match(document6.title, /paquebot à vapeur/i);
  assert.match(document6.image.url, /empress-of-ireland-1914\.jpg$/);
  assert.equal(document6.supports, null);
  assert.doesNotMatch(JSON.stringify(document6), /Intercolonial|chemin de fer|Silver Dart/i);
});

test("le document 7 emploie une publicité française de colonisation", () => {
  const document7 = POLITIQUE_NATIONALE_DOCUMENTS[6];
  assert.match(document7.title, /fermes gratuites/i);
  assert.match(document7.note, /Manitoba.*Assiniboia.*Alberta.*Saskatchewan/i);
  assert.match(document7.source, /Canadien Pacifique/i);
  assert.match(document7.source, /1892/);
  assert.match(document7.image.url, /fermes-gratuites-1892\.png$/);
  assert.doesNotMatch(JSON.stringify(document7), /New Eldorado|nouvel Eldorado|Free Farms for the Million|c095320|Clifford Sifton/i);
});

test("la rétroaction locale reconnaît des formulations attendues dans les sept cases", () => {
  const examples: Record<PolitiqueNationaleSchemaFieldId, string[]> = {
    object: ["La Politique nationale"],
    context: ["La crise économique de 1873", "La dépression économique des années 1870"],
    industrial: ["Une expansion industrielle", "La grande industrie textile apparaît", "Les usines se développent"],
    adoption: ["John A. Macdonald en 1879", "Le gouvernement conservateur met la politique en place en 1879"],
    tariff: ["Une hausse des droits de douane", "Des tarifs protecteurs", "Le protectionnisme"],
    railway: ["Le chemin de fer transcontinental du Canadien Pacifique", "Le CPR relie l’Est et l’Ouest"],
    settlement: ["La colonisation des terres de l’Ouest", "Des terres de 160 acres sont offertes aux colons", "Peupler l’Ouest"],
  };
  for (const [id, answers] of Object.entries(examples)) {
    for (const answer of answers) assert.equal(assessPolitiqueNationaleAnswer(id as PolitiqueNationaleSchemaFieldId, answer).status, "recognized", `${id}: ${answer}`);
  }
});

test("la rétroaction locale ne valide pas les confusions ou les réponses contradictoires", () => {
  for (const [id, answer] of [
    ["object", "Ce n’est pas la Politique nationale"],
    ["context", "La Grande Dépression de 1929"],
    ["tariff", "Le libre-échange intégral"],
    ["railway", "Le chemin de fer Intercolonial"],
    ["settlement", "Aucune colonisation de l’Ouest"],
    ["railway", ""],
  ] as const) assert.notEqual(assessPolitiqueNationaleAnswer(id, answer).status, "recognized", answer);

  for (const [id, answer] of [["adoption", "Macdonald"], ["tariff", "Les importations"], ["railway", "Un chemin de fer"], ["settlement", "Des terres dans l’Ouest"]] as const) {
    assert.equal(assessPolitiqueNationaleAnswer(id, answer).status, "partial", answer);
  }
});

test("la restauration ignore les données mal formées et n’ouvre pas un corrigé incomplet", () => {
  const restored = restorePolitiqueNationaleDraft({ answers: { object: 9, context: "Crise de 1873" }, choices: { 1: "invalid", 2: "direct" }, submitted: true });
  assert.equal(restored.answers.object, "");
  assert.equal(restored.answers.context, "Crise de 1873");
  assert.equal(restored.choices[1], undefined);
  assert.equal(restored.choices[2], "direct");
  assert.equal(restored.submitted, false);
  assert.deepEqual(restorePolitiqueNationaleDraft(null), emptyPolitiqueNationaleDraft());
});

test("la complétion exige sept réponses et dix choix binaires", () => {
  const draft = emptyPolitiqueNationaleDraft();
  assert.equal(politiqueNationaleMissingCount(draft), 17);
  for (const field of POLITIQUE_NATIONALE_SCHEMA_FIELDS) draft.answers[field.id] = "Une réponse";
  for (const document of POLITIQUE_NATIONALE_DOCUMENTS) draft.choices[document.number] = expectedPolitiqueNationaleDocumentChoice(document.number);
  assert.equal(politiqueNationaleMissingCount(draft), 0);
  draft.submitted = true;
  assert.equal(restorePolitiqueNationaleDraft(draft).submitted, true);
  draft.choices[3] = "";
  assert.equal(politiqueNationaleMissingCount(draft), 1);
});
