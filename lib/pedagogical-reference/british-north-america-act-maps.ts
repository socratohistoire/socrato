import type { HistoricalDocumentRecord } from "./historical-document.ts";

export type BritishNorthAmericaActMapRecord = HistoricalDocumentRecord & {
  imageCredit: string;
};

const common = {
  schemaVersion: 1 as const,
  kind: "map" as const,
  status: "ready-for-review" as const,
  periodIds: ["1840-1896"] as const,
  knowledgeHeadingIds: ["acte-de-l-amerique-du-nord-britannique"] as const,
  operationIds: ["changes_and_continuities", "time_and_space", "establish_facts"] as const,
  creator: "Ressources naturelles Canada",
  holdingInstitution: "Gouvernement du Canada — Ressources naturelles Canada",
  rightsStatement: "Carte officielle diffusée sous la Licence du gouvernement ouvert — Canada. Adaptation pédagogique de Socrato : retrait du paragraphe explicatif dans le coin supérieur droit; frontières, couleurs et noms géographiques conservés.",
  version: "1.0",
  approvedAt: null,
};

export const BRITISH_NORTH_AMERICA_ACT_PROVINCE_CANADA_1849_MAP = {
  ...common,
  id: "AANB-M-003",
  title: "La Province du Canada et l’Amérique du Nord britannique en 1849",
  historicalDate: "1849",
  sourceUrl: "https://ftp.geogratis.gc.ca/pub/nrcan_rncan/raster/atlas_4_ed/fra/historical/083_84.jpg",
  sourceLocator: "Ressources naturelles Canada, Atlas national du Canada, 4e édition, planche 83-84 « Évolution territoriale du Canada »; panneau de 1849 recadré à partir du fichier officiel de 3030 × 2130 pixels.",
  assetUrl: "/historical-documents/aanb-province-canada-1849-complete.png",
  imageCredit: "Ressources naturelles Canada, Atlas national du Canada — évolution territoriale, panneau de 1849",
  rightsStatement: "Carte officielle diffusée sous la Licence du gouvernement ouvert — Canada. Adaptation pédagogique de Socrato : panneau de 1849 isolé et date imprimée retirée; frontières, couleurs, légende et noms géographiques conservés.",
  transcription: "Canada; Terre de Rupert; Territoire du Nord-Ouest; Nouvelle-Calédonie; Terre-Neuve; États-Unis d’Amérique; Grande-Bretagne; Danemark; Russie.",
  accessibleDescription: "Carte de l’Amérique du Nord britannique au milieu du 19e siècle. La Province du Canada occupe la vallée du Saint-Laurent et la région des Grands Lacs; la Terre de Rupert et le Territoire du Nord-Ouest couvrent une grande partie du nord et de l’ouest du continent.",
  historicalContext: "En 1849, la Province du Canada existe depuis l’entrée en vigueur de l’Acte d’Union, mais le Dominion du Canada n’est pas encore créé. Les autres colonies britanniques et les vastes territoires administrés séparément ne forment pas encore une fédération canadienne.",
  observationGuide: ["Repérer la Province du Canada avant la Confédération.", "Distinguer les colonies britanniques des territoires de la Compagnie de la Baie d’Hudson et de la Couronne.", "Comparer cette organisation territoriale à celle du Dominion après 1867."],
  interpretationCautions: ["Les couleurs indiquent des appartenances impériales et administratives; elles ne représentent pas les territoires ancestraux des peuples autochtones.", "Cette carte synthétique a été publiée postérieurement aux événements et constitue une reconstitution cartographique."],
  pedagogicalUses: ["Reconnaître la situation territoriale antérieure à la Confédération.", "Associer une configuration territoriale à une période.", "Observer le passage des colonies séparées à une fédération en expansion."],
} as const satisfies BritishNorthAmericaActMapRecord;

