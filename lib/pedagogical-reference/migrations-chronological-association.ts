import type { ApprovedQuestion } from "./types.ts";
import { MIGRATIONS_HISTORICAL_RECORD } from "./records/migrations.ts";

const MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_SOURCE_IDS = new Set([
  "pfeq-hqc-2017",
  "parks-grosse-ile-1847",
  "statcan-measuring-emigration-2018",
  "buies-saguenay-colonisation-1880",
  "dbc-labelle-colonisation",
]);

const MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_SOURCES =
  MIGRATIONS_HISTORICAL_RECORD.sourceCatalog.filter(({ id }) =>
    MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_SOURCE_IDS.has(id),
  );

export const MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_QUESTION = {
  schemaVersion: 1,
  id: "question:migrations:interactive-association-002",
  scope: "notional",
  knowledgeHeadingId: "migrations",
  relatedKnowledgeHeadingIds: ["migrations"],
  referenceCardId: "reference-card:migrations",
  historicalRecordId: "historical-record:migrations",
  status: "ready-for-review",
  format: "interactive-association",
  prompt: "Associez chaque mouvement de population au repère temporel où il prend de l’importance au Québec entre 1840 et 1896.",
  instruction: "Sélectionnez ou faites glisser chaque mouvement vers le bon repère. Les périodes indiquent un moment marquant du phénomène, et non ses dates exactes de début et de fin.",
  initialGuidance: "J’attends vos associations…",
  expectedAnswer: "Vers 1847 — arrivée massive d’immigrants irlandais au Canada; des années 1850 aux années 1870 — émigration canadienne-française vers la Nouvelle-Angleterre; des années 1880 aux années 1890 — intensification de la colonisation de nouvelles régions du Québec.",
  historicalDocumentIds: [],
  commonErrors: [
    "Présenter 1847 comme le début de toute immigration transatlantique plutôt que comme une année exceptionnelle de l’immigration irlandaise.",
    "Limiter l’émigration vers la Nouvelle-Angleterre à une seule année alors qu’elle s’étend sur plusieurs décennies.",
    "Confondre l’ouverture de régions de colonisation au Québec avec la colonisation de l’Ouest canadien.",
    "Interpréter les repères proposés comme des dates exactes de commencement et de fin.",
  ],
  distractors: [],
  operationId: "time_and_space",
  sourceIds: MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_SOURCES.map(({ id }) => id),
  sourceCatalog: MIGRATIONS_CHRONOLOGICAL_ASSOCIATION_SOURCES,
  rationale: "Les trois repères sont volontairement larges afin de faire situer des mouvements qui se déroulent sur plusieurs années. L’année 1847 sert de jalon à l’arrivée massive d’Irlandais; les décennies 1850 à 1870 permettent de situer la montée de l’émigration canadienne-française vers la Nouvelle-Angleterre; les décennies 1880 à 1890 correspondent à une intensification des interventions de colonisation dans de nouvelles régions du Québec.",
  associationInteraction: {
    items: [
      { id: "irish-immigration", label: "Arrivée massive d’immigrants irlandais au Canada" },
      { id: "new-england-emigration", label: "Émigration canadienne-française vers la Nouvelle-Angleterre" },
      { id: "quebec-colonization", label: "Intensification de la colonisation de nouvelles régions du Québec" },
    ],
    targets: [
      { id: "period-1847", label: "Vers 1847", description: "Vers 1847", correctItemId: "irish-immigration" },
      { id: "period-1850-1870", label: "Années 1850 à 1870", description: "Années 1850 à 1870", correctItemId: "new-england-emigration" },
      { id: "period-1880-1890", label: "Années 1880 à 1890", description: "Années 1880 à 1890", correctItemId: "quebec-colonization" },
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
