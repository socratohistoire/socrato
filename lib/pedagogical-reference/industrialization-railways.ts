import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

const knowledgeHeadingId = "premiere-phase-d-industrialisation";

const sources = [
  {
    id: "railways-1900-boundaries",
    kind: "government",
    title: "Évolution territoriale du Canada, limites de 1898",
    publisher: "Ressources naturelles Canada",
    url: "https://geoappext.nrcan.gc.ca/arcgis/rest/services/FGP/TE/MapServer/316",
    locator: "Limites territoriales utilisées pour le fond de carte du Canada en 1900.",
    verificationStatus: "verified",
  },
  {
    id: "railways-1900-historical-network",
    kind: "reference-work",
    title: "Historical Canadian Railroads",
    publisher: "University of Toronto Libraries · Borealis",
    url: "https://doi.org/10.5683/SP2/UCCFVQ",
    locator: "Tracés ferroviaires historiques, simplifiés pour la carte.",
    verificationStatus: "verified",
  },
  {
    id: "railways-1900-shared-track",
    kind: "government",
    title: "Débats de la Chambre des communes du Canada",
    publisher: "Parlement du Canada",
    url: "https://lipad.ca/full/1903/08/31/3/",
    locator: "31 août 1903, droits de passage de l’Intercolonial sur les voies du Grand Tronc jusqu’à Montréal.",
    verificationStatus: "verified",
  },
] as const satisfies readonly ReferenceSource[];

export const INDUSTRIALIZATION_RAILWAYS_QUESTION = {
  schemaVersion: 1,
  id: "question:premiere-phase-d-industrialisation:reseaux-ferroviaires-1900",
  scope: "notional",
  knowledgeHeadingId,
  relatedKnowledgeHeadingIds: [knowledgeHeadingId],
  referenceCardId: "reference-card:premiere-phase-d-industrialisation",
  historicalRecordId: "historical-record:premiere-phase-d-industrialisation",
  status: "ready-for-review",
  format: "interactive-association",
  prompt: "Sur la carte du Canada en 1900, associe chaque chemin de fer au tracé qui lui correspond.",
  instruction: "Sélectionne ou fais glisser chaque nom vers le tracé correspondant.",

  initialGuidance: "Suis chaque tracé sur la carte. Repère les villes et les régions qu’il relie.",
  expectedAnswer: "Rouge — Canadien Pacifique, qui relie Montréal à Vancouver en passant par Winnipeg et Calgary. Bleu — Grand Tronc, dont les voies relient notamment Montréal, Toronto et Windsor. Vert — Intercolonial, qui dessert Québec par Lévis et les Maritimes jusqu’à Halifax. À l’approche de Montréal, l’Intercolonial emprunte les voies du Grand Tronc à partir de Sainte-Rosalie.",
  historicalDocumentIds: [],
  commonErrors: [
    "Confondre le tracé transcontinental du Canadien Pacifique avec le Grand Tronc.",
    "Confondre les voies partagées près de Montréal avec l’ensemble du réseau de l’Intercolonial.",
  ],
  distractors: [],
  operationId: "time_and_space",
  sourceIds: sources.map(({ id }) => id),
  sourceCatalog: sources,
  rationale: "L’élève distingue les trois réseaux par l’étendue de leur tracé et par les régions et les villes qu’ils relient.",
  associationInteraction: {
    map: {
      imageUrl: "/historical-documents/industrialisation-reseaux-ferroviaires-carte.png",
      imageAlt: "Carte du Canada en 1900. Le tracé rouge relie Vancouver à Montréal par les Prairies. Le tracé bleu relie Windsor, Toronto et Montréal, puis descend vers Portland. Le tracé vert suit la rive sud du Saint-Laurent et rejoint les Maritimes, dont Halifax.",
      dropLabel: "Réseau",
    },
    items: [
      { id: "intercolonial", label: "Intercolonial" },
      { id: "canadien-pacifique", label: "Canadien Pacifique" },
      { id: "grand-tronc", label: "Grand Tronc" },
    ],
    targets: [
      { id: "trace-rouge", label: "Tracé rouge", description: "Tracé rouge de Vancouver à Montréal", correctItemId: "canadien-pacifique", zone: { x: 13, y: 76, width: 22, height: 11 } },
      { id: "trace-bleu", label: "Tracé bleu", description: "Tracé bleu de Windsor à Montréal et à Portland", correctItemId: "grand-tronc", zone: { x: 76, y: 84, width: 22, height: 9 } },
      { id: "trace-vert", label: "Tracé vert", description: "Tracé vert du Saint-Laurent aux Maritimes", correctItemId: "intercolonial", zone: { x: 76, y: 34, width: 22, height: 11 } },
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
