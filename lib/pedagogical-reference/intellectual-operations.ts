import type { IntellectualOperationId } from "./types.ts";

export type IntellectualOperationSourceId = "official-program" | "evaluation-framework" | "ministerial-exam-2025-2026" | "assessment-tools-2025-2026";

export interface IntellectualOperationSource {
  id: IntellectualOperationSourceId;
  title: string;
  publisher: "Gouvernement du Québec";
  url: string;
  locator: string;
}

export interface IntellectualOperationDefinition {
  id: IntellectualOperationId;
  officialOrder: number;
  officialLabel: string;
  conciseDescription: string;
  expectedBehaviors: readonly string[];
  sourceIds: readonly IntellectualOperationSourceId[];
  detailedInMinisterialExamSectionA2025_2026: boolean;
}

export const INTELLECTUAL_OPERATION_SOURCES: readonly IntellectualOperationSource[] = [
  {
    id: "official-program",
    title: "Programme de formation de l’école québécoise – Histoire du Québec et du Canada",
    publisher: "Gouvernement du Québec",
    url: "https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/secondaire/programmes/PFEQ-histoire-quebec-canada-secondaire.pdf",
    locator: "Compétence 1 et ses composantes, p. 12 du programme (page 16 du PDF)",
  },
  {
    id: "evaluation-framework",
    title: "Cadre d’évaluation des apprentissages – Histoire du Québec et du Canada",
    publisher: "Gouvernement du Québec",
    url: "https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/cadres-evaluation/secondaire/francais/PFEQ-cadre-evaluation-histoire-quebec-canada-secondaire.pdf",
    locator: "Annexe – Éléments favorisant la compréhension des critères, p. 3",
  },
  {
    id: "ministerial-exam-2025-2026",
    title: "Document d’information – Histoire du Québec et du Canada, 4e année du secondaire",
    publisher: "Gouvernement du Québec",
    url: "https://cdn-contenu.quebec.ca/cdn-contenu/education/evaluation-epreuves-ministerielles/documents-information/DI_HQC_4e_sec.pdf",
    locator: "Section 1.1.1, p. 7-8 du document (pages 6-7 du PDF), année scolaire 2025-2026",
  },
  {
    id: "assessment-tools-2025-2026",
    title: "Précisions sur les outils d’évaluation – Histoire du Québec et du Canada",
    publisher: "Gouvernement du Québec",
    url: "https://cdn-contenu.quebec.ca/cdn-contenu/education/evaluation-epreuves-ministerielles/documents-information/HQC_Precisions_outils_evaluation.pdf",
    locator: "Section 1.1, p. 5-8, version 2025-2026",
  },
];

