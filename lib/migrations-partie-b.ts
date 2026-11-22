export const MIGRATIONS_ACTIVITY_ID = "migrations-partie-b-evaluation-v2";
export const MIGRATIONS_TITLE = "Le Québec et le Canada, 1840-1896";
export const MIGRATIONS_INSTRUCTION = "Décrivez les déplacements de population qui touchent le Québec entre 1840 et 1896. Remplissez le schéma à l’aide de vos connaissances et des documents pertinents. Certains documents ne répondent à aucune case du schéma.";

export const MIGRATIONS_SCHEMA_FIELDS = [
  { id: "object", prompt: "Nommez le phénomène démographique qui regroupe les déplacements de population au Québec durant la période 1840-1896." },
  { id: "us_destination", prompt: "Nommez précisément la région des États-Unis vers laquelle émigrent les Canadiens français." },
  { id: "us_causes", prompt: "Indiquez une cause de cette émigration." },
  { id: "colonization", prompt: "Décrivez une mesure prise pour retenir des familles au Québec." },
  { id: "transatlantic", prompt: "Nommez un pays d’origine d’un important groupe d’immigrants au Québec durant les années 1840." },
  { id: "famine", prompt: "Indiquez un événement qui provoque leur départ." },
  { id: "quarantine", prompt: "Décrivez une mesure appliquée à leur arrivée." },
] as const;

export type MigrationsSchemaFieldId = (typeof MIGRATIONS_SCHEMA_FIELDS)[number]["id"];
export type MigrationsDraft = {
  answers: Record<MigrationsSchemaFieldId, string>;
  submitted: boolean;
};

// La grille porte sur une appréciation humaine de chaque réponse, jamais sur des mots-clés.
export const MIGRATIONS_RELATION_RUBRIC = [
  { central: "correct", label: "Élément central correct", scores: [3, 2, 1] },
  { central: "partial", label: "Élément central plus ou moins correct", scores: [2, 1, 0] },
  { central: "incorrect", label: "Élément central incorrect ou absent", scores: [1, 0, 0] },
] as const;
export type MigrationsCentralAssessment = (typeof MIGRATIONS_RELATION_RUBRIC)[number]["central"];
export function migrationsRelationScore(central: MigrationsCentralAssessment, preciseDetails: 0 | 1 | 2) {
  const row = MIGRATIONS_RELATION_RUBRIC.find((candidate) => candidate.central === central)!;
  return row.scores[2 - preciseDetails];
}