export const BRITISH_NORTH_AMERICA_ACT_DOMINION_1867_MAP = {
  ...common,
  id: "AANB-M-001",
  title: "Le territoire du Dominion du Canada en 1867",
  historicalDate: "1867",
  sourceUrl: "https://geoappext.nrcan.gc.ca/arcgis/rest/services/FGP/ET/MapServer/0",
  sourceLocator: "Ressources naturelles Canada, service cartographique « Évolution territoriale de 1867 à 2017 », couche ET1867; export PNG officiel de 4096 × 3366 pixels.",
  assetUrl: "/historical-documents/aanb-dominion-1867.png",
  imageCredit: "Ressources naturelles Canada, Évolution territoriale — 1867",
  transcription: "Ontario; Québec; Nouveau-Brunswick; Nouvelle-Écosse; Île-du-Prince-Édouard; Terre-Neuve; Colombie-Britannique; Terre de Rupert; Territoire du Nord-Ouest.",
  accessibleDescription: "Carte du nord de l’Amérique du Nord en 1867. L’Ontario, le Québec, le Nouveau-Brunswick et la Nouvelle-Écosse sont colorés comme provinces du Dominion; l’Île-du-Prince-Édouard, Terre-Neuve, la Colombie-Britannique, la Terre de Rupert et le Territoire du Nord-Ouest apparaissent à l’extérieur du Dominion.",
  historicalContext: "Au moment de la Confédération, le Dominion du Canada est formé de quatre provinces : l’Ontario, le Québec, le Nouveau-Brunswick et la Nouvelle-Écosse. Les autres territoires représentés ne font pas encore partie du Dominion.",
  observationGuide: ["Repérer les quatre provinces du Dominion en 1867.", "Distinguer les provinces canadiennes des colonies et territoires qui n’en font pas encore partie.", "Comparer l’étendue du Dominion avec celle montrée sur la carte de 1873."],
  interpretationCautions: ["Les espaces occidentaux et nordiques représentés comme des unités coloniales ou administratives étaient habités par des peuples autochtones et des communautés métisses.", "Les couleurs indiquent un statut politique en 1867; elles ne représentent ni la population ni l’intensité de l’occupation du territoire."],
  pedagogicalUses: ["Établir la composition territoriale initiale du Dominion.", "Comparer les changements territoriaux entre 1867 et 1873.", "Situer l’expansion du Canada vers l’ouest et le nord."],
} as const satisfies BritishNorthAmericaActMapRecord;

export const BRITISH_NORTH_AMERICA_ACT_DOMINION_1873_MAP = {
  ...common,
  id: "AANB-M-002",
  title: "Le territoire du Dominion du Canada en 1873",
  historicalDate: "1873",
  sourceUrl: "https://geoappext.nrcan.gc.ca/arcgis/rest/services/FGP/ET/MapServer/316",
  sourceLocator: "Ressources naturelles Canada, service cartographique « Évolution territoriale de 1867 à 2017 », couche ET1873; export PNG officiel de 4096 × 3366 pixels.",
  assetUrl: "/historical-documents/aanb-dominion-1873.png",
  imageCredit: "Ressources naturelles Canada, Évolution territoriale — 1873",
  transcription: "Colombie-Britannique; Territoires du Nord-Ouest; Manitoba; Ontario; Québec; Nouveau-Brunswick; Nouvelle-Écosse; Île-du-Prince-Édouard; Terre-Neuve; Îles de l’Arctique.",
  accessibleDescription: "Carte du Dominion du Canada en 1873. Le territoire canadien comprend désormais les Territoires du Nord-Ouest, le Manitoba, la Colombie-Britannique et l’Île-du-Prince-Édouard, en plus des quatre provinces de 1867. Terre-Neuve demeure à l’extérieur du Dominion.",
  historicalContext: "Entre 1867 et 1873, le Dominion intègre les terres transférées par la Compagnie de la Baie d’Hudson et le Royaume-Uni, crée le Manitoba en 1870, accueille la Colombie-Britannique en 1871 puis l’Île-du-Prince-Édouard en 1873. Son territoire s’étend alors de l’Atlantique au Pacifique.",
  observationGuide: ["Repérer le Manitoba et les Territoires du Nord-Ouest.", "Identifier la Colombie-Britannique et l’Île-du-Prince-Édouard parmi les nouvelles provinces.", "Comparer la continuité des quatre provinces de 1867 et les ajouts visibles en 1873."],
  interpretationCautions: ["La carte de 1873 montre le résultat de plusieurs changements successifs survenus en 1870, 1871 et 1873.", "L’intégration politique de vastes territoires ne signifie pas qu’ils étaient vides : ces espaces étaient habités par des peuples autochtones et des communautés métisses."],
  pedagogicalUses: ["Expliquer deux changements territoriaux entre 1867 et 1873.", "Distinguer une continuité territoriale d’un agrandissement.", "Relier les adhésions provinciales à l’expansion du Dominion."],
} as const satisfies BritishNorthAmericaActMapRecord;

