export const POLITIQUE_NATIONALE_ACTIVITY_ID = "politique-nationale-partie-b-v2";
export const POLITIQUE_NATIONALE_TITLE = "Le Canada, 1873-1896";
export const POLITIQUE_NATIONALE_INSTRUCTION = "Décrivez le contexte et les principales composantes d’une politique mise en œuvre par le gouvernement canadien à partir de 1879. Complétez le schéma à l’aide de vos connaissances et des documents pertinents. Pour chaque document, choisissez « Utile » ou « À discriminer » selon son lien avec cette politique.";

export const POLITIQUE_NATIONALE_SCHEMA_FIELDS = [
  {
    id: "object",
    prompt: "Nommez la politique économique et territoriale mise en œuvre par le gouvernement fédéral à partir de 1879.",
    answer: "La Politique nationale.",
  },
  {
    id: "context",
    prompt: "Nommez le contexte économique qui favorise l’adoption de cette politique.",
    answer: "La crise économique de 1873 et la dépression qui se prolonge pendant les années 1870 (document 1).",
  },
  {
    id: "adoption",
    prompt: "Nommez le premier ministre dont le gouvernement met cette politique en œuvre et indiquez l’année.",
    answer: "Le gouvernement conservateur de John A. Macdonald la met en œuvre en 1879 (document 2).",
  },
  {
    id: "industrial",
    prompt: "Décrivez un changement de l’activité industrielle associé à cette politique.",
    answer: "L’activité industrielle prend de l’expansion : les établissements manufacturiers occupent une plus grande partie des rives du canal de Lachine et la grande industrie textile apparaît (document 4).",
  },
  {
    id: "tariff",
    prompt: "Décrivez la mesure qui concerne les produits importés.",
    answer: "Le gouvernement augmente les droits de douane sur plusieurs produits importés afin de protéger et de favoriser les industries canadiennes : c’est une politique tarifaire protectionniste (document 3).",
  },
  {
    id: "railway",
    prompt: "Décrivez la mesure qui relie l’Est et l’Ouest du Canada.",
    answer: "Le gouvernement soutient la construction du chemin de fer transcontinental du Canadien Pacifique. Le dernier crampon est posé en 1885 (document 5).",
  },
  {
    id: "settlement",
    prompt: "Décrivez la mesure qui vise les terres de l’Ouest.",
    answer: "Le gouvernement favorise la colonisation des terres de l’Ouest en offrant des lots aux colons et en encourageant leur établissement, notamment au Manitoba et dans les Territoires du Nord-Ouest (document 7).",
  },
] as const;

export type PolitiqueNationaleSchemaFieldId = (typeof POLITIQUE_NATIONALE_SCHEMA_FIELDS)[number]["id"];
export type PolitiqueNationaleAnswerFeedback = { status: "recognized" | "partial" | "review"; label: string; message: string };