const SOURCE_DOCUMENTS = [
  {
    number: 1,
    date: "QUÉBEC, 1871-1891",
    title: "Part de la population urbaine et rurale au Québec",
    note: "Les données sont exprimées en pourcentage de la population totale du Québec. Dans ce recensement, la population urbaine habite des cités, des villes ou des villages constitués en municipalités.",
    source: "Source primaire statistique : Recensement du Canada de 1890-91, volume I, chapitre II, « Proportions of urban and rural population, 1871-1891 », Ottawa, 1892, p. 102. Données de la ligne Québec reproduites sans interprétation.",
    links: [
      { url: "https://www66.statcan.gc.ca/eng/1892/189201180102_p.%20102.pdf", label: "Statistique Canada — page 102 du recensement" },
      { url: "https://www150.statcan.gc.ca/n1/pub/11-516-x/sectiona/4147436-eng.htm", label: "Statistique Canada — statistiques historiques" },
    ],
    table: {
      headers: ["Année du recensement", "Population urbaine", "Population rurale"],
      rows: [["1871", "19,5 %", "80,5 %"], ["1881", "22,8 %", "77,2 %"], ["1891", "29,2 %", "70,8 %"]],
    },
  },
  {
    number: 2,
    date: "QUÉBEC ET ÉTATS-UNIS, 1840-1896",
    title: "L’émigration des Canadiens français du Québec vers le nord-est des États-Unis, 1840-1896",
    note: "Les flèches indiquent la direction des déplacements de population.",
    source: "Carte pédagogique de Socrato : agrandissement du sud du Québec extrait de la carte des migrations transatlantiques. Fond Natural Earth, pays à l’échelle 1:50 000 000, domaine public. Flèches et repères ajoutés par Socrato; l’étiquette de destination a été remplacée par États-Unis pour l’évaluation. Les flèches sont schématiques et ne représentent pas des effectifs.",
    image: {
      url: "/historical-documents/migrations-canadiens-francais-etats-unis-section-b.png",
      alt: "Carte pédagogique du sud du Québec et du nord-est des États-Unis. Trois flèches montrent la direction des déplacements de population vers les États-Unis; Montréal et Québec sont repérées. La légende est intégrée sous la carte.",
      width: 1588,
      height: 600,
    },
    links: [
      { url: "https://www.naturalearthdata.com/downloads/50m-cultural-vectors/", label: "Natural Earth — fond cartographique" },
    ],
  },
  {
    number: 3,
    date: "BAS-CANADA, 1849",
    title: "",
    excerpt: "« Plusieurs familles endettées ont été forcées de vendre leurs terres et leurs meubles, puis d’émigrer. Les mauvaises récoltes [causées notamment par la mouche à blé] et l’état arriéré de l’agriculture ont aggravé leur misère. La distance des marchés, le manque de voies de communication et l’absence de navigation à vapeur ont aussi empêché les cultivateurs de tirer profit de leur travail. »",
    note: "Extrait recomposé en trois phrases; orthographe et ponctuation modernisées. Les crochets rendent explicites des éléments déjà présents dans le titre ou les passages rapprochés.",
    source: "Source primaire : Pierre-Joseph-Olivier Chauveau et six autres membres de l’Assemblée législative, Rapport du comité spécial […] sur l’émigration […] du Bas-Canada vers les États-Unis, Montréal, 1849, p. 13-14. Le propos et l’enchaînement causal de la source ont été conservés.",
    links: [
      { url: "https://online.canadiana.ca/view/oocihm.9_00025/7?r=0&s=1", label: "Canadiana — rapport numérisé" },
      { url: "https://ena.recitfad.com/mod/book/view.php?chapterid=1994&id=9801", label: "RÉCIT — transcription et mise en contexte" },
    ],
  },
  {
    number: 4,
    date: "QUÉBEC, 1883",
    title: "Des cantons proposés à la colonisation dans les Laurentides et l’Outaouais",
    note: "La carte nomme les bassins des rivières du Lièvre, Rouge, du Nord et de l’Assomption, ainsi que des cantons présentés aux sociétés de colonisation.",
    source: "Source primaire : Au nord : brochure accompagnée d’une carte géographique des cantons à coloniser dans les vallées de l’Outaouais et de la Mattawan, Québec, 1883. Fragment central de la carte dépliante conservée et numérisée par Canadiana.",
    image: {
      url: "/historical-documents/migrations-colonisation-au-nord-1883.jpg",
      alt: "Carte de 1883 montrant des cantons à coloniser dans les bassins des rivières du Lièvre, Rouge, du Nord et de l’Assomption.",
      width: 1200,
      height: 1383,
    },
    links: [
      { url: "https://www.canadiana.ca/view/oocihm.00037/9", label: "Canadiana — brochure et carte dépliante" },
    ],
  },
  {
    number: 5,
    date: "1847",
    title: "Une femme demandant l’aumône à Clonakilty durant la Grande Famine",
    note: "Aumône : argent, nourriture ou autre aide donnée à une personne dans le besoin.",
    source: "Source primaire iconographique : dessin attribué à James Mahony, graveur non identifié, « Woman Begging at Clonakilty », The Illustrated London News, 13 février 1847, série « Sketches in the West of Ireland ». Gravure du domaine public; reproduction Wikimedia Commons.",
    image: {
      url: "/historical-documents/migrations-clonakilty-famine-1847.jpg",
      alt: "Gravure de 1847 montrant une femme en manteau déchiré tenant un enfant et tendant un récipient pour demander l’aumône à Clonakilty pendant la Grande Famine.",
      width: 779,
      height: 1000,
    },
    links: [
      { url: "https://commons.wikimedia.org/wiki/File:Woman_begging_at_Clonakilty,_Ireland_1847.jpg", label: "Wikimedia Commons — gravure et provenance" },
    ],
  },
  {
    number: 6,
    date: "MONTRÉAL, 28 JUIN 1848",
    title: "",
    excerpt: "« [À Grosse-Île, les immigrants débarqués des navires placés en quarantaine] sont séparés selon leur état de santé. Personne ne peut passer d’une section à l’autre sans l’autorisation du commandant. […] Les malades sont immédiatement conduits dans les hôpitaux. Les passagers en santé sont installés dans [la section qui leur est réservée]; s’ils tombent malades, ils sont transférés à l’autre extrémité de l’île. »",
    attribution: "Lord Elgin, lettre à Lord Grey, 28 juin 1848",
    note: "Traduction-adaptation en quatre phrases des paragraphes 3 et 5. Les […] signalent les coupures; les autres crochets indiquent des clarifications. Le sens du rapport est conservé.",
    source: "Source primaire : Lord Elgin, lettre no 85 à Lord Grey, Montréal, 28 juin 1848, paragraphes 3 et 5, dans The Elgin-Grey Papers, 1846-1852, vol. IV, édition d’Arthur G. Doughty, Archives publiques du Canada, 1937, annexe VIII. Traduction française adaptée du texte anglais.",
    links: [
      { url: "https://primarydocuments.ca/the-elgin-grey-papers-1846-1852-vol-4/", label: "Lettre d’Elgin à Grey, 28 juin 1848, annexe VIII" },
    ],
  },
  {
    number: 7,
    date: "MONTRÉAL, VERS 1858-1860",
    title: "Le pont Victoria en construction",
    note: "La photographie montre les piliers et les installations du chantier du pont Victoria au-dessus du fleuve Saint-Laurent.",
    source: "Source primaire iconographique : William Notman, photographie du pont Victoria en construction, vers 1858-1860. Bibliothèque et Archives Canada, collection Thomas Seaton Scott, PA-181435; reproduction du domaine public.",
    image: {
      url: "/historical-documents/industrialisation-pont-victoria-construction.jpg",
      alt: "Photographie du pont Victoria en construction au-dessus du fleuve Saint-Laurent, avec ses piliers et les installations du chantier.",
      width: 640,
      height: 496,
    },
    links: [
      { url: "https://commons.wikimedia.org/wiki/File:Victoria_Bridge_under_construction.jpg", label: "Wikimedia Commons — photographie et provenance" },
      { url: "https://collections.musee-mccord-stewart.ca/fr/objects/details/246405", label: "Musée McCord Stewart — photographies du chantier" },
    ],
  },
  {
    number: 8,
    date: "OUEST CANADIEN, 1892",
    title: "Fermes gratuites au Manitoba et dans l’Ouest canadien",
    note: "Couverture publicitaire diffusée en français.",
    source: "Compagnie du chemin de fer Canadien Pacifique, Fermes gratuites, Manitoba, Assiniboia, Alberta, Saskatchewan, brochure publicitaire en français, 1892. Archives publiques du Canada, numérisation Canadiana, oocihm.03416.",
    image: {
      url: "/historical-documents/politique-nationale-fermes-gratuites-1892.png",
      alt: "Publicité française portant les mots Fermes gratuites, Manitoba, Assiniboia, Alberta, Saskatchewan et L’Ouest canadien.",
      width: 1154,
      height: 2067,
    },
    links: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Fermes_gratuites%2C_Manitoba%2C_Assiniboia%2C_Alberta%2C_Saskatchewan_%28microforme%29_-_les_quatres_grandes_provinces_fertiles_de_l%27ouest_canadien_%28IA_cihm_03416%29.pdf", label: "Canadiana — document numérisé" },
    ],
  },
  {
    number: 9,
    date: "CANADA, 17-23 FÉVRIER 1946",
    title: "",
    excerpt: "« Des familles partagent le même logement; cette occupation par plusieurs familles est un symptôme possible du surpeuplement. [Pour évaluer la situation], le nombre de personnes est comparé au nombre de pièces et de chambres disponibles. L’utilisation, pour dormir, de pièces qui ne sont pas des chambres donne aussi un indice du surpeuplement. Au Canada, environ 404 500 ménages composés d’une seule famille et 52 500 ménages regroupant plusieurs familles utilisent ainsi une ou plusieurs autres pièces pour dormir. »",
    note: "Extrait traduit et recomposé en quatre phrases à partir de l’introduction, de la section VIII et du tableau 9 du rapport. Les crochets simplifient le lien entre les indicateurs sans modifier les constats statistiques.",
    source: "Source statistique primaire : Bureau fédéral de la statistique, Report on Overcrowding and Multiple Occupancy of Dwellings in Canada, February 17-23, 1946, Ottawa, mars 1946, p. 3 et 72-73. Traduction pédagogique de Socrato.",
    links: [
      { url: "https://publications.gc.ca/collections/collection_2017/statcan/CS2-50-1946-eng.pdf", label: "Publications du gouvernement du Canada — rapport de 1946" },
      { url: "https://publications.gc.ca/site/fra/9.831837/publication.html", label: "Publications du gouvernement du Canada — notice bibliographique" },
    ],
  },
  {
    number: 10,
    date: "BOSTON ET HALIFAX, VERS 1776",
    title: "",
    excerpt: "« Je t’ai écrit plusieurs fois pendant le siège de Boston, sans recevoir de réponse. Je suis privée de mon père, de ma mère, de mon frère et de mes sœurs, et je ne sais pas où ils se trouvent. On me dit que tu es maintenant à Halifax [après le départ de notre famille loyaliste de Boston]. Si cette lettre te parvient, donne-moi des nouvelles de toute notre famille. »",
    note: "Extrait traduit et recomposé en quatre phrases à partir de la lettre anglaise. Les crochets explicitent le déplacement de la famille loyaliste de Boston vers Halifax, présenté dans la mise en contexte archivistique.",
    source: "Source primaire : Lucy Knox, lettre à sa sœur loyaliste Hannah Urquhart, vers 1776. Gilder Lehrman Institute of American History, collection GLC02437.05380. Traduction pédagogique de Socrato.",
    links: [
      { url: "https://hamilton.gilderlehrman.org/supporting-document/lucy-knox-her-loyalist-sister-hannah-urquhart-ca-1776", label: "Gilder Lehrman Institute — lettre, transcription et contexte" },
      { url: "https://www.historysource.org/history-source-sets/loyalists", label: "Massachusetts Historical Society — dossier pédagogique sur les Loyalistes" },
    ],
  },
] as const;

