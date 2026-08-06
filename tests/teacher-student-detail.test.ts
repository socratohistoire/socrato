import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ACTE_UNION_HISTORICAL_KNOWLEDGE } from "../lib/student-dashboard/historical-knowledge-catalog.ts";
import { DEMO_INTELLECTUAL_OPERATIONS } from "../lib/student-dashboard/demo-provider.ts";
import { createTeacherStudentDetailViewModel, isAuthorizedLocalTeacherStudentContext, isLocalTeacherStudentDetailEnabled, isSafeTeacherStudentContextId, LocalTeacherStudentDetailProvider, TEACHER_STUDENT_RESULT_LABELS } from "../lib/teacher-student-detail/index.ts";

const routeSource = readFileSync("app/teacher/activities/[activityId]/groups/[groupId]/students/[studentId]/page.tsx", "utf8");
const viewSource = readFileSync("app/teacher/activities/[activityId]/groups/[groupId]/students/[studentId]/teacher-student-detail-view.tsx", "utf8");
const cssSource = readFileSync("app/teacher/activities/[activityId]/groups/[groupId]/students/[studentId]/teacher-student-detail.css", "utf8");
const providerSource = readFileSync("lib/teacher-student-detail/local-provider.ts", "utf8");
const groupProviderSource = readFileSync("lib/teacher-group-detail/local-provider.ts", "utf8");
const groupViewSource = readFileSync("app/teacher/activities/[activityId]/groups/[groupId]/teacher-group-detail-view.tsx", "utf8");
const dashboardProviderSource = readFileSync("lib/teacher-dashboard/local-provider.ts", "utf8");

async function localViewModel() {
  const record = await new LocalTeacherStudentDetailProvider("test").getStudentDetail("activity-revision-01", "group-demo-401", "student-demo-a17");
  assert.ok(record);
  return createTeacherStudentDetailViewModel(record);
}

test("valide strictement les trois identifiants et protège la route côté serveur", () => {
  assert.match(routeSource, /isSafeTeacherStudentContextId\(activityId\).*isSafeTeacherStudentContextId\(groupId\).*isSafeTeacherStudentContextId\(studentId\)/);
  assert.match(routeSource, /if \(!record\) notFound\(\)/);
  assert.equal(isSafeTeacherStudentContextId("student-demo-a17"), true);
  assert.equal(isSafeTeacherStudentContextId("../student-demo-a17"), false);
  assert.equal(isAuthorizedLocalTeacherStudentContext("activity-revision-01", "group-demo-401", "student-demo-a17"), true);
  assert.equal(isAuthorizedLocalTeacherStudentContext("activity-local-1785940200000", "group-demo-401", "local-anonymous-student-1"), true);
  assert.equal(isAuthorizedLocalTeacherStudentContext("activity-revision-01", "group-demo-401", "student-demo-unknown"), false);
});

test("ferme le fournisseur en production et rejette tout contexte inconnu", async () => {
  assert.equal(isLocalTeacherStudentDetailEnabled("production"), false);
  await assert.rejects(() => new LocalTeacherStudentDetailProvider("production").getStudentDetail("activity-revision-01", "group-demo-401", "student-demo-a17"), /disabled in production/);
  assert.equal(await new LocalTeacherStudentDetailProvider("test").getStudentDetail("activity-revision-01", "group-demo-999", "student-demo-a17"), null);
});

test("fournit un bilan fictif synthétique et le retour contextuel", async () => {
  const data = await localViewModel();
  assert.equal(data.studentDisplayLabel, "Liam B. (fictif)");
  assert.equal(data.groupName, "Groupe fictif 401");
  assert.equal(data.activityTitle, "Révision avant l’évaluation 1");
  assert.match(data.socratoSummary, /consolidation montre une progression/);
  assert.equal(data.groupReturnHref, "/teacher/activities/activity-revision-01/groups/group-demo-401");
  assert.equal(data.teacherReturnHref, "/teacher?activity=activity-revision-01");
});

