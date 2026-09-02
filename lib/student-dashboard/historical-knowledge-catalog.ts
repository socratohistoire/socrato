export type CanonicalHistoricalKnowledge = {
  id: string;
  notionId: string;
  label: string;
};

export type HistoricalKnowledgeCatalog = Readonly<
  Record<string, readonly CanonicalHistoricalKnowledge[]>
>;

export const ACTE_UNION_NOTION_ID = "acte-union";

export const ACTE_UNION_HISTORICAL_KNOWLEDGE = [
  {
    id: "rebellions-1837-1838",
    notionId: ACTE_UNION_NOTION_ID,
    label: "Rébellions de 1837-1838",
  },
  {
    id: "contexte-acte-union",
    notionId: ACTE_UNION_NOTION_ID,
    label: "Contexte de l’Acte d’union",
  },
  {
    id: "causes-acte-union",
    notionId: ACTE_UNION_NOTION_ID,
    label: "Causes de l’Acte d’union",
  },
  {
    id: "objectifs-acte-union",
    notionId: ACTE_UNION_NOTION_ID,
    label: "Objectifs de l’Acte d’union",
  },
  {
    id: "rapport-durham",
    notionId: ACTE_UNION_NOTION_ID,
    label: "Rapport Durham",
  },
  {
    id: "acte-union",
    notionId: ACTE_UNION_NOTION_ID,
    label: "Acte d’union",
  },
  {
    id: "gouvernement-responsable",
    notionId: ACTE_UNION_NOTION_ID,
    label: "Gouvernement responsable",
  },
  {
    id: "creation-province-canada",
    notionId: ACTE_UNION_NOTION_ID,
    label:
      "Création de la Province du Canada (union du Haut-Canada et du Bas-Canada)",
  },
  {
    id: "populations-bas-canada-haut-canada",
    notionId: ACTE_UNION_NOTION_ID,
    label: "Populations du Bas-Canada et du Haut-Canada",
  },
  {
    id: "representation-egale-deux-canadas",
    notionId: ACTE_UNION_NOTION_ID,
    label: "Représentation égale des deux Canadas",
  },
  {
    id: "structure-institutions-politiques",
    notionId: ACTE_UNION_NOTION_ID,
    label: "Structure des institutions politiques",
  },
  {
    id: "anglais-langue-officielle",
    notionId: ACTE_UNION_NOTION_ID,
    label: "L’anglais comme langue officielle",
  },
  {
    id: "consequences-acte-union",
    notionId: ACTE_UNION_NOTION_ID,
    label: "Conséquences de l’Acte d’union",
  },
  { id: "canada-est-canada-ouest", notionId: ACTE_UNION_NOTION_ID, label: "Canada-Est et Canada-Ouest" },
  { id: "dette-publique", notionId: ACTE_UNION_NOTION_ID, label: "Mise en commun des dettes publiques" },
  { id: "fonds-revenus-reunis", notionId: ACTE_UNION_NOTION_ID, label: "Fonds consolidé et revenus réunis" },
  { id: "alliance-reformiste", notionId: ACTE_UNION_NOTION_ID, label: "Alliance des réformistes du Canada-Est et du Canada-Ouest" },
  { id: "points-de-vue-sur-union", notionId: ACTE_UNION_NOTION_ID, label: "Points de vue sur l’Union" },
  { id: "consequences-rebellions", notionId: ACTE_UNION_NOTION_ID, label: "Conséquences des Rébellions de 1837-1838" },
] as const satisfies readonly CanonicalHistoricalKnowledge[];

export const HISTORICAL_KNOWLEDGE_CATALOG: HistoricalKnowledgeCatalog = {
  [ACTE_UNION_NOTION_ID]: ACTE_UNION_HISTORICAL_KNOWLEDGE,
};

const HISTORICAL_KNOWLEDGE_ALIASES: Readonly<Record<string, string>> = {
  "acte-union-1840": "acte-union",
  "province-du-canada": "creation-province-canada",
  "canada-est": "canada-est-canada-ouest",
  "populations-bas-haut-canada": "populations-bas-canada-haut-canada",
  "representation-politique": "representation-egale-deux-canadas",
  "institutions-politiques": "structure-institutions-politiques",
  "langue-officielle": "anglais-langue-officielle",
};

export function canonicalHistoricalKnowledgeId(id: string): string {
  return HISTORICAL_KNOWLEDGE_ALIASES[id] ?? id;
}

export function getHistoricalKnowledgeForNotion(
  catalog: HistoricalKnowledgeCatalog,
  notionId: string,
): readonly CanonicalHistoricalKnowledge[] {
  return catalog[notionId] ?? [];
}
