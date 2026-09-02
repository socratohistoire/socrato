import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  createPedagogicalSession,
  finalizePedagogicalSession,
  InMemoryPedagogicalOutcomeRepository,
  InMemoryTemporarySessionRepository,
  LocalDeterministicResponseAnalyzer,
  LOCAL_DEMO_INPUTS,
  LocalWorkbookReferenceProvider,
  MAX_EXPLICIT_HINT_LEVEL,
  MAX_PEDAGOGICAL_ATTEMPTS,
  POSITIVE_CONCLUSION_VARIANTS,
  produceLocalStructuredSummary,
  requestNextHint,
  skipQuestionAfterAnalysisUnavailable,
  submitStudentResponse,
  validateStructuredAnalysis,
  validateWorkbookReference,
} from "../lib/pedagogical-session-engine/index.ts";
import type {
  PedagogicalQuestionDefinition,
  PedagogicalSessionDefinition,
  ResponseAnalyzer,
  StructuredResponseAnalysis,
  WorkbookReference,
} from "../lib/pedagogical-session-engine/index.ts";
import { createHintSequence } from "../lib/pedagogical-session-engine/demo-definition.ts";
import type { LearningSessionQuestion } from "../lib/student-learning-session/types.ts";

const question: PedagogicalQuestionDefinition = {
  id: "question-1",
  notionId: "acte-union",
  primaryOperationId: "causes-and-consequences",
  operationIds: ["establish_facts", "causes-and-consequences", "relate_facts"],
  historicalKnowledgeIds: ["population", "representation"],
  documentIds: ["document-1", "document-2"],
  requiredDocumentIds: ["document-1", "document-2"],
  hintSequence: {
    1: "Observe le document 1 et relève une donnée précise.",
    2: "Structure : Je relève que… Ensuite, j’explique le lien…",
  },
};

const definition: PedagogicalSessionDefinition = {
  sessionId: "session-1",
  activityId: "activity-1",
  notionId: "acte-union",
  dashboardHref: "/eleve/tableau-de-bord?activity=activity-1#activite",
  questions: [question],
};

function analysis(overrides: Partial<StructuredResponseAnalysis> = {}): StructuredResponseAnalysis {
  return {
    responseDisposition: "substantive",
    pedagogicalOutcome: "partially_satisfactory",
    historicalAccuracy: "partial",
    documentUse: "partial",
    justificationQuality: "partial",
    primaryOperationPerformance: "partial",
    demonstratedKnowledgeIds: ["population"],
    observedOperationIds: ["establish_facts"],
    usedDocumentIds: ["document-1"],
    observedStrengths: ["Un fait pertinent est établi."],
    missingElements: ["Le lien causal doit être précisé."],
    nextAction: "request_revision",
    confidence: "medium",
    ...overrides,
  };
}

class ScriptedAnalyzer implements ResponseAnalyzer {
  constructor(private readonly outputs: unknown[]) {}
  calls = 0;
  async analyze() { return this.outputs[Math.min(this.calls++, this.outputs.length - 1)]; }
}

const fixedClock = { now: () => new Date("2026-07-26T12:00:00.000Z") };

test("le mode dégradé avance sans attribuer de réussite ni de difficulté", async () => {
  const transition = skipQuestionAfterAnalysisUnavailable(definition, createPedagogicalSession(definition));
  assert.equal(transition.sessionCompleted, true);
  assert.equal(transition.state.questionStates[0].status, "completed");
  assert.equal(transition.state.questionStates[0].skippedWithoutEvaluation, true);
  assert.equal(transition.state.questionStates[0].result, undefined);
  const finalized = await finalizePedagogicalSession(transition.state);
  assert.deepEqual(finalized.summary?.operationResults, []);
  assert.deepEqual(finalized.summary?.historicalKnowledgeResults, []);
  assert.match(transition.feedback?.studentFacingText ?? "", /ni comme réussite ni comme difficulté/);
});

test("un indice sans document ne demande jamais de consulter des documents", () => {
  const questionWithoutDocuments = {
    id: "q-no-doc", type: "question_without_documents", format: "short-answer", number: 1,
    prompt: "Quel territoire est créé et quelles sont ses deux sections?",
    instruction: "Nomme le territoire et ses sections.", primaryOperationId: "establish_facts",
    intellectualOperations: [{ id: "establish_facts", label: "Établir des faits" }], historicalKnowledgeIds: ["acte-union"],
    documentRelations: [], requiredDocumentIds: [], localHint: "Repère les trois noms demandés.", initialMessages: [],
  } satisfies LearningSessionQuestion;
  const hints = createHintSequence(questionWithoutDocuments);
  assert.match(hints[2], /sans chercher de document/);
  assert.doesNotMatch(hints[2], /documents demandés|appuie chaque étape sur les documents/i);
});

test("un indice avec documents reprend l’observation propre à la question", () => {
  const questionWithDocuments = {
    id: "q-docs", type: "question_with_documents", format: "document-interpretation", number: 1,
    prompt: "Compare les deux points de vue.", instruction: "Compare les auteurs.", primaryOperationId: "differences_and_similarities",
    intellectualOperations: [{ id: "differences_and_similarities", label: "Déterminer des différences" }], historicalKnowledgeIds: ["acte-union"],
    documentRelations: [{ documentId: "russell", displayOrder: 1 }, { documentId: "lafontaine", displayOrder: 2 }], requiredDocumentIds: ["russell", "lafontaine"],
    localHint: "Relève la position de Russell, puis celle de La Fontaine.", initialMessages: [],
  } satisfies LearningSessionQuestion;
  const hints = createHintSequence(questionWithDocuments);
  assert.match(hints[2], /Relève la position de Russell, puis celle de La Fontaine/);
  assert.match(hints[2], /compare ou relie/);
  assert.doesNotMatch(hints[2], /documents demandés/);
});

test("crée une séance en conservant tous les identifiants pédagogiques", () => {
  const state = createPedagogicalSession(definition);
  assert.equal(state.status, "active");
  assert.equal(state.currentQuestionIndex, 0);
  assert.deepEqual(state.questionStates[0], {
    sessionId: "session-1", activityId: "activity-1", questionId: "question-1", notionId: "acte-union",
    primaryOperationId: "causes-and-consequences", operationIds: question.operationIds,
    historicalKnowledgeIds: question.historicalKnowledgeIds, documentIds: question.documentIds,
    attemptNumber: 0, hintLevel: 0, hintRequestCount: 0, nonExploitableCount: 0, status: "presented",
  });
});

test("rejette une définition dont l’opération principale est inconnue", () => {
  assert.throws(() => createPedagogicalSession({ ...definition, questions: [{ ...question, primaryOperationId: "unknown" }] }), /opération principale/);
});

test("traite la première tentative et produit une seule relance prioritaire", async () => {
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Une idée", new ScriptedAnalyzer([analysis()]), fixedClock);
  assert.equal(transition.state.questionStates[0].attemptNumber, 1);
  assert.equal(transition.questionCompleted, false);
  assert.equal(transition.feedback?.priorityPrompt, "Quel fait précis permet de justifier le lien que tu proposes?");
  assert.doesNotMatch(transition.feedback?.studentFacingText ?? "", /Bonne réponse|Mauvaise réponse/);
});

test("termine immédiatement une réponse satisfaisante", async () => {
  const satisfactory = analysis({
    pedagogicalOutcome: "satisfactory", nextAction: "complete_question", historicalAccuracy: "demonstrated",
    documentUse: "demonstrated", justificationQuality: "demonstrated", primaryOperationPerformance: "demonstrated",
    demonstratedKnowledgeIds: ["population", "representation"], observedOperationIds: question.operationIds,
    usedDocumentIds: question.documentIds, missingElements: [],
  });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse", new ScriptedAnalyzer([satisfactory]), fixedClock);
  assert.equal(transition.sessionCompleted, true);
  assert.equal(transition.state.questionStates[0].result?.status, "mastered");
  assert.equal(transition.state.questionStates[0].result?.advancedMastery, true);
});

test("distingue la maîtrise autonome de la réussite avec l’aide de Socrato", async () => {
  const state = createPedagogicalSession(definition);
  const helpedState = { ...state, questionStates: state.questionStates.with(0, { ...state.questionStates[0], attemptNumber: 1, hintLevel: 1 as const }) };
  const satisfactory = analysis({ pedagogicalOutcome: "satisfactory", nextAction: "complete_question", historicalAccuracy: "demonstrated", documentUse: "demonstrated", justificationQuality: "demonstrated", primaryOperationPerformance: "demonstrated", demonstratedKnowledgeIds: question.historicalKnowledgeIds, observedOperationIds: question.operationIds, usedDocumentIds: question.documentIds, missingElements: [] });
  const transition = await submitStudentResponse(definition, helpedState, "Réponse complète après aide", new ScriptedAnalyzer([satisfactory]), fixedClock);
  assert.equal(transition.state.questionStates[0].result?.status, "to_consolidate");
});