// Les numéros suivent l’ordre de présentation; les documents pertinents et les distracteurs sont mêlés.
const DOCUMENT_ORDER = [7, 2, 8, 5, 3, 10, 4, 9, 6, 1] as const;
const DOCUMENT_TITLES = new Set([1, 2, 3, 4, 7, 10]);
const SHORT_SOURCES: Record<number, string> = {
  1: "William Notman, v. 1858–1860. BAC, PA-181435.",
  2: "Socrato, fond Natural Earth. Carte pédagogique adaptée.",
  3: "Canadien Pacifique, 1892. Archives publiques du Canada; Canadiana, oocihm.03416.",
  4: "The Illustrated London News, 13 février 1847.",
  5: "P.-J.-O. Chauveau et al., 1849, p. 13–14. Canadiana.",
  6: "Lucy Knox, v. 1776. Gilder Lehrman Institute, GLC02437.05380.",
  7: "Canadiana, 1883, oocihm.00037.",
  8: "Bureau fédéral de la statistique, 1946, p. 3 et 72–73.",
  9: "Lord Elgin, 28 juin 1848, lettre no 85, § 3 et 5. Traduction-adaptation.",
  10: "Recensement du Canada 1890–1891, vol. I, 1892, p. 102.",
};
export const MIGRATIONS_DOCUMENTS = DOCUMENT_ORDER.map((originalNumber, index) => {
  const document = SOURCE_DOCUMENTS.find(({ number }) => number === originalNumber)!;
  const number = index + 1;
  return {
    ...document,
    number,
    title: DOCUMENT_TITLES.has(number) ? document.title : "",
    source: SHORT_SOURCES[number],
    fullSource: document.source,
  };
});

export function emptyMigrationsDraft(): MigrationsDraft {
  return {
    answers: Object.fromEntries(MIGRATIONS_SCHEMA_FIELDS.map(({ id }) => [id, ""])) as Record<MigrationsSchemaFieldId, string>,
    submitted: false,
  };
}

export function restoreMigrationsDraft(raw: unknown): MigrationsDraft {
  const draft = emptyMigrationsDraft();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return draft;
  const value = raw as Record<string, unknown>;
  const answers = value.answers && typeof value.answers === "object" && !Array.isArray(value.answers) ? value.answers as Record<string, unknown> : {};
  for (const { id } of MIGRATIONS_SCHEMA_FIELDS) {
    const text = answers[id];
    if (typeof text === "string") draft.answers[id] = text.slice(0, 2000);
  }
  draft.submitted = value.submitted === true && migrationsMissingCount(draft) === 0;
  return draft;
}

export function migrationsMissingCount(draft: MigrationsDraft) {
  return MIGRATIONS_SCHEMA_FIELDS.filter(({ id }) => !draft.answers[id].trim()).length;
}