export const INTELLECTUAL_OPERATIONS: readonly IntellectualOperationDefinition[] = [
  {
    id: "time_and_space",
    officialOrder: 1,
    officialLabel: "Situer dans le temps et dans l’espace",
    conciseDescription: "Ordonner ou situer des faits à l’aide de repères temporels et géographiques.",
    expectedBehaviors: [
      "Ordonner chronologiquement des faits en tenant compte de repères de temps.",
      "Situer des faits sur une ligne du temps.",
      "Classer des faits selon qu’ils sont antérieurs ou postérieurs à un repère de temps.",
      "Identifier sur une carte l’élément géographique, le fait ou le territoire demandé.",
    ],
    sourceIds: ["evaluation-framework", "ministerial-exam-2025-2026", "assessment-tools-2025-2026"],
    detailedInMinisterialExamSectionA2025_2026: true,
  },
  {
    id: "establish_facts",
    officialOrder: 2,
    officialLabel: "Établir des faits",
    conciseDescription: "Relever les faits historiques qui permettent de décrire la réalité étudiée.",
    expectedBehaviors: [
      "Retracer des événements.",
      "Considérer les aspects de société.",
      "Identifier des acteurs historiques et des témoins.",
      "Relever des actions et des paroles.",
    ],
    sourceIds: ["official-program", "evaluation-framework"],
    detailedInMinisterialExamSectionA2025_2026: false,
  },
  {
    id: "differences_and_similarities",
    officialOrder: 3,
    officialLabel: "Dégager des différences et des similitudes",
    conciseDescription: "Comparer des objets, des points de vue ou des interprétations historiques.",
    expectedBehaviors: [
      "Indiquer ce qui est différent par rapport à un ou plusieurs objets de comparaison.",
      "Indiquer ce qui est semblable par rapport à un ou plusieurs objets de comparaison.",
      "Indiquer le point précis de divergence entre des acteurs ou des historiens.",
      "Indiquer le point précis de convergence entre des acteurs ou des historiens.",
      "Montrer des différences et des similitudes entre des points de vue d’acteurs ou des interprétations d’historiens.",
    ],
    sourceIds: ["evaluation-framework", "ministerial-exam-2025-2026", "assessment-tools-2025-2026"],
    detailedInMinisterialExamSectionA2025_2026: true,
  },
  {
    id: "causes_and_consequences",
    officialOrder: 4,
    officialLabel: "Déterminer des causes et des conséquences",
    conciseDescription: "Identifier un facteur qui explique une réalité historique ou un fait qui en découle.",
    expectedBehaviors: [
      "Indiquer un facteur explicatif, soit un fait qui explique une réalité historique.",
      "Indiquer un fait qui découle d’une réalité historique.",
    ],
    sourceIds: ["evaluation-framework", "ministerial-exam-2025-2026", "assessment-tools-2025-2026"],
    detailedInMinisterialExamSectionA2025_2026: true,
  },
  {
    id: "changes_and_continuities",
    officialOrder: 5,
    officialLabel: "Déterminer des changements et des continuités",
    conciseDescription: "Montrer, à l’aide de faits, ce qui se transforme ou ce qui se maintient.",
    expectedBehaviors: [
      "Indiquer un fait qui montre qu’une réalité historique se transforme.",
      "Indiquer un fait qui montre qu’une réalité historique se maintient.",
      "Montrer qu’une réalité historique se transforme ou se maintient.",
    ],
    sourceIds: ["evaluation-framework", "ministerial-exam-2025-2026", "assessment-tools-2025-2026"],
    detailedInMinisterialExamSectionA2025_2026: true,
  },
  {
    id: "relationships_between_facts",
    officialOrder: 6,
    officialLabel: "Mettre en relation des faits",
    conciseDescription: "Associer des faits aux manifestations ou aux descriptions qui leur sont apparentées.",
    expectedBehaviors: [
      "Associer des faits à des manifestations ou à des descriptions qui leur sont apparentées; ces faits peuvent notamment être des actions, des événements, des mesures, des idéologies ou des activités économiques.",
    ],
    sourceIds: ["evaluation-framework", "ministerial-exam-2025-2026", "assessment-tools-2025-2026"],
    detailedInMinisterialExamSectionA2025_2026: true,
  },
  {
    id: "causal_connections",
    officialOrder: 7,
    officialLabel: "Établir des liens de causalité",
    conciseDescription: "Exprimer l’enchaînement logique qui existe entre plusieurs faits.",
    expectedBehaviors: [
      "Exprimer un enchaînement logique qui existe entre des faits.",
    ],
    sourceIds: ["evaluation-framework", "ministerial-exam-2025-2026", "assessment-tools-2025-2026"],
    detailedInMinisterialExamSectionA2025_2026: true,
  },
];

export const INTELLECTUAL_OPERATION_IDS: readonly IntellectualOperationId[] = INTELLECTUAL_OPERATIONS.map(({ id }) => id);

export function getIntellectualOperation(id: IntellectualOperationId): IntellectualOperationDefinition {
  const operation = INTELLECTUAL_OPERATIONS.find((candidate) => candidate.id === id);
  if (!operation) throw new Error(`Opération intellectuelle inconnue : ${id}`);
  return operation;
}