test("montre à la fois une réussite autonome et une amélioration accompagnée dans les points forts", async () => {
  const satisfactory = analysis({
    pedagogicalOutcome: "satisfactory",
    nextAction: "complete_question",
    historicalAccuracy: "demonstrated",
    documentUse: "demonstrated",
    justificationQuality: "demonstrated",
    primaryOperationPerformance: "demonstrated",
    demonstratedKnowledgeIds: question.historicalKnowledgeIds,
    observedOperationIds: question.operationIds,
    usedDocumentIds: question.documentIds,
    missingElements: [],
  });
  const autonomousState = (await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse autonome", new ScriptedAnalyzer([satisfactory]), fixedClock)).state;
  const autonomousResult = autonomousState.questionStates[0].result!;
  const helpedResult = {
    ...autonomousResult,
    questionId: "question-helped",
    attemptNumber: 2,
    status: "to_consolidate" as const,
    advancedMastery: false,
  };
  const state = {
    ...autonomousState,
    questionStates: [
      autonomousState.questionStates[0],
      { ...autonomousState.questionStates[0], questionId: helpedResult.questionId, result: helpedResult },
    ],
  };
  const summary = produceLocalStructuredSummary(state, []);
  assert.equal(summary.strengths.length, 2);
  assert.match(summary.strengths.join("\n"), /Tu sais|Tu connais bien/);
  assert.match(summary.strengths.join("\n"), /autonom|premier essai|sans .*aide|sans demander d.indice|par toi-même/iu);
});

test("une difficulté corrigée avec aide conserve l’opération comme stratégie prioritaire", async () => {
  let state = createPedagogicalSession(definition);
  state = (await submitStudentResponse(definition, state, "Réponse partielle", new ScriptedAnalyzer([analysis()]), fixedClock)).state;
  const satisfactory = analysis({
    pedagogicalOutcome: "satisfactory",
    nextAction: "complete_question",
    historicalAccuracy: "demonstrated",
    documentUse: "demonstrated",
    justificationQuality: "demonstrated",
    primaryOperationPerformance: "demonstrated",
    demonstratedKnowledgeIds: question.historicalKnowledgeIds,
    observedOperationIds: question.operationIds,
    usedDocumentIds: question.documentIds,
    missingElements: [],
  });
  state = (await submitStudentResponse(definition, state, "Réponse corrigée", new ScriptedAnalyzer([satisfactory]), fixedClock)).state;
  assert.equal(state.questionStates[0].result?.status, "to_consolidate");
  const summary = produceLocalStructuredSummary(state, []);
  assert.match(summary.consolidationTargets[0] ?? "", /^Déterminer des causes et des conséquences/);
  assert.match(summary.consolidationTargets[0] ?? "", /Le lien causal doit être précisé/);
  assert.equal(summary.readingAdvice, undefined);
  assert.equal(summary.recommendation?.targetOperationIds[0], question.primaryOperationId);
});

test("accepte une réponse satisfaisante tout en proposant un enrichissement précis", async () => {
  const satisfactory = analysis({
    pedagogicalOutcome: "satisfactory", nextAction: "complete_question", historicalAccuracy: "demonstrated",
    documentUse: "partial", justificationQuality: "demonstrated", primaryOperationPerformance: "demonstrated",
    demonstratedKnowledgeIds: ["population", "representation"], observedOperationIds: question.operationIds,
    usedDocumentIds: [question.documentIds[0]], missingElements: ["nomme explicitement La Minerve comme indice de radicalisation."],
  });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse", new ScriptedAnalyzer([satisfactory]), fixedClock);
  assert.equal(transition.questionCompleted, true);
  assert.equal(transition.state.questionStates[0].result?.status, "mastered");
  assert.equal(transition.state.questionStates[0].result?.advancedMastery, false);
  assert.match(transition.feedback?.studentFacingText ?? "", /Bravo, ta réponse est réussie/);
  assert.match(transition.feedback?.studentFacingText ?? "", /À retenir aussi : nomme explicitement La Minerve/);
});

test("évite de répéter le libellé précision dans un enrichissement réussi", async () => {
  const satisfactory = analysis({ pedagogicalOutcome: "satisfactory", nextAction: "complete_question", missingElements: ["Précision : Durham vise aussi les lois et la langue."] });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse complète", new ScriptedAnalyzer([satisfactory]), fixedClock);
  assert.match(transition.feedback?.studentFacingText ?? "", /À retenir aussi : Durham vise aussi/);
  assert.doesNotMatch(transition.feedback?.studentFacingText ?? "", /À retenir aussi : Précision :/);
});

test("évite aussi de répéter le libellé précision facultative", async () => {
  const satisfactory = analysis({ pedagogicalOutcome: "satisfactory", nextAction: "complete_question", missingElements: ["Précision facultative : ce refus n’est pas l’unique cause."] });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse complète", new ScriptedAnalyzer([satisfactory]), fixedClock);
  assert.match(transition.feedback?.studentFacingText ?? "", /À retenir aussi : ce refus n’est pas l’unique cause/);
  assert.doesNotMatch(transition.feedback?.studentFacingText ?? "", /À retenir aussi : Précision facultative/);
});

test("une réponse partielle autorise une nouvelle tentative", async () => {
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse", new ScriptedAnalyzer([analysis()]), fixedClock);
  assert.equal(transition.state.status, "active");
  assert.equal(transition.state.questionStates[0].status, "awaiting_response");
});

test("une réponse insuffisante conserve une relance sans compter un indice explicite", async () => {
  const insufficient = analysis({ pedagogicalOutcome: "insufficient", nextAction: "offer_hint", historicalAccuracy: "not_demonstrated", primaryOperationPerformance: "not_demonstrated" });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse", new ScriptedAnalyzer([insufficient]), fixedClock);
  assert.equal(transition.hint, undefined);
  assert.equal(transition.state.questionStates[0].hintLevel, 0);
  assert.equal(transition.state.questionStates[0].hintRequestCount, 0);
  assert.ok(transition.feedback?.priorityPrompt);
});

test("normalise une transition d’aide sans rejeter une analyse partielle valide", () => {
  const candidate = analysis({ pedagogicalOutcome: "partially_satisfactory", nextAction: "offer_hint" });
  const validated = validateStructuredAnalysis(candidate, question);
  assert.equal(validated.pedagogicalOutcome, "partially_satisfactory");
  assert.equal(validated.nextAction, "request_revision");
  assert.deepEqual(validated.observedStrengths, candidate.observedStrengths);
  assert.deepEqual(validated.missingElements, candidate.missingElements);
});

test("un oubli déclaré reçoit chaleureusement un nouvel indice", async () => {
  const forgotten = analysis({
    responseDisposition: "too_short",
    pedagogicalOutcome: "non_exploitable",
    nextAction: "handle_non_exploitable",
    demonstratedKnowledgeIds: [],
    observedOperationIds: [],
    usedDocumentIds: [],
  });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Je ne me souviens plus", new ScriptedAnalyzer([forgotten]), fixedClock);
  assert.equal(transition.feedback?.studentFacingText, "Ce n’est pas grave, on va la retrouver ensemble.");
  assert.equal(transition.hint?.level, 1);
  assert.equal(transition.state.questionStates[0].hintLevel, 1);
  assert.equal(transition.state.questionStates[0].hintRequestCount, 1);
  assert.equal(transition.state.questionStates[0].attemptNumber, 0);
  assert.doesNotMatch(transition.feedback?.studentFacingText ?? "", /interpréter cette réponse|reformuler/i);
});

test("je ne sais pas reçoit une aide même si l’analyse externe est indisponible", async () => {
  let analyzerCalled = false;
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Je ne sais pas", {
    async analyze() { analyzerCalled = true; throw new Error("indisponible"); },
  }, fixedClock);
  assert.equal(analyzerCalled, false);
  assert.equal(transition.state.questionStates[0].attemptNumber, 0);
  assert.equal(transition.hint?.level, 1);
  assert.doesNotMatch(transition.feedback?.studentFacingText ?? "", /philosophes|Agora|bilan plus tard/i);
});

