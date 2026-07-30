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

const PERIODS = [
  { id: "1840-1896", label: "1840-1896 · La formation du régime fédéral canadien", start: 0, end: 14 },
  { id: "1896-1945", label: "1896-1945 · Les nationalismes et l’autonomie du Canada", start: 14, end: 29 },
  { id: "1945-1980", label: "1945-1980 · La modernisation du Québec et la Révolution tranquille", start: 29, end: 44 },
  { id: "1980-present", label: "De 1980 à nos jours · Les choix de société dans le Québec contemporain", start: 44, end: TITLES.length },
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

export const SECONDARY_FOUR_NOTIONS: ActivityCreatorNotion[] = TITLES.map((title, index) => {
  const period = PERIODS.find(({ start, end }) => index >= start && index < end);
  if (!period) throw new Error(`Période historique manquante pour la notion ${title}.`);
  return {
    id: title === "Acte d’Union" ? "acte-union" : notionId(title),
    title,
    periodId: period.id,
    periodLabel: period.label,
    hasApprovedDocuments: title === "Acte d’Union",
  };
});
