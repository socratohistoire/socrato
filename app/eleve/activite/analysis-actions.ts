"use server";

import { cookies } from "next/headers";
import { getStudentAccessRuntime, STUDENT_SESSION_COOKIE } from "@/lib/student-access/local-runtime";
import { DatabaseStudentLearningSessionProvider } from "@/lib/student-learning-session/database-provider";
import { LocalDeterministicResponseAnalyzer } from "@/lib/pedagogical-session-engine/local-analyzer";
import { createConfiguredOpenAIPedagogicalAnalyzer, selectRelevantMonographPassages } from "@/lib/pedagogical-session-engine/openai-analyzer";
import { createPedagogicalQuestionDefinition } from "@/lib/pedagogical-session-engine/question-context";
import type { StudentResponse } from "@/lib/pedagogical-session-engine/types";
import { discardUnknownPedagogicalIds, validateStructuredAnalysis } from "@/lib/pedagogical-session-engine/validation";

type AnalysisRequest = {
  activityId: string;
  questionId: string;
  attemptNumber: number;
  hintLevel: 0 | 1 | 2;
  content: string;
  priorTurn?: StudentResponse["priorTurn"];
};

type ConsolidationCoachRequest = {
  activityId: string;
  questionId: string;
  operationLabel: string;
  step: 0 | 1 | 2;
  content: string;
};

const CONSOLIDATION_COACH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["accepted", "feedback"],
  properties: {
    accepted: { type: "boolean" },
    feedback: { type: "string", minLength: 1, maxLength: 420 },
  },
} as const;

const CONSOLIDATION_COACH_MAX_ATTEMPTS = 2;
const CONSOLIDATION_COACH_TIMEOUT_MS = 25_000;
const STUDENT_ANALYSIS_ATTEMPTS = 2;
const STUDENT_ANALYSIS_ATTEMPT_TIMEOUT_MS = 12_000;

async function withStudentAnalysisDeadline<T>(operation: Promise<T>) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("L’analyse pédagogique a dépassé le délai de cette tentative.")), STUDENT_ANALYSIS_ATTEMPT_TIMEOUT_MS);
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

class ConsolidationCoachApiError extends Error {
  constructor(
    message: string,
    readonly kind: "timeout" | "network" | "http" | "invalid_response" | "configuration",
    readonly retryable: boolean,
    readonly status?: number,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ConsolidationCoachApiError";
  }
}

function consolidationCoachError(error: unknown) {
  if (error instanceof ConsolidationCoachApiError) return error;
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
    return new ConsolidationCoachApiError(error.message, "timeout", true);
  }
  if (error instanceof TypeError) return new ConsolidationCoachApiError(error.message, "network", true);
  return new ConsolidationCoachApiError(
    error instanceof Error ? error.message : "Erreur inconnue.",
    "invalid_response",
    false,
  );
}

function waitBeforeRetry(attempt: number) {
  return new Promise((resolve) => setTimeout(resolve, 400 * attempt));
}

function openAIOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { output?: unknown }).output)) throw new Error("Sortie API absente.");
  for (const item of (payload as { output: unknown[] }).output) {
    if (!item || typeof item !== "object" || !Array.isArray((item as { content?: unknown }).content)) continue;
    for (const content of (item as { content: unknown[] }).content) {
      if (content && typeof content === "object" && (content as { type?: unknown }).type === "output_text" && typeof (content as { text?: unknown }).text === "string") return (content as { text: string }).text;
    }
  }
  throw new Error("Texte API absent.");
}

function validIdentifier(value: unknown, maximumLength = 120): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximumLength && /^[a-z0-9]+(?:[-:][a-z0-9]+)*$/.test(value);
}

function validRequest(value: AnalysisRequest) {
  return validIdentifier(value.activityId) && validIdentifier(value.questionId)
    && Number.isInteger(value.attemptNumber) && value.attemptNumber >= 1 && value.attemptNumber <= 3
    && [0, 1, 2].includes(value.hintLevel)
    && typeof value.content === "string" && value.content.trim().length > 0 && value.content.length <= 10_000
    && validPriorTurn(value.priorTurn);
}

