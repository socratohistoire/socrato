export const EGLISE_CATHOLIQUE_ACTIVITY_ID = "eglise-catholique-partie-b-v1";
export const EGLISE_CATHOLIQUE_TITLE = "Le Québec, 1840-1896";
export const EGLISE_CATHOLIQUE_INSTRUCTION = "Décrivez la présence et l’influence d’une institution dans la société québécoise entre 1840 et 1896. Complétez le schéma à l’aide de vos connaissances et des documents pertinents. Pour chaque document, choisissez « Utile » ou « À discriminer » selon son lien avec l’institution étudiée.";

export const EGLISE_CATHOLIQUE_SCHEMA_FIELDS = [
  {
    id: "object",
    prompt: "Nommez l’institution dont la présence et l’influence sont décrites dans le schéma.",
    answer: "L’institution décrite est l’Église catholique.",
  },
  {
    id: "ultramontanism",
    prompt: "Décrivez le courant de pensée qui affirme la supériorité de l’autorité religieuse sur le pouvoir civil.",
    answer: "L’ultramontanisme affirme la supériorité de l’Église et du pape dans les domaines religieux et moraux; selon ses partisans, la société civile doit soutenir la mission de l’Église (document 1).",
  },
  {
    id: "anticlericalism",
    prompt: "Expliquez la réaction de certains libéraux à l’influence de cette institution.",
    answer: "Des libéraux défendent la liberté de pensée et contestent l’intervention du clergé dans la vie politique et intellectuelle : c’est l’anticléricalisme (document 2).",
  },
  {
    id: "survival_nationalism",
    prompt: "Décrivez la conception de la nation canadienne-française défendue par cette institution.",
    answer: "Le nationalisme de survivance associe l’avenir de la nation canadienne-française à la conservation de la foi catholique, de la langue française et de ses traditions (document 3).",
  },
  {
    id: "confessional_dualism",
    prompt: "Décrivez l’organisation confessionnelle des institutions sociales.",
    answer: "Le dualisme confessionnel organise des institutions catholiques et protestantes distinctes. En éducation, deux comités administrent séparément les écoles de leur confession (document 4).",
  },
  {
    id: "education",
    prompt: "Décrivez le rôle de cette institution dans le domaine de l’éducation.",
    answer: "Le clergé et les communautés religieuses dirigent des écoles et des collèges, enseignent et encadrent la formation religieuse et morale des élèves (document 5).",
  },
  {
    id: "social_works",
    prompt: "Décrivez son rôle dans les soins de santé et les œuvres de charité.",
    answer: "Des communautés religieuses administrent des hôpitaux, soignent les malades et prennent en charge des œuvres destinées notamment aux pauvres, aux orphelins et aux personnes âgées (document 6).",
  },
] as const;

export type EgliseCatholiqueSchemaFieldId = (typeof EGLISE_CATHOLIQUE_SCHEMA_FIELDS)[number]["id"];
export type EgliseCatholiqueAnswerFeedback = { status: "recognized" | "partial" | "review"; label: string; message: string };

