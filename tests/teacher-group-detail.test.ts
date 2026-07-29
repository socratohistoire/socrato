import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { filterTeacherGroupStudents, isAuthorizedLocalTeacherGroupContext, isSafeTeacherContextId, LocalTeacherGroupDetailProvider, TEACHER_GROUP_STATE_LABELS, createTeacherGroupDetailViewModel, isLocalTeacherGroupDetailEnabled } from "../lib/teacher-group-detail/index.ts";

const routeSource = readFileSync("app/teacher/activities/[activityId]/groups/[groupId]/page.tsx", "utf8");
const viewSource = readFileSync("app/teacher/activities/[activityId]/groups/[groupId]/teacher-group-detail-view.tsx", "utf8");
const cssSource = readFileSync("app/teacher/activities/[activityId]/groups/[groupId]/teacher-group-detail.css", "utf8");
const providerSource = readFileSync("lib/teacher-group-detail/local-provider.ts", "utf8");

async function localViewModel() {
  const record = await new LocalTeacherGroupDetailProvider("test").getGroupDetail("activity-revision-01", "group-demo-401");
  assert.ok(record);
  return createTeacherGroupDetailViewModel(record);
}

test("protège la route locale et valide les deux identifiants côté serveur", () => {
  assert.match(routeSource, /if \(!isLocalTeacherGroupDetailEnabled\(\)\) notFound\(\)/);
  assert.match(routeSource, /isSafeTeacherContextId\(activityId\).*isSafeTeacherContextId\(groupId\)/);
  assert.match(routeSource, /if \(!record\) notFound\(\)/);
  assert.equal(isSafeTeacherContextId("activity-revision-01"), true);
  assert.equal(isSafeTeacherContextId("../secret"), false);
  assert.equal(isAuthorizedLocalTeacherGroupContext("activity-revision-01", "group-demo-401"), true);
  assert.equal(isAuthorizedLocalTeacherGroupContext("activity-revision-01", "group-demo-999"), false);
});

test("le fournisseur local échoue fermé en production et replie les contextes inconnus", async () => {
  assert.equal(isLocalTeacherGroupDetailEnabled("production"), false);
  await assert.rejects(() => new LocalTeacherGroupDetailProvider("production").getGroupDetail("activity-revision-01", "group-demo-401"), /disabled in production/);
  assert.equal(await new LocalTeacherGroupDetailProvider("test").getGroupDetail("unknown", "group-demo-401"), null);
});

test("fournit le groupe 401 et six identités explicitement fictives", async () => {
  const data = await localViewModel();
  assert.equal(data.activityTitle, "Révision avant l’évaluation 1");
  assert.equal(data.groupName, "Groupe fictif 401");
  assert.equal(data.completedStudentCount, 21);
  assert.equal(data.targetedStudentCount, 24);
  assert.equal(data.participationPercentage, 88);
  assert.equal(data.students.length, 6);
  assert.deepEqual(data.students.map(({ displayLabel }) => displayLabel), ["Liam B. (fictif)", "Maya L. (fictive)", "Sofia P. (fictive)", "Émile R. (fictif)", "Nora T. (fictive)", "Adam C. (fictif)"]);
  assert.ok(data.students.every(({ displayLabel }) => /\(ficti(?:f|ve)\)$/.test(displayLabel)));
});

test("compose la synthèse depuis les données et conserve le retour contextuel", async () => {
  const data = await localViewModel();
  assert.equal(data.socratoSummaryText, "Le groupe maîtrise généralement les connaissances ciblées. La justification à l’aide des documents demeure le principal défi.");
  assert.equal(data.returnHref, "/teacher?activity=activity-revision-01");
  assert.doesNotMatch(viewSource, /Le groupe maîtrise généralement|principal défi/);
  assert.match(viewSource, /href=\{data\.returnHref\}>← Retour à l’espace enseignant/);
});

test("combine les filtres de priorité et d’état avec un état vide", async () => {
  const { students } = await localViewModel();
  assert.equal(filterTeacherGroupStudents(students, "all", "all").length, 6);
  assert.deepEqual(filterTeacherGroupStudents(students, "high", "completed").map(({ displayLabel }) => displayLabel), ["Liam B. (fictif)", "Maya L. (fictive)"]);
  assert.deepEqual(filterTeacherGroupStudents(students, "high", "in_progress").map(({ displayLabel }) => displayLabel), ["Sofia P. (fictive)"]);
  assert.equal(filterTeacherGroupStudents(students, "high", "not_started").length, 0);
  assert.match(viewSource, /Aucun élève ne correspond à ces filtres/);
});

test("présente les trois états et les deux priorités sans détail pédagogique excessif", async () => {
  const data = await localViewModel();
  assert.deepEqual(TEACHER_GROUP_STATE_LABELS, { completed: "Terminée", in_progress: "En cours", not_started: "Non commencée" });
  assert.deepEqual(new Set(data.students.map(({ priority }) => priority)), new Set(["high", "normal"]));
  assert.doesNotMatch(JSON.stringify(data.students), /historicalKnowledge|intellectualOperation|conversation|transcript|studentResponse|messageHistory/i);
  assert.match(viewSource, /Priorité élevée.*Suivi normal/);
});

