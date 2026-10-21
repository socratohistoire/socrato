import type { HistoricalDocumentRecord } from "./historical-document.ts";
import { POLITIQUE_NATIONALE_CPR_MARKET_SPEECH_DOCUMENT } from "./politique-nationale-cpr-market.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const POLITIQUE_NATIONALE_CPR_TERRITORIAL_FUNCTION_DOCUMENT = {
  schemaVersion: 1,
  id: "PN-T-008",
  title: "Macdonald présente le chemin de fer comme un lien territorial",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["politique-nationale"],
  operationIds: ["differences_and_similarities", "relationships_between_facts"],
  historicalDate: "1er mai 1878",
  creator: "John A. Macdonald, chef de l’opposition à la Chambre des communes",
  holdingInstitution: "Correspondance de Sir John Macdonald · transcription PrimaryDocuments.ca",
  sourceUrl: "https://primarydocuments.ca/sir-joseph-pope-ed-correspondence-of-sir-john-macdonald-1921/",
  sourceLocator: "Lettre de John A. Macdonald à Sir Stafford Northcote, Ottawa, 1er mai 1878, dans Correspondence of Sir John Macdonald, p. 240-241",
  assetUrl: "https://primarydocuments.ca/sir-joseph-pope-ed-correspondence-of-sir-john-macdonald-1921/",
  rightsStatement: "Lettre de 1878 et édition de 1921 dans le domaine public; traduction française et resserrement en trois phrases préparés par Socrato.",
  transcription: "Jusqu’à ce que ce grand ouvrage soit achevé, notre Dominion n’est guère plus qu’une « expression géographique ». Nous portons autant d’intérêt à la Colombie-Britannique qu’à l’Australie, et pas davantage. Une fois le chemin de fer terminé, nous deviendrons un seul grand pays uni […] partageant un intérêt commun.",
  accessibleDescription: "Extrait traduit d’une lettre dans laquelle John A. Macdonald affirme que le chemin de fer doit relier la Colombie-Britannique aux autres régions et unifier le territoire canadien.",
  historicalContext: "En 1878, le chemin de fer transcontinental promis à la Colombie-Britannique n’est pas encore achevé. Macdonald soutient que cette liaison est indispensable pour transformer des régions éloignées les unes des autres en un territoire canadien réellement uni.",
  observationGuide: [
    "Repérer l’expression employée pour décrire un Canada encore mal relié.",
    "Identifier la province que Macdonald juge éloignée du reste du Dominion.",
    "Expliquer la transformation territoriale attendue après l’achèvement du chemin de fer.",
  ],
  interpretationCautions: [
    "L’extrait est traduit et resserré; les points de suspension entre crochets signalent le retrait d’une référence au commerce interprovincial afin de centrer le document sur la fonction territoriale.",
    "Macdonald défend le projet ferroviaire et en présente les avantages attendus; sa lettre exprime donc un point de vue politique favorable au chemin de fer.",
    "L’unification territoriale décrite s’inscrit dans l’expansion coloniale canadienne sur des territoires déjà habités par des Premières Nations et des Métis.",
  ],
  pedagogicalUses: [
    "Expliquer la fonction territoriale du Canadien Pacifique.",
    "Comparer l’unification du territoire aux échanges économiques rendus possibles par le chemin de fer.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const POLITIQUE_NATIONALE_CPR_FUNCTIONS_DOCUMENTS = [
  POLITIQUE_NATIONALE_CPR_MARKET_SPEECH_DOCUMENT,
  POLITIQUE_NATIONALE_CPR_TERRITORIAL_FUNCTION_DOCUMENT,
] as const;

const POLITIQUE_NATIONALE_CPR_FUNCTIONS_SOURCES: ReferenceSource[] =
  POLITIQUE_NATIONALE_CPR_FUNCTIONS_DOCUMENTS.map((document) => ({
    id: `document-source:${document.id}`,
    kind: "museum-or-archive" as const,
    title: document.title,
    creator: document.creator,
    publisher: document.holdingInstitution,
    publicationYear: document.id === POLITIQUE_NATIONALE_CPR_MARKET_SPEECH_DOCUMENT.id ? 1886 : 1921,
    url: document.sourceUrl,
    locator: document.sourceLocator,
    rightsNote: document.rightsStatement,
    verificationStatus: "verified" as const,
  }));

export const POLITIQUE_NATIONALE_CPR_FUNCTIONS_COMPARISON_QUESTION = {
  schemaVersion: 1,
  id: "question:politique-nationale:document-interpretation-007",
  scope: "notional",
  knowledgeHeadingId: "politique-nationale",
  relatedKnowledgeHeadingIds: ["politique-nationale"],
  referenceCardId: "reference-card:politique-nationale",
  historicalRecordId: "historical-record:politique-nationale",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Entre 1878 et 1886, compare la fonction économique et la fonction territoriale du Canadien Pacifique.",
  instruction: "À l’aide des deux documents, explique ce que le Canadien Pacifique accomplit sur le plan économique et sur le plan territorial. Indique ensuite une différence entre ces deux fonctions.",
  initialGuidance: "J’attends ta réponse…",
  expectedAnswer: "Sur le plan économique, le Canadien Pacifique transporte le grain produit dans l’Ouest vers les marchés de l’Est et permet aux fabricants de l’Est de vendre leurs produits à la population croissante de l’Ouest. Il développe ainsi les échanges et le marché intérieur canadien. Sur le plan territorial, il relie physiquement la Colombie-Britannique et l’Ouest aux autres régions du Dominion, ce qui contribue à former un pays uni d’un océan à l’autre. La fonction économique concerne donc surtout la circulation des marchandises et la création de débouchés, tandis que la fonction territoriale concerne la liaison, l’occupation et l’unification du territoire canadien.",
  historicalDocumentIds: POLITIQUE_NATIONALE_CPR_FUNCTIONS_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Décrire seulement le transport sans distinguer ses effets économiques de ses effets territoriaux.",
    "Présenter la fonction territoriale comme une simple augmentation des ventes.",
    "Présenter la fonction économique comme un commerce réalisé uniquement avec l’étranger.",
    "Donner deux fonctions sans formuler explicitement leur différence.",
    "Affirmer que les territoires de l’Ouest sont inhabités avant la construction du chemin de fer.",
  ],
  distractors: [],
  operationId: "differences_and_similarities",
  sourceIds: POLITIQUE_NATIONALE_CPR_FUNCTIONS_SOURCES.map(({ id }) => id),
  sourceCatalog: POLITIQUE_NATIONALE_CPR_FUNCTIONS_SOURCES,
  rationale: "Le premier document illustre les flux complémentaires de marchandises entre l’Ouest agricole et l’Est manufacturier. Le second présente le chemin de fer comme le lien physique qui transforme un Dominion dispersé en territoire uni. Leur mise en relation permet de comparer deux fonctions distinctes d’une même infrastructure.",
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