const LOCAL_ANSWER_RULES: Record<EgliseCatholiqueSchemaFieldId, { accepted: RegExp[]; related: RegExp; hint: string }> = {
  object: {
    accepted: [/\beglise catholique\b/, /\bclerge catholique\b/, /\binstitution catholique\b/],
    related: /\b(eglise|clerge|religion|catholique|institution religieuse)\b/,
    hint: "Nommez précisément l’Église catholique.",
  },
  ultramontanism: {
    accepted: [/\bultramontanisme\b/, /\b(eglise|pape).{0,55}(superieur|autorite|pouvoir civil|etat)\b/, /\b(pouvoir civil|etat).{0,55}(soumis|subordonne|eglise|pape)\b/],
    related: /\b(pape|eglise|etat|autorite|pouvoir|religieux|civil)\b/,
    hint: "Nommez l’ultramontanisme et précisez la supériorité de l’autorité religieuse sur le pouvoir civil.",
  },
  anticlericalism: {
    accepted: [/\banticlericalisme\b/, /\bliberaux?.{0,55}(oppos|contest|influence|clerge|eglise)\b/, /\b(libert[eé] de pensee|institut canadien|societe laique)\b/],
    related: /\b(liberaux?|liberte|pensee|clerge|eglise|institut canadien|politique|la[iï]que)\b/,
    hint: "Précisez que des libéraux contestent l’influence du clergé et défendent la liberté de pensée.",
  },
  survival_nationalism: {
    accepted: [/\bnationalisme de survivance\b/, /\b(foi|religion|catholique).{0,65}(langue francaise|francais|nation|canadiens? francais)\b/, /\b(canadiens? francais|nation).{0,65}(foi|religion|catholique|langue francaise)\b/],
    related: /\b(nation|canadiens? francais|foi|langue|francais|traditions?|survivance)\b/,
    hint: "Reliez la survivance de la nation canadienne-française à la foi catholique, à la langue française et aux traditions.",
  },
  confessional_dualism: {
    accepted: [/\bdualisme confessionnel\b/, /\b(catholiques?).{0,55}(protestantes?|separes?|distincts?|deux comites?)\b/, /\b(protestantes?).{0,55}(catholiques?|separes?|distincts?|deux comites?)\b/],
    related: /\b(confessionnel|catholique|protestant|comites?|institutions?|ecoles?)\b/,
    hint: "Décrivez deux réseaux ou comités distincts, l’un catholique et l’autre protestant.",
  },
  education: {
    accepted: [/\b(clerge|religieuses?|communautes? religieuses?|eglise).{0,65}(ecoles?|colleges?|enseignement|education|enseign)\b/, /\b(ecoles?|colleges?|enseignement|education).{0,65}(clerge|religieuses?|eglise|catholique)\b/],
    related: /\b(ecoles?|colleges?|enseignement|education|instituteurs?|livres?|catechisme|cure)\b/,
    hint: "Précisez que le clergé et les communautés religieuses dirigent ou encadrent des écoles et l’enseignement.",
  },
  social_works: {
    accepted: [/\b(religieuses?|communautes? religieuses?|eglise).{0,70}(hopitaux?|malades?|orphelins?|pauvres?|hospices?|charite|soins?)\b/, /\b(hopitaux?|malades?|orphelins?|pauvres?|hospices?|soins?).{0,70}(religieuses?|eglise|catholique)\b/],
    related: /\b(hopitaux?|hotel dieu|malades?|orphelins?|pauvres?|hospices?|charite|soins?)\b/,
    hint: "Nommez les hôpitaux, les soins ou les œuvres de charité administrés par des communautés religieuses.",
  },
};

function normalizeAnswer(answer: string) {
  return answer.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’']/g, " ").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function assessEgliseCatholiqueAnswer(id: EgliseCatholiqueSchemaFieldId, answer: string): EgliseCatholiqueAnswerFeedback {
  const text = normalizeAnswer(answer);
  const rule = LOCAL_ANSWER_RULES[id];
  const review = (message: string): EgliseCatholiqueAnswerFeedback => ({ status: "review", label: "À vérifier", message });
  if (!text) return review("Aucune réponse à vérifier.");
  if (text.length > 260 || /\b(ne|n|pas|non|aucun|aucune|jamais|sans|sauf|contraire|plutot|mais|ou|peut etre|sais|refuse|refusent|refuser)\b/.test(text)) return review("Votre formulation demande une lecture humaine : comparez-la au corrigé ou faites-la valider par l’enseignant.");
  if (/\b(nouvelle france|francois de laval|revolution tranquille|minist[eè]re de l education|bill 60|loi sur les indiens|canadien pacifique)\b/.test(text)) return review("Vérifiez la période ou le sujet évoqué : cette formulation semble reprendre un document à discriminer.");
  if (rule.accepted.some((pattern) => pattern.test(text))) return { status: "recognized", label: "Réponse reconnue", message: "Votre réponse contient une formulation attendue pour cette case. Cette reconnaissance locale ne garantit pas la justesse de toute la phrase." };
  if (rule.related.test(text)) return { status: "partial", label: "À préciser", message: rule.hint };
  return review("Cette formulation n’est pas reconnue; elle n’est pas nécessairement fausse. Comparez-la à la piste de réponse ou consultez l’enseignant.");
}

