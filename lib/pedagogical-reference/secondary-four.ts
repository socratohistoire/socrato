import type {
  OfficialProgramSource,
  SecondaryFourKnowledgeHeading,
  SecondaryFourPeriod,
  SecondaryFourPeriodId,
} from "./types.ts";

export const SECONDARY_FOUR_PROGRAM_SOURCE: OfficialProgramSource = {
  title: "Programme de formation de l’école québécoise – Histoire du Québec et du Canada",
  publisher: "Gouvernement du Québec",
  url: "https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/secondaire/programmes/PFEQ-histoire-quebec-canada-secondaire.pdf",
  overviewPage: 44,
  synthesisPages: [73, 74],
};

const COMMON_CONCEPTS = ["Culture", "Économie", "Pouvoir", "Société", "Territoire"] as const;

const PERIOD_DEFINITIONS = [
  {
    id: "1840-1896",
    startYear: 1840,
    endYear: 1896,
    officialPeriodLabel: "1840-1896",
    officialSocialReality: "La formation du régime fédéral canadien",
    particularConcepts: ["Fédéralisme", "Industrialisation", "Migration"],
    sourcePages: [44, 45, 49, 50],
    labels: [
      "Acte d’Union",
      "Économie coloniale",
      "Gouvernement responsable",
      "Affaires indiennes",
      "Acte de l’Amérique du Nord britannique",
      "Relations fédérales-provinciales",
      "Politique nationale",
      "Migrations",
      "Rôle des femmes",
      "Présence de l’Église catholique",
      "Manifestations socioculturelles",
      "Première phase d’industrialisation",
      "Industrie forestière",
      "Exploitations agricoles",
    ],
  },
  {
    id: "1896-1945",
    startYear: 1896,
    endYear: 1945,
    officialPeriodLabel: "1896-1945",
    officialSocialReality: "Les nationalismes et l’autonomie du Canada",
    particularConcepts: ["Impérialisme", "Libéralisme", "Urbanisation"],
    sourcePages: [44, 51, 55, 56],
    labels: [
      "Statut du Canada dans l’Empire britannique",
      "Clérico-nationalisme",
      "Politique intérieure canadienne",
      "Deuxième phase d’industrialisation",
      "Milieux urbains",
      "Culture de masse",
      "Luttes des femmes",
      "Mouvement syndical",
      "Église catholique",
      "Éducation et formation technique",
      "Flux migratoires",
      "Première Guerre mondiale",
      "Grande dépression",
      "Remise en question du capitalisme",
      "Seconde Guerre mondiale",
    ],
  },
  {
    id: "1945-1980",
    startYear: 1945,
    endYear: 1980,
    officialPeriodLabel: "1945-1980",
    officialSocialReality: "La modernisation du Québec et la Révolution tranquille",
    particularConcepts: ["État-providence", "Féminisme", "Laïcisation"],
    sourcePages: [44, 57, 61, 62],
    labels: [
      "Rapports de force en Occident",
      "Agglomération urbaine",
      "Accroissement naturel",
      "Nouveaux arrivants",
      "Développement régional",
      "Fédération canadienne",
      "Pensionnats indiens au Québec",
      "Société de consommation",
      "Période duplessiste",
      "Néonationalisme",
      "Révolution tranquille",
      "Féminisme",
      "Effervescence socioculturelle",
      "Affirmation des nations autochtones",
      "Relations patronales-syndicales",
    ],
  },
  {
    id: "1980-present",
    startYear: 1980,
    endYear: null,
    officialPeriodLabel: "De 1980 à nos jours",
    officialSocialReality: "Les choix de société dans le Québec contemporain",
    particularConcepts: ["Néolibéralisme", "Société civile", "Souverainisme"],
    sourcePages: [44, 63, 67, 68],
    labels: [
      "Redéfinition du rôle de l’État",
      "Droits des Autochtones",
      "Mondialisation de l’économie",
      "Statut politique du Québec",
      "Évolution sociodémographique",
      "Égalité hommes-femmes",
      "Industrie culturelle",
      "Question linguistique",
      "Préoccupations environnementales",
      "Dévitalisation de localités",
      "Relations internationales",
      "Ère de l’information",
    ],
  },
] as const satisfies readonly {
  id: SecondaryFourPeriodId;
  startYear: number;
  endYear: number | null;
  officialPeriodLabel: string;
  officialSocialReality: string;
  particularConcepts: readonly string[];
  sourcePages: readonly number[];
  labels: readonly string[];
}[];

function canonicalId(label: string) {
  if (label === "Acte d’Union") return "acte-union";
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "-")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

let officialOrder = 0;

export const SECONDARY_FOUR_PERIODS: readonly SecondaryFourPeriod[] = PERIOD_DEFINITIONS.map(
  (period, periodIndex) => ({
    id: period.id,
    officialOrder: periodIndex + 1,
    startYear: period.startYear,
    endYear: period.endYear,
    officialPeriodLabel: period.officialPeriodLabel,
    officialSocialReality: period.officialSocialReality,
    particularConcepts: period.particularConcepts,
    commonConcepts: COMMON_CONCEPTS,
    sourcePages: period.sourcePages,
    knowledgeHeadings: period.labels.map((officialLabel, headingIndex) => ({
      id: canonicalId(officialLabel),
      officialLabel,
      officialOrder: ++officialOrder,
      orderWithinPeriod: headingIndex + 1,
      periodId: period.id,
      sourcePages: period.sourcePages,
      inventoryStatus: "verified-official" as const,
    })),
  }),
);

export const SECONDARY_FOUR_KNOWLEDGE_HEADINGS: readonly SecondaryFourKnowledgeHeading[] =
  SECONDARY_FOUR_PERIODS.flatMap(({ knowledgeHeadings }) => knowledgeHeadings);

export function getSecondaryFourPeriod(periodId: SecondaryFourPeriodId) {
  return SECONDARY_FOUR_PERIODS.find(({ id }) => id === periodId);
}

export function getSecondaryFourKnowledgeHeading(id: string) {
  return SECONDARY_FOUR_KNOWLEDGE_HEADINGS.find((heading) => heading.id === id);
}