test("une demande de méthode reçoit un indice sans être comptée comme essai", async () => {
  const unavailable = analysis({ responseDisposition: "too_short", pedagogicalOutcome: "non_exploitable", nextAction: "handle_non_exploitable", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [] });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Je sais pas comment", new ScriptedAnalyzer([unavailable]), fixedClock);
  assert.equal(transition.state.questionStates[0].attemptNumber, 0);
  assert.equal(transition.feedback?.studentFacingText, "Bien sûr. Commençons une étape à la fois avec cet indice.");
  assert.equal(transition.hint?.level, 1);
});

test("une demande de réponse complète devient une aide guidée sans donner la réponse", async () => {
  const unavailable = analysis({ responseDisposition: "too_short", pedagogicalOutcome: "non_exploitable", nextAction: "handle_non_exploitable", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [] });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Donne-moi la réponse", new ScriptedAnalyzer([unavailable]), fixedClock);
  assert.equal(transition.state.questionStates[0].attemptNumber, 0);
  assert.equal(transition.feedback?.studentFacingText, "Je ne vais pas faire le travail à ta place, mais je vais t’aider à construire ta réponse.");
  assert.equal(transition.hint?.level, 1);
  assert.doesNotMatch(`${transition.feedback?.studentFacingText} ${transition.hint?.text}`, /la réponse est/i);
});

test("reconnaît plusieurs formulations ayant l’intention d’obtenir la réponse complète", async () => {
  const unavailable = analysis({ responseDisposition: "too_short", pedagogicalOutcome: "non_exploitable", nextAction: "handle_non_exploitable", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [] });
  for (const request of ["Je veux la réponse", "C’est quoi la réponse?", "Peux-tu me dire quoi écrire?", "Réponds à ma place", "Fais-le pour moi"]) {
    const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), request, new ScriptedAnalyzer([unavailable]), fixedClock);
    assert.equal(transition.state.questionStates[0].attemptNumber, 0, request);
    assert.match(transition.feedback?.studentFacingText ?? "", /construire ta réponse/, request);
    assert.equal(transition.hint?.level, 1, request);
  }
});

test("utilise le raisonnement de Sol pour reconnaître une demande elliptique de réponse", async () => {
  const aiIntent = analysis({ responseDisposition: "answer_request", pedagogicalOutcome: "non_exploitable", nextAction: "handle_non_exploitable", historicalAccuracy: "not_assessed", documentUse: "not_assessed", justificationQuality: "not_assessed", primaryOperationPerformance: "not_assessed", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [], observedStrengths: [], missingElements: [] });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse svp", new ScriptedAnalyzer([aiIntent]), fixedClock);
  assert.equal(transition.state.questionStates[0].attemptNumber, 0);
  assert.equal(transition.state.questionStates[0].nonExploitableCount, 0);
  assert.match(transition.feedback?.studentFacingText ?? "", /construire ta réponse/);
  assert.equal(transition.hint?.level, 1);
});

test("réagit chaleureusement à une diversion légère puis reprend la question ciblée", async () => {
  const playful = analysis({ responseDisposition: "playful_diversion", pedagogicalOutcome: "non_exploitable", nextAction: "handle_non_exploitable", historicalAccuracy: "not_assessed", documentUse: "not_assessed", justificationQuality: "not_assessed", primaryOperationPerformance: "not_assessed", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [], observedStrengths: ["À tes souhaits!"], missingElements: ["Comment le refus britannique augmente-t-il le mécontentement?"] });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Atchoum", new ScriptedAnalyzer([playful]), fixedClock);
  assert.equal(transition.state.questionStates[0].attemptNumber, 1);
  assert.equal(transition.feedback?.studentFacingText, "À tes souhaits! Revenons tranquillement à notre enquête historique. Comment le refus britannique augmente-t-il le mécontentement?");
  assert.doesNotMatch(transition.feedback?.studentFacingText ?? "", /interpréter cette réponse|reformuler une seule idée/i);
});

test("adapte une remarque adressée à Socrato sans la réduire à un mot", async () => {
  const aside = analysis({ responseDisposition: "playful_diversion", pedagogicalOutcome: "non_exploitable", nextAction: "handle_non_exploitable", historicalAccuracy: "not_assessed", documentUse: "not_assessed", justificationQuality: "not_assessed", primaryOperationPerformance: "not_assessed", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [], observedStrengths: ["Oui, je suis là pour t’accompagner en histoire."], missingElements: ["Quelle différence vois-tu entre l’adoption d’une loi et son entrée en vigueur?"] });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Tu es un prof d’histoire", new ScriptedAnalyzer([aside]), fixedClock);
  assert.match(transition.feedback?.studentFacingText ?? "", /je suis là pour t’accompagner en histoire/);
  assert.match(transition.feedback?.studentFacingText ?? "", /Quelle différence vois-tu/);
  assert.doesNotMatch(transition.feedback?.studentFacingText ?? "", /Ce mot/);
});

test("une réponse courte liée n’est pas confondue avec une demande d’aide", async () => {
  const shortRelated = analysis({
    responseDisposition: "too_short",
    pedagogicalOutcome: "non_exploitable",
    nextAction: "handle_non_exploitable",
    demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [],
  });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "L’Acte d’Union", new ScriptedAnalyzer([shortRelated]), fixedClock);
  assert.equal(transition.state.questionStates[0].attemptNumber, 1);
  assert.equal(transition.hint, undefined);
  assert.doesNotMatch(transition.feedback?.studentFacingText ?? "", /tu ne t’en souviens plus|autre indice/i);
});

test("l’analyseur local conserve une réponse courte mais historiquement pertinente comme exploitable", async () => {
  const analyzer = new LocalDeterministicResponseAnalyzer("test");
  const response = { ...createPedagogicalSession(definition).questionStates[0], content: "Union injuste", attemptNumber: 1 };
  const result = await analyzer.analyze(response, question);
  assert.equal(result.responseDisposition, "substantive");
  assert.equal(result.historicalAccuracy, "not_assessed");
});

test("les fautes et la syntaxe fragile ne rendent pas automatiquement la réponse non exploitable", async () => {
  const analyzer = new LocalDeterministicResponseAnalyzer("test");
  const response = { ...createPedagogicalSession(definition).questionStates[0], content: "canada est avai plu monde represantation egal", attemptNumber: 1 };
  assert.equal((await analyzer.analyze(response, question)).responseDisposition, "substantive");
});

test("une réponse ordinaire reçoit une rétroaction unique sans avertissement technique visible", async () => {
  const analyzer = new LocalDeterministicResponseAnalyzer("test");
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Le Canada-Est avait davantage d’habitants.", analyzer, fixedClock);
  const expected = "Merci pour ta réponse. On va avancer ensemble : ajoute un fait précis et explique le lien que tu établis.";
  assert.equal(transition.feedback?.studentFacingText, expected);
  assert.equal(transition.feedback?.studentFacingText.match(/Merci pour ta réponse/g)?.length, 1);
  assert.doesNotMatch(transition.feedback?.studentFacingText ?? "", /ne peut pas confirmer son exactitude historique ni ton raisonnement|L’analyse locale ne peut pas confirmer/);
  assert.equal(transition.feedback?.technicalNotice, undefined);
  assert.equal(transition.state.questionStates[0].lastAnalysis?.pedagogicalOutcome, "partially_satisfactory");
  assert.equal(transition.state.questionStates[0].lastAnalysis?.historicalAccuracy, "not_assessed");
  assert.equal(transition.state.questionStates[0].lastAnalysis?.primaryOperationPerformance, "not_assessed");
  assert.equal(transition.state.questionStates[0].result, undefined);
});

test("les entrées réservées déclenchent des scénarios déterministes sans analyser le texte libre", async () => {
  const analyzer = new LocalDeterministicResponseAnalyzer("test");
  const runtime = createPedagogicalSession(definition).questionStates[0];
  const expected = [
    [LOCAL_DEMO_INPUTS.satisfactory, "satisfactory", "substantive"],
    [LOCAL_DEMO_INPUTS.partial, "partially_satisfactory", "substantive"],
    [LOCAL_DEMO_INPUTS.insufficient, "insufficient", "substantive"],
    [LOCAL_DEMO_INPUTS.offTopic, "non_exploitable", "off_topic"],
    [LOCAL_DEMO_INPUTS.incomprehensible, "non_exploitable", "incomprehensible"],
    [LOCAL_DEMO_INPUTS.inappropriate, "non_exploitable", "inappropriate"],
  ] as const;
  for (const [content, outcome, disposition] of expected) {
    const result = await analyzer.analyze({ ...runtime, content, attemptNumber: 1 }, question);
    assert.equal(result.pedagogicalOutcome, outcome);
    assert.equal(result.responseDisposition, disposition);
  }
});

