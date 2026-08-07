import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createLocalPublishedActivity } from "../lib/local-published-activities/store.ts";
import { validateDemoPublishedActivity } from "../lib/server/published-activities.ts";

const source = readFileSync("lib/server/published-activities.ts", "utf8");
const progressActionsSource = readFileSync("app/eleve/activite/progress-actions.ts", "utf8");
const databaseDashboardSource = readFileSync("lib/student-dashboard/database-provider.ts", "utf8");

test("valide une activité destinée aux groupes de l’enseignant local", () => {
  const activity = createLocalPublishedActivity({
    title: "Publication Supabase",
    workType: "revision",
    targetedGroupIds: ["group-demo-401", "group-demo-402"],
    notionIds: ["acte-union"],
    operationId: null,
    questionIds: ["question:acte-union:001"],
  }, new Date("2026-08-06T14:30:00.000Z"));
  assert.deepEqual(validateDemoPublishedActivity(activity), activity);
});

test("refuse de publier dans un groupe qui n’appartient pas à l’enseignant local", () => {
  const activity = createLocalPublishedActivity({
    title: "Publication interdite",
    workType: "revision",
    targetedGroupIds: ["group-externe"],
    notionIds: ["acte-union"],
    operationId: null,
    questionIds: ["question:acte-union:001"],
  }, new Date("2026-08-06T14:31:00.000Z"));
  assert.throws(() => validateDemoPublishedActivity(activity), /n’appartient pas/);
});

test("valide la publication réelle avec les groupes actifs appartenant à l’enseignant connecté", () => {
  assert.match(source, /where teacher_id = \$\{teacher\.id\}/);
  assert.match(source, /and archived_at is null/);
  assert.match(source, /id = any\(\$\{activity\.targetedGroupIds\}\)/);
  assert.match(source, /ownedGroupIds\.has\(id\)/);
  assert.doesNotMatch(source.match(/export async function saveDemoPublishedActivity[\s\S]*/)?.[0] ?? "", /LOCAL_ACADEMIC_CONTEXT\.groups/);
});

test("enregistre et restitue le bilan final dans la même séance Supabase", () => {
  assert.match(progressActionsSource, /saveStudentOutcomeToDatabase/);
  assert.match(progressActionsSource, /session\.progress_state !== "completed"/);
  assert.match(progressActionsSource, /insert into socrato\.student_outcomes/);
  assert.match(databaseDashboardSource, /left join socrato\.student_outcomes outcomes on outcomes\.session_id = sp\.session_id/);
  assert.match(databaseDashboardSource, /state: "server_structured"/);
});
