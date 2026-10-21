import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";
import {
  GOVERNMENT_REVENUE_DOCUMENTS,
  MANITOBA_SCHOOLS_DOCUMENT,
  NEW_BRUNSWICK_SCHOOLS_DOCUMENT,
} from "./federal-provincial-relations-primary-documents.ts";
import {
  INTERPROVINCIAL_CONFERENCE_INVITATION_DOCUMENT,
  INTERPROVINCIAL_CONFERENCE_RESOLUTIONS_DOCUMENT,
  MACDONALD_CENTRAL_GOVERNMENT_DOCUMENT,
} from "./federal-provincial-relations-coverage-documents.ts";

function sourceFromDocument(document: HistoricalDocumentRecord, publicationYear: number): ReferenceSource {
  return {
    id: `document-source:${document.id}`,
    kind: "museum-or-archive",
    title: document.title,
    creator: document.creator,
    publisher: document.holdingInstitution,
    publicationYear,
    url: document.sourceUrl,
    locator: document.sourceLocator,
    rightsNote: document.rightsStatement,
    verificationStatus: "verified",
  };
}

const conferenceQuestionDocuments = [
  INTERPROVINCIAL_CONFERENCE_INVITATION_DOCUMENT,
  INTERPROVINCIAL_CONFERENCE_RESOLUTIONS_DOCUMENT,
] as const;

const federalismViewpointDocuments = [
  MACDONALD_CENTRAL_GOVERNMENT_DOCUMENT,
  INTERPROVINCIAL_CONFERENCE_RESOLUTIONS_DOCUMENT,
] as const;

const schoolCrisisDocuments = [
  NEW_BRUNSWICK_SCHOOLS_DOCUMENT,
  MANITOBA_SCHOOLS_DOCUMENT,
] as const;

export const INTERPROVINCIAL_CONFERENCE_CAUSES_CLAIMS_QUESTION = {
  schemaVersion: 1,
  id: "question:relations-federales-provinciales:document-interpretation-019",
  scope: "notional",
  knowledgeHeadingId: "relations-federales-provinciales",
  relatedKnowledgeHeadingIds: ["relations-federales-provinciales"],
  referenceCardId: "reference-card:relations-federales-provinciales",
  historicalRecordId: "historical-record:relations-federales-provinciales",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Quel est le motif qui amène Honoré Mercier, premier ministre du Québec, à convoquer la conférence interprovinciale de 1887? Présente également deux revendications défendues par les provinces.",
  instruction: "Dans le document 1, relève le conflit que Mercier veut éviter et le pouvoir fédéral qu’il remet en question. Dans le document 2, nomme deux changements réclamés par les délégués.",
  expectedAnswer: "Mercier convoque principalement la conférence pour que les provinces défendent ensemble leur autonomie face aux interventions du gouvernement fédéral, notamment son pouvoir de désavouer les lois provinciales. Deux revendications clairement appuyées par les documents sont de supprimer ce pouvoir de désaveu et d’augmenter les subventions annuelles versées aux provinces. Accepter toute réponse équivalente qui explique ce motif principal et nomme deux revendications présentes dans les extraits. Ne pas exiger que l’élève explique séparément le lien entre chaque revendication et un problème provincial.",
  historicalDocumentIds: conferenceQuestionDocuments.map(({ id }) => id),
  commonErrors: ["Nommer deux thèmes sans expliquer pourquoi ils conduisent à la conférence.", "Présenter les résolutions comme des lois déjà adoptées par le Parlement fédéral.", "Affirmer que Mercier cherche à séparer le Québec du Canada.", "Confondre suppression du désaveu et abolition du partage constitutionnel des compétences."],
  distractors: [],
  operationId: "causal_connections",
  sourceIds: conferenceQuestionDocuments.map(({ id }) => `document-source:${id}`),
  sourceCatalog: conferenceQuestionDocuments.map((document) => sourceFromDocument(document, 1887)),
  rationale: "La question fait relier les motifs annoncés par Mercier aux revendications constitutionnelle et financière adoptées par la conférence, deux précisions historiques qui n’étaient pas encore évaluées directement.",
  review: { documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null },
} as const satisfies ApprovedQuestion;

