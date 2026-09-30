import type { ApprovedQuestion } from "./types.ts";
import { BRITISH_NORTH_AMERICA_ACT_TERRITORIAL_MAPS } from "./british-north-america-act-maps.ts";

const maps = [BRITISH_NORTH_AMERICA_ACT_TERRITORIAL_MAPS[2], BRITISH_NORTH_AMERICA_ACT_TERRITORIAL_MAPS[1], BRITISH_NORTH_AMERICA_ACT_TERRITORIAL_MAPS[3]];
const sources = maps.map(map => ({id: `document-source:${map.id}`, kind: "government" as const, title: map.title, creator: map.creator, publisher: map.holdingInstitution, url: map.sourceUrl, locator: map.sourceLocator, rightsNote: map.rightsStatement, verificationStatus: "verified" as const}));

export const CANADA_1867_MAP_QUESTION = {
  schemaVersion: 1, id: "question:acte-de-l-amerique-du-nord-britannique:map-choice-1867",
  scope: "notional", knowledgeHeadingId: "acte-de-l-amerique-du-nord-britannique",
  relatedKnowledgeHeadingIds: ["acte-de-l-amerique-du-nord-britannique"],
  referenceCardId: "reference-card:acte-de-l-amerique-du-nord-britannique",
  historicalRecordId: "historical-record:acte-de-l-amerique-du-nord-britannique",
  status: "ready-for-review", format: "multiple-choice",
  prompt: "Quelle carte correspond au territoire du Canada en 1867?",
  instruction: "Observe les frontières et les provinces représentées sur les trois cartes. Sélectionne une carte, puis vérifie ta réponse. Cartes : Ressources naturelles Canada; adaptation pédagogique de Socrato, sous la Licence du gouvernement ouvert — Canada.",
  expectedAnswer: "La carte B représente le Canada en 1867. Le Dominion comprend alors quatre provinces : l’Ontario, le Québec, le Nouveau-Brunswick et la Nouvelle-Écosse. La carte A représente 1873, après l’entrée du Manitoba, de la Colombie-Britannique et de l’Île-du-Prince-Édouard; la carte C représente 1949, avec l’entrée de Terre-Neuve.",
  historicalDocumentIds: [],
  commonErrors: ["Confondre le territoire canadien de 1867 avec le territoire actuel.", "Inclure les territoires de l’Ouest dans le Dominion dès 1867."],
  distractors: ["Carte A : territoire en 1873.", "Carte C : territoire en 1949."],
  answerOptions: [
    {label: "A", text: "Carte A", imageUrl: maps[0].assetUrl, imageAlt: "Carte A : frontières et provinces du Canada et territoires voisins.", correct: false},
    {label: "B", text: "Carte B", imageUrl: maps[1].assetUrl, imageAlt: "Carte B : frontières et provinces du Canada et territoires voisins.", correct: true},
    {label: "C", text: "Carte C", imageUrl: maps[2].assetUrl, imageAlt: "Carte C : frontières et provinces du Canada et territoires voisins.", correct: false},
  ],
  operationId: "time_and_space", sourceIds: sources.map(source => source.id), sourceCatalog: sources,
  rationale: "Situer une configuration territoriale dans le temps en reconnaissant les quatre provinces du Canada en 1867. Les cartes existantes sont conservées intactes, sans dates dans les intitulés des choix. Correction déterministe sans IA.",
  review: {documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null},
} as const satisfies ApprovedQuestion;
