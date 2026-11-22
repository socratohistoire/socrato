import type { LearningSessionDocument } from "../student-learning-session/types.ts";
import { MIGRATIONS_RURAL_EXODUS_DOCUMENT } from "./migrations-spatial-causality.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

const knowledgeHeadingId = "premiere-phase-d-industrialisation";
const operationId = "causal_connections";
const rural = MIGRATIONS_RURAL_EXODUS_DOCUMENT;
const sources = [
  {
    id: "document-source:IND-ECO-MACHINES",
    kind: "other",
    title: "Des machines dans les manufactures de chaussures",
    publisher: "Industries of Canada",
    url: "https://www.electriccanadian.com/transport/industrial/industriesofcanada02.pdf",
    locator: "Industries of Canada: City of Montreal, section sur la fabrication de bottes et de chaussures.",
    verificationStatus: "verified",
  },
  {
    id: "document-source:IND-ECO-CENSUS",
    kind: "government",
    title: "L’industrie de la chaussure à Montréal en 1881",
    publisher: "Bureau du recensement du Canada",
    url: "https://bc.gbpizs.gov.pl/Content/484/1100057.pdf",
    locator: "Recensement canadien de 1880–1881, chiffres reproduits dans Labor in North America: Canada, p. 91.",
    verificationStatus: "verified",
  },
  {
    id: "document-source:IND-ECO-MAGOG",
    kind: "government",
    title: "L’usine de coton de Magog recrute au-delà du village",
    publisher: "Ville de Magog",
    url: "https://www.ville.magog.qc.ca/culture-sports-communaute/histoire-et-patrimoine/",
    locator: "Histoire et patrimoine, section « Un village? Non, une ville! ».",
    verificationStatus: "verified",
  },
  {
    id: "document-source:IND-ECO-RURAL",
    kind: "other",
    title: rural.title,
    publisher: "La Gazette des campagnes",
    url: rural.sourceUrl,
    locator: rural.sourceLocator,
    verificationStatus: "verified",
  },
] as const satisfies readonly ReferenceSource[];

const documents: Omit<LearningSessionDocument, "historicalKnowledgeIds" | "intellectualOperationIds">[] = [
  {
    id: "IND-ECO-MACHINES",
    title: sources[0].title,
    typeLabel: "Publication commerciale",
    dateLabel: "Données de 1879 à 1883",
    sourceLabel: sources[0].locator,
    sourceUrls: [sources[0].url],
    rightsLabel: "Adaptation française d’une publication d’époque.",
    editorialNote: "La publication présente les entreprises montréalaises sous un jour favorable. Les chiffres de production sont des estimations de l’époque.",
    content: {
      kind: "historical_excerpt",
      adapted: true,
      excerpt: "Les manufactures de chaussures de Montréal utilisent des machines actionnées par la vapeur. Certaines servent à coudre, d’autres à découper les semelles ou à poser les talons. La publication estime que la production de chaussures à Montréal a augmenté d’environ 50 % entre 1879 et 1882.",
    },
  },
  {
    id: "IND-ECO-CENSUS",
    title: sources[1].title,
    typeLabel: "Tableau tiré d’un recensement",
    dateLabel: "1881",
    sourceLabel: sources[1].locator,
    sourceUrls: [sources[1].url],
    rightsLabel: "Données d’époque sélectionnées et présentées en français.",
    content: {
      kind: "comparison_table",
      caption: "Fabrication de bottes et de chaussures à Montréal",
      headers: ["Indicateur", "Valeur recensée"],
      rows: [
        { label: "Établissements", value: "171" },
        { label: "Personnes employées", value: "5 439" },
        { label: "Salaires versés dans l’année", value: "1 428 225 $" },
        { label: "Valeur des biens produits dans l’année", value: "6 703 386 $" },
      ],
    },
  },
  {
    id: "IND-ECO-MAGOG",
    title: sources[2].title,
    typeLabel: "Synthèse historique",
    dateLabel: "Magog, années 1880",
    institutionLabel: sources[2].publisher,
    sourceLabel: sources[2].locator,
    sourceUrls: [sources[2].url],
    rightsLabel: "Résumé d’une synthèse patrimoniale de la Ville de Magog.",
    editorialNote: "Le texte présente le recrutement au début de l’activité de l’usine. Il résume des déplacements à l’échelle régionale.",
    content: {
      kind: "historical_excerpt",
      adapted: true,
      excerpt: "Dans les années 1880, l’usine de coton de Magog a besoin de plus de travailleurs que le village ne peut en fournir. La compagnie cherche donc des ouvriers et des ouvrières ailleurs au Québec. Des personnes viennent notamment du village de Katevale et de la Beauce pour chercher un emploi à la manufacture. Dès 1887, l’usine emploie plus de personnes que Magog ne comptait d’habitants en 1881.",
    },
  },
];