for (const disposition of ["off_topic", "incomprehensible", "nonsense_or_spam", "inappropriate"] as const) {
  test(`traite ${disposition} comme non exploitable sans attribuer de maîtrise`, async () => {
    const output = analysis({ responseDisposition: disposition, pedagogicalOutcome: "non_exploitable", nextAction: "handle_non_exploitable", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [] });
    const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "contenu non conservé", new ScriptedAnalyzer([output]), fixedClock);
    assert.equal(transition.state.questionStates[0].nonExploitableCount, 1);
    assert.equal(transition.state.questionStates[0].result, undefined);
    if (disposition === "inappropriate") assert.doesNotMatch(transition.feedback?.studentFacingText ?? "", /contenu non conservé/);
  });
}

test("la troisième réponse non exploitable termine sans maîtrise ni remarque comportementale", async () => {
  const output = analysis({ responseDisposition: "off_topic", pedagogicalOutcome: "non_exploitable", nextAction: "handle_non_exploitable", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [], observedStrengths: [] });
  const analyzer = new ScriptedAnalyzer([output]);
  let state = createPedagogicalSession(definition);
  for (let index = 0; index < 3; index += 1) state = (await submitStudentResponse(definition, state, "hors sujet", analyzer, fixedClock)).state;
  assert.equal(state.status, "completed");
  assert.equal(state.questionStates[0].result?.status, "to_work_on");
  assert.deepEqual(state.questionStates[0].result?.demonstratedKnowledgeIds, []);
  assert.deepEqual(state.questionStates[0].result?.demonstratedOperationIds, []);
});

test("ramène progressivement une diversion répétée vers la tâche", async () => {
  const diversion = analysis({ responseDisposition: "off_topic", pedagogicalOutcome: "non_exploitable", nextAction: "handle_non_exploitable", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [], observedStrengths: [] });
  const analyzer = new ScriptedAnalyzer([diversion]);
  let state = createPedagogicalSession(definition);
  const first = await submitStudentResponse(definition, state, "patate", analyzer, fixedClock);
  assert.equal(first.feedback?.studentFacingText, "D’accord. Revenons tranquillement à notre enquête historique. Quelle idée historique peux-tu proposer?");
  state = first.state;
  const second = await submitStudentResponse(definition, state, "oignon", analyzer, fixedClock);
  assert.equal(second.feedback?.studentFacingText, "Je te suis. Reprenons maintenant la question d’histoire. Quelle idée, même très courte, est directement liée à la question?");
  state = second.state;
  const final = await submitStudentResponse(definition, state, "carotte", analyzer, fixedClock);
  assert.equal(final.feedback?.studentFacingText, "Nous garderons cette question à retravailler dans ton bilan.");
  assert.doesNotMatch(`${first.feedback?.studentFacingText} ${second.feedback?.studentFacingText} ${final.feedback?.studentFacingText}`, /punition|comportement|volontaire|intention/i);
});

test("progresse explicitement de 0 à 2 puis refuse tout troisième indice", () => {
  let state = createPedagogicalSession(definition);
  const levels: number[] = [];
  for (let index = 0; index < 4; index += 1) {
    const transition = requestNextHint(definition, state);
    levels.push(transition.hint?.level ?? -1);
    state = transition.state;
  }
  assert.equal(MAX_EXPLICIT_HINT_LEVEL, 2);
  assert.deepEqual(levels, [1, 2, -1, -1]);
  assert.equal(state.questionStates[0].hintLevel, 2);
  assert.equal(state.questionStates[0].hintRequestCount, 2);
});

test("les deux indices orientent puis structurent sans fournir la réponse", () => {
  const initial = createPedagogicalSession(definition);
  const first = requestNextHint(definition, initial);
  const second = requestNextHint(definition, first.state);
  assert.equal(first.hint?.documentId, "document-1");
  assert.match(first.hint?.text ?? "", /document 1|donnée précise/i);
  assert.match(second.hint?.text ?? "", /Structure|Je relève|j’explique/i);
  assert.doesNotMatch(`${first.hint?.text} ${second.hint?.text}`, /Canada-Est.*désavantag|réponse est/i);
  assert.doesNotMatch(`${first.hint?.text} ${second.hint?.text}`, /Que remarques-tu|Que peux-tu répondre|utiliser cet indice pour répondre à la question/i);
});

test("une nouvelle question recommence au niveau zéro", async () => {
  const secondQuestion = { ...question, id: "question-2" };
  const twoQuestions = { ...definition, questions: [question, secondQuestion] };
  const withHint = requestNextHint(twoQuestions, createPedagogicalSession(twoQuestions));
  const satisfactory = analysis({ pedagogicalOutcome: "satisfactory", nextAction: "complete_question" });
  const transition = await submitStudentResponse(twoQuestions, withHint.state, "Réponse", new ScriptedAnalyzer([satisfactory]), fixedClock);
  assert.equal(transition.state.currentQuestionIndex, 1);
  assert.equal(transition.state.questionStates[0].hintLevel, 1);
  assert.equal(transition.state.questionStates[1].hintLevel, 0);
});

test("limite strictement une question à trois tentatives", async () => {
  assert.equal(MAX_PEDAGOGICAL_ATTEMPTS, 3);
  const analyzer = new ScriptedAnalyzer([analysis()]);
  let state = createPedagogicalSession(definition);
  for (let index = 0; index < 3; index += 1) state = (await submitStudentResponse(definition, state, "Réponse", analyzer, fixedClock)).state;
  assert.equal(state.status, "completed");
  assert.equal(state.questionStates[0].result?.status, "to_work_on");
  await assert.rejects(() => submitStudentResponse(definition, state, "Quatrième", analyzer, fixedClock), /aucune question active/);
});

test("la dernière intervention clôt sans poser une question impossible à répondre", async () => {
  const partial = analysis({
    pedagogicalOutcome: "partially_satisfactory",
    nextAction: "request_revision",
    observedStrengths: ["Tu relies correctement le refus britannique au mécontentement."],
    missingElements: ["Quelles demandes précises sont refusées?"],
  });
  const analyzer = new ScriptedAnalyzer([partial]);
  let state = createPedagogicalSession(definition);
  let transition = await submitStudentResponse(definition, state, "Première réponse", analyzer, fixedClock);
  state = transition.state;
  assert.match(transition.feedback?.studentFacingText ?? "", /\?$/);
  transition = await submitStudentResponse(definition, state, "Deuxième réponse", analyzer, fixedClock);
  state = transition.state;
  assert.match(transition.feedback?.studentFacingText ?? "", /\?$/);
  transition = await submitStudentResponse(definition, state, "Troisième réponse", analyzer, fixedClock);
  assert.equal(transition.questionCompleted, true);
  assert.doesNotMatch(transition.feedback?.studentFacingText ?? "", /\?/);
  assert.match(transition.feedback?.studentFacingText ?? "", /reste à consolider/i);
  assert.match(transition.feedback?.studentFacingText ?? "", /pris en compte dans ton bilan/i);
  assert.doesNotMatch(transition.feedback?.studentFacingText ?? "", /proposerai|activité de consolidation/i);
});

test("transmet à toutes les questions ouvertes le bilan structuré du tour précédent", async () => {
  const firstAnalysis = analysis({
    pedagogicalOutcome: "partially_satisfactory",
    nextAction: "request_revision",
    observedStrengths: ["Tu as nommé le nouveau territoire."],
    missingElements: ["Quelles sont ses deux sections?"],
  });
  let receivedPriorTurn: Parameters<ResponseAnalyzer["analyze"]>[0]["priorTurn"];
  const analyzer: ResponseAnalyzer = {
    async analyze(response) {
      receivedPriorTurn = response.priorTurn;
      return firstAnalysis;
    },
  };
  const state = (await submitStudentResponse(definition, createPedagogicalSession(definition), "Province du Canada", analyzer, fixedClock)).state;
  await submitStudentResponse(definition, state, "Canada-Est et Canada-Ouest", analyzer, fixedClock);
  assert.deepEqual(receivedPriorTurn, {
    pedagogicalOutcome: "partially_satisfactory",
    observedStrengths: ["Tu as nommé le nouveau territoire."],
    missingElements: ["Quelles sont ses deux sections?"],
  });
});

