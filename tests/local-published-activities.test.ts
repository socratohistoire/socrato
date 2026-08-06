import assert from "node:assert/strict";
import test from "node:test";
import {
  createLocalPublishedActivity,
  LOCAL_PUBLISHED_ACTIVITIES_KEY,
  readLocalPublishedActivities,
  saveLocalPublishedActivity,
  setLocalPublishedActivityStatus,
} from "../lib/local-published-activities/store.ts";
import { applyLocalPublishedActivitiesToStudentDashboard } from "../lib/local-published-activities/student-dashboard.ts";
import { createLocalTeacherActivitySummaries } from "../lib/local-published-activities/teacher-dashboard.ts";
import { applyLocalActivityToGroupDetail } from "../lib/local-published-activities/group-detail.ts";
import { applyLocalActivityToStudentDetail } from "../lib/local-published-activities/student-detail.ts";
import { LocalTeacherGroupDetailProvider } from "../lib/teacher-group-detail/local-provider.ts";
import { LocalTeacherStudentDetailProvider } from "../lib/teacher-student-detail/local-provider.ts";
import { createDemoStudentDashboard } from "../lib/student-dashboard/demo-provider.ts";
import { createLocalTeacherDashboardData } from "../lib/teacher-dashboard/local-provider.ts";
import type { PedagogicalSummary } from "../lib/pedagogical-session-engine/types.ts";
import type { StudentProgressContract } from "../lib/student-progress/types.ts";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

test("crée et restaure une activité publiée localement", () => {
  const storage = new MemoryStorage();
  const published = createLocalPublishedActivity({
    title: "  Révision locale  ",
    workType: "revision",
    targetedGroupIds: ["group-demo-401"],
    notionIds: ["acte-union"],
    operationId: null,
    questionIds: ["question:acte-union:001"],
  }, new Date("2026-08-05T14:30:00.000Z"));

  saveLocalPublishedActivity(storage, published);

  assert.equal(published.id, "activity-local-1785940200000");
  assert.equal(published.title, "Révision locale");
  assert.equal(published.schemaVersion, 1);
  assert.equal(published.publicationStatus, "published");
  assert.equal(published.updatedAt, published.publishedAt);
  assert.deepEqual(readLocalPublishedActivities(storage), [published]);
});

test("ignore un registre local corrompu et fournit un titre de remplacement", () => {
  const storage = new MemoryStorage();
  storage.setItem(LOCAL_PUBLISHED_ACTIVITIES_KEY, "invalide");
  assert.deepEqual(readLocalPublishedActivities(storage), []);
  assert.equal(createLocalPublishedActivity({ title: " ", workType: "development", targetedGroupIds: [], notionIds: [], operationId: null, questionIds: [] }).title, "Activité sans titre");
});

test("migre automatiquement une activité locale créée avant le contrat versionné", () => {
  const storage = new MemoryStorage();
  storage.setItem(LOCAL_PUBLISHED_ACTIVITIES_KEY, JSON.stringify([{ id: "activity-local-100", title: "Ancienne activité", workType: "revision", publishedAt: "2026-08-05T14:30:00.000Z", targetedGroupIds: ["group-demo-401"], notionIds: ["acte-union"], operationId: null, questionIds: ["question:acte-union:001"] }]));
  const migrated = readLocalPublishedActivities(storage)[0];
  assert.equal(migrated?.schemaVersion, 1);
  assert.equal(migrated?.publicationStatus, "published");
  assert.equal(migrated?.updatedAt, migrated?.publishedAt);
});

test("suspend, archive et réactive une activité sans la supprimer", () => {
  const storage = new MemoryStorage();
  const activity = createLocalPublishedActivity({ title: "Cycle local", workType: "revision", targetedGroupIds: ["group-demo-401"], notionIds: ["acte-union"], operationId: null, questionIds: ["question:acte-union:001"] }, new Date("2026-08-05T14:30:00.000Z"));
  saveLocalPublishedActivity(storage, activity);

  const suspended = setLocalPublishedActivityStatus(storage, activity.id, "suspended");
  assert.equal(suspended[0]?.publicationStatus, "suspended");
  assert.equal(applyLocalPublishedActivitiesToStudentDashboard(createDemoStudentDashboard(), suspended).activities.some(({ id }) => id === activity.id), false);
  assert.equal(setLocalPublishedActivityStatus(storage, activity.id, "archived")[0]?.publicationStatus, "archived");
  const reactivated = setLocalPublishedActivityStatus(storage, activity.id, "published");
  assert.equal(reactivated[0]?.publicationStatus, "published");
  assert.equal(applyLocalPublishedActivitiesToStudentDashboard(createDemoStudentDashboard(), reactivated).activities.some(({ id }) => id === activity.id), true);
});

