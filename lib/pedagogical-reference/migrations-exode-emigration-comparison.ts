import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const MIGRATIONS_RURAL_FAMILIES_MONTREAL_DOCUMENT = {
  schemaVersion: 1,
  id: "MIG-T-008",
  title: "Des familles rurales s’installent à Montréal",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["migrations"],
  operationIds: ["differences_and_similarities", "time_and_space"],
  historicalDate: "1845-1875 (études publiées en 1988 et 1992)",
  creator: "France Gagnon",
  holdingInstitution: "Société historique du Canada · Érudit",
  sourceUrl: "https://www.erudit.org/fr/revues/hp/1988-v23-n1-hp1123/030982ar/",
  sourceLocator: "Synthèse de France Gagnon, « Parenté et migration : le cas des Canadiens français à Montréal entre 1845 et 1875 », Communications historiques, vol. 23, no 1, 1988, p. 63-85, et « Les migrations internes vers Montréal au XIXe siècle : un bilan », Cahiers québécois de démographie, vol. 21, no 2, 1992, p. 31-49",
  assetUrl: "https://www.erudit.org/fr/revues/cqd/1992-v21-n2-cqd573/010120ar.pdf",
  rightsStatement: "Articles publiés par la Société historique du Canada et l’Association des démographes du Québec, puis diffusés sur Érudit; passage synthétisé et reformulé en quatre phrases par Socrato à des fins pédagogiques.",
  transcription: "Dans les campagnes, certains fils non héritiers ne peuvent pas s’établir sur la terre familiale et doivent chercher ailleurs un moyen de gagner leur vie. Entre 1845 et 1875, la croissance économique et l’industrialisation de Montréal y créent des emplois salariés. Des Canadiens français quittent alors les campagnes, souvent en famille, pour s’installer dans ce milieu urbain et industriel. Les réseaux de parenté déjà présents à Montréal facilitent ensuite leur arrivée et leur adaptation.",
  accessibleDescription: "Synthèse de quatre phrases expliquant que la difficulté de s’établir sur une terre et l’attrait des emplois salariés de Montréal contribuent au départ de familles canadiennes-françaises des campagnes entre 1845 et 1875.",
  historicalContext: "Les études de France Gagnon reconstituent les migrations internes vers Montréal au XIXe siècle. Elles mettent ce mouvement en relation avec les stratégies d’établissement des familles rurales, la croissance économique montréalaise, l’industrialisation et les réseaux de parenté.",
  observationGuide: [
    "Identifier le lieu de départ et le lieu d’arrivée des migrants.",
    "Repérer la difficulté rencontrée par certains fils de familles rurales.",
    "Relever ce que Montréal offre aux migrants.",
  ],
  interpretationCautions: [
    "Il s’agit de la synthèse d’une étude historique publiée en 1988, et non d’un témoignage rédigé par un migrant du XIXe siècle.",
    "Le document présente deux facteurs importants, mais il ne signifie pas que toutes les familles rurales quittent la campagne pour les mêmes raisons.",
  ],
  pedagogicalUses: [
    "Caractériser l’exode rural comme une migration interne vers Montréal.",
    "Comparer les personnes déplacées et le milieu d’arrivée à ceux de l’émigration vers la Nouvelle-Angleterre.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const MIGRATIONS_NEW_ENGLAND_MILLS_BEAUGRAND_DOCUMENT = {
  schemaVersion: 1,
  id: "MIG-T-009",
  title: "Des familles canadiennes-françaises dans les filatures de la Nouvelle-Angleterre",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["migrations"],
  operationIds: ["differences_and_similarities", "time_and_space"],
  historicalDate: "1878",
  creator: "Honoré Beaugrand",
  holdingInstitution: "Project Gutenberg · transcription de l’édition de 1878",
  sourceUrl: "https://www.gutenberg.org/files/14536/14536-h/14536-h.htm",
  sourceLocator: "Honoré Beaugrand, Jeanne la Fileuse, deuxième partie, chapitre I, « L’émigration canadienne aux États-Unis », Fall River, 1878",
  assetUrl: "https://www.gutenberg.org/ebooks/14536",
  rightsStatement: "Ouvrage publié en 1878 et appartenant au domaine public; extrait resserré en quatre phrases et ponctuation modernisée par Socrato.",
  transcription: "On se plaignait du faible rendement des dernières récoltes ainsi que de la stagnation des affaires et du commerce. Les fermes hypothéquées montraient que la crise durait depuis longtemps, et des familles risquaient la misère faute de travail au Canada. Pendant ce temps, les filatures de la Nouvelle-Angleterre offraient du travail et des salaires réguliers à plusieurs membres d’une même famille. Des Canadiens français quittaient donc leur campagne pour les États-Unis, où ils espéraient gagner leur vie plus facilement.",
  accessibleDescription: "Extrait de quatre phrases dans lequel Honoré Beaugrand relie l’émigration vers la Nouvelle-Angleterre aux mauvaises récoltes, à l’endettement des fermes, au manque de travail et à l’attrait des salaires industriels.",
  historicalContext: "Installé à Fall River, au Massachusetts, Honoré Beaugrand publie en 1878 un ouvrage consacré à l’émigration canadienne-française aux États-Unis. Son texte oppose la crise économique vécue dans les campagnes canadiennes à la possibilité de trouver du travail rémunéré dans les filatures de la Nouvelle-Angleterre.",
  observationGuide: [
    "Relever les difficultés économiques vécues dans les campagnes canadiennes.",
    "Repérer le travail et le revenu espérés au lieu d’arrivée.",
    "Identifier le territoire où se rendent les familles.",
  ],
  interpretationCautions: [
    "Jeanne la Fileuse mêle récit littéraire, observation sociale et argumentation politique; l’extrait exprime le point de vue de Beaugrand sur l’émigration.",
    "Les quatre phrases ont été rapprochées à partir d’un passage plus long, sans changer le sens du propos.",
  ],
  pedagogicalUses: [
    "Caractériser l’émigration canadienne-française vers les centres industriels de la Nouvelle-Angleterre.",
    "Comparer une migration internationale à l’exode rural vers Montréal.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const MIGRATIONS_EXODE_EMIGRATION_COMPARISON_DOCUMENTS = [
  MIGRATIONS_RURAL_FAMILIES_MONTREAL_DOCUMENT,
  MIGRATIONS_NEW_ENGLAND_MILLS_BEAUGRAND_DOCUMENT,
] as const;

const MIGRATIONS_EXODE_EMIGRATION_COMPARISON_SOURCES: ReferenceSource[] =
  MIGRATIONS_EXODE_EMIGRATION_COMPARISON_DOCUMENTS.map((document) => ({
    id: `document-source:${document.id}`,
    kind: document.id === MIGRATIONS_RURAL_FAMILIES_MONTREAL_DOCUMENT.id ? "academic" : "other",
    title: document.title,
    creator: document.creator,
    publisher: document.holdingInstitution,
    publicationYear: document.id === MIGRATIONS_RURAL_FAMILIES_MONTREAL_DOCUMENT.id ? 1988 : 1878,
    url: document.sourceUrl,
    locator: document.sourceLocator,
    rightsNote: document.rightsStatement,
    verificationStatus: "verified",
  }));

export const MIGRATIONS_EXODE_EMIGRATION_COMPARISON_QUESTION = {
  schemaVersion: 1,
  id: "question:migrations:short-answer-005",
  scope: "notional",
  knowledgeHeadingId: "migrations",
  relatedKnowledgeHeadingIds: ["migrations"],
  referenceCardId: "reference-card:migrations",
  historicalRecordId: "historical-record:migrations",
  status: "ready-for-review",
  format: "short-answer",
  prompt: "Comparez l’exode rural vers Montréal, entre 1845 et 1875, et l’émigration vers la Nouvelle-Angleterre, des années 1850 aux années 1890, en indiquant une similitude et une différence.",
  instruction: "Appuyez chaque élément de comparaison sur un indice tiré des documents.",
  initialGuidance: "J’attends votre comparaison…",
  expectedAnswer: "Une similitude est que, dans les deux mouvements, des Canadiens français quittent les campagnes parce qu’il leur est difficile d’y gagner leur vie ou de s’établir sur une terre et parce que des emplois salariés les attirent dans des milieux industriels. Une différence est l’espace parcouru : l’exode rural vers Montréal est une migration interne, puisque les personnes demeurent au Québec et au Canada, tandis que l’émigration vers la Nouvelle-Angleterre est une migration internationale qui franchit la frontière vers les États-Unis. Les documents permettent aussi de préciser que le départ vers la Nouvelle-Angleterre est directement associé aux mauvaises récoltes, aux fermes hypothéquées, au manque de travail et à l’espoir de salaires réguliers.",
  historicalDocumentIds: MIGRATIONS_EXODE_EMIGRATION_COMPARISON_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Décrire séparément les deux mouvements sans formuler un point commun et un point de différence.",
    "Présenter l’exode rural vers Montréal comme une émigration hors du Canada.",
    "Nommer une similitude ou une différence sans l’appuyer sur un indice des documents.",
    "Confondre la Nouvelle-Angleterre avec une région du Québec ou du Canada.",
  ],
  distractors: [],
  operationId: "differences_and_similarities",
  sourceIds: MIGRATIONS_EXODE_EMIGRATION_COMPARISON_SOURCES.map(({ id }) => id),
  sourceCatalog: MIGRATIONS_EXODE_EMIGRATION_COMPARISON_SOURCES,
  rationale: "Les deux documents présentent des familles canadiennes-françaises issues des campagnes qui gagnent des milieux urbains et industriels. Leur structure parallèle permet d’établir une similitude solide, tandis que les destinations obligent à distinguer une migration interne vers Montréal d’une émigration internationale vers les États-Unis.",
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
