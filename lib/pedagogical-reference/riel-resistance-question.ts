import type { ApprovedQuestion } from "./types.ts";
import { RIEL_RESISTANCE_DOCUMENTS } from "./riel-resistance-documents.ts";
import { RIEL_EXECUTION_DOCUMENTS } from "./federal-provincial-relations-primary-documents.ts";

const RIEL_EXECUTION_DISTRACTOR = RIEL_EXECUTION_DOCUMENTS.find(({ id }) => id === "RFP-T-004")!;
const RIEL_RESISTANCE_CAUSES_DOCUMENTS = [...RIEL_RESISTANCE_DOCUMENTS, RIEL_EXECUTION_DISTRACTOR] as const;

export const RIEL_RESISTANCE_CAUSES_QUESTION = {
  schemaVersion: 1, id: "question:relations-federales-provinciales:document-interpretation-009",
  scope: "notional", knowledgeHeadingId: "relations-federales-provinciales", relatedKnowledgeHeadingIds: ["relations-federales-provinciales"],
  referenceCardId: "reference-card:relations-federales-provinciales", historicalRecordId: "historical-record:relations-federales-provinciales",
  status: "ready-for-review", format: "document-interpretation",
  prompt: "Nomme deux causes qui auraient contribué au deuxième soulèvement des Métis en 1885.",
  instruction: "Repère dans les textes deux éléments qui peuvent expliquer le recours au soulèvement.",
  expectedAnswer: "L’élève doit nommer deux causes distinctes appuyées par les documents 2 et 3. Première cause : la pression foncière forme un seul élément; elle réunit l’arrivée de nouveaux colons, l’occupation ou la vente des terres et l’arpentage qui ne respecte pas adéquatement les lots riverains ou rend difficile la reconnaissance des terres métisses. Deuxième cause : l’échec des pétitions ou des démarches pacifiques, demeurées sans réponse satisfaisante du gouvernement. La mention de la police peut servir à expliquer la réponse du gouvernement aux pétitions, mais ne constitue pas une troisième cause exigée. Une courte énumération de deux causes justes suffit. Ne pas exiger tous les détails ni demander à l’élève de nommer les documents utilisés. Si l’élève présente l’arpentage et l’arrivée des colons comme deux causes séparées, lui dire qu’ils appartiennent au même problème foncier, conserver cet élément juste, puis lui demander de chercher dans la déclaration de Riel une autre démarche qui a échoué. Le document 4 ne fournit pas une cause : le discours d’Honoré Mercier porte sur l’exécution de Riel, survenue après la défaite du soulèvement; cet événement postérieur est une conséquence et non une cause. Si l’élève utilise l’exécution comme cause, lui signaler clairement cette erreur chronologique : l’exécution survient après le soulèvement et ne peut donc pas l’avoir causé. Conserver toute autre cause juste déjà donnée, puis lui demander de chercher une seconde cause antérieure dans les documents. La photographie situe le procès; elle ne constitue pas une cause du soulèvement. La déclaration exprime le point de vue de Riel, la pétition cherche à convaincre le gouvernement et le discours de Mercier exprime un jugement politique après l’exécution.",
  historicalDocumentIds: RIEL_RESISTANCE_CAUSES_DOCUMENTS.map(({ id }) => id),
  commonErrors: ["Compter l’arpentage et l’arrivée des colons comme deux causes distinctes alors qu’ils forment ensemble le problème foncier.", "Oublier l’échec des pétitions et des démarches pacifiques.", "Présenter l’exécution de Riel comme une cause du soulèvement alors qu’elle lui est postérieure.", "Présenter les affirmations de Riel, la pétition ou le discours de Mercier comme des récits neutres et incontestables.", "Confondre les événements de 1885 avec la résistance de 1869-1870.", "Utiliser la photographie ou le document 4 comme preuve d’une cause plutôt que de sélectionner les textes pertinents."],
  distractors: [], operationId: "causes_and_consequences",
  sourceIds: RIEL_RESISTANCE_CAUSES_DOCUMENTS.map(({ id }) => `document-source:${id}`),
  sourceCatalog: RIEL_RESISTANCE_CAUSES_DOCUMENTS.map(document => ({ id: `document-source:${document.id}`, kind: "museum-or-archive" as const, title: document.title, creator: document.creator, publisher: document.holdingInstitution, publicationYear: 1885, url: document.sourceUrl, locator: document.sourceLocator, rightsNote: document.rightsStatement, verificationStatus: "verified" as const })),
  rationale: "Regrouper l’arpentage et la colonisation dans une même cause foncière, distinguer l’échec des pétitions comme seconde cause et discriminer un document authentique mais postérieur.",
  review: { documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null },
} as const satisfies ApprovedQuestion;
