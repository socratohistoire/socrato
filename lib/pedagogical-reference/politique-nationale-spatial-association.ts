import { NATIONAL_POLICY_HISTORICAL_RECORD } from "./records/politique-nationale.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const POLITIQUE_NATIONALE_1882_INTERACTIVE_MAP_SOURCE = {
  id: "nrcan-territorial-evolution-1882",
  kind: "government",
  title: "Évolution territoriale, 1882",
  creator: "Ressources naturelles Canada",
  publisher: "Gouvernement du Canada",
  url: "https://geoappext.nrcan.gc.ca/arcgis/rest/services/FGP/ET/MapServer/366",
  locator: "Service cartographique Évolution territoriale de 1867 à 2017, couche ET1882. La carte utilisée par Socrato conserve les limites, les couleurs et les noms géographiques de la reconstitution officielle.",
  rightsNote: "Reconstitution cartographique officielle diffusée sous la Licence du gouvernement ouvert — Canada.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const sourceIds = [
  "pfeq-hqc-2017",
  "parks-lachine-industrialisation",
  "parks-rogers-engineering",
  "ircc-dominion-lands-act",
] as const;

const historicalSources = NATIONAL_POLICY_HISTORICAL_RECORD.sourceCatalog.filter(({ id }) => sourceIds.includes(id as typeof sourceIds[number]));

export const POLITIQUE_NATIONALE_SPATIAL_ASSOCIATION_QUESTION = {
  schemaVersion: 1,
  id: "question:politique-nationale:interactive-association-001",
  scope: "notional",
  knowledgeHeadingId: "politique-nationale",
  relatedKnowledgeHeadingIds: ["politique-nationale"],
  referenceCardId: "reference-card:politique-nationale",
  historicalRecordId: NATIONAL_POLICY_HISTORICAL_RECORD.id,
  status: "ready-for-review",
  format: "interactive-association",
  prompt: "En 1882, les mesures de la Politique nationale visent différents espaces du Canada. Place chaque mesure au bon endroit sur la carte.",
  instruction: "Sélectionne une mesure, puis dépose-la dans la zone qui correspond le mieux : le Québec et l’Ontario, les Prairies ou l’axe transcontinental.",
  initialGuidance: "J’attends que tu places les trois mesures au bon endroit sur la carte.",
  expectedAnswer: "Tarifs douaniers protecteurs — Québec et Ontario, où se concentre une grande partie des manufactures; attribution de terres aux colons — Prairies, surtout le Manitoba et les districts méridionaux des Territoires du Nord-Ouest; chemin de fer transcontinental — axe est-ouest reliant le centre du Canada, les Prairies et la Colombie-Britannique.",
  historicalDocumentIds: [],
  commonErrors: [
    "Associer les tarifs douaniers uniquement aux Prairies plutôt qu’aux principaux centres manufacturiers du Québec et de l’Ontario.",
    "Limiter le chemin de fer transcontinental à une seule province au lieu de reconnaître un axe est-ouest.",
    "Placer l’attribution de terres aux colons dans l’Est plutôt que dans les Prairies.",
  ],
  distractors: [],
  operationId: "time_and_space",
  sourceIds: [...sourceIds, POLITIQUE_NATIONALE_1882_INTERACTIVE_MAP_SOURCE.id],
  sourceCatalog: [...historicalSources, POLITIQUE_NATIONALE_1882_INTERACTIVE_MAP_SOURCE],
  rationale: "L’élève doit traduire trois mesures de la Politique nationale en repères spatiaux complémentaires : le centre manufacturier du Québec et de l’Ontario, les terres agricoles des Prairies et l’axe ferroviaire reliant l’Est au Pacifique. La carte de 1882 correspond au début de la construction du Canadien Pacifique et montre les districts occidentaux visés par la colonisation.",
  associationInteraction: {
    map: {
      imageUrl: "/historical-documents/politique-nationale-carte-1882-interactive.png",
      imageAlt: "Carte du Canada en 1882 montrant le Québec, l’Ontario, le Manitoba, les districts des Territoires du Nord-Ouest et la Colombie-Britannique.",
      dropLabel: "Mesure",
    },
    items: [
      { id: "pn-space-settlement", label: "Attribution de terres aux colons" },
      { id: "pn-space-tariffs", label: "Tarifs douaniers protecteurs" },
      { id: "pn-space-railway", label: "Chemin de fer" },
    ],
    targets: [
      {
        id: "pn-map-zone-prairies",
        label: "Prairies",
        description: "Manitoba et districts méridionaux des Territoires du Nord-Ouest",
        correctItemId: "pn-space-settlement",
        zone: { x: 28, y: 39, width: 18, height: 13 },
      },
      {
        id: "pn-map-zone-east",
        label: "Québec–Ontario",
        description: "Principaux centres manufacturiers du Canada",
        correctItemId: "pn-space-tariffs",
        zone: { x: 68, y: 40, width: 16, height: 13 },
      },
      {
        id: "pn-map-zone-railway",
        label: "Axe transcontinental",
        description: "Corridor est-ouest jusqu’à la Colombie-Britannique",
        correctItemId: "pn-space-railway",
        zone: { x: 5, y: 87, width: 72, height: 9 },
      },
    ],
  },
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
