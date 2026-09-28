import type { ExpectedLearningObjective, HistoricalClaim, HistoricalRecord, IntellectualOperationId, ReferenceSource } from "../types.ts";

const SOURCES = {
  program: { id: "pfeq-hqc-2017", kind: "official-program", title: "Programme de formation de l’école québécoise – Histoire du Québec et du Canada", creator: "Ministère de l’Éducation", publisher: "Gouvernement du Québec", publicationYear: 2017, url: "https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/secondaire/programmes/PFEQ-histoire-quebec-canada-secondaire.pdf", locator: "Précisions des connaissances, période 1840-1896, rubrique Économie coloniale, p. 46 du programme (p. 49 du PDF)", verificationStatus: "verified" },
  treaty: { id: "us-statutes-reciprocity-1854", kind: "government", title: "Reciprocity Treaty with Great Britain", creator: "United States of America et Royaume-Uni", publisher: "United States Government Publishing Office", publicationYear: 1854, url: "https://www.govinfo.gov/link/statute/10/1089", locator: "10 Stat. 1089-1092, préambule et articles I à V; signature du 5 juin et proclamation du 11 septembre 1854", verificationStatus: "verified" },
  treatyDraft: { id: "lac-elgin-marcy-draft-1854", kind: "museum-or-archive", title: "Ébauche du traité de réciprocité canado-américain, aussi connu sous le nom de traité Elgin-Marcy", creator: "James Bruce, comte d’Elgin, et William L. Marcy", publisher: "Bibliothèque et Archives Canada", publicationYear: 1854, url: "https://recherche-collection-search.bac-lac.gc.ca/eng/Home/Record?IdNumber=4841619&app=fonandcol&ecopy=e010798818-v8", locator: "Fonds James Bruce, Earl of Elgin and Kincardine, R977-881-3-F, vol. 39, pièce 4841619", rightsNote: "Document d’archives numérisé; vérifier les conditions de reproduction de BAC avant toute réutilisation d’image.", verificationStatus: "verified" },
  statcan1894: { id: "statcan-yearbook-1894-reciprocity", kind: "government", title: "The Reciprocity Treaty", creator: "Department of Agriculture", publisher: "Government of Canada, Statistical Year-Book of Canada for 1894", publicationYear: 1895, url: "https://www66.statcan.gc.ca/eng/1894/189402570235_p.%20235.pdf", locator: "p. 235-239, paragraphes 396-414, particulièrement 398-404 et 410-414", verificationStatus: "verified" },
  statcan1927: { id: "statcan-yearbook-1927-trade", kind: "government", title: "Trade and Commerce", creator: "Dominion Bureau of Statistics", publisher: "Canada Year Book 1927-1928", publicationYear: 1928, url: "https://www66.statcan.gc.ca/eng/1927-28/192705100468_p.%20468.pdf", locator: "p. 468, section “The Abolition of Preference and the Reciprocity Treaty of 1854”", verificationStatus: "verified" },
  canalTrade: { id: "parks-lachine-commercial", kind: "government", title: "Le premier chaînon d’un réseau de canaux", creator: "Parcs Canada", publisher: "Gouvernement du Canada", url: "https://parcs.canada.ca/lhn-nhs/qc/canallachine/culture/histoire-history/commercial", locator: "Sections “Une nécessité commerciale” et “Une étape vers la maturité”", verificationStatus: "verified" },
  canalIndustry: { id: "parks-lachine-industrialisation", kind: "government", title: "Le berceau de l’industrialisation", creator: "Parcs Canada", publisher: "Gouvernement du Canada", url: "https://parcs.canada.ca/lhn-nhs/qc/canallachine/culture/histoire-history/industrialisation", locator: "Sections “Un changement de cap”, “Les débuts de l’industrialisation” et “Une croissance rapide”", verificationStatus: "verified" },
  hincks: { id: "dbc-hincks-economy", kind: "academic", title: "HINCKS, sir FRANCIS", creator: "William G. Ormsby", publisher: "Dictionnaire biographique du Canada, Université Laval/University of Toronto", url: "https://www.biographi.ca/fr/bio/hincks_francis_11F.html", locator: "Développement des canaux et chemins de fer; négociations du traité de réciprocité en 1854", verificationStatus: "verified" },
  baldwin: { id: "dbc-baldwin-reciprocity", kind: "academic", title: "BALDWIN, ROBERT", creator: "Michael S. Cross et Robert Lochiel Fraser", publisher: "Dictionnaire biographique du Canada, Université Laval/University of Toronto", url: "https://www.biographi.ca/en/bio.php?id_nbr=3762", locator: "Réaction au libre-échange britannique; démarches pour la réciprocité entre 1848 et 1851", verificationStatus: "verified" },
  elgin: { id: "dbc-elgin-reciprocity", kind: "academic", title: "BRUCE, JAMES, 8e comte d’ELGIN et 12e comte de KINCARDINE", creator: "John S. Galbraith", publisher: "Dictionnaire biographique du Canada, Université Laval/University of Toronto", url: "https://www.biographi.ca/fr/bio/bruce_james_9E.html", locator: "Démantèlement du régime préférentiel, diplomatie d’Elgin et conclusion du traité de 1854", verificationStatus: "verified" },
} as const satisfies Record<string, ReferenceSource>;

