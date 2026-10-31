import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const EGLISE_BOURGET_SOCIETE_CIVILE_DOCUMENT = {
  schemaVersion: 1,
  id: "EGL-T-001",
  title: "Directives de Mgr Ignace Bourget sur les lectures",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["presence-de-l-eglise-catholique"],
  operationIds: ["differences_and_similarities"],
  historicalDate: "1858",
  creator: "Mgr Ignace Bourget",
  holdingInstitution: "RÉCIT · Wikimedia Commons",
  sourceUrl: "https://documents.recitus.qc.ca/2e-cycle/document/document-3-duo-2",
  sourceLocator: "Ignace Bourget, Lettres pastorales de Mgr l’évêque de Montréal contre les erreurs du temps, Montréal, Plinguet & Laplante, vers 1858, p. 9",
  assetUrl: "https://commons.wikimedia.org/wiki/File:Lettre_pastorale_de_Mgr._l%27%C3%A9v%C3%AAque_de_Montr%C3%A9al_%28microforme%29_-_sur_l%27Institut_canadien_et_contre_les_mauvais_livres_%28IA_cihm_29733%29.pdf",
  rightsStatement: "Texte publié en 1858 et appartenant au domaine public; transcription et provenance diffusées par le RÉCIT, avec fac-similé conservé sur Wikimedia Commons. Extrait recomposé en quatre phrases, avec orthographe, ponctuation et syntaxe simplifiées par Socrato.",
  transcription: "Ne lisez aucun livre dont la doctrine et la morale ne soient pas approuvées par l’Église. Au besoin, consultez vos pasteurs, car le choix des bons livres est une chose sérieuse et difficile. […] Si vous faites partie d’un institut littéraire, vous êtes strictement obligés de ne pas permettre qu’il s’y introduise des livres contraires à la foi et aux mœurs. Si de mauvais ouvrages se trouvent déjà dans sa bibliothèque, vous devez faire tous vos efforts pour les faire disparaître, même en utilisant votre influence pour qu’ils soient jetés au feu.",
  accessibleDescription: "Extrait de quatre phrases dans lequel Mgr Ignace Bourget donne aux catholiques des directives sur leurs lectures et sur les livres conservés dans les bibliothèques des instituts littéraires.",
  historicalContext: "En 1858, l’évêque de Montréal Ignace Bourget publie des lettres pastorales contre les « mauvais livres » et l’Institut canadien de Montréal. Il demande aux fidèles de soumettre leurs lectures à l’approbation de l’Église et d’intervenir dans les bibliothèques des associations littéraires, ce qui illustre l’action ultramontaine dans la vie intellectuelle et culturelle.",
  observationGuide: [
    "Repérer qui doit approuver les lectures des catholiques.",
    "Relever le rôle attribué aux pasteurs dans le choix des livres.",
    "Identifier les actions exigées des membres d’un institut littéraire.",
    "Nommer la sphère de la société sur laquelle ces directives permettent à l’Église d’exercer un contrôle.",
  ],
  interpretationCautions: [
    "Ce texte exprime la position de Mgr Bourget et ne représente pas nécessairement celle de tous les catholiques ni de tous les membres du clergé.",
    "L’expression « mauvais ouvrages » traduit le jugement de l’auteur sur les livres qu’il estime contraires à la foi et aux mœurs.",
    "Le symbole […] signale qu’une directive a été retranchée entre les passages retenus. L’extrait a aussi été simplifié pour en faciliter la lecture.",
  ],
  pedagogicalUses: [
    "Illustrer un contrôle religieux concret de la lecture, des livres et des bibliothèques.",
    "Comparer ces directives à la défense anticléricale de la liberté de penser et au refus de la censure.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const EGLISE_DESSAULLES_LIBERTE_CITOYEN_DOCUMENT = {
  schemaVersion: 1,
  id: "EGL-T-002",
  title: "Deux discours de Louis-Antoine Dessaulles",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["presence-de-l-eglise-catholique"],
  operationIds: ["differences_and_similarities"],
  historicalDate: "1862 et 1868",
  creator: "Louis-Antoine Dessaulles",
  holdingInstitution: "Institut canadien de Montréal · Wikisource",
  sourceUrl: "https://fr.wikisource.org/wiki/Annuaire_de_l%E2%80%99Institut-canadien_pour_1868/Discours_sur_la_tol%C3%A9rance_de_L._A._Desssaules",
  sourceLocator: "Louis-Antoine Dessaulles, « Discours sur la tolérance », Annuaire de l’Institut-canadien pour 1868, Montréal, 1868, p. 4-21, note 1; et Discours sur l’Institut canadien, prononcé le 23 décembre 1862, Montréal, Le Pays, 1863, section VI, fac-similé p. 8",
  assetUrl: "https://fr.wikisource.org/wiki/Discours_sur_l%E2%80%99Institut_canadien",
  rightsStatement: "Discours publiés en 1863 et en 1868 et appartenant au domaine public; fac-similés et transcriptions diffusés par Wikisource. Deux passages ont été rapprochés en quatre phrases, avec orthographe, ponctuation et syntaxe simplifiées par Socrato.",
  transcription: "[Par réaction], je n’entends pas le clergé comme corps religieux, mais un parti composé de prêtres et de laïcs qui veut tout contrôler dans le domaine temporel au nom de la religion. Ce parti se sert de la religion pour atteindre des objectifs temporels. […] Le programme du libéralisme moderne [de l’Institut canadien] se résume dans ces mots : tolérance et liberté de penser. Personne n’avait encore cherché à limiter l’étude, à bâillonner la pensée ou à introduire la censure des livres dans une association d’hommes indépendants et libres.",
  accessibleDescription: "Quatre phrases dans lesquelles Louis-Antoine Dessaulles distingue le clergé comme corps religieux d’un parti qui cherche à contrôler le domaine temporel, puis défend la tolérance, la liberté de penser et l’accès aux livres.",
  historicalContext: "Dans deux discours prononcés devant l’Institut canadien de Montréal en 1862 et en 1868, Dessaulles critique la domination du domaine temporel au nom de la religion et défend la liberté intellectuelle contre la censure. Il est alors l’un des principaux porte-parole du libéralisme anticlérical au Québec.",
  observationGuide: [
    "Repérer le groupe que l’auteur ne vise pas dans son ensemble.",
    "Identifier les personnes qui composent le parti critiqué et le domaine qu’il chercherait à contrôler.",
    "Relever les libertés défendues par l’Institut canadien.",
    "Repérer les limites que Dessaulles refuse d’imposer à l’étude et aux livres.",
  ],
  interpretationCautions: [
    "L’anticléricalisme exprimé ici vise la domination du domaine temporel et la censure au nom de la religion; Dessaulles précise qu’il ne critique pas tout le clergé comme corps religieux.",
    "Les crochets précisent le sens du mot « réaction » et le groupe auquel se rapporte le programme libéral. Le symbole […] marque le passage d’un extrait du discours de 1868 à un extrait du discours de 1862.",
  ],
  pedagogicalUses: [
    "Caractériser une conception anticléricale de l’organisation de la société.",
    "Comparer la défense du domaine temporel et de la liberté intellectuelle à la primauté sociale défendue par les ultramontains.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const EGLISE_ULTRAMONTAINS_ANTICLERICAUX_DOCUMENTS = [
  EGLISE_BOURGET_SOCIETE_CIVILE_DOCUMENT,
  EGLISE_DESSAULLES_LIBERTE_CITOYEN_DOCUMENT,
] as const;

const EGLISE_ULTRAMONTAINS_ANTICLERICAUX_SOURCES: ReferenceSource[] =
  EGLISE_ULTRAMONTAINS_ANTICLERICAUX_DOCUMENTS.map((document) => ({
    id: `document-source:${document.id}`,
    kind: "reference-work",
    title: document.title,
    creator: document.creator,
    publisher: document.holdingInstitution,
    publicationYear: document.id === EGLISE_BOURGET_SOCIETE_CIVILE_DOCUMENT.id ? 1858 : 1868,
    url: document.sourceUrl,
    locator: document.sourceLocator,
    rightsNote: document.rightsStatement,
    verificationStatus: "verified",
  }));

export const EGLISE_ULTRAMONTAINS_ANTICLERICAUX_QUESTION = {
  schemaVersion: 1,
  id: "question:presence-de-l-eglise-catholique:short-answer-001",
  scope: "notional",
  knowledgeHeadingId: "presence-de-l-eglise-catholique",
  relatedKnowledgeHeadingIds: ["presence-de-l-eglise-catholique"],
  referenceCardId: "reference-card:presence-de-l-eglise-catholique",
  historicalRecordId: "historical-record:presence-de-l-eglise-catholique",
  status: "ready-for-review",
  format: "short-answer",
  prompt: "Expliquez une divergence entre les ultramontains et les anticléricaux concernant l’organisation de la société québécoise au XIXe siècle.",
  instruction: "Appuyez votre explication sur un élément de chacun des deux extraits.",
  initialGuidance: "J’attends votre explication…",
  expectedAnswer: "Les ultramontains, représentés ici par Mgr Bourget, veulent que l’Église encadre la lecture et les bibliothèques : les catholiques doivent consulter leurs pasteurs, empêcher l’entrée de livres contraires à la foi dans les instituts littéraires et faire retirer les ouvrages qui s’y trouvent déjà. À l’inverse, Dessaulles critique un parti qui cherche à contrôler le domaine temporel au nom de la religion et défend la tolérance, la liberté de penser, l’étude et l’accès aux livres contre la censure. La divergence porte donc sur le contrôle de la vie intellectuelle : Bourget accorde à l’autorité religieuse un pouvoir de surveillance sur les lectures, tandis que Dessaulles réclame la liberté intellectuelle et refuse la censure religieuse.",
  historicalDocumentIds: EGLISE_ULTRAMONTAINS_ANTICLERICAUX_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Résumer les extraits sans formuler clairement une opposition entre les deux points de vue.",
    "Affirmer que Mgr Bourget interdit toute lecture, alors qu’il vise les ouvrages non approuvés ou jugés contraires à la foi et aux mœurs.",
    "Présenter l’anticléricalisme comme un rejet obligatoire de toute religion.",
    "Affirmer que tous les catholiques du XIXe siècle sont ultramontains.",
    "S’appuyer sur un seul extrait au lieu de confronter les deux positions.",
  ],
  distractors: [],
  operationId: "differences_and_similarities",
  sourceIds: EGLISE_ULTRAMONTAINS_ANTICLERICAUX_SOURCES.map(({ id }) => id),
  sourceCatalog: EGLISE_ULTRAMONTAINS_ANTICLERICAUX_SOURCES,
  rationale: "Deux sources primaires contemporaines présentent des positions explicitement opposées sur la surveillance religieuse des lectures, les bibliothèques, la liberté de penser et la censure. Leur mise en parallèle permet d’évaluer une divergence concrète dans l’organisation de la vie intellectuelle sans en fournir directement les éléments dans la question.",
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
