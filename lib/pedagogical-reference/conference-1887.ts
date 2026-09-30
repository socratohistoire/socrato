import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion } from "./types.ts";

const proceedings = "https://primarydocuments.ca/wp-content/uploads/2019/07/1887ProceedingsQC.pdf";
const shared = {
  schemaVersion: 1, status: "ready-for-review", periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["relations-federales-provinciales"], operationIds: ["establish_facts"],
  rightsStatement: "Texte original de 1887, domaine public au Canada. Traduction française préparée pour Socrato à partir du texte anglais; […] indique une omission. Les commentaires et la présentation moderne du site hébergeur ne sont pas reproduits.",
  historicalContext: "Des représentants de cinq provinces se réunissent à Québec du 20 au 28 octobre 1887 pour discuter des relations avec le gouvernement fédéral. Leurs propositions sont des revendications, et non des modifications constitutionnelles déjà entrées en vigueur.",
  pedagogicalUses: ["Relever les revendications provinciales à la conférence de 1887."],
  version: "1.0", approvedAt: null,
} as const;

export const CONFERENCE_1887_DOCUMENTS = [
  {
    ...shared, id: "RFP-T-011", title: "Discours de clôture d’Honoré Mercier", kind: "other",
    historicalDate: "28 octobre 1887", creator: "Honoré Mercier, premier ministre du Québec",
    holdingInstitution: "Compte rendu de la conférence interprovinciale · exemplaire numérisé diffusé par PrimaryDocuments.ca",
    sourceUrl: proceedings, assetUrl: `${proceedings}#page=44`,
    sourceLocator: "Proceedings of the Inter-Provincial Conference held at the City of Quebec, 1887, p. 42 (page 44 du PDF), discours de clôture d’Honoré Mercier.",
    transcription: "Après mûre délibération et une discussion amicale de toutes les imperfections qui ont entravé le libre fonctionnement de notre Constitution, nous sommes parvenus à une conclusion unanime quant aux défauts existants et aux remèdes à leur apporter. […] L’autonomie des provinces a été affirmée de la manière la plus nette comme le véritable fondement de notre forme de gouvernement et la seule garantie de son maintien.",
    accessibleDescription: "Extrait traduit du discours de clôture de Mercier évoquant les défauts du fonctionnement constitutionnel et l’autonomie des provinces.",
    observationGuide: ["Relever le principe politique défendu par Mercier."],
    interpretationCautions: ["Traduction de l’anglais; les omissions sont indiquées par […].", "Mercier défend le point de vue des participants : son bilan ne prouve pas que le fédéral accepte les demandes.", "Ce discours et la résolution du document RFP-T-013 sont conservés dans le même recueil; ils ne sont pas deux témoignages indépendants."],
  },
  {
    ...shared, id: "RFP-T-012", title: "Article du Globe sur la conférence", kind: "newspaper",
    operationIds: ["establish_facts", "causes_and_consequences"],
    historicalDate: "25 octobre 1887", creator: "The Globe, correspondant à Québec (non signé)",
    holdingInstitution: "The Globe · transcription diffusée par PrimaryDocuments.ca",
    sourceUrl: "https://primarydocuments.ca/inter-provincial-conference-the-globe-25-october-1887/",
    assetUrl: "https://primarydocuments.ca/inter-provincial-conference-the-globe-25-october-1887/",
    sourceLocator: "« Inter-Provincial Conference », The Globe, 25 octobre 1887, section « Disallowance and Veto Power », dépêche datée du 24 octobre.",
    transcription: "Les grandes lignes de ce projet, autant qu’on puisse les connaître, sont les suivantes : que le pouvoir arbitraire de veto du gouvernement du Dominion soit entièrement aboli, de sorte qu’aucune loi qu’une législature a le pouvoir constitutionnel d’adopter ne puisse être désavouée. Que la question de la constitutionnalité soit tranchée non par le gouvernement du Dominion, mais par une autorité indépendante, probablement la Cour suprême […].",
    accessibleDescription: "Extrait traduit d’un article contemporain concernant le désaveu fédéral et le contrôle de constitutionnalité des lois.",
    observationGuide: ["Identifier le pouvoir fédéral contesté et l’autorité proposée pour examiner les lois."],
    interpretationCautions: ["Traduction de l’anglais; les omissions sont indiquées par […].", "L’article est publié avant la fin de la conférence : il rapporte un projet, pas une réforme adoptée.", "Le qualificatif « arbitraire » appartient au texte du journal."],
  },
  {
    ...shared, id: "RFP-T-013", title: "Résolution de la conférence interprovinciale", kind: "law-or-official-text",
    historicalDate: "28 octobre 1887", creator: "Délégués de la conférence interprovinciale de Québec",
    holdingInstitution: "Compte rendu de la conférence interprovinciale · exemplaire numérisé diffusé par PrimaryDocuments.ca",
    sourceUrl: proceedings, assetUrl: `${proceedings}#page=36`,
    sourceLocator: "Proceedings of the Inter-Provincial Conference held at the City of Quebec, 1887, résolution 17, paragraphes 3 et 4, p. 34 (page 36 du PDF).",
    transcription: "Les paiements annuels effectués jusqu’ici par le Dominion aux différentes provinces […] se sont révélés tout à fait insuffisants pour les fins prévues. […] Plusieurs provinces ne sont pas en mesure de pourvoir, par la taxation directe ou autrement, aux dépenses supplémentaires nécessaires et ont, en conséquence, demandé à diverses reprises au Parlement et au gouvernement fédéraux une augmentation des allocations annuelles.",
    accessibleDescription: "Extrait traduit de la résolution 17 sur les dépenses provinciales et les allocations fédérales.",
    observationGuide: ["Relever la demande financière et le motif invoqué par les délégués."],
    interpretationCautions: ["Traduction de l’anglais; les omissions sont indiquées par […].", "La résolution expose les arguments des délégués; elle ne démontre pas que les subventions ont été augmentées en 1887."],
  },
] as const satisfies readonly HistoricalDocumentRecord[];