function validPriorTurn(value: AnalysisRequest["priorTurn"]) {
  if (value === undefined) return true;
  return ["satisfactory", "partially_satisfactory", "insufficient", "non_exploitable"].includes(value.pedagogicalOutcome)
    && [value.observedStrengths, value.missingElements].every((items) => Array.isArray(items) && items.length <= 4
      && items.every((item) => typeof item === "string" && item.length <= 500));
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
    const definition = createPedagogicalQuestionDefinition(question, learningSession.notionId, learningSession.notionTitle, learningSession.documentCatalog);
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
      priorTurn: request.priorTurn,
    };
    const analyzer = configuredAnalyzer();
    let candidate: unknown;
    if (process.env.SOCRATO_PEDAGOGICAL_ANALYZER === "openai") {
      let lastError: unknown;
      for (let attempt = 1; attempt <= STUDENT_ANALYSIS_ATTEMPTS; attempt += 1) {
        try {
          candidate = await withStudentAnalysisDeadline(analyzer.analyze(response, definition));
          lastError = undefined;
          break;
        } catch (error) {
          lastError = error;
          if (attempt < STUDENT_ANALYSIS_ATTEMPTS) await waitBeforeRetry(attempt);
        }
      }
      if (lastError) throw lastError;
    } else {
      candidate = await analyzer.analyze(response, definition);
    }
    const analysis = validateStructuredAnalysis(discardUnknownPedagogicalIds(candidate, definition), definition);
    return { ok: true as const, analysis };
  } catch {
    return { ok: false as const, error: "Socrato a réessayé automatiquement, mais l’analyse reste indisponible. Ta réponse est conservée : tu peux réessayer ou continuer sans évaluation." };
  }
}

