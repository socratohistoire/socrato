import assert from "node:assert/strict";
import test from "node:test";
import type { PedagogicalQuestionDefinition, StructuredResponseAnalysis } from "../lib/pedagogical-session-engine/types.ts";

const question = {
  id: "q-1", notionId: "acte-union", primaryOperationId: "causes_and_consequences",
  operationIds: ["causes_and_consequences"], historicalKnowledgeIds: ["knowledge-1"],
  documentIds: ["document-1"], requiredDocumentIds: ["document-1"], hintSequence: { 1: "Indice 1", 2: "Indice 2" },
  evaluationContext: {
    questionPrompt: "Explique une conséquence politique de l’Acte d’Union.", instruction: "Appuie-toi sur le document.",
    notionTitle: "Acte d’union", primaryOperationLabel: "Déterminer des causes et des conséquences",
    successCriteria: ["Identifie une conséquence et l’explique."],
    referenceMonograph: { id: "historical-record:acte-union", title: "Monographie de l’Acte d’Union", scope: "Acte d’Union", scopeBoundary: "Gouvernement responsable traité ailleurs.", sections: [{ id: "mono-1", title: "Union", paragraphs: [{ id: "p-1", text: "L’Acte d’Union réunit les deux Canadas.", sourceIds: ["source-1"] }] }] },
    pedagogicalRules: ["Une réponse partielle reçoit une question ciblée."],
    approvedDocuments: [{ id: "document-1", title: "Acte d’Union", typeLabel: "Extrait", attribution: "Parlement britannique · 1840", content: "Les revenus sont réunis pour les besoins publics." }],
  },
} satisfies PedagogicalQuestionDefinition;

const response = {
  sessionId: "session-secret", activityId: "activity-1", questionId: "q-1", notionId: "acte-union",
  primaryOperationId: "causes_and_consequences", operationIds: ["causes_and_consequences"],
  historicalKnowledgeIds: ["knowledge-1"], documentIds: ["document-1"], attemptNumber: 1, hintLevel: 0 as const,
  content: "Le document montre une conséquence politique de l’Acte d’Union.",
};

const validAnalysis = {
  responseDisposition: "substantive", pedagogicalOutcome: "partially_satisfactory",
  historicalAccuracy: "partial", documentUse: "partial", justificationQuality: "partial",
  primaryOperationPerformance: "partial", demonstratedKnowledgeIds: ["knowledge-1"],
  observedOperationIds: ["causes_and_consequences"], usedDocumentIds: ["document-1"],
  observedStrengths: ["Un lien historique pertinent est amorcé."], missingElements: ["Précise la conséquence."],
  nextAction: "request_revision", confidence: "medium",
} satisfies StructuredResponseAnalysis;

test("envoie une requête sans conservation et valide la sortie structurée", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  let requestBody: Record<string, unknown> | undefined;
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(validAnalysis) }] }] }), { status: 200 });
  } });
  assert.deepEqual(await analyzer.analyze(response, question), validAnalysis);
  assert.equal(requestBody?.store, false);
  assert.equal(requestBody?.model, "test-model");
  assert.equal(JSON.stringify(requestBody).includes("session-secret"), false);
  assert.match(String(requestBody?.input), /Explique une conséquence politique/);
  assert.match(String(requestBody?.input), /Les revenus sont réunis/);
  assert.match(String(requestBody?.input), /L’Acte d’Union réunit les deux Canadas/);
  assert.match(String(requestBody?.input), /Une réponse partielle reçoit une question ciblée/);
  assert.match(String(requestBody?.instructions), /dossier pédagogique approuvé/);
  assert.match(String(requestBody?.instructions), /toute affirmation historique compréhensible/);
  assert.match(String(requestBody?.instructions), /même si elle est très courte, incomplète/);
  assert.match(String(requestBody?.instructions), /substantive ne doit jamais produire pedagogicalOutcome=non_exploitable/);
  assert.match(String(requestBody?.instructions), /Les Britanniques refusent les demandes des Patriotes/);
  assert.match(String(requestBody?.instructions), /accomplit l’opération intellectuelle centrale/);
  assert.match(String(requestBody?.instructions), /documentUse=partial/);
  assert.match(String(requestBody?.instructions), /ne nomme pas explicitement le journal/);
  assert.match(String(requestBody?.instructions), /ton chaleureux, encourageant et naturel/);
  assert.match(String(requestBody?.instructions), /Commence observedStrengths\[0\] par une reconnaissance brève/);
  assert.match(String(requestBody?.instructions), /Évite les formulations vagues comme « tu as repéré »/);
  assert.match(String(requestBody?.instructions), /une seule question d’aide courte, de 22 mots au maximum/);
  assert.match(String(requestBody?.instructions), /N’utilise jamais l’identifiant interne d’un document/);
  assert.match(String(requestBody?.instructions), /missingElements peut contenir une seule précision historique brève/);
  assert.match(String(requestBody?.instructions), /Évite les conseils génériques/);
  assert.match(String(requestBody?.instructions), /ne fournis jamais la réponse complète/);
  assert.match(String(requestBody?.instructions), /Évalue cumulativement ces acquis avec la nouvelle réponse/);
});