const LOCAL_ANSWER_RULES: Record<PolitiqueNationaleSchemaFieldId, { accepted: RegExp[]; related: RegExp; hint: string }> = {
  object: {
    accepted: [/\bpolitique nationale\b/],
    related: /\b(politique|macdonald|protectionnisme|tarif)\b/,
    hint: "Nommez le programme fédéral complet, et non une seule de ses mesures.",
  },
  context: {
    accepted: [/\bcrise (economique )?(de |en |des annees )?1873\b/, /\b(depression|ralentissement|recession) (economique )?(des |dans les )?annees 1870\b/],
    related: /\b(crise|depression|ralentissement|recession|1873)\b/,
    hint: "Précisez qu’il s’agit de la crise économique de 1873 ou de la dépression des années 1870.",
  },
  industrial: {
    accepted: [/\b(expansion|developpement|croissance|essor).{0,40}(industrie|industriel|manufactur)/, /\b(industrie|activite industrielle|manufactures?|usines?).{0,40}(s etend|augment|se developp|prend de l expansion|croissance)/, /\b(grande industrie textile|industrie textile)\b/],
    related: /\b(industrie|industriel|manufactures?|usines?|textile|canal de lachine|entreprises?)\b/,
    hint: "Décrivez l’expansion de l’activité manufacturière ou l’apparition de la grande industrie textile.",
  },
  adoption: {
    accepted: [/\b(macdonald|conservateurs?|gouvernement conservateur).{0,45}\b1879\b/, /\b1879\b.{0,45}\b(macdonald|conservateurs?|gouvernement conservateur)\b/],
    related: /\b(1878|1879|macdonald|conservateurs?|gouvernement)\b/,
    hint: "La réponse doit préciser à la fois le premier ministre John A. Macdonald et l’année 1879.",
  },
  tariff: {
    accepted: [/\b(hausse|augmentation|relevement).{0,35}(tarifs?|droits? de douane)\b/, /\b(tarifs?|droits? de douane).{0,35}(protecteurs?|eleves?|augmentes?|hausses?)\b/, /\b(protectionnisme|politique tarifaire protectionniste|proteger les industries? canadiennes?)\b/],
    related: /\b(tarifs?|douane|importations?|produits?|industries?|protection)\b/,
    hint: "Précisez que les droits de douane sur des produits importés sont augmentés afin de protéger les industries canadiennes.",
  },
  railway: {
    accepted: [/\b(canadien pacifique|canadian pacific|cpr)\b/, /\bchemin de fer transcontinental\b/, /\breseau ferroviaire.{0,35}(est|ouest|pacifique)\b/],
    related: /\b(chemin de fer|rail|ferroviaire|train|1885|1886|pacifique)\b/,
    hint: "Nommez le chemin de fer transcontinental du Canadien Pacifique et son rôle de liaison entre l’Est et l’Ouest.",
  },
  settlement: {
    accepted: [/\bcolonisation (des terres )?(de |dans |vers )?l ouest\b/, /\b(peupler|peuplement|etablissement|installer).{0,40}(ouest|manitoba|territoires du nord ouest|colons?)\b/, /\b(terres?|lots?).{0,50}(gratuites?|160 acres|colons?|offertes?|accordees?)\b/, /\b(offrir|accorder|donner).{0,50}(terres?|lots?).{0,30}(ouest|colons?)\b/, /\bimmigration.{0,35}(ouest|manitoba|territoires du nord ouest)\b/],
    related: /\b(ouest|terres?|colons?|colonisation|immigration|manitoba|160 acres)\b/,
    hint: "Précisez que le gouvernement veut établir des colons sur les terres de l’Ouest, notamment par l’offre de lots.",
  },
};

function normalizeAnswer(answer: string) {
  return answer.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’']/g, " ").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function assessPolitiqueNationaleAnswer(id: PolitiqueNationaleSchemaFieldId, answer: string): PolitiqueNationaleAnswerFeedback {
  const text = normalizeAnswer(answer);
  const rule = LOCAL_ANSWER_RULES[id];
  const review = (message: string): PolitiqueNationaleAnswerFeedback => ({ status: "review", label: "À vérifier", message });
  if (!text) return review("Aucune réponse à vérifier.");
  if (text.length > 260 || /\b(ne|n|pas|non|aucun|aucune|jamais|sans|sauf|contraire|plutot|mais|ou|peut etre|sais|refuse|refusent|refuser)\b/.test(text)) return review("Votre formulation demande une lecture humaine : comparez-la au corrigé ou faites-la valider par l’enseignant.");
  if (/\b(1929|grande depression|intercolonial|empress of ireland|bateau a vapeur|grand tronc pacifique|voie maritime du saint laurent|hydro quebec|libre echange integral)\b/.test(text)) return review("Vérifiez la politique, le réseau ou la période évoqués : cette formulation semble renvoyer à un autre contexte historique.");
  if (rule.accepted.some((pattern) => pattern.test(text))) return { status: "recognized", label: "Réponse reconnue", message: "Votre réponse contient une formulation attendue pour cette case. Cette reconnaissance locale ne garantit pas la justesse de toute la phrase." };
  if (rule.related.test(text)) return { status: "partial", label: "À préciser", message: rule.hint };
  return review("Cette formulation n’est pas reconnue; elle n’est pas nécessairement fausse. Comparez-la à la piste de réponse ou consultez l’enseignant.");
}

