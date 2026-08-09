import { ACTE_UNION_HISTORICAL_RECORD } from "../pedagogical-reference/index.ts";
import type { LearningSessionDocument, LearningSessionQuestion } from "../student-learning-session/types.ts";
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
  const operation = question.intellectualOperations.find(({ id }) => id === question.primaryOperationId)?.label ?? question.primaryOperationId;
  const criteria = [
    "Répond directement à toutes les parties de la question.",
    "Les faits avancés concordent avec les documents approuvés.",
    `Mobilise correctement l’opération intellectuelle « ${operation} ».`,
  ];
  if (question.requiredDocumentIds?.length) criteria.push("Appuie explicitement son explication sur les documents requis.");
  if (question.format === "development-150") criteria.push("Développe une justification cohérente; la cible de longueur demeure indicative.");
  return criteria;
}

function referenceMonograph(notionId: string) {
  if (notionId !== "acte-union") throw new Error("Aucune monographie pédagogique n’est configurée pour cette notion.");
  const record = ACTE_UNION_HISTORICAL_RECORD;
  return {
    id: record.id, title: record.manual.title, scope: record.scope, scopeBoundary: record.manual.scopeBoundary ?? "",
    sections: record.manual.sections.map(({ id, title, paragraphs }) => ({
      id, title,
      paragraphs: paragraphs.map(({ id: paragraphId, text, sourceIds }) => ({ id: paragraphId, text, sourceIds: [...sourceIds] })),
    })),
  };
}

export const PEDAGOGICAL_ANALYSIS_RULES = [
  "Une idée historique compréhensible et liée à la question est toujours exploitable.",
  "Une réponse qui accomplit correctement le raisonnement central est réussie même si un enrichissement demeure possible.",
  "Après une réponse réussie, confirme la réussite, ajoute au besoin une seule précision historique brève tirée de la monographie, puis laisse passer à la question suivante; ne pose aucune question supplémentaire.",
  "Après une réponse partielle, nomme précisément l’acquis, indique un seul élément à ajouter et pose une seule question ciblée qui aide l’élève à le trouver sans donner la réponse.",
  "Après une réponse insuffisante, oriente l’élève vers le document historique associé le plus pertinent et pose une question d’observation simple.",
  "N’utilise que la monographie et les documents historiques associés à cette question; n’invente aucun fait ni document.",
  "Commence chaque retour par une reconnaissance chaleureuse et précise de l’apport réel de l’élève; évite les amorces vagues.",
  "N’exige aucune date exacte, aucun numéro d’article ni terme juridique spécialisé qui ne soit explicitement demandé; utilise-les seulement comme enrichissement après une réponse conceptuellement réussie.",
  "Lors d’une diversion, ramène progressivement et gentiment l’élève à la question sans jugement, menace ni interprétation de son intention.",
] as const;

export function createPedagogicalQuestionDefinition(question: LearningSessionQuestion, notionId: string, notionTitle: string, documents: LearningSessionDocument[]): PedagogicalQuestionDefinition {
  const documentIds = question.documentRelations.map(({ documentId }) => documentId);
  const documentsById = new Map(documents.map((document) => [document.id, document]));
  return {
    id: question.id, notionId, primaryOperationId: question.primaryOperationId,
    operationIds: question.intellectualOperations.map(({ id }) => id),
    historicalKnowledgeIds: [...question.historicalKnowledgeIds], documentIds,
    requiredDocumentIds: (question.requiredDocumentIds ?? []).filter((id) => documentIds.includes(id)),
    hintSequence: { 1: question.localHint, 2: question.localHint },
    evaluationContext: {
      questionPrompt: question.prompt, instruction: question.instruction, notionTitle,
      primaryOperationLabel: question.intellectualOperations.find(({ id }) => id === question.primaryOperationId)?.label ?? question.primaryOperationId,
      successCriteria: successCriteria(question), referenceMonograph: referenceMonograph(notionId),
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
