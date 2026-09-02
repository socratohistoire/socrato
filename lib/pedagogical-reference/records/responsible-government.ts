import type { ExpectedLearningObjective, HistoricalClaim, HistoricalRecord, IntellectualOperationId, ReferenceSource } from "../types.ts";

const SOURCES = {
  program: { id: "pfeq-hqc-2017", kind: "official-program", title: "Programme de formation de l’école québécoise – Histoire du Québec et du Canada", creator: "Ministère de l’Éducation", publisher: "Gouvernement du Québec", publicationYear: 2017, url: "https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/secondaire/programmes/PFEQ-histoire-quebec-canada-secondaire.pdf", locator: "Précisions des connaissances, période 1840-1896, p. 46 du programme (p. 49 du PDF)", verificationStatus: "verified" },
  responsible: { id: "anq-gouvernement-responsable", kind: "government", title: "Gouvernement responsable", creator: "Encyclopédie du parlementarisme québécois", publisher: "Assemblée nationale du Québec", url: "https://www.assnat.qc.ca/fr/patrimoine/lexique/gouvernement-responsable.html", locator: "Définition; cheminement au Canada-Uni; double majorité et instabilité ministérielle sous l’Union", verificationStatus: "verified" },
  province: { id: "anq-province-canada", kind: "government", title: "Province du Canada (1840-1867)", creator: "Bibliothèque de l’Assemblée nationale du Québec", publisher: "Assemblée nationale du Québec", url: "https://www.bibliotheque.assnat.qc.ca/guides/fr/documents-politiques-et-parlementaires-du-quebec/146-province-du-canada-1840-1867-", locator: "Contexte historique; administrations de Bagot, Metcalfe et Elgin; ministères La Fontaine-Baldwin", verificationStatus: "verified" },
  durham: { id: "durham-report-1839", kind: "government", title: "Report on the Affairs of British North America", creator: "John George Lambton, comte de Durham", publisher: "Parlement britannique; Canadiana", publicationYear: 1839, url: "https://www.canadiana.ca/view/oocihm.32374", locator: "Passages sur la conduite des affaires intérieures et la confiance de la Chambre d’assemblée", verificationStatus: "verified" },
  act: { id: "union-act-1840-official", kind: "government", title: "Acte d’Union, 1840 / The Union Act, 1840", creator: "Parlement du Royaume-Uni", publisher: "Gouvernement du Canada", publicationYear: 1840, url: "https://publications.gc.ca/collections/collection_2014/lois-statutes/YX44-1985-9-1.pdf", locator: "3 & 4 Victoria, ch. 35; dispositions sur le gouverneur, le Conseil exécutif et l’Assemblée", verificationStatus: "verified" },
  lafontaine: { id: "dbc-lafontaine", kind: "academic", title: "LA FONTAINE, sir LOUIS-HIPPOLYTE", creator: "Jacques Monet", publisher: "Dictionnaire biographique du Canada, Université Laval/University of Toronto", url: "https://www.biographi.ca/fr/bio/la_fontaine_louis_hippolyte_9F.html", locator: "Alliance avec Baldwin; ministères de 1842-1843 et de 1848-1851; crise Metcalfe", verificationStatus: "verified" },
  hincks: { id: "dbc-hincks-lafontaine-letter", kind: "academic", title: "Lettre de Francis Hincks à Louis-Hippolyte La Fontaine", creator: "Francis Hincks", publisher: "Dictionnaire biographique du Canada", publicationYear: 1840, url: "https://www.biographi.ca/en/bio/4541?revision_id=33966", locator: "Lettre du 17 juin 1840 citée dans la biographie de La Fontaine; nécessité d’une alliance entre les réformistes des deux sections", verificationStatus: "verified" },
  electoralLaw: { id: "bnald-electoral-law-1849", kind: "academic", title: "An Act to repeal certain Acts … and amend, consolidate and reduce into one Act … Elections", creator: "Parlement de la Province du Canada", publisher: "British North American Legislative Database, Université du Nouveau-Brunswick", publicationYear: 1849, url: "https://bnald.lib.unb.ca/legislation/act-repeal-certain-acts-therein-mentioned-and-amend-consolidate-and-reduce-one-act", locator: "12 Victoria, ch. 27, art. XLII, XLIV et XLVI", verificationStatus: "verified" },
} as const satisfies Record<string, ReferenceSource>;