export type PolitiqueNationaleDocumentChoice = "" | "direct" | "exclude";
export type PolitiqueNationaleDraft = {
  answers: Record<PolitiqueNationaleSchemaFieldId, string>;
  choices: Record<string, PolitiqueNationaleDocumentChoice>;
  submitted: boolean;
};

export const POLITIQUE_NATIONALE_DOCUMENTS = [
  {
    number: 1,
    date: "CANADA, 1872-1879",
    title: "Prix de gros des bouvillons au Canada",
    note: "Un bouvillon est un jeune bovin destiné à la production de viande. Les prix sont exprimés en cents par livre (¢/lb).",
    source: "Source statistique : Statistique Canada, Statistiques historiques du Canada, série M234, « Prix de gros de certains produits agricoles, 1867 à 1974 ». Les données de 1870 à 1889 proviennent de H. Michell, Statistics of Price, 1931.",
    supports: "context",
    links: [
      { url: "https://epe.lac-bac.gc.ca/100/200/301/statcan/historical_statistics_can-e/sectionm/M228_238.csv?nodisclaimer=1", label: "Statistique Canada — tableau M228-238" },
      { url: "https://epe.lac-bac.gc.ca/100/200/301/statcan/historical_statistics_can-e/sectionm/sectionm.htm?nodisclaimer=1", label: "Statistique Canada — source et précisions de la série M234" },
    ],
    table: {
      headers: ["Année", "Prix de gros des bouvillons (¢/lb)"],
      rows: [["1872", "7,58"], ["1873", "7,21"], ["1874", "5,80"], ["1875", "5,16"], ["1876", "4,86"], ["1877", "5,17"], ["1878", "4,80"], ["1879", "4,61"]],
    },
  },
  {
    number: 2,
    date: "CHAMBRE DES COMMUNES, 14 MARS 1879",
    title: "Le budget de 1879 et le nouveau tarif",
    excerpt: "À propos du tarif douanier proposé sur les produits importés, Tilley annonce : « Voitures de chemin de fer, wagons, traîneaux, brouettes et véhicules semblables : un droit de 25 % de leur valeur; meubles de maison ou d’ébénisterie : un droit de 35 % de leur valeur. » — Samuel Leonard Tilley, ministre des Finances.",
    note: "Le premier ministre est John A. Macdonald. Tilley est son ministre des Finances : il présente le budget au nom du gouvernement conservateur.",
    source: "Source primaire : Débats de la Chambre des communes du Canada, discours du budget de Samuel Leonard Tilley, 14 mars 1879, p. 420. Court extrait traduit et adapté de l’anglais.",
    supports: "adoption",
    links: [
      { url: "https://lop.parl.ca/staticfiles/ParlInfo/Documents/Budgets/En/1879-03-14.pdf", label: "Bibliothèque du Parlement — budget de 1879" },
    ],
  },
  {
    number: 3,
    date: "CHAMBRE DES COMMUNES, 12 MAI 1887",
    title: "Macdonald défend les tarifs protecteurs",
    excerpt: "John A. Macdonald affirme que la Politique nationale a stimulé les industries du pays, fourni du travail à la main-d’œuvre canadienne et gardé davantage d’argent au Canada. Il propose d’étendre cette protection à l’industrie du fer, dont les produits importés concurrencent la production canadienne.",
    note: "Résumé fidèle d’un discours parlementaire; les affirmations expriment le point de vue de Macdonald.",
    source: "Source primaire : Débats de la Chambre des communes du Canada, 12 mai 1887, p. 384 et suivantes. Résumé français d’un discours anglais du domaine public.",
    supports: "tariff",
    links: [
      { url: "https://bdp.parl.ca/staticfiles/ParlInfo/Documents/Budgets/En/1887-05-12.pdf", label: "Bibliothèque du Parlement — débat de 1887" },
    ],
  },
  {
    number: 4,
    date: "MONTRÉAL, 1880-1896",
    title: "L’expansion industrielle le long du canal de Lachine",
    excerpt: "Entre 1880 et 1896, l’activité industrielle s’accélère le long du canal de Lachine. Les établissements, d’abord concentrés autour des sites hydrauliques, occupent graduellement les rives à l’est de l’écluse de Côte-Saint-Paul. La grande industrie textile apparaît. Le secteur réunit notamment des meuneries, des clouteries, des fonderies, des chantiers navals et des usines de matériel ferroviaire.",
    note: "",
    source: "Source secondaire : Parcs Canada, « Le berceau de l’industrialisation », section La pleine expansion. Reformulation pédagogique de Socrato.",
    supports: "industrial",
    links: [
      { url: "https://parcs.canada.ca/lhn-nhs/qc/canallachine/culture/histoire-history/industrialisation", label: "Parcs Canada — canal de Lachine" },
    ],
  },
  {
    number: 5,
    date: "CRAIGELLACHIE, 7 NOVEMBRE 1885",
    title: "La pose du dernier crampon du Canadien Pacifique",
    note: "Donald A. Smith pose le dernier crampon de la voie ferrée transcontinentale du Canadien Pacifique, en Colombie-Britannique.",
    source: "Source primaire : Alexander Ross, photographie, 7 novembre 1885. Bibliothèque et Archives Canada, C-003693, no d’article 3194528. Droits expirés; reproduction numérique via Wikimedia Commons.",
    supports: "railway",
    image: {
      url: "/historical-documents/politique-nationale-dernier-crampon-1885.jpg",
      alt: "Donald A. Smith frappe le dernier crampon du Canadien Pacifique devant un groupe d’hommes réunis sur la voie ferrée à Craigellachie en 1885.",
      width: 1280,
      height: 1024,
    },
    links: [
      { url: "https://recherche-collection-search.bac-lac.gc.ca/eng/Home/Record?IdNumber=3194528&app=fonandcol&ecopy=c003693", label: "Bibliothèque et Archives Canada — C-003693" },
      { url: "https://commons.wikimedia.org/wiki/File:Donald_A._Smith_driving_the_Last_Spike_to_complete_the_Canadian_Pacific_Railway,_1885.jpg", label: "Wikimedia Commons — photographie et droits" },
    ],
  },
  {
    number: 6,
    date: "CANADA, VERS 1914",
    title: "Le paquebot à vapeur Empress of Ireland",
    note: "Construit en 1906, l’Empress of Ireland transporte des passagers et du courrier entre Liverpool et Québec. Il est propulsé par des machines à vapeur.",
    source: "Source primaire : Agence Rol, photographie de l’Empress of Ireland, vers 1914. Bibliothèque nationale de France. Image du domaine public reproduite par Wikimedia Commons.",
    supports: null,
    image: {
      url: "/historical-documents/politique-nationale-empress-of-ireland-1914.jpg",
      alt: "Photographie en noir et blanc du paquebot à vapeur Empress of Ireland en mer, vers 1914.",
      width: 1920,
      height: 1121,
    },
    links: [
      { url: "https://commons.wikimedia.org/wiki/File:Empress-of-Ireland.jpg", label: "Wikimedia Commons — photographie et provenance" },
      { url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=fonandcol&idnumber=3191614", label: "Bibliothèque et Archives Canada — l’Empress of Ireland en 1908" },
    ],
  },
  {
    number: 7,
    date: "OUEST CANADIEN, 1892",
    title: "Des fermes gratuites dans l’Ouest canadien",
    note: "La couverture annonce des « fermes gratuites » au Manitoba ainsi que dans les districts d’Assiniboia, d’Alberta et de Saskatchewan.",
    source: "Source primaire : Compagnie du chemin de fer Canadien Pacifique, Fermes gratuites, Manitoba, Assiniboia, Alberta, Saskatchewan, brochure publicitaire en français, 1892. Exemplaire des Archives publiques du Canada, numérisé par Canadiana.",
    supports: "settlement",
    image: {
      url: "/historical-documents/politique-nationale-fermes-gratuites-1892.png",
      alt: "Couverture française portant le titre Fermes gratuites et nommant le Manitoba, l’Assiniboia, l’Alberta et la Saskatchewan.",
      width: 1154,
      height: 2067,
    },
    links: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Fermes_gratuites%2C_Manitoba%2C_Assiniboia%2C_Alberta%2C_Saskatchewan_%28microforme%29_-_les_quatres_grandes_provinces_fertiles_de_l%27ouest_canadien_%28IA_cihm_03416%29.pdf", label: "Canadiana — brochure complète numérisée" },
      { url: "https://onlinebooks.library.upenn.edu/webbin/book/lookupname?key=Canadian+Pacific+Railway+Company", label: "The Online Books Page — notice bibliographique" },
    ],
  },
  {
    number: 8,
    date: "KINGSTON, 27 JUIN 1877",
    title: "Les réformes politiques d’Alexander Mackenzie",
    excerpt: "« La première chose que nous avons faite a été de présenter une loi électorale complète, qui établissait les élections du pays sur des bases solides et satisfaisantes, tout en les rendant efficaces et moins coûteuses. […] Nous avons confié [la préparation des listes électorales] aux autorités déléguées des municipalités, là où elle devait être. Quand nous sommes arrivés au pouvoir, nous avons immédiatement promis [une loi créant la Cour suprême]; nous l’avons immédiatement adoptée, et elle a connu un grand succès. S’il est deux mesures dont nous pouvons particulièrement nous féliciter, ce sont la loi électorale et la loi sur la Cour suprême. »",
    note: "",
    source: "Source primaire : Alexander Mackenzie, discours prononcé à Kingston le 27 juin 1877, dans Reform Government in the Dominion: The Pic-Nic Speeches Delivered in the Province of Ontario During the Summer of 1877, Toronto, Globe Printing and Publishing Company, 1878, p. 10-11. Extrait traduit et recomposé en quatre phrases; les crochets rendent explicites des éléments déjà nommés dans le passage.",
    supports: null,
    links: [
      { url: "https://archive.org/download/reformgovernment00mack/reformgovernment00mack.pdf", label: "Internet Archive — édition numérisée du recueil" },
      { url: "https://www.britishcolumbiahistory.ca/sections/documents/Leaders/Alexander_Mackenzie/Reform_Government_in_the_Dominion.html", label: "British Columbia History — transcription du discours" },
    ],
  },
  {
    number: 9,
    date: "CANADA, 12 AVRIL 1876",
    title: "La Loi sur les Indiens et l’administration fédérale",
    excerpt: "« La présente loi sera connue sous le nom de Loi sur les Indiens de 1876. […] Le ministre de l’Intérieur sera surintendant général des Affaires indiennes. »",
    note: "",
    source: "Source primaire : Parlement du Canada, Loi sur les Indiens de 1876, 39 Victoria, chapitre 18, articles 1 et 2, p. 43-44. Traduction-adaptation française d’un texte législatif anglais du domaine public.",
    supports: null,
    links: [
      { url: "https://publications.gc.ca/collections/collection_2017/aanc-inac/R5-158-2-1978-eng.pdf", label: "Gouvernement du Canada — reproduction de la loi de 1876" },
    ],
  },
  {
    number: 10,
    date: "PROVINCE DU CANADA, 30 MAI 1849",
    title: "Les femmes exclues du droit de vote",
    excerpt: "« Le votant doit être sujet britannique et avoir au moins vingt et un ans. […] Aucune femme ne peut voter à une élection de comté, de circonscription, de cité ou de ville. »",
    note: "",
    source: "Source primaire : Parlement de la Province du Canada, loi électorale du 30 mai 1849, 12 Victoria, chapitre 27, articles XLII et XLVI, p. 188-189. Traduction-adaptation française d’un texte législatif anglais du domaine public.",
    supports: null,
    links: [
      { url: "https://bnald.lib.unb.ca/legislation/act-repeal-certain-acts-therein-mentioned-and-amend-consolidate-and-reduce-one-act", label: "Université du Nouveau-Brunswick — notice de la loi" },
      { url: "https://bnald.lib.unb.ca/sites/default/files/UnC.1849.ch_.27_0.pdf", label: "Université du Nouveau-Brunswick — loi numérisée" },
    ],
  },
] as const;

