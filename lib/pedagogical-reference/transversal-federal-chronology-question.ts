import type { ApprovedQuestion } from "./types.ts";
import { INDIAN_AFFAIRS_HISTORICAL_RECORD } from "./records/affaires-indiennes.ts";
import { BRITISH_NORTH_AMERICA_ACT_HISTORICAL_RECORD } from "./records/acte-amerique-nord-britannique.ts";
import { FEDERAL_PROVINCIAL_RELATIONS_HISTORICAL_RECORD } from "./records/relations-federales-provinciales.ts";

const SOURCE_IDS = [
  "cirnac-first-nations-in-canada",
  "canada-indian-act-1876",
  "aanb-dbc-brown",
  "aanb-assnat-1867",
  "rfp-canada-red-river-northwest",
  "rfp-canada-discover-history",
] as const;

const sourceIdSet = new Set<string>(SOURCE_IDS);
const TRANSVERSAL_CHRONOLOGY_SOURCES = [
  ...INDIAN_AFFAIRS_HISTORICAL_RECORD.sourceCatalog,
  ...BRITISH_NORTH_AMERICA_ACT_HISTORICAL_RECORD.sourceCatalog,
  ...FEDERAL_PROVINCIAL_RELATIONS_HISTORICAL_RECORD.sourceCatalog,
].filter(({ id }) => sourceIdSet.has(id));

const TRANSVERSAL_CHRONOLOGY_ENTRIES = [
  {
    id: "transversal-federal-timeline-bagot",
    date: "1844",
    title: "Rapport de la commission Bagot",
    description: "La commission recommande de renforcer l’administration coloniale des affaires indiennes et d’utiliser notamment l’éducation comme moyen de transformation des Premières Nations.",
    imageUrl: "/historical-documents/period-1840-1896/bagot.jpg",
    imageAlt: "Portrait de Charles Bagot, gouverneur général à l’origine de la commission sur les affaires indiennes",
    credit: "Portrait de Charles Bagot d’après Henry William Pickersgill · domaine public",
  },
  {
    id: "transversal-federal-timeline-coalition",
    date: "1864",
    title: "Formation de la Grande Coalition",
    description: "Des adversaires politiques s’allient afin de sortir de l’instabilité ministérielle et de rechercher une nouvelle solution constitutionnelle.",
    imageUrl: "/historical-documents/gr-coalition-macdonald-1863.jpg",
    imageUrls: [
      "/historical-documents/gr-coalition-macdonald-1863.jpg",
      "/historical-documents/gr-coalition-cartier-1863.jpg",
      "/historical-documents/gr-coalition-brown.jpg",
    ],
    imageAlt: "Portraits de John A. Macdonald, George-Étienne Cartier et George Brown, les trois principaux dirigeants de la Grande Coalition",
    credit: "William Notman et Hunter & Co. · Musée McCord Stewart et Bibliothèque et Archives Canada · domaine public",
  },
  {
    id: "transversal-federal-timeline-aanb",
    date: "1867",
    title: "Entrée en vigueur de l’AANB",
    description: "La loi crée le Dominion du Canada et répartit les compétences entre le Parlement fédéral et les législatures provinciales.",
    imageUrl: "/historical-documents/period-1840-1896/bna-act-1867.jpg",
    imageAlt: "Première page de l’Acte de l’Amérique du Nord britannique de 1867",
    credit: "British North America Act, 1867 · domaine public",
  },
  {
    id: "transversal-federal-timeline-red-river",
    date: "1869-1870",
    title: "Premier soulèvement des Métis",
    description: "Les Métis s’opposent au transfert de leur territoire sans consultation, forment un gouvernement provisoire et négocient avec Ottawa.",
    imageUrl: "/historical-documents/period-1840-1896/metis-1869.jpg",
    imageAlt: "Membres du gouvernement provisoire métis de la rivière Rouge",
    credit: "Gouvernement provisoire métis, 1870 · Bibliothèque et Archives Canada · domaine public",
  },
  {
    id: "transversal-federal-timeline-indian-act",
    date: "1876",
    title: "Adoption de la Loi sur les Indiens",
    description: "Le Parlement fédéral consolide des lois antérieures et étend son contrôle sur le statut, les terres, les biens et la gouvernance des Premières Nations.",
    imageUrl: "/historical-documents/indian-act-1876-first-page.jpg",
    imageAlt: "Première page de la Loi sur les Indiens de 1876, sanctionnée le 12 avril 1876",
    credit: "Loi sur les Indiens, 1876, chapitre 18 · Services aux Autochtones Canada · domaine public",
  },
  {
    id: "transversal-federal-timeline-riel",
    date: "1885",
    title: "Exécution de Louis Riel",
    description: "Après la défaite de la résistance du Nord-Ouest et son procès pour haute trahison, Louis Riel est pendu à Regina.",
    imageUrl: "/historical-documents/period-1840-1896/riel.jpg",
    imageAlt: "Portrait photographique de Louis Riel au XIXe siècle",
    credit: "Louis Riel · Bibliothèque et Archives Canada · domaine public",
  },
] as const;

