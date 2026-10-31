import { MIGRATIONS_QUEBEC_SETTLEMENT_INTERVENTION_DOCUMENT, MIGRATIONS_RURAL_LAND_SHORTAGE_DISTRACTOR_DOCUMENT } from "./migrations-colonization-intervention.ts";
import { MIGRATIONS_EMIGRATION_CAUSES_REPORT_DOCUMENT } from "./migrations-spatial-causality.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_DOCUMENTS = [
  MIGRATIONS_RURAL_LAND_SHORTAGE_DISTRACTOR_DOCUMENT,
  MIGRATIONS_EMIGRATION_CAUSES_REPORT_DOCUMENT,
  MIGRATIONS_QUEBEC_SETTLEMENT_INTERVENTION_DOCUMENT,
] as const;

const MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_SOURCES: ReferenceSource[] =
  MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_DOCUMENTS.map((document) => ({
    id: `document-source:${document.id}`,
    kind: document.id === MIGRATIONS_EMIGRATION_CAUSES_REPORT_DOCUMENT.id ? "government" : "reference-work",
    title: document.title,
    creator: document.creator,
    publisher: document.holdingInstitution,
    publicationYear: document.id === MIGRATIONS_RURAL_LAND_SHORTAGE_DISTRACTOR_DOCUMENT.id
      ? 1859
      : document.id === MIGRATIONS_EMIGRATION_CAUSES_REPORT_DOCUMENT.id
        ? 1849
        : 1880,
    url: document.sourceUrl,
    locator: document.sourceLocator,
    rightsNote: document.rightsStatement,
    verificationStatus: "verified",
  }));

export const MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_QUESTION = {
  schemaVersion: 1,
  id: "question:migrations:short-answer-003",
  scope: "notional",
  knowledgeHeadingId: "migrations",
  relatedKnowledgeHeadingIds: ["migrations"],
  referenceCardId: "reference-card:migrations",
  historicalRecordId: "historical-record:migrations",
  status: "ready-for-review",
  format: "short-answer",
  prompt: "Établissez un lien de causalité entre l’émigration des Canadiens français vers les États-Unis et le financement de chemins de colonisation au Québec à la fin du XIXe siècle.",
  instruction: "Présentez le phénomène de départ, le but de l’intervention et la façon dont cette intervention devait modifier les déplacements de population.",
  initialGuidance: "J’attends votre réponse…",
  expectedAnswer: "Le manque de terres agricoles accessibles, l’endettement, les mauvaises récoltes et la difficulté d’atteindre les marchés poussent des familles rurales canadiennes-françaises à émigrer vers les États-Unis. Afin de freiner ces départs, le gouvernement du Québec finance des chemins de colonisation, comme le chemin Kenogami, pour rendre de nouvelles régions plus accessibles. Ces infrastructures facilitent l’établissement de familles au Lac-Saint-Jean et offrent une destination à l’intérieur du Québec. L’intervention cherche donc à rediriger une partie de l’émigration vers des régions de colonisation québécoises et à limiter la dépopulation des campagnes canadiennes-françaises.",
  historicalDocumentIds: MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Présenter l’émigration et la colonisation comme deux phénomènes indépendants sans expliquer le lien entre eux.",
    "Nommer le manque de terres ou les mauvaises récoltes sans expliquer comment ces difficultés contribuent aux départs vers les États-Unis.",
    "Décrire le chemin de colonisation sans préciser qu’il vise à faciliter l’établissement de familles dans une nouvelle région du Québec.",
    "Inverser le lien causal en affirmant que les chemins de colonisation provoquent l’émigration vers les États-Unis.",
  ],
  distractors: [],
  operationId: "causal_connections",
  sourceIds: MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_SOURCES.map(({ id }) => id),
  sourceCatalog: MIGRATIONS_EMIGRATION_COLONIZATION_CAUSALITY_SOURCES,
  rationale: "La formulation nomme les deux faits historiques sans renvoyer à des numéros de documents. L’élève doit construire la chaîne causale : difficultés rurales et émigration vers les États-Unis, volonté de freiner les départs, financement de chemins de colonisation, puis établissement de familles dans de nouvelles régions du Québec.",
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
