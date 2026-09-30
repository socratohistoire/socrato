import type { ApprovedQuestion } from "./types.ts";
import { GOVERNMENT_REVENUE_DOCUMENTS } from "./federal-provincial-relations-primary-documents.ts";
import { CONFERENCE_1887_DOCUMENTS } from "./conference-1887.ts";

const documents = [GOVERNMENT_REVENUE_DOCUMENTS[1], CONFERENCE_1887_DOCUMENTS[2]] as const;

export const PROVINCIAL_SUBSIDIES_QUESTION = {
  schemaVersion: 1, id: "question:relations-federales-provinciales:document-interpretation-013",
  scope: "notional", knowledgeHeadingId: "relations-federales-provinciales", relatedKnowledgeHeadingIds: ["relations-federales-provinciales"],
  referenceCardId: "reference-card:relations-federales-provinciales", historicalRecordId: "historical-record:relations-federales-provinciales",
  status: "ready-for-review", format: "document-interpretation",
  prompt: "Explique pourquoi les provinces réclament une augmentation des subventions fédérales.",
  instruction: "À l’aide des deux documents, explique la revendication financière des provinces au cours des premières décennies suivant 1867. Relie leurs ressources financières, leurs dépenses et leur demande au gouvernement fédéral. Appuie ta réponse sur un indice de chaque document.",
  expectedAnswer: "Les provinces doivent financer leurs gouvernements et leurs responsabilités à partir notamment de la taxation directe, des terres et forêts publiques, des licences et des subventions fédérales prévues en 1867. En 1887, leurs représentants soutiennent que les allocations sont insuffisantes et que plusieurs provinces ne peuvent couvrir les dépenses supplémentaires par leurs propres ressources. Elles réclament donc une augmentation des subventions fédérales pour combler cet écart et financer leurs responsabilités. Le document 1 établit leurs sources de revenus et les transferts; le document 2 expose l’insuffisance dénoncée et la demande d’augmentation. Accepter toute formulation équivalente reliant dépenses supplémentaires, ressources ou subventions jugées insuffisantes et demande d’aide accrue à Ottawa. Une simple liste de revenus, ou « elles veulent plus d’argent » sans explication, ne suffit pas. La croissance démographique peut enrichir une réponse historiquement juste, mais n’est pas exigée par les extraits sélectionnés. Ne pas affirmer que les provinces n’ont aucun revenu propre ni que la taxation directe est exclusivement provinciale. Ne pas généraliser à toutes les provinces les modalités démographiques particulières de 1867; ne pas confondre subventions de l’époque et péréquation moderne.",
  historicalDocumentIds: documents.map(({id}) => id),
  commonErrors: ["Énumérer les sources de revenus sans expliquer la demande.", "Affirmer que les provinces ne disposent d’aucun revenu propre.", "Présenter la taxation directe comme interdite au gouvernement fédéral.", "Confondre les subventions de l’époque avec le programme contemporain de péréquation.", "Présenter la résolution de 1887 comme une augmentation déjà accordée, ou comme une mesure chiffrée de la situation de chaque province."],
  distractors: [], operationId: "causal_connections",
  sourceIds: documents.map(({id}) => `document-source:${id}`),
  sourceCatalog: documents.map(document => ({id: `document-source:${document.id}`, kind: document.id === "RFP-T-009" ? "government" as const : "museum-or-archive" as const, title: document.title, creator: document.creator, publisher: document.holdingInstitution, publicationYear: document.id === "RFP-T-009" ? 1867 : 1887, url: document.sourceUrl, locator: document.sourceLocator, rightsNote: document.rightsStatement, verificationStatus: "verified" as const})),
  rationale: "Établir une chaîne causale entre les ressources prévues en 1867, les dépenses supplémentaires et l’insuffisance financière dénoncée en 1887, puis la revendication de transferts fédéraux plus élevés.",
  review: {documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null},
} as const satisfies ApprovedQuestion;