export const INDUSTRIALIZATION_ECONOMIC_DOCUMENTS: LearningSessionDocument[] = documents.map((document) => ({
  ...document,
  historicalKnowledgeIds: [knowledgeHeadingId],
  intellectualOperationIds: [operationId],
}));

export const INDUSTRIALIZATION_ECONOMIC_QUESTION = {
  schemaVersion: 1,
  id: "question:premiere-phase-d-industrialisation:developpement-economie",
  scope: "notional",
  knowledgeHeadingId,
  relatedKnowledgeHeadingIds: [knowledgeHeadingId],
  referenceCardId: "reference-card:premiere-phase-d-industrialisation",
  historicalRecordId: "historical-record:premiere-phase-d-industrialisation",
  status: "ready-for-review",
  format: "development-150",
  developmentContext: "Dans la seconde moitié du XIXe siècle, des manufactures se développent dans plusieurs villes du Québec, dont Montréal. Durant cette période, de nombreuses familles vivent encore de l’agriculture.",
  prompt: "Explique comment le développement des manufactures transforme la production et l’emploi au Québec entre 1850 et 1896.",
  instruction: [
    "Dans un texte d’environ 150 mots, appuie ton explication sur le dossier documentaire.",
    "Indique un changement dans la façon de fabriquer les biens et explique son effet sur les quantités produites.",
    "Indique une différence entre le travail à la campagne et le travail offert dans les manufactures en ville. Explique pourquoi ces emplois peuvent attirer une partie de la main-d’œuvre rurale.",
  ].join("\n"),
  initialGuidance: "Pour chaque volet, nomme un changement ou une différence, puis explique le lien avec le développement des manufactures.",
  expectedAnswer: "Les manufactures utilisent des machines, parfois actionnées par la vapeur, et répartissent la fabrication en tâches spécialisées. Dans les manufactures de chaussures, des machines distinctes cousent, découpent les semelles ou posent les talons. Répéter ces opérations à l’aide de machines permet de fabriquer plus de paires dans le même temps. À la campagne, de nombreuses familles vivent du travail agricole, dont le revenu dépend en partie des récoltes. En ville, les manufactures offrent des emplois rémunérés, comme le montre le recensement de l’industrie de la chaussure à Montréal. À Magog, la manufacture de coton recrute à l’extérieur du village pour répondre à ses besoins. La possibilité de gagner un salaire en manufacture incite des personnes de localités rurales comme Katevale à aller chercher du travail à Magog.",
  historicalDocumentIds: ["IND-ECO-MACHINES", "IND-ECO-CENSUS", rural.id, "IND-ECO-MAGOG"],
  commonErrors: [
    "Nommer une machine sans expliquer son effet sur la quantité produite.",
    "Comparer les emplois sans expliquer pourquoi les manufactures attirent une partie de la main-d’œuvre rurale.",
    "Présenter l’emploi industriel comme la seule cause de l’exode rural.",
    "Attribuer toute la hausse de la production à la mécanisation à partir des seuls chiffres du dossier.",
  ],
  distractors: [],
  operationId,
  sourceIds: sources.map(({ id }) => id),
  sourceCatalog: sources,
  rationale: "L’élève explique deux transformations économiques de la première phase d’industrialisation, l’augmentation de la capacité de production et le développement du travail salarié en ville.",
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
