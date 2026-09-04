"use client";

import Image from "next/image";
import Link from "next/link";
import { DragEvent as ReactDragEvent, FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { ThemeToggle } from "../../tableau-de-bord/theme-toggle";
import { StudentLogoutButton } from "../../logout-button";
import { saveConsolidationOutcomeToDatabase, saveStudentOutcomeToDatabase, saveStudentProgressToDatabase } from "../progress-actions";
import { analyzeAuthorizedConsolidationCoachTurn, analyzeAuthorizedStudentResponse } from "../analysis-actions";
import { personalizeCompletedStudentSummary } from "../summary-actions";
import { analyzeTeacherTestResponse } from "@/app/teacher/api-test/actions";
import { CausesConsequencesLearningAnalyzer } from "@/lib/pedagogical-session-engine/causes-consequences-learning-analyzer";
import { CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID } from "@/lib/teacher-activity-creator/intellectual-operation-learning";
import { createStudentProgressContract, restoreStudentProgress } from "@/lib/student-progress";
import { createConfiguredDataRepository } from "@/lib/data-repository";
import { createDemoPedagogicalDefinition, createPedagogicalFeedback, createPedagogicalSession, finalizePedagogicalSession, LocalDeterministicResponseAnalyzer, MAX_EXPLICIT_HINT_LEVEL, MAX_PEDAGOGICAL_ATTEMPTS, pedagogicalQuestionAttemptLimit, requestNextHint, skipQuestionAfterAnalysisUnavailable, submitStudentResponse, type PedagogicalSessionState, type ResponseAnalyzer } from "@/lib/pedagogical-session-engine";
import { getHistoricalPeriodLabel } from "@/lib/student-dashboard/historical-period";
import { getCurrentLearningQuestion, getInitialQuestionDocument, getLearningSessionHeading, getQuestionDocuments } from "@/lib/student-learning-session/presentation";
import type { LearningSessionDocument, LearningSessionMessage, LearningSessionQuestion, StudentLearningSessionData } from "@/lib/student-learning-session/types";
import { appendVoiceTranscript, createBrowserVoiceAdapter, formatRecordingDuration, isLocalVoicePrototypeEnabled, LocalVoiceCaptureController, VOICE_MAX_SECONDS, type VoiceCaptureState } from "@/lib/student-voice-transcription";

// Le serveur interrompt son analyse avant cette limite; l’élève récupère ainsi
// toujours sa réponse et peut réessayer sans perdre une tentative.
const RESPONSE_ANALYSIS_TIMEOUT_MS = 45_000;

async function withResponseAnalysisTimeout<T>(operation: Promise<T>) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Socrato met trop de temps à répondre. Ta réponse a été conservée; tu peux réessayer.")), RESPONSE_ANALYSIS_TIMEOUT_MS);
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function revealNewestConversationMessage(region: HTMLDivElement, message: HTMLElement) {
  const regionTop = region.getBoundingClientRect().top;
  const messageTop = message.getBoundingClientRect().top;
  const targetTop = Math.max(0, region.scrollTop + messageTop - regionTop - 16);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  region.scrollTo({ top: targetTop, behavior: reducedMotion ? "auto" : "smooth" });
}

function consolidationOpeningMessage(label: string, advice: string) {
  const definition = label === "Comparer avec méthode"
    ? "Comparer consiste à examiner deux éléments avec un même critère, puis à nommer précisément leur différence ou leur similitude."
    : label === "Dégager des différences et des similitudes"
      ? "Dégager des différences et des similitudes consiste à comparer deux éléments avec un même critère, puis à nommer précisément ce qui les oppose ou les rapproche."
    : label === "Construire une chaîne causale"
      ? "Établir un lien de causalité consiste à expliquer comment un premier fait entraîne ou favorise le suivant."
      : label === "Établir des liens de causalité"
        ? "Établir des liens de causalité consiste à nommer une cause, à expliquer le mécanisme qui relie les faits, puis à formuler la conséquence qui en découle."
      : label === "Déterminer des causes et des conséquences"
        ? "Déterminer des causes et des conséquences consiste à distinguer ce qui explique une réalité historique de ce qui en découle."
        : label === "Déterminer des changements et des continuités"
          ? "Déterminer un changement ou une continuité consiste à comparer deux moments avec un même aspect et un repère de temps précis."
          : label === "Mettre en relation des faits"
            ? "Mettre en relation des faits consiste à associer chaque fait à la manifestation ou à la description qui lui correspond grâce à un indice distinctif."
      : label === "Associer chaque date à son événement"
        ? "Situer dans le temps consiste à associer chaque événement à un repère exact et à vérifier leur ordre chronologique."
        : label === "Situer dans le temps et dans l’espace"
          ? "Situer dans le temps et dans l’espace consiste à ordonner ou localiser les faits avec des repères temporels ou géographiques exacts."
        : label === "Établir des faits"
          ? "Établir des faits consiste à sélectionner un fait historique exact et pertinent qui répond directement à la question."
          : "L’opération intellectuelle demande d’organiser des faits historiques et d’expliquer clairement la relation attendue par la consigne.";
  return `Nous allons consolider l’opération « ${label} ». ${definition} Dans l’activité précédente, cette démarche a nécessité plusieurs essais. Voici le processus à appliquer : 1) repère l’action demandée; 2) relève les faits pertinents; 3) organise-les selon la relation attendue; 4) formule cette relation clairement; 5) vérifie que ta réponse réalise bien l’opération. Pour cette première pratique guidée : ${advice}`;
}

function defaultConsolidationAdvice(label: string, prompt: string) {
  if (label === "Établir des faits" && /nomme\s+deux|deux\s+(?:raisons|faits|éléments)/iu.test(prompt)) {
    return "Dans cette question, tu dois nommer deux raisons distinctes. Commence par repérer le verbe « nomme » et le nombre « deux ». Cherche ensuite deux faits historiques différents qui répondent directement à la consigne. Avant d’envoyer ta réponse, vérifie que tu as bien formulé deux raisons, et non une seule raison expliquée de deux façons.";
  }
  if (label === "Établir des faits") {
    return "Repère le verbe de la consigne et tous les éléments demandés. Sélectionne ensuite des faits historiques exacts et distincts, puis vérifie un à un qu’ils répondent directement à la question.";
  }
  return "Lis d’abord toute la consigne, repère l’action demandée et les éléments à traiter, puis organise les faits nécessaires avant de rédiger. Vérifie enfin que chaque partie de ta réponse accomplit bien l’opération intellectuelle annoncée.";
}

function consolidationCoachOpening(label: string, prompt: string) {
  const startsWithInterrogative = /^\s*(?:quel|quelle|quels|quelles)\b/iu.test(prompt);
  const firstQuestion = startsWithInterrogative
    ? "qu’est-ce que la question te demande de trouver ou d’identifier?"
    : "quel est son verbe d’action?";
  return `Nous allons travailler l’opération « ${label} » étape par étape. Lis bien la question : ${firstQuestion}`;
}

function consolidationCoachLabel(question: LearningSessionQuestion | undefined, fallback: string) {
  return question?.intellectualOperations.find(({ id }) => id === question.primaryOperationId)?.label ?? fallback;
}

export function StudentLearningSessionView({ data, teacherPreview = false, classroomMode = false, persistProgress = true, teacherApiTest = false, teacherPreviewExitHref = "/teacher/activities/new" }: { data: StudentLearningSessionData; teacherPreview?: boolean; classroomMode?: boolean; persistProgress?: boolean; teacherApiTest?: boolean; teacherPreviewExitHref?: string }) {
  const engineDefinition = useMemo(() => createDemoPedagogicalDefinition(data), [data]);
  const initialEngineState = useMemo(() => restoreStudentProgress(createPedagogicalSession(engineDefinition), data.progress), [data.progress, engineDefinition]);
  const analyzer = useMemo<ResponseAnalyzer>(() => data.questions.some(({ id }) => id === CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID)
    ? new CausesConsequencesLearningAnalyzer()
    : teacherApiTest ? {
    async analyze(response) {
      const result = await analyzeTeacherTestResponse({
        notionId: data.notionId,
        questionId: response.questionId,
        attemptNumber: response.attemptNumber,
        content: response.content,
        priorTurn: response.priorTurn,
      });
      if (!result.ok) {
        console.error("[classroom-analysis]", result.error);
        throw new Error(result.error);
      }
      return result.analysis;
    },
  } : data.source === "server" ? {
    async analyze(response) {
      const result = await analyzeAuthorizedStudentResponse({
        activityId: data.consolidationContext?.parentActivityId ?? response.activityId,
        questionId: response.questionId,
        attemptNumber: response.attemptNumber,
        hintLevel: response.hintLevel,
        content: response.content,
        priorTurn: response.priorTurn,
      });
      if (!result.ok) throw new Error(result.error);
      return result.analysis;
    },
  } : process.env.NODE_ENV === "production" ? {
    async analyze() {
      throw new Error("L’analyse locale de démonstration n’est pas disponible en production.");
    },
  } : new LocalDeterministicResponseAnalyzer(), [data.consolidationContext?.parentActivityId, data.source, teacherApiTest]);
  const [engineState, setEngineState] = useState(initialEngineState);
  const [progressReady, setProgressReady] = useState(!persistProgress || data.source === "server");
  const [persistenceMessage, setPersistenceMessage] = useState("");
  const [analysisUnavailable, setAnalysisUnavailable] = useState(false);
  const activeData = { ...data, currentQuestionIndex: engineState.currentQuestionIndex };
  const question = getCurrentLearningQuestion(activeData);
  const isInteractiveTimeline = question?.type === "interactive_timeline";
  const isInteractiveAssociation = question?.type === "interactive_association";
  const isInteractiveCausalChain = question?.type === "interactive_causal_chain";
  const isMultipleChoice = question?.type === "multiple_choice";
  const [timelineCompleted, setTimelineCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [choiceFeedback, setChoiceFeedback] = useState<string | null>(null);
  const [pendingNextState, setPendingNextState] = useState<PedagogicalSessionState | null>(null);
  const [finalFeedbackDelivered, setFinalFeedbackDelivered] = useState(() => Boolean(initialEngineState.summary));
  const completedQuestions = engineState.questionStates.filter(({ status }) => status === "completed").length;
  const progressCompletedQuestions = Math.min(data.questions.length, Math.max(completedQuestions, engineState.currentQuestionIndex + (timelineCompleted ? 1 : 0)));
  const progress = {
    current: Math.min(engineState.currentQuestionIndex + 1, data.questions.length),
    total: data.questions.length,
    percent: Math.round((progressCompletedQuestions / data.questions.length) * 100),
  };
  const heading = getLearningSessionHeading(data);
  const primaryOperation = question?.intellectualOperations.find(({ id }) => id === question.primaryOperationId);
  const initialDocumentId = getInitialQuestionDocument(activeData)?.id ?? null;
  const [messages, setMessages] = useState<LearningSessionMessage[]>(() => {
    const index = initialEngineState.currentQuestionIndex;
    const initial = data.consolidationStrategyLabel
      ? [{ id: "socrato-consolidation-strategy", author: "socrato" as const, content: consolidationCoachOpening(consolidationCoachLabel(data.questions[index], data.consolidationStrategyLabel), data.questions[index]?.prompt ?? "") }]
      : data.questions[index]?.initialMessages ?? [];
    const runtime = initialEngineState.questionStates[index];
    const definition = engineDefinition.questions[index];
    if (!runtime?.lastAnalysis || !definition) return initial;
    const feedback = createPedagogicalFeedback(runtime.lastAnalysis, definition, runtime.nonExploitableCount);
    return [
      ...initial,
      { id: `student-restored-${runtime.questionId}`, author: "student", content: "Ta réponse précédente a été enregistrée." },
      { id: `socrato-restored-${runtime.questionId}`, author: "socrato", content: feedback.studentFacingText },
    ];
  });
  const [consolidationCoachStep, setConsolidationCoachStep] = useState<number | null>(data.consolidationStrategyLabel ? 0 : null);
  const [response, setResponse] = useState("");
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const activeQuestionState = engineState.questionStates[engineState.currentQuestionIndex];
  const activeQuestionDefinition = engineDefinition.questions[engineState.currentQuestionIndex];
  const activeAttemptLimit = activeQuestionDefinition ? pedagogicalQuestionAttemptLimit(activeQuestionDefinition) : MAX_PEDAGOGICAL_ATTEMPTS;
  const maximumHelpReceived = activeQuestionState.hintLevel >= MAX_EXPLICIT_HINT_LEVEL;
  const responseInputRef = useRef<HTMLTextAreaElement>(null);
  const submissionLockRef = useRef(false);
  const pendingSubmissionRef = useRef<{ id: string; questionId: string; questionIndex: number; content: string } | null>(null);
  const restoreResponseFocusRef = useRef(false);
  const messagesRegionRef = useRef<HTMLDivElement>(null);
  const newestMessageRef = useRef<HTMLElement>(null);
  const choiceFeedbackRef = useRef<HTMLElement>(null);
  const renderedMessageCountRef = useRef(messages.length);
  const voiceControllerRef = useRef<LocalVoiceCaptureController | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceCaptureState>({
    status: isLocalVoicePrototypeEnabled() ? "idle" : "unsupported",
    elapsedSeconds: 0,
    remainingSeconds: VOICE_MAX_SECONDS,
    warningReached: false,
    message: isLocalVoicePrototypeEnabled() ? "Dictée prête." : "La dictée est désactivée dans cet environnement.",
  });

  useEffect(() => {
    if (!choiceFeedback) return;
    const frame = window.requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      choiceFeedbackRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [choiceFeedback]);

  useEffect(() => {
    if (!persistProgress || data.source === "server") return;
    let active = true;
    void createConfiguredDataRepository(window.localStorage).listStudentProgress().then((records) => {
      if (!active) return;
      setEngineState((current) => {
        const restored = restoreStudentProgress(current, records[current.activityId]);
        if (restored.currentQuestionIndex !== current.currentQuestionIndex) setMessages(data.questions[restored.currentQuestionIndex]?.initialMessages ?? []);
        if (restored.summary) setFinalFeedbackDelivered(true);
        return restored;
      });
    }).catch(() => { if (active) setPersistenceMessage("Ta progression n’a pas pu être chargée. Tu peux continuer et réessayer plus tard."); }).finally(() => { if (active) setProgressReady(true); });
    return () => { active = false; };
  }, [data.questions, data.source, persistProgress]);

  useEffect(() => {
    if (!persistProgress || !progressReady) return;
    const progressContract = createStudentProgressContract(engineState);
    void (async () => {
      if (data.source === "server") {
        const result = await saveStudentProgressToDatabase(progressContract);
        if (!result.ok) throw new Error(result.error);
      } else {
        await createConfiguredDataRepository(window.localStorage).saveStudentProgress(progressContract);
      }
    })().catch(() => setPersistenceMessage("Ta progression n’a pas pu être enregistrée. Vérifie ta connexion, puis réessaie."));
  }, [data.source, engineState, persistProgress, progressReady]);

  useEffect(() => {
    if (messages.length <= renderedMessageCountRef.current) {
      renderedMessageCountRef.current = messages.length;
      return;
    }
    renderedMessageCountRef.current = messages.length;
    const region = messagesRegionRef.current;
    const newestMessage = newestMessageRef.current;
    if (region && newestMessage) revealNewestConversationMessage(region, newestMessage);
  }, [messages]);

  useEffect(() => {
    if (!submitting && restoreResponseFocusRef.current) {
      restoreResponseFocusRef.current = false;
      responseInputRef.current?.focus();
    }
  }, [submitting]);

  useEffect(() => {
    const controller = new LocalVoiceCaptureController(createBrowserVoiceAdapter(), {
      onState: setVoiceState,
      onSimulatedTranscript: (text) => {
        setResponse((current) => appendVoiceTranscript(current, text));
        requestAnimationFrame(() => responseInputRef.current?.focus());
      },
    });
    voiceControllerRef.current = controller;
    return () => {
      controller.dispose();
      voiceControllerRef.current = null;
    };
  }, []);

  if (!question) return null;

  async function sendLocalResponse() {
    const content = response.trim();
    if (!content || submitting || submissionLockRef.current || voiceBlocksSending || engineState.status === "completed" || (activeAttemptLimit !== null && activeQuestionState.attemptNumber >= activeAttemptLimit)) return;
    if (consolidationCoachStep !== null && consolidationCoachStep < 3 && data.consolidationStrategyLabel && data.consolidationContext) {
      const activeCoachLabel = consolidationCoachLabel(question, data.consolidationStrategyLabel);
      const studentMessage = { id: `student-coach-${messages.length}`, author: "student" as const, content };
      setMessages((current) => [...current, studentMessage]);
      setResponse("");
      setSubmitting(true);
      submissionLockRef.current = true;
      try {
        const coaching = await analyzeAuthorizedConsolidationCoachTurn({
          activityId: data.consolidationContext.parentActivityId,
          questionId: question.id,
          operationLabel: activeCoachLabel,
          step: consolidationCoachStep as 0 | 1 | 2,
          content,
        });
        if (!coaching.ok) throw new Error(coaching.error);
        setMessages((current) => [...current, { id: `socrato-coach-${current.length}`, author: "socrato", content: coaching.feedback }]);
        if (coaching.accepted) setConsolidationCoachStep((current) => current === null ? null : Math.min(3, current + 1));
      } catch (error) {
        setMessages((current) => [...current, { id: `socrato-coach-error-${current.length}`, author: "socrato", content: error instanceof Error ? error.message : "Socrato ne peut pas guider cette étape pour le moment." }]);
      } finally {
        submissionLockRef.current = false;
        setSubmitting(false);
        restoreResponseFocusRef.current = true;
      }
      return;
    }
    const pendingSubmission = pendingSubmissionRef.current?.questionId === activeQuestionState.questionId
      && pendingSubmissionRef.current.questionIndex === engineState.currentQuestionIndex
      && pendingSubmissionRef.current.content === content
      ? pendingSubmissionRef.current
      : { id: crypto.randomUUID(), questionId: activeQuestionState.questionId, questionIndex: engineState.currentQuestionIndex, content };
    pendingSubmissionRef.current = pendingSubmission;
    const optimisticMessageId = `student-${pendingSubmission.id}`;
    submissionLockRef.current = true;
    restoreResponseFocusRef.current = true;
    setSubmitting(true);
    setAnalysisUnavailable(false);
    setPersistenceMessage("");
    setMessages((current) => current.some(({ id }) => id === optimisticMessageId)
      ? current
      : [...current, { id: optimisticMessageId, author: "student", content }]);
    setResponse("");
    try {
      let consolidationPersistenceError = "";
      const transition = await withResponseAnalysisTimeout(submitStudentResponse(engineDefinition, engineState, content, analyzer));
      let nextState = transition.state;
      if (transition.feedback?.technicalNotice
        && nextState.questionStates[engineState.currentQuestionIndex]?.attemptNumber === activeQuestionState.attemptNumber) {
        const outageFeedback = transition.feedback.studentFacingText;
        setMessages((current) => [
          ...current,
          { id: `socrato-analysis-unavailable-${current.length}`, author: "socrato", content: outageFeedback },
        ]);
        setResponse(content);
        setAnalysisUnavailable(true);
        return;
      }
      if (transition.sessionCompleted) {
        nextState = await finalizePedagogicalSession(nextState);
        if (data.source === "server" && nextState.summary) {
          const personalized = await personalizeCompletedStudentSummary(nextState.summary);
          nextState = { ...nextState, summary: personalized.summary };
        }
        if (data.source === "server" && data.consolidationContext && data.consolidationContext.source !== "teacher_assigned") {
          const result = [...nextState.questionStates].reverse().find(({ result }) => Boolean(result))?.result;
          const saved = await saveConsolidationOutcomeToDatabase({
            activityId: data.consolidationContext.parentActivityId,
            strategyKey: data.consolidationContext.strategyKey,
            strategyLabel: data.consolidationContext.strategyLabel,
            targetOperationId: data.consolidationContext.targetOperationId,
            successful: Boolean(result && result.status !== "to_work_on"),
            attemptNumber: result?.attemptNumber ?? activeQuestionState.attemptNumber + 1,
            completedAt: nextState.summary?.completedAt ?? new Date().toISOString(),
            observation: result?.observedStrengths.find((entry) => entry.trim().length > 20),
            source: data.consolidationContext.source,
          });
          if (!saved.ok) consolidationPersistenceError = saved.error;
        }
      }
      let progressAlreadySaved = false;
      if (persistProgress && data.source === "server") {
        const result = await saveStudentProgressToDatabase(createStudentProgressContract(nextState), {
          submissionId: pendingSubmission.id,
          expectedQuestionId: activeQuestionState.questionId,
          expectedCurrentQuestionIndex: engineState.currentQuestionIndex,
        });
        if (!result.ok) throw new Error(result.error);
        progressAlreadySaved = true;
      }
      if (transition.sessionCompleted && persistProgress && nextState.summary) await persistCompletedSession(nextState, progressAlreadySaved);
      if (transition.sessionCompleted && data.source === "server" && data.consolidationContext?.source === "teacher_assigned") {
        const result = [...nextState.questionStates].reverse().find(({ result }) => Boolean(result))?.result;
        const saved = await saveConsolidationOutcomeToDatabase({
          activityId: data.consolidationContext.parentActivityId,
          strategyKey: data.consolidationContext.strategyKey,
          strategyLabel: data.consolidationContext.strategyLabel,
          targetOperationId: data.consolidationContext.targetOperationId,
          successful: Boolean(result && result.status !== "to_work_on"),
          attemptNumber: result?.attemptNumber ?? activeQuestionState.attemptNumber + 1,
          completedAt: nextState.summary?.completedAt ?? new Date().toISOString(),
          observation: result?.observedStrengths.find((entry) => entry.trim().length > 20),
          source: "teacher_assigned",
        });
        if (!saved.ok) consolidationPersistenceError = saved.error;
      }
      if (nextState.currentQuestionIndex !== engineState.currentQuestionIndex) {
        setPendingNextState(nextState);
        setEngineState({ ...nextState, status: "active", currentQuestionIndex: engineState.currentQuestionIndex });
        setTimelineCompleted(true);
      } else {
        setEngineState(nextState);
      }
      if (transition.feedback) {
        const feedback = transition.feedback;
        const conversationFeedback = transition.hint
          ? `${feedback.studentFacingText} ${transition.hint.text}`
          : feedback.studentFacingText;
        setMessages((current) => current.at(-1)?.author === "socrato" && current.at(-1)?.content === conversationFeedback ? current : [...current, {
          id: `socrato-${current.length}`,
          author: "socrato",
          content: conversationFeedback,
        }]);
        if (transition.sessionCompleted) setFinalFeedbackDelivered(true);
      }
      setPersistenceMessage(consolidationPersistenceError);
      setAnalysisUnavailable(false);
      pendingSubmissionRef.current = null;
    } catch (error) {
      setMessages((current) => current.filter(({ id }) => id !== optimisticMessageId));
      setResponse(content);
      setPersistenceMessage(error instanceof Error ? error.message : "Ta réponse n’a pas pu être enregistrée. Réessaie.");
    } finally {
      submissionLockRef.current = false;
      setSubmitting(false);
    }
  }

  async function continueWithoutEvaluation() {
    if (submitting || !analysisUnavailable) return;
    setSubmitting(true);
    try {
      const transition = skipQuestionAfterAnalysisUnavailable(engineDefinition, engineState);
      let nextState = transition.state;
      if (transition.sessionCompleted) {
        nextState = await finalizePedagogicalSession(nextState);
        if (data.source === "server" && nextState.summary) {
          const personalized = await personalizeCompletedStudentSummary(nextState.summary);
          nextState = { ...nextState, summary: personalized.summary };
        }
      }
      if (persistProgress && data.source === "server") {
        const saved = await saveStudentProgressToDatabase(createStudentProgressContract(nextState));
        if (!saved.ok) throw new Error(saved.error);
      }
      if (transition.sessionCompleted && persistProgress && nextState.summary) await persistCompletedSession(nextState, true);
      if (nextState.currentQuestionIndex !== engineState.currentQuestionIndex) {
        setPendingNextState(nextState);
        setEngineState({ ...nextState, status: "active", currentQuestionIndex: engineState.currentQuestionIndex });
        setTimelineCompleted(true);
      } else {
        setEngineState(nextState);
      }
      setMessages((current) => [...current, { id: `socrato-degraded-${current.length}`, author: "socrato", content: transition.feedback?.studentFacingText ?? "Ta réponse est conservée sans évaluation." }]);
      if (transition.sessionCompleted) setFinalFeedbackDelivered(true);
      setResponse("");
      setPersistenceMessage("");
      setAnalysisUnavailable(false);
      pendingSubmissionRef.current = null;
    } catch (error) {
      setPersistenceMessage(error instanceof Error ? error.message : "Le passage en mode dégradé n’a pas pu être enregistré.");
    } finally {
      setSubmitting(false);
    }
  }

  function submitLocalResponse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendLocalResponse();
  }

  function handleResponseKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    void sendLocalResponse();
  }

  function obtainLocalHint() {
    if (engineState.status === "completed") return;
    const transition = requestNextHint(engineDefinition, engineState);
    setEngineState(transition.state);
    const hint = transition.hint;
    if (isMultipleChoice) {
      setCurrentHint(hint?.text ?? null);
    } else if (hint) {
      setMessages((current) => [...current, {
        id: `socrato-hint-${current.length}`,
        author: "socrato",
        content: `Voici un indice : ${hint.text}`,
      }]);
    }
  }

  function handleVoicePrimaryAction() {
    const controller = voiceControllerRef.current;
    if (!controller) return;
    if (voiceState.status === "recording") controller.stop();
    else void controller.start();
  }

  const voiceBusy = ["requesting_permission", "stopping", "transcribing"].includes(voiceState.status);
  const voiceUnavailable = voiceState.status === "unsupported" || engineState.status === "completed";
  const voicePrimaryLabel = voiceState.status === "requesting_permission" ? "Autorisation du microphone…"
    : voiceState.status === "stopping" ? "Arrêt de la dictée…"
    : voiceState.status === "transcribing" ? "Traitement de la dictée…"
    : voiceState.status === "permission_denied" || voiceState.status === "error" ? "Réessayer"
    : "Dicter ma réponse";
  const voiceBlocksSending = voiceState.status === "recording" || voiceBusy;
  const responseUnavailable = submitting || engineState.status === "completed" || (activeAttemptLimit !== null && activeQuestionState.attemptNumber >= activeAttemptLimit);
  const sendUnavailable = !response.trim() || responseUnavailable || voiceBlocksSending;
  const questionDocuments = getQuestionDocuments(activeData);
  const useStackedDocuments = questionDocuments.length > 0 && !isInteractiveTimeline && !isInteractiveAssociation;
  const isShortAnswerWithoutDocuments = question.format === "short-answer" && questionDocuments.length === 0;

  async function completeObjectiveQuestion(satisfactory: boolean, recordedAttemptNumber?: number) {
    const questionState = engineState.questionStates[engineState.currentQuestionIndex];
    if (!questionState || questionState.status === "completed") return;
    const completedAt = new Date().toISOString();
    const receivedHelp = Math.max(questionState.attemptNumber, recordedAttemptNumber ?? 0) > 1 || questionState.hintLevel > 0;
    const status = satisfactory ? receivedHelp ? "to_consolidate" as const : "mastered" as const : "to_work_on" as const;
    const result = {
      sessionId: questionState.sessionId,
      activityId: questionState.activityId,
      questionId: questionState.questionId,
      notionId: questionState.notionId,
      primaryOperationId: questionState.primaryOperationId,
      operationIds: [...questionState.operationIds],
      historicalKnowledgeIds: [...questionState.historicalKnowledgeIds],
      documentIds: [...questionState.documentIds],
      attemptNumber: Math.max(1, questionState.attemptNumber, recordedAttemptNumber ?? 0),
      hintLevel: questionState.hintLevel,
      status,
      advancedMastery: satisfactory && !receivedHelp,
      demonstratedKnowledgeIds: satisfactory ? [...questionState.historicalKnowledgeIds] : [],
      demonstratedOperationIds: satisfactory ? [...questionState.operationIds] : [],
      observedStrengths: satisfactory ? ["Tu as correctement mobilisé les connaissances et la démarche demandées."] : [],
      consolidationTargets: satisfactory ? [] : ["Revois les associations attendues avant de poursuivre."],
      questionPrompt: question.prompt,
      completedAt,
    };
    const questionStates = engineState.questionStates.with(engineState.currentQuestionIndex, { ...questionState, attemptNumber: result.attemptNumber, status: "completed" as const, result });
    const isLastQuestion = engineState.currentQuestionIndex === data.questions.length - 1;
    let nextState: PedagogicalSessionState = { ...engineState, status: isLastQuestion ? "completed" : "active", questionStates };
    if (isLastQuestion) {
      nextState = await finalizePedagogicalSession(nextState);
      if (data.source === "server" && nextState.summary) {
        const personalized = await personalizeCompletedStudentSummary(nextState.summary);
        nextState = { ...nextState, summary: personalized.summary };
      }
      if (persistProgress && nextState.summary) await persistCompletedSession(nextState);
      setFinalFeedbackDelivered(true);
    }
    setEngineState(nextState);
  }

  function recordObjectiveAttempt(attemptNumber: number) {
    setEngineState((current) => {
      const currentQuestion = current.questionStates[current.currentQuestionIndex];
      if (!currentQuestion || currentQuestion.status === "completed") return current;
      return {
        ...current,
        questionStates: current.questionStates.with(current.currentQuestionIndex, {
          ...currentQuestion,
          attemptNumber: Math.max(currentQuestion.attemptNumber, attemptNumber),
          status: "awaiting_response",
        }),
      };
    });
  }

  function recordObjectiveHint() {
    if (activeQuestionState.hintLevel >= MAX_EXPLICIT_HINT_LEVEL) return;
    setEngineState(requestNextHint(engineDefinition, engineState).state);
  }

  async function persistCompletedSession(state: PedagogicalSessionState, progressAlreadySaved = false) {
    if (!state.summary) return;
    try {
      if (data.source === "server") {
        if (!progressAlreadySaved) {
          const progressResult = await saveStudentProgressToDatabase(createStudentProgressContract(state));
          if (!progressResult.ok) throw new Error(progressResult.error);
        }
        const outcomeResult = await saveStudentOutcomeToDatabase(state.summary);
        if (!outcomeResult.ok) throw new Error(outcomeResult.error);
      } else {
        await createConfiguredDataRepository(window.localStorage).saveStudentOutcome(state.summary);
      }
    } catch {
      setPersistenceMessage("Ton bilan n’a pas pu être enregistré. Réessaie avant de quitter.");
    }
  }

  function moveToQuestion(direction: -1 | 1) {
    const nextIndex = Math.max(0, Math.min(data.questions.length - 1, engineState.currentQuestionIndex + direction));
    const nextQuestion = data.questions[nextIndex];
    if (!nextQuestion || nextIndex === engineState.currentQuestionIndex) return;
    setEngineState((current) => ({ ...current, status: "active", currentQuestionIndex: nextIndex }));
    setMessages(data.consolidationStrategyLabel && data.consolidationContext
      ? [{ id: `socrato-consolidation-strategy-${nextIndex}`, author: "socrato", content: consolidationCoachOpening(consolidationCoachLabel(nextQuestion, data.consolidationStrategyLabel), nextQuestion.prompt) }]
      : nextQuestion.initialMessages);
    setConsolidationCoachStep(data.consolidationStrategyLabel && data.consolidationContext ? 0 : null);
    setResponse("");
    setCurrentHint(null);
    setSelectedAnswer(null);
    setChoiceFeedback(null);
    setTimelineCompleted(false);
    setPendingNextState(null);
    setFinalFeedbackDelivered(false);
  }

  function continueAfterSocratoFeedback() {
    if (!pendingNextState) return;
    const nextQuestion = data.questions[pendingNextState.currentQuestionIndex];
    setEngineState(pendingNextState);
    if (nextQuestion) setMessages(data.consolidationStrategyLabel && data.consolidationContext
      ? [{ id: `socrato-consolidation-strategy-${pendingNextState.currentQuestionIndex}`, author: "socrato", content: consolidationCoachOpening(consolidationCoachLabel(nextQuestion, data.consolidationStrategyLabel), nextQuestion.prompt) }]
      : nextQuestion.initialMessages);
    setConsolidationCoachStep(data.consolidationStrategyLabel && data.consolidationContext ? 0 : null);
    setResponse("");
    setCurrentHint(null);
    setSelectedAnswer(null);
    setChoiceFeedback(null);
    setTimelineCompleted(false);
    setPendingNextState(null);
  }

  async function verifyMultipleChoiceAnswer() {
    const selectedOption = question.answerOptions?.find(({ label }) => label === selectedAnswer);
    const correct = Boolean(selectedOption?.correct);
    const nextAttempt = activeQuestionState.attemptNumber + 1;
    const exhausted = !correct && nextAttempt >= MAX_PEDAGOGICAL_ATTEMPTS;
    setChoiceFeedback(correct
      ? `Bonne réponse ! ${question.answerExplanation ?? "Cet ordre respecte la succession chronologique des événements."}`
      : exhausted
        ? "Tu as fait trois essais sérieux. Ce point reste à consolider et sera pris en compte dans ton bilan pour déterminer la prochaine étape la plus utile."
      : questionDocuments.length > 0
        ? "Pas tout à fait. Consulte les documents ou demande un indice, puis réessaie."
        : "Pas tout à fait. Demande un indice, puis réessaie.");
    if (correct) {
      setTimelineCompleted(true);
      await completeObjectiveQuestion(true, nextAttempt);
    } else if (exhausted) {
      setTimelineCompleted(true);
      await completeObjectiveQuestion(false, nextAttempt);
    } else {
      recordObjectiveAttempt(nextAttempt);
    }
  }

  function renderMultipleChoiceResponse(showWelcome = false) {
    return (
      <section ref={choiceFeedbackRef} className={`multiple-choice-response${showWelcome ? " multiple-choice-socrato-panel" : ""}`} aria-label="Validation du choix de réponse">
        {showWelcome ? <div className="multiple-choice-socrato-welcome"><article><strong>Socrato</strong><p>J’attends ta réponse…</p></article></div> : null}
        {choiceFeedback ? <div className={choiceFeedback.startsWith("Bonne") ? "choice-feedback-correct" : "choice-feedback-retry"} role="status"><strong>Socrato</strong><p>{choiceFeedback}</p>{activeQuestionState.status === "completed" && engineState.currentQuestionIndex < data.questions.length - 1 ? <button type="button" className="socrato-next-question" onClick={() => moveToQuestion(1)}>Passer à la question suivante →</button> : null}</div> : null}
      </section>
    );
  }

  function exitTeacherPreview() {
    window.close();
    window.setTimeout(() => {
      if (!window.closed) window.location.assign(teacherPreviewExitHref);
    }, 120);
  }

  return (
    <main className={`learning-session min-h-screen${teacherPreview ? " teacher-preview-session" : ""}${classroomMode ? " classroom-session" : ""}`}>
      {teacherPreview ? <nav className="teacher-preview-navigation" aria-label="Navigation du test enseignant"><strong>Mode test enseignant · aucune réponse enregistrée</strong><div><button type="button" disabled={engineState.currentQuestionIndex === 0} onClick={() => moveToQuestion(-1)}>← Question précédente</button><span>{progress.current === progress.total ? `Dernière question · ${progress.current} sur ${progress.total}` : `Question ${progress.current} sur ${progress.total}`}</span><button type="button" disabled={engineState.currentQuestionIndex >= data.questions.length - 1} onClick={() => moveToQuestion(1)}>Question suivante →</button><button type="button" className="teacher-preview-close" onClick={exitTeacherPreview}>Fermer l’aperçu</button></div></nav> : null}
      <header className="session-header">
        <div className="session-header-top">
          <Link href={data.dashboardHref} className="session-brand" aria-label="Retour au tableau de bord Socrato">
            <Image src="/logos/socrato-logo-blanc-recadre.png" alt="Logo Socrato" width={38} height={38} priority unoptimized />
            <span className="session-brand-copy">
              <span className="session-brand-name">SOCRATO</span>
              <span className="session-brand-signature">SÉANCE D’APPRENTISSAGE</span>
            </span>
          </Link>
          <div className="session-title-block">
            <h1>{heading.primaryTitle}</h1>
            {heading.contextualNotion ? <strong>{heading.contextualNotion}</strong> : null}
            <span>Période historique · {getHistoricalPeriodLabel(data.historicalPeriod)}</span>
          </div>
          <div className="session-header-actions"><ThemeToggle />{teacherPreview || classroomMode ? null : <StudentLogoutButton />}</div>
        </div>
        <div className="session-nav-row">
          <Link href={classroomMode ? "/teacher/activities/new?mode=classroom" : data.dashboardHref} className="session-back"><span aria-hidden="true">←</span> {classroomMode ? "Retour au créateur" : "Retour au tableau de bord"}</Link>
          {data.questions.length > 0 ? <section className="student-activity-progress" aria-label={`Question ${progress.current} sur ${progress.total}, progression ${progress.percent} %`}><span>{progress.current === progress.total ? `Dernière question · ${progress.current}/${progress.total}` : `Question ${progress.current}/${progress.total}`}</span><span className="student-activity-progress__track" aria-hidden="true"><span style={{ width: `${progress.percent}%` }} /></span><strong>{progress.percent}%</strong></section> : null}
        </div>
      </header>
      {persistenceMessage || analysisUnavailable ? <div className="session-data-error" role="alert">
        <p>{persistenceMessage || "Socrato discute à l’agora et ne peut pas analyser ta réponse pour le moment. Tu peux réessayer l’analyse ou continuer l’activité sans accompagnement pour cette question."}</p>
        {response.trim() ? <button type="button" className="socrato-next-question" disabled={submitting} onClick={() => void sendLocalResponse()}>Analyser ma réponse de nouveau</button> : null}
        {analysisUnavailable ? <button type="button" className="socrato-next-question" disabled={submitting} onClick={() => void continueWithoutEvaluation()}>Continuer cette question sans accompagnement</button> : null}
      </div> : null}

      <div className={`session-layout${isInteractiveTimeline || isInteractiveAssociation || isInteractiveCausalChain ? " session-layout--timeline" : ""}${isMultipleChoice && questionDocuments.length > 0 ? " session-layout--choice-with-documents" : ""}${questionDocuments.length === 0 && isMultipleChoice ? " session-layout--choice-no-documents" : ""}${isShortAnswerWithoutDocuments ? " session-layout--short-answer-no-documents" : ""}`}>
        {isInteractiveCausalChain && question.causalChainInteraction ? (
          <InteractiveCausalChainQuestion key={question.id} question={question} initialAttempts={activeQuestionState.attemptNumber} initialHintLevel={activeQuestionState.hintLevel} onAttempt={recordObjectiveAttempt} onHint={recordObjectiveHint} onComplete={(satisfactory, attemptNumber) => { setTimelineCompleted(true); void completeObjectiveQuestion(satisfactory, attemptNumber); }} />
        ) : isInteractiveTimeline && question.timelineInteraction ? (
          <InteractiveTimelineQuestion classroomMode={classroomMode} key={question.id} question={question} initialAttempts={activeQuestionState.attemptNumber} initialHintLevel={activeQuestionState.hintLevel} onAttempt={recordObjectiveAttempt} onHint={recordObjectiveHint} onComplete={(satisfactory, attemptNumber) => { setTimelineCompleted(true); void completeObjectiveQuestion(satisfactory, attemptNumber); }} />
        ) : isInteractiveAssociation && question.associationInteraction ? (
          <InteractiveAssociationQuestion key={question.id} question={question} initialAttempts={activeQuestionState.attemptNumber} initialHintLevel={activeQuestionState.hintLevel} onAttempt={recordObjectiveAttempt} onHint={recordObjectiveHint} onComplete={(satisfactory, attemptNumber) => { setTimelineCompleted(true); void completeObjectiveQuestion(satisfactory, attemptNumber); }} />
        ) : <>
        <div className="question-heading">
          <div className="question-heading-copy">
            <div className="question-heading-main">
              <h2 id="question-section-title" className="column-title question-number">Question {question.number}</h2>
              {primaryOperation ? <span className="operation-chip">{primaryOperation.label}</span> : null}
            </div>
            <span className="question-heading-accent" aria-hidden="true" />
          </div>
        </div>
        <section className="question-pane" aria-labelledby="question-section-title">
          <div className="question-module">
            <div className={`question-card${isShortAnswerWithoutDocuments ? " question-card--short-no-documents" : ""}`}>
              <div className="question-card-heading-row">
                <h3 id="question-title">{question.prompt}{!isMultipleChoice ? <span className="question-inline-hint">
                  <button type="button" className="hint-button hint-button-compact" aria-expanded={Boolean(currentHint)} onClick={obtainLocalHint} disabled={engineState.status === "completed" || maximumHelpReceived}>
                    <svg className="hint-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M9 18h6M10 21h4M8.2 14.5A7 7 0 1 1 15.8 14.5c-.9.7-1.3 1.4-1.3 2.5h-5c0-1.1-.4-1.8-1.3-2.5Z" />
                      <path d="M12 5.5v3M8.8 8.1l2.1 2.1M15.2 8.1l-2.1 2.1" />
                    </svg>
                      {maximumHelpReceived ? "Aide maximale reçue" : "Obtenir un indice"}
                  </button>
                </span> : null}</h3>
              </div>
              {isMultipleChoice && question.answerOptions ? (
                <div className="multiple-choice-options" role="radiogroup" aria-label="Choix de réponse">
                  {question.answerOptions.map((option) => (
                    <button key={option.label} type="button" role="radio" aria-checked={selectedAnswer === option.label} disabled={activeQuestionState.status === "completed"} onClick={() => { setSelectedAnswer(option.label); setChoiceFeedback(null); }}>
                      <strong>{option.label}</strong><span>{option.text}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              {isMultipleChoice ? <div className="multiple-choice-actions">
                <button type="button" className="hint-button hint-button-compact" aria-expanded={Boolean(currentHint)} onClick={obtainLocalHint} disabled={engineState.status === "completed" || maximumHelpReceived}>
                  <svg className="hint-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M9 18h6M10 21h4M8.2 14.5A7 7 0 1 1 15.8 14.5c-.9.7-1.3 1.4-1.3 2.5h-5c0-1.1-.4-1.8-1.3-2.5Z" />
                    <path d="M12 5.5v3M8.8 8.1l2.1 2.1M15.2 8.1l-2.1 2.1" />
                  </svg>
                  {maximumHelpReceived ? "Aide maximale reçue" : "Obtenir un indice"}
                </button>
                <button type="button" className="multiple-choice-check" disabled={!selectedAnswer || activeQuestionState.status === "completed"} onClick={() => void verifyMultipleChoiceAnswer()}>Vérifier ma réponse</button>
              </div> : null}
              {currentHint ? <p className="local-hint" role="status">{currentHint}</p> : null}
            </div>

            {isMultipleChoice ? (questionDocuments.length === 0 ? renderMultipleChoiceResponse(true) : choiceFeedback ? renderMultipleChoiceResponse() : null) : (
            <section className="conversation" aria-label="Conversation avec Socrato">
            <div ref={messagesRegionRef} className="message-list" aria-live="polite" aria-relevant="additions">
              {messages.map((message, index) => (
                <article ref={index === messages.length - 1 ? newestMessageRef : undefined} key={message.id} className={`message message-${message.author}`}>
                  <strong>{message.author === "student" ? "Toi" : "Socrato"}</strong>
                  <p>{message.content}</p>
                  {message.author === "socrato" && index === messages.length - 1 && pendingNextState ? <button type="button" className="socrato-next-question" onClick={continueAfterSocratoFeedback}>Passer à la question suivante →</button> : null}
                </article>
              ))}
              {submitting ? <p className="analysis-waiting-message" role="status">Socrato analyse ta réponse…</p> : null}
            </div>
            <form className="response-composer" onSubmit={submitLocalResponse}>
              <div className="response-composer-shell">
                <textarea ref={responseInputRef} id="student-response" aria-label="Réponse de l’élève" value={response} onChange={(event) => setResponse(event.target.value)} onKeyDown={handleResponseKeyDown} rows={2} placeholder="Écris ta réponse ici…" disabled={responseUnavailable} />
                <div className="composer-toolbar">
                <div className="voice-controls">
                  {voiceState.status === "recording" ? (
                    <>
                      <span className="voice-recording-state" role="status">
                        <span className="voice-recording-dot" aria-hidden="true" />
                        <span>Enregistrement en cours</span>
                        <time dateTime={`PT${voiceState.elapsedSeconds}S`}>{formatRecordingDuration(voiceState.elapsedSeconds)}</time>
                      </span>
                      <button type="button" className="voice-stop-button" onClick={handleVoicePrimaryAction} aria-pressed="true" aria-describedby="voice-status">
                        <svg className="voice-stop-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
                        <span>Arrêter</span>
                      </button>
                    </>
                  ) : voiceState.status === "stopping" || voiceState.status === "transcribing" ? (
                    <span className="voice-processing-state" role="status">{voicePrimaryLabel}</span>
                  ) : (
                    <button type="button" className="composer-icon-button voice-button" onClick={handleVoicePrimaryAction} disabled={voiceBusy || voiceUnavailable} aria-label={voicePrimaryLabel} title={voicePrimaryLabel} aria-describedby="voice-status">
                      <svg className="microphone-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <rect x="8" y="2.5" width="8" height="13" rx="4" />
                        <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M8.5 21.5h7" />
                      </svg>
                    </button>
                  )}
                  {voiceState.status === "recording" || voiceState.status === "requesting_permission" ? (
                    <button type="button" className="voice-cancel" onClick={() => voiceControllerRef.current?.cancel()}>Annuler</button>
                  ) : null}
                </div>
                <button type="submit" className="composer-icon-button submit-button" disabled={sendUnavailable} aria-label="Envoyer ma réponse" title="Envoyer ma réponse">
                  <svg className="submit-arrow-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" /></svg>
                </button>
                </div>
              </div>
              <p id="voice-status" className={`voice-status ${voiceState.status === "permission_denied" || voiceState.status === "error" || voiceState.status === "unsupported" ? "voice-status-visible" : ""}`} aria-live="polite" aria-atomic="true">{voiceState.message}</p>
            </form>
            </section>
            )}
          </div>
        </section>

        {questionDocuments.length === 0 ? null : <>
        {isMultipleChoice && questionDocuments.length === 0 ? null : <div className="documents-heading">
          {isMultipleChoice && questionDocuments.length === 0 ? null : <div className="documents-heading-copy"><h2 id="documents-title" className="column-title">Documents historiques</h2><span /></div>}
        </div>}
        <DocumentsPane key={question.id} documents={questionDocuments} initialDocumentId={initialDocumentId} stacked={useStackedDocuments} />
        </>}
        </>}
        {timelineCompleted && !pendingNextState && !isMultipleChoice && engineState.currentQuestionIndex < data.questions.length - 1 ? <div className="session-question-next"><button type="button" className="socrato-next-question" onClick={() => moveToQuestion(1)}>Passer à la question suivante →</button></div> : null}
        {engineState.summary && finalFeedbackDelivered ? <div className="session-completion-footer"><SessionCompletionLink href={`${data.dashboardHref.replace(/#.*$/, "")}${data.dashboardHref.includes("?") ? "&" : "?"}reveal=bilan#bilan`} strengths={engineState.summary.strengths} consolidationTargets={engineState.summary.consolidationTargets} teacherPreview={teacherPreview} /></div> : null}
      </div>
    </main>
  );
}

type TimelineInteraction = NonNullable<LearningSessionQuestion["timelineInteraction"]>;
type AssociationInteraction = NonNullable<LearningSessionQuestion["associationInteraction"]>;
type CausalChainInteraction = NonNullable<LearningSessionQuestion["causalChainInteraction"]>;

function SessionCompletionLink({ href, strengths, consolidationTargets, teacherPreview }: { href: string; strengths: string[]; consolidationTargets: string[]; teacherPreview: boolean }) {
  return <section className="local-session-summary" aria-label="Activité terminée"><h3><span aria-hidden="true">🌿</span> Ton bilan est prêt</h3><p>Bravo, tu as terminé l’activité. Voici le bilan de ton travail.</p>{teacherPreview ? <details className="preview-session-bilan"><summary>Consulter mon bilan</summary><div><h4>Points forts</h4>{strengths.length ? <ul>{strengths.map((strength) => <li key={strength}>{strength}</li>)}</ul> : <p>Les réponses attendues ont été mobilisées avec succès.</p>}<h4>Éléments à consolider</h4>{consolidationTargets.length ? <ul>{consolidationTargets.map((target) => <li key={target}>{target}</li>)}</ul> : <p>Aucun élément prioritaire à consolider.</p>}</div></details> : <Link href={href}>Consulter mon bilan</Link>}</section>;
}

type ObjectiveQuestionProps = {
  question: LearningSessionQuestion;
  initialAttempts: number;
  initialHintLevel: number;
  onAttempt: (attemptNumber: number) => void;
  onHint: () => void;
  onComplete: (satisfactory: boolean, attemptNumber: number) => void;
};

function normalizeShortAnswer(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, " ").replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function InteractiveCausalChainQuestion({ question, initialAttempts, initialHintLevel, onAttempt, onHint, onComplete }: ObjectiveQuestionProps) {
  const interaction = question.causalChainInteraction as CausalChainInteraction;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState(initialAttempts);
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(initialHintLevel > 0);
  const [feedback, setFeedback] = useState("Complète les six maillons de gauche à droite.");
  const [stepsToReview, setStepsToReview] = useState<string[]>([]);
  const answered = interaction.steps.filter(({ id }) => answers[id]?.trim()).length;

  function isCorrect(step: CausalChainInteraction["steps"][number]) {
    const answer = normalizeShortAnswer(answers[step.id] ?? "");
    if (step.id === "gr-chain-1849-law" && ((answer.includes("loi") && answer.includes("indemni")) || (answer.includes("indemni") && answer.includes("rebellion")))) return true;
    if (step.id === "gr-chain-instability" && answer.includes("instabilit") && (answer.includes("politique") || answer.includes("minister"))) return true;
    return step.acceptedAnswers.some((accepted) => { const expected = normalizeShortAnswer(accepted); return answer.includes(expected) || expected.includes(answer); });
  }

  function verify() {
    const correctCount = interaction.steps.filter(isCorrect).length;
    const nextAttempt = attempts + 1; setAttempts(nextAttempt); onAttempt(nextAttempt);
    if (correctCount === interaction.steps.length) { setStepsToReview([]); setCompleted(true); setFeedback("Bravo! Les six maillons forment la bonne chaîne de causalité."); onComplete(true, nextAttempt); return; }
    setStepsToReview(interaction.steps.filter((step) => !isCorrect(step)).map(({ id }) => id));
    if (nextAttempt >= 2) { setAnswers(Object.fromEntries(interaction.steps.map((step) => [step.id, step.expectedAnswer]))); setCompleted(true); setFeedback(`${correctCount} réponses sur ${interaction.steps.length} étaient correctes. Socrato affiche maintenant la chaîne attendue.`); onComplete(false, nextAttempt); return; }
    setFeedback(`${correctCount} réponse${correctCount > 1 ? "s" : ""} sur ${interaction.steps.length} ${correctCount > 1 ? "sont correctes" : "est correcte"}. Revois les maillons avant de vérifier une deuxième fois.`);
  }

  return <section className="causal-chain-question" aria-labelledby="causal-chain-title">
    <header className="timeline-question__header"><div><p>Gouvernement responsable · Politique</p><h2 id="causal-chain-title">{question.prompt}</h2><span>{answered} réponse{answered > 1 ? "s" : ""} sur {interaction.steps.length}</span></div><button type="button" aria-expanded={showHint} onClick={() => { if (!showHint) onHint(); setShowHint((value) => !value); }}>Obtenir un indice</button></header>
    {showHint ? <p className="timeline-question__hint" role="status">{question.localHint}</p> : null}
    <div className="causal-chain-track">{interaction.steps.map((step, index) => <div className="causal-chain-link" key={step.id}><article><span>{step.date}</span><h3>{step.prompt}</h3><label><span>{step.placeholder}</span><input value={answers[step.id] ?? ""} disabled={completed} onChange={(event) => setAnswers((current) => ({ ...current, [step.id]: event.target.value }))} placeholder="Écris ta réponse…" /></label></article>{index < interaction.steps.length - 1 ? <span className="causal-chain-arrow" aria-hidden="true">→</span> : null}</div>)}</div>
    {stepsToReview.length > 0 ? <aside className="causal-chain-socrato-help" role="status" aria-live="polite"><strong>Socrato</strong><p>Tu as déjà trouvé une partie de la chaîne. Reprends seulement les maillons suivants :</p><ul>{stepsToReview.map((stepId) => <li key={stepId}>{stepId === "gr-chain-1849-law" ? "Pour la loi de 1849, cherche les mots qui relient une indemnité aux Rébellions." : stepId === "gr-chain-instability" ? "Pour 1854–1864, nomme le problème politique créé par les changements fréquents de ministère." : stepId === "gr-chain-cause" ? "Demande-toi pourquoi un ministère perd l’appui nécessaire dans les deux sections." : `Relis le maillon « ${interaction.steps.find(({ id }) => id === stepId)?.prompt ?? "à corriger"} » et précise le fait historique demandé.`}</li>)}</ul><p>{completed ? "La chaîne attendue est maintenant affichée afin que tu puisses comparer chaque lien avec ta réponse." : "Tu peux corriger ces réponses, puis vérifier une deuxième fois."}</p></aside> : null}
    <footer className="timeline-question__footer"><p role="status" aria-live="polite"><strong>Socrato</strong>{feedback}</p><button type="button" disabled={answered !== interaction.steps.length || completed} onClick={verify}>{completed ? "Réponse vérifiée" : attempts ? "Vérifier ma deuxième tentative" : "Vérifier mes réponses"}</button></footer>
  </section>;
}

function InteractiveAssociationQuestion({ question, initialAttempts, initialHintLevel, onAttempt, onHint, onComplete }: ObjectiveQuestionProps) {
  const interaction = question.associationInteraction as AssociationInteraction;
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("Sélectionne une institution, puis choisis le rôle correspondant.");
  const [attempts, setAttempts] = useState(initialAttempts);
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(initialHintLevel > 0);
  const itemById = new Map(interaction.items.map((item) => [item.id, item]));
  const assignedItemIds = new Set(Object.values(assignments));

  function assign(targetId: string, itemId = selectedItemId) {
    if (!itemId || completed) return;
    setAssignments((current) => ({ ...Object.fromEntries(Object.entries(current).filter(([, value]) => value !== itemId)), [targetId]: itemId }));
    setSelectedItemId(null);
    setFeedback("Association placée. Continue jusqu’à ce que les cinq rôles soient complétés.");
  }
  function beginDrag(event: ReactDragEvent<HTMLElement>, itemId: string) { event.dataTransfer.setData("text/plain", itemId); setSelectedItemId(itemId); }
  function verify() {
    const correctCount = interaction.targets.filter((target) => assignments[target.id] === target.correctItemId).length;
    const nextAttempt = attempts + 1; setAttempts(nextAttempt); onAttempt(nextAttempt);
    if (correctCount === interaction.targets.length) { setCompleted(true); setFeedback("Bravo! Les cinq institutions sont associées à leur rôle principal."); onComplete(true, nextAttempt); return; }
    if (nextAttempt >= 2) { setAssignments(Object.fromEntries(interaction.targets.map((target) => [target.id, target.correctItemId]))); setCompleted(true); setFeedback(`${correctCount} réponse${correctCount > 1 ? "s" : ""} sur 5 étaient correctes. Socrato affiche maintenant les associations attendues.`); onComplete(false, nextAttempt); return; }
    setFeedback(`${correctCount} réponse${correctCount > 1 ? "s sont correctes" : " est correcte"} sur 5. Revois la distinction entre institutions élues, nommées et représentantes de la Couronne.`);
  }
  return <section className="association-question" aria-labelledby="association-question-title">
    <header className="timeline-question__header"><div><p>Question {question.number} · Association interactive</p><h2 id="association-question-title">{question.prompt}</h2></div><button type="button" aria-expanded={showHint} onClick={() => { if (!showHint) onHint(); setShowHint((value) => !value); }}>Obtenir un indice</button></header>
    {showHint ? <p className="timeline-question__hint" role="status">{question.localHint}</p> : null}
    <section className="association-pool" aria-labelledby="association-pool-title"><h3 id="association-pool-title">Institutions à associer</h3><div>{interaction.items.filter(({ id }) => !assignedItemIds.has(id)).map((item) => <button key={item.id} type="button" draggable={!completed} aria-pressed={selectedItemId === item.id} onDragStart={(event) => beginDrag(event, item.id)} onClick={() => setSelectedItemId(item.id)}>{item.label}</button>)}</div></section>
    <div className="association-targets">{interaction.targets.map((target, index) => { const item = itemById.get(assignments[target.id]); return <article key={target.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); assign(target.id, event.dataTransfer.getData("text/plain")); }}><span>{index + 1}</span><p>{target.description}</p>{item ? <button type="button" disabled={completed} onClick={() => setAssignments((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== target.id)))}>{item.label}<small>{completed ? "" : "Retirer"}</small></button> : <button type="button" disabled={!selectedItemId || completed} onClick={() => assign(target.id)}>{selectedItemId ? "Associer ici" : "Choisis une institution"}</button>}</article>; })}</div>
    <footer className="timeline-question__footer"><p role="status" aria-live="polite"><strong>Socrato</strong>{feedback}</p><button type="button" disabled={Object.keys(assignments).length !== interaction.targets.length || completed} onClick={verify}>{completed ? "Réponse vérifiée" : attempts ? "Vérifier ma deuxième tentative" : "Vérifier mes réponses"}</button></footer>
  </section>;
}

function timelineImagePosition(entryId: string) {
  const focalPoints: Record<string, string> = {
    "timeline-entry-1": "center 78%",
    "timeline-entry-2": "center 29%",
    "timeline-entry-5": "center 72%",
    "timeline-entry-6": "center 24%",
    "responsible-timeline-entry-3": "center 18%",
    "responsible-timeline-entry-4": "center 20%",
  };

  return focalPoints[entryId] ?? "center center";
}

function TimelineEntryVisual({ entry, width, height }: { entry: TimelineInteraction["entries"][number]; width: number; height: number }) {
  const sources = entry.imageUrls?.length ? entry.imageUrls : [entry.imageUrl];
  if (sources.length === 1) return <Image src={sources[0]} alt={entry.imageAlt} width={width} height={height} unoptimized style={{ objectPosition: timelineImagePosition(entry.id) }} />;
  return <div className="timeline-entry-image-pair" role="img" aria-label={entry.imageAlt}>{sources.map((source) => <Image key={source} src={source} alt="" width={Math.round(width / sources.length)} height={height} unoptimized />)}</div>;
}

function InteractiveTimelineQuestion({ question, initialAttempts, initialHintLevel, onAttempt, onHint, onComplete, classroomMode = false }: ObjectiveQuestionProps & { classroomMode?: boolean }) {
  const interaction = question.timelineInteraction as TimelineInteraction;
  const shuffledEntries = useMemo(() => {
    const order = interaction.entries.length === 7 ? [2, 6, 0, 4, 1, 5, 3] : [2, 5, 0, 4, 1, 3];
    return order.flatMap((index) => interaction.entries[index] ? [interaction.entries[index]] : []);
  }, [interaction.entries]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [feedback, setFeedback] = useState("Sélectionne une carte, puis choisis sa date.");
  const [showHint, setShowHint] = useState(initialHintLevel > 0);
  const [completed, setCompleted] = useState(false);

  const assignedEntryIds = new Set(Object.values(assignments));
  const entryById = new Map(interaction.entries.map((entry) => [entry.id, entry]));
  const placedCount = Object.keys(assignments).length;

  function assignSelectedTo(date: string) {
    if (!selectedEntryId || completed) return;
    setAssignments((current) => {
      const withoutSelected = Object.fromEntries(Object.entries(current).filter(([, entryId]) => entryId !== selectedEntryId));
      return { ...withoutSelected, [date]: selectedEntryId };
    });
    setSelectedEntryId(null);
    setFeedback(`Carte placée. Continue jusqu’à ce que les ${interaction.dates.length} dates soient complétées.`);
  }

  function beginDrag(event: ReactDragEvent<HTMLElement>, entryId: string) {
    if (completed) return;
    event.dataTransfer.setData("text/plain", entryId);
    event.dataTransfer.effectAllowed = "move";
    setSelectedEntryId(entryId);
  }

  function dropOnDate(event: ReactDragEvent<HTMLDivElement>, date: string) {
    event.preventDefault();
    const entryId = event.dataTransfer.getData("text/plain");
    if (!entryId || completed) return;
    setSelectedEntryId(entryId);
    setAssignments((current) => {
      const withoutDragged = Object.fromEntries(Object.entries(current).filter(([, currentEntryId]) => currentEntryId !== entryId));
      return { ...withoutDragged, [date]: entryId };
    });
    setFeedback(`Carte placée. Continue jusqu’à ce que les ${interaction.dates.length} dates soient complétées.`);
  }

  function verifyTimeline() {
    if (placedCount !== interaction.dates.length || completed) return;
    const correctCount = interaction.dates.filter((date) => entryById.get(assignments[date])?.date === date).length;
    const nextAttempt = attempts + 1;
    setAttempts(nextAttempt);
    onAttempt(nextAttempt);
    if (correctCount === interaction.dates.length) {
      setCompleted(true);
      setFeedback(`Bravo! Les ${interaction.dates.length} événements sont placés dans le bon ordre chronologique.`);
      onComplete(true, nextAttempt);
      return;
    }
    if (nextAttempt >= 2) {
      setAssignments(Object.fromEntries(interaction.entries.map((entry) => [entry.date, entry.id])));
      setCompleted(true);
      setFeedback(`${correctCount} réponse${correctCount > 1 ? "s" : ""} sur ${interaction.dates.length} étaient correctes. Socrato affiche maintenant l’ordre attendu pour te permettre de le revoir.`);
      onComplete(false, nextAttempt);
      return;
    }
    setFeedback(`${correctCount} réponse${correctCount > 1 ? "s sont correctes" : " est correcte"} sur ${interaction.dates.length}. ${question.localHint}`);
  }

  function revealTimelineAnswer() {
    setAssignments(Object.fromEntries(interaction.entries.map((entry) => [entry.date, entry.id])));
    setCompleted(true);
    setFeedback(`Voici la réponse attendue. Les ${interaction.dates.length} événements sont maintenant placés dans le bon ordre chronologique.`);
  }

  return <section className="timeline-question" aria-labelledby="timeline-question-title">
    <header className="timeline-question__header"><div><p>Question {question.number} · Document chronologique interactif</p><h2 id="timeline-question-title">{question.prompt}</h2><span>{question.instruction}</span></div><button type="button" aria-expanded={showHint} onClick={() => { if (!showHint) onHint(); setShowHint((current) => !current); }}>Obtenir un indice</button></header>
    {showHint ? <p className="timeline-question__hint" role="status">{question.localHint}</p> : null}
    <div className="timeline-question__dates" aria-label="Dates de la ligne du temps">{interaction.dates.map((date) => {
      const entry = entryById.get(assignments[date]);
      return <div key={date} className={`timeline-date-slot${entry ? " is-filled" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropOnDate(event, date)}>
        <strong>{date}</strong><span className="timeline-date-marker" aria-hidden="true" />
        {entry ? <article className="timeline-placed-card" draggable={!completed} onDragStart={(event) => beginDrag(event, entry.id)}><TimelineEntryVisual entry={entry} width={360} height={150} /><div className="timeline-placed-card__content"><h3>{entry.title}</h3>{!completed ? <button type="button" onClick={() => setAssignments((current) => Object.fromEntries(Object.entries(current).filter(([slotDate]) => slotDate !== date)))}>Retirer</button> : null}</div></article> : <button type="button" className="timeline-empty-slot" disabled={!selectedEntryId || completed} onClick={() => assignSelectedTo(date)}>{selectedEntryId ? `Placer ici sous ${date}` : "Choisis d’abord une carte"}</button>}
      </div>;
    })}</div>
    <section className="timeline-card-pool" aria-labelledby="timeline-cards-title"><header><div><h2 id="timeline-cards-title">Cartes à placer</h2><p>{interaction.entries.length - assignedEntryIds.size} restante{interaction.entries.length - assignedEntryIds.size > 1 ? "s" : ""}</p></div><span>Sélectionne ou fais glisser une carte</span></header><div>{shuffledEntries.filter(({ id }) => !assignedEntryIds.has(id)).map((entry) => <button key={entry.id} type="button" draggable={!completed} aria-pressed={selectedEntryId === entry.id} onDragStart={(event) => beginDrag(event, entry.id)} onClick={() => setSelectedEntryId(entry.id)}><TimelineEntryVisual entry={entry} width={320} height={190} /><span><strong>{entry.title}</strong><small>{entry.description}</small></span></button>)}</div></section>
    <footer className="timeline-question__footer"><p role="status" aria-live="polite"><strong>Socrato</strong>{feedback}</p><div className="timeline-question__actions">{classroomMode && !completed ? <button type="button" className="timeline-reveal-answer" onClick={revealTimelineAnswer}>Afficher la réponse</button> : null}<button type="button" disabled={placedCount !== interaction.dates.length || completed} onClick={verifyTimeline}>{completed ? "Réponse vérifiée" : attempts === 0 ? "Vérifier mes réponses" : "Vérifier ma deuxième tentative"}</button></div></footer>
  </section>;
}

type OrderedDocument = LearningSessionDocument & { displayOrder: number };

function DocumentsPane({ documents, initialDocumentId, stacked = false }: { documents: OrderedDocument[]; initialDocumentId: string | null; stacked?: boolean }) {
  const [selectedId, setSelectedId] = useState(initialDocumentId);
  const [consultedIds, setConsultedIds] = useState(() => new Set(initialDocumentId ? [initialDocumentId] : []));
  const [expanded, setExpanded] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const thumbnailRefs = useRef(new Map<string, HTMLButtonElement>());
  const stackedListRef = useRef<HTMLDivElement>(null);
  const selected = documents.find(({ id }) => id === selectedId) ?? documents[0];

  useEffect(() => {
    const list = stackedListRef.current;
    if (!stacked || !list) return;
    let animationFrame = 0;
    const fitDocuments = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const quotes = Array.from(list.querySelectorAll<HTMLQuoteElement>(".document-content-compact blockquote"));
        if (quotes.length) {
          const availableHeights = quotes.map((quote) => quote.clientHeight);
          quotes.forEach((quote) => {
            quote.style.flex = "none";
            quote.style.height = "auto";
          });
          let minimum = 10;
          let maximum = 40;
          for (let iteration = 0; iteration < 9; iteration += 1) {
            const candidate = (minimum + maximum) / 2;
            quotes.forEach((quote) => { quote.style.fontSize = `${candidate}px`; });
            const allFit = quotes.every((quote, index) => quote.scrollHeight <= availableHeights[index] + 1);
            if (allFit) minimum = candidate;
            else maximum = candidate;
          }
          const sharedFontSize = `${Math.floor(minimum * 2) / 2}px`;
          quotes.forEach((quote) => {
            quote.style.fontSize = sharedFontSize;
            quote.style.flex = "1 1 auto";
            quote.style.height = "";
          });
        }

        list.querySelectorAll<HTMLElement>(".document-content-compact .student-political-structure").forEach((diagram) => {
          const group = diagram.closest<HTMLElement>(".document-content-group");
          const heading = group?.querySelector<HTMLElement>("h3");
          const identification = group?.querySelector<HTMLElement>(".document-identification");
          if (!group) return;
          diagram.style.setProperty("zoom", "1");
          const availableHeight = group.clientHeight - (heading?.offsetHeight ?? 0) - (identification?.offsetHeight ?? 0) - 8;
          const scale = Math.min(1, Math.max(0.35, availableHeight / diagram.scrollHeight));
          diagram.style.setProperty("zoom", scale.toFixed(3));
        });
      });
    };
    fitDocuments();
    const observer = new ResizeObserver(fitDocuments);
    observer.observe(list);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [documents, stacked]);

  useEffect(() => {
    if (!expanded) return;
    closeButtonRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        const scrollPosition = window.scrollY;
        setExpanded(false);
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollPosition, behavior: "auto" });
          thumbnailRefs.current.get(selected?.id ?? "")?.focus();
        });
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [expanded, selected?.id]);

  function closeExpandedDocument() {
    const scrollPosition = window.scrollY;
    setExpanded(false);
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPosition, behavior: "auto" });
      thumbnailRefs.current.get(selected?.id ?? "")?.focus();
    });
  }

  function selectDocument(documentId: string) {
    const scrollPosition = window.scrollY;
    setSelectedId(documentId);
    setConsultedIds((current) => new Set(current).add(documentId));
    requestAnimationFrame(() => window.scrollTo({ top: scrollPosition, behavior: "auto" }));
  }

  function expandStackedDocument(documentId: string) {
    setSelectedId(documentId);
    setConsultedIds((current) => new Set(current).add(documentId));
    setExpanded(true);
  }

  return (
    <aside className="documents-pane" aria-labelledby="documents-title">
      <div className="documents-module">
        {!selected ? (
          <div className="documents-empty" role="status">
            <span className="documents-empty-icon" aria-hidden="true">◇</span>
            <h3>Aucun document requis</h3>
            <p>Cette question ne nécessite aucun document historique. Appuie-toi sur tes connaissances pour formuler ta réponse.</p>
          </div>
        ) : (
          <>
          <div className={`document-system-card${stacked ? " document-system-card--stacked" : ""}`}>
            {stacked ? <div ref={stackedListRef} className="stacked-document-list" style={{ gridTemplateRows: `repeat(${documents.length}, minmax(0, 1fr))` }}>{documents.map((document) => <article className="stacked-document" key={document.id}>
              <DocumentContent document={document} compact onExpand={() => expandStackedDocument(document.id)} />
            </article>)}</div> : <>
            <article className="document-preview">
              <DocumentContent document={selected} onExpand={() => setExpanded(true)} />
            </article>
            <div className="document-separator" aria-hidden="true" />
            <div className="document-navigation" aria-label="Navigation entre les documents">
            <div className="document-navigation-status" aria-live="polite">{consultedIds.size} sur {documents.length} {consultedIds.size === 1 ? "consulté" : "consultés"}</div>
            <div className="document-thumbnails" role="group" aria-label="Choisir un document">
              {documents.map((document) => (
                <button
                  key={document.id}
                  ref={(element) => { if (element) thumbnailRefs.current.set(document.id, element); }}
                  type="button"
                  aria-pressed={document.id === selected?.id}
                  aria-label={`Ouvrir le document ${document.displayOrder}, ${getNeutralDocumentType(document).toLocaleLowerCase("fr")}${consultedIds.has(document.id) ? ", consulté" : ""}`}
                  onClick={() => selectDocument(document.id)}
                >
                  <DocumentThumbnailPreview document={document} />
                  <strong>Document {document.displayOrder}</strong>
                  <span>{getNeutralDocumentType(document)}</span>
                  {consultedIds.has(document.id) ? <em aria-hidden="true">✓ Consulté</em> : null}
                </button>
              ))}
            </div>
            </div>
            </>}
          </div>
          {expanded ? (
            <div className="document-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeExpandedDocument(); }}>
              <section className="document-modal" role="dialog" aria-modal="true" aria-labelledby="expanded-document-title">
                <button ref={closeButtonRef} type="button" className="close-document" onClick={closeExpandedDocument} aria-label="Fermer la vue agrandie">×</button>
                <DocumentContent document={selected} expanded />
              </section>
            </div>
          ) : null}
          </>
        )}
      </div>
    </aside>
  );
}

function getNeutralDocumentType(document: OrderedDocument) {
  return document.content.kind === "population_table" || document.content.kind === "comparison_table" ? "Tableau statistique" : document.typeLabel;
}

function DocumentThumbnailPreview({ document }: { document: OrderedDocument }) {
  if (document.content.kind === "historical_image") {
    return <Image className="document-thumbnail-image" src={document.content.localSrc} alt={`Aperçu du document ${document.displayOrder} : ${document.content.alt}`} width={180} height={92} unoptimized />;
  }
  if (document.content.kind === "population_table") {
    return (
      <div className="document-thumbnail-table" aria-hidden="true">
        <table><tbody>{document.content.rows.map((row) => <tr key={row.region}><th>{row.region}</th><td>{row.population}</td><td>{row.representatives}</td></tr>)}</tbody></table>
      </div>
    );
  }
  if (document.content.kind === "comparison_table") {
    return <div className="document-thumbnail-table" aria-hidden="true"><table><tbody>{document.content.rows.slice(0, 3).map((row) => <tr key={row.label}><th>{row.label}</th><td>{row.value}</td></tr>)}</tbody></table></div>;
  }
  if (document.content.kind === "historical_timeline") {
    return <div className="document-thumbnail-timeline" aria-hidden="true">{document.content.entries.map((entry) => <span key={entry.date}>{entry.date}</span>)}</div>;
  }
  if (document.content.kind === "political_structure_diagram") {
    return document.content.period === "gouvernement-responsable"
      ? <div className="document-thumbnail-diagram" aria-hidden="true"><span>Couronne → Gouverneur</span><i>↓</i><span>Ministère ⇄ Assemblée</span><i>↑</i><span>Électeurs</span></div>
      : <div className="document-thumbnail-diagram" aria-hidden="true"><span>Couronne</span><i>↓</i><span>Gouverneur</span><i>↓</i><span>Conseils · Assemblée</span></div>;
  }
  return <blockquote className="document-thumbnail-quote" aria-hidden="true">« {document.content.excerpt} »</blockquote>;
}

function DocumentContent({ document, expanded = false, compact = false, onExpand }: { document: OrderedDocument; expanded?: boolean; compact?: boolean; onExpand?: () => void }) {
  const identification = document.content.kind === "population_table" || document.content.kind === "comparison_table"
    ? [document.sourceLabel, document.dateLabel].filter(Boolean).join(" · ")
    : [document.authorLabel ?? document.institutionLabel ?? document.sourceLabel, document.dateLabel].filter(Boolean).join(" · ");
  const compactTextLength = compact && document.content.kind === "historical_excerpt" ? document.content.excerpt.length : 0;
  const compactDensity = !compact ? "" : compactTextLength <= 300 ? " document-content-compact--short" : compactTextLength <= 430 ? " document-content-compact--medium" : " document-content-compact--long";

  return (
    <div className={`document-content${expanded ? " document-content-expanded" : ""}${compact ? " document-content-compact" : ""}${compactDensity}`}>
      <div className={`document-content-group document-content-group-${document.content.kind === "historical_image" ? "visual" : "textual"}`}>
        <h3 id={expanded ? "expanded-document-title" : undefined}>
          <strong>Document {document.displayOrder}</strong>
          <span aria-hidden="true"> · </span>
          <small>{getNeutralDocumentType(document)}</small>
        </h3>
        {document.content.kind === "population_table" ? (
          <div className="population-table-wrap">
            <table>
              <caption>Population et représentation des deux Canadas</caption>
              <thead><tr><th scope="col">Section</th><th scope="col">Population</th><th scope="col">Représentation</th></tr></thead>
              <tbody>{document.content.rows.map((row) => <tr key={row.region}><th scope="row">{row.region}</th><td>{row.population}</td><td>{row.representatives}</td></tr>)}</tbody>
            </table>
          </div>
        ) : document.content.kind === "comparison_table" ? (
          <div className="population-table-wrap">
            <table>
              <caption>{document.content.caption}</caption>
              <thead><tr>{document.content.headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
              <tbody>{document.content.rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value}</td></tr>)}</tbody>
            </table>
          </div>
        ) : document.content.kind === "historical_timeline" ? (
          <div className="historical-timeline-document">
            {document.content.entries.map((entry) => <article key={entry.date}>
              <strong>{entry.date}</strong>
              <Image src={entry.imageUrl} alt={entry.imageAlt} width={420} height={250} unoptimized />
              <small>{entry.phase}</small>
              <h4>{entry.title}</h4>
              <p>{entry.description}</p>
              <cite>{entry.credit}</cite>
            </article>)}
          </div>
        ) : document.content.kind === "political_structure_diagram" && document.content.period === "gouvernement-responsable" ? (
          <div className="student-political-structure responsible-government-structure responsible-government-1848" role="img" aria-label="Schéma du gouvernement responsable de 1848 : la Couronne agit par le gouvernement britannique; le gouvernement britannique recommande la nomination du gouverneur; le gouverneur nomme les conseils; le Conseil exécutif conseille le gouverneur et doit conserver la confiance de l’Assemblée; le Conseil législatif et l’Assemblée adoptent les lois; les électeurs du Haut-Canada et du Bas-Canada élisent chacun 42 députés.">
            <div className="ps-node rg-crown"><small>Autorité impériale</small><strong>Couronne britannique</strong></div>
            <div className="rg-link">agit par l’intermédiaire du ↓</div>
            <div className="ps-node rg-british-government"><strong>Gouvernement britannique</strong></div>
            <div className="rg-link">recommande la nomination du ↓</div>
            <div className="ps-node ps-governor rg-governor"><small>Représentant de la Couronne</small><strong>Gouverneur général</strong><span>Sanctionne les lois</span></div>
            <div className="rg-two-links"><span><b>nomme le Conseil exécutif ↓</b><em>reçoit ses conseils ↑</em></span><span><b>nomme le Conseil législatif ↓</b><em>reçoit les projets de loi adoptés ↑</em></span></div>
            <div className="rg-councils"><div className="ps-node ps-ministry"><small>Pouvoir exécutif responsable</small><strong>Conseil exécutif</strong><span>Dirige les affaires intérieures</span></div><div className="ps-node rg-legislative-council"><small>Chambre nommée</small><strong>Conseil législatif</strong><span>Étudie les projets de loi</span></div></div>
            <div className="rg-two-links rg-assembly-links"><span><b>doit conserver la confiance de ↓</b><em>l’Assemblée accorde ou retire sa confiance ↑</em></span><span><b>adopte les lois avec ↓</b><em>l’Assemblée débat et vote les projets ↑</em></span></div>
            <div className="ps-node ps-assembly rg-assembly"><small>Chambre élue</small><strong>Assemblée législative · 84 députés</strong><span>Vote les lois, les taxes et les crédits</span></div>
            <div className="rg-two-links rg-election-links"><span>élit 42 députés ↑</span><span>élit 42 députés ↑</span></div>
            <div className="rg-populations"><div className="ps-node ps-voters"><strong>Population électorale du Haut-Canada</strong></div><div className="ps-node ps-voters"><strong>Population électorale du Bas-Canada</strong></div></div>
            <div className="responsible-loss"><strong>Si le Conseil exécutif perd la confiance de l’Assemblée</strong><span>Il démissionne ou demande la dissolution du Parlement et la tenue d’élections.</span></div>
          </div>
        ) : document.content.kind === "political_structure_diagram" ? (
          <div className="student-political-structure" role="img" aria-label="Schéma de la structure politique de l’Acte d’Union : la Couronne nomme le gouverneur; le gouverneur nomme les conseils; les électeurs élisent une Assemblée commune de 84 députés.">
            <div className="ps-node ps-crown"><small>Autorité impériale</small><strong>Couronne et Parlement britannique</strong><span>Adoptent l’Acte d’Union</span></div><div className="ps-arrow">nomme ↓</div>
            <div className="ps-node ps-governor"><small>Pouvoir exécutif</small><strong>Gouverneur général</strong><span>Nomme les conseils · sanctionne ou réserve les lois</span></div><div className="ps-arrow">nomme les membres et consulte ↓</div>
            <div className="ps-councils"><div className="ps-node"><small>Nommé</small><strong>Conseil exécutif</strong><span>Conseille le gouverneur et administre</span></div><div className="ps-node"><small>Nommé</small><strong>Conseil législatif</strong><span>Étudie et adopte les projets de loi</span></div></div>
            <div className="ps-council-links"><span><b>Le Conseil propose des mesures ↓</b><em>L’Assemblée vote les lois et les crédits ↑</em></span><span><b>Le Conseil étudie et adopte les projets ↓</b><em>L’Assemblée débat, vote et transmet les projets ↑</em></span></div><div className="ps-node ps-assembly"><small>Élue</small><strong>Assemblée législative · 84 députés</strong><span>Débat, vote les lois et les taxes</span><div><b>Canada-Ouest · 42</b><b>Canada-Est · 42</b></div></div><div className="ps-arrow">élisent ↑</div>
            <div className="ps-node ps-voters"><strong>Électeurs admissibles</strong></div>
          </div>
        ) : document.content.kind === "historical_image" ? (
          <div className="document-visual-viewport">
            <figure className="historical-document-figure">
              <Image className="historical-document-image" src={document.content.localSrc} alt={document.content.alt} width={1600} height={1100} unoptimized />
              <figcaption>{document.title}</figcaption>
            </figure>
          </div>
        ) : <blockquote>« {document.content.excerpt} »</blockquote>}
        {document.content.kind === "historical_excerpt"
          ? <cite className="document-identification">{identification}</cite>
          : <p className="document-identification">{identification}</p>}
      </div>
      <div className="document-flex-space" aria-hidden="true" />
      <div className="document-actions">
        {onExpand ? (
          <button type="button" className="expand-document" onClick={onExpand} aria-haspopup="dialog">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></svg>
            Agrandir
          </button>
        ) : null}
        <details className="document-details">
          <summary>Détails</summary>
          <dl className="document-metadata">
          <dt>Nature du document</dt><dd>{document.typeLabel}</dd>
          {document.content.kind === "historical_image" ? <><dt>Description factuelle</dt><dd>{document.content.description}</dd></> : null}
          {document.dateLabel ? <><dt>Date</dt><dd>{document.dateLabel}</dd></> : null}
          {document.authorLabel ? <><dt>Auteur</dt><dd>{document.authorLabel}</dd></> : null}
          {document.institutionLabel ? <><dt>Institution ou lieu de présentation</dt><dd>{document.institutionLabel}</dd></> : null}
          {document.originalDocumentLabel ? <><dt>Document original</dt><dd>{document.originalDocumentLabel}</dd></> : null}
          {document.publicationLabel ? <><dt>Publication</dt><dd>{document.publicationLabel}</dd></> : null}
          <dt>Source complète</dt><dd>{document.sourceLabel}</dd>
          {document.editorialNote ? <><dt>Note éditoriale</dt><dd>{document.editorialNote}</dd></> : null}
          <dt>Droits et attribution</dt><dd>{document.rightsLabel}</dd>
          </dl>
          {document.sourceUrls.length ? <ul className="document-links" aria-label="Liens de référence">{document.sourceUrls.map((url, index) => <li key={`${url}-${index}`}><a href={url} target="_blank" rel="noreferrer">Consulter la référence {index + 1}</a></li>)}</ul> : null}
        </details>
      </div>
    </div>
  );
}
