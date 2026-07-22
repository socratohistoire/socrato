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
] as const satisfies readonly CanonicalHistoricalKnowledge[];

export const HISTORICAL_KNOWLEDGE_CATALOG: HistoricalKnowledgeCatalog = {
  [ACTE_UNION_NOTION_ID]: ACTE_UNION_HISTORICAL_KNOWLEDGE,
};

export function getHistoricalKnowledgeForNotion(
  catalog: HistoricalKnowledgeCatalog,
  notionId: string,
): readonly CanonicalHistoricalKnowledge[] {
  return catalog[notionId] ?? [];
}
