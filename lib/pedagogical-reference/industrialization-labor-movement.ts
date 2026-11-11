import type { LearningSessionDocument } from "../student-learning-session/types.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

const knowledgeHeadingId = "premiere-phase-d-industrialisation";
const operationId = "causes_and_consequences";

const strikeSource = {
  id: "document-source:IND-I-004",
  kind: "museum-or-archive",
  title: "Grève des ouvriers du canal de Lachine",
  publisher: "Archives de la Ville de Montréal",
  publicationYear: 1878,
  url: "https://ville.montreal.qc.ca/memoiresdesmontrealais/files/canal-de-lachine-greve-des-ouvriers",
  locator: "L’Opinion publique, 10 janvier 1878. Reproduction des Archives de la Ville de Montréal, VM094-Y-1-17-D1568.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const lawSource = {
  id: "document-source:IND-T-001",
  kind: "government",
  title: "Acte des manufactures de Québec, 1885",
  creator: "Législature du Québec",
  publisher: "Assemblée nationale du Québec",
  publicationYear: 1885,
  url: "https://www.paricilademocratie.com/document/172",
  locator: "Acte des manufactures de Québec, sanctionné le 9 mai 1885, 48 Vict., chap. 32, art. 9, par. 1, p. 61.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

export const INDUSTRIALIZATION_LABOR_MOVEMENT_DOCUMENTS: LearningSessionDocument[] = [
  {
    id: "IND-I-004",
    title: "Grève des ouvriers du canal de Lachine",
    typeLabel: "Gravure",
    dateLabel: "10 janvier 1878",
    institutionLabel: strikeSource.publisher,
    sourceLabel: strikeSource.locator,
    sourceUrls: [strikeSource.url],
    rightsLabel: "Gravure du XIXᵉ siècle, domaine public.",
    content: {
      kind: "historical_image",
      localSrc: "/historical-documents/industrialisation-greve-canal-lachine-1878.jpg",
      alt: "Gravure montrant une foule d’ouvriers rassemblés près des bâtiments du chantier du canal de Lachine.",
      description: "La gravure représente le rassemblement des ouvriers en grève au canal de Lachine, à Montréal.",
    },
    historicalKnowledgeIds: [knowledgeHeadingId],
    intellectualOperationIds: [operationId],
  },
  {
    id: "IND-T-001",
    title: "Extrait d’une loi du Québec",
    typeLabel: "Texte de loi",
    dateLabel: "9 mai 1885",
    authorLabel: lawSource.creator,
    institutionLabel: lawSource.publisher,
    sourceLabel: lawSource.locator,
    sourceUrls: [lawSource.url],
    rightsLabel: "Texte de loi du XIXᵉ siècle, domaine public.",
    content: {
      kind: "historical_excerpt",
      excerpt: "[Aucun garçon] âgé de moins de douze ans, et aucune fille âgée de moins de quatorze ans, ne peuvent être employés dans une manufacture.",
    },
    editorialNote: "Les crochets signalent une simplification du vocabulaire d’époque.",
    historicalKnowledgeIds: [knowledgeHeadingId],
    intellectualOperationIds: [operationId],
  },
];

export const INDUSTRIALIZATION_LABOR_MOVEMENT_QUESTION = {
  schemaVersion: 1,
  id: "question:premiere-phase-d-industrialisation:mouvement-ouvrier-consequence",
  scope: "notional",
  knowledgeHeadingId,
  relatedKnowledgeHeadingIds: [knowledgeHeadingId],
  referenceCardId: `reference-card:${knowledgeHeadingId}`,
  historicalRecordId: `historical-record:${knowledgeHeadingId}`,
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "À l’aide des documents, indique une conséquence du mouvement ouvrier sur les conditions de travail au Québec entre 1872 et 1885.",
  instruction: "Réponds en une phrase et appuie ta réponse sur un indice tiré d’un document.",
  expectedAnswer: "Le Québec fixe un âge minimum pour travailler dans les manufactures. Accepter une formulation équivalente ou un exemple exact de la restriction : la loi interdit l’emploi en manufacture des garçons de moins de 12 ans ou des filles de moins de 14 ans. Les deux seuils ne sont pas exigés. Le document 1 illustre la mobilisation ouvrière et le document 2 établit la mesure. Ne pas attribuer cette mesure à la seule grève du canal de Lachine.",
  historicalDocumentIds: INDUSTRIALIZATION_LABOR_MOVEMENT_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Nommer la grève sans indiquer de conséquence sur les conditions de travail.",
    "Affirmer que la loi interdit tout travail aux enfants ou qu’elle fixe un salaire minimum.",
  ],
  distractors: [],
  operationId,
  sourceIds: [strikeSource.id, lawSource.id],
  sourceCatalog: [strikeSource, lawSource],
  rationale: "La gravure illustre la mobilisation ouvrière. La loi permet de dégager une mesure de protection des enfants dans le contexte plus large des revendications ouvrières.",
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
