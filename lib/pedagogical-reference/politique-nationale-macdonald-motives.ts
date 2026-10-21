import { BRITISH_NORTH_AMERICA_MACDONALD_CONFEDERATION_DOCUMENT } from "./british-north-america-confederation-documents.ts";
import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const POLITIQUE_NATIONALE_MACDONALD_MOTIVES_DOCUMENT = {
  schemaVersion: 1,
  id: "PN-T-005",
  title: "Macdonald justifie l’adoption d’une Politique nationale",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["politique-nationale"],
  operationIds: ["causes_and_consequences", "establish_facts"],
  historicalDate: "7 mars 1878",
  creator: "John A. Macdonald, chef de l’opposition à la Chambre des communes",
  holdingInstitution: "Débats de la Chambre des communes du Canada · transcription CanadaHistory.ca",
  sourceUrl: "https://www.canadahistory.ca/sections/documents/federal/Macdonald%20Moves.html",
  sourceLocator: "Débats de la Chambre des communes du Canada, 5e session, 3e législature, 7 mars 1878, p. 854-859, motion de John A. Macdonald",
  assetUrl: "https://www.canadahistory.ca/sections/documents/federal/Macdonald%20Moves.html",
  rightsStatement: "Débat parlementaire de 1878 appartenant au domaine public; traduction française et resserrement en deux phrases préparés par Socrato.",
  transcription: "Elle rétablira la prospérité de nos industries en difficulté, empêchera le Canada de devenir un marché où les autres pays écoulent leurs surplus et favorisera un commerce interprovincial actif. En avançant vers une réciprocité des tarifs avec nos voisins, elle pourra finalement procurer au pays la réciprocité commerciale.",
  accessibleDescription: "Extrait traduit d’une motion dans laquelle John A. Macdonald présente les objectifs économiques de sa Politique nationale en 1878.",
  historicalContext: "Pendant la crise économique commencée en 1873, les conservateurs dirigés par Macdonald proposent un relèvement protecteur des tarifs douaniers. En mars 1878, alors qu’il est chef de l’opposition, Macdonald présente cette motion avant d’en faire un thème central de la campagne électorale fédérale.",
  observationGuide: [
    "Repérer l’état des industries que Macdonald veut améliorer.",
    "Relever ce qu’il reproche à la concurrence étrangère.",
    "Identifier ce qu’il attend du commerce interprovincial et de la réciprocité commerciale.",
  ],
  interpretationCautions: [
    "L’extrait est une traduction-adaptation resserrée d’une longue motion; il conserve les raisons économiques formulées par Macdonald.",
    "Macdonald cherche à convaincre la Chambre et les électeurs : le document présente donc les effets attendus de sa proposition, et non des résultats déjà observés.",
    "L’expression « marché où les autres pays écoulent leurs surplus » traduit l’idée de sacrifice market employée dans le texte anglais.",
  ],
  pedagogicalUses: [
    "Expliquer pourquoi Macdonald propose la Politique nationale dans les années 1870.",
    "Distinguer un argument économique de 1878 d’un discours antérieur sur la Confédération.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const POLITIQUE_NATIONALE_MACDONALD_MOTIVES_DOCUMENTS = [
  POLITIQUE_NATIONALE_MACDONALD_MOTIVES_DOCUMENT,
  BRITISH_NORTH_AMERICA_MACDONALD_CONFEDERATION_DOCUMENT,
] as const;

const POLITIQUE_NATIONALE_MACDONALD_MOTIVES_SOURCES: ReferenceSource[] =
  POLITIQUE_NATIONALE_MACDONALD_MOTIVES_DOCUMENTS.map((document) => ({
    id: `document-source:${document.id}`,
    kind: "museum-or-archive" as const,
    title: document.title,
    creator: document.creator,
    publisher: document.holdingInstitution,
    publicationYear: document.id === POLITIQUE_NATIONALE_MACDONALD_MOTIVES_DOCUMENT.id ? 1878 : 1865,
    url: document.sourceUrl,
    locator: document.sourceLocator,
    rightsNote: document.rightsStatement,
    verificationStatus: "verified" as const,
  }));

export const POLITIQUE_NATIONALE_MACDONALD_MOTIVES_QUESTION = {
  schemaVersion: 1,
  id: "question:politique-nationale:document-interpretation-005",
  scope: "notional",
  knowledgeHeadingId: "politique-nationale",
  relatedKnowledgeHeadingIds: ["politique-nationale"],
  referenceCardId: "reference-card:politique-nationale",
  historicalRecordId: "historical-record:politique-nationale",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Pourquoi John A. Macdonald propose-t-il la Politique nationale dans les années 1870?",
  instruction: "Un seul des deux extraits répond à la question. Sélectionne le document utile, puis explique deux raisons données par Macdonald. Écarte l’autre document en précisant son sujet.",
  initialGuidance: "J’attends ta réponse…",
  expectedAnswer: "Le document 1 permet de répondre. Macdonald propose la Politique nationale afin de rétablir la prospérité des industries en difficulté, de protéger le marché canadien contre les surplus étrangers, de stimuler le commerce entre les provinces et d’obtenir une meilleure réciprocité commerciale avec les pays voisins. Deux raisons pertinentes suffisent. Le document 2 doit être écarté : en 1865, Macdonald y défend la Confédération, un gouvernement fédéral central fort et le partage des responsabilités entre le Parlement fédéral et les provinces; il ne justifie pas la Politique nationale proposée dans les années 1870.",
  historicalDocumentIds: POLITIQUE_NATIONALE_MACDONALD_MOTIVES_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Utiliser le document de 1865 simplement parce qu’il est lui aussi de Macdonald.",
    "Répondre seulement que Macdonald veut instaurer des tarifs sans expliquer les problèmes économiques auxquels ils doivent répondre.",
    "Présenter les emplois, la prospérité industrielle ou la réciprocité comme des résultats déjà obtenus en 1878 plutôt que comme des objectifs annoncés.",
    "Écarter le deuxième document parce qu’il serait faux plutôt que parce qu’il porte sur la Confédération et le partage des pouvoirs.",
  ],
  distractors: [BRITISH_NORTH_AMERICA_MACDONALD_CONFEDERATION_DOCUMENT.id],
  operationId: "causes_and_consequences",
  sourceIds: POLITIQUE_NATIONALE_MACDONALD_MOTIVES_SOURCES.map(({ id }) => id),
  sourceCatalog: POLITIQUE_NATIONALE_MACDONALD_MOTIVES_SOURCES,
  rationale: "Les deux documents ont le même auteur, ce qui oblige l’élève à discriminer selon la date et le contenu. La motion de 1878 énonce directement les raisons économiques de la Politique nationale; l’extrait de 1865 traite plutôt de l’organisation politique de la Confédération.",
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
