import type { HistoricalDocumentRecord, HistoricalDocumentStudentPresentation } from "./historical-document.ts";

const DURHAM_SOURCE_URL = "https://www.canadiana.ca/view/oocihm.32374";
const DURHAM_SCAN_URL = "https://www.loc.gov/item/08015373/";
const DURHAM_TRANSCRIPTION_URL = "https://primarydocuments.ca/report-on-the-affairs-of-british-north-america-durham-report/amp/";
const DURHAM_DOCUMENT_ID = "historical-document:acte-union:durham-report-1839";

export const ACTE_UNION_DURHAM_DOCUMENT = {
  schemaVersion: 1,
  id: DURHAM_DOCUMENT_ID,
  title: "Rapport sur les affaires de l’Amérique du Nord britannique",
  kind: "law-or-official-text",
  status: "approved",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["acte-union"],
  operationIds: ["establish_facts", "causes_and_consequences", "changes_and_continuities", "relationships_between_facts", "causal_connections"],
  historicalDate: "11 février 1839",
  creator: "John George Lambton, comte de Durham",
  holdingInstitution: "Parlement britannique; exemplaires numérisés par Canadiana et la Library of Congress",
  sourceUrl: DURHAM_SOURCE_URL,
  sourceLocator: "Édition de 1839, passages retenus aux p. 6, 92, 94-99 et 104-105",
  assetUrl: DURHAM_SCAN_URL,
  rightsStatement: "Le rapport officiel de 1839 appartient au domaine public. La Library of Congress indique que l’exemplaire numérisé peut être utilisé et réutilisé; la traduction-reconstruction française est rédigée par Socrato.",
  transcription: "Le rapport intégral est conservé dans les exemplaires numérisés liés à la fiche. Les segments anglais utilisés pour les cartes élèves sont repérés par page et vérifiés dans une transcription interrogeable.",
  accessibleDescription: "Rapport officiel britannique de 1839 dans lequel lord Durham analyse les troubles dans les colonies de l’Amérique du Nord britannique et recommande notamment l’union législative des deux Canadas.",
  historicalContext: "Après les Rébellions de 1837-1838, lord Durham reçoit le mandat d’enquêter sur les problèmes politiques des colonies britanniques d’Amérique du Nord. Son rapport recommande l’union législative, l’assimilation des Canadiens français et un gouvernement dont les principaux responsables obtiennent la confiance de la législature.",
  observationGuide: [
    "Distinguer le diagnostic de Durham de ses recommandations.",
    "Repérer le projet d’assimilation et les moyens politiques, linguistiques et démographiques envisagés.",
    "Distinguer les recommandations du rapport des dispositions effectivement inscrites dans l’Acte d’Union.",
  ],
  interpretationCautions: [
    "Présenter le rapport comme le point de vue d’un administrateur impérial britannique, et non comme une description neutre des populations.",
    "Expliquer que le vocabulaire hiérarchisant employé par Durham reflète des conceptions impériales et ethnocentriques du XIXe siècle.",
    "Ne pas attribuer automatiquement à l’Acte d’Union toutes les recommandations formulées dans le rapport.",
  ],
  pedagogicalUses: [
    "Relier les Rébellions, l’enquête de Durham et l’adoption de l’Acte d’Union.",
    "Analyser le projet d’assimilation et ses dimensions politiques, linguistiques, démographiques et économiques.",
    "Introduire la responsabilité ministérielle sans anticiper l’étude détaillée du gouvernement responsable.",
  ],
  version: "1.0",
  approvedAt: "2026-07-31T00:00:00.000-04:00",
} as const satisfies HistoricalDocumentRecord;

type PresentationInput = Pick<HistoricalDocumentStudentPresentation, "id" | "title" | "studentText" | "sourceSegmentLocators" | "operationIds" | "accessibleDescription" | "historicalContext" | "pointOfView" | "observationGuide" | "interpretationCautions" | "pedagogicalUses"> & Partial<Pick<HistoricalDocumentStudentPresentation, "editorialNote">>;

function durhamPresentation(input: PresentationInput): HistoricalDocumentStudentPresentation {
  return {
    schemaVersion: 1,
    documentId: DURHAM_DOCUMENT_ID,
    kind: "excerpt",
    status: "approved",
    contentSelectionStatus: "retained",
    periodIds: ["1840-1896"],
    knowledgeHeadingIds: ["acte-union"],
    typeLabel: "Extrait d’un rapport officiel",
    dateLabel: "11 février 1839",
    authorLabel: "John George Lambton, comte de Durham",
    originalDocumentLabel: "Report on the Affairs of British North America",
    sourceLabel: "John George Lambton, comte de Durham, Report on the Affairs of British North America, présenté au Parlement britannique le 11 février 1839.",
    sourceUrls: [DURHAM_SOURCE_URL, DURHAM_SCAN_URL, DURHAM_TRANSCRIPTION_URL],
    rightsLabel: "Rapport original de 1839 dans le domaine public; traduction-reconstruction française par Socrato.",
    editorialNote: "Traduction-reconstruction pédagogique réalisée par Socrato à partir du texte anglais. Toutes les coupures et tous les raccords entre segments sont signalés par […].",
    version: "1.0",
    approvedAt: "2026-07-31T00:00:00.000-04:00",
    ...input,
  };
}