test("une demande d’aide ne consomme pas la dernière tentative disponible", async () => {
  const partial = analysis({ pedagogicalOutcome: "partially_satisfactory", nextAction: "request_revision" });
  const forgotten = analysis({ responseDisposition: "too_short", pedagogicalOutcome: "non_exploitable", nextAction: "handle_non_exploitable", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [] });
  const analyzer = new ScriptedAnalyzer([partial, partial, forgotten, partial]);
  let state = createPedagogicalSession(definition);
  for (const content of ["Première réponse", "Deuxième réponse"]) {
    state = (await submitStudentResponse(definition, state, content, analyzer, fixedClock)).state;
  }
  const help = await submitStudentResponse(definition, state, "Je ne sais plus", analyzer, fixedClock);
  assert.equal(help.questionCompleted, false);
  assert.equal(help.state.questionStates[0].attemptNumber, 2);
  const final = await submitStudentResponse(definition, help.state, "Troisième réponse historique", analyzer, fixedClock);
  assert.equal(final.questionCompleted, true);
});

test("passe à la question suivante avant de terminer la séance", async () => {
  const second = { ...question, id: "question-2", documentIds: [], requiredDocumentIds: [] };
  const twoQuestions = { ...definition, questions: [question, second] };
  const satisfactory = analysis({ pedagogicalOutcome: "satisfactory", nextAction: "complete_question" });
  const first = await submitStudentResponse(twoQuestions, createPedagogicalSession(twoQuestions), "Réponse", new ScriptedAnalyzer([satisfactory]), fixedClock);
  assert.equal(first.state.currentQuestionIndex, 1);
  assert.equal(first.state.status, "active");
  const last = await submitStudentResponse(twoQuestions, first.state, "Réponse", new ScriptedAnalyzer([{ ...satisfactory, usedDocumentIds: [], documentUse: "not_assessed" }]), fixedClock);
  assert.equal(last.state.status, "completed");
});

test("la maîtrise avancée exclut la langue et exige exactitude, opération, justification et documents", async () => {
  const advanced = analysis({
    pedagogicalOutcome: "satisfactory", nextAction: "complete_question", historicalAccuracy: "demonstrated",
    primaryOperationPerformance: "demonstrated", justificationQuality: "demonstrated", documentUse: "demonstrated",
    usedDocumentIds: question.documentIds, observedOperationIds: [question.primaryOperationId], demonstratedKnowledgeIds: ["population"],
  });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "réponce avc fotes", new ScriptedAnalyzer([advanced]), fixedClock);
  assert.equal(transition.state.questionStates[0].result?.advancedMastery, true);
});

test("une confusion cause-conséquence et des faits sans relation restent partiels", async () => {
  const confusion = analysis({ observedStrengths: ["Des faits sont connus."], missingElements: ["La cause est confondue avec la conséquence."], primaryOperationPerformance: "not_demonstrated" });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse", new ScriptedAnalyzer([confusion]), fixedClock);
  assert.equal(transition.state.questionStates[0].lastAnalysis?.pedagogicalOutcome, "partially_satisfactory");
  assert.match(transition.feedback?.studentFacingText ?? "", /cause est confondue/);
});

test("un document requis non utilisé empêche la maîtrise avancée", async () => {
  const incompleteDocuments = analysis({
    pedagogicalOutcome: "satisfactory", nextAction: "complete_question", historicalAccuracy: "demonstrated",
    primaryOperationPerformance: "demonstrated", justificationQuality: "demonstrated", documentUse: "partial",
    usedDocumentIds: ["document-1"], observedOperationIds: [question.primaryOperationId],
  });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse", new ScriptedAnalyzer([incompleteDocuments]), fixedClock);
  assert.equal(transition.state.questionStates[0].result?.advancedMastery, false);
});

test("rejette une analyse invalide sans attribuer l’échec à la réponse de l’élève", async () => {
  const invalid = { ...analysis(), demonstratedKnowledgeIds: ["unknown-knowledge"] };
  assert.throws(() => validateStructuredAnalysis(invalid, question), /identifiant.*non autorisé/);
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse", new ScriptedAnalyzer([invalid]), fixedClock);
  assert.equal(transition.state.questionStates[0].lastAnalysis?.responseDisposition, "incomprehensible");
  assert.deepEqual(transition.state.questionStates[0].lastAnalysis?.demonstratedKnowledgeIds, []);
  assert.equal(transition.state.questionStates[0].attemptNumber, 0);
  assert.equal(transition.state.questionStates[0].nonExploitableCount, 0);
  assert.equal(transition.feedback?.studentFacingText, "Socrato ne peut pas analyser ta réponse pour le moment. Elle reste affichée et cette tentative ne compte pas; tu pourras réessayer lorsque le service sera rétabli.");
  assert.doesNotMatch(transition.feedback?.studentFacingText ?? "", /développer|reformuler|idée historique/i);
});

test("rejette un champ pouvant transporter une réponse complète", () => {
  assert.throws(() => validateStructuredAnalysis({ ...analysis(), completeAnswer: "Réponse prête à remettre" }, question), /champ non autorisé/);
});

test("le bilan contient seulement les éléments réellement travaillés et une recommandation facultative", async () => {
  const partial = analysis({ demonstratedKnowledgeIds: ["population"], observedOperationIds: ["establish_facts"] });
  const analyzer = new ScriptedAnalyzer([partial]);
  let state = createPedagogicalSession(definition);
  for (let index = 0; index < 3; index += 1) state = (await submitStudentResponse(definition, state, "Réponse", analyzer, fixedClock)).state;
  const summary = produceLocalStructuredSummary(state, [], "2026-07-26T12:00:00.000Z");
  assert.deepEqual(summary.historicalKnowledgeResults.map(({ id }) => id), ["population", "representation"]);
  assert.deepEqual(summary.operationResults.map(({ id }) => id), ["establish_facts", "causes-and-consequences"]);
  assert.equal(summary.recommendation?.kind, "optional_consolidation");
  assert.doesNotMatch(JSON.stringify(summary), /not_assessed|Réponse/);
  assert.match(summary.strengths[0] ?? "", /^Expliquer clairement une cause et sa conséquence\n/);
  assert.equal(state.questionStates[0].result?.status, "to_work_on");
  assert.equal(state.questionStates[0].result?.operationAssessments?.find(({ id }) => id === question.primaryOperationId)?.status, "to_work_on");
  assert.match(summary.consolidationTargets[0] ?? "", /^Construire une chaîne causale avec les documents\nQuestion\nÀ la question 1/);
  assert.match(summary.consolidationTargets[0] ?? "", /repère d’abord la cause, puis la réaction/);
  assert.match(summary.consolidationTargets[0] ?? "", /À vérifier\nLe lien causal doit être précisé\./);
  assert.match(summary.consolidationTargets[0] ?? "", /Comment progresser\nDans les documents/);
});

test("un troisième essai factuellement partiel ne transforme pas une méthode démontrée en difficulté", async () => {
  let state = createPedagogicalSession(definition);
  const partial = analysis({
    primaryOperationPerformance: "demonstrated",
    observedOperationIds: [question.primaryOperationId],
  });
  for (let index = 0; index < 3; index += 1) {
    state = (await submitStudentResponse(definition, state, "Réponse encore incomplète", new ScriptedAnalyzer([partial]), fixedClock)).state;
  }
  const summary = produceLocalStructuredSummary(state, []);
  assert.equal(state.questionStates[0].result?.status, "to_work_on");
  assert.match(summary.strengths[0] ?? "", /^Expliquer clairement une cause et sa conséquence\n/);
  assert.equal(summary.operationResults.find(({ id }) => id === question.primaryOperationId)?.status, "mastered");
});

test("une connaissance inversée reçoit une stratégie factuelle sans fausse difficulté de lecture", async () => {
  const comparisonQuestion = {
    ...question,
    primaryOperationId: "differences_and_similarities",
    operationIds: ["differences_and_similarities"],
    questionPrompt: "Compare les recommandations de Durham avec leur application dans l’Acte d’Union.",
  };
  const comparisonDefinition = { ...definition, questions: [comparisonQuestion] };
  const factualConfusion = analysis({
    primaryOperationPerformance: "demonstrated",
    observedOperationIds: [comparisonQuestion.primaryOperationId],
    documentUse: "demonstrated",
    justificationQuality: "demonstrated",
    usedDocumentIds: comparisonQuestion.documentIds,
    missingElements: ["Précision essentielle : l’union législative est appliquée, mais la responsabilité ministérielle ne l’est pas immédiatement."],
  });
  let state = createPedagogicalSession(comparisonDefinition);
  for (let index = 0; index < 3; index += 1) {
    state = (await submitStudentResponse(comparisonDefinition, state, "Comparaison structurée, faits inversés", new ScriptedAnalyzer([factualConfusion]), fixedClock)).state;
  }
  const summary = produceLocalStructuredSummary(state, []);
  assert.equal(summary.operationResults.find(({ id }) => id === comparisonQuestion.primaryOperationId)?.status, "mastered");
  assert.match(summary.consolidationTargets[0] ?? "", /^Distinguer les recommandations de Durham et leur application/);
  assert.doesNotMatch(summary.consolidationTargets.join("\n"), /Croiser plusieurs documents|Décomposer la consigne/);
  assert.equal(summary.readingAdvice, undefined);
});