test("conserve l’avant et affiche l’évolution après consolidation", async () => {
  const data = await localViewModel();
  assert.equal(data.consolidationProgress.previousLevel, "À consolider");
  assert.equal(data.consolidationProgress.currentLevel, "En progression");
  assert.equal(data.consolidationProgress.source, "teacher_assigned");
  assert.equal(data.operations.find(({ id }) => id === "causes-and-consequences")?.status, "mastered");
  assert.match(viewSource, /Évolution après consolidation/);
  assert.match(viewSource, /Terminée le/);
  assert.match(viewSource, /Point fort actuel/);
  assert.match(viewSource, /Difficulté actuelle/);
  assert.match(cssSource, /\.teacher-consolidation-progress\{[^}]*border:1px solid/);
});

test("raccorde uniquement les boutons Détails autorisés de Liam", () => {
  const href = "/teacher/activities/activity-revision-01/groups/group-demo-401/students/student-demo-a17";
  assert.match(groupProviderSource, new RegExp(`student-demo-a17[^\\n]+${href.replaceAll("/", "\\/")}`));
  assert.match(dashboardProviderSource, new RegExp(`student-demo-a17[^\\n]+${href.replaceAll("/", "\\/")}`));
  assert.match(groupViewSource, /if \(student\.studentDetailHref\) return <Link/);
  assert.match(groupViewSource, /className="sidebar-create-action" href="\/teacher\/activities\/new"/);
  assert.doesNotMatch(viewSource + groupProviderSource + dashboardProviderSource, /href="#"/);
});

test("n’affiche que des opérations et connaissances réellement travaillées et approuvées", async () => {
  const data = await localViewModel();
  const approvedOperations = new Set(DEMO_INTELLECTUAL_OPERATIONS.map(({ label }) => label));
  const approvedKnowledge = new Set(ACTE_UNION_HISTORICAL_KNOWLEDGE.map(({ label }) => label));
  assert.ok(data.operations.length > 0 && data.operations.every(({ label }) => approvedOperations.has(label as never)));
  assert.ok(data.historicalKnowledge.length > 0 && data.historicalKnowledge.every(({ label }) => approvedKnowledge.has(label as never)));
  assert.ok([...data.operations, ...data.historicalKnowledge].every(({ status }) => status !== ("not_assessed" as never)));
  assert.deepEqual(TEACHER_STUDENT_RESULT_LABELS, { mastered: "Maîtrisée", consolidate: "À consolider", needs_work: "À travailler" });
  assert.doesNotMatch(JSON.stringify(data), /Non travaill/i);
});

test("rend la hiérarchie, les actions et le contenu pédagogique attendus", () => {
  assert.match(viewSource, /← Retour au groupe fictif 401/);
  assert.match(viewSource, /Bilan individuel/);
  assert.match(viewSource, /Synthèse de Socrato/);
  assert.match(viewSource, /Bilan pédagogique/);
  assert.match(viewSource, /Opérations intellectuelles travaillées/);
  assert.match(viewSource, /Connaissances historiques travaillées/);
  assert.ok(viewSource.indexOf("student-socrato-card") < viewSource.indexOf("student-overview-card"));
  assert.match(viewSource, /disabled aria-disabled="true" title="Fonction à venir">Créer une activité de consolidation/);
  assert.doesNotMatch(viewSource, /href="#"/);
});

test("ajoute trois icônes SVG accessibles et renforce sobrement les titres", () => {
  assert.match(viewSource, /function PedagogicalIcon/);
  assert.match(viewSource, /kind="strength" label="Point fort"/);
  assert.match(viewSource, /kind="difficulty" label="Difficulté principale"/);
  assert.match(viewSource, /kind="path" label="Piste de consolidation"/);
  assert.match(viewSource, /<svg viewBox="0 0 24 24" role="img" aria-label=\{label\} focusable="false">/);
  assert.doesNotMatch(viewSource, /⭐|❗|↗️/);
  assert.match(cssSource, /\.student-detail-card h2\{[^}]*font-size:1\.15rem;font-weight:800/);
  assert.match(cssSource, /\.student-pedagogical-icon\{width:34px;height:34px[^}]*border:1px solid currentColor/);
  assert.match(cssSource, /\.student-pedagogical-icon svg\{width:20px;height:20px[^}]*stroke-width:1\.8/);
  assert.match(cssSource, /student-pedagogical-icon--strength\{color:var\(--student-green\)\}/);
  assert.match(cssSource, /student-pedagogical-icon--difficulty\{color:var\(--student-red\)\}/);
  assert.match(cssSource, /student-pedagogical-icon--path\{color:var\(--student-blue\)\}/);
});

