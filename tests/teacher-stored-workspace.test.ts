import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createStoredTeacherDashboardData, createTeacherDashboardViewModel } from "../lib/teacher-dashboard/index.ts";
import type { TeacherActor } from "../lib/authentication/teacher-session.ts";

const teacher: TeacherActor = {
  id: "teacher-local-test",
  identityProviderSubject: "local-test",
  displayName: "Camille Roy",
  email: null,
  onboardingCompletedAt: "2026-08-06T12:00:00.000Z",
};

const pageSource = readFileSync("app/teacher/page.tsx", "utf8");
const viewSource = readFileSync("app/teacher/teacher-dashboard-view.tsx", "utf8");
const wizardActionsSource = readFileSync("app/teacher/onboarding-actions.ts", "utf8");
const storedGroupsSource = readFileSync("lib/server/teacher-groups.ts", "utf8");
const creatorPageSource = readFileSync("app/teacher/activities/new/page.tsx", "utf8");

test("aucun groupe persisté produit un espace vide sans fixture de démonstration", () => {
  const data = createStoredTeacherDashboardData(teacher, []);
  const viewModel = createTeacherDashboardViewModel(data);
  assert.equal(data.source, "stored_teacher_workspace");
  assert.deepEqual(data.groups, []);
  assert.deepEqual(viewModel.allGroups, []);
  assert.equal(JSON.stringify(data).includes("Groupe fictif"), false);
  assert.match(viewSource, /Aucun groupe n’a encore été créé ou importé/);
  assert.match(viewSource, /Créer ou importer un groupe/);
});

test("les groupes créés par le wizard deviennent l’unique source du tableau de bord", () => {
  const groups = [{ id: "group-wizard-1", name: "Histoire 404", studentCount: 27 }];
  const data = createStoredTeacherDashboardData(teacher, groups);
  assert.deepEqual(data.groups.map(({ id, name, studentCount }) => ({ id, name, studentCount })), groups);
  assert.doesNotMatch(JSON.stringify(data), /group-demo-|Groupe fictif|Liam B\.|Maya L\./);
  assert.match(pageSource, /createStoredTeacherDashboardData\(authenticatedTeacher, storedTeacherGroups\)/);
  assert.match(creatorPageSource, /groups: storedGroups\.map/);
});

test("création et rechargement relisent le même stockage serveur persistant", () => {
  assert.match(wizardActionsSource, /insert into socrato\.groups/);
  assert.match(wizardActionsSource, /insert into socrato\.group_memberships/);
  assert.match(storedGroupsSource, /from socrato\.groups g/);
  assert.match(storedGroupsSource, /where g\.teacher_id = \$\{teacherId\}/);
  assert.match(pageSource, /Promise\.all\(\[[\s\S]*listStoredTeacherGroups\(authenticatedTeacher\.id\)[\s\S]*listStoredTeacherActivities\(authenticatedTeacher\.id\)/);
  assert.match(pageSource, /export const dynamic = "force-dynamic"/);
});

test("les fixtures ne sont chargées que lorsque le mode démo est explicite", () => {
  assert.match(pageSource, /explicitDemoMode = resolvedSearchParams\.demo === "1"/);
  assert.match(pageSource, /explicitDemoMode[\s\S]*new LocalDemoTeacherDashboardProvider/);
  assert.match(pageSource, /: createStoredTeacherDashboardData/);
  assert.match(viewSource, /data\.source === "stored_teacher_workspace"/);
  assert.doesNotMatch(viewSource, /storedTeacherGroups\.length > 0/);
});

test("les pages groupe et élève partagent les tables et contrôles d’appartenance du wizard", () => {
  assert.match(storedGroupsSource, /getStoredTeacherGroupDetail/);
  assert.match(storedGroupsSource, /getStoredTeacherStudentDetail/);
  assert.match(storedGroupsSource, /g\.teacher_id = \$\{teacher\.id\}/);
  assert.match(storedGroupsSource, /studentDetailHref: `\/teacher\/groups\//);
});
