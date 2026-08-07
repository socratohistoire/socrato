import assert from "node:assert/strict";
import test from "node:test";
import { applyStoredStudentActivityOutcomes, saveStudentActivityOutcome } from "../lib/student-activity-outcomes/browser-store.ts";
import { createDemoStudentDashboard } from "../lib/student-dashboard/demo-provider.ts";
import type { PedagogicalSummary } from "../lib/pedagogical-session-engine/types.ts";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const summary: PedagogicalSummary = {
  sessionId: "session-finale",
  activityId: "demo-teacher-practice-1",
  notionId: "acte-union",
  encouragement: "Bravo, tu as terminé l’activité.",
  strengths: ["Tu établis correctement les faits."],
  consolidationTargets: ["Précise encore tes justifications."],
  operationResults: [{ id: "establish_facts", status: "mastered" }],
  historicalKnowledgeResults: [{ id: "acte-union", status: "to_consolidate" }],
  recommendation: { kind: "optional_consolidation", targetOperationIds: [], targetHistoricalKnowledgeIds: ["acte-union"], label: "Reprendre une activité ciblée." },
  workbookReferences: [],
  localDemoNotice: "",
  completedAt: "2026-08-04T12:00:00.000Z",
};

test("restaure une activité terminée et son bilan depuis le stockage persistant", () => {
  const storage = new MemoryStorage();
  saveStudentActivityOutcome(storage, summary);
  const restored = applyStoredStudentActivityOutcomes(createDemoStudentDashboard(), storage);
  const activity = restored.activities.find(({ id }) => id === summary.activityId);
  assert.equal(activity?.activityStatus, "completed");
  assert.equal(activity?.progressPercentage, 100);
  assert.match(activity?.actionHref ?? "", /#bilan$/);
  assert.deepEqual(activity?.summary.strengths, summary.strengths);
  assert.equal(activity?.operations[0]?.status, "mastered");
  assert.equal(activity?.historicalKnowledge[0]?.status, "consolidate");
});
