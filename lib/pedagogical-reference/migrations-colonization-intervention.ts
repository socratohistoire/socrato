import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const MIGRATIONS_QUEBEC_SETTLEMENT_INTERVENTION_DOCUMENT = {
  schemaVersion: 1,
  id: "MIG-T-001",
  title: "Un chemin pour la colonisation du Lac-Saint-Jean",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["migrations"],
  operationIds: ["establish_facts"],
  historicalDate: "1880",
  creator: "Arthur Buies",
  holdingInstitution: "Wikisource · transcription de l’édition originale publiée à Québec par A. Côté et Cie",
  sourceUrl: "https://fr.wikisource.org/wiki/Le_Saguenay_et_la_vall%C3%A9e_du_lac_St._Jean/Chapitre_6",
  sourceLocator: "Le Saguenay et la vallée du lac St. Jean, chapitre VI, « La colonisation », Québec, A. Côté et Cie, 1880, p. 127-164",
  assetUrl: "https://fr.wikisource.org/wiki/Le_Saguenay_et_la_vall%C3%A9e_du_lac_St._Jean/Chapitre_6",
  rightsStatement: "Ouvrage de 1880 appartenant au domaine public; extrait recomposé à partir de trois passages du chapitre, avec coupures signalées par des crochets et ponctuation légèrement modernisée par Socrato.",
  transcription: "Le chemin Kenogami est un des plus beaux de la Province. Le gouvernement a dépensé quarante mille dollars [...] pour le mettre dans l’état où il est maintenant. [...] Ce chemin a été fait graduellement, au fur et à mesure de la marche de la colonisation. [...] L’émigration ne s’est pas faite de Saint-Alphonse aux États-Unis, mais au Lac Saint-Jean.",
  accessibleDescription: "Extrait de quatre phrases d’une étude d’Arthur Buies publiée en 1880. Il indique que le gouvernement finance le chemin Kenogami à mesure que progresse la colonisation et que des familles se déplacent vers le Lac-Saint-Jean plutôt que vers les États-Unis.",
  historicalContext: "Arthur Buies relie l’aménagement du chemin Kenogami par le gouvernement à l’avancée de la colonisation vers le Lac-Saint-Jean. Il présente ensuite ce déplacement intérieur comme une solution de remplacement à l’émigration vers les États-Unis. Cette colonisation se déroule sur le Nitassinan, territoire ancestral des Innus, et ne correspond donc pas à l’occupation d’un espace inhabité.",
  observationGuide: [
    "Identifier l’aménagement financé par le gouvernement.",
    "Repérer le lien entre cet aménagement et la marche de la colonisation.",
    "Expliquer comment la colonisation du Lac-Saint-Jean offre une solution de remplacement à l’émigration vers les États-Unis.",
  ],
  interpretationCautions: [
    "Les quatre phrases ont été rapprochées à partir de trois passages du chapitre; les coupures sont signalées par des crochets.",
    "L’auteur présente favorablement la colonisation; son point de vue doit être replacé dans le contexte de l’expansion coloniale sur le territoire ancestral des Innus.",
  ],
  pedagogicalUses: [
    "Décrire le financement d’un chemin de colonisation vers le Lac-Saint-Jean comme une intervention visant à freiner l’émigration vers les États-Unis.",
    "Distinguer une intervention d’un problème qui provoque un déplacement de population.",
  ],
  version: "0.5.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const MIGRATIONS_RURAL_LAND_SHORTAGE_DISTRACTOR_DOCUMENT = {
  schemaVersion: 1,
  id: "MIG-T-002",
  title: "S’établir sur une terre au Bas-Canada",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["migrations"],
  operationIds: ["causes_and_consequences", "establish_facts"],
  historicalDate: "1859",
  creator: "François-Edme Rameau de Saint-Père",
  holdingInstitution: "Wikisource · transcription de l’édition originale publiée à Paris par Jouby",
  sourceUrl: "https://fr.wikisource.org/wiki/La_France_aux_colonies_Partie_II/10",
  sourceLocator: "La France aux colonies, partie II, chapitre X, Paris, Jouby, 1859, p. 325-331; paragraphes sur l’émigration canadienne-française",
  assetUrl: "https://fr.wikisource.org/wiki/La_France_aux_colonies_Partie_II/10",
  rightsStatement: "Ouvrage de 1859 appartenant au domaine public; orthographe et ponctuation légèrement modernisées par Socrato.",
  transcription: "Les Canadiens éprouvent de la difficulté à établir leurs nombreux enfants sur de nouvelles fermes dans leur propre pays. Bien peu de cantons possèdent encore des terres accessibles à défricher, et la jeunesse n’a souvent d’autre ressource que d’émigrer vers les États-Unis ou vers d’autres régions du Canada.",
  accessibleDescription: "Extrait d’un ouvrage de 1859 qui relie le départ de jeunes Canadiens français au manque de terres agricoles accessibles dans les campagnes du Bas-Canada.",
  historicalContext: "Rameau de Saint-Père décrit les difficultés d’établissement des familles canadiennes-françaises dans les anciennes campagnes seigneuriales et les obstacles qui limitent l’accès aux terres non occupées.",
  observationGuide: [
    "Identifier le problème rencontré par les familles rurales.",
    "Repérer la conséquence de ce problème sur la population.",
    "Vérifier si l’extrait présente une action organisée pour modifier ce déplacement.",
  ],
  interpretationCautions: [
    "L’auteur est un observateur français qui publie une synthèse en 1859; son texte constitue un témoignage historiographique contemporain plutôt qu’un récit personnel d’émigrant.",
    "Le problème n’est pas l’absence absolue de terres au Québec, mais la rareté de terres agricoles accessibles et abordables dans ou près des anciennes zones de peuplement.",
  ],
  pedagogicalUses: [
    "Expliquer le rôle de la pression foncière dans l’émigration canadienne-française.",
    "Discriminer une cause de départ d’une intervention destinée à agir sur les déplacements de population.",
  ],
  version: "0.2.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const MIGRATIONS_COLONIZATION_INTERVENTION_DOCUMENTS = [
  MIGRATIONS_QUEBEC_SETTLEMENT_INTERVENTION_DOCUMENT,
  MIGRATIONS_RURAL_LAND_SHORTAGE_DISTRACTOR_DOCUMENT,
] as const;

