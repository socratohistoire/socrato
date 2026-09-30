import type { ApprovedQuestion } from "./types.ts";
import { ACTE_UNION_HISTORICAL_RECORD } from "./records/acte-union.ts";
import { BRITISH_NORTH_AMERICA_ACT_HISTORICAL_RECORD } from "./records/acte-amerique-nord-britannique.ts";
import { INDIAN_AFFAIRS_HISTORICAL_RECORD } from "./records/affaires-indiennes.ts";
import { FEDERAL_PROVINCIAL_RELATIONS_HISTORICAL_RECORD } from "./records/relations-federales-provinciales.ts";

const sources = [ACTE_UNION_HISTORICAL_RECORD, BRITISH_NORTH_AMERICA_ACT_HISTORICAL_RECORD, INDIAN_AFFAIRS_HISTORICAL_RECORD, FEDERAL_PROVINCIAL_RELATIONS_HISTORICAL_RECORD].flatMap(record => record.sourceCatalog).filter(source =>
  source.id === "union-act-1840-official" || source.id === "aanb-dbc-coalition" || source.id === "rfp-canada-red-river-northwest" || /1876/.test(source.id));

export const CHRONOLOGY_1867_QUESTION = {
  schemaVersion: 1, id: "question:transversal:chronology-1867",
  scope: "transversal", knowledgeHeadingId: "acte-de-l-amerique-du-nord-britannique",
  relatedKnowledgeHeadingIds: ["acte-union", "acte-de-l-amerique-du-nord-britannique", "affaires-indiennes", "relations-federales-provinciales"],
  referenceCardId: "reference-card:acte-de-l-amerique-du-nord-britannique",
  historicalRecordId: "historical-record:acte-de-l-amerique-du-nord-britannique",
  status: "ready-for-review", format: "interactive-association",
  prompt: "Classe les événements suivants selon qu’ils se produisent avant ou après l’entrée en vigueur de l’Acte de l’Amérique du Nord britannique, en 1867.",
  instruction: "Place chaque événement dans la colonne « Avant 1867 » ou « Après 1867 », puis vérifie ton classement. Tu peux faire glisser les étiquettes ou les sélectionner et choisir leur colonne.",
  expectedAnswer: "Avant 1867 : adoption de l’Acte d’Union (1840) et formation de la Grande Coalition (1864). Après 1867 : adoption de la Loi sur les Indiens (1876) et résistance métisse du Nord-Ouest (1885). L’Acte d’Union est adopté en 1840 et entre en vigueur en 1841. Le repère est l’entrée en vigueur de l’AANB, le 1er juillet 1867. La résistance du Nord-Ouest ne doit pas être confondue avec celle de la rivière Rouge, en 1869-1870.",
  historicalDocumentIds: [], commonErrors: ["Confondre adoption et entrée en vigueur de l’Acte d’Union.", "Confondre la résistance du Nord-Ouest et celle de la rivière Rouge.", "Placer la Grande Coalition après la Confédération."],
  distractors: [], operationId: "time_and_space",
  sourceIds: sources.map(source => source.id), sourceCatalog: sources,
  rationale: "Situer des événements de quatre notions par rapport au repère de 1867, sans exiger la mémorisation de chaque date exacte. Le classement est corrigé par correspondance déterministe, sans IA.",
  associationInteraction: {
    items: [
      {id: "indian-act", label: "Adoption de la Loi sur les Indiens"},
      {id: "coalition", label: "Formation de la Grande Coalition"},
      {id: "northwest", label: "Résistance métisse du Nord-Ouest"},
      {id: "union", label: "Adoption de l’Acte d’Union"},
    ],
    targets: [],
    categories: [
      {id: "before", label: "Avant 1867", articleLabel: "Repère : entrée en vigueur de l’AANB", description: "Événements antérieurs au repère.", correctItemIds: ["union", "coalition"]},
      {id: "after", label: "Après 1867", articleLabel: "Repère : entrée en vigueur de l’AANB", description: "Événements postérieurs au repère.", correctItemIds: ["indian-act", "northwest"]},
    ],
    correction: "Avant 1867 : Acte d’Union — adoption en 1840; Grande Coalition — 1864. Après 1867 : Loi sur les Indiens — 1876; résistance métisse du Nord-Ouest — 1885. Attention : l’Acte d’Union entre en vigueur en 1841, après son adoption en 1840.",
  },
  review: {documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null},
} as const satisfies ApprovedQuestion;