export async function analyzeAuthorizedConsolidationCoachTurn(request: ConsolidationCoachRequest) {
  if (!validIdentifier(request.activityId) || !validIdentifier(request.questionId)
    || ![0, 1, 2].includes(request.step) || typeof request.operationLabel !== "string" || request.operationLabel.length > 120
    || typeof request.content !== "string" || !request.content.trim() || request.content.length > 1_000) {
    return { ok: false as const, error: "Le message de consolidation est invalide." };
  }
  const token = (await cookies()).get(STUDENT_SESSION_COOKIE)?.value;
  const studentSession = token ? await getStudentAccessRuntime().sessions.findActiveByToken(token) : null;
  if (!studentSession) return { ok: false as const, error: "La session élève n’est plus valide." };
  try {
    if (process.env.SOCRATO_PEDAGOGICAL_ANALYZER !== "openai") {
      throw new ConsolidationCoachApiError("Analyse API inactive.", "configuration", false);
    }
    const learningSession = await new DatabaseStudentLearningSessionProvider().getForAnonymousStudent(studentSession.anonymousStudentId, request.activityId);
    const question = learningSession?.questions.find(({ id }) => id === request.questionId);
    if (!learningSession || !question) return { ok: false as const, error: "Cette question n’appartient pas à l’activité assignée." };
    const definition = createPedagogicalQuestionDefinition(
      question,
      learningSession.notionId,
      learningSession.notionTitle,
      learningSession.documentCatalog,
    );
    const relevantMonographPassages = selectRelevantMonographPassages(definition);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new ConsolidationCoachApiError("Clé API absente.", "configuration", false);
    // Une quantité compte seulement lorsqu’elle appartient à l’action demandée.
    // « À l’aide des deux tableaux » décrit les sources, pas deux réponses à fournir.
    const hasExplicitQuantity = /\b(?:nomme|indique|identifie|donne|formule|présente|cite)\b[^.?!]{0,100}\b(?:un|une|deux|trois|quatre|cinq|six|1|2|3|4|5|6)\b/iu.test(question.prompt);
    const startsWithInterrogative = /^\s*(?:quel|quelle|quels|quelles)\b/iu.test(question.prompt);
    const coachingQuestion = request.step === 0
      ? startsWithInterrogative
        ? "Qu’est-ce que la question demande de trouver ou d’identifier?"
        : "Quel est le verbe d’action de la consigne?"
      : request.step === 1
        ? hasExplicitQuantity
          ? "Combien d’éléments distincts la consigne demande-t-elle de traiter?"
          : "Quels faits, éléments ou situations de la consigne faut-il traiter ou mettre en relation?"
        : "Comment la consigne demande-t-elle d’appuyer, de relier ou de présenter ces éléments?";
    for (let attempt = 1; attempt <= CONSOLIDATION_COACH_MAX_ATTEMPTS; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONSOLIDATION_COACH_TIMEOUT_MS);
      try {
        const apiResponse = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
          model: process.env.SOCRATO_CONSOLIDATION_COACH_MODEL ?? "gpt-5.6-luna",
          store: false,
          instructions: "Tu guides un élève dans une activité de consolidation en histoire. Évalue uniquement sa réponse à la petite question stratégique, pas sa réponse historique finale. Les passages de la monographie servent de référence historique pour vérifier et orienter ton accompagnement. Ne les cite pas et ne révèle jamais les faits historiques attendus à la place de l’élève. Accepte les synonymes et les formulations brèves. Règle absolue : confirme seulement l’information que l’élève vient lui-même de donner; ne révèle jamais dans ta confirmation la réponse à l’étape suivante. Pose exactement une seule question à la fois. Si la réponse est fausse, incomplète ou hors sujet, accepted=false et pose un nouvel indice sous forme de question sans donner la réponse. Si elle est juste, accepted=true : à step=0, si startsWithInterrogative=true, confirme seulement ce que la question demande de trouver ou d’identifier; sinon, confirme seulement le verbe d’action. Si hasExplicitQuantity=true, demande uniquement combien d’éléments sont exigés; sinon, demande uniquement quels faits, éléments ou situations doivent être traités ou mis en relation, sans inventer de nombre. À step=1, confirme seulement la structure trouvée, puis pose une question portant uniquement sur la façon dont la consigne exige d’appuyer, de relier ou de présenter ces éléments. À step=2, confirme la stratégie complète et invite l’élève à rédiger sa réponse historique, sans ajouter de nouvelle question. Ne nomme jamais toi-même un nombre, une partie de consigne ou une exigence que l’élève n’a pas encore formulé. Réponds en français, chaleureusement, en 70 mots maximum.",
          input: JSON.stringify({
            questionPrompt: question.prompt,
            intellectualOperation: request.operationLabel,
            coachingStep: request.step,
            coachingQuestion,
            hasExplicitQuantity,
            startsWithInterrogative,
            studentMessage: request.content,
            relevantMonographPassages,
          }),
          text: { format: { type: "json_schema", name: "socrato_consolidation_coach", strict: true, schema: CONSOLIDATION_COACH_SCHEMA } },
          }),
          signal: controller.signal,
        });
        const requestId = apiResponse.headers.get("x-request-id") ?? undefined;
        if (!apiResponse.ok) {
          const retryable = apiResponse.status === 408 || apiResponse.status === 409 || apiResponse.status === 429 || apiResponse.status >= 500;
          throw new ConsolidationCoachApiError(`Échec API ${apiResponse.status}.`, "http", retryable, apiResponse.status, requestId);
        }
        let candidate: { accepted?: unknown; feedback?: unknown };
        try {
          candidate = JSON.parse(openAIOutputText(await apiResponse.json())) as typeof candidate;
        } catch (error) {
          throw new ConsolidationCoachApiError(
            error instanceof Error ? error.message : "Réponse API illisible.",
            "invalid_response",
            true,
            apiResponse.status,
            requestId,
          );
        }
        if (typeof candidate.accepted !== "boolean" || typeof candidate.feedback !== "string" || !candidate.feedback.trim()) {
          throw new ConsolidationCoachApiError("Réponse API invalide.", "invalid_response", true, apiResponse.status, requestId);
        }
        return { ok: true as const, accepted: candidate.accepted, feedback: candidate.feedback.trim() };
      } catch (error) {
        const diagnosed = consolidationCoachError(error);
        if (!diagnosed.retryable || attempt === CONSOLIDATION_COACH_MAX_ATTEMPTS) throw diagnosed;
        await waitBeforeRetry(attempt);
      } finally {
        clearTimeout(timeoutId);
      }
    }
    throw new ConsolidationCoachApiError("Nombre maximal de tentatives atteint.", "network", false);
  } catch {
    return { ok: false as const, error: "Socrato ne peut pas guider cette étape pour le moment. Réessaie dans un instant." };
  }
}
