import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";
import { EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT } from "./eglise-identite-canadienne-francaise.ts";

export const EGLISE_BOURGET_EDUCATION_1841_DOCUMENT = {
  schemaVersion: 1,
  id: "EGL-T-007",
  title: "Circulaire de Mgr Bourget sur l’éducation — 1841",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["presence-de-l-eglise-catholique"],
  operationIds: ["changes_and_continuities"],
  historicalDate: "23 septembre 1841",
  creator: "Ignace Bourget, évêque de Montréal",
  holdingInstitution: "Internet Archive · exemplaire historique diffusé sur Wikimedia Commons",
  sourceUrl: "https://www.canadiana.ca/view/oocihm.02899/100",
  sourceLocator: "Fioretti vescovili ou Extraits des mandements, lettres pastorales et circulaires de Monseigneur Ignace Bourget, Montréal, Le Franc-Parleur, 1872, p. 7-8, rubrique XIV « Éducation », circulaire du 23 septembre 1841",
  assetUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Fioretti_vescovili_ou_%28IA_fiorettivescovil00bour%29.pdf",
  rightsStatement: "Circulaire de 1841 reproduite dans un ouvrage publié en 1872 et appartenant au domaine public. L’extrait conserve le vocabulaire de Bourget; les crochets signalent les coupures et une graphie fautive évidente a été corrigée.",
  transcription: "Nos ressources pour encourager l’éducation et la retenir par là même entre nos mains […] sont immenses. Si nous pouvons former de bons maîtres et de bonnes maîtresses pour toutes les paroisses de la campagne, nous conserverons sur l’éducation du peuple l’influence que nous devons avoir par notre état. Nous paralyserons, sans bruit et sans coup férir, tous les efforts que l’on paraît disposé à faire pour nous dépouiller d’un droit si légitime. J’espère que le diocèse se ressentira, dans peu d’années, des dispositions que j’ai prises à cet égard […].",
  accessibleDescription: "Extrait de quatre phrases dans lequel Mgr Bourget affirme en 1841 que le clergé doit conserver son influence sur l’éducation du peuple et former des maîtres pour les paroisses rurales.",
  historicalContext: "Peu après son accession à l’épiscopat de Montréal, Ignace Bourget défend l’influence du clergé sur l’éducation et cherche à renforcer l’organisation catholique dans ce domaine. La circulaire exprime un projet et une revendication d’autorité, et non encore un règlement scolaire provincial.",
  observationGuide: [
    "Repérer le domaine dans lequel Bourget veut conserver l’influence du clergé.",
    "Identifier les personnes qu’il souhaite former dans les paroisses rurales.",
    "Distinguer une intention de l’évêque d’une règle scolaire déjà en vigueur.",
  ],
  interpretationCautions: [
    "Le passage exprime le point de vue et les objectifs de Mgr Bourget; il ne prouve pas à lui seul que toutes ses intentions sont immédiatement réalisées.",
    "Les crochets indiquent deux coupures effectuées par Socrato; ils ne remplacent aucun élément nécessaire à la compréhension du propos.",
  ],
  pedagogicalUses: [
    "Repérer l’influence revendiquée par le clergé en éducation au début de la période.",
    "Comparer une revendication épiscopale de 1841 à l’autorité institutionnelle du comité catholique à la fin des années 1880.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const EGLISE_PRESENCE_CHANGEMENT_CONTINUITE_DOCUMENTS = [
  EGLISE_BOURGET_EDUCATION_1841_DOCUMENT,
  EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT,
] as const;

const EGLISE_PRESENCE_CHANGEMENT_CONTINUITE_SOURCES: ReferenceSource[] = [
  {
    id: `document-source:${EGLISE_BOURGET_EDUCATION_1841_DOCUMENT.id}`,
    kind: "reference-work",
    title: EGLISE_BOURGET_EDUCATION_1841_DOCUMENT.title,
    creator: EGLISE_BOURGET_EDUCATION_1841_DOCUMENT.creator,
    publisher: EGLISE_BOURGET_EDUCATION_1841_DOCUMENT.holdingInstitution,
    publicationYear: 1872,
    url: EGLISE_BOURGET_EDUCATION_1841_DOCUMENT.sourceUrl,
    locator: EGLISE_BOURGET_EDUCATION_1841_DOCUMENT.sourceLocator,
    rightsNote: EGLISE_BOURGET_EDUCATION_1841_DOCUMENT.rightsStatement,
    verificationStatus: "verified",
  },
  {
    id: `document-source:${EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT.id}`,
    kind: "government",
    title: EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT.title,
    creator: EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT.creator,
    publisher: EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT.holdingInstitution,
    publicationYear: 1888,
    url: EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT.sourceUrl,
    locator: EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT.sourceLocator,
    rightsNote: EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT.rightsStatement,
    verificationStatus: "verified",
  },
];

export const EGLISE_PRESENCE_CHANGEMENT_CONTINUITE_QUESTION = {
  schemaVersion: 1,
  id: "question:presence-de-l-eglise-catholique:short-answer-005",
  scope: "notional",
  knowledgeHeadingId: "presence-de-l-eglise-catholique",
  relatedKnowledgeHeadingIds: ["presence-de-l-eglise-catholique"],
  referenceCardId: "reference-card:presence-de-l-eglise-catholique",
  historicalRecordId: "historical-record:presence-de-l-eglise-catholique",
  status: "ready-for-review",
  format: "short-answer",
  prompt: "Décrivez un changement ou une continuité dans la présence de l’Église catholique au Québec entre 1840 et 1896.",
  instruction: "Comparez les deux documents. Choisissez un changement ou une continuité et appuyez votre réponse sur un élément précis de chaque époque.",
  initialGuidance: "J’attends un changement ou une continuité…",
  expectedAnswer: "Accepter l’une des deux réponses suivantes. Changement : en 1841, Mgr Bourget revendique et cherche encore à consolider l’influence du clergé sur l’éducation en formant des maîtres pour les paroisses. Vers 1888, cette présence est davantage institutionnalisée : un comité catholique adopte des règlements qui donnent le premier rang à la religion, imposent le catéchisme et reconnaissent un rôle au curé dans la conduite morale des élèves. Continuité : au début comme à la fin de la période, l’Église catholique demeure présente dans le domaine de l’éducation et cherche à encadrer la formation religieuse et morale de la population. Une seule relation temporelle correctement décrite et appuyée sur les deux documents suffit.",
  historicalDocumentIds: EGLISE_PRESENCE_CHANGEMENT_CONTINUITE_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Nommer un changement ou une continuité sans comparer les deux époques.",
    "Présenter seulement le document de 1841 ou seulement celui de la fin des années 1880.",
    "Affirmer que l’Église est absente de l’éducation en 1841.",
    "Affirmer que la circulaire de Bourget constitue déjà un règlement provincial appliqué à toutes les écoles.",
  ],
  distractors: [],
  operationId: "changes_and_continuities",
  sourceIds: EGLISE_PRESENCE_CHANGEMENT_CONTINUITE_SOURCES.map(({ id }) => id),
  sourceCatalog: EGLISE_PRESENCE_CHANGEMENT_CONTINUITE_SOURCES,
  rationale: "Deux textes produits à près d’un demi-siècle d’intervalle permettent de comparer le même domaine, l’éducation. L’élève choisit d’expliquer soit la continuité de l’influence catholique, soit le changement vers une autorité scolaire confessionnelle plus formalisée.",
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