export function emptyPolitiqueNationaleDraft(): PolitiqueNationaleDraft {
  return {
    answers: Object.fromEntries(POLITIQUE_NATIONALE_SCHEMA_FIELDS.map(({ id }) => [id, ""])) as Record<PolitiqueNationaleSchemaFieldId, string>,
    choices: {},
    submitted: false,
  };
}

export function restorePolitiqueNationaleDraft(raw: unknown): PolitiqueNationaleDraft {
  const draft = emptyPolitiqueNationaleDraft();
  if (!raw || typeof raw !== "object") return draft;
  const value = raw as Record<string, unknown>;
  const record = (item: unknown): Record<string, unknown> => item && typeof item === "object" && !Array.isArray(item) ? item as Record<string, unknown> : {};
  for (const { id } of POLITIQUE_NATIONALE_SCHEMA_FIELDS) {
    const text = record(value.answers)[id];
    if (typeof text === "string") draft.answers[id] = text.slice(0, 2000);
  }
  for (const document of POLITIQUE_NATIONALE_DOCUMENTS) {
    const choice = record(value.choices)[document.number];
    if (choice === "direct" || choice === "exclude") draft.choices[document.number] = choice;
    if (choice === "context") draft.choices[document.number] = "direct";
  }
  draft.submitted = value.submitted === true && politiqueNationaleMissingCount(draft) === 0;
  return draft;
}

