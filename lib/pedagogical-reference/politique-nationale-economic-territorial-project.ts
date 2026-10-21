import { POLITIQUE_NATIONALE_CPR_CONTRACT_DOCUMENT, POLITIQUE_NATIONALE_CPR_SETTLEMENT_BROCHURE_DOCUMENT } from "./politique-nationale-causal-links.ts";
import { POLITIQUE_NATIONALE_BUSINESS_FAILURES_DOCUMENT } from "./politique-nationale-crisis-manifestations.ts";
import { POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT } from "./politique-nationale-tariff-comparison.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_DOCUMENTS = [
  POLITIQUE_NATIONALE_BUSINESS_FAILURES_DOCUMENT,
  POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT,
  POLITIQUE_NATIONALE_CPR_CONTRACT_DOCUMENT,
  POLITIQUE_NATIONALE_CPR_SETTLEMENT_BROCHURE_DOCUMENT,
] as const;

const POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_SOURCES: ReferenceSource[] =
  POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_DOCUMENTS.map((document) => ({
    id: `document-source:${document.id}`,
    kind: document.id === POLITIQUE_NATIONALE_BUSINESS_FAILURES_DOCUMENT.id || document.id === POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT.id
      ? "government" as const
      : "museum-or-archive" as const,
    title: document.title,
    creator: document.creator,
    publisher: document.holdingInstitution,
    publicationYear: document.id === POLITIQUE_NATIONALE_BUSINESS_FAILURES_DOCUMENT.id
      ? 1887
      : document.id === POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT.id || document.id === POLITIQUE_NATIONALE_CPR_CONTRACT_DOCUMENT.id
        ? 1881
        : 1892,
    url: document.sourceUrl,
    locator: document.sourceLocator,
    rightsNote: document.rightsStatement,
    verificationStatus: "verified" as const,
  }));

export const POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_QUESTION = {
  schemaVersion: 1,
  id: "question:politique-nationale:document-interpretation-008",
  scope: "notional",
  knowledgeHeadingId: "politique-nationale",
  relatedKnowledgeHeadingIds: ["politique-nationale"],
  referenceCardId: "reference-card:politique-nationale",
  historicalRecordId: "historical-record:politique-nationale",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Explique comment la crise de 1873, le tarif protecteur, le Canadien Pacifique et la colonisation de l’Ouest forment un même projet économique et territorial.",
  instruction: "À l’aide des quatre documents, construis une explication qui relie les quatre éléments. Montre comment les mesures économiques répondent à la crise et comment le chemin de fer ainsi que la colonisation contribuent à intégrer l’Ouest au reste du Canada.",
  initialGuidance: "J’attends ta réponse…",
  expectedAnswer: "La crise commencée en 1873 entraîne d’importantes difficultés économiques, comme l’indiquent les montants élevés associés aux faillites commerciales durant la seconde moitié des années 1870. Le gouvernement adopte alors un tarif protecteur afin de limiter la concurrence étrangère, de stimuler les manufactures canadiennes et de leur réserver une plus grande part du marché intérieur. Il soutient aussi le Canadien Pacifique au moyen de 25 millions de dollars et de 25 millions d’acres de terre afin de construire une liaison transcontinentale. Le chemin de fer facilite ensuite l’établissement de colons dans l’Ouest et le transport des personnes, du matériel et des récoltes. La population colonisatrice devient à la fois productrice de denrées agricoles et consommatrice de machines ainsi que de produits manufacturés de l’Est. Ces mesures forment donc un même projet économique, qui développe la production et les échanges à l’intérieur du Canada, et territorial, qui favorise la colonisation de l’Ouest et relie cette région au reste du pays.",
  historicalDocumentIds: POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Énumérer les quatre éléments sans expliquer les liens qui les unissent.",
    "Présenter le tarif protecteur comme une interdiction complète des produits étrangers.",
    "Oublier que le gouvernement soutient la construction du Canadien Pacifique par de l’argent et des terres.",
    "Présenter le chemin de fer uniquement comme un moyen de transport sans le relier au marché intérieur et à la colonisation.",
    "Affirmer que l’Ouest est inhabité avant l’arrivée des colons encouragés par le gouvernement et la compagnie ferroviaire.",
  ],
  distractors: [],
  operationId: "causal_connections",
  sourceIds: POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_SOURCES.map(({ id }) => id),
  sourceCatalog: POLITIQUE_NATIONALE_ECONOMIC_TERRITORIAL_PROJECT_SOURCES,
  rationale: "Les quatre documents permettent de reconstruire la logique d’ensemble de la Politique nationale : les difficultés économiques justifient l’intervention; le tarif protège la production canadienne; l’aide publique rend possible le chemin de fer; le rail et les terres favorisent la colonisation, l’intégration territoriale et l’agrandissement du marché intérieur.",
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
