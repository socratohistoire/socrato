export const MIGRATIONS_ACTIVITY_ID = "migrations-partie-b-v1";
export const MIGRATIONS_TITLE = "Le Québec et le Canada, 1840-1896";
export const MIGRATIONS_INSTRUCTION = "Décrivez l’évolution de la démographie au Québec entre 1840 et 1896. Complétez le schéma à l’aide de vos connaissances et des documents pertinents. Pour chaque document, choisissez « Utile » ou « À discriminer » selon son lien avec le phénomène démographique étudié.";

export const MIGRATIONS_SCHEMA_FIELDS = [
  {
    id: "object",
    prompt: "Nommez le phénomène démographique qui regroupe les déplacements de population étudiés dans le schéma.",
    answer: "Le phénomène démographique étudié est celui des migrations.",
  },
  {
    id: "exode",
    prompt: "Décrivez un mouvement de population à l’intérieur du Québec associé à l’industrialisation.",
    answer: "Des habitants quittent les campagnes pour s’établir dans les villes industrielles, notamment Montréal : c’est l’exode rural (document 1).",
  },
  {
    id: "us_destination",
    prompt: "Nommez la principale destination extérieure des Canadiens français qui quittent le Québec.",
    answer: "Ils émigrent surtout vers les États-Unis, particulièrement vers les villes industrielles de la Nouvelle-Angleterre (document 2).",
  },
  {
    id: "us_causes",
      prompt: "Expliquez deux causes de l’émigration des Canadiens français.",
    answer: "Les dettes, les mauvaises récoltes, les difficultés de l’agriculture et l’accès limité aux marchés appauvrissent des familles; les emplois et les salaires des villes industrielles américaines les attirent aussi (document 3).",
  },
  {
    id: "colonization",
    prompt: "Décrivez une mesure prise pour retenir ou ramener des familles au Québec.",
    answer: "L’Église et les autorités politiques favorisent l’ouverture de régions de colonisation, notamment dans les Laurentides, au Saguenay–Lac-Saint-Jean et en Outaouais (document 4).",
  },
  {
    id: "transatlantic",
    prompt: "Indiquez d’où vient une part importante des immigrants transatlantiques et ce qui provoque leur départ.",
    answer: "Une part importante vient des îles Britanniques. Beaucoup d’Irlandais quittent leur pays pendant la Grande Famine des années 1840 (document 5).",
  },
  {
    id: "quarantine",
      prompt: "Décrivez une mesure appliquée à l’arrivée de certains immigrants au Québec.",
    answer: "À Grosse-Île, les navires et les passagers sont inspectés; les malades peuvent être hospitalisés et les autres placés en quarantaine avant de poursuivre vers Québec (document 6).",
  },
] as const;

export type MigrationsSchemaFieldId = (typeof MIGRATIONS_SCHEMA_FIELDS)[number]["id"];
export type MigrationsAnswerFeedback = { status: "recognized" | "partial" | "review"; label: string; message: string };

