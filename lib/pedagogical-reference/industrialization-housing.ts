import type { LearningSessionDocument } from "../student-learning-session/types.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

const knowledgeHeadingId = "premiere-phase-d-industrialisation";
const operationId = "differences_and_similarities";
const documentContext = {
  historicalKnowledgeIds: [knowledgeHeadingId],
  intellectualOperationIds: [operationId],
};

const photographSource = {
  id: "document-source:IND-HOUSING-MCDOUGALL",
  kind: "museum-or-archive",
  title: "Salon, résidence de Mme Alex McDougall, Montréal, QC, 1895",
  creator: "Wm. Notman & Son",
  publisher: "Musée McCord Stewart",
  publicationYear: 1895,
  url: "https://primaire.recitus.qc.ca/sujet/organisation/quebec-1905/content/la-bourgeoisie",
  locator: "Archives photographiques Notman, Musée McCord Stewart, II-112762, reproduite par le RÉCIT.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const surveySource = {
  id: "document-source:IND-HOUSING-AMES",
  kind: "government",
  title: "Incomes, Wages, and Rents in Montreal",
  creator: "Herbert Brown Ames",
  publisher: "Bulletin of the United States Department of Labor",
  publicationYear: 1898,
  url: "https://fraser.stlouisfed.org/title/bulletin-united-states-bureau-labor-3943/january-1898-477567/fulltext#:~:text=The%20most%20crowded%20section",
  locator: "Bulletin nº 14, janvier 1898, p. 47–49. Observations recueillies en 1896.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

export const INDUSTRIALIZATION_HOUSING_DOCUMENTS: LearningSessionDocument[] = [
  {
    ...documentContext,
    id: "IND-HOUSING-MCDOUGALL",
    title: "Une résidence bourgeoise, rue Mackay",
    typeLabel: "Photographie d’un salon bourgeois",
    dateLabel: "1895",
    authorLabel: photographSource.creator,
    institutionLabel: "Musée McCord Stewart",
    sourceLabel: photographSource.locator,
    sourceUrls: [photographSource.url],
    rightsLabel: "Reproduction du RÉCIT sous licence CC BY-NC-ND.",
    content: {
      kind: "historical_image",
      localSrc: "/historical-documents/salon-mcdougall-1895.jpg",
      alt: "Salon de la résidence de Mme Alex McDougall, avec des fauteuils, un lustre et un foyer orné. Une grande ouverture donne sur une pièce voisine.",
      description: "Salon de la résidence de Mme Alex McDougall, rue Mackay, à Montréal, en 1895.",
    },
  },
  {
    ...documentContext,
    id: "IND-HOUSING-AMES",
    title: "Les logements d’un quartier ouvrier",
    typeLabel: "Enquête sur les logements ouvriers",
    dateLabel: "Enquête de 1896",
    authorLabel: surveySource.creator,
    institutionLabel: surveySource.publisher,
    sourceLabel: surveySource.locator,
    sourceUrls: [surveySource.url],
    rightsLabel: "Adaptation en français d’une source primaire.",
    content: {
      kind: "historical_excerpt",
      adapted: true,
      excerpt: "Dans le secteur où les logements sont les plus exigus, près de la moitié des familles vivent dans deux ou trois pièces. Dans le quartier de Griffintown, seulement un logement sur quatre dispose de toilettes à chasse d’eau. Dans l’ensemble du secteur étudié, environ la moitié des habitations dépendent entièrement de latrines extérieures.",
    },
  },
];

export const INDUSTRIALIZATION_HOUSING_QUESTION = {
  schemaVersion: 1,
  id: "question:premiere-phase-d-industrialisation:conditions-de-logement",
  scope: "notional",
  knowledgeHeadingId,
  relatedKnowledgeHeadingIds: [knowledgeHeadingId],
  referenceCardId: "reference-card:premiere-phase-d-industrialisation",
  historicalRecordId: "historical-record:premiere-phase-d-industrialisation",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Compare les conditions de logement des familles bourgeoises et des familles ouvrières à Montréal vers 1895–1896.",
  instruction: "Compare un même aspect du logement dans les deux documents.",
  expectedAnswer: "La résidence bourgeoise photographiée dispose d’un salon réservé à la détente ou aux réceptions, avec du mobilier et des décorations. Dans le secteur ouvrier où les logements sont les plus exigus, près de la moitié des familles vivent dans deux ou trois pièces pour l’ensemble du logement. Accepter toute différence liée au logement et appuyée par un détail exact de chaque document.",
  historicalDocumentIds: INDUSTRIALIZATION_HOUSING_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Décrire un seul groupe ou citer un seul document.",
    "Affirmer que tous les logements ouvriers comptent deux ou trois pièces.",
    "Supposer que la photographie montre les installations sanitaires de la résidence.",
  ],
  distractors: [],
  operationId,
  sourceIds: [photographSource.id, surveySource.id],
  sourceCatalog: [photographSource, surveySource],
  rationale: "La photographie montre une pièce dédiée dans une résidence bourgeoise. L’enquête de la même époque indique le nombre de pièces par logement dans un secteur ouvrier montréalais.",
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
