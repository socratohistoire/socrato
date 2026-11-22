export const POLITIQUE_NATIONALE_ACTIVITY_ID = "politique-nationale-partie-b-v3-evaluation";
export const POLITIQUE_NATIONALE_TITLE = "Le Canada, 1873-1896";
export const POLITIQUE_NATIONALE_INSTRUCTION = "Décrivez la politique économique et territoriale mise en œuvre par le gouvernement canadien à partir de 1879. Remplissez le schéma à l’aide de vos connaissances et des documents pertinents. Formulez des réponses courtes et précises. Seul le schéma est évalué, sur 8 points.";

export const POLITIQUE_NATIONALE_SCHEMA_FIELDS = [
  {
    id: "object",
    prompt: "Nommez la politique économique et territoriale mise en œuvre par le gouvernement fédéral à partir de 1879.",
  },
  {
    id: "context",
    prompt: "Nommez le contexte économique dans lequel cette mesure douanière est adoptée.",
  },
  {
    id: "trade",
    prompt: "Décrivez un échange de marchandises entre l’Ouest et l’Est que ce chemin de fer favorise.",
  },
  {
    id: "industrial",
    prompt: "Décrivez un changement de l’activité industrielle associé à cette mesure.",
  },
  {
    id: "tariff",
    prompt: "Décrivez la mesure qui concerne les produits importés.",
  },
  {
    id: "railway",
    prompt: "Nommez le chemin de fer transcontinental.",
  },
  {
    id: "settlement",
    prompt: "Décrivez une mesure qui encourage l’établissement de colons dans l’Ouest desservi par ce chemin de fer.",
  },
] as const;
export const POLITIQUE_NATIONALE_BRANCHES = [
  { central: "tariff", details: ["context", "industrial"], label: "Protection des industries canadiennes" },
  { central: "railway", details: ["settlement", "trade"], label: "Développement de l’Ouest et du marché intérieur" },
] as const;
export const POLITIQUE_NATIONALE_ANSWERS: Record<PolitiqueNationaleSchemaFieldId, string> = {
  object: "La Politique nationale.",
  tariff: "Le gouvernement augmente les droits de douane sur les produits importés pour protéger les industries canadiennes (document 2). Accepter une politique tarifaire protectionniste clairement décrite. « Des taxes » seul est insuffisant.",
  context: "La crise économique de 1873 ou la dépression économique des années 1870 (document 1). Accepter un ralentissement économique des années 1870, marqué par la baisse des prix et les difficultés des entreprises. Une baisse du prix des bouvillons seule ne caractérise pas suffisamment le contexte général.",
  industrial: "L’activité manufacturière prend de l’expansion, les établissements industriels se multiplient ou s’étendent, ou la grande industrie textile se développe (document 4). Nommer seulement « textile » ne décrit pas un changement.",
  railway: "Le chemin de fer transcontinental du Canadien Pacifique, représenté en rouge dans le document 5. Accepter Canadien Pacifique ou CPR : cette case demande de nommer le réseau. Un chemin de fer sans identification est incomplet. La carte décrit l’état des réseaux en 1900 et ne constitue pas une preuve de leur date d’achèvement.",
  settlement: "L’offre de lots agricoles aux colons, présentés comme des fermes gratuites dans l’Ouest (document 7), encourage la colonisation des terres de l’Ouest. Les Premières Nations et les Métis y vivent déjà. La gratuité annoncée est soumise à des conditions d’établissement.",
  trade: "Du grain ou d’autres produits agricoles de l’Ouest sont acheminés vers les marchés de l’Est, ou des produits manufacturés de l’Est sont vendus aux habitants de l’Ouest (document 3). Une direction correcte et le type de marchandises suffisent. Accepter les deux directions. « Transport de marchandises » seul est trop vague.",
};
export function scorePolitiqueNationaleRelation(central: 0 | 1 | 2, details: 0 | 1 | 2): number {
  if (central === 2) return 1 + details;
  if (central === 1) return details;
  return details === 2 ? 1 : 0;
}

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
    accepted: [/\b(expansion|developpement|croissance|essor).{0,40}(industrie|industriel|manufactur)/, /\b(industrie|activite industrielle|manufactures?|usines?).{0,40}(s etend|augment|se developp|prend de l expansion|croissance|apparait)/],
    related: /\b(industrie|industriel|manufactures?|usines?|textile|canal de lachine|entreprises?)\b/,
    hint: "Décrivez l’expansion de l’activité manufacturière ou l’apparition de la grande industrie textile.",
  },
  trade: {
    accepted: [/\b(grain|ble|cereales|produits agricoles).{0,65}\bouest\b.{0,35}\best\b/, /\b(produits manufactures|biens manufactures).{0,65}\best\b.{0,35}\bouest\b/],
    related: /\b(marchandises|commerce|echanges|grain|ble|produits|marche|est|ouest)\b/,
    hint: "Précisez les marchandises et la direction : produits agricoles de l’Ouest vers l’Est, ou produits manufacturés de l’Est vers l’Ouest.",
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
    date: "CANADA, 1873-1879",
    title: "Deux indicateurs économiques au Canada",
    note: "Un bouvillon est un jeune bovin destiné à la production de viande. La dernière colonne présente les montants en dollars associés aux faillites commerciales, et non le nombre d’entreprises. La série des faillites est présentée rétrospectivement par Charles Tupper en 1887.",
    source: "Source statistique : Statistique Canada, Statistiques historiques du Canada, série M234 (prix des bouvillons, d’après H. Michell, 1931); Charles Tupper, discours budgétaire du 12 mai 1887, tableau Business Failures in Canada, p. 25 (page 25 du PDF). Mise en tableau pédagogique de deux séries distinctes.",
    supports: "context",
    links: [
      { url: "https://epe.lac-bac.gc.ca/100/200/301/statcan/historical_statistics_can-e/sectionm/M228_238.csv?nodisclaimer=1", label: "Statistique Canada — tableau M228-238" },
      { url: "https://epe.lac-bac.gc.ca/100/200/301/statcan/historical_statistics_can-e/sectionm/sectionm.htm?nodisclaimer=1", label: "Statistique Canada — source et précisions de la série M234" },
      { url: "https://publications.gc.ca/collections/collection_2016/fin/F1-23-1-1887-eng.pdf#page=25", label: "Budget de 1887 — montants associés aux faillites" },
    ],
    table: {
      headers: ["Année", "Prix de gros des bouvillons (¢/lb)", "Montants associés aux faillites ($)"],
      rows: [["1873", "7,21", "12 334 000"], ["1874", "5,80", "7 696 000"], ["1875", "5,16", "28 843 000"], ["1876", "4,86", "25 517 000"], ["1877", "5,17", "25 523 000"], ["1878", "4,80", "23 908 000"], ["1879", "4,61", "29 347 000"]],
    },
  },
  {
    number: 2,
    date: "CHAMBRE DES COMMUNES, 14 MARS 1879",
    title: "",
    excerpt: "À propos du tarif douanier proposé sur les produits importés, Tilley annonce : « Voitures de chemin de fer, wagons, traîneaux, brouettes et véhicules semblables : un droit de 25 % de leur valeur; meubles de maison ou d’ébénisterie : un droit de 35 % de leur valeur. » — Samuel Leonard Tilley, ministre des Finances.",
    note: "Les pourcentages indiquent la part de la valeur du produit importé prélevée en droits de douane.",
    source: "Source primaire : Débats de la Chambre des communes du Canada, discours du budget de Samuel Leonard Tilley, 14 mars 1879, p. 420. Court extrait traduit et adapté de l’anglais.",
    supports: "tariff",
    links: [
      { url: "https://lop.parl.ca/staticfiles/ParlInfo/Documents/Budgets/En/1879-03-14.pdf", label: "Bibliothèque du Parlement — budget de 1879" },
    ],
  },
  {
    number: 3,
    date: "CHAMBRE DES COMMUNES, 26 FÉVRIER 1886",
    title: "Les échanges entre les régions canadiennes",
    excerpt: "Le chemin de fer rend possible l’établissement de colons dans les Prairies. Il permet d’y cultiver du grain et de l’acheminer vers les marchés. Des quantités importantes de grain ont déjà été apportées du Nord-Ouest vers cette partie du Canada. À mesure que la population de l’Ouest augmente, les produits des régions de l’Est peuvent y trouver de nouveaux acheteurs.",
    note: "Résumé français des propos d’Horace Everett, député de Saint-Jean au Nouveau-Brunswick, favorable au gouvernement. Le discours adopte une perspective colonisatrice : les Prairies sont déjà habitées par les Premières Nations et les Métis.",
    source: "Source primaire sous-jacente : Horace Everett, Débats de la Chambre des communes, 26 février 1886, p. 11-12 (PDF, p. 3-4). Résumé pédagogique français, non citation littérale.",
    supports: "trade",
    links: [
      { url: "https://primarydocuments.ca/wp-content/uploads/2019/10/HOCDebates26February1886.pdf#page=4", label: "Débats de la Chambre des communes — 26 février 1886" },
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
    date: "CANADA, 1900 — REPÈRE RÉTROSPECTIF",
    title: "Les réseaux ferroviaires du Canada",
    note: "Carte de synthèse représentant les réseaux en 1900, utilisée comme repère rétrospectif pour identifier la liaison transcontinentale développée pendant la période étudiée. Les couleurs distinguent les tracés; les noms des compagnies ne sont pas indiqués. Cette carte ne permet pas de dater l’achèvement des lignes.",
    source: "Source secondaire : carte pédagogique de Socrato, tracés historiques simplifiés d’après Historical Canadian Railroads, University of Toronto Libraries, Borealis (doi:10.5683/SP2/UCCFVQ). Fond territorial : Ressources naturelles Canada, limites de 1898 utilisées pour le Canada en 1900. Ce document est une reconstitution cartographique, non une carte d’archives.",
    supports: "railway",
    image: {
      url: "/historical-documents/industrialisation-reseaux-ferroviaires-carte.png",
      alt: "Carte du Canada en 1900, sans noms de compagnies ferroviaires. Le tracé rouge relie Vancouver à Montréal par Calgary et Winnipeg. Le tracé bleu relie Windsor, Toronto, Montréal et Portland. Le tracé vert rejoint les Maritimes et Halifax depuis la rive sud du Saint-Laurent.",
      width: 1800,
      height: 1140,
    },
    links: [
      { url: "https://doi.org/10.5683/SP2/UCCFVQ", label: "University of Toronto Libraries — Historical Canadian Railroads" },
      { url: "https://geoappext.nrcan.gc.ca/arcgis/rest/services/FGP/TE/MapServer/316", label: "Ressources naturelles Canada — fond territorial" },
    ],
  },
  {
    number: 6,
    date: "",
    title: "L’Empress of Ireland transporte des passagers et du courrier entre Liverpool et Québec. Il est propulsé par des machines à vapeur.",
    note: "",
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
    title: "",
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
    date: "BAS-CANADA, 30 AOÛT 1851",
    title: "La mise à part de terres pour les Premières Nations",
    excerpt: "« Des terres du Bas-Canada, jusqu’à un maximum total de [230 000 acres], peuvent être décrites, arpentées et mises à part par le commissaire des terres de la Couronne. […] Ces terres sont destinées à l’usage des [Premières Nations] désignées par décret. […] Aucun prix ni paiement n’est exigé pour ces terres. […] Leur gestion est confiée au commissaire des terres indiennes pour le Bas-Canada. »",
    note: "Traduction-adaptation en quatre phrases de l’article I. Les […] indiquent les coupures et les autres crochets signalent une modernisation du vocabulaire ou de la notation. Cette loi autorise de nouvelles réserves; elle n’est pas à l’origine de toutes les réserves du Québec.",
    source: "Source primaire : Parlement de la Province du Canada, An Act to authorize the setting apart of Lands for the use of certain Indian Tribes in Lower Canada, 30 août 1851, 14 & 15 Victoria, chapitre 106, article I, p. 2096. Texte reproduit par la British North American Legislative Database de l’Université du Nouveau-Brunswick. Traduction-adaptation française d’un texte anglais du domaine public.",
    supports: null,
    links: [
      { url: "https://bnald.lib.unb.ca/sites/default/files/UnC.1851.ch_.106_0.pdf", label: "Université du Nouveau-Brunswick — texte de la loi du 30 août 1851" },
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
  return POLITIQUE_NATIONALE_SCHEMA_FIELDS.filter(({ id }) => !draft.answers[id].trim()).length;
}

export function expectedPolitiqueNationaleDocumentChoice(number: number): Exclude<PolitiqueNationaleDocumentChoice, ""> {
  return [6, 8, 9, 10].includes(number) ? "exclude" : "direct";
}

export const POLITIQUE_NATIONALE_DOCUMENT_FEEDBACK: Record<number, string> = {
  1: "La baisse du prix des bouvillons et les montants élevés associés aux faillites après 1874 appuient le contexte de difficultés économiques des années 1870. Le tableau seul ne date pas le déclenchement de la crise : l’élève mobilise aussi ses connaissances.",
  2: "Les droits de douane du budget de 1879 illustrent la mesure tarifaire. La réponse doit décrire cette mesure, pas seulement recopier un pourcentage.",
  3: "Le discours d’Everett relie le rail au peuplement de l’Ouest et aux échanges : grain de l’Ouest vers l’Est, débouchés de l’Ouest pour les produits de l’Est.",
  4: "Les faits présentés permettent d’associer la période à l’expansion de l’activité manufacturière et à l’apparition de la grande industrie textile.",
  5: "La carte permet de reconnaître le Canadien Pacifique par son tracé rouge de Montréal à Vancouver à travers les Prairies. Elle représente les réseaux en 1900 : elle sert à identifier spatialement le réseau étudié, sans prouver sa date d’achèvement. Ne pas l’écarter uniquement à cause de cette date, puisque son usage rétrospectif est explicite.",
  6: "À discriminer : l’Empress of Ireland appartient au début du 20e siècle et témoigne du transport transatlantique à vapeur; il ne fait pas partie de la Politique nationale.",
  7: "La brochure française du Canadien Pacifique annonce des fermes gratuites dans les régions de l’Ouest canadien afin d’y attirer des colons.",
  8: "À discriminer : Alexander Mackenzie présente des réformes électorales et la création de la Cour suprême; ces mesures politiques et institutionnelles ne font pas partie de la Politique nationale.",
  9: "La loi de 1851 concerne la mise à part de terres pour certaines Premières Nations au Bas-Canada, avant la Politique nationale. Elle ne décrit ni l’offre de lots agricoles aux colons de l’Ouest ni le rôle du Canadien Pacifique. Les réserves autochtones et les lots offerts aux colons ne sont pas interchangeables. Cet extrait n’est donc pas pertinent pour compléter les cases demandées, même si les politiques autochtones font partie du contexte colonial plus large.",
  10: "À discriminer : la loi électorale de 1849 concerne les conditions du droit de vote dans la Province du Canada; elle ne porte pas sur la Politique nationale.",
};
