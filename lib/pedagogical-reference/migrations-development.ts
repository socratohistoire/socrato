import type { LearningSessionDocument } from "../student-learning-session/types.ts";
import {
  MIGRATIONS_EMIGRATION_CAUSES_REPORT_DOCUMENT as emigrationReport,
  MIGRATIONS_IRISH_FAMINE_DOCUMENT as famineEngraving,
} from "./migrations-spatial-causality.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

const knowledgeHeadingId = "migrations";
const operationId = "causal_connections";

const voyage = {
  id: "document-source:MIG-T-VOYAGE-1847",
  kind: "museum-or-archive",
  title: "Une traversée jusqu’à Grosse-Île",
  creator: "Récit attribué à Robert Whyte",
  publisher: "Coolidge & Wiley",
  publicationYear: 1848,
  url: "https://upload.wikimedia.org/wikipedia/commons/1/15/The_ocean_plague%2C_or%2C_A_voyage_to_Quebec_in_an_Irish_emigrant_vessel_%28microform%29_%28IA_cihm_43308%29.pdf#page=80",
  locator: "The Ocean Plague, entrée du 28 juillet 1847, p. 75–77.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const lemay = {
  id: "document-source:MIG-T-LEMAY",
  kind: "museum-or-archive",
  title: "Les salaires des filatures de Nouvelle-Angleterre",
  creator: "Philippe Lemay, témoignage recueilli par Louis Paré",
  publisher: "Library of Congress · New Hampshire Federal Writers’ Project",
  url: "https://tile.loc.gov/storage-services/service/mss/wpalh/wpalh-18040142/wpalh-18040142.pdf#page=2",
  locator: "The French Canadian Textile Worker, p. 2–3.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

export const MIGRATIONS_DEVELOPMENT_DOCUMENTS: LearningSessionDocument[] = [
  {
    id: "MIG-T-VOYAGE-1847",
    title: voyage.title,
    typeLabel: "Récit de voyage",
    dateLabel: "28 juillet 1847 · publié en 1848",
    authorLabel: voyage.creator,
    sourceLabel: voyage.locator,
    sourceUrls: [voyage.url],
    rightsLabel: "Passage traduit et adapté d’une source primaire du domaine public.",
    editorialNote: "La station de quarantaine de Grosse-Île est située sur le Saint-Laurent, en aval de la ville de Québec.",
    historicalKnowledgeIds: [knowledgeHeadingId],
    intellectualOperationIds: [operationId],
    content: {
      kind: "historical_excerpt",
      adapted: true,
      excerpt: "À six heures du matin, notre navire est devant la station de quarantaine de Grosse-Île. Les passagers qui peuvent se lever aident à nettoyer le bateau. Ils sont affaiblis et s’attendent à ce que les malades soient admis à l’hôpital. Les autres pensent attendre sur l’île avant d’être transportés à Québec.",
    },
  },
  {
    id: "MIG-T-LEMAY",
    title: lemay.title,
    typeLabel: "Témoignage oral",
    dateLabel: "Départ en 1864 · témoignage recueilli plusieurs décennies plus tard",
    authorLabel: lemay.creator,
    institutionLabel: "Library of Congress",
    sourceLabel: lemay.locator,
    sourceUrls: [lemay.url],
    rightsLabel: "Passages traduits et adaptés d’un témoignage de première main.",
    editorialNote: "Philippe Lemay raconte sa propre traversée de la frontière et donne son point de vue sur les raisons de l’émigration.",
    historicalKnowledgeIds: [knowledgeHeadingId],
    intellectualOperationIds: [operationId],
    content: {
      kind: "historical_excerpt",
      adapted: true,
      excerpt: "Pourquoi les gens de chez nous sont-ils partis aux États-Unis? Ils avaient besoin d’argent pour faire vivre leur famille. Les salaires des filatures les attiraient. En 1864, ma famille et moi avons quitté Saint-Éphrem-d’Upton pour Lowell, où nous avons vécu huit ans.",
    },
  },
];

const sources = [
  {
    id: `document-source:${famineEngraving.id}`,
    kind: "museum-or-archive",
    title: famineEngraving.title,
    creator: famineEngraving.creator,
    publisher: famineEngraving.holdingInstitution,
    url: famineEngraving.sourceUrl,
    locator: famineEngraving.sourceLocator,
    verificationStatus: "verified",
  },
  voyage,
  {
    id: `document-source:${emigrationReport.id}`,
    kind: "government",
    title: emigrationReport.title,
    creator: emigrationReport.creator,
    publisher: emigrationReport.holdingInstitution,
    url: emigrationReport.sourceUrl,
    locator: emigrationReport.sourceLocator,
    verificationStatus: "verified",
  },
  lemay,
] as const satisfies readonly ReferenceSource[];

export const MIGRATIONS_DEVELOPMENT_QUESTION = {
  schemaVersion: 1,
  id: "question:migrations:developpement-causes-migrations",
  scope: "notional",
  knowledgeHeadingId,
  relatedKnowledgeHeadingIds: [knowledgeHeadingId],
  referenceCardId: "reference-card:migrations",
  historicalRecordId: "historical-record:migrations",
  status: "ready-for-review",
  format: "development-150",
  developmentContext: "Au XIXᵉ siècle, des familles irlandaises traversent l’Atlantique et arrivent au Canada-Est. Pendant la même période, des familles canadiennes-françaises quittent la vallée du Saint-Laurent pour s’établir en Nouvelle-Angleterre.",
  prompt: "Explique pourquoi des familles irlandaises émigrent vers le Canada-Est et pourquoi des familles canadiennes-françaises émigrent vers la Nouvelle-Angleterre entre 1840 et 1896.",
  instruction: [
    "Dans un texte d’environ 150 mots, appuie ton explication sur le dossier documentaire.",
    "Indique une difficulté vécue par les familles en Irlande et explique comment elle les pousse à quitter leur pays.",
    "Indique une possibilité d’emploi en Nouvelle-Angleterre et explique pourquoi elle attire des familles canadiennes-françaises.",
  ].join("\n"),
  initialGuidance: "Pour chacun des deux mouvements, repère un élément qui explique pourquoi des familles se déplacent.",
  expectedAnswer: "En Irlande, la Grande Famine provoque de graves pénuries de nourriture, comme l’illustrent les funérailles à Skibbereen. Des familles qui ne peuvent plus se nourrir quittent le pays dans l’espoir de vivre dans de meilleures conditions. Le récit du voyage à Grosse-Île illustre la traversée vers le Canada-Est. En Nouvelle-Angleterre, les filatures de textile offrent des emplois salariés. Comme le rapporte Philippe Lemay, ces salaires attirent des familles canadiennes-françaises qui ont besoin d’argent pour vivre. Le rapport de 1849 permet de relier ce besoin aux difficultés de certaines familles agricoles, dont les mauvaises récoltes et l’endettement.",
  historicalDocumentIds: [famineEngraving.id, "MIG-T-VOYAGE-1847", emigrationReport.id, "MIG-T-LEMAY"],
  commonErrors: [
    "Inverser les lieux de départ et d’arrivée.",
    "Confondre la famine qui précède le départ avec les difficultés de la traversée ou de la quarantaine.",
    "Nommer les filatures sans expliquer comment un salaire aide à faire vivre une famille.",
    "Attribuer la même raison de partir à toutes les familles.",
  ],
  distractors: [],
  operationId,
  sourceIds: sources.map(({ id }) => id),
  sourceCatalog: sources,
  rationale: "L’élève explique un facteur de départ et un facteur d’attraction à partir de deux mouvements migratoires et de quatre documents complémentaires.",
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
