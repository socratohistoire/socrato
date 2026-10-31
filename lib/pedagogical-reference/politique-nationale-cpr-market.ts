import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const POLITIQUE_NATIONALE_CPR_MARKET_SPEECH_DOCUMENT = {
  schemaVersion: 1,
  id: "PN-T-006",
  title: "Le Canadien Pacifique unit les producteurs et les consommateurs du pays",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["politique-nationale"],
  operationIds: ["causal_connections", "relationships_between_facts"],
  historicalDate: "26 février 1886",
  creator: "Horace Everett, député de la cité et du comté de Saint-Jean",
  holdingInstitution: "Débats de la Chambre des communes du Canada · PrimaryDocuments.ca",
  sourceUrl: "https://primarydocuments.ca/wp-content/uploads/2019/10/HOCDebates26February1886.pdf",
  sourceLocator: "Débats de la Chambre des communes, 4e session, 5e législature, 26 février 1886, p. 11-12 du fascicule (PDF, p. 3-4)",
  assetUrl: "https://primarydocuments.ca/wp-content/uploads/2019/10/HOCDebates26February1886.pdf#page=3",
  rightsStatement: "Débat parlementaire canadien de 1886 dans le domaine public; traduction française et resserrement en quatre phrases préparés par Socrato.",
  transcription: "Le chemin de fer a rendu possible l’occupation des Prairies par notre population. Il a rendu possible la culture du grain et offre un moyen facile de le transporter vers les marchés; de grandes quantités sont déjà apportées du Nord-Ouest dans cette partie du Canada. Avec l’augmentation du nombre et de la richesse des habitants de l’Ouest, les produits de nos districts de l’Est pourront y trouver un marché. Le chemin de fer permettra ainsi de donner de l’emploi et d’accroître la richesse des personnes engagées dans les industries de l’Est.",
  accessibleDescription: "Extrait traduit d’un discours parlementaire de 1886 qui relie le peuplement agricole de l’Ouest, le transport du grain vers l’Est et la vente de produits de l’Est aux habitants de l’Ouest.",
  historicalContext: "Le Canadien Pacifique est achevé en 1885 et doit offrir un service quotidien de voyageurs et de marchandises d’un océan à l’autre à partir de juin 1886. Horace Everett, député conservateur du Nouveau-Brunswick, présente le chemin de fer comme un moyen de peupler les Prairies et d’intensifier les échanges entre l’Est et l’Ouest.",
  observationGuide: [
    "Repérer ce que le chemin de fer permet aux habitants des Prairies de produire et d’expédier.",
    "Identifier le nouveau débouché offert aux produits fabriqués dans l’Est.",
    "Expliquer comment les échanges dans les deux directions agrandissent le marché intérieur.",
  ],
  interpretationCautions: [
    "L’extrait est traduit et resserré à partir d’un discours plus long; il conserve la chaîne explicative formulée par Everett.",
    "Everett appuie le gouvernement conservateur et cherche à présenter favorablement le Canadien Pacifique et la Politique nationale.",
    "L’expression « occupation des Prairies » reflète la perspective colonisatrice du discours et efface la présence antérieure des Premières Nations et des Métis.",
  ],
  pedagogicalUses: [
    "Relier la colonisation agricole de l’Ouest au transport ferroviaire.",
    "Expliquer la création d’échanges complémentaires entre l’Ouest agricole et l’Est manufacturier.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const POLITIQUE_NATIONALE_CPR_MARKET_MILITARY_DISTRACTOR_DOCUMENT = {
  schemaVersion: 1,
  id: "PN-T-007",
  title: "Macdonald prévoit un usage militaire du chemin de fer",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["politique-nationale"],
  operationIds: ["causal_connections", "relationships_between_facts"],
  historicalDate: "29 mars 1885",
  creator: "John A. Macdonald, premier ministre du Canada",
  holdingInstitution: "Correspondance de Sir John Macdonald · transcription PrimaryDocuments.ca",
  sourceUrl: "https://primarydocuments.ca/sir-joseph-pope-ed-correspondence-of-sir-john-macdonald-1921/",
  sourceLocator: "Lettre de John A. Macdonald au major-général Frederick Middleton, Ottawa, 29 mars 1885, dans Correspondence of Sir John Macdonald, p. 340-341",
  assetUrl: "https://primarydocuments.ca/sir-joseph-pope-ed-correspondence-of-sir-john-macdonald-1921/",
  rightsStatement: "Lettre de 1885 et édition de 1921 dans le domaine public; traduction française et resserrement en trois phrases préparés par Socrato.",
  transcription: "Le Canadien Pacifique doit bien sûr être gardé. Des groupes doivent surveiller les personnes et les provisions arrivant par train à Emerson, ainsi que les différents sentiers traversant la frontière. Je suppose que le général Strange pourra envoyer le long de la voie ferrée au moins deux troupes de cavaliers montés.",
  accessibleDescription: "Extrait traduit d’une lettre dans laquelle John A. Macdonald traite de la protection du Canadien Pacifique et du déplacement de cavaliers pendant la Résistance du Nord-Ouest de 1885.",
  historicalContext: "Au début de la Résistance du Nord-Ouest de 1885, Macdonald écrit au commandant des forces gouvernementales. Le chemin de fer sert alors aux communications et aux déplacements militaires, un rôle distinct de celui qu’il joue dans la colonisation et le marché intérieur.",
  observationGuide: [
    "Identifier le contexte militaire de la lettre.",
    "Repérer les personnes et les lieux que le chemin de fer permet de surveiller ou d’atteindre.",
    "Vérifier si l’extrait traite des colons, des produits agricoles ou du marché canadien.",
  ],
  interpretationCautions: [
    "L’extrait est traduit et resserré à partir d’une lettre plus longue; il conserve les indications de Macdonald sur la protection de la voie et le déplacement des cavaliers.",
    "Le document montre un usage réel du chemin de fer, mais cet usage est militaire et ne permet pas d’expliquer le développement du marché intérieur.",
  ],
  pedagogicalUses: [
    "Discriminer un document selon la relation historique demandée.",
    "Distinguer l’usage militaire du Canadien Pacifique de son rôle économique et colonisateur.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const POLITIQUE_NATIONALE_CPR_MARKET_DOCUMENTS = [
  POLITIQUE_NATIONALE_CPR_MARKET_SPEECH_DOCUMENT,
  POLITIQUE_NATIONALE_CPR_MARKET_MILITARY_DISTRACTOR_DOCUMENT,
] as const;

const POLITIQUE_NATIONALE_CPR_MARKET_SOURCES: ReferenceSource[] =
  POLITIQUE_NATIONALE_CPR_MARKET_DOCUMENTS.map((document) => ({
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

export const POLITIQUE_NATIONALE_CPR_MARKET_QUESTION = {
  schemaVersion: 1,
  id: "question:politique-nationale:document-interpretation-006",
  scope: "notional",
  knowledgeHeadingId: "politique-nationale",
  relatedKnowledgeHeadingIds: ["politique-nationale"],
  referenceCardId: "reference-card:politique-nationale",
  historicalRecordId: "historical-record:politique-nationale",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Explique comment le Canadien Pacifique relie la colonisation de l’Ouest au développement du marché intérieur.",
  instruction: "Appuie-toi sur le document pertinent, puis explique comment le chemin de fer favorise à la fois le peuplement de l’Ouest et les échanges entre l’Ouest et l’Est du Canada.",
  initialGuidance: "J’attends ta réponse…",
  expectedAnswer: "Le Canadien Pacifique rend l’établissement agricole dans les Prairies plus accessible et permet aux colons d’expédier leur grain vers les marchés de l’Est. En retour, l’augmentation de la population et de sa richesse crée dans l’Ouest des consommateurs pour les produits fabriqués dans les régions industrielles de l’Est. Le chemin de fer relie donc l’Ouest agricole à l’Est manufacturier et agrandit le marché intérieur canadien.",
  historicalDocumentIds: POLITIQUE_NATIONALE_CPR_MARKET_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Expliquer seulement que le chemin de fer transporte des personnes sans relier les colons aux échanges de marchandises.",
    "Présenter le marché intérieur comme un commerce effectué uniquement avec les États-Unis ou l’Europe.",
    "Mentionner le transport du grain vers l’Est sans expliquer que les habitants de l’Ouest deviennent aussi des clients pour les produits manufacturés de l’Est.",
    "Choisir la lettre de Macdonald simplement parce qu’elle mentionne le Canadien Pacifique.",
    "Présenter les Prairies comme un territoire inhabité avant la colonisation encouragée par le gouvernement.",
  ],
  distractors: [POLITIQUE_NATIONALE_CPR_MARKET_MILITARY_DISTRACTOR_DOCUMENT.id],
  operationId: "causal_connections",
  sourceIds: POLITIQUE_NATIONALE_CPR_MARKET_SOURCES.map(({ id }) => id),
  sourceCatalog: POLITIQUE_NATIONALE_CPR_MARKET_SOURCES,
  rationale: "Le discours de 1886 énonce toute la chaîne causale attendue : le rail favorise le peuplement agricole, transporte le grain vers l’Est et ouvre aux industries de l’Est un marché formé par la population croissante de l’Ouest. La lettre de Macdonald mentionne le même chemin de fer dans un contexte militaire, ce qui oblige l’élève à discriminer selon la relation historique demandée.",
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
