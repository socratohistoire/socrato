import type { ApprovedQuestion } from "./types.ts";
import { MANITOBA_1870_DOCUMENT, RIEL_EXECUTION_DOCUMENTS } from "./federal-provincial-relations-primary-documents.ts";
import { BRITISH_NORTH_AMERICA_ANNAND_RAILWAY_DOCUMENT } from "./british-north-america-confederation-documents.ts";

const documents = [MANITOBA_1870_DOCUMENT, BRITISH_NORTH_AMERICA_ANNAND_RAILWAY_DOCUMENT, RIEL_EXECUTION_DOCUMENTS[1]] as const;

export const METIS_POLITICAL_OUTCOMES_QUESTION = {
  schemaVersion: 1, id: "question:relations-federales-provinciales:document-interpretation-012",
  scope: "notional", knowledgeHeadingId: "relations-federales-provinciales", relatedKnowledgeHeadingIds: ["relations-federales-provinciales"],
  referenceCardId: "reference-card:relations-federales-provinciales", historicalRecordId: "historical-record:relations-federales-provinciales",
  status: "ready-for-review", format: "document-interpretation",
  prompt: "Dégage une différence entre les conséquences politiques de la résistance de 1869-1870 et celles de la résistance de 1885.",
  instruction: "Sélectionne les deux documents utiles parmi les trois proposés. Formule une comparaison en t’appuyant sur un indice de chacun des documents retenus. Indique aussi quel document tu écartes et explique pourquoi il ne permet pas de répondre à la question.",
  expectedAnswer: "La résistance de 1869-1870 et les négociations conduisent à la création du Manitoba comme province du Canada, avec une législature et une représentation à la Chambre des communes. En revanche, après la résistance de 1885, l’exécution de Riel provoque une mobilisation politique contre le gouvernement fédéral chez une partie des Canadiens français : Mercier appelle à briser une alliance politique et à en former une nouvelle. La différence oppose donc un résultat institutionnel négocié en 1870 à une accentuation de l’opposition politique à Ottawa après 1885. Accepter toute formulation équivalente qui compare clairement une conséquence de chaque résistance et l’appuie sur les documents. Les documents utiles sont RFP-T-005 (document 1) et RFP-T-004 (document 3). AANB-T-004 (document 2) est à écarter : Annand discute en 1866 de la construction d’un chemin de fer avant l’union des colonies, non des conséquences des résistances métisses. Ce document n’est pas faux. L’exécution de Riel seule, sans expliquer une conséquence politique, constitue une réponse partielle. Ne pas présenter les Canadiens français comme unanimes ni prétendre que la création du Manitoba a réglé toutes les revendications métisses.",
  historicalDocumentIds: documents.map(({id}) => id),
  commonErrors: ["Comparer les causes au lieu des conséquences.", "Énumérer deux faits sans formuler de différence.", "Attribuer la création du Manitoba à 1885 ou l’exécution de Riel à 1870.", "Mentionner seulement la mort de Riel sans en dégager la portée politique.", "Présenter les accusations de Mercier comme des faits neutres ou comme l’opinion unanime des Canadiens français.", "Utiliser le chemin de fer de 1866 comme conséquence d’événements ultérieurs, ou qualifier ce document de faux."],
  distractors: [], operationId: "differences_and_similarities",
  sourceIds: documents.map(({id}) => `document-source:${id}`),
  sourceCatalog: documents.map(document => ({id: `document-source:${document.id}`, kind: "museum-or-archive" as const, title: document.title, creator: document.creator, publisher: document.holdingInstitution, publicationYear: document.id === "RFP-T-005" ? 1870 : document.id === "RFP-T-004" ? 1890 : 1866, url: document.sourceUrl, locator: document.sourceLocator, rightsNote: document.rightsStatement, verificationStatus: "verified" as const})),
  rationale: "Comparer un résultat institutionnel de 1869-1870 à la mobilisation politique consécutive à l’exécution de Riel en 1885, en sélectionnant deux preuves pertinentes et en écartant un document primaire sur un autre enjeu.",
  review: {documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null},
} as const satisfies ApprovedQuestion;