export type EgliseCatholiqueDocumentChoice = "" | "direct" | "exclude";
export type EgliseCatholiqueDraft = {
  answers: Record<EgliseCatholiqueSchemaFieldId, string>;
  choices: Record<string, EgliseCatholiqueDocumentChoice>;
  submitted: boolean;
};

export const EGLISE_CATHOLIQUE_DOCUMENTS = [
  {
    number: 1,
    date: "MONTRÉAL, 3 OCTOBRE 1875",
    title: "",
    excerpt: "« Non seulement l’Église est indépendante de la société civile, mais elle lui est même supérieure par son origine, par son étendue et par sa fin. La société civile se trouve indirectement, mais véritablement, subordonnée [à l’Église]. Elle doit s’abstenir de tout ce qui peut mettre obstacle à la fin dernière et suprême de l’homme; elle doit aussi aider l’Église dans sa mission divine et, au besoin, la protéger et la défendre. »",
    note: "Extrait recomposé en trois phrases; orthographe et ponctuation modernisées. Les crochets précisent le référent déjà présent dans le passage.",
    source: "Source primaire : Mgr Ignace Bourget, « Lettre pastorale concernant la sépulture de Joseph Guibord, membre de l’Institut Canadien », Mandements de l’évêque de Montréal, vol. 7, 3 octobre 1875, p. 11.",
    supports: "ultramontanism",
    links: [
      { url: "https://documents.recitus.qc.ca/dossiers/document/document-1-mgr-ignace-bourget?gpc=2", label: "RÉCIT — transcription et provenance" },
      { url: "https://www.biographi.ca/fr/bio/bourget_ignace_11F.html", label: "Dictionnaire biographique du Canada — Ignace Bourget" },
    ],
  },
  {
    number: 2,
    date: "MONTRÉAL, 17 DÉCEMBRE 1868",
    title: "",
    excerpt: "« Un prêtre aura beau exprimer les erreurs les plus graves sur la liberté d’opinion du citoyen. Il aura beau violer ses devoirs jusqu’à dire, du haut de la chaire, que les citoyens n’ont pas le droit de choisir entre deux candidats [jugés également honorables]. Il pourra même leur dire qu’ils sont obligés en conscience de voter pour un candidat [soutenu par la réaction]. La défaveur s’attachera pourtant à celui qui racontera les faits et en fera ressortir le danger! »",
    attribution: "Discours de Louis-Antoine Dessaulles devant l’Institut canadien de Montréal",
    note: "Extrait recomposé en quatre phrases; orthographe et ponctuation modernisées. Les crochets simplifient deux précisions du texte original sans changer la critique formulée par l’auteur.",
    source: "Source primaire : Louis-Antoine Dessaulles, « Discours sur la tolérance », Annuaire de l’Institut-canadien pour 1868, Montréal, 1868, p. 17-18.",
    supports: "anticlericalism",
    links: [
      { url: "https://fr.wikisource.org/wiki/Annuaire_de_l%E2%80%99Institut-canadien_pour_1868/Discours_sur_la_tol%C3%A9rance_de_L._A._Desssaules", label: "Wikisource — discours et fac-similé" },
      { url: "https://fr.wikisource.org/wiki/Livre:Institut-canadien_-_Annuaire_de_l%27Institut-canadien_pour_1868,_1868.pdf", label: "Wikisource — annuaire numérisé" },
    ],
  },
  {
    number: 3,
    date: "TROIS-RIVIÈRES, 1866",
    title: "",
    excerpt: "« [Les Canadiens français] ont, comme nation, une mission à remplir et, comme peuple, un but à atteindre. Chaque individu dans la famille, chaque famille dans la nation et chaque nation dans l’humanité ont leur poste assigné. La mission providentielle du peuple canadien est essentiellement religieuse. C’est [notamment] l’extension du royaume de Dieu par la formation d’une nationalité avant tout catholique. »",
    attribution: "Louis-François Laflèche, Quelques considérations sur les rapports de la société civile avec la religion et la famille",
    note: "Extrait recomposé en quatre phrases; orthographe et ponctuation modernisées. Les crochets explicitent le groupe visé dans l’ouvrage et signalent une coupure, sans modifier la conception de la nation défendue par l’auteur.",
    source: "Source primaire : Louis-François Laflèche, Quelques considérations sur les rapports de la société civile avec la religion et la famille, Montréal, Eusèbe Sénécal, 1866, p. 44-47.",
    supports: "survival_nationalism",
    links: [
      { url: "https://www.canadiana.ca/view/oocihm.39043/1", label: "Canadiana — ouvrage numérisé" },
      { url: "https://www.collectionscanada.gc.ca/obj/023012/f2/amicus-5771677-002.pdf", label: "Bibliothèque et Archives Canada — exemplaire numérisé" },
    ],
  },
  {
    number: 4,
    date: "QUÉBEC, 24 DÉCEMBRE 1875",
    title: "",
    excerpt: "« Le Conseil de l’instruction publique est divisé en deux comités : l’un est formé de membres catholiques romains et l’autre, de membres protestants. Tout ce qui concerne spécialement les écoles et l’instruction publique des catholiques romains relève exclusivement du comité catholique. De même, tout ce qui concerne les écoles et l’instruction publique des protestants relève exclusivement du comité protestant [du Conseil]. »",
    note: "Extrait recomposé en trois phrases à partir des dispositions de la loi; syntaxe et ponctuation simplifiées. Les crochets précisent l’organisme déjà nommé dans le passage.",
    source: "Source primaire législative : Québec, Acte pour amender de nouveau la loi concernant l’instruction publique, 39 Victoria, chapitre 15, sanctionné le 24 décembre 1875, notamment l’article 16.",
    supports: "confessional_dualism",
    links: [
      { url: "https://www.bibliotheque.assnat.qc.ca/guides/fr/histoire-de-l-education-au-quebec-grands-textes-politiques-et-legislatifs/137-le-quebec-apres-la-confederation-1867-1960", label: "Bibliothèque de l’Assemblée nationale — loi de 1875" },
      { url: "https://www.cse.gouv.qc.ca/wp-content/uploads/comite-catholique/50-1020-CCAT-juridiction-respons-Comite-cath.pdf", label: "Conseil supérieur de l’éducation — article 16 et contexte" },
    ],
  },
  {
    number: 5,
    date: "QUÉBEC ET MONTRÉAL, VERS 1888-1890",
    title: "L’enseignement dans les écoles catholiques",
    excerpt: "« L’enseignement de la religion doit tenir le premier rang parmi les matières du programme et se donner ponctuellement dans toutes les écoles. Les élèves qui se préparent à faire leur première communion doivent recevoir une attention spéciale pour l’enseignement du catéchisme. Il est du devoir des maîtres de suivre les avis du curé sur la conduite morale et religieuse des élèves. [Ces règles sont adoptées par le comité catholique du Conseil de l’instruction publique.] »",
    note: "Extrait recomposé en quatre phrases; orthographe et syntaxe modernisées. La phrase entre crochets identifie l’autorité qui publie les règlements. Le plan situe aussi le couvent d’Hochelaga, maison d’éducation de la Congrégation de Notre-Dame.",
    source: "Source primaire textuelle : Conseil de l’instruction publique, comité catholique, Règlements scolaires révisés, Québec, vers 1888, règlement 21. Source primaire cartographique : Charles E. Goad, Atlas of the City of Montreal, plan du quartier d’Hochelaga, 1890, détail du couvent.",
    supports: "education",
    image: {
      url: "/historical-documents/eglise-couvent-hochelaga-1890.jpg",
      alt: "Détail d’un plan de Montréal de 1890 où le couvent d’Hochelaga est identifié entre les rues Notre-Dame et Sainte-Catherine.",
      width: 1920,
      height: 881,
    },
    links: [
      { url: "https://www.canadiana.ca/view/oocihm.59161", label: "Canadiana — règlements du comité catholique" },
      { url: "https://www.bibl.ulaval.ca/ress/manscol/1899.html", label: "Université Laval — transcription de règlements scolaires" },
      { url: "https://commons.wikimedia.org/wiki/File:Montr%C3%A9al_1890._Couvent_Hochelaga,_rue_Notre-Dame_Est._(5440492770).jpg", label: "Wikimedia Commons — plan et provenance" },
    ],
  },
  {
    number: 6,
    date: "MONTRÉAL, VERS 1865",
    title: "L’Hôtel-Dieu de Montréal",
    note: "La photographie montre l’Hôtel-Dieu et le monastère construits au pied du mont Royal. Les Religieuses Hospitalières de Saint-Joseph dirigent l’hôpital, administrent l’établissement et prennent soin des malades.",
    source: "Source primaire iconographique : photographie de l’Hôtel-Dieu de Montréal, vers 1865, Musée McCord Stewart, domaine public. La provenance institutionnelle et le rôle des Religieuses Hospitalières sont documentés par les archives patrimoniales de la Ville de Montréal.",
    supports: "social_works",
    image: {
      url: "/historical-documents/eglise-hotel-dieu-montreal-1865.jpg",
      alt: "Photographie en noir et blanc de l’Hôtel-Dieu et de son monastère au pied du mont Royal, vers 1865.",
      width: 730,
      height: 354,
    },
    links: [
      { url: "https://commons.wikimedia.org/wiki/File:Hotel-Dieu_Montreal_1865.jpg", label: "Wikimedia Commons — photographie et droits" },
      { url: "https://collections.musee-mccord-stewart.ca/en/objects/419879/hopital-hoteldieu-montreal-quebec-18601900", label: "Musée McCord Stewart — Hôtel-Dieu" },
      { url: "https://montroyal.montreal.ca/patrimoine-documentaire-archivistique/hotel-dieu-religieuses-hospitalieres-saint-joseph", label: "Ville de Montréal — Religieuses Hospitalières" },
    ],
  },
  {
    number: 7,
    date: "CRAIGELLACHIE, 7 NOVEMBRE 1885",
    title: "La pose du dernier crampon du Canadien Pacifique",
    note: "Donald A. Smith pose le dernier crampon de la voie ferrée transcontinentale du Canadien Pacifique, en Colombie-Britannique.",
    source: "Source primaire iconographique : Alexander Ross, photographie, 7 novembre 1885. Bibliothèque et Archives Canada, C-003693. Droits expirés; reproduction numérique via Wikimedia Commons.",
    supports: null,
    image: {
      url: "/historical-documents/politique-nationale-dernier-crampon-1885.jpg",
      alt: "Donald A. Smith frappe le dernier crampon du Canadien Pacifique devant un groupe réuni sur la voie ferrée en 1885.",
      width: 1280,
      height: 1024,
    },
    links: [
      { url: "https://recherche-collection-search.bac-lac.gc.ca/eng/Home/Record?IdNumber=3194528&app=fonandcol&ecopy=c003693", label: "Bibliothèque et Archives Canada — C-003693" },
      { url: "https://commons.wikimedia.org/wiki/File:Donald_A._Smith_driving_the_Last_Spike_to_complete_the_Canadian_Pacific_Railway,_1885.jpg", label: "Wikimedia Commons — photographie et droits" },
    ],
  },
  {
    number: 8,
    date: "CANADA, 12 AVRIL 1876",
    title: "",
    excerpt: "« La présente loi sera connue sous le nom de Loi sur les Indiens de 1876. Le ministre de l’Intérieur sera surintendant général des Affaires indiennes et aura le contrôle de leur administration. Le gouverneur en conseil pourra nommer un surintendant général adjoint et les autres agents jugés nécessaires [à l’application de la loi]. »",
    note: "Extrait traduit et recomposé en trois phrases à partir des premiers articles de la loi. Les crochets précisent la fonction des agents déjà définie par le passage.",
    source: "Source primaire législative : Parlement du Canada, Loi sur les Indiens de 1876, 39 Victoria, chapitre 18, articles 1 et 2, p. 43-44. Traduction pédagogique d’un texte anglais du domaine public.",
    supports: null,
    links: [
      { url: "https://publications.gc.ca/collections/collection_2017/aanc-inac/R5-158-2-1978-eng.pdf", label: "Gouvernement du Canada — reproduction de la loi de 1876" },
    ],
  },
  {
    number: 9,
    date: "NOUVELLE-FRANCE, 26 MARS 1663",
    title: "",
    excerpt: "« Les conciles ont ordonné l’usage des séminaires, où l’on instruit les clercs dans les vertus et les sciences convenables à leur état. Nous désirons que [le Séminaire de Québec] soit une continuelle école de vertu et un lieu de réserve. Nous pourrons y choisir des sujets pieux et capables pour les envoyer dans les paroisses et les autres lieux du pays [afin d’y exercer les fonctions qui leur seront confiées]. »",
    attribution: "Acte de fondation du Séminaire de Québec par François de Laval",
    note: "Extrait recomposé en trois phrases; orthographe et syntaxe modernisées. Les crochets explicitent l’institution et résument la fin d’une longue phrase sans en modifier le sens.",
    source: "Source primaire : François de Laval, Acte de fondation du Séminaire de Québec, Paris, 26 mars 1663. Original conservé au Musée de la civilisation, Fonds du Séminaire de Québec.",
    supports: null,
    links: [
      { url: "https://www.seminairedequebec.org/histoire/acte-de-fondation/", label: "Séminaire de Québec — transcription de l’acte" },
      { url: "https://sfdl.omeka.net/items/show/10834", label: "Répertoire documentaire François-de-Laval — notice de l’original" },
    ],
  },
  {
    number: 10,
    date: "QUÉBEC, 19 MARS 1964",
    title: "",
    excerpt: "« Tout enfant a le droit de bénéficier d’un système d’éducation qui favorise le plein épanouissement de sa personnalité. Les parents ont le droit de choisir les institutions qui assurent le mieux, selon leurs convictions, le respect des droits de leurs enfants. Il est opportun d’instituer, suivant ces principes, un ministère de l’Éducation. Le ministre est chargé de la direction et de l’administration de ce ministère [au nom du gouvernement du Québec]. »",
    note: "Extrait recomposé en quatre phrases à partir du préambule et de l’article 1 de la loi. Les crochets explicitent l’autorité civile responsable du ministère.",
    source: "Source primaire législative : Québec, Loi du ministère de l’Éducation, sanctionnée le 19 mars 1964 et reprise aux Statuts refondus du Québec de 1964, chapitre 233, préambule et article 1.",
    supports: null,
    links: [
      { url: "https://www.bibliotheque.assnat.qc.ca/guides/fr/l-histoire-de-l-education-au-quebec-les-grands-textes-politiques-et-legislatifs/143-les-reformes-des-annees-1960", label: "Bibliothèque de l’Assemblée nationale — réforme de 1964" },
      { url: "https://www.legisquebec.gouv.qc.ca/fr/showdoc/cs/M-15", label: "LégisQuébec — texte de la loi et références historiques" },
    ],
  },
] as const;

