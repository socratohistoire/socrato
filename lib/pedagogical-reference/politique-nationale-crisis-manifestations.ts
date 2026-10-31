import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const POLITIQUE_NATIONALE_CATTLE_PRICES_DOCUMENT = {
  schemaVersion: 1,
  id: "PN-S-001",
  title: "Prix de gros des bouvillons au Canada, 1872-1879",
  kind: "statistics",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["politique-nationale"],
  operationIds: ["establish_facts", "changes_and_continuities"],
  historicalDate: "1872-1879",
  creator: "Statistique Canada; données historiques attribuées à H. Michell",
  holdingInstitution: "Bibliothèque et Archives Canada — Statistiques historiques du Canada",
  sourceUrl: "https://epe.lac-bac.gc.ca/100/200/301/statcan/historical_statistics_can-e/sectionm/sectionm.htm?nodisclaimer=1",
  sourceLocator: "Série M234, « Prix de gros de certains produits agricoles, 1867 à 1974 »",
  assetUrl: "https://epe.lac-bac.gc.ca/100/200/301/statcan/historical_statistics_can-e/sectionm/M228_238.csv?nodisclaimer=1",
  rightsStatement: "Données historiques du gouvernement du Canada reproduites à des fins pédagogiques avec indication de la source.",
  transcription: "1872 : 7,58 ¢/lb; 1873 : 7,21 ¢/lb; 1874 : 5,80 ¢/lb; 1875 : 5,16 ¢/lb; 1876 : 4,86 ¢/lb; 1877 : 5,17 ¢/lb; 1878 : 4,80 ¢/lb; 1879 : 4,61 ¢/lb.",
  accessibleDescription: "Tableau montrant une diminution générale du prix de gros des bouvillons au Canada, de 7,58 cents la livre en 1872 à 4,61 cents en 1879.",
  historicalContext: "La crise financière de 1873 ouvre une longue dépression. La baisse du prix de produits agricoles réduit les revenus reçus par les producteurs et constitue une manifestation de l’affaiblissement de la demande.",
  observationGuide: [
    "Comparer le prix de 1873 à celui de 1879.",
    "Décrire la tendance générale plutôt que chaque variation annuelle.",
  ],
  interpretationCautions: [
    "La série porte sur un produit agricole précis et ne mesure pas, à elle seule, l’ensemble de l’économie canadienne.",
    "Un bouvillon est un jeune bovin destiné à la production de viande; ¢/lb signifie cents par livre.",
  ],
  pedagogicalUses: ["Relever la baisse du prix d’un produit agricole comme manifestation de la crise commencée en 1873."],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const POLITIQUE_NATIONALE_BUSINESS_FAILURES_DOCUMENT = {
  schemaVersion: 1,
  id: "PN-S-002",
  title: "Montants associés aux faillites commerciales au Canada, 1873-1879",
  kind: "statistics",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["politique-nationale"],
  operationIds: ["establish_facts", "changes_and_continuities"],
  historicalDate: "1873-1879; tableau présenté le 12 mai 1887",
  creator: "Charles Tupper, ministre des Finances",
  holdingInstitution: "Bibliothèque du Parlement et Gouvernement du Canada",
  sourceUrl: "https://publications.gc.ca/collections/collection_2016/fin/F1-23-1-1887-eng.pdf",
  sourceLocator: "Discours budgétaire du 12 mai 1887, tableau « Business Failures in Canada », p. 24 du PDF",
  assetUrl: "https://publications.gc.ca/collections/collection_2016/fin/F1-23-1-1887-eng.pdf#page=24",
  rightsStatement: "Débats parlementaires canadiens du XIXe siècle dans le domaine public; données transcrites et libellés traduits par Socrato.",
  transcription: "1873 : 12 334 000 $; 1874 : 7 696 000 $; 1875 : 28 843 000 $; 1876 : 25 517 000 $; 1877 : 25 523 000 $; 1878 : 23 908 000 $; 1879 : 29 347 000 $.",
  accessibleDescription: "Tableau montrant que les montants associés aux faillites commerciales sont nettement plus élevés de 1875 à 1879 qu’en 1873 et 1874.",
  historicalContext: "En 1887, le ministre des Finances Charles Tupper utilise une série rétrospective sur les faillites pour comparer des périodes de dépression. Les montants élevés de la seconde moitié des années 1870 indiquent des difficultés importantes pour les entreprises.",
  observationGuide: [
    "Comparer les montants de 1873-1874 à ceux de 1875-1879.",
    "Repérer les années où le montant dépasse 25 millions de dollars.",
  ],
  interpretationCautions: [
    "Le tableau présente des montants en dollars associés aux faillites, et non le nombre d’entreprises touchées.",
    "Tupper emploie rétrospectivement ces données dans un discours politique favorable au gouvernement conservateur.",
  ],
  pedagogicalUses: ["Relever l’augmentation des montants liés aux faillites commerciales comme manifestation des difficultés des entreprises."],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const GREAT_DEPRESSION_CPI_DISTRACTOR_DOCUMENT = {
  schemaVersion: 1,
  id: "PN-S-003",
  title: "Variation des prix à la consommation au Canada, 1929-1933",
  kind: "statistics",
  status: "ready-for-review",
  periodIds: ["1896-1945"],
  knowledgeHeadingIds: ["politique-nationale", "grande-depression"],
  operationIds: ["establish_facts", "time_and_space"],
  historicalDate: "1929-1933",
  creator: "Statistique Canada",
  holdingInstitution: "Statistique Canada",
  sourceUrl: "https://www150.statcan.gc.ca/n1/daily-quotidien/150206/cg-c001-eng.htm",
  sourceLocator: "Graphique 1, « Movements in the Consumer Price Index over a century »; données de la table CANSIM 326-0021",
  assetUrl: "https://www150.statcan.gc.ca/n1/daily-quotidien/150206/cg-c001-eng.htm",
  rightsStatement: "Données de Statistique Canada reproduites à des fins pédagogiques avec indication de la source.",
  transcription: "1929 : +1,1 %; 1930 : −1,1 %; 1931 : −9,9 %; 1932 : −8,5 %; 1933 : −5,3 %.",
  accessibleDescription: "Tableau montrant une forte diminution annuelle des prix à la consommation entre 1931 et 1933.",
  historicalContext: "Ces données concernent la Grande Dépression qui suit le krach de 1929. Elles montrent une crise économique réelle, mais appartiennent à la période 1896-1945 plutôt qu’à la crise commencée en 1873.",
  observationGuide: [
    "Lire les années avant d’interpréter la tendance.",
    "Comparer la période du tableau à la date indiquée dans la question.",
  ],
  interpretationCautions: [
    "Ce document est volontairement proposé comme document à discriminer : il porte sur 1929-1933, non sur les années 1870.",
    "Les valeurs expriment la variation annuelle moyenne de l’indice des prix à la consommation, et non son niveau absolu.",
  ],
  pedagogicalUses: ["Vérifier que l’élève discrimine une donnée pertinente par sa date et son contexte historique."],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const POLITIQUE_NATIONALE_CRISIS_MANIFESTATION_DOCUMENTS = [
  POLITIQUE_NATIONALE_CATTLE_PRICES_DOCUMENT,
  POLITIQUE_NATIONALE_BUSINESS_FAILURES_DOCUMENT,
  GREAT_DEPRESSION_CPI_DISTRACTOR_DOCUMENT,
] as const;

export const POLITIQUE_NATIONALE_CRISIS_DATA_TABLES = {
  "PN-S-001": {
    headers: ["Année", "Prix de gros des bouvillons (¢/lb)"],
    rows: [["1872", "7,58"], ["1873", "7,21"], ["1874", "5,80"], ["1875", "5,16"], ["1876", "4,86"], ["1877", "5,17"], ["1878", "4,80"], ["1879", "4,61"]],
  },
  "PN-S-002": {
    headers: ["Année", "Montants associés aux faillites ($)"],
    rows: [["1873", "12 334 000"], ["1874", "7 696 000"], ["1875", "28 843 000"], ["1876", "25 517 000"], ["1877", "25 523 000"], ["1878", "23 908 000"], ["1879", "29 347 000"]],
  },
  "PN-S-003": {
    headers: ["Année", "Variation annuelle moyenne de l’IPC (%)"],
    rows: [["1929", "+1,1"], ["1930", "−1,1"], ["1931", "−9,9"], ["1932", "−8,5"], ["1933", "−5,3"]],
  },
} as const;

const POLITIQUE_NATIONALE_CRISIS_SOURCES = POLITIQUE_NATIONALE_CRISIS_MANIFESTATION_DOCUMENTS.map((document): ReferenceSource => ({
  id: `document-source:${document.id}`,
  kind: "government",
  title: document.title,
  creator: document.creator,
  publisher: document.holdingInstitution,
  publicationYear: document.id === "PN-S-002" ? 1887 : document.id === "PN-S-003" ? 2015 : 1983,
  url: document.sourceUrl,
  locator: document.sourceLocator,
  rightsNote: document.rightsStatement,
  verificationStatus: "verified",
}));

export const POLITIQUE_NATIONALE_CRISIS_MANIFESTATIONS_QUESTION = {
  schemaVersion: 1,
  id: "question:politique-nationale:document-interpretation-002",
  scope: "notional",
  knowledgeHeadingId: "politique-nationale",
  relatedKnowledgeHeadingIds: ["politique-nationale"],
  referenceCardId: "reference-card:politique-nationale",
  historicalRecordId: "historical-record:politique-nationale",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Relève deux manifestations de la crise économique commencée en 1873.",
  instruction: "Formule une manifestation de la crise à partir de chacun des deux documents pertinents et appuie-les sur des données précises.",
  expectedAnswer: "Deux manifestations peuvent être relevées. D’abord, les prix agricoles diminuent : le prix de gros des bouvillons passe de 7,21 cents la livre en 1873 à 4,61 cents en 1879. Ensuite, les difficultés des entreprises s’accentuent : les montants associés aux faillites commerciales atteignent 28 843 000 $ en 1875 et 29 347 000 $ en 1879, contre 12 334 000 $ en 1873.",
  historicalDocumentIds: POLITIQUE_NATIONALE_CRISIS_MANIFESTATION_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Utiliser le document de 1929-1933 comme preuve de la crise commencée en 1873.",
    "Donner deux valeurs sans formuler les tendances qu’elles montrent.",
    "Présenter le montant des faillites comme le nombre d’entreprises en faillite.",
    "Nommer seulement la crise sans relever deux de ses manifestations.",
  ],
  distractors: [GREAT_DEPRESSION_CPI_DISTRACTOR_DOCUMENT.id],
  operationId: "establish_facts",
  sourceIds: POLITIQUE_NATIONALE_CRISIS_SOURCES.map(({ id }) => id),
  sourceCatalog: POLITIQUE_NATIONALE_CRISIS_SOURCES,
  rationale: "Deux séries économiques permettent de relever la baisse des prix agricoles et l’augmentation des montants associés aux faillites. Un troisième tableau, portant sur 1929-1933, oblige l’élève à vérifier la date avant de retenir un document.",
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
