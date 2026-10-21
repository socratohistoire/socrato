import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";
import {
  FEDERAL_PROVINCIAL_RELATIONS_RIEL_TRIAL_SPEECH_DOCUMENT,
  LAURIER_GREENWAY_INTERGOVERNMENTAL_EXCERPT_DOCUMENT,
  MANITOBA_1870_DOCUMENT,
} from "./federal-provincial-relations-primary-documents.ts";
import { MACDONALD_NEW_BRUNSWICK_SCHOOLS_RESPONSE_DOCUMENT } from "./federal-provincial-relations-coverage-documents.ts";

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

const metisConsequencesDocuments = [
  MANITOBA_1870_DOCUMENT,
  FEDERAL_PROVINCIAL_RELATIONS_RIEL_TRIAL_SPEECH_DOCUMENT,
] as const;

const federalSchoolResponsesDocuments = [
  MACDONALD_NEW_BRUNSWICK_SCHOOLS_RESPONSE_DOCUMENT,
  LAURIER_GREENWAY_INTERGOVERNMENTAL_EXCERPT_DOCUMENT,
] as const;

export const METIS_RESISTANCES_CONSEQUENCES_COMPARISON_QUESTION = {
  schemaVersion: 1,
  id: "question:relations-federales-provinciales:document-interpretation-015",
  scope: "notional",
  knowledgeHeadingId: "relations-federales-provinciales",
  relatedKnowledgeHeadingIds: ["relations-federales-provinciales"],
  referenceCardId: "reference-card:relations-federales-provinciales",
  historicalRecordId: "historical-record:relations-federales-provinciales",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Compare les conséquences des résistances métisses de 1869-1870 et de 1885. Relève une différence importante dans leur issue politique.",
  instruction: "Utilise les deux extraits. Pour chaque résistance, établis une conséquence à partir du texte et de sa mise en contexte, puis formule clairement la différence entre les deux issues.",
  expectedAnswer: "La résistance de 1869-1870 mène à une négociation avec Ottawa et à un résultat constitutionnel : la Loi sur le Manitoba crée une nouvelle province, lui accorde une représentation à la Chambre des communes et établit une législature provinciale. Cela ne signifie toutefois pas que toutes les garanties promises aux Métis sont ensuite respectées. En 1885, l’issue immédiate est plutôt une défaite militaire et une répression judiciaire : après Batoche, Riel est jugé pour haute trahison; son discours au jury montre que sa liberté et sa vie sont en jeu, puis il est exécuté. La différence essentielle est donc qu’en 1870 la résistance débouche sur une province et des institutions négociées, tandis qu’en 1885 elle se termine par la défaite des résistants, le procès et l’exécution de Riel, sans nouvelle province ni règlement politique comparable.",
  historicalDocumentIds: metisConsequencesDocuments.map(({ id }) => id),
  commonErrors: ["Comparer seulement les causes des deux résistances.", "Affirmer que la création du Manitoba règle définitivement toutes les revendications métisses.", "Présenter le procès ou l’exécution de Riel comme une cause de la résistance de 1885.", "Dire que les deux résistances aboutissent à la création d’une province.", "Oublier d’appuyer chaque conséquence sur un document distinct."],
  distractors: [],
  operationId: "differences_and_similarities",
  sourceIds: metisConsequencesDocuments.map(({ id }) => `document-source:${id}`),
  sourceCatalog: [
    sourceFromDocument(MANITOBA_1870_DOCUMENT, 1870),
    sourceFromDocument(FEDERAL_PROVINCIAL_RELATIONS_RIEL_TRIAL_SPEECH_DOCUMENT, 1885),
  ],
  rationale: "La banque comparait déjà les causes des deux résistances, mais pas leurs issues. Les deux extraits permettent d’opposer un résultat constitutionnel négocié en 1870 à la défaite et à la répression judiciaire de 1885.",
  review: { documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null },
} as const satisfies ApprovedQuestion;

export const FEDERAL_SCHOOL_CRISIS_RESPONSES_COMPARISON_QUESTION = {
  schemaVersion: 1,
  id: "question:relations-federales-provinciales:document-interpretation-017",
  scope: "notional",
  knowledgeHeadingId: "relations-federales-provinciales",
  relatedKnowledgeHeadingIds: ["relations-federales-provinciales"],
  referenceCardId: "reference-card:relations-federales-provinciales",
  historicalRecordId: "historical-record:relations-federales-provinciales",
  status: "ready-for-review",
  format: "document-interpretation",
    prompt: "Compare la manière dont le gouvernement fédéral réagit aux crises scolaires du Nouveau-Brunswick et du Manitoba. Quelle différence observes-tu entre les deux façons d’agir?",
  instruction: "Pour chaque crise, indique ce que fait le gouvernement fédéral, puis formule une différence.",
  expectedAnswer: "Au Nouveau-Brunswick, le gouvernement fédéral refuse d’intervenir au nom de la compétence provinciale. Au Manitoba, il participe plutôt à la négociation d’un compromis avec la province. La différence attendue est donc le refus d’une intervention directe dans le premier cas et le recours à la négociation dans le second.",
  historicalDocumentIds: federalSchoolResponsesDocuments.map(({ id }) => id),
  commonErrors: ["Affirmer que Macdonald approuve nécessairement la politique scolaire parce qu’il refuse d’intervenir.", "Dire que l’éducation devient une compétence fédérale au Manitoba.", "Présenter le compromis Laurier-Greenway comme un désaveu de la loi manitobaine.", "Affirmer que le compromis rétablit entièrement le réseau catholique séparé financé publiquement.", "Énumérer les deux documents sans comparer les modes d’intervention."],
  distractors: [],
  operationId: "differences_and_similarities",
  sourceIds: federalSchoolResponsesDocuments.map(({ id }) => `document-source:${id}`),
  sourceCatalog: [
    sourceFromDocument(MACDONALD_NEW_BRUNSWICK_SCHOOLS_RESPONSE_DOCUMENT, 1873),
    sourceFromDocument(LAURIER_GREENWAY_INTERGOVERNMENTAL_EXCERPT_DOCUMENT, 1896),
  ],
  rationale: "La question distingue deux réponses fédérales à des crises scolaires provinciales : le refus de désavouer une loi jugée valide et le recours ultérieur à une négociation intergouvernementale accordant des concessions limitées.",
  review: { documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null },
} as const satisfies ApprovedQuestion;

export const FEDERAL_PROVINCIAL_RELATIONS_GAP_QUESTIONS = [
  METIS_RESISTANCES_CONSEQUENCES_COMPARISON_QUESTION,
  FEDERAL_SCHOOL_CRISIS_RESPONSES_COMPARISON_QUESTION,
] as const satisfies readonly ApprovedQuestion[];
