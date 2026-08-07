import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const actionPath = new URL("../app/eleve/activite/analysis-actions.ts", import.meta.url);
const viewPath = new URL("../app/eleve/activite/[activityId]/session-view.tsx", import.meta.url);

test("protège l’analyse IA derrière la session et l’activité assignée", async () => {
  const source = await readFile(actionPath, "utf8");
  assert.match(source, /cookies\(\)/);
  assert.match(source, /findActiveByToken/);
  assert.match(source, /DatabaseStudentLearningSessionProvider/);
  assert.match(source, /questions\.find/);
  assert.match(source, /createConfiguredOpenAIPedagogicalAnalyzer/);
  assert.doesNotMatch(source, /console\.(?:log|info|debug|warn|error)/);
});

test("utilise le serveur pour une activité persistée et garde le moteur local pour la démonstration", async () => {
  const source = await readFile(viewPath, "utf8");
  assert.match(source, /data\.source === "server"/);
  assert.match(source, /analyzeAuthorizedStudentResponse/);
  assert.match(source, /new LocalDeterministicResponseAnalyzer\(\)/);
});
