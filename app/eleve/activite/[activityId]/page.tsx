import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStudentAccessRuntime, STUDENT_SESSION_COOKIE } from "@/lib/student-access/local-runtime";
import { loadAuthorizedStudentLearningSession } from "@/lib/student-learning-session/access";
import { LocalDemoStudentLearningSessionProvider } from "@/lib/student-learning-session/demo-provider";
import { DatabaseStudentLearningSessionProvider } from "@/lib/student-learning-session/database-provider";
import { StudentLearningSessionView } from "./session-view";
import type { ConsolidationStrategyKey } from "@/lib/student-dashboard/selection";
import type { StudentLearningSessionData } from "@/lib/student-learning-session/types";
import "./session.css";

export default async function StudentLearningSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ activityId: string }>;
  searchParams: Promise<{ notion?: string; mode?: string; consolidation?: string; operation?: string; knowledge?: string; strategy?: ConsolidationStrategyKey; advice?: string }>;
}) {
  const [{ activityId }, { notion, mode, consolidation, operation, knowledge, strategy, advice }, cookieStore] = await Promise.all([
    params,
    searchParams,
    cookies(),
  ]);
  const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;

  let data: StudentLearningSessionData | null;
  try {
    data = await loadAuthorizedStudentLearningSession(
      token,
      getStudentAccessRuntime().sessions,
      process.env.DATABASE_URL ? new DatabaseStudentLearningSessionProvider() : new LocalDemoStudentLearningSessionProvider(),
      activityId,
      notion,
      mode,
    );
  } catch {
    redirect("/eleve");
  }

  if (!data) redirect("/eleve");
  const isConsolidation = consolidation === "1";
  if (isConsolidation) {
    const sessionQuestions = data.questions;
    const runtime = data.progress && (data.progress.schemaVersion === 2 || data.progress.schemaVersion === 3) ? data.progress.questionRuntime : [];
    const difficultyQuestionIds = new Set(runtime.filter(({ lastAnalysis, attemptNumber, hintLevel, instructionOmissionObserved }) =>
      Boolean(lastAnalysis) && (lastAnalysis?.pedagogicalOutcome !== "satisfactory" || attemptNumber > 1 || hintLevel > 0 || instructionOmissionObserved),
    ).map(({ questionId }) => questionId));
    const candidates = sessionQuestions.filter((question) => (!operation || question.intellectualOperations.some(({ id }) => id === operation))
      && (!knowledge || question.historicalKnowledgeIds.includes(knowledge)));
    const matchesRequestedTarget = (item: (typeof runtime)[number]) => {
      const question = sessionQuestions.find(({ id }) => id === item.questionId);
      return Boolean(question
        && (!operation || question.intellectualOperations.some(({ id }) => id === operation))
        && (!knowledge || question.historicalKnowledgeIds.includes(knowledge)));
    };
    const matchesStrategy = (item: (typeof runtime)[number]) => {
      const question = sessionQuestions.find(({ id }) => id === item.questionId);
      const analysis = item.lastAnalysis;
      const difficulties = [...(item.observedDifficulties ?? []), ...(analysis?.missingElements ?? [])].join(" ");
      if (!question || !analysis) return false;
      if (strategy === "decompose-instruction") return Boolean(item.instructionOmissionObserved);
      if (strategy === "source-context") return /auteur|point de vue|position|intention|contexte|qui parle|opinion|jugement/iu.test(difficulties);
      if (strategy === "cross-documents") {
        const required = question.requiredDocumentIds ?? question.documentRelations.map(({ documentId }) => documentId);
        return required.length >= 2 && required.some((id) => !analysis.usedDocumentIds.includes(id));
      }
      if (strategy === "evidence") return [analysis.documentUse, analysis.justificationQuality].some((level) => level === "partial" || level === "not_demonstrated");
      if (strategy === "comparison") return /difference|similar|compar/iu.test(question.primaryOperationId);
      if (strategy === "causality") return /cause|consequence|causal/iu.test(question.primaryOperationId);
      if (strategy === "date-event") return /time|space|chronolog/iu.test(question.primaryOperationId);
      if (strategy === "data-association") return /population.+dette|dette.+population|mise en commun des dettes/iu.test(question.prompt);
      return false;
    };
    const strategyRuntime = runtime.find((item) => matchesRequestedTarget(item) && matchesStrategy(item))
      ?? runtime.find(matchesStrategy);
    const strategyQuestion = strategyRuntime ? sessionQuestions.find(({ id }) => id === strategyRuntime.questionId) : undefined;
    const alternate = strategyQuestion
      ?? candidates.find(({ id }) => difficultyQuestionIds.has(id))
      ?? sessionQuestions.find(({ id }) => difficultyQuestionIds.has(id))
      ?? candidates[0] ?? sessionQuestions[0];
    if (alternate) {
      const officialOperationLabel = alternate.intellectualOperations.find(({ id }) => id === (operation ?? alternate.primaryOperationId))?.label;
      const strategyLabel = officialOperationLabel
        ?? (strategy === "decompose-instruction" ? "Décomposer la consigne"
        : strategy === "cross-documents" ? "Croiser plusieurs documents"
        : strategy === "source-context" ? "Identifier le point de vue et le contexte"
        : strategy === "evidence" ? "Prélever et expliquer une preuve"
        : strategy === "comparison" ? "Comparer avec méthode"
        : strategy === "causality" ? "Construire une chaîne causale"
        : strategy === "date-event" ? "Associer chaque date à son événement"
        : strategy === "data-association" ? "Associer les données à la bonne colonie"
        : undefined);
      data = {
        ...data,
        id: `${data.id}-consolidation`,
        activityTitle: `Consolidation${strategyLabel ? ` — ${strategyLabel}` : ""} — ${data.activityTitle}`,
        consolidationStrategyLabel: strategyLabel,
        consolidationStrategyAdvice: typeof advice === "string" && advice.trim().length > 0 && advice.length <= 600 ? advice.trim() : undefined,
        consolidationContext: strategy && strategyLabel ? { parentActivityId: activityId, strategyKey: strategy, strategyLabel, targetOperationId: operation ?? alternate.primaryOperationId, source: "socrato_proposed" } : undefined,
        currentQuestionIndex: 0,
        progress: undefined,
        questions: [{ ...alternate, number: 1 }],
      };
    }
  }
  return <StudentLearningSessionView data={data} persistProgress={!isConsolidation} />;
}
