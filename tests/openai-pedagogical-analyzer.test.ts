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
    evaluationGuide: { expectedAnswer: "L’Acte d’Union réunit les deux Canadas.", commonErrors: ["Confondre union et séparation."] },
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

const historicalIntent = {
  isHistoricalProposition: true,
  responseDisposition: "substantive",
  confidence: "high",
};

const nonHistoricalIntent = {
  isHistoricalProposition: false,
  responseDisposition: "off_topic",
  confidence: "high",
};

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
  const instructions = String(requestBody?.instructions);
  assert.match(instructions, /Tu es Socrato, un tuteur d’histoire/);
  assert.match(instructions, /Comprends ce que l’élève essaie réellement de dire/);
  assert.match(instructions, /ne redemande jamais un élément déjà démontré/);
  assert.match(instructions, /Choisis le moins d’aide nécessaire/);
  assert.match(instructions, /affirmation liée à la question est substantive/);
  assert.match(instructions, /dialogue est cumulatif et peut compter jusqu’à trois réponses/);
  assert.match(instructions, /Adapte toujours ton intervention au message réel/);
  assert.doesNotMatch(instructions, /patate|oignon|atchoum|article 41/);
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
  let thirdInstructions = "";
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async (_input, init) => {
    calls += 1;
    if (calls === 2) secondInstructions = String((JSON.parse(String(init?.body)) as { instructions?: string }).instructions);
    if (calls === 3) thirdInstructions = String((JSON.parse(String(init?.body)) as { instructions?: string }).instructions);
    const analysis = calls === 1 ? nonExploitable : calls === 2 ? historicalIntent : validAnalysis;
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(analysis) }] }] }), { status: 200 });
  } });
  const relatedResponse = { ...response, content: "La conséquence politique concerne les documents et les revenus réunis." };
  assert.deepEqual(await analyzer.analyze(relatedResponse, question), validAnalysis);
  assert.equal(calls, 3);
  assert.match(secondInstructions, /nature du message/);
  assert.match(thirdInstructions, /lecture spécialisée indépendante/);
});

test("réévalue directement un fragment compréhensible dans le dialogue socratique", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  const rejected = {
    ...validAnalysis,
    responseDisposition: "too_short",
    pedagogicalOutcome: "non_exploitable",
    historicalAccuracy: "not_assessed",
    documentUse: "not_assessed",
    justificationQuality: "not_assessed",
    primaryOperationPerformance: "not_assessed",
    demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [], observedStrengths: [],
    missingElements: ["Reformule."], nextAction: "handle_non_exploitable", confidence: "low",
  };
  const recovered = {
    ...validAnalysis,
    pedagogicalOutcome: "partially_satisfactory",
    nextAction: "request_revision",
    observedStrengths: ["Oui, tu indiques un usage pertinent du fonds commun."],
    missingElements: ["Peux-tu maintenant réunir sa définition et son usage en une phrase?"],
  };
  const outputs = [rejected, recovered];
  let calls = 0;
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async () => {
    const output = outputs[calls++];
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(output) }] }] }), { status: 200 });
  } });
  const result = await analyzer.analyze({ ...response, content: "payer les travaux publics à partir des mêmes revenus", attemptNumber: 3 }, question);
  assert.equal(calls, 2);
  assert.equal(result.pedagogicalOutcome, "partially_satisfactory");
  assert.match(result.observedStrengths[0], /usage pertinent/);
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
    const result = calls === 1 ? nonExploitable : nonHistoricalIntent;
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(result) }] }] }), { status: 200 });
  } });
  assert.deepEqual(await analyzer.analyze({ ...response, content: "J’aime beaucoup les jeux vidéo modernes." }, question), nonExploitable);
  assert.equal(calls, 2);
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
  const corrected = { ...validAnalysis, pedagogicalOutcome: "insufficient" as const, nextAction: "offer_hint" as const };
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async () => {
    calls += 1;
    const result = calls === 1 ? nonExploitable : corrected;
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(result) }] }] }), { status: 200 });
  } });
  const analysis = await analyzer.analyze({
    ...response,
    content: "Le fonds consolidé réunit les revenus pour répondre aux besoins publics et comprend aussi la dette publique.",
  }, question);
  assert.equal(calls, 2);
  assert.equal(analysis.responseDisposition, "substantive");
  assert.equal(analysis.pedagogicalOutcome, "insufficient");
  assert.equal(analysis.nextAction, "offer_hint");
  assert.equal(analysis.missingElements[0], "Précise la conséquence.");
});