const LOCAL_ANSWER_RULES: Record<MigrationsSchemaFieldId, { accepted: RegExp[]; related: RegExp; hint: string }> = {
  object: {
    accepted: [/\bmigrations?\b/, /\bmouvements? migratoires?\b/],
    related: /\b(population|deplacements?|immigration|emigration)\b/,
    hint: "Nommez la notion générale qui rassemble l’immigration, l’émigration, l’exode rural et la colonisation.",
  },
  exode: {
    accepted: [/\bexode rural\b/, /\b(campagnes?|milieu rural).{0,45}(villes?|montreal|milieu urbain)\b/, /\bquittent?.{0,35}(campagnes?|rural).{0,45}(villes?|montreal)\b/],
    related: /\b(campagnes?|rural|villes?|montreal|urbanisation|usines?|industrie)\b/,
    hint: "Précisez le déplacement des campagnes vers les villes et nommez l’exode rural.",
  },
  us_destination: {
    accepted: [/\b(etats unis|nouvelle angleterre)\b/, /\b(lowell|massachusetts|vermont|maine|new hampshire|connecticut|rhode island)\b/],
    related: /\b(amerique|americain|villes? industrielles?|frontiere)\b/,
    hint: "Nommez les États-Unis et, idéalement, les villes industrielles de la Nouvelle-Angleterre.",
  },
  us_causes: {
    accepted: [/\b(dettes?|endettement|mauvaises? recoltes?|crise agricole|terres? (insuffisantes?|epuisees?|rares?))\b/, /\b(emplois?|travail|salaires?).{0,45}(etats unis|nouvelle angleterre|americain)\b/, /\b(etats unis|nouvelle angleterre).{0,45}(emplois?|travail|salaires?)\b/],
    related: /\b(pauvrete|misere|agriculture|recoltes?|marches?|salaires?|emplois?|dettes?|terres?)\b/,
    hint: "Expliquez au moins une difficulté vécue au Québec ou un facteur d’attraction des villes industrielles américaines.",
  },
  colonization: {
    accepted: [/\b(ouverture|ouvrir|colonisation).{0,55}(regions?|laurentides|saguenay|lac saint jean|outaouais|mauricie|gaspe?sie)\b/, /\b(cure labelle|antoine labelle)\b/, /\binstaller.{0,35}(familles?|colons?).{0,35}(terres?|regions?)\b/],
    related: /\b(colonisation|colons?|terres?|regions?|eglise|gouvernement|laurentides|saguenay|outaouais)\b/,
    hint: "Décrivez l’ouverture et la promotion de régions de colonisation au Québec par l’Église et les autorités politiques.",
  },
  transatlantic: {
    accepted: [/\b(irlande|irlandais).{0,45}(famine|grande famine)\b/, /\b(famine|grande famine).{0,45}(irlande|irlandais)\b/, /\biles? britanniques?\b/],
    related: /\b(irlande|irlandais|britannique|angleterre|ecosse|europe|famine|atlantique)\b/,
    hint: "Précisez les îles Britanniques et la Grande Famine qui pousse de nombreux Irlandais à partir.",
  },
  quarantine: {
    accepted: [/\bgrosse ile\b/, /\b(quarantaine|inspection).{0,45}(navires?|passagers?|immigrants?)\b/, /\b(malades?|fievre).{0,45}(hopital|quarantaine|inspect)\b/],
    related: /\b(quarantaine|inspection|medecin|malades?|hopital|navires?|passagers?|quebec)\b/,
    hint: "Nommez l’inspection et la quarantaine à Grosse-Île, avant l’arrivée à Québec.",
  },
};

function normalizeAnswer(answer: string) {
  return answer.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’']/g, " ").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function assessMigrationsAnswer(id: MigrationsSchemaFieldId, answer: string): MigrationsAnswerFeedback {
  const text = normalizeAnswer(answer);
  const rule = LOCAL_ANSWER_RULES[id];
  const review = (message: string): MigrationsAnswerFeedback => ({ status: "review", label: "À vérifier", message });
  if (!text) return review("Aucune réponse à vérifier.");
  if (text.length > 260 || /\b(ne|n|pas|non|aucun|aucune|jamais|sans|sauf|contraire|plutot|mais|ou|peut etre|sais|refuse|refusent|refuser)\b/.test(text)) return review("Votre formulation demande une lecture humaine : comparez-la au corrigé ou faites-la valider par l’enseignant.");
  if (/\b(immigration de masse de 1900|clifford sifton|silver dart|voie maritime du saint laurent|crise de 1929|baby boom)\b/.test(text)) return review("Vérifiez la période évoquée : cette formulation semble renvoyer à un autre contexte historique.");
  if (rule.accepted.some((pattern) => pattern.test(text))) return { status: "recognized", label: "Réponse reconnue", message: "Votre réponse contient une formulation attendue pour cette case. Cette reconnaissance locale ne garantit pas la justesse de toute la phrase." };
  if (rule.related.test(text)) return { status: "partial", label: "À préciser", message: rule.hint };
  return review("Cette formulation n’est pas reconnue; elle n’est pas nécessairement fausse. Comparez-la à la piste de réponse ou consultez l’enseignant.");
}

