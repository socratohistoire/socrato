import type { LearningSessionDocument } from "../student-learning-session/types.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

const knowledgeHeadingId = "premiere-phase-d-industrialisation";
const operationId = "causes_and_consequences";
const documentContext = {
  historicalKnowledgeIds: [knowledgeHeadingId],
  intellectualOperationIds: [operationId],
};

const declarationSource = {
  id: "document-source:IND-KNIGHTS-1886",
  kind: "museum-or-archive",
  title: "Preamble of the Knights of Labor, 1886",
  creator: "Chevaliers du travail",
  publisher: "The Samuel Gompers Papers, University of Maryland",
  publicationYear: 1886,
  url: "https://www.gompers.umd.edu/KOL%20preamble.htm",
  locator: "Declaration of Principles, points 6, 20 et 21.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const strikeSource = {
  id: "document-source:IND-I-004",
  kind: "museum-or-archive",
  title: "Grève des ouvriers du canal de Lachine",
  publisher: "Archives de la Ville de Montréal",
  publicationYear: 1878,
  url: "https://ville.montreal.qc.ca/memoiresdesmontrealais/files/canal-de-lachine-greve-des-ouvriers",
  locator: "Gravure publiée en janvier 1878, reproduction des Archives de la Ville de Montréal, VM094-Y-1-17-D1568.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

export const INDUSTRIALIZATION_WORKER_ORGANIZING_DOCUMENTS: LearningSessionDocument[] = [
  {
    ...documentContext,
    id: "IND-KNIGHTS-1886",
    title: "Déclaration de principes des Chevaliers du travail",
    typeLabel: "Déclaration de principes",
    dateLabel: "1886",
    authorLabel: declarationSource.creator,
    sourceLabel: declarationSource.locator,
    sourceUrls: [declarationSource.url],
    rightsLabel: "Adaptation en français d’une source primaire.",
    content: {
      kind: "historical_excerpt",
      adapted: true,
      excerpt: "Nous demandons que des mesures protègent la santé et la sécurité dans les manufactures. Nous voulons que les femmes et les hommes reçoivent le même salaire pour un même travail. Nous cherchons aussi à limiter la journée de travail à huit heures.",
    },
  },
  {
    ...documentContext,
    id: "IND-I-004",
    title: strikeSource.title,
    typeLabel: "Gravure d’un rassemblement ouvrier",
    dateLabel: "1878",
    institutionLabel: strikeSource.publisher,
    sourceLabel: strikeSource.locator,
    sourceUrls: [strikeSource.url],
    rightsLabel: "Gravure du XIXᵉ siècle, domaine public.",
    content: {
      kind: "historical_image",
      localSrc: "/historical-documents/industrialisation-greve-canal-lachine-1878.jpg",
      alt: "Une foule se rassemble près de bâtiments du chantier du canal de Lachine pendant une grève.",
      description: "Rassemblement d’ouvriers en grève au canal de Lachine, à Montréal, quelques années avant la déclaration des Chevaliers du travail.",
    },
  },
];

export const INDUSTRIALIZATION_WORKER_ORGANIZING_QUESTION = {
  schemaVersion: 1,
  id: "question:premiere-phase-d-industrialisation:organisation-des-ouvriers",
  scope: "notional",
  knowledgeHeadingId,
  relatedKnowledgeHeadingIds: [knowledgeHeadingId],
  referenceCardId: "reference-card:premiere-phase-d-industrialisation",
  historicalRecordId: "historical-record:premiere-phase-d-industrialisation",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Pourquoi des travailleurs québécois se regroupent-ils dans des organisations ouvrières au cours des années 1880? Explique ta réponse à l’aide de deux éléments.",
  instruction: "Explique deux éléments qui aident à comprendre pourquoi les travailleurs se regroupent.",
  expectedAnswer: "Les travailleurs se regroupent pour améliorer leurs conditions de travail et donner plus de poids à leurs revendications. Par exemple, ils réclament des mesures de sécurité parce que le travail en manufacture présente des risques et une limite de huit heures parce que leurs journées sont longues. On peut aussi expliquer qu’ils revendiquent un salaire égal pour un même travail. La gravure illustre comment des ouvriers peuvent se rassembler et faire grève pour défendre leurs intérêts ensemble. Accepter deux revendications expliquées, ou une revendication expliquée et le rôle de l’action collective.",
  historicalDocumentIds: INDUSTRIALIZATION_WORKER_ORGANIZING_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Nommer des revendications sans expliquer pourquoi elles motivent le regroupement des travailleurs.",
    "Attribuer aux Chevaliers du travail la grève du canal de Lachine ou prêter aux grévistes les revendications précises de la déclaration de 1886.",
  ],
  distractors: [],
  operationId,
  sourceIds: [declarationSource.id, strikeSource.id],
  sourceCatalog: [declarationSource, strikeSource],
  rationale: "La déclaration donne les objectifs d’une organisation ouvrière. La gravure montre un exemple montréalais d’action collective qui précède la déclaration.",
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