const ids = (...keys: (keyof typeof SOURCES)[]) => keys.map((key) => SOURCES[key].id);
const claim = (claimKind: HistoricalClaim["claimKind"], id: string, text: string, sourceIds: readonly string[]): HistoricalClaim => ({ id, text, sourceIds, claimKind });
const fact = (id: string, text: string, sourceIds: readonly string[]) => claim("fact", id, text, sourceIds);
const nuance = (id: string, text: string, sourceIds: readonly string[]) => claim("nuance", id, text, sourceIds);
const interpretation = (id: string, text: string, sourceIds: readonly string[]) => claim("interpretation", id, text, sourceIds);
const statement = (id: string, text: string, sourceIds: readonly string[]) => ({ id, text, sourceIds });
const objective = (id: string, text: string, sourceIds: readonly string[], programBasis: string, knowledgeFocus: readonly string[], operationIds: readonly IntellectualOperationId[]): ExpectedLearningObjective => ({ id, text, sourceIds, origin: "socrato-editorial-derivation", programBasis, knowledgeFocus, operationIds });

export const RESPONSIBLE_GOVERNMENT_HISTORICAL_RECORD: HistoricalRecord = {
  schemaVersion: 1,
  id: "historical-record:gouvernement-responsable",
  knowledgeHeadingId: "gouvernement-responsable",
  status: "draft",
  title: "Dossier historique — Le gouvernement responsable",
  scope: "De 1841 à 1864 : l’alliance des réformistes, le fonctionnement du gouvernement responsable et l’instabilité ministérielle dans la Province du Canada.",
  knowledgePrecisions: [
    { ...statement("gr-precision-alliance", "L’alliance de La Fontaine et Baldwin réunit les réformistes du Canada-Est et du Canada-Ouest afin de former une majorité dans l’Assemblée commune.", ids("program", "hincks", "lafontaine")), officialOrder: 1, officialLabel: "Alliance des Réformistes", coverageStatus: "complete", linkedStatementIds: ["gr-alliance-1", "gr-alliance-2", "gr-alliance-3"] },
    { ...statement("gr-precision-functioning", "Le ministère gouverne tant qu’il conserve la confiance de l’Assemblée, tandis que le gouverneur suit normalement son avis dans les affaires intérieures.", ids("program", "responsible")), officialOrder: 2, officialLabel: "Fonctionnement du gouvernement responsable", coverageStatus: "complete", linkedStatementIds: ["gr-definition-1", "gr-definition-2", "gr-1848-2", "gr-structure-change"] },
    { ...statement("gr-precision-instability", "Sous l’Union, la difficulté de conserver une majorité dans les deux sections fragilise les ministères et provoque de fréquentes démissions après des défaites en Chambre.", ids("program", "responsible", "province")), officialOrder: 3, officialLabel: "Instabilité ministérielle", coverageStatus: "complete", linkedStatementIds: ["gr-instability-1", "gr-instability-2", "gr-instability-3"] },
  ],
  manual: {
    title: "Monographie historique interne — L’avènement du gouvernement responsable",
    purpose: "Fournir à Socrato une synthèse originale, vérifiable et nuancée pour encadrer les fiches, les documents, les questions et les rétroactions portant sur cette notion.",
    audience: "internal-pedagogical-reference",
    editorialMethod: "Synthèse originale fondée sur le programme officiel, des textes constitutionnels, des ressources parlementaires et des biographies savantes déjà vérifiées dans le catalogue local. Après une définition conceptuelle initiale, le développement suit l’ordre chronologique de 1841 à 1864; le dernier chapitre constitue un bilan thématique.",
    scopeBoundary: "La monographie couvre la période de 1841 à 1864. Elle commence avec l’entrée en vigueur de l’Acte d’Union et la formation de l’alliance réformiste, puis explique l’obtention et le fonctionnement du gouvernement responsable ainsi que l’instabilité des ministères jusqu’à la Grande Coalition. Elle s’arrête à ce repère, avant les conférences constitutionnelles et la Confédération de 1867, qui appartiennent à la notion suivante.",
    sections: [
      { id: "gr-mono-definition", title: "Repère initial — Un exécutif responsable devant l’Assemblée", purpose: "Définir le principe nécessaire à la lecture de la séquence chronologique.", paragraphs: [
        fact("gr-definition-1", "Dans un gouvernement responsable, les ministres qui administrent les affaires intérieures doivent pouvoir obtenir et conserver la confiance de la majorité à l’Assemblée élue. S’ils perdent cette confiance, ils doivent normalement démissionner ou demander des élections.", ids("responsible", "durham")),
        nuance("gr-definition-2", "Le principe ne signifie pas que l’Assemblée élit directement chaque ministre. Le gouverneur les nomme officiellement, mais il doit choisir des personnes capables de gouverner avec l’appui de la Chambre et suivre normalement leurs conseils dans les affaires intérieures.", ids("responsible")),
        nuance("gr-definition-3", "La Couronne, le gouverneur et les pouvoirs impériaux ne disparaissent pas. Les affaires extérieures et les intérêts de l’Empire demeurent notamment soumis à l’autorité britannique.", ids("responsible", "province")),
      ] },
      { id: "gr-mono-union", title: "1841 — Le problème laissé par l’Acte d’Union", purpose: "Commencer la séquence avec l’organisation politique qui entre en vigueur en 1841.", paragraphs: [
        fact("gr-union-1", "L’Acte d’Union réunit le Haut-Canada et le Bas-Canada, crée une Assemblée élue commune et maintient un Conseil exécutif dont les membres sont nommés par le gouverneur. La loi n’exige pas que ces conseillers conservent la confiance de l’Assemblée.", ids("act", "province")),
        interpretation("gr-union-2", "Le régime associe donc une représentation élective à un exécutif encore dominé par le gouverneur. Comme l’Assemblée vote les lois et les fonds publics, gouverner durablement sans majorité parlementaire devient toutefois difficile.", ids("act", "responsible", "province")),
        fact("gr-union-3", "Durham avait recommandé que les affaires intérieures soient conduites par des conseillers soutenus par l’Assemblée. L’Union législative est adoptée, mais cette recommandation n’est pas inscrite dans l’Acte d’Union.", ids("durham", "act", "responsible")),
      ] },
      { id: "gr-mono-alliance", title: "1841-1842 — L’alliance des réformistes", purpose: "Expliquer la stratégie transsectionnelle de La Fontaine et Baldwin dans la nouvelle législature.", paragraphs: [
        fact("gr-alliance-1", "À partir de 1841, Louis-Hippolyte La Fontaine au Canada-Est et Robert Baldwin au Canada-Ouest collaborent dans la législature commune. Leur alliance réunit des réformistes des deux sections afin de former une majorité parlementaire.", ids("hincks", "lafontaine", "province")),
        interpretation("gr-alliance-2", "L’alliance réformiste permet de dépasser les divisions régionales et linguistiques pour rechercher une majorité dans l’ensemble de l’Assemblée. Elle fait de la confiance parlementaire une force politique concrète plutôt qu’une revendication abstraite.", ids("hincks", "lafontaine", "province")),
        nuance("gr-alliance-3", "Cette collaboration ne supprime ni les désaccords ni les rapports de pouvoir entre les groupes de la colonie. Elle constitue une stratégie commune autour de réformes constitutionnelles, et non une fusion complète de leurs intérêts.", ids("lafontaine", "province")),
      ] },
      { id: "gr-mono-crises", title: "1842-1843 — De Bagot à la crise Metcalfe", purpose: "Montrer comment les conflits de 1842-1843 clarifient l’enjeu de la responsabilité.", paragraphs: [
        fact("gr-bagot-1", "En 1842, le gouverneur Charles Bagot fait entrer La Fontaine et Baldwin au Conseil exécutif afin d’obtenir l’appui d’une majorité à l’Assemblée. Leur ministère constitue une avancée dans la pratique de la responsabilité, sans régler définitivement la question.", ids("responsible", "province", "lafontaine")),
        fact("gr-metcalfe-1", "En 1843, le gouverneur Charles Metcalfe refuse de reconnaître que les nominations publiques doivent normalement être faites sur l’avis de ses ministres. La Fontaine, Baldwin et presque tous leurs collègues démissionnent.", ids("responsible", "province", "lafontaine")),
        interpretation("gr-metcalfe-2", "La crise rend le conflit visible : un ministère peut-il être tenu responsable de l’administration devant l’Assemblée si le gouverneur prend seul des décisions importantes? Pour les réformistes, responsabilité et contrôle politique des nominations sont liés.", ids("responsible", "lafontaine")),
      ] },
      { id: "gr-mono-1848", title: "1848 — La reconnaissance du gouvernement responsable", purpose: "Expliquer le rôle de la majorité réformiste et de lord Elgin.", paragraphs: [
        fact("gr-1848-1", "Les réformistes remportent une majorité aux élections de 1848. Le gouverneur lord Elgin demande alors à La Fontaine et Baldwin de former un ministère capable de conserver la confiance de l’Assemblée.", ids("responsible", "province", "lafontaine")),
        fact("gr-1848-2", "Elgin accepte de suivre l’avis de ses ministres dans les affaires intérieures, même lorsqu’il désapprouve politiquement leurs décisions. Cette pratique marque l’avènement du gouvernement responsable dans la Province du Canada.", ids("responsible", "province")),
        nuance("gr-1848-3", "Il est plus exact de parler d’une reconnaissance et d’une mise en pratique en 1848 que d’une seule loi créant soudainement le gouvernement responsable. Le changement résulte d’une évolution politique et de précédents accumulés.", ids("responsible", "province")),
      ] },
      { id: "gr-mono-effects", title: "1849 — Les effets et l’épreuve de la loi d’indemnisation", purpose: "Montrer comment une crise politique met à l’épreuve la nouvelle responsabilité ministérielle.", paragraphs: [
        interpretation("gr-effects-1", "Le centre de décision pour les affaires intérieures se déplace vers un ministère appuyé par les élus. Le gouverneur conserve ses pouvoirs formels, mais leur exercice est désormais limité par une convention politique de responsabilité.", ids("responsible", "province")),
        fact("gr-effects-2", "En 1849, Elgin sanctionne la loi d’indemnisation des pertes subies pendant les Rébellions parce qu’elle a été adoptée par la majorité. Des opposants l’attaquent et une foule incendie le Parlement de Montréal.", ids("responsible", "province")),
        interpretation("gr-effects-3", "En acceptant une mesure controversée soutenue par le ministère et l’Assemblée, Elgin confirme que le gouverneur ne remplace pas le jugement de la majorité coloniale par ses préférences personnelles dans les affaires intérieures.", ids("responsible", "province")),
      ] },
      { id: "gr-mono-instability", title: "1854-1864 — L’instabilité ministérielle sous l’Union", purpose: "Suivre la fragilisation des ministères jusqu’à la Grande Coalition de 1864.", paragraphs: [
        fact("gr-instability-1", "À partir du milieu des années 1850, un ministère peut chercher à conserver non seulement une majorité dans l’ensemble de l’Assemblée, mais aussi une majorité parmi les députés de chacune des deux sections. Cette pratique, appelée double majorité, rend ses appuis parlementaires plus difficiles à maintenir.", ids("responsible", "province")),
        fact("gr-instability-2", "Après 1856, plusieurs gouvernements reposent sur des coalitions fragiles. Une défaite importante en Chambre peut entraîner la démission de ministres d’une section ou la chute du gouvernement.", ids("responsible", "province")),
        interpretation("gr-instability-3", "L’instabilité ministérielle découle donc du fonctionnement même de l’Union : les intérêts et les majorités du Canada-Est et du Canada-Ouest doivent être conciliés dans une seule Assemblée. Le gouvernement responsable soumet réellement le ministère à la confiance des élus, mais cette confiance est difficile à préserver durablement.", ids("responsible", "province")),
        fact("gr-instability-4", "En 1864, après la chute rapide de plusieurs ministères, des dirigeants jusque-là adversaires forment la Grande Coalition. Ils cherchent une solution capable de sortir la Province du Canada de son impasse politique.", ids("province", "responsible")),
        nuance("gr-instability-5", "L’instabilité ministérielle contribue au projet de fédération, mais elle n’en est pas l’unique cause. Les enjeux économiques, ferroviaires, militaires et coloniaux doivent être étudiés avec la notion de la fédération canadienne.", ids("province", "responsible", "program")),
      ] },
      { id: "gr-mono-limits", title: "Bilan — Une avancée politique aux limites importantes", purpose: "Conclure sans confondre responsabilité ministérielle, démocratie universelle et indépendance.", paragraphs: [
        nuance("gr-limits-1", "Le gouvernement responsable élargit le pouvoir des élus, mais le droit de vote demeure limité par le sexe, l’âge, le statut et la propriété. En 1849, une loi exclut explicitement les femmes du vote dans la Province du Canada.", ids("electoralLaw", "program")),
        nuance("gr-limits-2", "La réforme ne rend pas la Province du Canada indépendante et n’abolit ni la monarchie ni la domination coloniale. Elle modifie surtout la personne devant laquelle les ministres doivent répondre de la conduite des affaires intérieures.", ids("responsible", "province")),
        interpretation("gr-structure-change", "Le changement essentiel se lit donc dans la relation entre trois pôles : le gouverneur nomme officiellement, le ministère gouverne et l’Assemblée peut soutenir ou retirer sa confiance. Cette nouvelle relation devient une base durable du parlementarisme canadien.", ids("responsible", "province")),
      ] },
    ],
  },
  narrative: [
    fact("gr-narrative-context", "En 1841, l’exécutif de la Province du Canada n’est pas responsable devant l’Assemblée élue.", ids("act", "responsible")),
    fact("gr-narrative-alliance", "La Fontaine et Baldwin construisent une alliance entre réformistes du Canada-Est et du Canada-Ouest.", ids("hincks", "lafontaine")),
    fact("gr-narrative-bagot", "Bagot appelle les chefs réformistes au Conseil exécutif en 1842 afin d’obtenir un appui parlementaire.", ids("responsible", "province")),
    fact("gr-narrative-metcalfe", "La crise Metcalfe de 1843 entraîne la démission du ministère réformiste.", ids("responsible", "lafontaine")),
    fact("gr-narrative-election", "La majorité réformiste de 1848 permet la formation du ministère La Fontaine-Baldwin.", ids("responsible", "province")),
    interpretation("gr-narrative-result", "L’acceptation par Elgin de l’avis de ce ministère établit la responsabilité dans la pratique.", ids("responsible", "province")),
  ],
  chronologicalMarkers: [
    { ...statement("gr-c-1841", "L’Acte d’Union entre en vigueur sans garantir le gouvernement responsable; La Fontaine et Baldwin développent une alliance entre les réformistes des deux sections.", ids("act", "hincks", "lafontaine", "responsible")), dateLabel: "1841", sortYear: 1841 },
    { ...statement("gr-c-1842", "Bagot fait entrer La Fontaine et Baldwin au Conseil exécutif.", ids("responsible", "province")), dateLabel: "1842", sortYear: 1842 },
    { ...statement("gr-c-1843", "Le refus de Metcalfe de suivre l’avis de ses ministres provoque leur démission.", ids("responsible", "lafontaine")), dateLabel: "1843", sortYear: 1843 },
    { ...statement("gr-c-1848", "La majorité réformiste forme un ministère sous La Fontaine et Baldwin avec l’appui d’Elgin.", ids("responsible", "province")), dateLabel: "1848", sortYear: 1848 },
    { ...statement("gr-c-1849", "La sanction de la loi d’indemnisation met à l’épreuve la nouvelle pratique responsable.", ids("responsible", "province")), dateLabel: "1849", sortYear: 1849 },
    { ...statement("gr-c-1864", "La Grande Coalition réunit des adversaires politiques afin de sortir de l’impasse ministérielle et de rechercher une nouvelle solution constitutionnelle.", ids("responsible", "province")), dateLabel: "1864", sortYear: 1864 },
  ],
  actors: [
    { ...statement("gr-a-lafontaine", "Chef réformiste du Canada-Est et copremier ministre du gouvernement de 1848.", ids("lafontaine", "responsible")), actorType: "person", name: "Louis-Hippolyte La Fontaine" },
    { ...statement("gr-a-baldwin", "Chef réformiste du Canada-Ouest et partenaire politique de La Fontaine.", ids("province", "lafontaine")), actorType: "person", name: "Robert Baldwin" },
    { ...statement("gr-a-metcalfe", "Gouverneur dont le conflit avec ses ministres provoque la crise de 1843.", ids("responsible", "province")), actorType: "person", name: "Charles Metcalfe" },
    { ...statement("gr-a-elgin", "Gouverneur qui met en pratique le principe responsable avec la majorité de 1848.", ids("responsible", "province")), actorType: "person", name: "Lord Elgin" },
    { ...statement("gr-a-reformers", "Coalition politique qui cherche à faire dépendre l’exécutif de la majorité élue.", ids("hincks", "lafontaine")), actorType: "group", name: "Réformistes du Canada-Est et du Canada-Ouest" },
  ],
  territories: [statement("gr-t-province", "La Province du Canada réunit le Canada-Est et le Canada-Ouest dans une même législature.", ids("act", "province"))],
  relationships: [
    { ...statement("gr-r-union-alliance", "La législature commune favorise une alliance transsectionnelle capable de former une majorité.", ids("act", "hincks")), relationshipType: "cause", relatedKnowledgeHeadingIds: ["acte-union"] },
    { ...statement("gr-r-crisis", "La crise de 1843 démontre les limites d’un ministère responsable devant l’Assemblée lorsque le gouverneur agit sans son avis.", ids("responsible", "lafontaine")), relationshipType: "connection", relatedKnowledgeHeadingIds: ["acte-union"] },
    { ...statement("gr-r-change", "En 1848, le pouvoir formel du gouverneur demeure, mais la pratique de son exercice change au profit du ministère majoritaire.", ids("responsible", "province")), relationshipType: "change", relatedKnowledgeHeadingIds: ["acte-union"] },
    { ...statement("gr-r-limit", "L’élargissement du pouvoir de l’Assemblée coexiste avec un suffrage restreint.", ids("responsible", "electoralLaw")), relationshipType: "continuity", relatedKnowledgeHeadingIds: ["role-des-femmes"] },
  ],
  vocabulary: [
    { ...statement("gr-v-responsible", "Régime dans lequel les ministres doivent conserver la confiance de l’Assemblée élue.", ids("responsible")), term: "Gouvernement responsable" },
    { ...statement("gr-v-confidence", "Appui de la majorité des députés qui permet au ministère de gouverner.", ids("responsible")), term: "Confiance parlementaire" },
    { ...statement("gr-v-ministry", "Groupe de ministres chargé de l’administration et politiquement comptable devant l’Assemblée.", ids("responsible")), term: "Ministère" },
    { ...statement("gr-v-convention", "Règle politique suivie dans la pratique sans être nécessairement formulée dans une loi.", ids("responsible")), term: "Convention constitutionnelle" },
    { ...statement("gr-v-majority", "Groupe ou coalition qui détient plus de sièges et peut soutenir le ministère.", ids("responsible", "province")), term: "Majorité parlementaire" },
  ],
  misconceptions: [
    { ...statement("gr-m-law", "Le gouvernement responsable est établi progressivement dans la pratique et non créé par un article unique de l’Acte d’Union.", ids("act", "responsible")), misconception: "L’Acte d’Union instaure le gouvernement responsable en 1841." },
    { ...statement("gr-m-direct", "L’Assemblée ne nomme pas directement les ministres; sa confiance détermine toutefois qui peut gouverner.", ids("responsible")), misconception: "Les députés élisent directement le Conseil exécutif." },
    { ...statement("gr-m-independence", "La responsabilité ministérielle ne met pas fin au statut colonial de la Province du Canada.", ids("responsible", "province")), misconception: "Le Canada devient indépendant en 1848." },
    { ...statement("gr-m-democracy", "Le suffrage demeure restreint et les femmes sont explicitement exclues en 1849.", ids("electoralLaw")), misconception: "Le gouvernement responsable accorde le vote à toute la population." },
    { ...statement("gr-m-elgin", "Elgin conserve une fonction constitutionnelle, mais accepte de gouverner selon l’avis d’un ministère majoritaire.", ids("responsible", "province")), misconception: "Elgin abandonne tous les pouvoirs du gouverneur." },
  ],
  expectedLearning: [
    objective("gr-e-define", "Définir le gouvernement responsable à partir de la confiance de l’Assemblée et du rôle du gouverneur.", ids("program", "responsible"), "Rubrique officielle « Gouvernement responsable ».", ["Confiance parlementaire", "Conseil exécutif", "Gouverneur"], ["establish_facts", "relationships_between_facts"]),
    objective("gr-e-sequence", "Ordonner les étapes qui mènent de l’entrée en vigueur de l’Acte d’Union en 1841 à la reconnaissance du gouvernement responsable en 1848.", ids("program", "act", "responsible"), "Chronologie et cheminement vers le gouvernement responsable.", ["1841", "1842", "1843", "1848"], ["time_and_space"]),
    objective("gr-e-alliance", "Expliquer comment l’alliance La Fontaine-Baldwin contribue à la formation d’une majorité réformiste.", ids("program", "hincks", "lafontaine"), "Acteurs et rapports de pouvoir de la période.", ["Alliance transsectionnelle", "Majorité parlementaire"], ["causal_connections", "relationships_between_facts"]),
    objective("gr-e-instability", "Expliquer le lien entre la double majorité, la fragilité des coalitions et l’instabilité ministérielle sous l’Union.", ids("program", "responsible", "province"), "Précision officielle « Instabilité ministérielle ».", ["Double majorité", "Coalitions", "Confiance parlementaire"], ["causal_connections", "relationships_between_facts"]),
    objective("gr-e-change", "Déterminer ce qui change et ce qui demeure après 1848 dans les rapports entre l’exécutif, l’Assemblée et la Couronne.", ids("program", "responsible", "province"), "Changements politiques sous le régime de l’Union.", ["Responsabilité ministérielle", "Pouvoirs formels", "Statut colonial"], ["changes_and_continuities", "differences_and_similarities"]),
    objective("gr-e-limits", "Expliquer pourquoi le gouvernement responsable ne correspond pas à une démocratie universelle.", ids("program", "electoralLaw"), "Mise en contexte des limites de la participation politique.", ["Suffrage restreint", "Exclusion des femmes"], ["relationships_between_facts", "changes_and_continuities"]),
  ],
  sourceCatalog: Object.values(SOURCES),
  editorialNotes: "Première rédaction de la monographie à partir de la recherche déjà intégrée au dépôt. Dossier à soumettre à la même validation historique et pédagogique que celui de l’Acte d’Union.",
  version: null,
  approvedAt: null,
};
