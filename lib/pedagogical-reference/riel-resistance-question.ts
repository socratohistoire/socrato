import type { ApprovedQuestion } from "./types.ts";
import { RIEL_RESISTANCE_DOCUMENTS } from "./riel-resistance-documents.ts";

export const RIEL_RESISTANCE_CAUSES_QUESTION = {
  schemaVersion: 1, id: "question:relations-federales-provinciales:document-interpretation-009",
  scope: "notional", knowledgeHeadingId: "relations-federales-provinciales", relatedKnowledgeHeadingIds: ["relations-federales-provinciales"],
  referenceCardId: "reference-card:relations-federales-provinciales", historicalRecordId: "historical-record:relations-federales-provinciales",
  status: "ready-for-review", format: "document-interpretation",
  prompt: "Selon Louis Riel, qu’est-ce qui explique le recours à la résistance en 1885? Appuie ta réponse sur deux éléments de son témoignage.",
  instruction: "Observe la photographie pour situer le témoignage, puis lis l’extrait. Explique les causes invoquées par Riel en reliant deux éléments du texte à sa décision de résister. Distingue son point de vue d’un récit neutre des événements.",
  expectedAnswer: "Selon Riel, la résistance répond à l’échec des démarches pacifiques et à une menace contre la population. Il affirme que des pétitions avaient été envoyées pour améliorer la situation, mais que le gouvernement répondait en envoyant la police. Il soutient aussi que l’agitation serait demeurée constitutionnelle si les résistants n’avaient pas été attaqués : il présente donc la résistance comme une réaction défensive. Accepter toute formulation équivalente reliant deux éléments du témoignage à cette explication, sans exiger des mots précis. Une simple énumération sans lien explicatif est insuffisante. La photographie situe le procès; elle ne prouve pas les causes invoquées. Ne pas présenter l’attaque alléguée comme un fait démontré par ce seul document.",
  historicalDocumentIds: RIEL_RESISTANCE_DOCUMENTS.map(({ id }) => id),
  commonErrors: ["Énumérer des passages sans expliquer leur lien avec la résistance.", "Présenter les affirmations de Riel comme un récit neutre et incontestable.", "Confondre les événements de 1885 avec la résistance de 1869-1870.", "Confondre une cause de la résistance avec le procès ou l’exécution qui lui succèdent.", "Prétendre que la photographie montre Riel prononçant le discours reproduit."],
  distractors: [], operationId: "causes_and_consequences",
  sourceIds: RIEL_RESISTANCE_DOCUMENTS.map(({ id }) => `document-source:${id}`),
  sourceCatalog: RIEL_RESISTANCE_DOCUMENTS.map(document => ({ id: `document-source:${document.id}`, kind: "museum-or-archive" as const, title: document.title, creator: document.creator, publisher: document.holdingInstitution, publicationYear: 1885, url: document.sourceUrl, locator: document.sourceLocator, rightsNote: document.rightsStatement, verificationStatus: "verified" as const })),
  rationale: "Déterminer les causes invoquées par Riel à partir d’un témoignage primaire situé par une photographie du procès, sans confondre justification judiciaire et récit neutre.",
  review: { documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null },
} as const satisfies ApprovedQuestion;
