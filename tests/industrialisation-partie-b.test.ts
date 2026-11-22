import test from "node:test";
import assert from "node:assert/strict";
import { assessIndustrialisationAnswer, type SchemaFieldId } from "../lib/industrialisation-partie-b.ts";

test("recognizes ordinary student phrasing observed in the live Partie B audit", () => {
  for (const answer of ["Le canal de Lachine", "Le canal Lachine", "Le canal de Lachine favorise les manufactures."]) {
    assert.equal(assessIndustrialisationAnswer("detail4", answer).status, "recognized", answer);
  }
  assert.notEqual(assessIndustrialisationAnswer("detail4", "Les machines").status, "recognized");
  for (const answer of ["Ils travaillent douze heures par jour.", "Les ouvriers travaillent 12 heures chaque jour.", "Ils travaillent jusqu’à quatorze heures par jour."]) {
    assert.equal(assessIndustrialisationAnswer("detail1", answer).status, "recognized", answer);
  }
  for (const answer of ["Ils ne travaillent pas douze heures par jour.", "Ils travaillent douze heures par semaine.", "Ils travaillent deux heures par jour.", "Ils ont douze ans."]) {
    assert.notEqual(assessIndustrialisationAnswer("detail1", answer).status, "recognized", answer);
  }
});

test("local feedback recognizes variants in each of the seven boxes", () => {
  const examples: Record<SchemaFieldId, string[]> = {
    object: ["Première phase d’industrialisation", "La révolution industrielle", "INDUSTRIALISATION"],
    central1: ["Le syndicalisme", "Le mouvement ouvrier", "Le développement des syndicats", "L’essor des organisations ouvrières"],
    detail1: ["Travail des enfants", "De longues journées", "Des salaires faibles", "Ils sont mal payés", "Punitions corporelles", "Des journées de douze heures"],
    detail2: ["Faire la grève", "Une grève", "Les grèves", "Ils font une grève"],
    central2: ["Concentration de la production dans les manufactures", "La production se fait dans les usines", "Passage des ateliers artisanaux aux manufactures", "Développement des usines"],
    detail3: ["Dans les villes", "En milieu urbain", "Les centres urbains comme Montréal"],
    detail4: ["Le canal de Lachine", "Canal Lachine", "Le canal de Lachine favorise l’industrie", "Le canal de Lachine à Montréal"]
  };
  for (const [id, answers] of Object.entries(examples)) for (const answer of answers) assert.equal(assessIndustrialisationAnswer(id as SchemaFieldId, answer).status, "recognized", `${id}: ${answer}`);
});
test("local feedback does not equate unknown, vague or contradictory answers with correct answers", () => {
  for (const [id, answer] of [["object", "Ce n’est pas l’industrialisation"], ["object", "La seconde industrialisation"], ["detail1", "Les villes ou les campagnes"], ["central2", "Les patrons et les ouvriers"], ["central2", "La mécanisation"], ["detail4", "Ils refusent de travailler moins"], ["detail1", ""], ["detail2", "Une formulation imprévue"]] as const) {
    assert.notEqual(assessIndustrialisationAnswer(id, answer).status, "recognized", answer);
  }
  for (const [id, answer] of [["detail3", "Montréal"], ["detail1", "Conditions difficiles"], ["detail4", "Un canal"], ["detail2", "Les ouvriers protestent"]] as const) assert.equal(assessIndustrialisationAnswer(id, answer).status, "partial", answer);
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
  assert.match(INDUSTRIALISATION_DOCUMENTS[3].excerpt ?? "", /Ferdinand Brissette|douze ans|amende de 1,75 \$/);
  assert.doesNotMatch(INDUSTRIALISATION_DOCUMENTS[4].excerpt ?? "", /Relié aux autres canaux du fleuve/);
  assert.doesNotMatch(INDUSTRIALISATION_DOCUMENTS[7].excerpt ?? "", /Le Parlement adopte une loi qui autorise la formation de syndicats/);
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
