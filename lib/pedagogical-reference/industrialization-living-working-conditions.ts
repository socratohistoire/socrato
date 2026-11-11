import type { LearningSessionDocument } from "../student-learning-session/types.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

const knowledgeHeadingId = "premiere-phase-d-industrialisation";
const operationId = "causes_and_consequences";
const documentContext = {
  historicalKnowledgeIds: [knowledgeHeadingId],
  intellectualOperationIds: [operationId],
};

const hudonSource = {
  id: "document-source:IND-I-005",
  kind: "museum-or-archive",
  title: "La filature de coton Victor Hudon",
  publisher: "Centre des mémoires montréalaises",
  publicationYear: 1874,
  url: "https://ville.montreal.qc.ca/memoiresdesmontrealais/files/filature-hudon-0",
  locator: "Canadian Illustrated News, 28 février 1874, p. 132. Gravure recadrée.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const housingSource = {
  id: "document-source:IND-T-005",
  kind: "government",
  title: "Le logement des ouvriers dans les villes industrielles",
  publisher: "Commission royale sur les relations du travail avec le capital au Canada",
  publicationYear: 1889,
  url: "https://publications.gc.ca/collections/collection_2014/bcp-pco/CP32-146-1889-2-eng.pdf#page=39",
  locator: "Rapport de la Commission royale, 1889, section « Land and Rents », p. 115–116.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const lavoieSource = {
  id: "document-source:IND-T-003",
  kind: "government",
  title: "Témoignage d’Adèle Lavoie",
  creator: "Adèle Lavoie",
  publisher: "Commission royale sur les relations du travail avec le capital au Canada",
  publicationYear: 1889,
  url: "https://documents.recitus.qc.ca/dossiers/document/contexte-temoignage-d-adele-lavoie",
  locator: "Témoignage du 16 février 1888. Rapport de la Commission royale, 1889, partie I, Témoignages – Québec, p. 311–313. Transcription diffusée par le RÉCIT.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const bridgeSource = {
  id: "document-source:IND-T-004",
  kind: "other",
  title: "La construction du pont Victoria",
  creator: "James Hodges",
  publisher: "Day & Son",
  publicationYear: 1860,
  url: "https://www.e-rara.ch/download/pdf/16041391.pdf",
  locator: "James Hodges, Construction of the Great Victoria Bridge in Canada, Londres, 1860, p. 79.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

export const INDUSTRIALIZATION_LIVING_WORKING_CONDITIONS_DOCUMENTS: LearningSessionDocument[] = [
  {
    ...documentContext,
    id: "IND-I-005",
    title: hudonSource.title,
    typeLabel: "Gravure",
    dateLabel: "1874",
    institutionLabel: "Canadian Illustrated News",
    sourceLabel: hudonSource.locator,
    sourceUrls: [hudonSource.url],
    rightsLabel: "Gravure du XIXᵉ siècle, domaine public.",
    content: {
      kind: "historical_image",
      localSrc: "/historical-documents/industrialisation-filature-hudon-1874.jpg",
      alt: "Grande filature de plusieurs étages et haute cheminée dans le quartier d’Hochelaga.",
      description: "La gravure montre les bâtiments de la filature de coton Hudon à Hochelaga.",
    },
  },
  {
    ...documentContext,
    id: "IND-T-003",
    title: lavoieSource.title,
    typeLabel: "Témoignage",
    dateLabel: "1888",
    authorLabel: lavoieSource.creator,
    sourceLabel: lavoieSource.locator,
    sourceUrls: [lavoieSource.url],
    rightsLabel: "Témoignage du XIXᵉ siècle, domaine public.",
    content: {
      kind: "historical_excerpt",
      excerpt: "Dans mon atelier à la manufacture de coton, des enfants transportent les fils et les boîtes. […] La journée commence à six heures et demie du matin. Nous finissons à six heures et quart le soir, ou à sept heures et quart les jours où nous devons rester plus tard. Ces jours-là, nous n’avons pas de pause supplémentaire, et partir avant la fin peut nous faire renvoyer.",
      adapted: true,
    },
    editorialNote: "Témoignage adapté à partir des réponses d’Adèle Lavoie. Les crochets […] indiquent un passage retranché.",
  },
  {
    ...documentContext,
    id: "IND-T-005",
    title: housingSource.title,
    typeLabel: "Rapport d’enquête",
    dateLabel: "1889",
    institutionLabel: housingSource.publisher,
    sourceLabel: housingSource.locator,
    sourceUrls: [housingSource.url],
    rightsLabel: "Rapport du XIXᵉ siècle, domaine public.",
    content: {
      kind: "historical_excerpt",
      excerpt: "Ces dernières années, les dépenses de logement des ouvriers ont augmenté, surtout dans les grandes villes. Les travailleurs se concentrent dans les centres industriels. Le prix des terrains monte et les loyers augmentent à leur tour. […] À Montréal, le loyer représente environ le quart du revenu et, dans la ville de Québec, le cinquième.",
      adapted: true,
    },
    editorialNote: "Extrait traduit et adapté de l’anglais. Les crochets […] signalent des passages retranchés.",
  },
  {
    ...documentContext,
    id: "IND-T-004",
    title: bridgeSource.title,
    typeLabel: "Ouvrage d’ingénierie",
    dateLabel: "1860",
    authorLabel: bridgeSource.creator,
    sourceLabel: bridgeSource.locator,
    sourceUrls: [bridgeSource.url],
    rightsLabel: "Ouvrage du XIXᵉ siècle, domaine public.",
    content: {
      kind: "historical_excerpt",
      excerpt: "Le pont compte 25 travées. Vingt-quatre mesurent de 242 à 247 pieds, tandis que la travée centrale, réservée à la navigation, mesure 330 pieds. Au centre, le pont s’élève à 60 pieds au-dessus de l’eau. À ses extrémités, il s’élève à 36 pieds au-dessus de l’eau.",
      adapted: true,
    },
    editorialNote: "Passage traduit et adapté de l’anglais.",
  },
];

const sources = [hudonSource, lavoieSource, housingSource, bridgeSource];

export const INDUSTRIALIZATION_LIVING_WORKING_CONDITIONS_QUESTION = {
  schemaVersion: 1,
  id: "question:premiere-phase-d-industrialisation:conditions-vie-travail",
  scope: "notional",
  knowledgeHeadingId,
  relatedKnowledgeHeadingIds: [knowledgeHeadingId],
  referenceCardId: "reference-card:premiere-phase-d-industrialisation",
  historicalRecordId: "historical-record:premiere-phase-d-industrialisation",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Décrivez deux conséquences de la première phase d’industrialisation sur les conditions de vie et de travail de la population du Québec entre 1850 et 1896.",
  instruction: "Décrivez une conséquence sur les conditions de vie et une autre sur les conditions de travail.",
  expectedAnswer: [
    "Conditions de vie : la concentration des travailleurs dans les centres industriels fait monter le prix des terrains et des loyers, ce qui rend le logement plus coûteux pour les familles ouvrières. Le rapport indique qu’à Montréal, le loyer représente environ le quart du revenu et qu’à Québec, il en représente environ le cinquième. Une description claire de la hausse des loyers ou du poids du logement dans le budget des ouvriers suffit.",
    "Conditions de travail : le travail en manufacture impose de longues journées à horaire fixe, comme le montre Adèle Lavoie, dont la journée commence à 6 h 30 et peut se terminer à 19 h 15. Accepter également le recours au travail des enfants pour des tâches de manutention, illustré par le transport des fils et des boîtes, ou la discipline d’usine illustrée par la menace de renvoi.",
    "Évaluer une conséquence dans chaque catégorie. L’élève peut répondre sans citer de document ni indiquer lequel écarter.",
  ].join(" "),
  historicalDocumentIds: INDUSTRIALIZATION_LIVING_WORKING_CONDITIONS_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Donner deux conséquences sur le travail et oublier les conditions de vie.",
    "Énumérer les caractéristiques du pont Victoria sans décrire leurs effets sur la population.",
    "Confondre le quart du revenu consacré au loyer à Montréal avec une hausse des loyers de 25 %.",
  ],
  distractors: [],
  operationId,
  sourceIds: sources.map(({ id }) => id),
  sourceCatalog: sources,
  rationale: "Le rapport d’enquête relie la concentration des travailleurs dans les centres industriels à la hausse des loyers, tandis que le témoignage documente le quotidien en manufacture. La gravure situe l’ampleur de la production textile. L’ouvrage sur le pont décrit un ouvrage de la même époque et laisse l’élève sélectionner les indices pertinents.",
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