export type MigrationsDocumentChoice = "" | "direct" | "exclude";
export type MigrationsDraft = {
  answers: Record<MigrationsSchemaFieldId, string>;
  choices: Record<string, MigrationsDocumentChoice>;
  submitted: boolean;
};

export const MIGRATIONS_DOCUMENTS = [
  {
    number: 1,
    date: "QUÉBEC, 1871-1891",
    title: "Part de la population urbaine et rurale au Québec",
    note: "Les données sont exprimées en pourcentage de la population totale du Québec. Dans ce recensement, la population urbaine habite des cités, des villes ou des villages constitués en municipalités.",
    source: "Source primaire statistique : Recensement du Canada de 1890-91, volume I, chapitre II, « Proportions of urban and rural population, 1871-1891 », Ottawa, 1892, p. 102. Données de la ligne Québec reproduites sans interprétation.",
    supports: "exode",
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
    date: "ÉTATS-UNIS, RECENSEMENT DE 1890",
    title: "Répartition des personnes nées au Canada et à Terre-Neuve",
    note: "La carte compte toutes les personnes nées au Canada ou à Terre-Neuve qui résident aux États-Unis en 1890. Plus la teinte est foncée, plus leur nombre par mille carré est élevé. Les repères ajoutés situent Détroit, Boston, Montréal et Québec; deux encadrés identifient le DOMINION DU CANADA et les ÉTATS-UNIS.",
    source: "Source primaire statistique : Henry Gannett, Map Showing the Density of Distribution of the Natives of Canada and Newfoundland at the Eleventh Census 1890, Bureau du recensement des États-Unis, Statistical Atlas, planche 17, publié en 1898. Les deux moitiés de la planche ont été réunies, puis la carte a été recadrée sur le nord-est du continent. Les quatre repères de villes et les deux encadrés territoriaux ont été ajoutés pour l’activité.",
    supports: "us_destination",
    image: {
      url: "/historical-documents/migrations-canadiens-etats-unis-1890-villes-pays.png",
      alt: "Carte du recensement américain de 1890 montrant les concentrations de personnes nées au Canada ou à Terre-Neuve dans le nord-est des États-Unis, avec Détroit, Boston, Montréal et Québec indiquées par des repères rouges, ainsi que le DOMINION DU CANADA et les ÉTATS-UNIS identifiés par des encadrés légèrement transparents.",
      width: 984,
      height: 736,
    },
    links: [
      { url: "https://www.loc.gov/resource/g3701gm.gct00010/?sp=36&st=image", label: "Library of Congress — atlas statistique" },
      { url: "https://www2.census.gov/prod2/decennial/documents/1890a_v1-05.pdf", label: "U.S. Census Bureau — atlas numérisé" },
    ],
  },
  {
    number: 3,
    date: "BAS-CANADA, 1849",
    title: "",
    excerpt: "« Plusieurs familles endettées ont été forcées de vendre leurs terres et leurs meubles, puis d’émigrer. Les mauvaises récoltes [causées notamment par la mouche à blé] et l’état arriéré de l’agriculture ont aggravé leur misère. La distance des marchés, le manque de voies de communication et l’absence de navigation à vapeur ont aussi empêché les cultivateurs de tirer profit de leur travail. »",
    note: "Extrait recomposé en trois phrases; orthographe et ponctuation modernisées. Les crochets rendent explicites des éléments déjà présents dans le titre ou les passages rapprochés.",
    source: "Source primaire : Pierre-Joseph-Olivier Chauveau et six autres membres de l’Assemblée législative, Rapport du comité spécial […] sur l’émigration […] du Bas-Canada vers les États-Unis, Montréal, 1849, p. 13-14. Le propos et l’enchaînement causal de la source ont été conservés.",
    supports: "us_causes",
    links: [
      { url: "https://online.canadiana.ca/view/oocihm.9_00025/7?r=0&s=1", label: "Canadiana — rapport numérisé" },
      { url: "https://ena.recitfad.com/mod/book/view.php?chapterid=1994&id=9801", label: "RÉCIT — transcription et mise en contexte" },
    ],
  },
  {
    number: 4,
    date: "QUÉBEC, 1883",
    title: "Des cantons proposés à la colonisation",
    note: "La carte nomme les bassins des rivières du Lièvre, Rouge, du Nord et de l’Assomption, ainsi que des cantons présentés aux sociétés de colonisation.",
    source: "Source primaire : Au nord : brochure accompagnée d’une carte géographique des cantons à coloniser dans les vallées de l’Outaouais et de la Mattawan, Québec, 1883. Fragment central de la carte dépliante conservée et numérisée par Canadiana.",
    supports: "colonization",
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
    date: "IRLANDE, 1847",
    title: "La famine à Skibbereen",
    note: "Cette illustration de presse représente des habitants transportant un cercueil pendant la Grande Famine en Irlande.",
    source: "Source primaire iconographique : Frederick James Smyth, d’après un croquis de H. Smith, The Famine in Ireland — Funeral at Skibbereen, The Illustrated London News, 30 janvier 1847. Image du domaine public.",
    supports: "transatlantic",
    image: {
      url: "/historical-documents/migrations-famine-skibbereen-1847.jpg",
      alt: "Gravure de presse de 1847 montrant des habitants de Skibbereen transportant un cercueil pendant la famine en Irlande.",
      width: 3000,
      height: 1418,
    },
    links: [
      { url: "https://commons.wikimedia.org/wiki/File:The_Famine_in_Ireland,_Funeral_at_Skibbereen_-_ILN_1847.jpg", label: "Wikimedia Commons — illustration et provenance" },
    ],
  },
  {
    number: 6,
    date: "GROSSE-ÎLE, 27 JUILLET 1847",
    title: "",
    excerpt: "« Vers neuf heures, une embarcation s’approcha; le pilote nous dit que l’homme à bord était le médecin inspecteur. Il demanda au capitaine s’il y avait des malades, de quelle maladie il s’agissait, combien de personnes étaient mortes et combien étaient encore atteintes. [Après avoir examiné un patient], il déclara : “Il y a de la fièvre ici.” Les passagers croyaient que les malades seraient admis à l’hôpital et que les personnes en santé débarqueraient sur l’île [pour y rester avant de gagner Québec]. »",
    attribution: "Journal de Robert Whyte, passager irlandais du George",
    note: "Extrait traduit et recomposé en quatre phrases à partir du journal anglais de Robert Whyte. Les crochets rapprochent des précisions présentes dans le même passage sans changer le point de vue du témoin.",
    source: "Source primaire : journal de Robert Whyte, passager irlandais du George, cité dans André Charbonneau et André Sévigny, 1847, Grosse Île: A Record of Daily Events, Parcs Canada, 1997, p. 165-166. Traduction pédagogique de Socrato.",
    supports: "quarantine",
    links: [
      { url: "https://parks.canada.ca/lhn-nhs/qc/grosseile/culture/histoire-history/publications/a1", label: "Parcs Canada — extrait du journal de Robert Whyte" },
    ],
  },
  {
    number: 7,
    date: "MONTRÉAL, VERS 1858-1860",
    title: "Le pont Victoria en construction",
    note: "La photographie montre les piliers et les installations du chantier du pont Victoria au-dessus du fleuve Saint-Laurent.",
    source: "Source primaire iconographique : William Notman, photographie du pont Victoria en construction, vers 1858-1860. Bibliothèque et Archives Canada, collection Thomas Seaton Scott, PA-181435; reproduction du domaine public.",
    supports: null,
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
    date: "TORONTO, 14 FÉVRIER 1933",
    title: "",
    excerpt: "« Je suis l’enfant le plus âgé de la famille et la seule personne qui travaille; il n’entre que 8 $ par semaine dans notre maison. Mes parents sont très inquiets; nous nous endettons et pouvons à peine acheter le nécessaire. Mes frères et sœurs ont besoin de chaussures et d’autres choses, mais nous n’avons pas l’argent nécessaire. Mon père a cherché un emploi sans succès et l’inquiétude le fait vieillir; [s’il ne trouve rien], notre famille risque d’être séparée. »",
    note: "Extrait traduit et recomposé en quatre phrases à partir de la lettre anglaise. Les crochets simplifient la condition exprimée par l’auteur sans modifier son témoignage sur les difficultés de sa famille.",
    source: "Source primaire : lettre d’une personne de Toronto au premier ministre de l’Ontario George S. Henry, 14 février 1933. Correspondance du premier ministre George S. Henry, Archives publiques de l’Ontario, RG 3-9-0-391. Le nom de l’auteur est omis dans la publication pour protéger sa vie privée. Traduction pédagogique de Socrato.",
    supports: null,
    links: [
      { url: "https://www.archives.gov.on.ca/ao-content/media/uploads/2025/09/Gr10_Letters_Depression.pdf", label: "Archives publiques de l’Ontario — lettre originale et transcription" },
    ],
  },
  {
    number: 9,
    date: "CANADA, 17-23 FÉVRIER 1946",
    title: "",
    excerpt: "« Des familles partagent le même logement; cette occupation par plusieurs familles est un symptôme possible du surpeuplement. [Pour évaluer la situation], le nombre de personnes est comparé au nombre de pièces et de chambres disponibles. L’utilisation, pour dormir, de pièces qui ne sont pas des chambres donne aussi un indice du surpeuplement. Au Canada, environ 404 500 ménages composés d’une seule famille et 52 500 ménages regroupant plusieurs familles utilisent ainsi une ou plusieurs autres pièces pour dormir. »",
    note: "Extrait traduit et recomposé en quatre phrases à partir de l’introduction, de la section VIII et du tableau 9 du rapport. Les crochets simplifient le lien entre les indicateurs sans modifier les constats statistiques.",
    source: "Source statistique primaire : Bureau fédéral de la statistique, Report on Overcrowding and Multiple Occupancy of Dwellings in Canada, February 17-23, 1946, Ottawa, mars 1946, p. 3 et 72-73. Traduction pédagogique de Socrato.",
    supports: null,
    links: [
      { url: "https://publications.gc.ca/collections/collection_2017/statcan/CS2-50-1946-eng.pdf", label: "Publications du gouvernement du Canada — rapport de 1946" },
      { url: "https://publications.gc.ca/site/fra/9.831837/publication.html", label: "Publications du gouvernement du Canada — notice bibliographique" },
    ],
  },
  {
    number: 10,
    date: "BOSTON (NOUVELLE-ANGLETERRE) ET HALIFAX, VERS 1776",
    title: "",
    excerpt: "« Je t’ai écrit plusieurs fois pendant le siège de Boston, sans recevoir de réponse. Je suis privée de mon père, de ma mère, de mon frère et de mes sœurs, et je ne sais pas où ils se trouvent. On me dit que tu es maintenant à Halifax [après le départ de notre famille loyaliste de Boston, en Nouvelle-Angleterre]. Si cette lettre te parvient, donne-moi des nouvelles de toute notre famille. »",
    note: "Extrait traduit et recomposé en quatre phrases à partir de la lettre anglaise. Les crochets explicitent le déplacement de la famille loyaliste de Boston vers Halifax, présenté dans la mise en contexte archivistique.",
    source: "Source primaire : Lucy Knox, lettre à sa sœur loyaliste Hannah Urquhart, vers 1776. Gilder Lehrman Institute of American History, collection GLC02437.05380. Traduction pédagogique de Socrato.",
    supports: null,
    links: [
      { url: "https://hamilton.gilderlehrman.org/supporting-document/lucy-knox-her-loyalist-sister-hannah-urquhart-ca-1776", label: "Gilder Lehrman Institute — lettre, transcription et contexte" },
      { url: "https://www.historysource.org/history-source-sets/loyalists", label: "Massachusetts Historical Society — dossier pédagogique sur les Loyalistes" },
    ],
  },
] as const;

