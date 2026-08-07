"use server";

import { cookies } from "next/headers";
import { getStudentAccessRuntime, STUDENT_SESSION_COOKIE } from "@/lib/student-access/local-runtime";
import { DatabaseStudentLearningSessionProvider } from "@/lib/student-learning-session/database-provider";
import type { LearningSessionDocument, LearningSessionQuestion } from "@/lib/student-learning-session/types";
import { LocalDeterministicResponseAnalyzer } from "@/lib/pedagogical-session-engine/local-analyzer";
import { createConfiguredOpenAIPedagogicalAnalyzer } from "@/lib/pedagogical-session-engine/openai-analyzer";
import type { PedagogicalQuestionDefinition, StudentResponse } from "@/lib/pedagogical-session-engine/types";
import { validateStructuredAnalysis } from "@/lib/pedagogical-session-engine/validation";

type AnalysisRequest = {
  activityId: string;
  questionId: string;
  attemptNumber: number;
  hintLevel: 0 | 1 | 2;
  content: string;
};

function validIdentifier(value: unknown, maximumLength = 120): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximumLength && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validRequest(value: AnalysisRequest) {
  return validIdentifier(value.activityId) && validIdentifier(value.questionId)
    && Number.isInteger(value.attemptNumber) && value.attemptNumber >= 1 && value.attemptNumber <= 3
    && [0, 1, 2].includes(value.hintLevel)
    && typeof value.content === "string" && value.content.trim().length > 0 && value.content.length <= 10_000;
}

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
  const criteria = [
    "Répond directement à toutes les parties de la question.",
    "Les faits avancés concordent avec les documents approuvés.",
    `Mobilise correctement l’opération intellectuelle « ${question.intellectualOperations.find(({ id }) => id === question.primaryOperationId)?.label ?? question.primaryOperationId} ».`
  ];
  if (question.requiredDocumentIds?.length) criteria.push("Appuie explicitement son explication sur les documents requis.");
  if (question.format === "development-150") criteria.push("Développe une justification cohérente; la cible de longueur demeure indicative.");
  return criteria;
}

function questionDefinition(question: LearningSessionQuestion, notionId: string, notionTitle: string, documents: LearningSessionDocument[]): PedagogicalQuestionDefinition {
  const documentIds = question.documentRelations.map(({ documentId }) => documentId);
  const documentsById = new Map(documents.map((document) => [document.id, document]));
  return {
    id: question.id,
    notionId,
    primaryOperationId: question.primaryOperationId,
    operationIds: question.intellectualOperations.map(({ id }) => id),
    historicalKnowledgeIds: [...question.historicalKnowledgeIds],
    documentIds,
    requiredDocumentIds: (question.requiredDocumentIds ?? []).filter((id) => documentIds.includes(id)),
    hintSequence: { 1: question.localHint, 2: question.localHint },
    evaluationContext: {
      questionPrompt: question.prompt,
      instruction: question.instruction,
      notionTitle,
      primaryOperationLabel: question.intellectualOperations.find(({ id }) => id === question.primaryOperationId)?.label ?? question.primaryOperationId,
      successCriteria: successCriteria(question),
      approvedDocuments: documentIds.flatMap((id) => {
        const document = documentsById.get(id);
        return document ? [{
          id: document.id,
          title: document.title,
          typeLabel: document.typeLabel,
          attribution: [document.authorLabel, document.institutionLabel, document.dateLabel, document.sourceLabel].filter(Boolean).join(" · "),
          content: documentText(document),
        }] : [];
      }),
    },
  };
}

function configuredAnalyzer() {
  const mode = process.env.SOCRATO_PEDAGOGICAL_ANALYZER ?? "local";
  if (mode === "openai") return createConfiguredOpenAIPedagogicalAnalyzer();
  if (mode === "local") return new LocalDeterministicResponseAnalyzer();
  throw new Error("Le fournisseur d’analyse pédagogique est inconnu.");
}

export async function analyzeAuthorizedStudentResponse(request: AnalysisRequest) {
  if (!validRequest(request)) return { ok: false as const, error: "La réponse transmise est invalide." };
  const token = (await cookies()).get(STUDENT_SESSION_COOKIE)?.value;
  const studentSession = token ? await getStudentAccessRuntime().sessions.findActiveByToken(token) : null;
  if (!studentSession) return { ok: false as const, error: "La session élève n’est plus valide." };

  try {
    const learningSession = await new DatabaseStudentLearningSessionProvider().getForAnonymousStudent(
      studentSession.anonymousStudentId,
      request.activityId,
    );
    const question = learningSession?.questions.find(({ id }) => id === request.questionId);
    if (!learningSession || !question) return { ok: false as const, error: "Cette question n’appartient pas à l’activité assignée." };
    const definition = questionDefinition(question, learningSession.notionId, learningSession.notionTitle, learningSession.documentCatalog);
    const response: StudentResponse = {
      sessionId: learningSession.id,
      activityId: learningSession.activityId,
      questionId: definition.id,
      notionId: definition.notionId,
      primaryOperationId: definition.primaryOperationId,
      operationIds: [...definition.operationIds],
      historicalKnowledgeIds: [...definition.historicalKnowledgeIds],
      documentIds: [...definition.documentIds],
      attemptNumber: request.attemptNumber,
      hintLevel: request.hintLevel,
      content: request.content,
    };
    const analysis = validateStructuredAnalysis(await configuredAnalyzer().analyze(response, definition), definition);
    return { ok: true as const, analysis };
  } catch {
    return { ok: false as const, error: "Socrato n’a pas pu analyser cette réponse. Réessaie dans un instant." };
  }
}