export const BRITISH_NORTH_AMERICA_ACT_DOMINION_1949_MAP = {
  ...common,
  periodIds: ["1945-1980"],
  id: "AANB-M-004",
  title: "Le territoire du Canada lors de l’entrée de Terre-Neuve dans la fédération",
  historicalDate: "1949",
  sourceUrl: "https://geoappext.nrcan.gc.ca/arcgis/rest/services/FGP/ET/MapServer/484",
  sourceLocator: "Ressources naturelles Canada, service cartographique « Évolution territoriale de 1867 à 2017 », couche ET1949; export PNG officiel de 4096 × 3366 pixels.",
  assetUrl: "/historical-documents/aanb-dominion-1949.png",
  imageCredit: "Ressources naturelles Canada, Évolution territoriale — 1949",
  transcription: "Colombie-Britannique; Alberta; Saskatchewan; Manitoba; Ontario; Québec; Nouveau-Brunswick; Nouvelle-Écosse; Île-du-Prince-Édouard; Terre-Neuve; Territoire du Yukon; Territoires du Nord-Ouest.",
  accessibleDescription: "Carte du Canada au moment où Terre-Neuve devient la dixième province. Le pays s’étend de l’Atlantique au Pacifique et comprend neuf autres provinces ainsi que le Yukon et les Territoires du Nord-Ouest.",
  historicalContext: "En 1949, Terre-Neuve entre dans la fédération canadienne et en devient la dixième province. Cette adhésion constitue le dernier changement provincial montré dans la séquence cartographique proposée.",
  observationGuide: ["Repérer Terre-Neuve parmi les provinces canadiennes.", "Observer l’étendue du Canada de l’Atlantique au Pacifique.", "Comparer le nombre et les limites des provinces à ceux des cartes antérieures."],
  interpretationCautions: ["La carte montre des limites politiques en 1949 et non les territoires ancestraux des peuples autochtones.", "Le Labrador est représenté avec Terre-Neuve dans la nouvelle province, conformément à la situation politique de 1949."],
  pedagogicalUses: ["Associer l’entrée de Terre-Neuve à la configuration territoriale de 1949.", "Reconnaître l’aboutissement de l’expansion provinciale présentée dans la série.", "Situer une transformation territoriale dans le temps."],
} as const satisfies BritishNorthAmericaActMapRecord;

export const BRITISH_NORTH_AMERICA_ACT_TERRITORIAL_MAPS = [
  BRITISH_NORTH_AMERICA_ACT_PROVINCE_CANADA_1849_MAP,
  BRITISH_NORTH_AMERICA_ACT_DOMINION_1867_MAP,
  BRITISH_NORTH_AMERICA_ACT_DOMINION_1873_MAP,
  BRITISH_NORTH_AMERICA_ACT_DOMINION_1949_MAP,
] as const satisfies readonly BritishNorthAmericaActMapRecord[];