export const MACDONALD_MOWAT_FEDERALISM_COMPARISON_QUESTION = {
  schemaVersion: 1,
  id: "question:relations-federales-provinciales:document-interpretation-020",
  scope: "notional",
  knowledgeHeadingId: "relations-federales-provinciales",
  relatedKnowledgeHeadingIds: ["relations-federales-provinciales"],
  referenceCardId: "reference-card:relations-federales-provinciales",
  historicalRecordId: "historical-record:relations-federales-provinciales",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Compare les conceptions du fédéralisme défendues par John A. Macdonald et par les délégués de la conférence interprovinciale présidée par Oliver Mowat.",
  instruction: "Formule une différence centrale entre les deux conceptions. Appuie-la sur un élément du discours de Macdonald et un élément des résolutions collectives adoptées sous la présidence de Mowat.",
  expectedAnswer: "Macdonald défend une fédération centralisée : il veut un gouvernement central fort qui possède les droits de souveraineté, sauf les pouvoirs accordés aux gouvernements locaux. Il ajoute toutefois que chaque province doit conserver son identité. Les délégués de la conférence accordent davantage d’importance à l’autonomie des provinces dans leurs champs de compétence : leurs résolutions déclarent cette autonomie essentielle et demandent de retirer au gouvernement fédéral le pouvoir de désavouer une loi provinciale dans ces domaines. La différence principale porte donc sur l’équilibre du pouvoir : Macdonald privilégie la force du centre, tandis que les délégués veulent protéger la liberté d’action provinciale. Le document 2 est une résolution collective adoptée sous la présidence de Mowat, et non un discours personnel de Mowat.",
  historicalDocumentIds: federalismViewpointDocuments.map(({ id }) => id),
  commonErrors: ["Dire que Macdonald veut supprimer les provinces.", "Dire que Mowat refuse tout gouvernement fédéral.", "Comparer seulement les auteurs sans citer un indice de chaque texte.", "Présenter les résolutions collectives de la conférence comme les paroles personnelles exactes de Mowat."],
  distractors: [],
  operationId: "differences_and_similarities",
  sourceIds: federalismViewpointDocuments.map(({ id }) => `document-source:${id}`),
  sourceCatalog: [
    sourceFromDocument(MACDONALD_CENTRAL_GOVERNMENT_DOCUMENT, 1864),
    sourceFromDocument(INTERPROVINCIAL_CONFERENCE_RESOLUTIONS_DOCUMENT, 1887),
  ],
  rationale: "La comparaison oppose deux interprétations structurantes du fédéralisme canadien tout en conservant une nuance : Macdonald reconnaît des identités provinciales et le document 2 exprime la position collective des délégués réunis sous la présidence de Mowat.",
  review: { documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null },
} as const satisfies ApprovedQuestion;

export const REVENUE_PROVINCIAL_AUTONOMY_QUESTION = {
  schemaVersion: 1,
  id: "question:relations-federales-provinciales:document-interpretation-021",
  scope: "notional",
  knowledgeHeadingId: "relations-federales-provinciales",
  relatedKnowledgeHeadingIds: ["relations-federales-provinciales"],
  referenceCardId: "reference-card:relations-federales-provinciales",
  historicalRecordId: "historical-record:relations-federales-provinciales",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Explique comment la répartition des revenus entre Ottawa et les provinces peut limiter l’autonomie provinciale après 1867.",
  instruction: "Appuie ton explication sur les deux documents : utilise au moins une recette effectivement perçue par le gouvernement fédéral et un passage qui décrit les ressources des provinces.",
  expectedAnswer: "Le gouvernement fédéral perçoit notamment d’importantes recettes de douane et d’accise : le relevé d’avril 1868 indique environ 757 410 $ de droits de douane et 357 791 $ de droits d’accise. Les provinces disposent notamment de la taxation directe, des revenus de leurs terres et forêts, de certaines licences et de subventions fédérales. Cette répartition peut limiter leur autonomie financière : si leurs ressources propres ne suffisent pas à financer leurs responsabilités, elles dépendent davantage des transferts d’Ottawa. Accepter une autre combinaison de données exacte. Ne pas conclure que les provinces ne peuvent percevoir aucun impôt ni que le tableau mensuel représente toutes les recettes annuelles.",
  historicalDocumentIds: GOVERNMENT_REVENUE_DOCUMENTS.map(({ id }) => id),
  commonErrors: ["Comparer seulement les montants sans expliquer leur effet sur l’autonomie.", "Affirmer que les provinces ne possèdent aucune source de revenus.", "Présenter la taxation directe comme interdite au gouvernement fédéral.", "Traiter les trois recettes d’avril 1868 comme le budget annuel complet du Canada."],
  distractors: [],
  operationId: "relationships_between_facts",
  sourceIds: GOVERNMENT_REVENUE_DOCUMENTS.map(({ id }) => `document-source:${id}`),
  sourceCatalog: [
    sourceFromDocument(GOVERNMENT_REVENUE_DOCUMENTS[0], 1868),
    sourceFromDocument(GOVERNMENT_REVENUE_DOCUMENTS[1], 1867),
  ],
  rationale: "La question dépasse le simple classement des revenus : elle exige d’établir le lien entre capacité fiscale, transferts fédéraux et marge de manœuvre provinciale.",
  review: { documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null },
} as const satisfies ApprovedQuestion;

