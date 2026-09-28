export interface HistoricalComparisonChartItem {
  id: string;
  label: string;
  value: number;
  displayValue: string;
}

export interface HistoricalComparisonChart {
  id: string;
  status: "ready-for-review" | "approved";
  title: string;
  typeLabel: string;
  dateLabel: string;
  unitLabel: string;
  layout?: "horizontal" | "vertical";
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
  approvedAt: string | null;
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

export const COLONIAL_ECONOMY_RECIPROCITY_EXPORTS_CHART = {
  id: "EC-G-001",
  status: "ready-for-review",
  title: "Exportations de la Province du Canada vers les États-Unis",
  typeLabel: "Graphique à barres",
  dateLabel: "1853 à 1856",
  unitLabel: "livres en monnaie courante (£), selon la source",
  layout: "vertical",
  accessibleDescription: "Graphique à barres montrant la valeur des produits canadiens visés par le traité et exportés vers les États-Unis : 2 189 731 livres en 1853, 2 082 936 livres en 1854, 4 167 977 livres en 1855 et 4 418 885 livres en 1856.",
  items: [
    { id: "1853-before-treaty", label: "1853 · avant le traité", value: 2189731, displayValue: "2 189 731 £" },
    { id: "1854-before-effect", label: "1854 · avant le traité", value: 2082936, displayValue: "2 082 936 £" },
    { id: "1855-under-treaty", label: "1855 · après le traité", value: 4167977, displayValue: "4 167 977 £" },
    { id: "1856-under-treaty", label: "1856 · après le traité", value: 4418885, displayValue: "4 418 885 £" },
  ],
  sourceLabel: "Grande-Bretagne, Board of Trade, Statistical Department, Imports and exports (Canada and United States), document parlementaire no 236, 1857, tableau no 2, p. 3.",
  sourceUrl: "https://www.canadiana.ca/view/oocihm.22664/10",
  methodology: "Le graphique reprend les totaux du tableau officiel no 2 pour les produits exportés de la Province du Canada vers les États-Unis qui seront ou sont admis sans droits en vertu du traité. Le traité est signé en juin 1854, ratifié puis mis en vigueur en 1855. Entre 1854 et 1855, la valeur passe de 2 082 936 £ à 4 167 977 £, soit une hausse d’environ 100 %. Les valeurs sont conservées dans l’unité historique de la source, sans conversion en dollars modernes.",
  historicalContext: "Le traité de réciprocité ouvre le marché américain à plusieurs produits naturels de la Province du Canada. La hausse immédiate des exportations couvertes concorde avec cette ouverture commerciale. Elle ne permet toutefois pas d’attribuer toute l’augmentation au seul traité : les récoltes, les prix, la demande et les réseaux de transport influencent aussi les échanges.",
  observationGuide: ["Comparer les deux années précédant l’entrée en vigueur aux deux années suivantes.", "Repérer le moment où la valeur des exportations double.", "Nommer la destination des produits canadiens représentés."],
  interpretationCautions: ["Le graphique porte uniquement sur les produits visés par le traité, et non sur la totalité des exportations canadiennes.", "Il montre une augmentation après l’entrée en vigueur du traité, mais ne prouve pas que le traité en est l’unique cause.", "La livre indiquée dans le relevé est une valeur historique en monnaie courante; elle n’est pas convertie en pouvoir d’achat actuel."],
  pedagogicalUses: ["Dégager une conséquence économique du traité de réciprocité.", "Établir un lien entre l’ouverture du marché américain et l’augmentation des exportations canadiennes.", "Comparer une situation avant et après un changement commercial."],
  version: "1.0",
  approvedAt: null,
} as const satisfies HistoricalComparisonChart;