test("affiche seulement l’activité assignée au groupe de l’élève et ouvre ses questions publiées", () => {
  const assigned = createLocalPublishedActivity({
    title: "Activité assignée",
    workType: "revision",
    targetedGroupIds: ["group-demo-401"],
    notionIds: ["acte-union"],
    operationId: null,
    questionIds: ["question:acte-union:001", "question:acte-union:short-answer-001"],
  }, new Date("2026-08-05T14:30:00.000Z"));
  const otherGroup = { ...assigned, id: "activity-local-other", title: "Autre groupe", targetedGroupIds: ["group-demo-402"] };
  const dashboard = applyLocalPublishedActivitiesToStudentDashboard(createDemoStudentDashboard(), [assigned, otherGroup], "group-demo-401", assigned.id);
  const activity = dashboard.activities.find(({ id }) => id === assigned.id);

  assert.equal(dashboard.selectedActivityId, assigned.id);
  assert.equal(dashboard.activities.some(({ id }) => id === otherGroup.id), false);
  assert.equal(activity?.durationMinutes, 0);
  assert.match(activity?.actionHref ?? "", /published=1/);
  assert.match(activity?.actionHref ?? "", /activityId=activity-local-1785940200000/);
  assert.match(activity?.actionHref ?? "", /questionIds=question%3Aacte-union%3A001%2Cquestion%3Aacte-union%3Ashort-answer-001/);
});

test("fait remonter un bilan structuré au tableau de bord enseignant sans réponse textuelle", () => {
  const activity = createLocalPublishedActivity({
    title: "Activité avec résultat",
    workType: "revision",
    targetedGroupIds: ["group-demo-401"],
    notionIds: ["acte-union"],
    operationId: "establish_facts",
    questionIds: ["question:acte-union:001"],
  }, new Date("2026-08-05T14:30:00.000Z"));
  const outcome: PedagogicalSummary = {
    sessionId: "session-locale",
    activityId: activity.id,
    notionId: "acte-union",
    encouragement: "Bravo.",
    strengths: ["Tu établis correctement les faits."],
    consolidationTargets: ["Précise la justification."],
    operationResults: [{ id: "establish_facts", status: "to_consolidate" }],
    historicalKnowledgeResults: [],
    workbookReferences: [],
    localDemoNotice: "",
    completedAt: "2026-08-05T15:00:00.000Z",
  };
  const summary = createLocalTeacherActivitySummaries([activity], createLocalTeacherDashboardData().groups, { [activity.id]: outcome })[0];

  assert.equal(summary.completedStudentCount, 1);
  assert.equal(summary.resultAvailability, "partial");
  assert.equal(summary.groupPortraits[0]?.completedStudentCount, 1);
  assert.match(summary.groupPortraits[0]?.observation ?? "", /bilan est disponible/);
  assert.doesNotMatch(JSON.stringify(summary), /réponse textuelle|conversation|transcript/i);
});

