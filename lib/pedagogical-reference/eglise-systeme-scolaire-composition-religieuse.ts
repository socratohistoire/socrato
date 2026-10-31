import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";
import { EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT } from "./eglise-concepts-association.ts";

export const EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT = {
  schemaVersion: 1,
  id: "EGL-S-006",
  title: "Composition religieuse de la population du Québec en 1871",
  kind: "statistics",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["presence-de-l-eglise-catholique"],
  operationIds: ["causal_connections"],
  historicalDate: "1871",
  creator: "Bureau du recensement du Canada; synthèse statistique de Socrato",
  holdingInstitution: "Statistique Canada · Publications du gouvernement du Canada",
  sourceUrl: "https://www.publications.gc.ca/site/eng/9.827965/publication.html",
  sourceLocator: "Recensement du Canada, 1870-1871, vol. 1; The Year Book and Almanac of Canada for 1874, p. 115, tableau « Census of Canada by Religious Denominations »",
  assetUrl: "https://www66.statcan.gc.ca/eng/1874/187401230115_p.%20115.pdf",
  rightsStatement: "Recensement et annuaire officiels publiés au XIXe siècle et appartenant au domaine public. Le tableau de Socrato regroupe toutes les personnes non catholiques dans une même catégorie obtenue en soustrayant les catholiques romains de la population totale; cette catégorie comprend surtout plusieurs confessions protestantes, mais aussi d’autres réponses.",
  transcription: "Population totale du Québec : 1 191 516. Catholiques romains : 1 019 850, soit 85,6 %. Autres confessions ou réponses : 171 666, soit 14,4 %. Le recensement détaille dans cette seconde partie de la population plusieurs confessions protestantes, notamment anglicane, méthodiste, presbytérienne et baptiste.",
  accessibleDescription: "Tableau simplifié du recensement de 1871 indiquant que 1 019 850 personnes sur 1 191 516 au Québec sont catholiques romaines; 171 666 personnes appartiennent à d’autres confessions ou réponses, principalement à diverses confessions protestantes.",
  historicalContext: "Le premier recensement effectué après la Confédération dénombre la population selon la religion. Au Québec, la majorité est catholique romaine, tandis qu’une minorité importante se répartit surtout entre plusieurs confessions protestantes.",
  observationGuide: [
    "Comparer le nombre de catholiques romains à la population totale.",
    "Évaluer la place de la population appartenant aux autres confessions.",
    "Mettre les données en relation avec les deux secteurs scolaires du document 1.",
  ],
  interpretationCautions: [
    "La catégorie « autres confessions ou réponses » est un regroupement pédagogique calculé par Socrato; elle ne correspond pas à une ligne unique du recensement original.",
    "Cette catégorie est principalement protestante, mais elle comprend aussi de petits groupes appartenant à d’autres religions ainsi que des réponses non précisées.",
  ],
  pedagogicalUses: [
    "Mettre en relation la composition religieuse de la population et l’organisation confessionnelle du système scolaire.",
    "Faire distinguer une majorité catholique et une minorité religieuse principalement protestante sans effacer les autres appartenances.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const EGLISE_SYSTEME_SCOLAIRE_COMPOSITION_DOCUMENTS = [
  EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT,
  EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT,
] as const;

const EGLISE_SYSTEME_SCOLAIRE_COMPOSITION_SOURCES: ReferenceSource[] = [
  {
    id: `document-source:${EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT.id}`,
    kind: "government",
    title: EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT.title,
    creator: EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT.creator,
    publisher: EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT.holdingInstitution,
    publicationYear: 1869,
    url: EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT.sourceUrl,
    locator: EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT.sourceLocator,
    rightsNote: EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT.rightsStatement,
    verificationStatus: "verified",
  },
  {
    id: `document-source:${EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT.id}`,
    kind: "government",
    title: EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT.title,
    creator: EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT.creator,
    publisher: EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT.holdingInstitution,
    publicationYear: 1873,
    url: EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT.sourceUrl,
    locator: EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT.sourceLocator,
    rightsNote: EGLISE_RECENSEMENT_RELIGIONS_1871_DOCUMENT.rightsStatement,
    verificationStatus: "verified",
  },
];

export const EGLISE_SYSTEME_SCOLAIRE_COMPOSITION_QUESTION = {
  schemaVersion: 1,
  id: "question:presence-de-l-eglise-catholique:short-answer-004",
  scope: "notional",
  knowledgeHeadingId: "presence-de-l-eglise-catholique",
  relatedKnowledgeHeadingIds: ["presence-de-l-eglise-catholique"],
  referenceCardId: "reference-card:presence-de-l-eglise-catholique",
  historicalRecordId: "historical-record:presence-de-l-eglise-catholique",
  status: "ready-for-review",
  format: "short-answer",
  prompt: "Expliquez comment l’organisation du système scolaire québécois reflète la composition religieuse de la population entre 1867 et 1896.",
  instruction: "Appuyez votre explication sur un élément précis de chacun des deux documents.",
  initialGuidance: "J’attends le lien entre les deux documents…",
  expectedAnswer: "Le système scolaire québécois est organisé en deux secteurs confessionnels, l’un catholique et l’autre protestant. Cette organisation correspond à la composition religieuse de la population : le recensement de 1871 montre une forte majorité catholique romaine, soit 1 019 850 personnes sur 1 191 516, ce qui explique l’importance du secteur catholique. Une minorité principalement composée de diverses confessions protestantes demeure cependant présente. Le comité protestant et les écoles protestantes permettent donc à cette minorité de disposer de ses propres institutions scolaires. Accepter toute réponse qui relie clairement la majorité catholique et la minorité principalement protestante aux deux secteurs scolaires, sans présenter toute la population non catholique comme exclusivement protestante.",
  historicalDocumentIds: EGLISE_SYSTEME_SCOLAIRE_COMPOSITION_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Décrire les deux documents séparément sans établir de lien entre eux.",
    "Affirmer que toute la population québécoise est catholique.",
    "Présenter les catholiques et les protestants comme deux groupes de taille égale.",
    "Présenter toutes les personnes non catholiques comme protestantes sans tenir compte de la note méthodologique du tableau.",
  ],
  distractors: [],
  operationId: "causal_connections",
  sourceIds: EGLISE_SYSTEME_SCOLAIRE_COMPOSITION_SOURCES.map(({ id }) => id),
  sourceCatalog: EGLISE_SYSTEME_SCOLAIRE_COMPOSITION_SOURCES,
  rationale: "Le premier document présente la structure scolaire catholique-protestante et le second la composition religieuse de la population. L’élève doit mettre ces deux faits en relation plutôt que les énumérer.",
  review: {
    documented: true,
    historicallyVerified: true,
    pedagogicallyVerified: false,
    biasAndLanguageReviewed: true,
    approvedBy: null,
    approvedVersion: null,
    approvedAt: null,
  },
} as const satisfies ApprovedQuestion;
