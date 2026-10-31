import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const EGLISE_LAFLECHE_NATIONALITE_CATHOLIQUE_DOCUMENT = {
  schemaVersion: 1,
  id: "EGL-T-003",
  title: "Réflexion de Louis-François Laflèche sur la nation",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["presence-de-l-eglise-catholique"],
  operationIds: ["causal_connections"],
  historicalDate: "1866",
  creator: "Louis-François Laflèche",
  holdingInstitution: "Canadiana · Bibliothèque et Archives Canada",
  sourceUrl: "https://www.canadiana.ca/view/oocihm.39043/1",
  sourceLocator: "Louis-François Laflèche, Quelques considérations sur les rapports de la société civile avec la religion et la famille, Montréal, Eusèbe Sénécal, 1866, p. 44-47",
  assetUrl: "https://www.collectionscanada.gc.ca/obj/023012/f2/amicus-5771677-002.pdf",
  rightsStatement: "Ouvrage publié en 1866 et appartenant au domaine public; exemplaires numérisés par Canadiana et Bibliothèque et Archives Canada. Extrait recomposé en quatre phrases, avec orthographe et ponctuation modernisées par Socrato.",
  transcription: "[Les Canadiens français] ont, comme [peuple], une mission à remplir et, comme peuple, un but à atteindre. Chaque individu dans la famille, chaque famille dans [la collectivité] et chaque [peuple] dans l’humanité ont leur poste assigné. La mission providentielle du peuple canadien est essentiellement religieuse. C’est [notamment] l’extension du royaume de Dieu par la formation d’un [peuple] avant tout catholique.",
  accessibleDescription: "Extrait de quatre phrases dans lequel Louis-François Laflèche associe la mission de la nation canadienne-française à la religion catholique.",
  historicalContext: "Prêtre, théologien puis évêque de Trois-Rivières, Louis-François Laflèche publie ce texte en 1866. Il présente la foi catholique comme un fondement de la mission collective des Canadiens français, une conception associée au nationalisme de survivance.",
  observationGuide: [
    "Repérer le groupe auquel l’auteur attribue une mission.",
    "Identifier la nature de cette mission.",
    "Relever le type de nationalité que l’auteur souhaite former.",
  ],
  interpretationCautions: [
    "Le passage exprime la conception de Laflèche; il ne représente pas nécessairement le point de vue de tous les Canadiens français.",
    "Les crochets explicitent le groupe visé dans l’ouvrage et signalent une coupure sans changer le sens du propos.",
  ],
  pedagogicalUses: [
    "Expliquer comment le clergé diffuse une conception catholique de l’identité canadienne-française.",
    "Établir un lien entre le nationalisme de survivance et la préservation de l’identité collective.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT = {
  schemaVersion: 1,
  id: "EGL-T-004",
  title: "Règlements scolaires du comité catholique — vers 1888",
  kind: "law-or-official-text",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["presence-de-l-eglise-catholique"],
  operationIds: ["causal_connections", "changes_and_continuities"],
  historicalDate: "vers 1888",
  creator: "Comité catholique du Conseil de l’instruction publique du Québec",
  holdingInstitution: "Canadiana · Université Laval",
  sourceUrl: "https://www.canadiana.ca/view/oocihm.59161",
  sourceLocator: "Conseil de l’instruction publique du Québec, comité catholique, Règlements scolaires révisés, Québec, vers 1888, règlement 21",
  assetUrl: "https://www.canadiana.ca/view/oocihm.59161",
  rightsStatement: "Règlements publiés au XIXe siècle et appartenant au domaine public; exemplaire numérisé par Canadiana. Extrait recomposé en quatre phrases, avec orthographe et syntaxe modernisées par Socrato.",
  transcription: "L’enseignement de la religion doit tenir le premier rang parmi les matières du programme et se donner ponctuellement dans toutes les écoles. Les élèves qui se préparent à faire leur première communion doivent recevoir une attention spéciale pour l’enseignement du catéchisme. Il est du devoir des maîtres de suivre les avis du curé sur la conduite morale et religieuse des élèves. [Ces règles sont adoptées par le comité catholique du Conseil de l’instruction publique.]",
  accessibleDescription: "Extrait de quatre phrases présentant la place de la religion, du catéchisme et de l’autorité du curé dans les écoles catholiques.",
  historicalContext: "À la fin des années 1880, le comité catholique du Conseil de l’instruction publique réglemente les écoles de son secteur. Ces règles montrent comment l’enseignement confessionnel transmet la foi et les normes morales catholiques aux jeunes générations.",
  observationGuide: [
    "Repérer la place accordée à la religion dans le programme scolaire.",
    "Identifier l’enseignement religieux destiné aux élèves.",
    "Relever le rôle du curé auprès des maîtres et des élèves.",
  ],
  interpretationCautions: [
    "Le document présente des règles officielles; leur application concrète peut varier d’une école à l’autre.",
    "La phrase entre crochets identifie l’autorité qui adopte les règlements et ne provient pas mot pour mot du passage retenu.",
  ],
  pedagogicalUses: [
    "Montrer comment l’Église intervient dans l’éducation confessionnelle.",
    "Expliquer comment l’école transmet la foi et une morale catholique aux jeunes Canadiens français.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const EGLISE_IDENTITE_CANADIENNE_FRANCAISE_DOCUMENTS = [
  EGLISE_LAFLECHE_NATIONALITE_CATHOLIQUE_DOCUMENT,
  EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT,
] as const;

const EGLISE_IDENTITE_CANADIENNE_FRANCAISE_SOURCES: ReferenceSource[] =
  EGLISE_IDENTITE_CANADIENNE_FRANCAISE_DOCUMENTS.map((document) => ({
    id: `document-source:${document.id}`,
    kind: document.id === EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT.id ? "government" : "reference-work",
    title: document.title,
    creator: document.creator,
    publisher: document.holdingInstitution,
    publicationYear: document.id === EGLISE_REGLEMENTS_ENSEIGNEMENT_RELIGIEUX_DOCUMENT.id ? 1888 : 1866,
    url: document.sourceUrl,
    locator: document.sourceLocator,
    rightsNote: document.rightsStatement,
    verificationStatus: "verified",
  }));

export const EGLISE_IDENTITE_CANADIENNE_FRANCAISE_QUESTION = {
  schemaVersion: 1,
  id: "question:presence-de-l-eglise-catholique:short-answer-002",
  scope: "notional",
  knowledgeHeadingId: "presence-de-l-eglise-catholique",
  relatedKnowledgeHeadingIds: ["presence-de-l-eglise-catholique"],
  referenceCardId: "reference-card:presence-de-l-eglise-catholique",
  historicalRecordId: "historical-record:presence-de-l-eglise-catholique",
  status: "ready-for-review",
  format: "short-answer",
  prompt: "Expliquez comment l’action de l’Église catholique contribue à la préservation de l’identité canadienne-française entre 1840 et 1896. Indiquez deux éléments.",
  instruction: "Pour chacun des deux éléments, reliez une action de l’Église à son effet sur l’identité canadienne-française.",
  initialGuidance: "J’attends vos deux éléments…",
  expectedAnswer: "Premier élément : des membres du clergé, comme Laflèche, diffusent le nationalisme de survivance en présentant la foi catholique comme un fondement de la mission et de la nationalité canadiennes-françaises. Cette conception renforce l’association entre l’appartenance à la nation et la religion catholique. Deuxième élément : par son influence sur les écoles, l’Église accorde la première place à l’enseignement religieux, au catéchisme et à l’encadrement moral du curé. L’éducation confessionnelle transmet ainsi la foi et les valeurs catholiques aux jeunes générations, ce qui contribue à maintenir un élément central de l’identité canadienne-française.",
  historicalDocumentIds: EGLISE_IDENTITE_CANADIENNE_FRANCAISE_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Nommer deux actions sans expliquer comment elles contribuent à préserver l’identité canadienne-française.",
    "Donner deux exemples tirés du même document sans exploiter l’autre source.",
    "Réduire l’identité canadienne-française à la langue alors que les documents portent surtout sur la foi et sa transmission.",
    "Présenter tous les Canadiens français comme partageant exactement la même conception de la nation.",
  ],
  distractors: [],
  operationId: "causal_connections",
  sourceIds: EGLISE_IDENTITE_CANADIENNE_FRANCAISE_SOURCES.map(({ id }) => id),
  sourceCatalog: EGLISE_IDENTITE_CANADIENNE_FRANCAISE_SOURCES,
  rationale: "Les deux sources permettent de distinguer une action idéologique — associer la nation à la foi catholique — et une action institutionnelle — transmettre cette foi par l’école. L’élève doit relier chacune de ces actions à la préservation de l’identité collective.",
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