export const CONFERENCE_1887_QUESTION = {
  schemaVersion: 1, id: "question:relations-federales-provinciales:document-interpretation-010",
  scope: "notional", knowledgeHeadingId: "relations-federales-provinciales", relatedKnowledgeHeadingIds: ["relations-federales-provinciales"],
  referenceCardId: "reference-card:relations-federales-provinciales", historicalRecordId: "historical-record:relations-federales-provinciales",
  status: "ready-for-review", format: "document-interpretation",
  prompt: "Quelles revendications les premiers ministres provinciaux défendent-ils lors de la conférence interprovinciale de 1887?",
  instruction: "Lis les trois documents et relève les revendications politiques et financières défendues par les dirigeants provinciaux.",
  expectedAnswer: "Les dirigeants réclament une plus grande autonomie provinciale, notamment le retrait du pouvoir fédéral de désavouer les lois adoptées dans les compétences provinciales, et une augmentation des subventions fédérales pour financer les responsabilités des provinces. Accepter toute formulation équivalente : respect des compétences provinciales, limitation des interventions du fédéral, suppression du veto fédéral; hausse des allocations ou des transferts fédéraux. La demande de confier à une autorité judiciaire indépendante l’examen de la constitutionnalité peut préciser la revendication politique. Attendre les deux dimensions, politique et financière; ne pas exiger de mots précis. Ne pas confondre demandes et réformes effectivement appliquées.",
  historicalDocumentIds: CONFERENCE_1887_DOCUMENTS.map(({ id }) => id),
  commonErrors: ["Présenter les revendications comme des réformes déjà appliquées en 1887.", "Ne relever que la dimension politique ou que la dimension financière.", "Confondre autonomie provinciale et indépendance des provinces.", "Affirmer que les provinces veulent supprimer tout contrôle judiciaire de leurs lois."],
  distractors: [], operationId: "establish_facts",
  sourceIds: CONFERENCE_1887_DOCUMENTS.map(({ id }) => `document-source:${id}`),
  sourceCatalog: CONFERENCE_1887_DOCUMENTS.map(document => ({ id: `document-source:${document.id}`, kind: "museum-or-archive" as const, title: document.title, creator: document.creator, publisher: document.holdingInstitution, publicationYear: 1887, url: document.sourceUrl, locator: document.sourceLocator, rightsNote: document.rightsStatement, verificationStatus: "verified" as const })),
  rationale: "Établir les revendications à partir d’un discours, d’un article contemporain et d’une résolution, en distinguant autonomie politique et demandes financières.",
  review: { documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null },
} as const satisfies ApprovedQuestion;