const ids = (...keys: (keyof typeof SOURCES)[]) => keys.map((key) => SOURCES[key].id);
const claim = (claimKind: HistoricalClaim["claimKind"], id: string, text: string, sourceIds: readonly string[]): HistoricalClaim => ({ id, text, sourceIds, claimKind });
const fact = (id: string, text: string, sourceIds: readonly string[]) => claim("fact", id, text, sourceIds);
const nuance = (id: string, text: string, sourceIds: readonly string[]) => claim("nuance", id, text, sourceIds);
const interpretation = (id: string, text: string, sourceIds: readonly string[]) => claim("interpretation", id, text, sourceIds);
const statement = (id: string, text: string, sourceIds: readonly string[]) => ({ id, text, sourceIds });
const objective = (id: string, text: string, sourceIds: readonly string[], programBasis: string, knowledgeFocus: readonly string[], operationIds: readonly IntellectualOperationId[]): ExpectedLearningObjective => ({ id, text, sourceIds, origin: "socrato-editorial-derivation", programBasis, knowledgeFocus, operationIds });

export const COLONIAL_ECONOMY_HISTORICAL_RECORD: HistoricalRecord = {
  schemaVersion: 1,
  id: "historical-record:economie-coloniale",
  knowledgeHeadingId: "economie-coloniale",
  status: "draft",
  title: "L’économie coloniale : du marché impérial à la réciprocité nord-américaine",
  scope: "De 1840 à 1866 : transformation des débouchés commerciaux de la Province du Canada après l’abandon des préférences britanniques, recherche d’un marché de remplacement et fonctionnement du traité de réciprocité avec les États-Unis.",
  knowledgePrecisions: [
    { ...statement("ec-precision-free-trade", "Le Royaume-Uni abandonne progressivement son système de préférences coloniales, notamment avec l’abolition des Corn Laws en 1846 et celle des Navigation Acts en 1849, ce qui expose davantage les produits canadiens à la concurrence.", ids("program", "statcan1894", "statcan1927")), officialOrder: 1, officialLabel: "Adoption du libre-échange par le Royaume-Uni", coverageStatus: "complete", linkedStatementIds: ["ec-free-trade-1", "ec-free-trade-2", "ec-free-trade-3", "ec-adjustment-1"] },
    { ...statement("ec-precision-reciprocity", "Le traité de 1854 ouvre réciproquement certains marchés, voies de navigation et pêcheries, principalement pour des produits naturels, avant de prendre fin en 1866.", ids("program", "treaty", "treatyDraft", "statcan1894")), officialOrder: 2, officialLabel: "Traité de réciprocité avec les États-Unis", coverageStatus: "complete", linkedStatementIds: ["ec-negotiation-1", "ec-treaty-1", "ec-treaty-2", "ec-treaty-3", "ec-end-1"] },
  ],
  manual: {
    title: "Monographie historique interne — L’économie coloniale et la réorientation des échanges",
    purpose: "Fournir à Socrato une synthèse historique vérifiable pour encadrer les contenus portant sur le libre-échange britannique et le traité de réciprocité de 1854.",
    audience: "internal-pedagogical-reference",
    editorialMethod: "Synthèse originale construite à partir du programme ministériel, du texte officiel du traité, d’archives, de séries gouvernementales rétrospectives, de ressources patrimoniales fédérales et de biographies savantes. Les chiffres sont conservés seulement lorsque leur série et leur période sont précisément localisées.",
    scopeBoundary: "L’Acte d’Union sert de contexte institutionnel et le gouvernement responsable explique la capacité croissante des ministres coloniaux à défendre leurs intérêts commerciaux. La présente notion se concentre toutefois sur le changement de régime commercial et la réciprocité de 1854. Les affaires indiennes ne sont pas interprétées comme une conséquence directe de ce traité; elles relèvent du dossier suivant. La première phase d’industrialisation et la Politique nationale seront développées dans leurs propres notions.",
    sections: [
      { id: "ec-mono-imperial", title: "1. Avant 1846 — Une économie insérée dans le système impérial", purpose: "Établir le point de départ commercial nécessaire pour comprendre le changement de politique britannique.", paragraphs: [
        fact("ec-imperial-1", "La Province du Canada exporte surtout des produits agricoles et des matières premières. La Grande-Bretagne constitue un débouché important parce que son système tarifaire accorde des avantages à certaines productions coloniales.", ids("statcan1894", "statcan1927", "canalTrade")),
        fact("ec-imperial-2", "Le bois, le blé et la farine occupent une place centrale dans les échanges. Montréal relie les productions de l’intérieur, la navigation du Saint-Laurent et le commerce atlantique.", ids("canalTrade", "canalIndustry")),
        nuance("ec-imperial-3", "L’économie coloniale n’est pas exclusivement agricole : la construction navale, les scieries, les meuneries, les forges et d’autres activités de transformation existent déjà, mais l’industrie manufacturière demeure encore limitée dans la première moitié du siècle.", ids("canalIndustry")),
      ] },
      { id: "ec-mono-free-trade", title: "2. 1846-1849 — L’adoption du libre-échange par le Royaume-Uni", purpose: "Expliquer la rupture des préférences impériales et ses effets sur les producteurs coloniaux.", paragraphs: [
        fact("ec-free-trade-1", "En 1846, le Royaume-Uni abolit les Corn Laws et réduit la protection accordée aux céréales coloniales. Les produits canadiens doivent davantage concurrencer ceux d’autres pays sur le marché britannique.", ids("statcan1894", "statcan1927", "baldwin")),
        interpretation("ec-free-trade-2", "Pour les producteurs et les marchands canadiens habitués à un accès préférentiel, ce changement représente une perte de sécurité commerciale. Il pousse les dirigeants coloniaux à rechercher de nouveaux débouchés et une plus grande latitude tarifaire.", ids("statcan1894", "statcan1927", "baldwin", "elgin")),
        fact("ec-free-trade-3", "L’abrogation des Navigation Acts en 1849 ouvre davantage le transport entre le Canada et le Royaume-Uni aux navires de différentes nationalités, ce qui complète le recul de l’ancien système commercial impérial.", ids("statcan1927")),
      ] },
      { id: "ec-mono-adjustment", title: "3. Une économie en adaptation", purpose: "Montrer que la réorientation commerciale s’appuie aussi sur les transports, les investissements et le marché intérieur.", paragraphs: [
        fact("ec-adjustment-1", "En 1847, la législature canadienne supprime ses droits différentiels et place les produits américains et britanniques sur une base tarifaire plus comparable.", ids("statcan1894")),
        fact("ec-adjustment-2", "Entre 1843 et 1848, le canal de Lachine est élargi dans le cadre d’un réseau de canaux reliant Montréal aux Grands Lacs. Ces travaux facilitent le passage de navires plus importants et l’acheminement des marchandises.", ids("canalTrade")),
        interpretation("ec-adjustment-3", "Les infrastructures soutiennent à la fois le commerce et une industrialisation naissante. À partir de 1848, l’énergie hydraulique du canal de Lachine attire des meuneries, des fonderies et d’autres établissements, sans que cette évolution doive être confondue avec toute la première phase d’industrialisation.", ids("canalIndustry")),
      ] },
      { id: "ec-mono-negotiation", title: "4. 1848-1854 — La recherche de la réciprocité", purpose: "Expliquer pourquoi et comment les autorités coloniales cherchent un accord avec les États-Unis.", paragraphs: [
        fact("ec-negotiation-1", "Les gouvernements de la Province du Canada cherchent à obtenir l’accès au marché américain pour les produits naturels. Baldwin, Hincks et d’autres dirigeants défendent diverses formules de réciprocité à partir de la fin des années 1840.", ids("baldwin", "hincks", "statcan1894")),
        fact("ec-negotiation-2", "Le gouverneur général Elgin joue un rôle diplomatique déterminant. En 1854, il se rend à Washington et négocie avec le secrétaire d’État américain William L. Marcy.", ids("elgin", "treatyDraft", "treaty")),
        nuance("ec-negotiation-3", "Le traité est conclu entre les États-Unis et le Royaume-Uni, puisque la Province du Canada ne possède pas encore une souveraineté internationale. Les intérêts coloniaux sont néanmoins défendus activement par Elgin et des ministres canadiens.", ids("treaty", "treatyDraft", "elgin", "hincks")),
      ] },
      { id: "ec-mono-treaty", title: "5. 1854-1866 — Le traité de réciprocité", purpose: "Décrire précisément le contenu, la portée et les limites de l’accord.", paragraphs: [
        fact("ec-treaty-1", "Signé à Washington le 5 juin 1854, le traité réglemente le commerce, la navigation et les pêcheries entre les États-Unis et les colonies britanniques d’Amérique du Nord. Sa mise en œuvre exige des lois des gouvernements concernés.", ids("treaty", "treatyDraft")),
        fact("ec-treaty-2", "L’accord permet l’entrée sans droits de douane de plusieurs produits naturels : grains, farine, animaux, poisson, bois, charbon et divers produits agricoles ou miniers. Il ne crée pas un libre-échange général des produits manufacturés.", ids("treaty", "statcan1927")),
        fact("ec-treaty-3", "Le traité élargit aussi l’accès réciproque à certaines pêcheries et prévoit des droits de navigation sur le Saint-Laurent, les canaux canadiens et le lac Michigan, selon les conditions formulées dans le texte.", ids("treaty")),
        interpretation("ec-treaty-4", "La réciprocité réoriente une partie des échanges canadiens vers le marché américain et procure un débouché de proximité aux producteurs de ressources. Les données rétrospectives montrent une forte croissance du commerce, mais elles ne permettent pas d’attribuer toute cette croissance au traité seul.", ids("statcan1894", "statcan1927")),
      ] },
      { id: "ec-mono-end", title: "6. 1865-1866 — La fin du traité et ses suites", purpose: "Conclure sur la résiliation de l’accord sans empiéter sur les notions suivantes.", paragraphs: [
        fact("ec-end-1", "Les États-Unis donnent en 1865 le préavis prévu par l’accord; le traité cesse de s’appliquer le 17 mars 1866.", ids("treaty", "statcan1927")),
        nuance("ec-end-2", "La fin du traité est liée à plusieurs facteurs, notamment aux tensions de la guerre de Sécession et aux désaccords tarifaires. Elle ne doit pas être expliquée par une cause unique.", ids("statcan1927")),
        interpretation("ec-end-3", "La disparition du débouché privilégié américain renforce l’intérêt pour un marché intercolonial plus vaste. Elle fait partie du contexte économique de la fédération, mais la Confédération possède aussi des causes politiques, militaires, ferroviaires et institutionnelles.", ids("statcan1927", "program")),
      ] },
    ],
  },
  narrative: [
    fact("ec-narrative-protection", "Avant 1846, les préférences impériales favorisent certains produits coloniaux sur le marché britannique.", ids("statcan1894", "statcan1927")),
    fact("ec-narrative-repeal", "Le virage libre-échangiste britannique réduit cette protection en 1846 et 1849.", ids("statcan1894", "statcan1927")),
    interpretation("ec-narrative-search", "La recherche de nouveaux débouchés rapproche économiquement la Province du Canada des États-Unis.", ids("baldwin", "hincks", "elgin")),
    fact("ec-narrative-treaty", "Le traité de 1854 libéralise surtout le commerce de produits naturels et certains usages des voies navigables et des pêcheries.", ids("treaty")),
    nuance("ec-narrative-limits", "La réciprocité n’est ni une union politique ni un libre-échange complet des produits manufacturés.", ids("treaty", "statcan1927")),
    fact("ec-narrative-end", "Le traité prend fin en 1866 après un préavis américain.", ids("treaty", "statcan1927")),
  ],
  chronologicalMarkers: [
    { ...statement("ec-c-1846", "Le Royaume-Uni abolit les Corn Laws et réduit la préférence accordée aux céréales coloniales.", ids("statcan1894", "statcan1927")), dateLabel: "1846", sortYear: 1846 },
    { ...statement("ec-c-1847", "La Province du Canada supprime ses droits différentiels entre produits britanniques et américains.", ids("statcan1894")), dateLabel: "1847", sortYear: 1847 },
    { ...statement("ec-c-1849", "L’abrogation des Navigation Acts ouvre davantage le transport impérial à la concurrence.", ids("statcan1927")), dateLabel: "1849", sortYear: 1849 },
    { ...statement("ec-c-1854", "Elgin et Marcy signent le traité de réciprocité à Washington.", ids("treaty", "treatyDraft", "elgin")), dateLabel: "5 juin 1854", sortYear: 1854 },
    { ...statement("ec-c-1855", "Les mesures nécessaires sont adoptées et le régime réciproque entre pleinement en application.", ids("treaty", "statcan1927")), dateLabel: "1855", sortYear: 1855 },
    { ...statement("ec-c-1866", "Le traité cesse de s’appliquer après le préavis des États-Unis.", ids("treaty", "statcan1927")), dateLabel: "17 mars 1866", sortYear: 1866 },
  ],
  actors: [
    { ...statement("ec-a-elgin", "Gouverneur général et négociateur britannique du traité de 1854.", ids("treaty", "elgin")), actorType: "person", name: "James Bruce, comte d’Elgin" },
    { ...statement("ec-a-marcy", "Secrétaire d’État américain qui signe le traité avec Elgin.", ids("treaty")), actorType: "person", name: "William L. Marcy" },
    { ...statement("ec-a-hincks", "Ministre canadien associé aux investissements de transport et aux démarches pour la réciprocité.", ids("hincks")), actorType: "person", name: "Francis Hincks" },
    { ...statement("ec-a-merchants", "Groupe qui recherche des voies de transport efficaces et des débouchés pour les produits coloniaux.", ids("canalTrade", "canalIndustry")), actorType: "group", name: "Marchands et producteurs de la Province du Canada" },
    { ...statement("ec-a-governments", "Institutions qui négocient, ratifient et mettent en œuvre le régime commercial.", ids("treaty")), actorType: "institution", name: "Gouvernements britannique, américain et coloniaux" },
  ],
  territories: [
    statement("ec-t-province", "La Province du Canada réunit le Canada-Est et le Canada-Ouest dans un même espace politique et commercial.", ids("program", "canalTrade")),
    statement("ec-t-stlawrence", "Le Saint-Laurent et les canaux relient Montréal, les Grands Lacs et l’Atlantique.", ids("treaty", "canalTrade")),
    statement("ec-t-united-states", "Les États-Unis constituent le marché voisin visé par la politique de réciprocité.", ids("treaty", "statcan1894")),
  ],
  relationships: [
    { ...statement("ec-r-free-trade", "La fin des préférences britanniques pousse les dirigeants coloniaux à rechercher d’autres débouchés.", ids("statcan1927", "baldwin", "elgin")), relationshipType: "cause", relatedKnowledgeHeadingIds: ["acte-union", "gouvernement-responsable"] },
    { ...statement("ec-r-infrastructure", "L’amélioration des canaux facilite les échanges continentaux et soutient l’implantation manufacturière autour de Montréal.", ids("canalTrade", "canalIndustry")), relationshipType: "connection", relatedKnowledgeHeadingIds: ["premiere-phase-d-industrialisation"] },
    { ...statement("ec-r-market", "Le traité remplace partiellement un débouché impérial privilégié par un accès réciproque au marché américain pour des produits naturels.", ids("treaty", "statcan1894")), relationshipType: "change", relatedKnowledgeHeadingIds: ["acte-de-l-amerique-du-nord-britannique"] },
    { ...statement("ec-r-staples", "Malgré le changement de partenaire commercial, l’exportation de ressources et de produits agricoles demeure centrale.", ids("treaty", "canalTrade")), relationshipType: "continuity", relatedKnowledgeHeadingIds: ["industrie-forestiere", "exploitations-agricoles"] },
    { ...statement("ec-r-confederation", "La fin de la réciprocité contribue à la recherche d’un marché intercolonial, sans constituer l’unique cause de la fédération.", ids("statcan1927", "program")), relationshipType: "consequence", relatedKnowledgeHeadingIds: ["acte-de-l-amerique-du-nord-britannique"] },
  ],
  vocabulary: [
    { ...statement("ec-v-preference", "Avantage tarifaire accordé aux marchandises d’un partenaire ou d’une colonie par rapport à celles d’autres provenances.", ids("statcan1894", "statcan1927")), term: "Préférence impériale" },
    { ...statement("ec-v-free-trade", "Politique qui réduit ou supprime des barrières douanières afin d’accroître la concurrence et les échanges.", ids("program", "statcan1894")), term: "Libre-échange" },
    { ...statement("ec-v-reciprocity", "Accord dans lequel deux parties s’accordent des avantages comparables pour certains échanges.", ids("treaty")), term: "Réciprocité" },
    { ...statement("ec-v-natural", "Produits de l’agriculture, des forêts, des mines, des pêcheries ou de l’élevage, distingués des produits manufacturés dans le traité.", ids("treaty")), term: "Produits naturels" },
    { ...statement("ec-v-tariff", "Taxe perçue sur une marchandise importée.", ids("statcan1894")), term: "Droit de douane" },
  ],
  misconceptions: [
    { ...statement("ec-m-total", "Le traité vise une liste de produits naturels et ne supprime pas tous les droits sur les produits manufacturés.", ids("treaty", "statcan1927")), misconception: "Le traité de 1854 établit le libre-échange complet." },
    { ...statement("ec-m-independence", "Le traité est signé par les États-Unis et le Royaume-Uni; la Province du Canada demeure une colonie.", ids("treaty", "treatyDraft")), misconception: "Le Canada signe seul un traité international en 1854." },
    { ...statement("ec-m-only", "La croissance des échanges dépend aussi des canaux, des chemins de fer, de la demande et de la conjoncture.", ids("statcan1894", "canalTrade", "canalIndustry")), misconception: "Le traité explique à lui seul toute la croissance économique." },
    { ...statement("ec-m-britain", "Le libre-échange britannique retire un avantage colonial; il ne ferme pas complètement le marché britannique.", ids("statcan1927")), misconception: "Après 1846, le Canada ne commerce plus avec la Grande-Bretagne." },
    { ...statement("ec-m-end", "Le traité prend fin en 1866 après un préavis américain; il ne se termine pas automatiquement avec la Confédération.", ids("treaty", "statcan1927")), misconception: "La Confédération met fin au traité de réciprocité en 1867." },
  ],
  expectedLearning: [
    objective("ec-e-define", "Distinguer préférence impériale, libre-échange et réciprocité.", ids("program", "statcan1894", "treaty"), "Précisions officielles sur le libre-échange britannique et le traité de réciprocité.", ["Préférence impériale", "Libre-échange", "Réciprocité"], ["establish_facts", "differences_and_similarities"]),
    objective("ec-e-sequence", "Ordonner le retrait des préférences britanniques, les démarches diplomatiques, le traité et sa fin.", ids("program", "statcan1927", "treaty"), "Chronologie de la transformation des échanges entre 1846 et 1866.", ["1846", "1849", "1854", "1866"], ["time_and_space"]),
    objective("ec-e-cause", "Expliquer pourquoi l’adoption du libre-échange britannique encourage la recherche du marché américain.", ids("program", "statcan1927", "baldwin", "elgin"), "Lien entre les deux précisions officielles de la rubrique.", ["Fin des préférences", "Nouveaux débouchés", "Marché américain"], ["causes_and_consequences", "causal_connections"]),
    objective("ec-e-treaty", "Déterminer les produits et les droits couverts par le traité, ainsi que ses limites.", ids("program", "treaty"), "Précision officielle « Traité de réciprocité avec les États-Unis ».", ["Produits naturels", "Pêcheries", "Navigation", "Produits manufacturés"], ["establish_facts", "differences_and_similarities"]),
    objective("ec-e-change", "Comparer les débouchés et les règles commerciales avant et après 1846 puis après 1854.", ids("statcan1894", "statcan1927", "treaty"), "Changements et continuités de l’économie coloniale.", ["Marché britannique", "Marché américain", "Exportation de ressources"], ["changes_and_continuities"]),
    objective("ec-e-infrastructure", "Mettre en relation les canaux, le commerce des ressources et les débuts de l’industrialisation montréalaise.", ids("canalTrade", "canalIndustry"), "Contexte économique de la période, sans remplacer la notion d’industrialisation.", ["Canal de Lachine", "Montréal", "Transport", "Énergie hydraulique"], ["relationships_between_facts", "causal_connections"]),
  ],
  sourceCatalog: Object.values(SOURCES),
  editorialNotes: "Première version documentée. L’ordre officiel du programme situe Économie coloniale après Acte d’Union et avant Gouvernement responsable; Affaires indiennes suit Gouvernement responsable. Les sources ont été vérifiées en septembre 2026, mais le dossier demeure un brouillon soumis à validation historique et pédagogique humaine.",
  version: null,
  approvedAt: null,
};