export function emptyMigrationsDraft(): MigrationsDraft {
  return {
    answers: Object.fromEntries(MIGRATIONS_SCHEMA_FIELDS.map(({ id }) => [id, ""])) as Record<MigrationsSchemaFieldId, string>,
    choices: {},
    submitted: false,
  };
}

export function restoreMigrationsDraft(raw: unknown): MigrationsDraft {
  const draft = emptyMigrationsDraft();
  if (!raw || typeof raw !== "object") return draft;
  const value = raw as Record<string, unknown>;
  const record = (item: unknown): Record<string, unknown> => item && typeof item === "object" && !Array.isArray(item) ? item as Record<string, unknown> : {};
  for (const { id } of MIGRATIONS_SCHEMA_FIELDS) {
    const text = record(value.answers)[id];
    if (typeof text === "string") draft.answers[id] = text.slice(0, 2000);
  }
  for (const document of MIGRATIONS_DOCUMENTS) {
    const choice = record(value.choices)[document.number];
    if (choice === "direct" || choice === "exclude") draft.choices[document.number] = choice;
  }
  draft.submitted = value.submitted === true && migrationsMissingCount(draft) === 0;
  return draft;
}

export function migrationsMissingCount(draft: MigrationsDraft) {
  return MIGRATIONS_SCHEMA_FIELDS.filter(({ id }) => !draft.answers[id].trim()).length
    + MIGRATIONS_DOCUMENTS.filter(({ number }) => !draft.choices[number]).length;
}