test("transmet les acquis structurés du tour précédent sans conserver son texte", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  let input = "";
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async (_input, init) => {
    input = String((JSON.parse(String(init?.body)) as { input?: string }).input);
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify({ ...validAnalysis, pedagogicalOutcome: "satisfactory", nextAction: "complete_question" }) }] }] }), { status: 200 });
  } });
  await analyzer.analyze({
    ...response,
    content: "Canada-Est et Canada-Ouest",
    attemptNumber: 2,
    priorTurn: {
      pedagogicalOutcome: "partially_satisfactory",
      observedStrengths: ["Tu as correctement nommé la Province du Canada."],
      missingElements: ["Quelles sont ses deux sections?"],
    },
  }, question);
  assert.match(input, /correctement nommé la Province du Canada/);
  assert.match(input, /Quelles sont ses deux sections/);
  assert.match(input, /Canada-Est et Canada-Ouest/);
  assert.doesNotMatch(input, /texte précédent de l’élève/i);
});

test("refuse les identifiants inventés par le modèle", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: JSON.stringify({ ...validAnalysis, demonstratedKnowledgeIds: ["invented"] }) }] }],
  }), { status: 200 }) });
  await assert.rejects(() => analyzer.analyze(response, question), /non autorisé/);
});

test("réanalyse une idée clairement liée avant de la déclarer non exploitable", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  const nonExploitable = {
    ...validAnalysis, responseDisposition: "off_topic", pedagogicalOutcome: "non_exploitable",
    historicalAccuracy: "not_assessed", documentUse: "not_assessed", justificationQuality: "not_assessed",
    primaryOperationPerformance: "not_assessed", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [],
    observedStrengths: [], missingElements: ["Reformule."], nextAction: "handle_non_exploitable",
  };
  let calls = 0;
  let secondInstructions = "";
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async (_input, init) => {
    calls += 1;
    if (calls === 2) secondInstructions = String((JSON.parse(String(init?.body)) as { instructions?: string }).instructions);
    const analysis = calls === 1 ? nonExploitable : validAnalysis;
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(analysis) }] }] }), { status: 200 });
  } });
  const relatedResponse = { ...response, content: "La conséquence politique concerne les documents et les revenus réunis." };
  assert.deepEqual(await analyzer.analyze(relatedResponse, question), validAnalysis);
  assert.equal(calls, 2);
  assert.match(secondInstructions, /Révision obligatoire/);
  assert.match(secondInstructions, /responseDisposition=substantive/);
});

test("ne réanalyse pas une réponse réellement hors sujet", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  const nonExploitable = {
    ...validAnalysis, responseDisposition: "off_topic", pedagogicalOutcome: "non_exploitable",
    historicalAccuracy: "not_assessed", documentUse: "not_assessed", justificationQuality: "not_assessed",
    primaryOperationPerformance: "not_assessed", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [],
    observedStrengths: [], missingElements: ["Reformule."], nextAction: "handle_non_exploitable",
  };
  let calls = 0;
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async () => {
    calls += 1;
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(nonExploitable) }] }] }), { status: 200 });
  } });
  assert.deepEqual(await analyzer.analyze({ ...response, content: "J’aime beaucoup les jeux vidéo modernes." }, question), nonExploitable);
  assert.equal(calls, 1);
});

