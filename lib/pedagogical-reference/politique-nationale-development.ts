import {
  POLITIQUE_NATIONALE_CPR_CONTRACT_DOCUMENT,
  POLITIQUE_NATIONALE_CPR_SETTLEMENT_BROCHURE_DOCUMENT,
} from "./politique-nationale-causal-links.ts";
import { POLITIQUE_NATIONALE_FREE_FARMS_GOVERNMENT_POSTER_DOCUMENT } from "./politique-nationale-government-settlement-poster.ts";
import {
  POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT,
  POLITIQUE_NATIONALE_PRAIRIE_FARMER_TARIFF_DOCUMENT,
} from "./politique-nationale-tariff-comparison.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

const knowledgeHeadingId = "politique-nationale";
const documents = [
  POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT,
  POLITIQUE_NATIONALE_PRAIRIE_FARMER_TARIFF_DOCUMENT,
  POLITIQUE_NATIONALE_CPR_CONTRACT_DOCUMENT,
  POLITIQUE_NATIONALE_CPR_SETTLEMENT_BROCHURE_DOCUMENT,
  POLITIQUE_NATIONALE_FREE_FARMS_GOVERNMENT_POSTER_DOCUMENT,
];

const sources: ReferenceSource[] = documents.map((document) => ({
  id: `document-source:${document.id}`,
  kind: document.kind === "image" ? "museum-or-archive" : document.kind === "law-or-official-text" ? "government" : "other",
  title: document.title,
  creator: document.creator,
  publisher: document.holdingInstitution,
  url: document.sourceUrl,
  locator: document.sourceLocator,
  rightsNote: document.rightsStatement,
  verificationStatus: "verified",
}));

export const POLITIQUE_NATIONALE_DEVELOPMENT_QUESTION = {
  schemaVersion: 1,
  id: "question:politique-nationale:developpement-manufactures-peuplement",
  scope: "notional",
  knowledgeHeadingId,
  relatedKnowledgeHeadingIds: [knowledgeHeadingId],
  referenceCardId: "reference-card:politique-nationale",
  historicalRecordId: "historical-record:politique-nationale",
  status: "ready-for-review",
  format: "development-150",
  developmentContext: "En 1879, le gouvernement fédéral de John A. Macdonald adopte la Politique nationale. Cette politique vise à développer l’économie canadienne et à favoriser le peuplement de l’Ouest.",
  prompt: "Explique comment la Politique nationale favorise le développement des manufactures canadiennes et le peuplement de l’Ouest entre 1879 et 1896.",
  instruction: [
    "Dans un texte d’environ 150 mots, appuie ton explication sur le dossier documentaire.",
    "Indique une mesure de la Politique nationale qui concerne les produits importés et explique comment elle favorise les manufactures canadiennes.",
    "Indique une mesure de la Politique nationale qui concerne le transport et explique comment elle facilite l’installation de familles dans l’Ouest canadien.",
  ].join("\n"),
  initialGuidance: "Pour chaque volet, repère une mesure fédérale et explique son effet.",
  expectedAnswer: "Le gouvernement fédéral impose des droits de douane plus élevés sur de nombreux produits importés. Ces droits renchérissent les produits étrangers, ce qui réduit la concurrence pour les fabricants canadiens et facilite la vente de leurs produits au Canada. Tilley cite notamment les machines agricoles vendues au Manitoba. Le gouvernement finance aussi la construction du chemin de fer transcontinental et accorde des terres au Canadien Pacifique. Le train rend les Prairies plus accessibles aux familles et facilite le transport de leur matériel. Les familles établies près d’une gare peuvent ensuite expédier leurs récoltes vers les marchés à moindre coût, ce qui rend l’installation agricole plus attrayante. La brochure de 1892 illustre cet avantage. Les concessions de terres peuvent compléter l’explication lorsqu’elles sont reliées à l’accès ferroviaire.",
  historicalDocumentIds: documents.map(({ id }) => id),
  commonErrors: [
    "Confondre les droits sur les importations avec une taxe sur les produits fabriqués au Canada.",
    "Indiquer une mesure sans expliquer son effet sur les manufactures ou sur l’installation des familles.",
    "Expliquer le peuplement uniquement par les concessions de terres, sans établir le rôle du chemin de fer.",
    "Présenter l’Ouest comme un territoire inhabité avant l’arrivée des colons.",
  ],
  distractors: [],
  operationId: "causal_connections",
  sourceIds: sources.map(({ id }) => id),
  sourceCatalog: sources,
  rationale: "Le discours de Tilley et la critique de Laurier éclairent les effets du tarif selon les groupes concernés. Le contrat ferroviaire, la brochure et l’affiche documentent le soutien public au rail et son rôle dans l’établissement agricole.",
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