export const ACTE_UNION_DURHAM_PRESENTATIONS = [
  durhamPresentation({
    id: "historical-presentation:acte-union:durham-diagnostic",
    title: "Le diagnostic de Durham",
    studentText: "Je m’attendais à trouver un conflit entre un gouvernement et un peuple; j’ai trouvé deux nations en lutte au sein d’un même État. J’y ai vu une lutte non de principes, mais de « races ». […] Selon moi, aucune amélioration durable des lois et des institutions n’était possible tant que cette hostilité séparait les habitants français et anglais du Bas-Canada.",
    sourceSegmentLocators: ["p. 6"],
    operationIds: ["establish_facts", "causes_and_consequences"],
    accessibleDescription: "Extrait dans lequel Durham présente les tensions du Bas-Canada comme un affrontement entre les populations française et anglaise.",
    historicalContext: "Durham explique d’abord comment son enquête modifie son interprétation des troubles du Bas-Canada après les Rébellions.",
    pointOfView: "Administrateur impérial britannique qui transforme un conflit politique et constitutionnel en conflit national et ethnique.",
    observationGuide: ["Relever les deux groupes que Durham oppose.", "Distinguer la cause qu’il croyait trouver de celle qu’il affirme avoir découverte."],
    interpretationCautions: ["Le mot « races » appartient au vocabulaire de Durham et doit être contextualisé.", "Le diagnostic de Durham est un point de vue historique, pas une explication neutre ou suffisante des Rébellions."],
    pedagogicalUses: ["Déterminer une cause invoquée par Durham.", "Comparer ce diagnostic à des explications politiques et constitutionnelles."],
  }),
  durhamPresentation({
    id: "historical-presentation:acte-union:durham-anglicisation",
    title: "Le projet d’anglicisation",
    studentText: "Le premier objectif devrait être de faire du Bas-Canada une province anglaise. […] L’assimilation aux habitudes anglaises a déjà commencé : la langue anglaise gagne du terrain, puisqu’elle est celle des riches et des employeurs. […] L’union des deux provinces donnerait une nette majorité anglaise, qui augmenterait chaque année grâce à l’immigration anglaise. Une fois placés en minorité, les Canadiens français abandonneraient, selon moi, leurs espoirs de conserver leur nationalité.",
    sourceSegmentLocators: ["p. 95", "p. 98"],
    operationIds: ["establish_facts", "relationships_between_facts", "changes_and_continuities"],
    accessibleDescription: "Extrait reconstruit montrant que Durham compte sur la progression de l’anglais, l’union législative et l’immigration pour placer les Canadiens français en minorité et favoriser leur assimilation.",
    historicalContext: "Durham cherche un moyen de mettre fin à la nationalité canadienne-française distincte qu’il juge incompatible avec l’avenir britannique de la colonie.",
    pointOfView: "Point de vue assimilationniste et hiérarchisant d’un représentant de l’Empire britannique.",
    observationGuide: ["Relever les moyens sur lesquels Durham compte pour favoriser l’anglicisation.", "Expliquer comment une majorité anglaise croissante pourrait affaiblir la nationalité canadienne-française selon Durham."],
    interpretationCautions: ["Présenter le raisonnement assimilationniste de Durham comme son point de vue, et non comme un résultat inévitable.", "Les segments proviennent de deux pages différentes et les raccords sont explicitement indiqués."],
    pedagogicalUses: ["Expliquer l’objectif d’assimilation.", "Mettre en relation langue, union législative, immigration et rapport de majorité."],
  }),
  durhamPresentation({
    id: "historical-presentation:acte-union:durham-union-legislative",
    title: "Pourquoi Durham propose l’Union",
    studentText: "Je ne crois pas qu’un remède durable puisse être apporté aux troubles du Bas-Canada sans fusionner son gouvernement avec celui d’une ou de plusieurs colonies voisines. […] Une union législative signifie l’incorporation des provinces sous une seule législature, qui exerce l’autorité législative sur l’ensemble. […] Je crois que la tranquillité ne pourra être rétablie qu’au moyen d’une telle union.",
    sourceSegmentLocators: ["p. 98", "p. 99"],
    operationIds: ["establish_facts", "causal_connections"],
    accessibleDescription: "Extrait dans lequel Durham relie les troubles du Bas-Canada à sa recommandation d’une union législative sous une seule législature.",
    historicalContext: "Dans la conclusion de son rapport, Durham compare l’union fédérale et l’union législative avant de recommander cette dernière pour les deux Canadas.",
    pointOfView: "Administrateur impérial qui présente l’union législative comme son principal remède politique aux troubles du Bas-Canada.",
    observationGuide: ["Relever le problème et la solution proposés.", "Définir l’union législative à partir de l’extrait."],
    interpretationCautions: ["La recommandation de Durham précède l’Acte d’Union et n’en constitue pas le texte.", "L’Acte final résulte aussi de décisions et de négociations ultérieures."],
    pedagogicalUses: ["Établir un lien causal entre le rapport Durham et l’Acte d’Union.", "Expliquer ce qu’est une union législative."],
  }),
  durhamPresentation({
    id: "historical-presentation:acte-union:durham-finances",
    title: "Revenus, dette et travaux publics",
    studentText: "L’union des deux provinces mettra fin aux différends concernant le partage des revenus. […] L’excédent du Bas-Canada pourra combler le manque de revenus du Haut-Canada et contribuer au paiement des intérêts de sa dette. Les travaux publics financés par cette dette, notamment les canaux, concernent selon moi les deux provinces. L’union permettra également au Haut-Canada d’obtenir un accès à la mer.",
    sourceSegmentLocators: ["p. 99"],
    operationIds: ["causes_and_consequences", "relationships_between_facts"],
    accessibleDescription: "Extrait dans lequel Durham présente les avantages financiers, commerciaux et territoriaux que l’Union procurerait au Haut-Canada.",
    historicalContext: "Le Haut-Canada est endetté notamment en raison de travaux publics, tandis que l’union proposée rendrait communs certains revenus et engagements financiers.",
    pointOfView: "Durham justifie le partage financier en affirmant que les travaux publics du Haut-Canada bénéficient aux deux colonies.",
    observationGuide: ["Relever les effets financiers prévus.", "Relier les canaux, l’accès à la mer et les intérêts économiques du Haut-Canada."],
    interpretationCautions: ["L’extrait présente la justification de Durham, qui peut être contestée par des acteurs du Bas-Canada.", "Il ne faut pas résumer la mesure comme une simple facture directement remise à la population du Bas-Canada."],
    pedagogicalUses: ["Déterminer des conséquences économiques de l’Union.", "Comparer le point de vue de Durham à celui de La Fontaine sur la dette."],
  }),
  durhamPresentation({
    id: "historical-presentation:acte-union:durham-responsabilite",
    title: "La responsabilité ministérielle",
    studentText: "Les fonctionnaires du gouvernement, à l’exception du gouverneur et de son secrétaire, devraient être responsables devant la législature unie. Le gouverneur devrait administrer la colonie avec des chefs de département qui possèdent la confiance de cette législature. […] Il ne devrait recevoir l’appui du gouvernement britannique contre la législature que lorsque des intérêts strictement impériaux sont en cause.",
    sourceSegmentLocators: ["p. 105"],
    operationIds: ["establish_facts", "relationships_between_facts", "causal_connections"],
    accessibleDescription: "Extrait dans lequel Durham décrit un exécutif colonial responsable devant la législature et dépendant de sa confiance.",
    historicalContext: "Durham recommande de modifier le fonctionnement de l’exécutif colonial afin que ses principaux responsables aient la confiance de la législature élue.",
    pointOfView: "Réformateur impérial qui souhaite rendre l’administration coloniale plus responsable tout en maintenant les intérêts strictement impériaux sous l’autorité britannique.",
    observationGuide: ["Identifier devant qui les responsables doivent répondre.", "Repérer le rôle de la confiance de la législature.", "Relever l’exception concernant les intérêts impériaux."],
    interpretationCautions: ["L’Acte d’Union n’inscrit pas cette recommandation dans la loi.", "L’obtention et le fonctionnement du gouvernement responsable appartiennent à la notion suivante."],
    pedagogicalUses: ["Définir la responsabilité ministérielle.", "Distinguer une recommandation du rapport d’une disposition de l’Acte d’Union."],
  }),
  durhamPresentation({
    id: "historical-presentation:acte-union:durham-continuites",
    title: "Les continuités après l’Union",
    studentText: "Les institutions et les lois des deux colonies devraient demeurer en vigueur jusqu’à ce que la législature unie décide de les modifier. Les garanties déjà accordées à l’Église catholique au Bas-Canada devraient également être protégées par la loi créant l’Union.",
    sourceSegmentLocators: ["p. 104"],
    operationIds: ["changes_and_continuities"],
    accessibleDescription: "Extrait dans lequel Durham recommande de maintenir provisoirement les lois et institutions existantes et de protéger les garanties de l’Église catholique.",
    historicalContext: "L’union législative réunirait les gouvernements sans uniformiser immédiatement toutes les lois, institutions et garanties religieuses des deux colonies.",
    pointOfView: "Durham propose une union politique immédiate accompagnée d’une continuité juridique et institutionnelle jusqu’aux décisions de la nouvelle législature.",
    observationGuide: ["Relever ce qui demeure en vigueur après l’Union.", "Identifier l’institution dont les garanties devraient être protégées."],
    interpretationCautions: ["Le passage formule une recommandation; il faut vérifier séparément les dispositions de l’Acte adopté.", "La continuité n’empêche pas la nouvelle législature de modifier ultérieurement les lois et institutions."],
    pedagogicalUses: ["Déterminer des continuités malgré l’Union.", "Éviter l’idée que toutes les lois deviennent immédiatement identiques."],
  }),
  durhamPresentation({
    id: "historical-presentation:acte-union:durham-anglicisation-avancement",
    title: "L’anglais et l’avancement politique",
    studentText: "L’explication de cette assimilation est évidente. Les Français de la Louisiane, lorsqu’ils furent constitués en État, furent incorporés à une grande nation dont ils ne formaient qu’une très petite partie. Les regards de tout homme ambitieux se tournèrent naturellement vers le grand centre des affaires fédérales et vers les hautes récompenses de l’ambition fédérale. […] Chaque homme aspirant chercha à fondre son caractère français et à adopter complètement une nationalité américaine. […] Ne parler qu’une langue étrangère à celle des États-Unis constituait donc un désavantage pour un candidat aux fonctions de sénateur ou de représentant; les Français se qualifièrent en apprenant l’anglais ou se soumirent aux avantages supérieurs de leurs concurrents anglais. […] Ce n’est que par les mêmes moyens — par un gouvernement populaire dans lequel une majorité anglaise prédominera en permanence — que le Bas-Canada pourra être gouverné paisiblement.",
    sourceSegmentLocators: ["p. 98"],
    operationIds: ["causal_connections", "relationships_between_facts"],
    accessibleDescription: "Traduction abrégée d’un passage dans lequel Durham compare le Bas-Canada à la Louisiane et affirme que l’ambition politique, l’apprentissage de l’anglais et la domination permanente d’une majorité anglaise favoriseraient l’assimilation.",
    historicalContext: "Durham présente la Louisiane comme un modèle d’assimilation graduelle qu’il souhaite appliquer au Bas-Canada après l’Union.",
    pointOfView: "Administrateur impérial qui considère l’adoption de l’anglais et l’abandon d’une nationalité distincte comme des conséquences souhaitables de l’avancement politique.",
    observationGuide: ["Relever ce qui désavantage les candidats francophones.", "Expliquer pourquoi le désir d’obtenir une fonction politique peut pousser une personne à apprendre l’anglais."],
    interpretationCautions: ["L’exemple de la Louisiane sert d’argument à Durham; il ne prouve pas que l’assimilation du Bas-Canada était inévitable.", "Le passage conserve le point de vue et la voix de Durham; il s’agit d’une traduction française abrégée, dont les coupures sont signalées par […]."],
    pedagogicalUses: ["Expliquer l’assimilation par les incitatifs liés à l’avancement politique.", "Distinguer une interdiction directe d’une pression sociale et politique favorisant l’anglais."],
    editorialNote: "Traduction française abrégée et fidèle au passage de la p. 98 du rapport Durham. Les coupures sont signalées par […].",
  }),
] as const satisfies readonly HistoricalDocumentStudentPresentation[];

export const ACTE_UNION_DURHAM_UNION_PRESENTATION = ACTE_UNION_DURHAM_PRESENTATIONS[2];
export const ACTE_UNION_DURHAM_RESPONSIBLE_GOVERNMENT_PRESENTATION = ACTE_UNION_DURHAM_PRESENTATIONS[4];
export const ACTE_UNION_DURHAM_ANGLICIZATION_PRESENTATION = ACTE_UNION_DURHAM_PRESENTATIONS[1];
export const ACTE_UNION_DURHAM_CONTINUITIES_PRESENTATION = ACTE_UNION_DURHAM_PRESENTATIONS[5];
export const ACTE_UNION_DURHAM_FINANCES_PRESENTATION = ACTE_UNION_DURHAM_PRESENTATIONS[3];
export const ACTE_UNION_DURHAM_ADVANCEMENT_ANGLICIZATION_PRESENTATION = ACTE_UNION_DURHAM_PRESENTATIONS[6];
