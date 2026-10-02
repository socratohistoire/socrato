import test from "node:test";
import assert from "node:assert/strict";
import { assessIndustrialisationAnswer, type SchemaFieldId } from "../lib/industrialisation-partie-b.ts";

test("recognizes ordinary student phrasing observed in the live Partie B audit", () => {
  for (const id of ["central1", "detail2"] as const) {
    for (const answer of ["On utilise des machines pour produire en usine.", "Les ouvriers utilisent des machines.", "On produit avec des machines.", "Les machines remplacent le travail manuel."]) {
      assert.equal(assessIndustrialisationAnswer(id, answer).status, "recognized", answer);
    }
    assert.notEqual(assessIndustrialisationAnswer(id, "On n’utilise pas de machines.").status, "recognized");
  }
  for (const answer of ["Ils travaillent douze heures par jour.", "Les ouvriers travaillent 12 heures chaque jour.", "Ils travaillent jusqu’à quatorze heures par jour."]) {
    assert.equal(assessIndustrialisationAnswer("detail3", answer).status, "recognized", answer);
  }
  for (const answer of ["Ils ne travaillent pas douze heures par jour.", "Ils travaillent douze heures par semaine.", "Ils travaillent deux heures par jour.", "Ils ont douze ans."]) {
    assert.notEqual(assessIndustrialisationAnswer("detail3", answer).status, "recognized", answer);
  }
});

test("local feedback recognizes variants in each of the seven boxes", () => {
  const examples: Record<SchemaFieldId, string[]> = {
    object: ["Première phase d’industrialisation", "La révolution industrielle", "INDUSTRIALISATION"],
    central1: ["Mécanisation de la production", "Utilisation des machines", "Production en série", "Passage de l’artisanat à la production industrielle"],
    detail1: ["Dans les villes", "En milieu urbain", "Les centres urbains comme Montréal"],
    detail2: ["Métiers à tisser", "Machines à filer", "L’énergie de la vapeur", "Division des tâches"],
    central2: ["La classe ouvrière", "Les ouvriers", "Le prolétariat", "Les travailleurs salariés"],
    detail3: ["Travail des enfants", "De longues journées", "Des salaires faibles", "Ils sont mal payés", "Punitions corporelles", "Des journées de douze heures"],
    detail4: ["Réduction des heures de travail", "Travailler moins", "Une journée de 9 heures", "Des journées plus courtes"]
  };
  for (const [id, answers] of Object.entries(examples)) for (const answer of answers) assert.equal(assessIndustrialisationAnswer(id as SchemaFieldId, answer).status, "recognized", `${id}: ${answer}`);
});
test("local feedback does not equate unknown, vague or contradictory answers with correct answers", () => {
  for (const [id, answer] of [["object", "Ce n’est pas l’industrialisation"], ["object", "La seconde industrialisation"], ["detail1", "Les villes ou les campagnes"], ["central2", "Les patrons et les ouvriers"], ["detail4", "Ils refusent de travailler moins"], ["detail1", ""], ["detail2", "Une formulation imprévue"]] as const) {
    assert.notEqual(assessIndustrialisationAnswer(id, answer).status, "recognized", answer);
  }
  for (const [id, answer] of [["detail1", "Montréal"], ["detail3", "Conditions difficiles"], ["detail2", "Machines"], ["detail4", "Faire la grève"]] as const) assert.equal(assessIndustrialisationAnswer(id, answer).status, "partial", answer);
});
import { INDUSTRIALISATION_DOCUMENTS, SCHEMA_FIELDS, emptyIndustrialisationDraft, expectedDocumentChoice, industrialisationMissingCount, restoreIndustrialisationDraft } from "../lib/industrialisation-partie-b.ts";

test("Partie B has seven response boxes and ten sourced documents without Alloprof", () => {
  assert.equal(SCHEMA_FIELDS.length, 7);
  assert.deepEqual(INDUSTRIALISATION_DOCUMENTS.map(doc => doc.number), [1,2,3,4,5,6,7,8,9,10]);
  for (const doc of INDUSTRIALISATION_DOCUMENTS) {
    assert.ok(doc.links.length);
    assert.ok(doc.links.every(link => new URL(link.url).protocol === "https:"));
  }
  assert.doesNotMatch(JSON.stringify(INDUSTRIALISATION_DOCUMENTS), /alloprof|nouvelle-france/i);
  assert.deepEqual(INDUSTRIALISATION_DOCUMENTS.filter(doc => expectedDocumentChoice(doc.number) === "exclude").map(doc => doc.number), [3,7,10]);
});

test("restoration ignores malformed saved data and cannot unlock an unfinished correction", () => {
  const restored = restoreIndustrialisationDraft({ answers: { object: 9, central1: "Machines" }, choices: {1:"invalid",4:"direct"}, submitted:true });
  assert.equal(restored.answers.object, "");
  assert.equal(restored.answers.central1, "Machines");
  assert.equal(restored.choices[1], undefined);
  assert.equal(restored.choices[4], "direct");
  assert.equal(restored.submitted,false);
  assert.deepEqual(restoreIndustrialisationDraft(null),emptyIndustrialisationDraft());
});

test("completion requires seven answers and ten binary classifications", () => {
  const draft = emptyIndustrialisationDraft();
  assert.equal(industrialisationMissingCount(draft),17);
  for (const field of SCHEMA_FIELDS) draft.answers[field.id]="Une réponse";
  for (const doc of INDUSTRIALISATION_DOCUMENTS) draft.choices[doc.number]=expectedDocumentChoice(doc.number);
  assert.equal(industrialisationMissingCount(draft),0);
  draft.submitted=true;
  assert.equal(restoreIndustrialisationDraft(draft).submitted,true);
  draft.choices[3]="";
  assert.equal(industrialisationMissingCount(draft),1);
});

test("previous context choices become useful without requiring a justification", () => {
  const restored = restoreIndustrialisationDraft({choices:{6:"context"},reasons:{6:"Ancienne justification"}});
  assert.equal(restored.choices[6],"direct");
  assert.equal(expectedDocumentChoice(6),"direct");
  assert.equal("reasons" in restored,false);
});
