export interface HistoricalComparisonChartItem {
  id: string;
  label: string;
  value: number;
  displayValue: string;
}

export interface HistoricalComparisonChart {
  id: string;
  status: "approved";
  title: string;
  typeLabel: string;
  dateLabel: string;
  unitLabel: string;
  accessibleDescription: string;
  items: readonly HistoricalComparisonChartItem[];
  sourceLabel: string;
  sourceUrl: string;
  methodology: string;
  historicalContext: string;
  observationGuide: readonly string[];
  interpretationCautions: readonly string[];
  pedagogicalUses: readonly string[];
  version: string;
  approvedAt: string;
}

export const ACTE_UNION_DEBT_COMPARISON_CHART = {
  id: "AU-G-001",
  status: "approved",
  title: "Dette publique au moment de l’Union",
  typeLabel: "Graphique comparatif",
  dateLabel: "1841",
  unitLabel: "livres sterling",
  accessibleDescription: "Graphique à barres comparant une dette d’environ 133 000 livres pour le Bas-Canada à une dette estimée à 1 537 142 livres pour le Haut-Canada en 1841.",
  items: [
    { id: "lower-canada", label: "Bas-Canada", value: 133000, displayValue: "≈ 133 000 £" },
    { id: "upper-canada", label: "Haut-Canada", value: 1537142, displayValue: "≈ 1 540 000 £" },
  ],
  sourceLabel: "John George Bourinot, Public Debts in Canada, données attribuées à l’état financier présenté en 1841 et aux débats parlementaires.",
  sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Public_debts_in_Canada_%28IA_publicdebtsincan00perrrich%29.pdf",
  methodology: "La source donne une dette totale de 1 670 142 £ et des engagements de 133 000 £ pour le Bas-Canada. La valeur du Haut-Canada est obtenue par différence; les montants sont donc présentés comme approximatifs.",
  historicalContext: "L’Acte d’Union réunit les revenus et les obligations financières des deux colonies dans un fonds commun. La dette beaucoup plus élevée du Haut-Canada devient ainsi une responsabilité de la Province du Canada.",
  observationGuide: ["Comparer la longueur des deux barres.", "Calculer approximativement combien de fois la dette du Haut-Canada dépasse celle du Bas-Canada."],
  interpretationCautions: ["Les estimations historiques varient selon les passifs inclus.", "Conserver la livre sterling comme unité et éviter une conversion moderne non documentée."],
  pedagogicalUses: ["Établir une différence financière entre les deux colonies.", "Relier le partage de la dette à l’opposition de La Fontaine."],
  version: "1.0",
  approvedAt: "2026-07-31T00:00:00.000-04:00",
} as const satisfies HistoricalComparisonChart;

export const ACTE_UNION_POPULATION_COMPARISON_CHART = {
  id: "AU-G-002",
  status: "approved",
  title: "Population au moment de l’Union",
  typeLabel: "Graphique comparatif",
  dateLabel: "vers 1841",
  unitLabel: "habitants",
  accessibleDescription: "Graphique à barres comparant environ 650 000 habitants au Bas-Canada à environ 450 000 habitants au Haut-Canada au moment de l’Union.",
  items: [
    { id: "lower-canada", label: "Bas-Canada", value: 650000, displayValue: "≈ 650 000" },
    { id: "upper-canada", label: "Haut-Canada", value: 450000, displayValue: "≈ 450 000" },
  ],
  sourceLabel: "Débats parlementaires de la Province du Canada, 19 mai 1864, rappel des populations respectives au moment de l’Union.",
  sourceUrl: "https://primarydocuments.ca/province-of-canada-legislative-assembly-scrapbook-debates-8th-parl-2nd-sess-19-may-1864/",
  methodology: "Les nombres sont des estimations arrondies utilisées dans les débats parlementaires pour décrire la situation au moment de l’Union; ils ne proviennent pas de deux recensements réalisés la même année.",
  historicalContext: "Malgré une population plus élevée au Bas-Canada, l’Acte d’Union accorde 42 représentants à chacune des deux sections de la nouvelle Province du Canada.",
  observationGuide: ["Identifier la section la plus peuplée.", "Comparer l’écart de population à l’égalité du nombre de représentants."],
  interpretationCautions: ["Présenter les valeurs comme des estimations arrondies.", "Ne pas les décrire comme les résultats d’un recensement commun de 1841."],
  pedagogicalUses: ["Dégager une différence démographique entre les deux colonies.", "Mettre en relation population et représentation politique."],
  version: "1.0",
  approvedAt: "2026-07-31T00:00:00.000-04:00",
} as const satisfies HistoricalComparisonChart;
