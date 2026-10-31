import { MIGRATIONS_EMIGRATION_CAUSES_REPORT_DOCUMENT } from "./migrations-spatial-causality.ts";
import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const MIGRATIONS_NEW_ENGLAND_COMMUNITIES_CONSEQUENCE_DOCUMENT = {
  schemaVersion: 1,
  id: "MIG-T-005",
  title: "Des communautés canadiennes-françaises en Nouvelle-Angleterre",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["migrations"],
  operationIds: ["causes_and_consequences"],
  historicalDate: "1894",
  creator: "Charles Gailly de Taurines",
  holdingInstitution: "Project Gutenberg · exemplaire numérisé par la Bibliothèque nationale de France",
  sourceUrl: "https://www.gutenberg.org/files/35476/35476-h/35476-h.htm",
  sourceLocator: "La Nation canadienne, chapitre XX, « Aux États-Unis. Les Canadiens de l’Ouest », Paris, E. Plon, Nourrit et Cie, 1894, passages sur les Canadiens de la Nouvelle-Angleterre",
  assetUrl: "https://www.gutenberg.org/files/35476/35476-h/35476-h.htm",
  rightsStatement: "Ouvrage publié en 1894 et appartenant au domaine public; extrait formé de phrases rapprochées dans la source, avec ponctuation et formulation légèrement modernisées par Socrato sans en modifier le sens.",
  transcription: "Dans les Chambres législatives des États de la Nouvelle-Angleterre, les Canadiens comptent déjà des représentants. Les Canadiens des États-Unis possèdent une presse active, représentée par une vingtaine de journaux publiés en français. Ils ont leur clergé et se groupent en sociétés nationales très vivaces. Ils possèdent ainsi plusieurs institutions qui leur permettent de conserver leur identité au sein des États-Unis.",
  accessibleDescription: "Extrait d’un ouvrage de 1894 décrivant la présence de représentants, de journaux francophones, de membres du clergé et de sociétés canadiennes-françaises en Nouvelle-Angleterre.",
  historicalContext: "À la fin du XIXe siècle, l’émigration vers les États-Unis a entraîné la formation de communautés canadiennes-françaises organisées en Nouvelle-Angleterre. Le texte décrit certaines institutions développées par ces communautés.",
  observationGuide: [
    "Repérer le lieu où vivent les Canadiens français décrits dans le texte.",
    "Identifier les institutions qu’ils ont mises en place.",
    "Déterminer si le document présente une cause du départ ou une conséquence de l’émigration.",
  ],
  interpretationCautions: [
    "L’auteur est un voyageur et essayiste français, et non une personne ayant elle-même émigré du Québec vers la Nouvelle-Angleterre.",
    "Les affirmations et les nombres reflètent le point de vue de l’auteur; l’extrait écarte aussi certains termes aujourd’hui désuets employés dans l’ouvrage.",
  ],
  pedagogicalUses: [
    "Distinguer une conséquence de l’émigration d’un facteur qui provoque le départ.",
    "Observer la formation d’institutions canadiennes-françaises en Nouvelle-Angleterre.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

const MIGRATIONS_DEPARTURE_FACTORS_SOURCES: ReferenceSource[] = [
  MIGRATIONS_EMIGRATION_CAUSES_REPORT_DOCUMENT,
  MIGRATIONS_NEW_ENGLAND_COMMUNITIES_CONSEQUENCE_DOCUMENT,
].map((document) => ({
  id: `document-source:${document.id}`,
  kind: document.id === MIGRATIONS_EMIGRATION_CAUSES_REPORT_DOCUMENT.id ? "government" : "reference-work",
  title: document.title,
  creator: document.creator,
  publisher: document.holdingInstitution,
  publicationYear: document.id === MIGRATIONS_EMIGRATION_CAUSES_REPORT_DOCUMENT.id ? 1849 : 1894,
  url: document.sourceUrl,
  locator: document.sourceLocator,
  rightsNote: document.rightsStatement,
  verificationStatus: "verified",
}));

export const MIGRATIONS_DEPARTURE_FACTORS_QUESTION = {
  schemaVersion: 1,
  id: "question:migrations:short-answer-002",
  scope: "notional",
  knowledgeHeadingId: "migrations",
  relatedKnowledgeHeadingIds: ["migrations"],
  referenceCardId: "reference-card:migrations",
  historicalRecordId: "historical-record:migrations",
  status: "ready-for-review",
  format: "short-answer",
  prompt: "Entre 1840 et 1896, expliquez deux facteurs qui contribuent au départ de familles des milieux ruraux du Québec vers les États-Unis.",
  instruction: "Appuyez les deux facteurs sur le document pertinent.",
  initialGuidance: "J’attends ta réponse…",
  expectedAnswer: "Plusieurs réponses sont possibles : l’endettement force certaines familles à vendre leurs terres et leurs biens; les mauvaises récoltes et les difficultés de l’agriculture réduisent leurs ressources; l’éloignement des marchés et le manque de voies de communication empêchent les cultivateurs de vendre avantageusement leurs produits. L’élève doit expliquer deux de ces facteurs.",
  historicalDocumentIds: [
    MIGRATIONS_EMIGRATION_CAUSES_REPORT_DOCUMENT.id,
    MIGRATIONS_NEW_ENGLAND_COMMUNITIES_CONSEQUENCE_DOCUMENT.id,
  ],
  commonErrors: [
    "Nommer deux facteurs sans expliquer comment ils contribuent au départ des familles.",
    "Présenter l’emploi industriel aux États-Unis comme une information explicitement fournie par le document 1.",
    "Confondre l’émigration vers les États-Unis avec l’exode rural vers une ville québécoise.",
    "Utiliser le document 2 comme une cause alors qu’il présente une conséquence de l’émigration.",
    "Donner deux formulations du même facteur plutôt que deux facteurs distincts.",
  ],
  distractors: [MIGRATIONS_NEW_ENGLAND_COMMUNITIES_CONSEQUENCE_DOCUMENT.id],
  operationId: "causes_and_consequences",
  sourceIds: MIGRATIONS_DEPARTURE_FACTORS_SOURCES.map(({ id }) => id),
  sourceCatalog: MIGRATIONS_DEPARTURE_FACTORS_SOURCES,
  rationale: "Le rapport parlementaire de 1849 présente plusieurs facteurs qui poussent des familles rurales à émigrer vers les États-Unis. Le second extrait décrit plutôt les communautés qu’elles ont formées en Nouvelle-Angleterre. La tâche exige de sélectionner et d’expliquer deux causes tout en discriminant une conséquence.",
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
