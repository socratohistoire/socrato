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
  locator: "Acte des manufactures de Québec, sanctionné le 9 mai 1885, 48 Vict., chap. 32, art. 9, par. 1, et art. 10, p. 61.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const factoryInquirySource = {
  id: "document-source:IND-T-002",
  kind: "government",
  title: "Enquête sur les manufactures et les usines du Dominion",
  creator: "Commission d’enquête sur les manufactures et les usines du Dominion",
  publisher: "Parlement du Canada",
  publicationYear: 1882,
  url: "https://archive.org/details/sessional2248s1882cana",
  locator: "Documents de la session du Dominion du Canada, 1882, no 42, annexe 3, p. 16, échange avec le Trades’ Council, question 2.",
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
      excerpt: [
        "Dans une manufacture, il est interdit d’employer un garçon de moins de douze ans ou une fille de moins de quatorze ans.",
        "Sauf dans les cas prévus par la loi, les enfants, les jeunes filles et les femmes qui travaillent dans une manufacture ne peuvent pas travailler plus de dix heures par jour ni plus de soixante heures par semaine.",
      ].join(" […] "),
      adapted: true,
    },
    editorialNote: "Passages adaptés en français actuel. Les crochets […] signalent les dispositions retranchées entre les deux passages.",
    historicalKnowledgeIds: [knowledgeHeadingId],
    intellectualOperationIds: [operationId],
  },
  {
    id: "IND-T-002",
    title: "Des accidents liés aux machines dans les usines",
    typeLabel: "Rapport d’enquête",
    dateLabel: "1882",
    institutionLabel: "Parlement du Canada",
    sourceLabel: factoryInquirySource.locator,
    sourceUrls: [factoryInquirySource.url],
    rightsLabel: "Rapport du XIXᵉ siècle, domaine public.",
    content: {
      kind: "historical_excerpt",
      excerpt: "On demande aux représentants des métiers s’ils ont eu connaissance d’accidents graves causés par des machines, des courroies ou des poulies sans protection. Ils signalent plusieurs accidents. […] Ils rapportent notamment de nombreux cas de bras fracturés, surtout quand des ouvriers remettent une courroie en place pendant que la machine tourne.",
      adapted: true,
    },
    editorialNote: "Traduit et adapté de l’anglais. Les crochets […] indiquent un passage retranché.",
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
  instruction: "Nomme une conséquence en une phrase.",
  expectedAnswer: [
    "Une seule mesure suffit. Le Québec fixe un âge minimum pour travailler dans les manufactures, soit 12 ans pour les garçons et 14 ans pour les filles. Accepter aussi un exemple exact pour l’un des deux groupes.",
    "Accepter également que le Québec limite les heures de travail des enfants, des jeunes filles et des femmes en manufacture. Le maximum est généralement de 10 heures par jour ou 60 heures par semaine. L’un des deux plafonds suffit.",
    "Le document 1 illustre la mobilisation ouvrière, le document 2 établit les mesures et le document 3 décrit des conditions de travail dangereuses. L’élève peut nommer une mesure sans citer de document ni indiquer quel document écarter.",
  ].join(" "),
  historicalDocumentIds: INDUSTRIALIZATION_LABOR_MOVEMENT_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Nommer la grève ou décrire les accidents en usine sans indiquer de mesure sur les conditions de travail.",
    "Affirmer que la loi interdit tout travail aux enfants ou qu’elle fixe un salaire minimum.",
    "Présenter la limite des heures de travail comme une mesure visant tous les ouvriers.",
  ],
  distractors: [],
  operationId,
  sourceIds: [strikeSource.id, lawSource.id, factoryInquirySource.id],
  sourceCatalog: [strikeSource, lawSource, factoryInquirySource],
  rationale: "La gravure illustre la mobilisation ouvrière. La loi permet de dégager une règle sur l’âge d’embauche ou sur la durée du travail dans le contexte des revendications ouvrières. Le rapport d’enquête décrit les dangers des machines et sert de document de contexte.",
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
