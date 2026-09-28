import assert from "node:assert/strict";
import test from "node:test";
import { getSharedStrengths, getSharedSummaryDetails } from "../lib/student-dashboard/shared-summary-details.ts";

test("présente les points forts comme des apprentissages précis plutôt que comme des types de réponse", () => {
  const strengths = getSharedStrengths({
    savedStrengths: [],
    questionIds: ["question:acte-union:document-interpretation-002"],
    operationLabels: { causes_and_consequences: "Établir des liens de causalité" },
    questionRuntime: [{
      questionId: "question:acte-union:document-interpretation-002", attemptNumber: 1, hintLevel: 0,
      hintRequestCount: 0, nonExploitableCount: 0, status: "completed",
      lastAnalysis: {
        responseDisposition: "substantive", pedagogicalOutcome: "satisfactory", historicalAccuracy: "demonstrated",
        documentUse: "demonstrated", justificationQuality: "demonstrated", primaryOperationPerformance: "demonstrated",
        demonstratedKnowledgeIds: [], observedOperationIds: [], usedDocumentIds: [],
        observedStrengths: ["Tu expliques précisément que l’Union crée une seule province composée du Canada-Est et du Canada-Ouest."],
        missingElements: [], nextAction: "complete_question", confidence: "high",
      },
    }],
  });
  assert.match(strengths[0] ?? "", /^Comprendre la création de la Province du Canada\n/);
  assert.doesNotMatch(strengths[0] ?? "", /^Établir des liens de causalité/);
});

test("fournit exactement le même bilan précis aux vues élève et enseignant", () => {
  const details = getSharedSummaryDetails({
    consolidationTargets: ["Établir des faits", "Explique le lien entre le refus des réformes et la rupture politique."],
    readingAdvice: undefined,
    genericResultLabels: ["Établir des faits"],
    questionRuntime: [{
      questionId: "question-1", attemptNumber: 2, hintLevel: 1, hintRequestCount: 1, nonExploitableCount: 0, status: "completed",
      instructionOmissionObserved: true,
      questionPrompt: "Explique les deux conséquences demandées.",
      omittedInstructionElements: ["La deuxième conséquence n’a pas été expliquée."],
    }],
  });
  assert.deepEqual(details.consolidationTargets, ["Explique le lien entre le refus des réformes et la rupture politique."]);
  assert.match(details.readingAdvice ?? "", /À la question 1 : « Explique les deux conséquences demandées\. »/);
  assert.match(details.readingAdvice ?? "", /La deuxième conséquence n’a pas été expliquée/);
  assert.match(details.readingAdvice ?? "", /Question[\s\S]*À vérifier[\s\S]*Comment progresser/);
});

test("déduit un conseil de lecture lorsqu’une question à plusieurs éléments a été partiellement traitée", () => {
  const details = getSharedSummaryDetails({
    consolidationTargets: [],
    genericResultLabels: [],
    questionRuntime: [{
      questionId: "question-2", attemptNumber: 2, hintLevel: 1, hintRequestCount: 1, nonExploitableCount: 0, status: "completed",
      questionPrompt: "Explique comment les dettes et la représentation politique alimentent l’opposition.",
      observedDifficulties: ["Expliquer le rôle de la représentation politique égale."],
    }],
  });
  assert.match(details.readingAdvice ?? "", /répondu à toutes les parties/);
  assert.match(details.readingAdvice ?? "", /Expliquer le rôle de la représentation politique égale/);
});

test("donne un seul exemple d’oubli avant les conseils de connaissances", () => {
  const details = getSharedSummaryDetails({
    consolidationTargets: ["Revoir le rôle du gouverneur."],
    readingAdvice: undefined,
    genericResultLabels: [],
    questionRuntime: [
      { questionId: "question-1", attemptNumber: 2, hintLevel: 0, hintRequestCount: 0, nonExploitableCount: 0, status: "completed", instructionOmissionObserved: true, questionPrompt: "Nomme deux raisons.", omittedInstructionElements: ["Une deuxième raison."] },
      { questionId: "question-2", attemptNumber: 2, hintLevel: 0, hintRequestCount: 0, nonExploitableCount: 0, status: "completed", instructionOmissionObserved: true, questionPrompt: "Compare les dettes et les populations.", omittedInstructionElements: ["La comparaison des populations."] },
    ],
  });
  assert.match(details.readingAdvice ?? "", /question 1/);
  assert.doesNotMatch(details.readingAdvice ?? "", /question 2/);
  assert.deepEqual(details.consolidationTargets, ["Revoir le rôle du gouverneur."]);
});
