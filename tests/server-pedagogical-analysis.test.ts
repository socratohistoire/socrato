import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const actionPath = new URL("../app/eleve/activite/analysis-actions.ts", import.meta.url);
const viewPath = new URL("../app/eleve/activite/[activityId]/session-view.tsx", import.meta.url);
const analyzerPath = new URL("../lib/pedagogical-session-engine/openai-analyzer.ts", import.meta.url);
const failureLogPath = new URL("../lib/server/student-analysis-failures.ts", import.meta.url);

test("protège l’analyse IA derrière la session et l’activité assignée", async () => {
  const source = await readFile(actionPath, "utf8");
  assert.match(source, /cookies\(\)/);
  assert.match(source, /findActiveByToken/);
  assert.match(source, /DatabaseStudentLearningSessionProvider/);
  assert.match(source, /questions\.find/);
  assert.match(source, /createConfiguredOpenAIPedagogicalAnalyzer/);
  assert.match(source, /\(\?:\[-:\]\[a-z0-9\]\+\)\*/);
  assert.doesNotMatch(source, /console\.(?:log|info|debug|warn|error)/);
});

test("annule les appels expirés et journalise anonymement chaque échec", async () => {
  const [actionSource, analyzerSource, failureLogSource] = await Promise.all([
    readFile(actionPath, "utf8"),
    readFile(analyzerPath, "utf8"),
    readFile(failureLogPath, "utf8"),
  ]);
  assert.match(actionSource, /const STUDENT_ANALYSIS_ATTEMPT_TIMEOUT_MS = 20_000/);
  assert.match(actionSource, /controller\.abort/);
  assert.match(actionSource, /recordStudentAnalysisFailure/);
  assert.match(analyzerSource, /signal\?\.addEventListener\("abort"/);
  assert.match(analyzerSource, /requestId/);
  assert.doesNotMatch(failureLogSource, /studentId|sessionId|content/);
});

test("utilise le serveur pour une activité persistée et garde le moteur local pour la démonstration", async () => {
  const source = await readFile(viewPath, "utf8");
  assert.match(source, /data\.source === "server"/);
  assert.match(source, /analyzeAuthorizedStudentResponse/);
  assert.match(source, /new LocalDeterministicResponseAnalyzer\(\)/);
});
