import type { LearningSessionDocument } from "../student-learning-session/types.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

const knowledgeHeadingId = "premiere-phase-d-industrialisation";
const operationId = "establish_facts";
const documentContext = {
  historicalKnowledgeIds: [knowledgeHeadingId],
  intellectualOperationIds: [operationId],
};

const survey = {
  id: "document-source:IND-URBANIZATION-AMES",
  kind: "museum-or-archive",
  title: "The City Below the Hill",
  creator: "Herbert Brown Ames",
  publisher: "Canadiana (numérisation)",
  publicationYear: 1897,
  url: "https://www.canadiana.ca/view/oocihm.02168",
  locator: "The City Below the Hill, 1897, p. 45–46. Enquête réalisée en 1896.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const photograph = {
  id: "document-source:IND-URBANIZATION-NOTMAN",
  kind: "museum-or-archive",
  title: "Vue de Montréal depuis la cheminée de la centrale de la Montreal Street Railway",
  creator: "Wm. Notman & Son",
  publisher: "Musée McCord Stewart",
  publicationYear: 1896,
  url: "https://ville.montreal.qc.ca/memoiresdesmontrealais/files/griffintown-1896",
  locator: "Musée McCord Stewart, VIEW-2941. Détail reproduit par Philippe Du Berger, redimensionné.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

export const INDUSTRIALIZATION_URBANIZATION_HOUSING_DOCUMENTS: LearningSessionDocument[] = [
  {
    ...documentContext,
    id: "IND-URBANIZATION-AMES",
    title: "Combien de personnes par logement?",
    typeLabel: "Extrait d’une enquête",
    dateLabel: "1897",
    authorLabel: survey.creator,
    sourceLabel: survey.locator,
    sourceUrls: [survey.url],
    rightsLabel: "Adaptation française d’une source primaire.",
    content: {
      kind: "historical_excerpt",
      adapted: true,
      excerpt: "Dans le secteur de Griffintown où les logements sont les plus serrés, une famille de cinq personnes dispose en moyenne de quatre pièces. Au cours de notre enquête, nous avons trouvé des logements où cinq à huit personnes partageaient seulement deux pièces. Dans plus de vingt familles, sept personnes vivaient dans trois pièces. Sur la rue Saint-Jacques, juste après la rue Fulford, nous avons compté 41 personnes qui se partageaient 20 pièces.",
    },
  },
  {
    ...documentContext,
    id: "IND-URBANIZATION-NOTMAN",
    title: "Le quartier ouvrier de Griffintown",
    typeLabel: "Photographie d’époque",
    dateLabel: "1896",
    authorLabel: photograph.creator,
    institutionLabel: photograph.publisher,
    sourceLabel: photograph.locator,
    sourceUrls: [
      photograph.url,
      "https://commons.wikimedia.org/wiki/File:Montr%C3%A9al_1896._Griffintown_--_Sud-Est_de_rue_de_la_Montagne..jpg",
      "https://creativecommons.org/licenses/by/2.0/",
    ],
    rightsLabel: "Reproduction sous licence CC BY 2.0.",
    content: {
      kind: "historical_image",
      localSrc: "/historical-documents/griffintown-notman-1896.jpg",
      alt: "Vue en hauteur de Griffintown en 1896. De nombreux bâtiments sont rapprochés le long des rues et dans les îlots.",
      description: "Vue de Griffintown vers le sud-est, depuis la cheminée de la centrale de tramway.",
    },
  },
];

export const INDUSTRIALIZATION_URBANIZATION_HOUSING_QUESTION = {
  schemaVersion: 1,
  id: "question:premiere-phase-d-industrialisation:urbanisation-logement-ouvrier",
  scope: "notional",
  knowledgeHeadingId,
  relatedKnowledgeHeadingIds: [knowledgeHeadingId],
  referenceCardId: "reference-card:premiere-phase-d-industrialisation",
  historicalRecordId: "historical-record:premiere-phase-d-industrialisation",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Indique une conséquence de l’urbanisation sur les conditions de logement des familles ouvrières à Montréal dans la seconde moitié du XIXᵉ siècle.",
  instruction: "Réponds en une courte phrase.",
  expectedAnswer: "Les logements ouvriers deviennent surpeuplés. Accepter une formulation équivalente qui indique que plusieurs personnes doivent vivre ensemble dans un logement qui compte peu de pièces.",
  historicalDocumentIds: INDUSTRIALIZATION_URBANIZATION_HOUSING_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Donner une cause de l’urbanisation, comme l’arrivée des familles en ville.",
    "Décrire la proximité des bâtiments sans préciser la conséquence sur le logement des familles.",
  ],
  distractors: [],
  operationId,
  sourceIds: [survey.id, photograph.id],
  sourceCatalog: [survey, photograph],
  rationale: "L’enquête fournit des exemples de surpeuplement des logements. La photographie montre le quartier de Griffintown à l’époque de l’enquête.",
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
