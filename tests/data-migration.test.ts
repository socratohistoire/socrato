import assert from "node:assert/strict";
import test from "node:test";
import { BrowserSocratoDataRepository } from "../lib/data-repository/index.ts";
import { createLocalMigrationPreview } from "../lib/data-migration/index.ts";
import { createLocalPublishedActivity } from "../lib/local-published-activities/store.ts";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

test("creates a dry-run bundle without demo groups or network transfer", async () => {
  const repository = new BrowserSocratoDataRepository(new MemoryStorage());
  const activity = createLocalPublishedActivity({ title: "À transférer", workType: "revision", targetedGroupIds: ["group-demo-401"], notionIds: ["acte-union"], operationId: null, questionIds: ["q1"] }, new Date("2026-08-05T12:00:00.000Z"));
  await repository.savePublishedActivity(activity);
  const preview = await createLocalMigrationPreview(repository, [], new Date("2026-08-05T13:00:00.000Z"));
  assert.equal(preview.dryRun, true);
  assert.deepEqual(preview.activities[0]?.targetedGroupIds, []);
  assert.equal(preview.requiresGroupMapping, true);
  assert.match(preview.checksum, /^fnv1a-[0-9a-f]{8}$/);
});

test("detects server duplicates before import", async () => {
  const repository = new BrowserSocratoDataRepository(new MemoryStorage());
  const activity = createLocalPublishedActivity({ title: "Déjà importée", workType: "revision", targetedGroupIds: [], notionIds: ["acte-union"], operationId: null, questionIds: ["q1"] }, new Date("2026-08-05T12:00:00.000Z"));
  await repository.savePublishedActivity(activity);
  const preview = await createLocalMigrationPreview(repository, [activity.id]);
  assert.equal(preview.activities.length, 0);
  assert.deepEqual(preview.excluded, [{ kind: "activity", id: activity.id, reason: "already_on_server" }]);
});
