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
  produceLocalStructuredSummary,
  requestNextHint,
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
  const expected = "Ta réponse a bien été reçue. Pour poursuivre, ajoute un fait précis tiré des documents et explique le lien que tu établis.";
  assert.equal(transition.feedback?.studentFacingText, expected);
  assert.equal(transition.feedback?.studentFacingText.match(/Ta réponse a bien été reçue/g)?.length, 1);
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
  assert.equal(state.questionStates[0].result?.status, "to_consolidate");
  await assert.rejects(() => submitStudentResponse(definition, state, "Quatrième", analyzer, fixedClock), /aucune question active/);
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

test("rejette les identifiants inconnus et neutralise la transition", async () => {
  const invalid = { ...analysis(), demonstratedKnowledgeIds: ["unknown-knowledge"] };
  assert.throws(() => validateStructuredAnalysis(invalid, question), /identifiant.*non autorisé/);
  const transition = await submitStudentResponse(definition, createPedagogicalSession(definition), "Réponse", new ScriptedAnalyzer([invalid]), fixedClock);
  assert.equal(transition.state.questionStates[0].lastAnalysis?.responseDisposition, "incomprehensible");
  assert.deepEqual(transition.state.questionStates[0].lastAnalysis?.demonstratedKnowledgeIds, []);
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
  assert.deepEqual(summary.operationResults.map(({ id }) => id), ["establish_facts", "causes-and-consequences", "relate_facts"]);
  assert.equal(summary.recommendation?.kind, "optional_consolidation");
  assert.doesNotMatch(JSON.stringify(summary), /not_assessed|Réponse/);
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