test("fait remonter une progression en cours sans inventer de bilan", async () => {
  const activity = createLocalPublishedActivity({ title: "Activité en cours", workType: "revision", targetedGroupIds: ["group-demo-401"], notionIds: ["acte-union"], operationId: null, questionIds: ["q1", "q2", "q3", "q4"] }, new Date("2026-08-05T14:30:00.000Z"));
  const progress: StudentProgressContract = {
    schemaVersion: 1, studentId: "local-anonymous-student-1", groupId: "group-demo-401", activityId: activity.id, sessionId: "session", notionId: "acte-union",
    state: "in_progress", currentQuestionIndex: 1, totalQuestions: 4, completedQuestionIds: ["q1"], operationResults: [], historicalKnowledgeResults: [],
    startedAt: "2026-08-05T14:35:00.000Z", updatedAt: "2026-08-05T14:40:00.000Z", completedAt: null,
  };
  const summary = createLocalTeacherActivitySummaries([activity], createLocalTeacherDashboardData().groups, {}, { [activity.id]: progress })[0];
  assert.equal(summary.startedStudentCount, 1);
  assert.equal(summary.completedStudentCount, 0);
  assert.equal(summary.resultAvailability, "awaiting_results");
  assert.match(summary.groupPortraits[0]?.observation ?? "", /1 question sur 4/);

  const base = await new LocalTeacherGroupDetailProvider("test").getGroupDetail(activity.id, "group-demo-401");
  assert.ok(base);
  const detail = applyLocalActivityToGroupDetail(base, activity, undefined, progress);
  assert.equal(detail.students[0]?.activityState, "in_progress");
  assert.equal(detail.students[0]?.progressPercentage, 25);
  assert.equal(detail.students[0]?.studentDetailHref, undefined);
  assert.match(detail.socratoSummary.mastery, /25 %/);
});

test("compose le portrait détaillé du groupe à partir du même bilan local", async () => {
  const activity = createLocalPublishedActivity({ title: "Portrait local", workType: "revision", targetedGroupIds: ["group-demo-401"], notionIds: ["acte-union"], operationId: null, questionIds: ["question:acte-union:001"] }, new Date("2026-08-05T14:30:00.000Z"));
  const outcome: PedagogicalSummary = { sessionId: "session", activityId: activity.id, notionId: "acte-union", encouragement: "Bravo", strengths: ["Bonne maîtrise."], consolidationTargets: ["Précise la justification."], operationResults: [{ id: "establish_facts", status: "to_consolidate" }], historicalKnowledgeResults: [], workbookReferences: [], localDemoNotice: "", completedAt: "2026-08-05T15:00:00.000Z" };
  const base = await new LocalTeacherGroupDetailProvider("test").getGroupDetail(activity.id, "group-demo-401");
  assert.ok(base);
  const detail = applyLocalActivityToGroupDetail(base, activity, outcome);

  assert.equal(detail.activityTitle, "Portrait local");
  assert.equal(detail.completedStudentCount, 1);
  assert.equal(detail.targetedStudentCount, 28);
  assert.equal(detail.students[0]?.displayLabel, "Élève local (fictif)");
  assert.equal(detail.students[0]?.activityState, "completed");
  assert.equal(detail.students[0]?.priority, "high");
  assert.match(detail.students[0]?.studentDetailHref ?? "", /local-anonymous-student-1$/);
});

test("compose le bilan individuel local uniquement depuis le résumé structuré", async () => {
  const activity = createLocalPublishedActivity({ title: "Bilan individuel local", workType: "revision", targetedGroupIds: ["group-demo-401"], notionIds: ["acte-union"], operationId: "establish_facts", questionIds: ["question:acte-union:001"] }, new Date("2026-08-05T14:30:00.000Z"));
  const outcome: PedagogicalSummary = { sessionId: "session", activityId: activity.id, notionId: "acte-union", encouragement: "Bravo, activité terminée.", strengths: ["Tu établis correctement les faits."], consolidationTargets: ["Précise la justification."], operationResults: [{ id: "establish_facts", status: "mastered" }], historicalKnowledgeResults: [{ id: "acte-union", status: "to_consolidate" }], workbookReferences: [], localDemoNotice: "", completedAt: "2026-08-05T15:00:00.000Z" };
  const base = await new LocalTeacherStudentDetailProvider("test").getStudentDetail(activity.id, "group-demo-401", "local-anonymous-student-1");
  assert.ok(base);
  const detail = applyLocalActivityToStudentDetail(base, activity, outcome);

  assert.equal(detail.studentDisplayLabel, "Élève local (fictif)");
  assert.equal(detail.activityTitle, "Bilan individuel local");
  assert.equal(detail.operations[0]?.label, "Établir des faits");
  assert.equal(detail.operations[0]?.status, "mastered");
  assert.equal(detail.historicalKnowledge[0]?.status, "consolidate");
  assert.equal(detail.priorityLabel, "Priorité élevée");
  assert.doesNotMatch(JSON.stringify(detail), /conversation|transcript|studentResponse|messageHistory/i);
});