export function emptyEgliseCatholiqueDraft(): EgliseCatholiqueDraft {
  return {
    answers: Object.fromEntries(EGLISE_CATHOLIQUE_SCHEMA_FIELDS.map(({ id }) => [id, ""])) as Record<EgliseCatholiqueSchemaFieldId, string>,
    choices: {},
    submitted: false,
  };
}

export function restoreEgliseCatholiqueDraft(raw: unknown): EgliseCatholiqueDraft {
  const draft = emptyEgliseCatholiqueDraft();
  if (!raw || typeof raw !== "object") return draft;
  const value = raw as Record<string, unknown>;
  const record = (item: unknown): Record<string, unknown> => item && typeof item === "object" && !Array.isArray(item) ? item as Record<string, unknown> : {};
  for (const { id } of EGLISE_CATHOLIQUE_SCHEMA_FIELDS) {
    const text = record(value.answers)[id];
    if (typeof text === "string") draft.answers[id] = text.slice(0, 2000);
  }
  for (const document of EGLISE_CATHOLIQUE_DOCUMENTS) {
    const choice = record(value.choices)[document.number];
    if (choice === "direct" || choice === "exclude") draft.choices[document.number] = choice;
  }
  draft.submitted = value.submitted === true && egliseCatholiqueMissingCount(draft) === 0;
  return draft;
}