export function politiqueNationaleMissingCount(draft: PolitiqueNationaleDraft) {
  return POLITIQUE_NATIONALE_SCHEMA_FIELDS.filter(({ id }) => !draft.answers[id].trim()).length
    + POLITIQUE_NATIONALE_DOCUMENTS.filter(({ number }) => !draft.choices[number]).length;
}

export function expectedPolitiqueNationaleDocumentChoice(number: number): Exclude<PolitiqueNationaleDocumentChoice, ""> {
  return [6, 8, 9, 10].includes(number) ? "exclude" : "direct";
}

export const POLITIQUE_NATIONALE_DOCUMENT_FEEDBACK: Record<number, string> = {
  1: "La diminution du prix de gros des bouvillons entre 1872 et 1879 permet de dégager une tendance et de la rattacher au contexte économique qui suit la crise de 1873.",
  2: "En 1879, Samuel Leonard Tilley présente le budget au nom du gouvernement conservateur dirigé par le premier ministre John A. Macdonald.",
  3: "Le discours de Macdonald expose l’objectif protecteur de la hausse des droits de douane.",
  4: "Les faits présentés permettent d’associer la période à l’expansion de l’activité manufacturière et à l’apparition de la grande industrie textile.",
  5: "La photographie documente l’achèvement du chemin de fer transcontinental du Canadien Pacifique en 1885.",
  6: "À discriminer : l’Empress of Ireland appartient au début du 20e siècle et témoigne du transport transatlantique à vapeur; il ne fait pas partie de la Politique nationale.",
  7: "La brochure française du Canadien Pacifique annonce des fermes gratuites dans les régions de l’Ouest canadien afin d’y attirer des colons.",
  8: "À discriminer : Alexander Mackenzie présente des réformes électorales et la création de la Cour suprême; ces mesures politiques et institutionnelles ne font pas partie de la Politique nationale.",
  9: "À discriminer : la Loi sur les Indiens de 1876 concerne l’administration fédérale des affaires autochtones; elle ne constitue pas une composante de la Politique nationale.",
  10: "À discriminer : la loi électorale de 1849 concerne les conditions du droit de vote dans la Province du Canada; elle ne porte pas sur la Politique nationale.",
};