export const SCHOOL_CRISIS_COMPARISON_QUESTION = {
  schemaVersion: 1,
  id: "question:relations-federales-provinciales:document-interpretation-022",
  scope: "notional",
  knowledgeHeadingId: "relations-federales-provinciales",
  relatedKnowledgeHeadingIds: ["relations-federales-provinciales"],
  referenceCardId: "reference-card:relations-federales-provinciales",
  historicalRecordId: "historical-record:relations-federales-provinciales",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Compare la question des écoles catholiques au Nouveau-Brunswick et celle du Manitoba. Relève une ressemblance et une différence.",
  instruction: "Pour la ressemblance, montre que les deux situations concernent la protection d’écoles catholiques liées à la religion. Pour la différence, oppose la perte du financement public décrite au Nouveau-Brunswick aux droits et aux recours prévus pour les minorités scolaires au Manitoba.",
  expectedAnswer: "Ressemblance : dans les deux situations, une minorité catholique cherche à protéger des écoles liées à sa religion contre une décision provinciale. Différence : au Nouveau-Brunswick, la loi de 1871 rend les écoles publiques non confessionnelles et prive les écoles catholiques de financement public. Au Manitoba, la Loi sur le Manitoba protège les droits scolaires déjà accordés aux minorités catholique ou protestante et prévoit un appel au gouvernement fédéral ainsi que, dans certaines conditions, une loi fédérale réparatrice. Accepter une formulation brève qui nomme clairement une ressemblance et une différence appuyées par les documents. Accepter aussi comme différence exacte les dates ou le cadre légal, mais ne pas exiger que l’élève déduise du document manitobain le retrait du financement adopté en 1890.",
  historicalDocumentIds: schoolCrisisDocuments.map(({ id }) => id),
  commonErrors: ["Confondre école non confessionnelle et interdiction totale de toute école catholique privée.", "Présenter les deux crises comme un seul événement survenu en 1890.", "Affirmer que l’éducation devient une compétence fédérale.", "Confondre droits religieux et droits linguistiques."],
  distractors: [],
  operationId: "differences_and_similarities",
  sourceIds: schoolCrisisDocuments.map(({ id }) => `document-source:${id}`),
  sourceCatalog: [
    sourceFromDocument(NEW_BRUNSWICK_SCHOOLS_DOCUMENT, 1873),
    sourceFromDocument(MANITOBA_SCHOOLS_DOCUMENT, 1870),
  ],
  rationale: "La comparaison met en relation deux crises scolaires au lieu de les traiter isolément et fait distinguer une ressemblance de fond d’une différence de cadre constitutionnel.",
  review: { documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null },
} as const satisfies ApprovedQuestion;

export const FEDERAL_PROVINCIAL_RELATIONS_COVERAGE_QUESTIONS = [
  INTERPROVINCIAL_CONFERENCE_CAUSES_CLAIMS_QUESTION,
  MACDONALD_MOWAT_FEDERALISM_COMPARISON_QUESTION,
  REVENUE_PROVINCIAL_AUTONOMY_QUESTION,
  SCHOOL_CRISIS_COMPARISON_QUESTION,
] as const satisfies readonly ApprovedQuestion[];
