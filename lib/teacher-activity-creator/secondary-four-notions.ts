import type { ActivityCreatorNotion } from "./types.ts";

const TITLES = [
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
] as const;

function notionId(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "-")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export const SECONDARY_FOUR_NOTIONS: ActivityCreatorNotion[] = TITLES.map((title) => ({
  id: title === "Acte d’Union" ? "acte-union" : notionId(title),
  title,
  hasApprovedDocuments: title === "Acte d’Union",
}));
