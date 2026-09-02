import type { ApprovedQuestion } from "../pedagogical-reference/types.ts";
import type { LearningSessionDocument } from "../student-learning-session/types.ts";

export const CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID = "question:acte-union:understand-causes-consequences";

export const INTELLECTUAL_OPERATION_LEARNING_DOCUMENTS: LearningSessionDocument[] = [
  {
    id: "PAT-T-LEARN-RUSSELL", title: "Le gouvernement britannique refuse les demandes des Patriotes", typeLabel: "Le gouvernement britannique refuse les demandes des Patriotes", dateLabel: "Mars 1837", authorLabel: "Amédée Papineau", originalDocumentLabel: "Journal d’un Fils de la liberté — réaction aux résolutions Russell",
    sourceLabel: "Amédée Papineau, Journal d’un Fils de la liberté, entrée sur les résolutions Russell de 1837.", sourceUrls: ["https://english.republiquelibre.org/Diary_of_a_Fils_de_la_libert%C3%A9"], rightsLabel: "Texte historique du domaine public.", editorialNote: "Extrait traduit; orthographe et ponctuation modernisées pour faciliter la lecture.",
    content: { kind: "historical_excerpt", excerpt: "Ces résolutions disent, en somme, que nous nous plaignons sans raison, qu’il ne convient pas de nous accorder nos demandes et que le gouvernement pourra prendre notre argent sans notre assentiment." },
    historicalKnowledgeIds: ["acte-union"], intellectualOperationIds: ["causes_and_consequences"],
  },
  {
    id: "PAT-T-LEARN-REBELLION", title: "Les Rébellions débutent", typeLabel: "Les Rébellions débutent", dateLabel: "1837-1838", authorLabel: "Jacques Paquin", originalDocumentLabel: "Journal historique des événements arrivés à Saint-Eustache pendant la rébellion",
    sourceLabel: "Journal d’un témoin des événements de Saint-Eustache, publié à Montréal en 1838.", sourceUrls: ["https://www.canadiana.ca/view/oocihm.21665"], rightsLabel: "Ouvrage du domaine public.", editorialNote: "Extraits réunis; orthographe et ponctuation modernisées pour faciliter la lecture.",
    content: { kind: "historical_excerpt", excerpt: "Le 26 novembre 1837 commence la période des troubles sérieux. Des insurgés parcourent les environs de Saint-Eustache et plusieurs sont armés. Le village demeure dans des alarmes continuelles, puis les affrontements opposent les insurgés aux troupes du gouvernement." },
    historicalKnowledgeIds: ["acte-union"], intellectualOperationIds: ["causes_and_consequences"],
  },
  {
    id: "PAT-T-LEARN-DURHAM", title: "La Constitution du Bas-Canada est suspendue et lord Durham est envoyé pour enquêter", typeLabel: "La Constitution du Bas-Canada est suspendue et lord Durham est envoyé pour enquêter", dateLabel: "1839", authorLabel: "John George Lambton, lord Durham", originalDocumentLabel: "Rapport sur les affaires de l’Amérique du Nord britannique",
    sourceLabel: "Lord Durham, Rapport sur les affaires de l’Amérique du Nord britannique, 1839, introduction.", sourceUrls: ["https://fr.wikisource.org/wiki/Rapport_de_Lord_Durham/01", "https://primarydocuments.ca/report-on-the-affairs-of-british-north-america-durham-report/amp/"], rightsLabel: "Rapport historique du domaine public.", editorialNote: "Extrait traduit et légèrement modernisé; les crochets signalent une coupure.",
    content: { kind: "historical_excerpt", excerpt: "Votre Majesté m’a confié le gouvernement de la province du Bas-Canada durant la période critique de la suspension de sa Constitution. Elle m’a en même temps nommé haut-commissaire pour régler certaines questions importantes dans les provinces du Bas-Canada et du Haut-Canada relativement à la forme et au gouvernement futur de ces provinces. […] J’ai donc mené une enquête afin de découvrir les causes des désordres et les moyens d’y remédier." },
    historicalKnowledgeIds: ["acte-union"], intellectualOperationIds: ["causes_and_consequences"],
  },
];

export const CAUSES_CONSEQUENCES_LEARNING_QUESTION = {
  schemaVersion: 1, id: CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID, scope: "notional", knowledgeHeadingId: "acte-union", relatedKnowledgeHeadingIds: ["acte-union"], referenceCardId: "reference-card:acte-union", historicalRecordId: "historical-record:acte-union", status: "approved", format: "document-interpretation",
  prompt: "À l’aide des trois sources, explique une cause et une conséquence des Rébellions de 1837-1838.",
  instruction: "Socrato te guidera étape par étape. Réponds à ses questions dans tes mots; tu n’as pas besoin de connaître déjà la méthode.",
  expectedAnswer: "Le document 1 présente une cause politique : les résolutions Russell refusent les principales demandes formulées par la Chambre d’assemblée et provoquent du mécontentement au Bas-Canada. Le document 2 représente l’événement central, les affrontements armés des Rébellions de 1837-1838. Le document 3 présente des conséquences : la Constitution du Bas-Canada est suspendue et lord Durham est nommé haut-commissaire afin d’enquêter et de recommander des changements.",
  historicalDocumentIds: INTELLECTUAL_OPERATION_LEARNING_DOCUMENTS.map(({ id }) => id), commonErrors: ["Confondre la cause et la conséquence.", "Classer les documents sans expliquer les liens.", "Présenter le refus britannique comme l’unique cause des Rébellions."], distractors: [], operationId: "causes_and_consequences", sourceIds: [], sourceCatalog: [], rationale: "Parcours socratique consacré à la compréhension de l’opération intellectuelle à partir d’une chaîne cause–événement–conséquence.",
  review: { documented: true, historicallyVerified: true, pedagogicallyVerified: true, biasAndLanguageReviewed: true, approvedBy: "David Hinse", approvedVersion: "1.0", approvedAt: "2026-08-31T00:00:00.000-04:00" },
} as const satisfies ApprovedQuestion;