test("des données inversées sont expliquées sous l’opération intellectuelle évaluée", async () => {
  const dataQuestion = {
    ...question,
    questionPrompt: "Compare la population et la dette du Haut-Canada et du Bas-Canada.",
  };
  const dataDefinition = { ...definition, questions: [dataQuestion] };
  const invertedData = analysis({
    primaryOperationPerformance: "demonstrated",
    observedOperationIds: [dataQuestion.primaryOperationId],
    documentUse: "demonstrated",
    justificationQuality: "demonstrated",
    usedDocumentIds: dataQuestion.documentIds,
    missingElements: ["Quelles valeurs chaque tableau attribue-t-il précisément au Haut-Canada et au Bas-Canada?"],
  });
  let state = createPedagogicalSession(dataDefinition);
  for (let index = 0; index < 3; index += 1) {
    state = (await submitStudentResponse(dataDefinition, state, "Bon raisonnement, colonies inversées", new ScriptedAnalyzer([invertedData]), fixedClock)).state;
  }
  const summary = produceLocalStructuredSummary(state, []);
  assert.match(summary.consolidationTargets[0] ?? "", /^Déterminer des causes et des conséquences/);
  assert.match(summary.consolidationTargets[0] ?? "", /Haut-Canada compte environ 450 000 habitants/);
  assert.doesNotMatch(summary.consolidationTargets[0] ?? "", /feuille|cahier/iu);
  assert.doesNotMatch(summary.consolidationTargets.join("\n"), /Construire une chaîne causale avec les documents/);
});

test("priorise une question échouée avant une question réussie malgré une évaluation secondaire fragile", async () => {
  let failedState = createPedagogicalSession(definition);
  for (let index = 0; index < 3; index += 1) {
    failedState = (await submitStudentResponse(definition, failedState, "Réponse partielle", new ScriptedAnalyzer([analysis()]), fixedClock)).state;
  }
  const failedResult = failedState.questionStates[0].result!;
  const secondaryResult = {
    ...failedResult,
    questionId: "question-secondary",
    status: "to_consolidate" as const,
    questionPrompt: "Question finalement réussie après une rétroaction.",
    consolidationTargets: ["Difficulté secondaire corrigée."],
  };
  const priorityResult = {
    ...failedResult,
    questionId: "question-priority",
    primaryOperationId: "differences_and_similarities",
    operationIds: ["differences_and_similarities"],
    historicalKnowledgeIds: ["priority-knowledge"],
    operationAssessments: [{ id: "differences_and_similarities", status: "to_work_on" as const }],
    historicalKnowledgeAssessments: [{ id: "priority-knowledge", status: "to_work_on" as const }],
    status: "to_work_on" as const,
    questionPrompt: "Question échouée après trois essais.",
    consolidationTargets: ["Difficulté prioritaire persistante."],
  };
  const state = {
    ...failedState,
    questionStates: [
      { ...failedState.questionStates[0], questionId: secondaryResult.questionId, result: secondaryResult },
      { ...failedState.questionStates[0], questionId: priorityResult.questionId, result: priorityResult },
    ],
  };
  const summary = produceLocalStructuredSummary(state, []);
  assert.match(summary.consolidationTargets[0] ?? "", /Dans la question sur « Question échouée après trois essais »/);
  assert.match(summary.consolidationTargets[0] ?? "", /Difficulté prioritaire persistante/);
  assert.equal(summary.recommendation?.targetOperationIds[0], "differences_and_similarities");
  assert.equal(summary.recommendation?.targetHistoricalKnowledgeIds[0], "priority-knowledge");
});

test("garde une erreur de ligne du temps en priorité secondaire", async () => {
  let baseState = createPedagogicalSession(definition);
  for (let index = 0; index < 3; index += 1) baseState = (await submitStudentResponse(definition, baseState, "Réponse partielle", new ScriptedAnalyzer([analysis()]), fixedClock)).state;
  const baseResult = baseState.questionStates[0].result!;
  const timelineResult = {
    ...baseResult,
    questionId: "timeline-secondary",
    primaryOperationId: "situate_time_space",
    operationIds: ["situate_time_space"],
    questionPrompt: "Replace les six événements dans l’ordre chronologique.",
    consolidationTargets: ["Deux événements sont encore inversés."],
  };
  const reasoningResult = {
    ...baseResult,
    questionId: "reasoning-priority",
    primaryOperationId: "differences_and_similarities",
    operationIds: ["differences_and_similarities"],
    questionPrompt: "Compare les deux points de vue présentés.",
    consolidationTargets: ["La différence entre les deux positions doit être expliquée."],
  };
  const state = {
    ...baseState,
    questionStates: [
      { ...baseState.questionStates[0], questionId: timelineResult.questionId, result: timelineResult },
      { ...baseState.questionStates[0], questionId: reasoningResult.questionId, result: reasoningResult },
    ],
  };
  const summary = produceLocalStructuredSummary(state, []);
  assert.match(summary.consolidationTargets[0] ?? "", /La différence entre les deux positions doit être expliquée/);
  assert.doesNotMatch(summary.consolidationTargets[0] ?? "", /événements|chronologique/iu);
});

test("garde une association date-événement en priorité secondaire devant une analyse documentaire", async () => {
  let baseState = createPedagogicalSession(definition);
  for (let index = 0; index < 3; index += 1) baseState = (await submitStudentResponse(definition, baseState, "Réponse partielle", new ScriptedAnalyzer([analysis()]), fixedClock)).state;
  const baseResult = baseState.questionStates[0].result!;
  const dateResult = {
    ...baseResult,
    questionId: "date-secondary",
    primaryOperationId: "situate_time_space",
    operationIds: ["situate_time_space"],
    operationAssessments: [{ id: "situate_time_space", status: "to_work_on" as const }],
    questionPrompt: "Quelle différence faut-il faire entre l’année 1840 et l’année 1841 concernant l’Acte d’Union?",
    consolidationTargets: ["1840 et 1841 sont encore inversées."],
  };
  const documentResult = {
    ...baseResult,
    questionId: "document-priority",
    primaryOperationId: "causes_and_consequences",
    operationIds: ["causes_and_consequences"],
    operationAssessments: [{ id: "causes_and_consequences", status: "to_work_on" as const }],
    questionPrompt: "À l’aide du rapport Durham, explique une cause économique et deux conséquences attendues.",
    consolidationTargets: ["La cause économique et les deux conséquences doivent être distinguées à partir du document."],
  };
  const state = {
    ...baseState,
    questionStates: [
      { ...baseState.questionStates[0], questionId: dateResult.questionId, result: dateResult },
      { ...baseState.questionStates[0], questionId: documentResult.questionId, result: documentResult },
    ],
  };
  const summary = produceLocalStructuredSummary(state, []);
  assert.match(summary.consolidationTargets[0] ?? "", /cause économique et deux conséquences/iu);
  assert.doesNotMatch(summary.consolidationTargets[0] ?? "", /1840|1841|date/iu);
  assert.equal(summary.recommendation?.targetOperationIds[0], "causes_and_consequences");
});

