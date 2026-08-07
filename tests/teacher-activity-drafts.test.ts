import assert from "node:assert/strict";
import test from "node:test";
import type { ActivityConfiguration, ActivityCreatorCatalog } from "../lib/teacher-activity-creator/types.ts";
import { clearActiveTeacherActivityDraft, createTeacherActivityDraft, readActiveTeacherActivityDraft, readActiveTeacherActivityDraftSummary, saveTeacherActivityDraft, TEACHER_ACTIVITY_DRAFT_STORAGE_KEY } from "../lib/teacher-activity-drafts/index.ts";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const configuration: ActivityConfiguration = {
  title: "Mon activité", durationMinutes: null, questionCount: 3, selectedGroupIds: ["group-1"], workType: "revision",
  notionIds: ["notion-1"], operationId: "operation-1", questionValidated: true,
};

const catalog = {
  source: "local_demo", groups: [{ id: "group-1", name: "Groupe 1" }],
  notions: [{ id: "notion-1", title: "Notion 1", periodId: "1840-1896", periodLabel: "1840-1896", hasApprovedDocuments: true }],
  operations: [{ id: "operation-1", label: "Opération 1" }], documents: [], questions: [{ id: "question-1" }],
} as unknown as ActivityCreatorCatalog;

test("saves and restores the active activity draft", () => {
  const storage = new MemoryStorage();
  const draft = createTeacherActivityDraft(configuration, { 0: "question-1" }, 2, new Date("2026-08-05T12:00:00.000Z"));
  saveTeacherActivityDraft(storage, draft);
  assert.deepEqual(readActiveTeacherActivityDraft(storage, catalog), draft);
  assert.deepEqual(readActiveTeacherActivityDraftSummary(storage), draft);
});

test("filters references that no longer exist in the current catalog", () => {
  const storage = new MemoryStorage();
  saveTeacherActivityDraft(storage, createTeacherActivityDraft({ ...configuration, selectedGroupIds: ["group-1", "removed"], notionIds: ["notion-1", "removed"], operationId: "removed" }, { 0: "question-1", 1: "removed" }, 1));
  const restored = readActiveTeacherActivityDraft(storage, catalog)!;
  assert.deepEqual(restored.configuration.selectedGroupIds, ["group-1"]);
  assert.deepEqual(restored.configuration.notionIds, ["notion-1"]);
  assert.equal(restored.configuration.operationId, null);
  assert.deepEqual(restored.questionOverrides, { 0: "question-1" });
});

test("rejects invalid data and clears a published draft", () => {
  const storage = new MemoryStorage();
  storage.setItem(TEACHER_ACTIVITY_DRAFT_STORAGE_KEY, JSON.stringify({ "new-activity": { schemaVersion: 99 } }));
  assert.equal(readActiveTeacherActivityDraft(storage, catalog), null);
  saveTeacherActivityDraft(storage, createTeacherActivityDraft(configuration, {}, 0));
  clearActiveTeacherActivityDraft(storage);
  assert.equal(readActiveTeacherActivityDraft(storage, catalog), null);
});