test("n’active aucun faux lien vers un élève", async () => {
  const data = await localViewModel();
  assert.equal(data.students[0].studentDetailHref, "/teacher/activities/activity-revision-01/groups/group-demo-401/students/student-demo-a17");
  assert.ok(data.students.slice(1).every(({ studentDetailHref }) => studentDetailHref === undefined));
  assert.match(viewSource, /if \(student\.studentDetailHref\) return <Link/);
  assert.match(viewSource, /disabled aria-disabled="true" aria-label=\{`\$\{label\} — Fonction à venir`\}/);
  assert.doesNotMatch(viewSource, /href="#"|\/students\/student-demo/);
});

test("rend le contrat principal accessible, thémable et responsive", () => {
  assert.match(viewSource, /<header className="group-detail-topbar"><Link[^>]*>← Retour à l’espace enseignant<\/Link><div className="group-detail-heading"><h1 id="group-detail-title">\{data\.groupName\}<\/h1><p>\{data\.activityTitle\}<\/p><\/div><ThemeToggle \/><\/header>/);
  assert.doesNotMatch(viewSource, /<section className="group-detail-hero">[\s\S]*data\.groupName|<section className="group-detail-hero">[\s\S]*data\.activityTitle/);
  assert.match(viewSource, /className="group-participation-summary"[^>]*>[\s\S]*data\.completedStudentCount[\s\S]*élèves sur[\s\S]*data\.targetedStudentCount[\s\S]*ont terminé/);
  assert.match(cssSource, /\.group-detail-topbar\{[^}]*grid-template-columns:minmax\(190px,1fr\) minmax\(280px,1\.4fr\) minmax\(190px,1fr\)/);
  assert.match(cssSource, /\.group-detail-content\{min-height:100vh;row-gap:23px\}/);
  assert.match(cssSource, /\.group-detail-topbar\{[^}]*min-height:112px[^}]*padding:19px 0 16px/);
  assert.match(cssSource, /\.group-detail-heading p\{margin:5px 0 0/);
  assert.match(cssSource, /\.group-detail-heading\{[^}]*text-align:center/);
  assert.match(cssSource, /\.group-detail-hero\{[^}]*grid-template-columns:minmax\(250px,\.85fr\) minmax\(360px,1\.5fr\)[^}]*padding:18px 24px/);
  assert.match(cssSource, /\.group-socrato-summary\{[^}]*border-left:1px solid var\(--teacher-border\)/);
  assert.match(viewSource, /<table><thead><tr><th scope="col">Élève/);
  assert.match(viewSource, /<th scope="row" data-label="Élève">/);
  assert.match(viewSource, /aria-label="Filtrer selon la priorité"/);
  assert.match(viewSource, /aria-label="Tous les états"/);
  assert.match(viewSource, /<ThemeToggle \/>/);
  assert.match(cssSource, /min-height:44px/);
  assert.match(cssSource, /\.priority-filter\{[^}]*border:1px solid color-mix\(in srgb,var\(--teacher-gold\) 72%,var\(--teacher-border\)\)/);
  assert.match(cssSource, /\.priority-filter button\[aria-pressed="true"\]\{[^}]*background:color-mix\(in srgb,var\(--teacher-plum\) 22%,var\(--teacher-card\)\)[^}]*box-shadow:none/);
  assert.match(cssSource, /\.activity-state,\.student-priority\{[^}]*border:1px solid currentColor/);
  assert.match(cssSource, /\[data-theme="dark"\] \.teacher-group-detail-page \.activity-state--completed/);
  assert.match(cssSource, /\.teacher-group-detail-page \.teacher-brand\{contain:none;padding-top:24px\}/);
  assert.match(cssSource, /\.teacher-group-detail-page \.teacher-brand-lockup\{height:auto;min-height:0;gap:3px;padding-top:0\}/);
  assert.match(cssSource, /\.teacher-group-detail-page \.teacher-brand-copy\{gap:3px\}/);
  assert.match(cssSource, /\.teacher-group-detail-page \.teacher-brand-symbol\{width:38px;height:38px;min-height:38px;max-height:38px;aspect-ratio:1;flex:0 0 38px\}/);
  assert.match(cssSource, /\.teacher-group-detail-page \.teacher-brand-symbol img,\.teacher-group-detail-page \.teacher-brand-symbol svg\{width:38px;height:38px\}/);
  assert.match(cssSource, /\.teacher-group-detail-page \.teacher-brand strong\{font-size:19px\}/);
  assert.match(cssSource, /\.teacher-group-detail-page \.teacher-brand small\{font-size:12px\}/);
  assert.match(cssSource, /\.teacher-group-detail-page \.teacher-sidebar\{row-gap:28px\}/);
  assert.match(cssSource, /button:focus-visible.*a:focus-visible.*select:focus-visible/);
  assert.match(cssSource, /@media \(prefers-reduced-motion:reduce\)/);
  assert.match(cssSource, /@media\(max-width:1100px\)[\s\S]*\.group-students-card table,\.group-students-card tbody\{display:block\}/);
  assert.match(cssSource, /@media\(max-width:620px\)[\s\S]*\.group-students-card tr\{grid-template-columns:1fr\}/);
  assert.doesNotMatch(cssSource, /overflow-x:scroll/);
});

test("le fournisseur est déterministe, fictif et sans appel IA ou réseau", async () => {
  const first = await localViewModel();
  const second = await localViewModel();
  assert.deepEqual(first, second);
  assert.doesNotMatch(providerSource, /fetch\(|axios|openai|anthropic|localStorage|sessionStorage|conversation|transcript|studentResponse/i);
  assert.doesNotMatch(JSON.stringify(first), /Mme |Monsieur |Madame |@|https?:\/\//i);
});