const MIGRATIONS_COLONIZATION_INTERVENTION_SOURCES: ReferenceSource[] =
  MIGRATIONS_COLONIZATION_INTERVENTION_DOCUMENTS.map((document) => ({
    id: `document-source:${document.id}`,
    kind: "reference-work" as const,
    title: document.title,
    creator: document.creator,
    publisher: document.holdingInstitution,
    publicationYear: document.id === MIGRATIONS_QUEBEC_SETTLEMENT_INTERVENTION_DOCUMENT.id ? 1880 : 1859,
    url: document.sourceUrl,
    locator: document.sourceLocator,
    rightsNote: document.rightsStatement,
    verificationStatus: "verified" as const,
  }));

export const MIGRATIONS_COLONIZATION_INTERVENTION_QUESTION = {
  schemaVersion: 1,
  id: "question:migrations:document-interpretation-001",
  scope: "notional",
  knowledgeHeadingId: "migrations",
  relatedKnowledgeHeadingIds: ["migrations"],
  referenceCardId: "reference-card:migrations",
  historicalRecordId: "historical-record:migrations",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Décrivez une intervention mise en œuvre au Québec à la fin du XIXe siècle pour prévenir l’émigration des Canadiens français.",
  instruction: "Un seul des deux extraits présente une intervention. Sélectionnez le document utile, puis décrivez l’intervention. Écartez l’autre document en précisant pourquoi il ne présente pas une intervention.",
  initialGuidance: "J’attends votre réponse…",
  expectedAnswer: "Le document 1 permet de répondre. Le gouvernement finance l’aménagement du chemin Kenogami afin de soutenir la colonisation vers le Lac-Saint-Jean. Cette intervention facilite l’établissement de familles dans cette région et favorise un déplacement à l’intérieur du Québec plutôt qu’une émigration vers les États-Unis. Le document 2 doit être écarté : il présente un problème, soit le manque de terres agricoles accessibles dans les campagnes, qui pousse des jeunes à partir; il ne décrit pas une intervention mise en œuvre pour prévenir l’émigration.",
  historicalDocumentIds: MIGRATIONS_COLONIZATION_INTERVENTION_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Choisir le document 2 parce qu’il évoque des terres et des déplacements de population.",
    "Décrire seulement l’émigration vers les États-Unis sans nommer l’intervention mise en œuvre au Québec.",
    "Nommer le Lac-Saint-Jean sans décrire l’aménagement du chemin de colonisation financé par le gouvernement.",
    "Écarter le document 2 sans préciser qu’il expose une cause du départ plutôt qu’une intervention.",
  ],
  distractors: [MIGRATIONS_RURAL_LAND_SHORTAGE_DISTRACTOR_DOCUMENT.id],
  operationId: "establish_facts",
  sourceIds: MIGRATIONS_COLONIZATION_INTERVENTION_SOURCES.map(({ id }) => id),
  sourceCatalog: MIGRATIONS_COLONIZATION_INTERVENTION_SOURCES,
  rationale: "Les deux extraits portent sur les terres et les déplacements de Canadiens français. L’élève doit distinguer le problème qui contribue au départ — la difficulté d’accéder à une terre agricole — de l’intervention qui vise à prévenir l’émigration — financer un chemin qui soutient la colonisation vers le Lac-Saint-Jean et facilite l’établissement de familles au Québec.",
  review: {
    documented: true,
    historicallyVerified: true,
    pedagogicallyVerified: false,
    biasAndLanguageReviewed: true,
    approvedBy: null,
    approvedVersion: null,
    approvedAt: null,
  },
} as const satisfies ApprovedQuestion;
