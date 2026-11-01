import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";
import { EGLISE_LAFLECHE_NATIONALITE_CATHOLIQUE_DOCUMENT } from "./eglise-identite-canadienne-francaise.ts";
import {
  EGLISE_BOURGET_SOCIETE_CIVILE_DOCUMENT,
  EGLISE_DESSAULLES_LIBERTE_CITOYEN_DOCUMENT,
} from "./eglise-ultramontains-anticlericaux.ts";

export const EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT = {
  schemaVersion: 1,
  id: "EGL-D-005",
  title: "Organisation du Conseil de l’instruction publique en deux comités",
  kind: "political-diagram",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["presence-de-l-eglise-catholique"],
  operationIds: ["establish_facts"],
  historicalDate: "1869",
  creator: "Socrato, d’après l’Acte pour amender les lois concernant l’Éducation en cette Province",
  holdingInstitution: "Bibliothèque de l’Assemblée nationale du Québec",
  sourceUrl: "https://www.bibliotheque.assnat.qc.ca/guides/fr/l-histoire-de-l-education-au-quebec-les-grands-textes-politiques-et-legislatifs/137-le-quebec-apres-la-confederation-1867-1960",
  sourceLocator: "Acte pour amender les lois concernant l’Éducation en cette Province, Statuts du Québec, 1869, 32 Victoria, chapitre 16, article 2",
  assetUrl: "/historical-documents/eglise-dualisme-confessionnel-1869.svg",
  rightsStatement: "Loi de 1869 appartenant au domaine public. Schéma de synthèse original créé par Socrato à partir de l’article 2; il ne s’agit pas d’un schéma publié au XIXe siècle.",
  transcription: "Conseil de l’instruction publique. Comité catholique : questions concernant l’éducation des catholiques et écoles catholiques. Comité protestant : questions concernant l’éducation des protestants et écoles protestantes.",
  accessibleDescription: "Schéma montrant le Conseil de l’instruction publique qui se divise en deux branches parallèles : un comité catholique responsable des écoles catholiques et un comité protestant responsable des écoles protestantes.",
  historicalContext: "La loi scolaire de 1869 divise le Conseil de l’instruction publique en un comité catholique et un comité protestant. Chacun traite les questions qui concernent l’éducation de sa confession, ce qui institutionnalise deux secteurs scolaires parallèles au Québec.",
  observationGuide: [
    "Repérer l’institution placée au sommet du schéma.",
    "Identifier les deux comités qui en dépendent.",
    "Comparer les groupes d’écoles associés à chacun des comités.",
  ],
  interpretationCautions: [
    "Ce schéma est une reconstitution pédagogique contemporaine fondée sur une loi de 1869; sa disposition graphique ne provient pas du document original.",
    "Le schéma présente la structure catholique-protestante dominante sans représenter toute la diversité religieuse de la population québécoise.",
  ],
  pedagogicalUses: [
    "Faire reconnaître le dualisme confessionnel dans l’organisation scolaire.",
    "Associer une structure institutionnelle à un concept historique.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const EGLISE_CONCEPTS_ASSOCIATION_DOCUMENTS = [
  EGLISE_DESSAULLES_LIBERTE_CITOYEN_DOCUMENT,
  EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT,
  EGLISE_BOURGET_SOCIETE_CIVILE_DOCUMENT,
  EGLISE_LAFLECHE_NATIONALITE_CATHOLIQUE_DOCUMENT,
] as const;

const EGLISE_CONCEPTS_ASSOCIATION_SOURCES: ReferenceSource[] =
  EGLISE_CONCEPTS_ASSOCIATION_DOCUMENTS.map((document) => ({
    id: `document-source:${document.id}`,
    kind: document.id === EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT.id ? "government" : "reference-work",
    title: document.title,
    creator: document.creator,
    publisher: document.holdingInstitution,
    publicationYear: document.id === EGLISE_DESSAULLES_LIBERTE_CITOYEN_DOCUMENT.id
      ? 1868
      : document.id === EGLISE_BOURGET_SOCIETE_CIVILE_DOCUMENT.id
        ? 1858
        : document.id === EGLISE_LAFLECHE_NATIONALITE_CATHOLIQUE_DOCUMENT.id
          ? 1866
          : 1869,
    url: document.sourceUrl,
    locator: document.sourceLocator,
    rightsNote: document.rightsStatement,
    verificationStatus: "verified",
  }));

export const EGLISE_CONCEPTS_ASSOCIATION_QUESTION = {
  schemaVersion: 1,
  id: "question:presence-de-l-eglise-catholique:interactive-association-003",
  scope: "notional",
  knowledgeHeadingId: "presence-de-l-eglise-catholique",
  relatedKnowledgeHeadingIds: ["presence-de-l-eglise-catholique"],
  referenceCardId: "reference-card:presence-de-l-eglise-catholique",
  historicalRecordId: "historical-record:presence-de-l-eglise-catholique",
  status: "ready-for-review",
  format: "interactive-association",
  prompt: "Au Québec, entre 1840 et 1896, les débats sur la place de l’Église catholique touchent l’organisation de la société, l’éducation et la préservation de l’identité canadienne-française. Lisez ou observez chaque document, puis associez-le au bon concept.",
  instruction: "Sélectionnez un document, puis placez-le sous le concept correspondant.",
  initialGuidance: "J’attends vos quatre associations…",
  expectedAnswer: "Document 1 — anticléricalisme : Dessaulles critique le contrôle du domaine temporel au nom de la religion et défend la liberté de penser. Document 2 — dualisme confessionnel : le système scolaire est organisé en deux secteurs parallèles, catholique et protestant. Document 3 — ultramontanisme : Bourget soumet les lectures et les bibliothèques à l’autorité religieuse. Document 4 — nationalisme de survivance : Laflèche associe la mission de la nation canadienne-française à la foi catholique.",
  historicalDocumentIds: EGLISE_CONCEPTS_ASSOCIATION_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Confondre l’ultramontanisme, qui étend l’autorité de l’Église dans la société, avec l’anticléricalisme, qui critique cette influence.",
    "Associer le dualisme confessionnel à une opposition d’idées plutôt qu’à l’existence de deux structures scolaires parallèles.",
    "Réduire le nationalisme de survivance à la langue alors que le document l’associe aussi à la foi catholique.",
    "Interpréter le schéma comme un document graphique original de 1869 plutôt que comme une reconstitution fondée sur la loi.",
  ],
  distractors: [],
  operationId: "establish_facts",
  sourceIds: EGLISE_CONCEPTS_ASSOCIATION_SOURCES.map(({ id }) => id),
  sourceCatalog: EGLISE_CONCEPTS_ASSOCIATION_SOURCES,
  rationale: "L’association demande de reconnaître quatre concepts voisins à partir d’indices différents : un point de vue anticlérical, une intervention ultramontaine, une organisation scolaire à deux branches confessionnelles et une définition catholique de la nation canadienne-française.",
  associationInteraction: {
    items: [
      { id: "document-1-anticlericalisme", label: "Document 1", documentId: EGLISE_DESSAULLES_LIBERTE_CITOYEN_DOCUMENT.id },
      { id: "document-2-dualisme", label: "Document 2", documentId: EGLISE_DUALISME_CONFESSIONNEL_DIAGRAM_DOCUMENT.id },
      { id: "document-3-ultramontanisme", label: "Document 3", documentId: EGLISE_BOURGET_SOCIETE_CIVILE_DOCUMENT.id },
      { id: "document-4-nationalisme", label: "Document 4", documentId: EGLISE_LAFLECHE_NATIONALITE_CATHOLIQUE_DOCUMENT.id },
    ],
    targets: [
      { id: "concept-anticlericalisme", label: "Anticléricalisme", description: "Anticléricalisme", correctItemId: "document-1-anticlericalisme" },
      { id: "concept-ultramontanisme", label: "Ultramontanisme", description: "Ultramontanisme", correctItemId: "document-3-ultramontanisme" },
      { id: "concept-dualisme", label: "Dualisme confessionnel", description: "Dualisme confessionnel", correctItemId: "document-2-dualisme" },
      { id: "concept-nationalisme", label: "Nationalisme de survivance", description: "Nationalisme de survivance", correctItemId: "document-4-nationalisme" },
    ],
  },
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