test("signale l’échec technique de la réévaluation directe", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  const fundQuestion = {
    ...question,
    evaluationContext: {
      ...question.evaluationContext,
      questionPrompt: "À l’aide du document, explique ce qu’est le fonds consolidé et indique à quoi il sert dans la Province du Canada.",
      evaluationGuide: {
        expectedAnswer: "Le fonds consolidé réunit les revenus des deux Canadas pour payer les dépenses publiques et les dettes.",
        commonErrors: ["Ne mentionner que les dettes sans expliquer la mise en commun des revenus."],
      },
    },
  } satisfies PedagogicalQuestionDefinition;
  const nonExploitable = {
    ...validAnalysis, responseDisposition: "incomprehensible", pedagogicalOutcome: "non_exploitable",
    historicalAccuracy: "not_assessed", documentUse: "not_assessed", justificationQuality: "not_assessed",
    primaryOperationPerformance: "not_assessed", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [],
    observedStrengths: [], missingElements: ["Reformule."], nextAction: "handle_non_exploitable",
  } as const;
  let calls = 0;
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async () => {
    calls += 1;
    if (calls === 2) return new Response(JSON.stringify({ error: { message: "temporary failure" } }), { status: 500 });
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(nonExploitable) }] }] }), { status: 200 });
  } });

  await assert.rejects(() => analyzer.analyze({
    ...response,
    content: "Le fonds consolidé fusionne les argents des deux Canadas.",
  }, fundQuestion), /L’analyse OpenAI a échoué/);

  assert.equal(calls, 2);
});

test("reconnaît l’usage juste du fonds consolidé comme une réponse partielle", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  const fundQuestion = {
    ...question,
    evaluationContext: {
      ...question.evaluationContext,
      questionPrompt: "À l’aide du document, explique ce qu’est le fonds consolidé et indique à quoi il sert dans la Province du Canada.",
      instruction: "Formule une réponse courte qui précise l’origine des sommes et leur utilisation.",
      approvedDocuments: [{
        ...question.evaluationContext.approvedDocuments[0],
        title: "Le fonds consolidé de la Province du Canada",
        content: "Les revenus réunis forment un fonds consolidé qui paie les dépenses publiques et l’intérêt des dettes.",
      }],
    },
  } satisfies PedagogicalQuestionDefinition;
  const nonExploitable = {
    ...validAnalysis, responseDisposition: "incomprehensible", pedagogicalOutcome: "non_exploitable",
    historicalAccuracy: "not_assessed", documentUse: "not_assessed", justificationQuality: "not_assessed",
    primaryOperationPerformance: "not_assessed", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [],
    observedStrengths: [], missingElements: ["Reformule."], nextAction: "handle_non_exploitable",
  } as const;
  const partial = {
    ...validAnalysis,
    observedStrengths: ["Oui, tu indiques correctement que ce fonds sert à payer les dettes communes."],
    missingElements: ["Quelles sommes sont réunies dans ce fonds?"],
  };
  let calls = 0;
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async () => {
    calls += 1;
    const analysis = calls === 1 ? nonExploitable : partial;
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(analysis) }] }] }), { status: 200 });
  } });

  assert.deepEqual(await analyzer.analyze({ ...response, content: "Il sert à payer les dettes des deux canada" }, fundQuestion), partial);
  assert.equal(calls, 2);
});

test("évalue une courte affirmation erronée qui reprend un concept historique central", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  const fundQuestion = {
    ...question,
    evaluationContext: {
      ...question.evaluationContext,
      questionPrompt: "À l’aide du document, explique ce qu’est le fonds consolidé et indique à quoi il sert dans la Province du Canada.",
      evaluationGuide: {
        expectedAnswer: "Les revenus et les dettes des deux Canadas sont réunis dans un fonds consolidé destiné aux dépenses publiques.",
        commonErrors: ["Affirmer que les dettes ne sont pas partagées."],
      },
    },
  } satisfies PedagogicalQuestionDefinition;
  const nonExploitable = {
    ...validAnalysis, responseDisposition: "incomprehensible", pedagogicalOutcome: "non_exploitable",
    historicalAccuracy: "not_assessed", documentUse: "not_assessed", justificationQuality: "not_assessed",
    primaryOperationPerformance: "not_assessed", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [],
    observedStrengths: [], missingElements: ["Reformule."], nextAction: "handle_non_exploitable",
  } as const;
  const corrected = {
    ...validAnalysis,
    pedagogicalOutcome: "insufficient" as const,
    historicalAccuracy: "not_demonstrated" as const,
    observedStrengths: ["Bonne tentative : tu proposes une idée au sujet du partage de la dette."],
    missingElements: ["Que précise le document sur la mise en commun des dettes?"],
    nextAction: "offer_hint" as const,
  };
  let calls = 0;
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async () => {
    calls += 1;
    const result = calls === 1 ? nonExploitable : corrected;
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(result) }] }] }), { status: 200 });
  } });

  const analysis = await analyzer.analyze({ ...response, content: "La dette n’est pas partagée." }, fundQuestion);
  assert.equal(calls, 2);
  assert.equal(analysis.responseDisposition, "substantive");
  assert.equal(analysis.pedagogicalOutcome, "insufficient");
  assert.equal(analysis.nextAction, "offer_hint");
});