export function egliseCatholiqueMissingCount(draft: EgliseCatholiqueDraft) {
  return EGLISE_CATHOLIQUE_SCHEMA_FIELDS.filter(({ id }) => !draft.answers[id].trim()).length
    + EGLISE_CATHOLIQUE_DOCUMENTS.filter(({ number }) => !draft.choices[number]).length;
}

export function expectedEgliseCatholiqueDocumentChoice(number: number): Exclude<EgliseCatholiqueDocumentChoice, ""> {
  return number >= 7 ? "exclude" : "direct";
}

export const EGLISE_CATHOLIQUE_DOCUMENT_FEEDBACK: Record<number, string> = {
  1: "Bourget affirme que l’Église est supérieure à la société civile et que celle-ci doit l’aider : le document permet de définir l’ultramontanisme.",
  2: "Dessaulles critique l’intervention politique des prêtres et défend la liberté d’opinion : son discours témoigne de l’anticléricalisme de certains libéraux.",
  3: "Laflèche associe la mission de la nation canadienne-française à la religion catholique : le passage illustre le nationalisme de survivance.",
  4: "La loi place les écoles catholiques et protestantes sous deux comités distincts : elle permet d’expliquer le dualisme confessionnel.",
  5: "Les règlements placent la religion et le catéchisme au cœur de l’enseignement, sous l’autorité du curé; le plan localise aussi une maison d’éducation dirigée par une communauté religieuse.",
  6: "L’Hôtel-Dieu témoigne du rôle des communautés religieuses dans l’administration des hôpitaux et les soins aux malades.",
  7: "À discriminer : la photographie documente l’achèvement du chemin de fer transcontinental. Elle appartient à la période, mais ne permet de remplir aucune case sur l’institution étudiée.",
  8: "À discriminer : la Loi sur les Indiens de 1876 concerne l’administration fédérale des affaires autochtones. Malgré sa date, elle ne répond à aucune case du schéma.",
  9: "À discriminer : l’acte de François de Laval concerne le rôle religieux et éducatif du Séminaire sous le Régime français, bien avant la période 1840-1896.",
  10: "À discriminer : la création du ministère de l’Éducation relève de la Révolution tranquille et d’une autre période historique; elle ne décrit pas la situation de 1840 à 1896.",
};
