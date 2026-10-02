import { ACTE_UNION_HISTORICAL_RECORD, COLONIAL_ECONOMY_HISTORICAL_RECORD, INDIAN_AFFAIRS_HISTORICAL_RECORD, RESPONSIBLE_GOVERNMENT_HISTORICAL_RECORD } from "../pedagogical-reference/index.ts";
import type { LearningSessionDocument, LearningSessionQuestion } from "../student-learning-session/types.ts";
import { BRITISH_NORTH_AMERICA_ACT_HISTORICAL_RECORD } from "../pedagogical-reference/records/acte-amerique-nord-britannique.ts";
import { FEDERAL_PROVINCIAL_RELATIONS_HISTORICAL_RECORD } from "../pedagogical-reference/records/relations-federales-provinciales.ts";
import type { PedagogicalQuestionDefinition } from "./types.ts";

function documentText(document: LearningSessionDocument) {
  const content = document.content;
  if (content.kind === "historical_excerpt") return content.excerpt;
  if (content.kind === "historical_image") return content.description;
  if (content.kind === "historical_timeline") return content.entries.map(({ date, title, description }) => `${date} — ${title}: ${description}`).join("\n");
  if (content.kind === "population_table") return content.rows.map(({ region, population, representatives }) => `${region}: population ${population}; représentants ${representatives}`).join("\n");
  if (content.kind === "comparison_table") return [content.caption, ...content.rows.map(({ label, value }) => `${label}: ${value}`)].join("\n");
  return "Schéma de la structure politique présenté dans l’activité.";
}

function successCriteria(question: LearningSessionQuestion) {
  if (question.id === "question:acte-de-l-amerique-du-nord-britannique:document-interpretation-001") {
    return ["Expliquer que le Dominion s’agrandit et identifier deux ajouts territoriaux exacts entre 1867 et 1873 suffit pour une réponse entièrement satisfaisante.", "Ne pas exiger les quatre provinces fondatrices, les dates exactes des ajouts ni tous les changements du corrigé. Les ajouts correctement nommés constituent l’appui sur les cartes."];
  }
  if (question.id === "question:acte-de-l-amerique-du-nord-britannique:document-interpretation-003") {
    return ["Identifier la construction d’un chemin de fer reliant les colonies suffit pour une réponse entièrement satisfaisante.", "Cette condition commune constitue un appui sur les deux documents. Ne pas exiger de comparer Annand et Fisher ni de préciser le calendrier de construction ou le nom Intercolonial."];
  }
  if (question.id === "question:acte-de-l-amerique-du-nord-britannique:union-federation-change") {
    return ["Accepte comme entièrement satisfaisante la réponse « Il y a maintenant deux paliers de gouvernement » ou une formulation équivalente, sans contradiction historique.", "Cette identification suffit comme changement et comme appui sur les schémas; ne pas exiger une description avant/après, les noms des provinces ou une justification documentaire supplémentaire."];
  }
  const operation = question.intellectualOperations.find(({ id }) => id === question.primaryOperationId)?.label ?? question.primaryOperationId;
  const criteria = [
    "Répond directement à toutes les parties de la question.",
    "Les faits avancés concordent avec les documents approuvés.",
    `Mobilise correctement l’opération intellectuelle « ${operation} ».`,
  ];
  if (question.requiredDocumentIds?.length) criteria.push("Justifie avec le contenu des documents requis; une reformulation fidèle compte autant qu’une citation et leur titre n’a pas à être nommé.");
  if (question.format === "development-150") criteria.push("Développe une justification cohérente; la cible de longueur demeure indicative.");
  return criteria;
}

function referenceMonograph(notionId: string) {
  const record = notionId === "acte-union"
    ? ACTE_UNION_HISTORICAL_RECORD
    : notionId === "economie-coloniale"
      ? COLONIAL_ECONOMY_HISTORICAL_RECORD
    : notionId === "gouvernement-responsable"
      ? RESPONSIBLE_GOVERNMENT_HISTORICAL_RECORD
      : notionId === "affaires-indiennes"
        ? INDIAN_AFFAIRS_HISTORICAL_RECORD
      : notionId === "acte-de-l-amerique-du-nord-britannique"
        ? BRITISH_NORTH_AMERICA_ACT_HISTORICAL_RECORD
      : notionId === "relations-federales-provinciales"
        ? FEDERAL_PROVINCIAL_RELATIONS_HISTORICAL_RECORD
      : undefined;
  if (!record) throw new Error("Aucune monographie pédagogique n’est configurée pour cette notion.");
  return {
    id: record.id, title: record.manual.title, scope: record.scope, scopeBoundary: record.manual.scopeBoundary ?? "",
    sections: record.manual.sections.map(({ id, title, paragraphs }) => ({
      id, title,
      paragraphs: paragraphs.map(({ id: paragraphId, text, sourceIds }) => ({ id: paragraphId, text, sourceIds: [...sourceIds] })),
    })),
  };
}

export const PEDAGOGICAL_ANALYSIS_RULES = [
  "Aide l’élève à construire lui-même une réponse historiquement juste sans lui donner immédiatement la réponse complète.",
  "Utilise sa réponse réelle et les acquis des tours précédents pour choisir la prochaine intervention.",
  "Augmente progressivement l’aide : question de recentrage, indice, information pertinente, puis aide plus explicite.",
  "Dis précisément ce qui est juste ou à corriger, avec un ton naturel et sans structure répétitive imposée.",
  "N’invente aucun fait et utilise seulement la monographie et les documents associés à la question.",
  "Une copie substantielle d’un document ne suffit pas : demande une explication avec les mots de l’élève; accepte une courte citation intégrée à son raisonnement.",
] as const;

export function createPedagogicalQuestionDefinition(question: LearningSessionQuestion, notionId: string, notionTitle: string, documents: LearningSessionDocument[]): PedagogicalQuestionDefinition {
  const documentIds = question.documentRelations.map(({ documentId }) => documentId);
  const documentsById = new Map(documents.map((document) => [document.id, document]));
  return {
    id: question.id, notionId, questionPrompt: question.prompt, instruction: question.instruction, primaryOperationId: question.primaryOperationId,
    operationIds: question.intellectualOperations.map(({ id }) => id),
    historicalKnowledgeIds: [...question.historicalKnowledgeIds], documentIds,
    requiredDocumentIds: (question.requiredDocumentIds ?? []).filter((id) => documentIds.includes(id)),
    maxAttempts: question.maxAttempts,
    hintSequence: { 1: question.localHint, 2: question.localHint },
    evaluationContext: {
      questionPrompt: question.prompt, instruction: question.instruction, notionTitle,
      primaryOperationLabel: question.intellectualOperations.find(({ id }) => id === question.primaryOperationId)?.label ?? question.primaryOperationId,
      successCriteria: successCriteria(question),
      evaluationGuide: question.evaluationGuide ?? { expectedAnswer: question.answerExplanation ?? "", commonErrors: [] },
      referenceMonograph: referenceMonograph(notionId),
      pedagogicalRules: [...PEDAGOGICAL_ANALYSIS_RULES],
      approvedDocuments: documentIds.flatMap((id) => {
        const document = documentsById.get(id);
        return document ? [{
          id: document.id, title: document.title, typeLabel: document.typeLabel,
          attribution: [document.authorLabel, document.institutionLabel, document.dateLabel, document.sourceLabel].filter(Boolean).join(" · "),
          content: documentText(document),
        }] : [];
      }),
    },
  };
}