export const TRANSVERSAL_FEDERAL_CHRONOLOGY_QUESTION = {
  schemaVersion: 1,
  id: "question:transversal:affaires-indiennes-aanb-relations-federales:timeline-001",
  scope: "transversal",
  knowledgeHeadingId: "acte-de-l-amerique-du-nord-britannique",
  relatedKnowledgeHeadingIds: [
    "affaires-indiennes",
    "acte-de-l-amerique-du-nord-britannique",
    "relations-federales-provinciales",
  ],
  referenceCardId: "reference-card:acte-de-l-amerique-du-nord-britannique",
  historicalRecordId: "historical-record:acte-de-l-amerique-du-nord-britannique",
  status: "ready-for-review",
  format: "interactive-timeline",
  prompt: "Replace les six événements suivants dans l’ordre chronologique, du plus ancien au plus récent.",
  instruction: "Lorsque les six cartes sont placées, vérifie tes réponses.",
  initialGuidance: "Observe les trois ensembles de repères : politiques envers les Premières Nations, formation du régime fédéral et conflits entre le gouvernement canadien et les Métis.",
  expectedAnswer: "1844 — Rapport de la commission Bagot; 1864 — Formation de la Grande Coalition; 1867 — Entrée en vigueur de l’Acte de l’Amérique du Nord britannique; 1869-1870 — Premier soulèvement des Métis; 1876 — Adoption de la Loi sur les Indiens; 1885 — Exécution de Louis Riel.",
  historicalDocumentIds: ["AI-T-005", "AANB-T-007", "RFP-T-003", "RFP-T-001", "AI-T-004", "RFP-I-001"],
  commonErrors: [
    "Placer la Loi sur les Indiens avant l’entrée en vigueur de l’AANB.",
    "Confondre le premier soulèvement des Métis de 1869-1870 avec la résistance du Nord-Ouest de 1885.",
    "Placer la Grande Coalition après la Confédération.",
    "Présenter le rapport Bagot de 1844 comme une loi fédérale adoptée après 1867.",
  ],
  distractors: [],
  operationId: "time_and_space",
  sourceIds: SOURCE_IDS,
  sourceCatalog: TRANSVERSAL_CHRONOLOGY_SOURCES,
  rationale: "La ligne du temps oblige l’élève à coordonner des repères provenant de trois notions et à distinguer les politiques coloniales antérieures à 1867 des institutions et conflits du régime fédéral.",
  timelineInteraction: {
    documentId: "TRANS-D-001",
    dates: TRANSVERSAL_CHRONOLOGY_ENTRIES.map(({ date }) => date),
    entries: TRANSVERSAL_CHRONOLOGY_ENTRIES,
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