test("une confusion entre deux dates reçoit une stratégie directement liée aux dates", async () => {
  const datedQuestion = {
    ...question,
    primaryOperationId: "situate_time_space",
    operationIds: ["situate_time_space"],
    documentIds: [],
    requiredDocumentIds: [],
    questionPrompt: "Quelle différence faut-il faire entre l’année 1840 et l’année 1841 concernant l’Acte d’Union?",
  };
  const datedDefinition = { ...definition, questions: [datedQuestion] };
  const partial = analysis({
    missingElements: ["1840 correspond à l’adoption de la loi; son entrée en vigueur se fait en 1841."],
    observedOperationIds: [],
    usedDocumentIds: [],
    documentUse: "not_assessed",
  });
  let state = createPedagogicalSession(datedDefinition);
  for (let index = 0; index < 3; index += 1) state = (await submitStudentResponse(datedDefinition, state, "Dates inversées", new ScriptedAnalyzer([partial]), fixedClock)).state;
  const summary = produceLocalStructuredSummary(state, []);
  assert.match(summary.consolidationTargets[0] ?? "", /^Situer dans le temps et dans l’espace/);
  assert.match(summary.consolidationTargets[0] ?? "", /associe chacune à un verbe d’action précis/);
  assert.match(summary.consolidationTargets[0] ?? "", /1840 → adopter \| 1841 → entrer en vigueur/);
  assert.doesNotMatch(summary.consolidationTargets[0] ?? "", /situation avant l’événement/);
  assert.equal(summary.readingAdvice, undefined);
});