test("réanalyse aussi une très courte réponse qui reprend précisément la question", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  const nonExploitable = {
    ...validAnalysis, responseDisposition: "too_short", pedagogicalOutcome: "non_exploitable",
    historicalAccuracy: "not_assessed", documentUse: "not_assessed", justificationQuality: "not_assessed",
    primaryOperationPerformance: "not_assessed", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [],
    observedStrengths: [], missingElements: ["Reformule."], nextAction: "handle_non_exploitable",
  } as const;
  const corrected = { ...validAnalysis, pedagogicalOutcome: "insufficient" as const, nextAction: "offer_hint" as const };
  let calls = 0;
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async () => {
    calls += 1;
    const result = calls === 1 ? nonExploitable : corrected;
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(result) }] }] }), { status: 200 });
  } });
  const analysis = await analyzer.analyze({ ...response, content: "L’Acte d’Union" }, question);
  assert.equal(calls, 2);
  assert.equal(analysis.responseDisposition, "substantive");
  assert.equal(analysis.pedagogicalOutcome, "insufficient");
});

test("traite une négation brève comme une réponse historique évaluable", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  const datedQuestion = {
    ...question,
    evaluationContext: {
      ...question.evaluationContext,
      questionPrompt: "Quelle différence faut-il faire entre l’année 1840 et l’année 1841 concernant l’Acte d’Union?",
    },
  } satisfies PedagogicalQuestionDefinition;
  const nonExploitable = {
    ...validAnalysis, responseDisposition: "too_short", pedagogicalOutcome: "non_exploitable",
    historicalAccuracy: "not_assessed", documentUse: "not_assessed", justificationQuality: "not_assessed",
    primaryOperationPerformance: "not_assessed", demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [],
    observedStrengths: [], missingElements: ["Reformule."], nextAction: "handle_non_exploitable",
  } as const;
  const corrected = {
    ...validAnalysis,
    pedagogicalOutcome: "insufficient" as const,
    historicalAccuracy: "not_demonstrated" as const,
    observedStrengths: ["Bonne tentative : tu proposes qu’il n’y a pas de différence."],
    missingElements: ["Quelle date correspond à l’adoption de la loi, et laquelle à son entrée en vigueur?"],
    nextAction: "offer_hint" as const,
  };
  let calls = 0;
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({ apiKey: "test-key", model: "test-model", fetch: async () => {
    calls += 1;
    const analysis = calls === 1 ? nonExploitable : corrected;
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(analysis) }] }] }), { status: 200 });
  } });
  assert.deepEqual(await analyzer.analyze({ ...response, content: "aucune" }, datedQuestion), corrected);
  assert.equal(calls, 2);
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
  assert.equal(feedback.studentFacingText, "Un lien historique pertinent est amorcé. Que demande le document Acte d’Union au sujet du Conseil législatif?");
  assert.doesNotMatch(feedback.studentFacingText, /document-1|Observe un document autorisé|Ajoute une revendication/);
});

test("permet de revenir temporairement au contrat v1 sans modifier le moteur", async () => {
  const { OpenAIPedagogicalResponseAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  let instructions = "";
  const analyzer = new OpenAIPedagogicalResponseAnalyzer({
    apiKey: "test-key", model: "test-model", contractVersion: "v1",
    fetch: async (_input, init) => {
      instructions = String((JSON.parse(String(init?.body)) as { instructions?: string }).instructions);
      return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify(validAnalysis) }] }] }), { status: 200 });
    },
  });
  await analyzer.analyze(response, question);
  assert.match(instructions, /Exemples de décision/);
  assert.doesNotMatch(instructions, /Tu es Socrato, un tuteur d’histoire/);
});

test("échoue fermé lorsque la configuration est absente", async () => {
  const { createConfiguredOpenAIPedagogicalAnalyzer } = await import("../lib/pedagogical-session-engine/openai-analyzer.ts");
  assert.throws(() => createConfiguredOpenAIPedagogicalAnalyzer({}), /OPENAI_API_KEY/);
});
