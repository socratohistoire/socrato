import type { LearningSessionDocument } from "../student-learning-session/types.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

const knowledgeHeadingId = "premiere-phase-d-industrialisation";
const operationId = "causal_connections";
const documentContext = {
  historicalKnowledgeIds: [knowledgeHeadingId],
  intellectualOperationIds: [operationId],
};

const portSource = {
  id: "document-source:IND-LACHINE-PORT",
  kind: "academic",
  title: "Le corridor du canal de Lachine : au cœur des échanges et des transports",
  publisher: "Laboratoire d’histoire et de patrimoine de Montréal, UQAM",
  url: "https://lhpm.uqam.ca/programmation-scientifique/lieux-urbains-cultures-urbaines-et-milieux-de-vie/le-corridor-du-canal-de-lachine-au-coeur-des-echanges-et-des-transports/",
  locator: "Inventaire du transbordement et de l’entreposage, des écluses de Montréal à Saint-Gabriel, repères de 1880 et 1890.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const industriesSource = {
  id: "document-source:IND-LACHINE-INDUSTRIES",
  kind: "government",
  title: "Un pourvoyeur d’énergie hydraulique",
  publisher: "Parcs Canada",
  url: "https://parcs.canada.ca/lhn-nhs/qc/canallachine/culture/histoire-history/hydraulique-hydraulic",
  locator: "Section « L’énergie : pour qui et pour quoi ? », secteurs du bassin nº 2, de Saint-Gabriel et de Côte-Saint-Paul.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const commissionSource = {
  id: "document-source:IND-LACHINE-COMMISSION",
  kind: "government",
  title: "Report of Royal Commission on the Leasing of Water-Power, Lachine Canal",
  creator: "Commission royale sur la location de la force hydraulique du canal de Lachine",
  publisher: "Gouvernement du Canada",
  publicationYear: 1887,
  url: "https://publications.gc.ca/collections/collection_2014/bcp-pco/CP32-153-1887-eng.pdf",
  locator: "Début de la section « Report », du premier agrandissement du canal au passage sur l’écluse Saint-Gabriel.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

export const INDUSTRIALIZATION_LACHINE_CANAL_DOCUMENTS: LearningSessionDocument[] = [
  {
    ...documentContext,
    id: "IND-LACHINE-CORRIDOR-MAP",
    title: "Le canal de Lachine vers 1890",
    typeLabel: "Carte du corridor industriel",
    dateLabel: "Vers 1890",
    sourceLabel: "Carte schématique réalisée à partir des travaux de l’UQAM et de Parcs Canada.",
    sourceUrls: [portSource.url, industriesSource.url],
    rightsLabel: "Carte originale réalisée pour Socrato.",
    content: {
      kind: "historical_image",
      localSrc: "/historical-documents/canal-lachine-corridor-industriel-1890.svg",
      alt: "Carte schématique du canal de Lachine reliant le lac Saint-Louis au port de Montréal. Elle situe les quais, les bassins et les secteurs industriels de Côte-Saint-Paul, de Saint-Gabriel et du bassin nº 2.",
      description: "La carte situe les quais et les secteurs industriels le long de la voie navigable qui relie le lac Saint-Louis au port de Montréal.",
    },
  },
  {
    ...documentContext,
    id: "IND-LACHINE-WATERPOWER-1887",
    title: "L’eau du canal fait tourner les machines",
    typeLabel: "Rapport d’une commission royale",
    dateLabel: "1887",
    authorLabel: commissionSource.creator,
    sourceLabel: commissionSource.locator,
    sourceUrls: [commissionSource.url],
    rightsLabel: "Extrait adapté en français d’une source primaire.",
    content: {
      kind: "historical_excerpt",
      adapted: true,
      excerpt: "Le premier agrandissement du canal a permis d’y faire entrer plus d’eau qu’il n’en fallait pour la navigation. À Montréal, la différence de niveau entre le fleuve Saint-Laurent et le bassin nº 2 crée une chute d’eau. Cette chute fournit la force nécessaire pour faire tourner les roues qui actionnent les machines des moulins. À l’écluse Saint-Gabriel, une autre chute fournit aussi de l’énergie aux manufactures.",
    },
  },
];

export const INDUSTRIALIZATION_LACHINE_CANAL_QUESTION = {
  schemaVersion: 1,
  id: "question:premiere-phase-d-industrialisation:canal-lachine-manufactures",
  scope: "notional",
  knowledgeHeadingId,
  relatedKnowledgeHeadingIds: [knowledgeHeadingId],
  referenceCardId: "reference-card:premiere-phase-d-industrialisation",
  historicalRecordId: "historical-record:premiere-phase-d-industrialisation",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Explique comment le canal de Lachine favorise le développement des manufactures à Montréal entre 1850 et 1896. Explique ta réponse à l’aide de deux éléments.",
  instruction: "Explique deux façons dont le canal aide les manufactures à s’installer ou à produire.",
  expectedAnswer: "Le canal donne aux manufactures un accès à une voie navigable et aux quais. Les bateaux peuvent y livrer des matières premières et emporter les produits fabriqués, ce qui facilite les échanges. La différence de niveau aux écluses crée aussi des chutes d’eau qui font tourner les roues hydrauliques. Ces roues actionnent les machines de certains moulins et manufactures, ce qui favorise l’installation et la production des usines près du canal.",
  historicalDocumentIds: INDUSTRIALIZATION_LACHINE_CANAL_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Nommer le transport ou la force de l’eau sans expliquer ce que cela change pour les manufactures.",
    "Compter l’arrivée des matières premières et l’expédition des produits comme deux mécanismes distincts.",
    "Confondre l’énergie hydraulique des roues avec la production d’électricité.",
  ],
  distractors: [],
  operationId,
  sourceIds: [portSource.id, industriesSource.id, commissionSource.id],
  sourceCatalog: [portSource, industriesSource, commissionSource],
  rationale: "La carte situe les industries près des quais et d’une voie navigable. Le rapport de 1887 explique le fonctionnement de la force hydraulique utilisée sur le canal.",
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