test("formule une réussite familière et autonome sans reprendre le numéro de question", async () => {
  const generic = analysis({
    pedagogicalOutcome: "satisfactory",
    historicalAccuracy: "demonstrated",
    documentUse: "demonstrated",
    justificationQuality: "demonstrated",
    primaryOperationPerformance: "demonstrated",
    observedStrengths: ["Tu as correctement mobilisé les connaissances et la démarche demandées."],
    missingElements: [],
    nextAction: "complete_question",
  });
  const state = (await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse réussie", new ScriptedAnalyzer([generic]), fixedClock)).state;
  const summary = produceLocalStructuredSummary(state, [], "2026-07-26T12:00:00.000Z");
  assert.doesNotMatch(summary.strengths.join(" "), /correctement mobilisé|démarche demandée/iu);
  assert.doesNotMatch(summary.strengths[0] ?? "", /À la question \d|«/u);
  assert.match(summary.strengths[0] ?? "", /dès le premier essai|première vérification/iu);
  assert.match(summary.strengths[0] ?? "", /autonom|premier essai|sans .*aide|sans demander d.indice|par toi-même/iu);
});

test("un point fort chronologique décrit la tâche réussie sans prétendre à toute l’opération", async () => {
  const timelineQuestion = {
    ...question,
    primaryOperationId: "situate_time_space",
    operationIds: ["situate_time_space"],
    questionPrompt: "Replace les six événements dans l’ordre chronologique.",
  };
  const timelineDefinition = { ...definition, questions: [timelineQuestion] };
  const satisfactory = analysis({
    pedagogicalOutcome: "satisfactory",
    nextAction: "complete_question",
    historicalAccuracy: "demonstrated",
    documentUse: "demonstrated",
    justificationQuality: "demonstrated",
    primaryOperationPerformance: "demonstrated",
    demonstratedKnowledgeIds: timelineQuestion.historicalKnowledgeIds,
    observedOperationIds: timelineQuestion.operationIds,
    usedDocumentIds: timelineQuestion.documentIds,
    missingElements: [],
  });
  const state = (await submitStudentResponse(timelineDefinition, createPedagogicalSession(timelineDefinition), "Chronologie correcte", new ScriptedAnalyzer([satisfactory]), fixedClock)).state;
  const summary = produceLocalStructuredSummary(state, []);
  assert.match(summary.strengths[0] ?? "", /^Ordonner les événements avec précision\n/);
  assert.doesNotMatch(summary.strengths[0] ?? "", /^Tu organises bien les repères historiques/);
});

test("limite le bilan aux deux points forts les plus significatifs", () => {
  const summarySource = readFileSync("lib/pedagogical-session-engine/summary.ts", "utf8");
  assert.match(summarySource, /return Math\.min\(2, masteredCount\)/);
  assert.match(summarySource, /Pour y arriver, tu as bien utilisé/);
  assert.match(summarySource, /strengths\.length === limit - 1 \? positiveConclusion\(result\) : ""/);
});

test("dispose d’au moins trente conclusions positives variées et contextualisées", () => {
  const variants = Object.values(POSITIVE_CONCLUSION_VARIANTS).flat();
  assert.ok(variants.length >= 30);
  assert.equal(new Set(variants).size, variants.length);
  assert.ok(POSITIVE_CONCLUSION_VARIANTS.autonomousWithDocuments.some((entry) => /documents/iu.test(entry)));
  assert.ok(POSITIVE_CONCLUSION_VARIANTS.supported.some((entry) => /Socrato|rétroaction|accompagnement|indice/iu.test(entry)));
});

test("le conseil final rappelle la question et précise l’élément oublié", async () => {
  const partial = analysis({ missingElements: ["Comment le refus britannique mène-t-il à une rupture?"] });
  let state = createPedagogicalSession(definition);
  for (let index = 0; index < 3; index += 1) state = (await submitStudentResponse(definition, state, "Réponse", new ScriptedAnalyzer([partial]), fixedClock)).state;
  const result = state.questionStates[0].result!;
  state = { ...state, questionStates: [{ ...state.questionStates[0], result: {
    ...result,
    instructionOmissionObserved: true,
    questionPrompt: "Explique la réponse britannique et ses conséquences.",
    omittedInstructionElements: ["Comment le refus britannique mène-t-il à une rupture?"],
  } }] };
  const summary = produceLocalStructuredSummary(state, [], "2026-07-26T12:00:00.000Z");
  assert.match(summary.readingAdvice ?? "", /^Décomposer la consigne\nQuestion\nÀ la question 1/);
  assert.match(summary.readingAdvice ?? "", /À vérifier\nComment le refus britannique mène-t-il à une rupture\?/);
  assert.ok((summary.readingAdvice ?? "").indexOf("À la question 1") < (summary.readingAdvice ?? "").indexOf("Pour éviter cet oubli"));
});

test("le conseil final infère l’oubli après une reprise même sans indicateur explicite", async () => {
  const partial = analysis({ missingElements: ["La deuxième conséquence n’a pas été expliquée."] });
  let state = createPedagogicalSession(definition);
  for (let index = 0; index < 3; index += 1) state = (await submitStudentResponse(definition, state, "Réponse", new ScriptedAnalyzer([partial]), fixedClock)).state;
  const result = state.questionStates[0].result!;
  state = { ...state, questionStates: [{ ...state.questionStates[0], result: {
    ...result,
    instructionOmissionObserved: false,
    questionPrompt: "Explique les deux conséquences demandées.",
    omittedInstructionElements: [],
  } }] };
  const summary = produceLocalStructuredSummary(state, [], "2026-07-26T12:00:00.000Z");
  assert.match(summary.readingAdvice ?? "", /repère le verbe de la consigne/);
  assert.match(summary.readingAdvice ?? "", /Pour éviter cet oubli/);
  assert.match(summary.readingAdvice ?? "", /À vérifier\nLa deuxième conséquence n’a pas été expliquée/);
  assert.match(summary.readingAdvice ?? "", /La deuxième conséquence n’a pas été expliquée/);
});

test("une erreur d’interprétation dans une consigne à plusieurs éléments n’est pas un oubli de consigne", async () => {
  const partial = analysis({ missingElements: ["Les expressions négatives montrent que La Fontaine s’oppose à l’Union."] });
  let state = createPedagogicalSession(definition);
  for (let index = 0; index < 3; index += 1) state = (await submitStudentResponse(definition, state, "Réponse", new ScriptedAnalyzer([partial]), fixedClock)).state;
  const result = state.questionStates[0].result!;
  state = { ...state, questionStates: [{ ...state.questionStates[0], result: {
    ...result,
    instructionOmissionObserved: false,
    questionPrompt: "Compare deux points de vue et explique leur différence.",
    omittedInstructionElements: [],
  } }] };
  const summary = produceLocalStructuredSummary(state, []);
  assert.equal(summary.readingAdvice, undefined);
});

test("nomme précisément une connaissance maîtrisée même si la justification documentaire reste à travailler", async () => {
  const partial = analysis({
    historicalAccuracy: "demonstrated",
    primaryOperationPerformance: "partial",
    documentUse: "partial",
    justificationQuality: "partial",
    demonstratedKnowledgeIds: ["points-de-vue-sur-union"],
    observedOperationIds: [],
    missingElements: ["Le point de vue de La Fontaine doit être mieux interprété."],
  });
  const knowledgeQuestion = {
    ...definition.questions[0],
    historicalKnowledgeIds: ["points-de-vue-sur-union"],
    questionPrompt: "Compare les points de vue de Russell et de La Fontaine sur l’Union.",
  };
  const knowledgeDefinition = { ...definition, questions: [knowledgeQuestion] };
  let state = createPedagogicalSession(knowledgeDefinition);
  for (let index = 0; index < 3; index += 1) state = (await submitStudentResponse(knowledgeDefinition, state, "Réponse factuelle sans preuve suffisante", new ScriptedAnalyzer([partial]), fixedClock)).state;
  const summary = produceLocalStructuredSummary(state, []);
  assert.match(summary.strengths[0] ?? "", /^Tu comprends bien les points de vue sur l’Union\n/);
  assert.match(summary.strengths[0] ?? "", /Russell présente l’Union comme une solution politique et économique/);
});

test("regroupe les recommandations de Durham en un seul point fort historique précis", async () => {
  const partial = analysis({
    historicalAccuracy: "demonstrated", primaryOperationPerformance: "partial", documentUse: "partial", justificationQuality: "partial",
    demonstratedKnowledgeIds: ["acte-union", "rapport-durham"], observedOperationIds: [],
    missingElements: ["Quels éléments précis de chacun des deux extraits permettent de reconnaître ces recommandations?"],
  });
  const question = { ...definition.questions[0], historicalKnowledgeIds: ["acte-union", "rapport-durham"], questionPrompt: "Nomme deux recommandations formulées par lord Durham dans son rapport." };
  const customDefinition = { ...definition, questions: [question] };
  let state = createPedagogicalSession(customDefinition);
  for (let index = 0; index < 3; index += 1) state = (await submitStudentResponse(customDefinition, state, "Deux faits justes sans preuve précise", new ScriptedAnalyzer([partial]), fixedClock)).state;
  const summary = produceLocalStructuredSummary(state, []);
  assert.equal(summary.strengths.filter((entry) => entry.startsWith("Tu connais bien")).length, 1);
  assert.match(summary.strengths[0] ?? "", /deux recommandations de Durham/);
  assert.match(summary.consolidationTargets[0] ?? "", /^Déterminer des causes et des conséquences/);
  assert.match(summary.consolidationTargets[0] ?? "", /Conseil exécutif ne signifie pas que le gouvernement responsable est établi/);
});

test("le bilan distingue la maîtrise des connaissances de celle des opérations", async () => {
  const mixed = analysis({
    pedagogicalOutcome: "satisfactory",
    historicalAccuracy: "demonstrated",
    primaryOperationPerformance: "partial",
    demonstratedKnowledgeIds: ["population", "representation"],
    observedOperationIds: ["establish_facts"],
    nextAction: "complete_question",
  });
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse juste mais opération partielle", new ScriptedAnalyzer([mixed]), fixedClock);
  const summary = produceLocalStructuredSummary(transition.state, [], "2026-07-26T12:00:00.000Z");
  assert.deepEqual(summary.historicalKnowledgeResults, [
    { id: "population", status: "mastered" },
    { id: "representation", status: "mastered" },
  ]);
  assert.equal(summary.operationResults.find(({ id }) => id === "establish_facts")?.status, "to_consolidate");
  assert.equal(summary.operationResults.find(({ id }) => id === "causes-and-consequences")?.status, "to_consolidate");
  assert.equal(summary.operationResults.some(({ id }) => id === "relate_facts"), false);
});

const approvedReference: WorkbookReference = {
  id: "reference-1", workbookId: "workbook-1", editionId: "edition-2026", label: "Cahier approuvé",
  pageRange: "12–13", historicalKnowledgeIds: ["population"], approvedByTeacher: true,
};

test("accepte une page approuvée et pertinente sans en inventer", async () => {
  assert.equal(validateWorkbookReference(approvedReference).pageRange, "12–13");
  const provider = new LocalWorkbookReferenceProvider([approvedReference]);
  assert.deepEqual(await provider.findApprovedForKnowledgeIds(["population"]), [approvedReference]);
  assert.deepEqual(await provider.findApprovedForKnowledgeIds(["representation"]), []);
});

test("refuse une page non approuvée", () => {
  assert.throws(() => validateWorkbookReference({ ...approvedReference, approvedByTeacher: false }), /n’est pas approuvée/);
});

test("finalise la séance avec un bilan structuré réutilisable", async () => {
  const satisfactory = analysis({ pedagogicalOutcome: "satisfactory", nextAction: "complete_question", demonstratedKnowledgeIds: ["population"], observedOperationIds: ["establish_facts"] });
  const complete = (await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse", new ScriptedAnalyzer([satisfactory]), fixedClock)).state;
  const finalized = await finalizePedagogicalSession(complete, undefined, new LocalWorkbookReferenceProvider([approvedReference]));
  assert.equal(finalized.summary?.sessionId, "session-1");
  assert.equal(finalized.summary?.workbookReferences.length, 1);
  assert.equal(finalized.summary?.localDemoNotice, "");
});

test("le dépôt temporaire perd ses données à la suppression et est interdit en production", async () => {
  const repository = new InMemoryTemporarySessionRepository("test");
  await repository.save(createPedagogicalSession(definition));
  assert.ok(await repository.findById("session-1"));
  await repository.delete("session-1");
  assert.equal(await repository.findById("session-1"), null);
  assert.throws(() => new InMemoryTemporarySessionRepository("production"), /disabled in production/);
});

test("prépare l’enregistrement du bilan, sa lecture par la Page 2 et la suppression de la conversation", async () => {
  const satisfactory = analysis({ pedagogicalOutcome: "satisfactory", nextAction: "complete_question", demonstratedKnowledgeIds: ["population"], observedOperationIds: ["establish_facts"] });
  const complete = (await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse", new ScriptedAnalyzer([satisfactory]), fixedClock)).state;
  const finalized = await finalizePedagogicalSession(complete);
  assert.ok(finalized.summary);
  const outcomes = new InMemoryPedagogicalOutcomeRepository("test");
  await outcomes.saveSummary(finalized.summary);
  await outcomes.deleteConversation(finalized.sessionId);
  assert.equal((await outcomes.findSummaryByActivityId("activity-1"))?.sessionId, "session-1");
  assert.equal(outcomes.wasConversationDeleted("session-1"), true);
  assert.throws(() => new InMemoryPedagogicalOutcomeRepository("production"), /disabled in production/);
});

test("l’analyseur local est interdit en production", () => {
  assert.throws(() => new LocalDeterministicResponseAnalyzer("production"), /disabled in production/);
});

test("une question sans document demeure compatible", () => {
  const noDocument = { ...question, documentIds: [], requiredDocumentIds: [] };
  const state = createPedagogicalSession({ ...definition, questions: [noDocument] });
  assert.deepEqual(state.questionStates[0].documentIds, []);
});

test("le contexte de retour contient seulement l’identifiant d’activité autorisé", () => {
  const state = createPedagogicalSession(definition);
  assert.equal(state.dashboardHref, "/eleve/tableau-de-bord?activity=activity-1#activite");
  assert.doesNotMatch(state.dashboardHref, /response|feedback|summary|title/);
});

test("la réponse n’est ni conservée dans l’état ni journalisée par le domaine", async () => {
  const secretResponse = "Texte de réponse à ne pas journaliser";
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), secretResponse, new ScriptedAnalyzer([analysis()]), fixedClock);
  assert.doesNotMatch(JSON.stringify(transition.state), new RegExp(secretResponse));
  const sources = ["engine.ts", "local-analyzer.ts", "memory-repository.ts"].map((file) => readFileSync(`lib/pedagogical-session-engine/${file}`, "utf8")).join("\n");
  assert.doesNotMatch(sources, /console\.(log|info|debug|warn|error)/);
});

test("le domaine pur n’importe ni React, ni SDK IA, ni client de base de données, ni appel réseau", () => {
  const sources = ["types.ts", "ports.ts", "validation.ts", "local-analyzer.ts", "feedback.ts", "engine.ts", "summary.ts", "memory-repository.ts", "workbook-references.ts"]
    .map((file) => readFileSync(`lib/pedagogical-session-engine/${file}`, "utf8")).join("\n");
  assert.doesNotMatch(sources, /from ["']react|next\/|openai|anthropic|prisma|postgres|fetch\(|XMLHttpRequest|console\./i);
});

test("documente la correspondance avec les règles PED essentielles", () => {
  const documentation = readFileSync(".agents/Local-Pedagogical-Session-Engine.md", "utf8");
  for (const rule of ["PED-RESP-010", "PED-FDBK-004", "PED-HINT-001", "PED-NONEXP-003", "PED-PROG-021", "PED-AI-004", "PED-PRIV-003"]) {
    assert.match(documentation, new RegExp(rule));
  }
});