export function expectedMigrationsDocumentChoice(number: number): Exclude<MigrationsDocumentChoice, ""> {
  return number >= 7 ? "exclude" : "direct";
}

export const MIGRATIONS_DOCUMENT_FEEDBACK: Record<number, string> = {
  1: "La hausse de la part urbaine et la baisse de la part rurale permettent d’établir une urbanisation associée à l’exode rural. Le tableau seul ne permet toutefois pas d’attribuer tout ce changement aux départs des campagnes.",
  2: "La carte fait ressortir les concentrations de personnes nées au Canada dans le nord-est des États-Unis, où se trouvent les villes industrielles de la Nouvelle-Angleterre.",
  3: "Le rapport de 1849 nomme plusieurs facteurs de départ : dettes, mauvaises récoltes, difficultés agricoles et accès limité aux marchés.",
  4: "La carte montre des cantons et des vallées proposés aux sociétés de colonisation pour établir des familles sur de nouvelles terres au Québec.",
  5: "L’illustration témoigne de la Grande Famine qui pousse de nombreux Irlandais à quitter l’Irlande pendant les années 1840.",
  6: "Le journal de Robert Whyte décrit l’inspection médicale des navires, l’hôpital et le séjour prévu à Grosse-Île avant l’arrivée à Québec.",
  7: "À discriminer : le pont Victoria témoigne de l’industrialisation et du développement des infrastructures de transport. La photographie ne décrit toutefois aucun des mouvements migratoires ou des moyens d’intervention demandés dans le schéma.",
  8: "À discriminer : cette lettre décrit l’endettement, le manque de biens essentiels et le chômage vécus par une famille en 1933. Elle appartient à une autre période historique et ne répond à aucune case du schéma sur les migrations de 1840 à 1896.",
  9: "À discriminer : ce rapport de 1946 décrit le surpeuplement de certains logements et l’utilisation de pièces autres que des chambres pour dormir. Il appartient à une autre période et ne renseigne pas sur les mouvements migratoires demandés dans le schéma.",
  10: "À discriminer : la lettre de Lucy Knox évoque la séparation d’une famille loyaliste partie de Boston, en Nouvelle-Angleterre, pour se réfugier à Halifax pendant la guerre d’Indépendance américaine. Cette émigration vers 1776 appartient à une autre période et ne répond à aucune des cases du schéma sur les migrations de 1840 à 1896.",
};