test("équilibre les deux rangées sans hauteur fixe et compacte les listes", () => {
  assert.match(cssSource, /\.student-detail-first-row\{display:grid;grid-template-columns:minmax\(0,7fr\) minmax\(240px,3fr\);align-items:stretch/);
  assert.match(cssSource, /\.student-detail-second-row\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\);align-items:stretch/);
  assert.match(cssSource, /\.student-pedagogical-card\{display:flex;flex-direction:column\}/);
  assert.match(cssSource, /\.student-consolidation-action\{[^}]*margin-top:auto/);
  assert.match(cssSource, /\.student-worked-results\{[^}]*display:grid;grid-template-rows:auto auto;align-content:start;gap:19px/);
  assert.match(cssSource, /\.student-result-list li\{[^}]*padding:10px 0/);
  assert.match(cssSource, /@media\(max-width:1100px\)\{\.student-detail-first-row,\.student-detail-second-row\{grid-template-columns:1fr;align-items:start\}/);
  assert.doesNotMatch(cssSource, /\.student-detail-(?:first|second)-row\{[^}]*(?:height:|position:absolute|transform:translate|margin:-)/);
});

test("reprend la barre latérale, les thèmes, le responsive et l’accessibilité", () => {
  assert.match(routeSource, /teacher-dashboard\.css/);
  assert.match(routeSource, /teacher-group-detail\.css/);
  assert.match(viewSource, /teacher-group-detail-page teacher-student-detail-page/);
  assert.match(viewSource, /socrato-logo-blanc-recadre\.png/);
  assert.match(viewSource, /className="sidebar-create-action" href="\/teacher\/activities\/new" aria-label="Créer une activité"/);
  assert.match(viewSource, /<span>Créer une activité<\/span>/);
  assert.match(viewSource, /<nav aria-label="Navigation principale">[\s\S]*teacher-space-link[\s\S]*<TeacherGroupsDisclosure[\s\S]*sidebar-create-action[\s\S]*<\/nav>/);
  assert.match(viewSource, /<ThemeToggle \/>/);
  assert.match(viewSource, /aria-labelledby="student-detail-title"/);
  assert.match(viewSource, /aria-labelledby="student-operations-title"/);
  assert.match(cssSource, /\[data-theme="dark"\] \.teacher-student-detail-page/);
  assert.match(cssSource, /@media\(max-width:1100px\)/);
  const dashboardCssSource = readFileSync("app/teacher/teacher-dashboard.css", "utf8");
  assert.match(dashboardCssSource, /@media \(max-width:980px\)[\s\S]*\.teacher-sidebar\{[^}]*flex-direction:column[^}]*flex-wrap:nowrap[^}]*align-items:stretch/);
  assert.match(cssSource, /@media\(max-width:620px\)/);
  assert.match(cssSource, /@media \(prefers-reduced-motion:reduce\)/);
  assert.match(cssSource, /focus-visible/);
});

test("reste local, déterministe et sans données sensibles ni réponse complète", async () => {
  const first = await localViewModel();
  const second = await localViewModel();
  assert.deepEqual(first, second);
  assert.match(JSON.stringify(first), /fictif/);
  assert.doesNotMatch(providerSource, /fetch\(|axios|openai|anthropic|prisma|supabase|firebase|localStorage|sessionStorage|indexedDB|console\.|conversation|transcript|studentResponse|messageHistory/i);
  assert.doesNotMatch(JSON.stringify(first), /@|https?:\/\//i);
});
