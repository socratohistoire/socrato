import assert from "node:assert/strict";
import test from "node:test";
import { activityStatusRoute, BrowserSocratoDataRepository, createConfiguredDataRepository, HttpSocratoDataRepository, SOCRATO_API_ROUTES, SocratoApiError, studentOutcomeRoute, studentProgressRoute } from "../lib/data-repository/index.ts";
import { createLocalPublishedActivity } from "../lib/local-published-activities/store.ts";
import { createTeacherActivityDraft } from "../lib/teacher-activity-drafts/index.ts";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

test("exposes one replaceable repository for browser data", async () => {
  const repository = new BrowserSocratoDataRepository(new MemoryStorage());
  const activity = createLocalPublishedActivity({ title: "Activité", workType: "revision", targetedGroupIds: ["group-demo-401"], notionIds: ["acte-union"], operationId: null, questionIds: ["q1"] });
  await repository.savePublishedActivity(activity);
  assert.deepEqual(await repository.listPublishedActivities(), [activity]);
  assert.equal((await repository.setPublishedActivityStatus(activity.id, "suspended"))[0]?.publicationStatus, "suspended");

  const draft = createTeacherActivityDraft({ title: "Brouillon", durationMinutes: null, questionCount: 1, selectedGroupIds: [], workType: "revision", notionIds: [], operationId: null, questionValidated: false }, {}, 0);
  await repository.saveDraft(draft);
  assert.deepEqual(await repository.readActiveDraftSummary(), draft);
  await repository.clearActiveDraft();
  assert.equal(await repository.readActiveDraftSummary(), null);
});

test("assembles the student dashboard behind the repository boundary", async () => {
  const repository = new BrowserSocratoDataRepository(new MemoryStorage());
  assert.equal(typeof repository.loadStudentDashboard, "function");
});

test("keeps progress and outcomes behind the same repository boundary", async () => {
  const repository = new BrowserSocratoDataRepository(new MemoryStorage());
  const progress = { schemaVersion: 1 as const, studentId: "student", groupId: "group", activityId: "activity", sessionId: "session", notionId: "notion", state: "in_progress" as const, currentQuestionIndex: 0, totalQuestions: 2, completedQuestionIds: ["q1"], operationResults: [], historicalKnowledgeResults: [], startedAt: "2026-08-05T12:00:00.000Z", updatedAt: "2026-08-05T12:05:00.000Z", completedAt: null };
  await repository.saveStudentProgress(progress);
  assert.deepEqual((await repository.listStudentProgress()).activity, progress);
  await repository.clearStudentProgress("activity");
  assert.deepEqual(await repository.listStudentProgress(), {});
});

test("versions and centralizes the future API routes", () => {
  assert.equal(SOCRATO_API_ROUTES.studentDashboard, "/api/v1/student/dashboard");
  assert.equal(activityStatusRoute("activity/1"), "/api/v1/teacher/activities/activity%2F1/status");
  assert.equal(studentProgressRoute("activity/1"), "/api/v1/student/progress/activity%2F1");
  assert.equal(studentOutcomeRoute("activity/1"), "/api/v1/student/outcomes/activity%2F1");
});

test("keeps the HTTP repository inactive but ready for an authenticated server", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const repository = new HttpSocratoDataRepository({
    baseUrl: "https://server.example/",
    fetch: (async (url, init) => {
      requests.push({ url: String(url), init });
      return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
    }) as typeof fetch,
  });
  await repository.listStudentProgress();
  assert.equal(requests[0]?.url, "https://server.example/api/v1/student/progress");
  assert.equal(requests[0]?.init?.credentials, "include");
});

test("turns a structured API failure into a useful repository error", async () => {
  const repository = new HttpSocratoDataRepository({
    baseUrl: "https://server.example",
    fetch: (async () => new Response(JSON.stringify({ error: { code: "unauthorized", message: "Session expirée." } }), { status: 401, headers: { "Content-Type": "application/json" } })) as typeof fetch,
  });
  await assert.rejects(repository.listPublishedActivities(), (error) => error instanceof SocratoApiError && error.status === 401 && error.code === "unauthorized");
});

test("uses local data by default and requires explicit complete server configuration", () => {
  const storage = new MemoryStorage();
  assert.ok(createConfiguredDataRepository(storage, { mode: "local" }) instanceof BrowserSocratoDataRepository);
  assert.ok(createConfiguredDataRepository(storage, { mode: "server", apiBaseUrl: "https://server.example" }) instanceof HttpSocratoDataRepository);
  assert.throws(() => createConfiguredDataRepository(storage, { mode: "server" }), /API_BASE_URL/);
  assert.throws(() => createConfiguredDataRepository(storage, { mode: "automatic" }), /inconnue/);
});