test("empêche un faux rejet répété pour une idée manifestement liée", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  const nonExploitable = {
    ...validAnalysis, responseDisposition: "incomprehensible", pedagogicalOutcome: "non_exploitable",
    historicalAccuracy: "not_assessed", documentUse: "not_assessed", justificationQuality: "not_assessed",
    primaryOperationPerformance: "not_assessed", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [],
    observedStrengths: [], missingElements: ["Reformule."], nextAction: "handle_non_exploitable",
  };
  let calls = 0;
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async () => {
    calls += 1;
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(nonExploitable) }] }] }), { status: 200 });
  } });
  const analysis = await analyzer.analyze({
    ...response,
    content: "Le fonds consolidé réunit les revenus pour répondre aux besoins publics et comprend aussi la dette publique.",
  }, question);
  assert.equal(calls, 2);
  assert.equal(analysis.responseDisposition, "substantive");
  assert.equal(analysis.pedagogicalOutcome, "insufficient");
  assert.equal(analysis.nextAction, "offer_hint");
  assert.match(analysis.missingElements[0], /Dans « Acte d’Union »/);
});

test("réanalyse aussi une très courte réponse qui reprend précisément la question", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  const nonExploitable = {
    ...validAnalysis, responseDisposition: "too_short", pedagogicalOutcome: "non_exploitable",
    historicalAccuracy: "not_assessed", documentUse: "not_assessed", justificationQuality: "not_assessed",
    primaryOperationPerformance: "not_assessed", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [],
    observedStrengths: [], missingElements: ["Reformule."], nextAction: "handle_non_exploitable",
  } as const;
  let calls = 0;
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async () => {
    calls += 1;
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(nonExploitable) }] }] }), { status: 200 });
  } });
  const analysis = await analyzer.analyze({ ...response, content: "L’Acte d’Union" }, question);
  assert.equal(calls, 2);
  assert.equal(analysis.responseDisposition, "substantive");
  assert.equal(analysis.pedagogicalOutcome, "insufficient");
});

test("ne force pas la réanalyse d’une demande d’aide explicite", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  const nonExploitable = {
    ...validAnalysis, responseDisposition: "too_short", pedagogicalOutcome: "non_exploitable",
    historicalAccuracy: "not_assessed", documentUse: "not_assessed", justificationQuality: "not_assessed",
    primaryOperationPerformance: "not_assessed", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [],
    observedStrengths: [], missingElements: ["Reformule."], nextAction: "handle_non_exploitable",
  } as const;
  let calls = 0;
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async () => {
    calls += 1;
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(nonExploitable) }] }] }), { status: 200 });
  } });
  await analyzer.analyze({ ...response, content: "Je ne me souviens plus" }, question);
  assert.equal(calls, 1);
});

test("présente une relance chaleureuse sans code interne ni consigne répétée", async () => {
  const { createPedagogicalFeedback } = await import("../lib/pedagogical-session-engine/feedback.ts");
  const feedback = createPedagogicalFeedback({
    ...validAnalysis,
    missingElements: ["Ajoute une revendication précise, puis relie-la au refus : que demande le document document-1 au sujet du Conseil législatif?"],
  }, question, 0);
  assert.equal(feedback.studentFacingText, "Un lien historique pertinent est amorcé. C’est un bon début. Il reste un lien à préciser. Que demande le document Acte d’Union au sujet du Conseil législatif?");
  assert.doesNotMatch(feedback.studentFacingText, /document-1|Observe un document autorisé|Ajoute une revendication/);
});

test("échoue fermé lorsque la configuration est absente", async () => {
  const { createConfiguredOpenAIPedagogicalAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  assert.throws(() => createConfiguredOpenAIPedagogicalAnalyzer({}), /OPENAI_API_KEY/);
});
