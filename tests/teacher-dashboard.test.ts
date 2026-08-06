import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  LOCAL_DEMO_TEACHER_ID,
  LocalDemoTeacherDashboardProvider,
  createLocalTeacherDashboardData,
  createTeacherDashboardViewModel,
  composeTeacherPedagogicalSummary,
  formatTeacherGreeting,
  isLocalTeacherDashboardEnabled,
  LocalTeacherMessageViewStore,
  LocalTeacherPedagogicalSummaryProvider,
  selectHighPriorityStudents,
  validateTeacherPedagogicalSummary,
} from "../lib/teacher-dashboard/index.ts";
import type { TeacherSupportCandidate } from "../lib/teacher-dashboard/index.ts";

const viewSource = readFileSync("app/teacher/teacher-dashboard-view.tsx", "utf8");
const pageSource = readFileSync("app/teacher/page.tsx", "utf8");
const cssSource = readFileSync("app/teacher/teacher-dashboard.css", "utf8");
const scrollSource = readFileSync("app/teacher/scroll-region.tsx", "utf8");
const groupsMenuSource = readFileSync("app/teacher/teacher-groups-disclosure.tsx", "utf8");
const themeToggleSource = readFileSync("app/eleve/tableau-de-bord/theme-toggle.tsx", "utf8");

test("rend l’en-tête contextuel et les deux cartes principales", () => {
  assert.match(viewSource, /title="Portrait des groupes"/);
  assert.match(viewSource, /title="Élèves prioritaires"/);
  assert.doesNotMatch(viewSource, /Suivi par groupe|groups-card|groups-table/);
  assert.match(viewSource, /sidebar-create-action/);
  assert.match(viewSource, /activeActivity\.customTitle/);
  assert.doesNotMatch(viewSource, /ACTIVITÉ SÉLECTIONNÉE|ACTIVITÉ EN COURS/);
});

test("conserve les icônes SVG locales des deux cartes informatives", () => {
  for (const icon of ["portrait", "support"]) {
    assert.match(viewSource, new RegExp(`data-section-icon=\\{name\\}|section-icon-\\$\\{name\\}`));
    assert.match(viewSource, new RegExp(`icon="${icon}"`));
  }
  assert.doesNotMatch(viewSource, /icon="create"|section-icon-create/);
  assert.match(viewSource, /<svg viewBox="0 0 24 24" focusable="false">/);
  assert.doesNotMatch(viewSource, /from ["'][^"']*(lucide|heroicons|fontawesome)/i);
});

test("présente une synthèse Socrato personnelle, validée et déterministe à mi-largeur", () => {
  const activities = createLocalTeacherDashboardData().activities;
  const provider = new LocalTeacherPedagogicalSummaryProvider();
  const summary = provider.createSummary({ activity: activities[0] });
  assert.ok(summary);
  assert.deepEqual(Object.keys(summary), ["overallObservation", "mainStrength", "mainChallenge"]);
  assert.ok(validateTeacherPedagogicalSummary(summary));
  const message = composeTeacherPedagogicalSummary(summary);
  assert.ok(message);
  assert.equal(message.split(/\s+/).length <= 85, true);
  assert.doesNotMatch(message, /\d|%|diagnostic|Groupe fictif|Liam|Maya/i);
  assert.deepEqual(provider.createSummary({ activity: activities[0] }), summary);
  assert.equal(provider.createSummary({ activity: activities[1] }), null);
  assert.equal(provider.createSummary({ activity: activities[2] }), null);
  const undersizedActivity = { ...activities[0], groupPortraits: activities[0].groupPortraits.map((group) => ({ ...group, targetedStudentCount: 5, completedStudentCount: 5 })) };
  assert.equal(provider.createSummary({ activity: undersizedActivity }), null);
  assert.equal(validateTeacherPedagogicalSummary({ ...summary, mainChallenge: "Prévoir une activité ciblée." }), false);
  assert.equal(formatTeacherGreeting(" David "), "Bonjour, David !");
  assert.equal(formatTeacherGreeting(), "Bonjour !");
  assert.match(viewSource, /className="socrato-observation-card" aria-label="Accueil de Socrato"/);
  assert.doesNotMatch(viewSource, /<h2 id="socrato-observation-title">Socrato<\/h2>/);
  assert.match(viewSource, /className="socrato-observation-avatar"[^>]*width=\{80\}[^>]*height=\{80\}[^>]*alt=""[^>]*aria-hidden="true"/);
  assert.doesNotMatch(viewSource, /conseiller pédagogique|Recommandation de Socrato/);
  assert.match(viewSource, /formatTeacherGreeting\(data\.teacher\.firstName\)/);
  assert.match(viewSource, /Socrato prépare sa synthèse à mesure que les élèves terminent l’activité\./);
  assert.doesNotMatch(viewSource, /socrato-observation-list|SocratoObservationIcon/);
  assert.match(cssSource, /\.teacher-main-grid\{[^}]*grid-template-columns:minmax\(0,2fr\) minmax\(0,3fr\)[^}]*align-items:start[^}]*gap:22px/);
  assert.match(cssSource, /\.teacher-left-stack\{[^}]*display:grid[^}]*grid-template-rows:auto auto[^}]*align-self:start[^}]*gap:22px/);
  assert.doesNotMatch(cssSource, /\.socrato-observation-card\{[^}]*(?:height|min-height):/);
  assert.equal(message, "La progression est encourageante. Les connaissances historiques liées à cette activité sont bien maîtrisées dans la majorité des groupes. La distinction entre les causes et les conséquences demeure toutefois le principal défi.");
  assert.doesNotMatch(message, /résultats disponibles|suffisamment établie|résultats admissibles|conseil|recommand/i);
  assert.match(cssSource, /\.socrato-observation-card\{[^}]*box-sizing:border-box[^}]*width:100%[^}]*border:[^}]*box-shadow:/);
  assert.match(cssSource, /\.socrato-spoken-row\{[^}]*grid-template-columns:80px minmax\(0,1fr\)[^}]*align-items:start[^}]*gap:16px/);
  assert.match(cssSource, /\.socrato-advice-message\{[^}]*text-align:left/);
  assert.doesNotMatch(cssSource, /\.socrato-advice-message\{[^}]*text-align:justify/);
  assert.match(cssSource, /\.socrato-observation-avatar\{[^}]*width:80px[^}]*height:80px[^}]*object-fit:contain[^}]*border:1px solid var\(--teacher-gold\)[^}]*border-radius:50%[^}]*background:#fff6e5[^}]*box-shadow:/);
  assert.match(cssSource, /@media\(max-width:620px\)[\s\S]*\.socrato-observation-avatar\{width:64px;height:64px\}/);
  assert.match(cssSource, /@media\(max-width:1100px\)\{[\s\S]*\.teacher-main-grid\{grid-template-columns:minmax\(0,1fr\);align-items:start\}/);
  assert.match(cssSource, /\.socrato-advice-message\{[^}]*font-size:clamp\(1rem,1\.1vw,1\.08rem\)/);
  const summarySource = `${viewSource}\n${readFileSync("lib/teacher-dashboard/socrato-summary.ts", "utf8")}`;
  assert.equal(summarySource.includes(["single", "Recommendation"].join("")), false);
  assert.doesNotMatch(summarySource, /recommandation|Math\.random|Date\.now|fetch\(|openai|anthropic|conversation|transcription|réponse complète/i);
  assert.doesNotMatch(message, /consolid|reprendre|intervention|activité guidée|conseill|prévois/i);
  const socratoIndex = viewSource.indexOf('className="socrato-observation-card"');
  const supportIndex = viewSource.indexOf('className={`teacher-card support-card');
  const portraitIndex = viewSource.indexOf('className="teacher-card portrait-card"');
  assert.ok(socratoIndex < supportIndex && supportIndex < portraitIndex);
});

test("rend la carte Socrato sans champ de recommandation", () => {
  const activity = createLocalTeacherDashboardData().activities[0];
  const summary = new LocalTeacherPedagogicalSummaryProvider().createSummary({ activity });
  assert.ok(summary);
  assert.doesNotThrow(() => composeTeacherPedagogicalSummary(summary));
  assert.equal(Object.keys(summary).length, 3);
  assert.equal(viewSource.includes(["single", "Recommendation"].join("")), false);
  assert.match(viewSource, /<TypewriterMessage key=\{socratoMessageKey\} messageKey=\{socratoMessageKey\} text=\{socratoMessage\}/);
});

test("anime seulement la première consultation d’un message Socrato opaque", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
  const store = new LocalTeacherMessageViewStore(storage);
  assert.equal(store.hasSeen("teacher-welcome-v1"), false);
  store.markSeen("teacher-welcome-v1");
  assert.equal(store.hasSeen("teacher-welcome-v1"), true);
  assert.deepEqual(JSON.parse([...values.values()][0]), ["teacher-welcome-v1"]);
  store.markSeen("activity-summary-activity-revision-01-v1");
  assert.equal(store.hasSeen("activity-summary-activity-revision-01-v1"), true);
  assert.equal(store.hasSeen("activity-summary-activity-revision-01-v2"), false);
  const localData = createLocalTeacherDashboardData();
  assert.ok(localData.hasCreatedActivity);
  assert.equal(createTeacherDashboardViewModel({ ...localData, hasCreatedActivity: false }).hasCreatedActivity, false);
  assert.match(viewSource, /!data\.hasCreatedActivity/);
  assert.match(viewSource, /data\.hasCreatedActivity \? localPedagogicalSummaryProvider\.createSummary\(\{ activity: activeActivity \}\) : null/);
  assert.match(viewSource, /teacher-welcome-v1/);
  assert.match(viewSource, /`activity-summary-\$\{activeActivity\.id\}-\$\{activeActivity\.summaryVersion\}`/);
  assert.match(viewSource, /Bienvenue dans Socrato\.[\s\S]*Créer une activité/);
  assert.match(viewSource, /onFirstViewComplete=\{isInitialWelcome \? handleWelcomeMessageComplete : undefined\}/);
  const typewriterSource = readFileSync("app/teacher/typewriter-message.tsx", "utf8");
  assert.match(typewriterSource, /useState\(text\.length\)/);
  assert.match(typewriterSource, /store\.hasSeen\(messageKey\)/);
  assert.match(typewriterSource, /prefers-reduced-motion: reduce/);
  assert.match(typewriterSource, /Math\.min\(35, Math\.max\(1, 4000 \/ Math\.max\(1, text\.length\)\)\)/);
  assert.match(typewriterSource, /className="sr-only">\{text\}<\/span>/);
  assert.match(typewriterSource, /className="socrato-typewriter-visual" aria-hidden="true"/);
  assert.doesNotMatch(typewriterSource, /localStorage[^\n]*(?:text|message)|setItem\([^,]+,\s*text/);
  assert.match(cssSource, /sidebar-create-welcome-attention 2s ease-out 1/);
  assert.match(cssSource, /@media \(prefers-reduced-motion:reduce\)[\s\S]*\.socrato-typewriter-cursor\{display:none\}/);
});

test("renforce les deux titres informatifs", () => {
  assert.match(cssSource, /\.section-title h2\{[^}]*font-family:Arial,sans-serif[^}]*font-size:1\.3rem[^}]*font-weight:700/);
  assert.match(cssSource, /\.teacher-activity-title\{[^}]*font-size:clamp\(1\.55rem,1\.85vw,1\.75rem\)[^}]*white-space:nowrap/);
});

test("retire les surtitres et identifiants techniques du rendu enseignant", () => {
  assert.doesNotMatch(viewSource, /Vue synthétique|Signal structuré/);
  assert.doesNotMatch(viewSource, /failed_assessment|near_failure/);
});

test("structure le portrait avec observation, suggestion et défilement interne", () => {
  assert.match(viewSource, /className="briefing-observation"/);
  assert.match(viewSource, /className="briefing-suggestion"/);
  assert.match(viewSource, /Suggestion de Socrato/);
  assert.match(viewSource, /className="briefing-columns"[^>]*><span>Groupe et observation<\/span><span>Suggestion de Socrato<\/span><span>Participation<\/span>/);
  assert.match(viewSource, /className="briefing-participation" role="img" aria-label=\{participationLabel\}/);
  assert.match(viewSource, /className="participation-ring"/);
  assert.doesNotMatch(viewSource, /briefing-observation"><h3>\{group\.name\}<\/h3><strong>Observation/);
  assert.doesNotMatch(viewSource, /briefing-suggestion"><strong>Suggestion de Socrato/);
  assert.match(viewSource, /className=\{`portrait-scroll\$\{activeActivity\.groupPortraits\.length > 7 \? " portrait-scroll--overflowing" : ""\}`\} label="Portrait des groupes, faire défiler pour voir les autres groupes" hint="Faire défiler pour voir les autres groupes ↓" hintInsideViewport showHintControl=\{activeActivity\.groupPortraits\.length > 7\}/);
  const portraitHeaderIndex = viewSource.indexOf('className="briefing-columns"');
  const portraitScrollIndex = viewSource.indexOf('<ScrollRegion className={`portrait-scroll');
  const portraitListIndex = viewSource.indexOf('className="briefing-list"');
  assert.ok(portraitHeaderIndex < portraitScrollIndex && portraitScrollIndex < portraitListIndex);
  assert.doesNotMatch(viewSource, /<ScrollRegion className=\{`portrait-scroll[\s\S]*className="briefing-columns"/);
  assert.match(cssSource, /\.scroll-region-viewport\{[^}]*max-height:285px[^}]*overflow-y:auto/);
  assert.match(cssSource, /\.portrait-scroll \.scroll-region-viewport\{[^}]*scrollbar-gutter:stable/);
  assert.doesNotMatch(cssSource, /--teacher-dashboard-list-card-height/);
  assert.match(cssSource, /\.teacher-main-grid>\.portrait-card\{box-sizing:border-box;height:auto;align-self:start\}/);
  assert.match(cssSource, /\.support-card\{box-sizing:border-box;height:auto;padding:20px\}/);
  assert.match(cssSource, /\.teacher-main-grid>\.portrait-card \.portrait-scroll \.scroll-region-viewport\{max-height:none;overflow-y:visible\}/);
  assert.match(cssSource, /\.teacher-main-grid>\.portrait-card \.portrait-scroll--overflowing \.scroll-region-viewport\{max-height:620px;overflow-y:auto\}/);
  assert.match(cssSource, /\.portrait-scroll \.scroll-region-viewport::\-webkit-scrollbar\{width:8px\}/);
  assert.match(cssSource, /\.portrait-scroll \.scroll-region-viewport::\-webkit-scrollbar-track\{[^}]*border-radius:8px/);
  assert.match(cssSource, /\.portrait-scroll \.scroll-region-viewport::\-webkit-scrollbar-thumb\{background:var\(--teacher-gold\);border-radius:8px\}/);
  assert.match(cssSource, /\.portrait-scroll \.scroll-hint,\.support-scroll \.scroll-hint\{position:sticky;bottom:0[^}]*font-size:\.68rem[^}]*text-align:center/);
  assert.match(cssSource, /@media\(max-width:1100px\)[\s\S]*\.teacher-main-grid>\.portrait-card\{height:auto\}[\s\S]*\.support-card\{height:auto\}/);
  assert.match(cssSource, /\.briefing-columns\{[^}]*padding:10px 15px 8px 0[^}]*border-bottom:1px solid var\(--teacher-border\)[^}]*background:var\(--teacher-card\)/);
  assert.match(cssSource, /\.briefing-columns\{[^}]*font-size:\.74rem[^}]*font-weight:750/);
  assert.match(cssSource, /\.briefing-item\{[^}]*padding:8px 0[^}]*border-top:1px solid var\(--teacher-border\)/);
  assert.match(cssSource, /@media\(max-width:1100px\)[\s\S]*\.briefing-item\{[^}]*padding:14px/);
  assert.match(cssSource, /scrollbar-color/);
  assert.match(cssSource, /\.scroll-hint\{[^}]*linear-gradient/);
  assert.doesNotMatch(viewSource, /Voir le rapport complet/);
  assert.doesNotMatch(viewSource, /group-dot/);
  const suggestions = createLocalTeacherDashboardData().activities.flatMap((activity) => activity.groupPortraits.map(({ suggestion }) => suggestion.replace(/^Suggestion fictive :\s*/, "")));
  assert.ok(suggestions.every((suggestion) => /^\p{Lu}/u.test(suggestion)));
  assert.doesNotMatch(cssSource, /text-transform:\s*capitalize/);
  const selectedData = createLocalTeacherDashboardData();
  const fifthPortrait = selectedData.activities[0].groupPortraits[4];
  assert.deepEqual(fifthPortrait, {
    id: "portrait-405",
    activityId: "activity-revision-01",
    name: "Groupe fictif 405",
    observation: "Les connaissances principales sont comprises, mais les justifications demeurent parfois trop brèves.",
    suggestion: "Suggestion fictive : Approfondir la justification à l’aide de faits historiques précis.",
    completedStudentCount: 19,
    targetedStudentCount: 24,
  });
  assert.ok(selectedData.activities[0].targetedGroupIds.includes("group-demo-405"));
  assert.ok(selectedData.groups.some(({ id, name }) => id === "group-demo-405" && name === "Groupe fictif 405"));
  assert.equal(Math.round((fifthPortrait.completedStudentCount / fifthPortrait.targetedStudentCount) * 100), 79);
  assert.equal(selectedData.activities[0].groupPortraits.length, 7);
  assert.deepEqual(selectedData.activities[0].groupPortraits.slice(5), [
    {
      id: "portrait-406",
      activityId: "activity-revision-01",
      name: "Groupe fictif 406",
      observation: "Les élèves mobilisent correctement les connaissances, mais certains liens entre les événements demeurent imprécis.",
      suggestion: "Suggestion fictive : Consolider les liens de causalité à l’aide d’un exemple guidé.",
      completedStudentCount: 20,
      targetedStudentCount: 23,
    },
    {
      id: "portrait-407",
      activityId: "activity-revision-01",
      name: "Groupe fictif 407",
      observation: "La compréhension générale est satisfaisante, mais plusieurs réponses manquent encore de justification historique.",
      suggestion: "Suggestion fictive : Renforcer la justification avec des faits historiques précis.",
      completedStudentCount: 22,
      targetedStudentCount: 26,
    },
  ]);
  assert.deepEqual(selectedData.activities[0].targetedGroupIds.slice(-2), ["group-demo-406", "group-demo-407"]);
  assert.ok(selectedData.groups.some(({ id, name }) => id === "group-demo-406" && name === "Groupe fictif 406"));
  assert.ok(selectedData.groups.some(({ id, name }) => id === "group-demo-407" && name === "Groupe fictif 407"));
});

test("active le défilement du portrait seulement à partir du huitième groupe", () => {
  const sevenGroups = createLocalTeacherDashboardData().activities[0].groupPortraits;
  const eightGroups = [...sevenGroups, { ...sevenGroups[0], id: "portrait-test-408", name: "Groupe fictif 408" }];

  for (const count of [1, 6, 7]) assert.equal(sevenGroups.slice(0, count).length > 7, false);
  assert.equal(sevenGroups.length, 7);
  assert.equal(sevenGroups.length > 7, false);
  assert.equal(eightGroups.length > 7, true);
  assert.match(viewSource, /activeActivity\.groupPortraits\.length > 7 \? " portrait-scroll--overflowing" : ""/);
  assert.match(viewSource, /showHintControl=\{activeActivity\.groupPortraits\.length > 7\}/);
  assert.match(cssSource, /\.teacher-main-grid>\.portrait-card \.portrait-scroll \.scroll-region-viewport\{[^}]*overflow-y:visible\}/);
  assert.match(cssSource, /\.teacher-main-grid>\.portrait-card \.portrait-scroll--overflowing \.scroll-region-viewport\{max-height:620px;overflow-y:auto\}/);
});

test("garde jusqu’à trois élèves en hauteur naturelle et borne le quatrième", () => {
  const students = createLocalTeacherDashboardData().activities[0].highPriorityStudents;
  const fourStudents = [...students, { ...students[0], id: "student-test-fourth" }];

  for (const count of [1, 2, 3]) assert.equal(students.slice(0, count).length > 3, false);
  assert.equal(fourStudents.length > 3, true);
  assert.match(viewSource, /data\.highPriorityStudents\.length > 3 \? " support-scroll--overflowing" : ""/);
  assert.match(viewSource, /showHintControl=\{data\.highPriorityStudents\.length > 3\}/);
  assert.match(cssSource, /\.support-scroll \.scroll-region-viewport\{max-height:none;overflow-y:visible/);
  assert.match(cssSource, /\.support-scroll--overflowing \.scroll-region-viewport\{max-height:390px;overflow-y:auto\}/);
});

test("présente les élèves sans route inventée vers un portrait", () => {
  assert.doesNotMatch(viewSource, /student\.displayLabel\.charAt\(0\)|student-dot/);
  assert.match(viewSource, /student\.displayLabel/);
  assert.match(viewSource, /student\.reasonLabel/);
  assert.match(viewSource, /className="priority-pill">Priorité élevée</);
  assert.match(viewSource, /className="priority-actions">[\s\S]*className="priority-pill">Priorité élevée<\/span>[\s\S]*<StudentPortraitControl student=\{student\} \/>/);
  assert.doesNotMatch(viewSource, /<(?:UnavailableAction|button|Link)[^>]*>\s*<span className="priority-pill">/);
  assert.match(viewSource, /<StudentPortraitControl student=\{student\} \/>/);
  assert.match(viewSource, /if \(student\.studentPortraitHref\) \{[\s\S]*<Link className="priority-detail-action teacher-details-action" href=\{student\.studentPortraitHref\} aria-label=\{accessibleLabel\}>Détails/);
  assert.match(viewSource, /<UnavailableAction className="priority-detail-action teacher-details-action" accessibleLabel=\{`\$\{accessibleLabel\} — Fonction à venir`\}>Détails/);
  assert.match(viewSource, /const accessibleLabel = `Voir le portrait de \$\{student\.displayLabel\.replace/);
  assert.match(viewSource, /data\.highPriorityStudents\.map\(\(student\) => <li key=\{student\.id\}>/);
  assert.match(cssSource, /\.priority-list\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(cssSource, /\.priority-actions\{width:96px;display:flex;flex-direction:column;align-items:stretch;gap:9px\}/);
  assert.match(cssSource, /\.priority-detail-action\{width:100%\}/);
  assert.match(cssSource, /\.teacher-dashboard \.teacher-details-action\{[^}]*height:44px/);
  assert.doesNotMatch(viewSource, /href="#"|href=\{`[^`]*(?:student\.id|student\.displayLabel)/);
  const types = readFileSync("lib/teacher-dashboard/types.ts", "utf8");
  assert.match(types, /studentPortraitHref\?: string/);
  const localStudents = createLocalTeacherDashboardData().activities.flatMap((activity) => activity.highPriorityStudents);
  assert.equal(localStudents.find(({ id, groupId }) => id === "student-demo-a17" && groupId === "group-demo-401")?.studentPortraitHref, "/teacher/activities/activity-revision-01/groups/group-demo-401/students/student-demo-a17");
  assert.ok(localStudents.filter(({ id, groupId }) => id !== "student-demo-a17" || groupId !== "group-demo-401").every(({ studentPortraitHref }) => studentPortraitHref === undefined));
  assert.match(JSON.stringify(localStudents), /Liam B\. \(fictif\)/);
});

test("attire une seule fois l’attention sur une carte prioritaire non vide", () => {
  assert.match(viewSource, /className=\{`teacher-card support-card\$\{data\.highPriorityStudents\.length \? " priority-card--attention" : ""\}`\}/);
  assert.match(cssSource, /\.priority-card--attention\{animation:priority-attention-pulse 1\.8s ease-out 1\}/);
  assert.match(cssSource, /@keyframes priority-attention-pulse\{[^}]*0%,45%,100%[^}]*box-shadow:var\(--teacher-analysis-card-shadow\)/);
  assert.match(cssSource, /20%,68%\{[^}]*border-color:color-mix\(in srgb,var\(--teacher-red\)/);
  assert.doesNotMatch(cssSource, /priority-attention-pulse[^\n]*(?:infinite|transform|scale\()/);
  assert.match(cssSource, /@media \(prefers-reduced-motion:reduce\)[\s\S]*\.priority-card--attention\{animation:none!important\}/);
  assert.doesNotMatch(viewSource, /priority-card--attention[^\n]*(?:useState|setTimeout|setInterval)/);
});

test("sépare les en-têtes et emploie un sous-titre pédagogique naturel", () => {
  assert.equal((viewSource.match(/className="scroll-card-header"/g) ?? []).length, 2);
  assert.match(viewSource, /Élèves nécessitant une intervention prioritaire/);
  assert.doesNotMatch(viewSource, /diagnostic défini|diagnostics? définitifs?/i);
  assert.match(cssSource, /\.scroll-card-header\{[^}]*border-bottom/);
});

test("démontre les deux listes défilables avec des données fictives autorisées", () => {
  const data = createLocalTeacherDashboardData();
  const highPriority = selectHighPriorityStudents(data.supportCandidates);
  assert.ok(data.groupBriefings.length >= 3);
  assert.ok(highPriority.length >= 3);
  assert.ok(data.supportCandidates.every(({ priority }) => priority === "high"));
  assert.ok(data.supportCandidates.every(({ highPriorityReason }) => highPriorityReason === "failed_assessment" || highPriorityReason === "near_failure"));
  assert.match(viewSource, /className=\{`support-scroll\$\{data\.highPriorityStudents\.length > 3 \? " support-scroll--overflowing" : ""\}`\} label="Élèves prioritaires, faire défiler pour voir les autres élèves" hint="Faire défiler pour voir les autres élèves ↓" hintInsideViewport showHintControl=\{data\.highPriorityStudents\.length > 3\}/);
  const supportHeaderIndex = viewSource.indexOf('className="scroll-card-header"><CardTitle className="analysis-section-title" icon="support"');
  const supportViewportIndex = viewSource.indexOf('<ScrollRegion className={`support-scroll');
  assert.ok(supportHeaderIndex < supportViewportIndex);
  assert.match(viewSource, /data\.highPriorityStudents\.map\(\(student\) => <li key=\{student\.id\}>/);
  assert.match(cssSource, /\.support-scroll \.scroll-region-viewport\{max-height:none;overflow-y:visible;scrollbar-width:thin;scrollbar-color:var\(--teacher-red\)/);
  assert.match(cssSource, /\.support-scroll--overflowing \.scroll-region-viewport\{max-height:390px;overflow-y:auto\}/);
  assert.match(cssSource, /\.teacher-main-grid\{[^}]*min-height:0/);
  assert.doesNotMatch(cssSource, /\.teacher-left-stack\{[^}]*(?:min-height:0|1fr|align-self:stretch)/);
  assert.match(cssSource, /\.support-card\{[^}]*height:auto/);
  assert.match(cssSource, /\.priority-list\{min-height:0/);
  assert.match(cssSource, /\.support-scroll \.scroll-region-viewport::\-webkit-scrollbar\{width:8px\}/);
  assert.match(cssSource, /\.support-scroll \.scroll-region-viewport::\-webkit-scrollbar-track\{[^}]*background:[^}]*border-radius:8px/);
  assert.match(cssSource, /\.support-scroll \.scroll-region-viewport::\-webkit-scrollbar-thumb\{background:var\(--teacher-red\);border-radius:8px\}/);
  assert.doesNotMatch(cssSource, /scrollbar-width:none|scroll-region-viewport::\-webkit-scrollbar\{display:none/);
  assert.match(cssSource, /\.scroll-hint\{[^}]*position:static[^}]*cursor:pointer/);
});

test("indique le contenu restant et retire l’indication à la fin", () => {
  assert.match(viewSource, /hint="Faire défiler pour voir les autres groupes ↓"/);
  assert.match(viewSource, /hint="Faire défiler pour voir les autres élèves ↓"/);
  assert.match(scrollSource, /scrollTop \+ viewport\.clientHeight < viewport\.scrollHeight - 1/);
  assert.match(scrollSource, /setHasOverflow\(viewport\.scrollHeight > viewport\.clientHeight \+ 1\)/);
  assert.match(scrollSource, /\{children\}\{hasMore && showHintControl && hintInsideViewport && <button type="button" className="scroll-hint"/);
  assert.match(scrollSource, /\{hasMore && showHintControl && !hintInsideViewport && <button type="button" className="scroll-hint"/);
  assert.match(scrollSource, /\{!hasMore && hasOverflow && endHint && <div className="scroll-end-hint" role="status">\{endHint\}<\/div>\}/);
  assert.match(cssSource, /\.portrait-scroll \.scroll-hint,\.support-scroll \.scroll-hint\{position:sticky;bottom:0[^}]*color:color-mix\(in srgb,var\(--teacher-gold\) 78%,var\(--teacher-text\)\)[^}]*font-size:\.68rem[^}]*text-align:center/);
  assert.match(cssSource, /\.support-scroll \.scroll-hint\{pointer-events:none\}/);
  assert.match(scrollSource, /viewport\.scrollBy\(\{ top: Math\.max\(80, viewport\.clientHeight \* 0\.7\)/);
  assert.match(scrollSource, /onScroll=\{updateOverflowState\}/);
  assert.match(scrollSource, /aria-describedby=\{descriptionId\}/);
  assert.match(cssSource, /@media\(max-width:1100px\)[\s\S]*\.portrait-card \.scroll-region-viewport,\.support-card \.scroll-region-viewport\{max-height:none;overflow:visible/);
  assert.doesNotMatch(viewSource, /Voir plus|href=[^>]*voir/);
});

test("compacte les lignes sans réduire la cible prioritaire", () => {
  assert.match(viewSource, /student\.groupLabel\}<\/small><p>\{student\.reasonLabel\}/);
  assert.match(cssSource, /\.priority-detail-action\{width:100%\}/);
  assert.match(cssSource, /\.priority-pill\{[^}]*font-size:\.7rem[^}]*white-space:nowrap/);
  assert.match(cssSource, /\.priority-pill\{[^}]*border:1px solid #d75b69[^}]*background:#7f2432[^}]*color:#fff8f3[^}]*box-shadow:0 0 7px #a63c4938/);
  assert.match(cssSource, /\.student-summary p\{[^}]*max-width:36ch[^}]*line-height:1\.38/);
});

test("réutilise les couleurs du thème actif pour l’action Détails", () => {
  assert.match(cssSource, /\.teacher-dashboard \.teacher-details-action\{[^}]*height:44px[^}]*border:1px solid #f4cc72[^}]*padding:0 8px[^}]*background:var\(--teacher-theme-toggle-active-bg\)[^}]*color:var\(--teacher-theme-toggle-active-text\)[^}]*font-size:\.76rem[^}]*font-weight:700[^}]*box-shadow:0 4px 14px rgba\(227,173,69,\.32\)/);
  assert.match(cssSource, /\.teacher-dashboard \.teacher-details-action:hover:not\(:disabled\):not\(\[aria-disabled="true"\]\)\{[^}]*background:color-mix/);
  assert.match(cssSource, /\.teacher-dashboard \.teacher-details-action:active:not\(:disabled\):not\(\[aria-disabled="true"\]\)\{[^}]*box-shadow:0 2px 8px/);
  assert.match(cssSource, /\.teacher-dashboard \.teacher-details-action:focus-visible\{outline:3px solid #f4cc72;outline-offset:2px\}/);
  assert.match(cssSource, /\.teacher-dashboard button\.teacher-details-action:disabled,\.teacher-dashboard \.teacher-details-action\[aria-disabled="true"\]\{[^}]*background:var\(--teacher-theme-toggle-active-bg\)[^}]*color:var\(--teacher-theme-toggle-active-text\)[^}]*cursor:not-allowed/);
  const specializedRules = cssSource.match(/\.teacher-dashboard [^{]*teacher-details-action[^{]*\{[^}]*\}/g)?.join("\n") ?? "";
  assert.doesNotMatch(specializedRules, /opacity:|filter:/);
  assert.doesNotMatch(cssSource, /\.priority-detail-action:disabled\{/);
  assert.doesNotMatch(cssSource, /--teacher-priority-action-/);
});

test("n’invente aucun seuil chiffré ni conversation dans les nouvelles données", () => {
  const serialized = JSON.stringify(createLocalTeacherDashboardData());
  assert.doesNotMatch(serialized, /\d+\s*%|conversation|transcript|messageHistory|studentResponse/i);
});

test("présente le portrait pleine largeur en quatre colonnes", () => {
  assert.match(viewSource, /<span>Participation<\/span><span>Portrait détaillé<\/span>/);
  assert.match(viewSource, /if \(group\.groupDetailHref\) return <Link className="portrait-detail-action teacher-details-action" href=\{group\.groupDetailHref\}/);
  assert.match(viewSource, /<UnavailableAction className="portrait-detail-action teacher-details-action" accessibleLabel=\{`\$\{accessibleLabel\} — Fonction à venir`\}/);
  assert.equal(createLocalTeacherDashboardData().activities[0].groupPortraits[0].groupDetailHref, "/teacher/activities/activity-revision-01/groups/group-demo-401");
  assert.ok(createLocalTeacherDashboardData().activities[0].groupPortraits.slice(1).every(({ groupDetailHref }) => groupDetailHref === undefined));
  assert.equal(new Set(createLocalTeacherDashboardData().activities[0].groupPortraits.map(({ id }) => id)).size, createLocalTeacherDashboardData().activities[0].groupPortraits.length);
  assert.match(cssSource, /\.teacher-main-grid\{display:grid;grid-template-columns:minmax\(0,2fr\) minmax\(0,3fr\)/);
  assert.match(cssSource, /\.briefing-columns,\.briefing-item\{[^}]*grid-template-columns:minmax\(140px,1\.6fr\) minmax\(130px,1\.45fr\) minmax\(80px,110px\) minmax\(80px,110px\)/);
  assert.match(cssSource, /\.portrait-detail-action\{justify-self:center;min-width:88px\}/);
  assert.doesNotMatch(cssSource, /minmax\(340px,2fr\)|grid-template-areas:"portrait support"|groups-card|groups-table/);
  assert.doesNotMatch(cssSource, /overflow-x:auto/);
});

test("présente une action de création compacte après la liste Groupes", () => {
  assert.match(viewSource, /<Link className=\{`sidebar-create-action[^\n]*href="\/teacher\/activities\/new" aria-label="Créer une activité"/);
  assert.match(viewSource, /<svg className="sidebar-create-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">/);
  assert.match(viewSource, /<span>Créer une activité<\/span>/);
  assert.match(viewSource, /className="sidebar-create-divider"/);
  assert.match(cssSource, /\.teacher-sidebar \.sidebar-create-action\{[^}]*width:100%[^}]*height:54px[^}]*min-height:54px[^}]*flex:0 0 auto[^}]*align-self:stretch[^}]*display:grid[^}]*grid-template-columns:36px minmax\(0,1fr\) 18px[^}]*border:2px solid var\(--teacher-gold\)[^}]*border-radius:16px[^}]*linear-gradient[^}]*box-shadow:/);
  assert.match(cssSource, /\.sidebar-create-icon\{[^}]*width:34px[^}]*height:34px/);
  assert.match(cssSource, /\.sidebar-create-arrow\{[^}]*width:18px[^}]*height:18px[^}]*border-radius:50%/);
  assert.equal((viewSource.match(/href="\/teacher\/activities\/new"/g) ?? []).length, 2);
  const groupsIndex = viewSource.indexOf("<TeacherGroupsDisclosure");
  const createIndex = viewSource.indexOf("sidebar-create-action");
  assert.ok(groupsIndex < createIndex);
  assert.doesNotMatch(viewSource, /context-create-action|context-create-icon|context-create-arrow/);
  assert.doesNotMatch(cssSource, /context-create-action|context-create-icon|context-create-arrow|teacher-create-area/);
  assert.doesNotMatch(viewSource, /hero-create-card|revision-visual|revision-copy|create-title|primary-action/);
  assert.doesNotMatch(cssSource, /hero-create-card|revision-(?:visual|copy|back-sheet|main-sheet|side-card|plus-badge)|primary-action/);
  assert.doesNotMatch(viewSource, /href="#"/);
});

test("supprime le bouton Ajouter un groupe dans cette carte contextuelle", () => {
  assert.doesNotMatch(viewSource, /className="secondary-action">Ajouter un groupe/);
  assert.doesNotMatch(viewSource, /Ajouter un groupe/);
  assert.doesNotMatch(viewSource, /href=[^>]*(groups|create|activity)|href="#"/);
});

test("présente la navigation minimale sans inventer de destinations", () => {
  assert.doesNotMatch(viewSource, /sidebar-home-link|aria-current="page"|>Accueil<|sidebar-active-mark/);
  assert.doesNotMatch(cssSource, /sidebar-home-link|sidebar-active-mark/);
  assert.match(viewSource, /<nav aria-label="Navigation principale">\s*<TeacherGroupsDisclosure/);
  assert.match(viewSource, /<TeacherGroupsDisclosure groups=\{data\.groups\} \/>/);
  assert.match(viewSource, /<span>Créer une activité<\/span>/);
  assert.match(viewSource, /disabled aria-disabled="true"[^>]*title="Fonction à venir"/);
  assert.doesNotMatch(viewSource, /href="\/teacher\/(groups|practices)/);
});

test("ouvre et ferme le sous-menu Groupes avec une divulgation accessible", () => {
  assert.match(groupsMenuSource, /useState\(false\)/);
  assert.match(groupsMenuSource, /aria-expanded=\{isOpen\}/);
  assert.match(groupsMenuSource, /aria-controls=\{menuId\}/);
  assert.match(groupsMenuSource, /onClick=\{\(\) => setIsOpen\(\(open\) => !open\)\}/);
  assert.match(groupsMenuSource, /\{isOpen && <div id=\{menuId\}/);
  assert.match(groupsMenuSource, /className="sidebar-nav-tile groups-disclosure"/);
  assert.match(groupsMenuSource, /className="sidebar-nav-icon"[\s\S]*<svg viewBox="0 0 24 24" focusable="false">/);
  assert.match(groupsMenuSource, /className="disclosure-chevron"/);
  assert.match(cssSource, /groups-disclosure\[aria-expanded="true"\] \.disclosure-chevron\{transform:rotate\(180deg\)\}/);
  assert.match(cssSource, /\.teacher-sidebar \.groups-disclosure\[aria-expanded="true"\]\{[^}]*border-color:[^}]*background:/);
  assert.match(cssSource, /\.teacher-sidebar \.sidebar-nav-tile\{[^}]*border:1px solid #d6a55266[^}]*box-shadow:none/);
  assert.match(cssSource, /\.teacher-sidebar \.groups-disclosure\[aria-expanded="true"\]\{[^}]*box-shadow:none/);
  assert.match(cssSource, /\.teacher-dashboard button:focus-visible[^}]*outline:3px solid var\(--teacher-gold\)[^}]*outline-offset:3px/);
  assert.match(cssSource, /\.teacher-sidebar \.sidebar-nav-tile:hover\{[^}]*border-color:[^}]*background:/);
  assert.doesNotMatch(cssSource, /\.teacher-sidebar (?:nav|\.sidebar-nav-tile)[^{]*\{[^}]*(?:position:absolute|transform:|margin:-|width:fit-content)/);
});

test("alimente la liste latérale depuis le fournisseur et borne les longues listes", () => {
  assert.match(groupsMenuSource, /groups\.map\(\(group\)/);
  assert.match(groupsMenuSource, /group\.name/);
  assert.match(groupsMenuSource, /group\.studentCount/);
  assert.match(groupsMenuSource, /data-long-list=\{groups\.length >= 8 \|\| undefined\}/);
  assert.match(groupsMenuSource, /className="sidebar-groups-scroll"/);
  assert.match(cssSource, /\.sidebar-groups-scroll \.scroll-region-viewport\{[^}]*max-height:240px/);
  assert.match(groupsMenuSource, /Détails du groupe — Fonction à venir/);
});

test("ne crée aucune navigation de groupe ou d’élève dans le sous-menu", () => {
  assert.doesNotMatch(groupsMenuSource, /<Link|href=|\/eleve|student-dashboard/);
  assert.match(groupsMenuSource, /<ul className="sidebar-groups-list">/);
  assert.match(groupsMenuSource, /tabIndex=\{0\} aria-label=\{`\$\{group\.name\}[\s\S]*Fonction à venir/);
  assert.match(cssSource, /\.teacher-sidebar \.sidebar-nav-tile\{[^}]*width:100%[^}]*min-height:54px[^}]*grid-template-columns:36px minmax\(0,1fr\) 18px[^}]*border-radius:16px/);
  assert.match(cssSource, /\.sidebar-groups-list li:focus-visible\{outline:2px solid #d6a552/);
  assert.match(cssSource, /\.teacher-sidebar \.sidebar-nav-tile\{[^}]*width:100%/);
  assert.match(cssSource, /\.teacher-sidebar \.sidebar-create-action\{width:100%/);
  assert.match(cssSource, /@media \(max-width:980px\)[\s\S]*\.teacher-sidebar nav\{[^}]*width:100%[^}]*display:flex[^}]*margin-left:0/);
  assert.match(cssSource, /@media \(max-width:980px\)[\s\S]*\.teacher-groups-submenu\{position:static;width:100%/);
  assert.doesNotMatch(cssSource, /\.teacher-groups-submenu\{[^}]*overflow-x/);
  assert.match(cssSource, /@media \(prefers-reduced-motion:reduce\)/);
});

test("filtre strictement les deux raisons de priorité élevée approuvées", () => {
  const candidates: TeacherSupportCandidate[] = [
    { id: "a", displayLabel: "A", groupId: "g", groupLabel: "G", priority: "high", highPriorityReason: "failed_assessment", reasonLabel: "Échec" },
    { id: "b", displayLabel: "B", groupId: "g", groupLabel: "G", priority: "high", highPriorityReason: "near_failure", reasonLabel: "Près du seuil" },
    { id: "c", displayLabel: "C", groupId: "g", groupLabel: "G", priority: "medium", reasonLabel: "À surveiller" },
    { id: "d", displayLabel: "D", groupId: "g", groupLabel: "G", priority: "high", reasonLabel: "Sans raison approuvée" },
  ];
  assert.deepEqual(selectHighPriorityStudents(candidates).map(({ id }) => id), ["a", "b"]);
});

test("inclut failed_assessment et near_failure fournis explicitement", () => {
  const viewModel = createTeacherDashboardViewModel(createLocalTeacherDashboardData());
  assert.deepEqual(viewModel.highPriorityStudents.map(({ highPriorityReason }) => highPriorityReason), ["failed_assessment", "near_failure", "near_failure"]);
  assert.deepEqual(viewModel.highPriorityStudents.map(({ id }) => id), ["student-demo-a17", "student-demo-b08", "student-demo-d22"]);
  assert.match(viewModel.highPriorityStudents[2].displayLabel, /Sofia P\. \(fictive\)/);
  assert.equal(new Set(createLocalTeacherDashboardData().supportCandidates.map(({ id }) => id)).size, createLocalTeacherDashboardData().supportCandidates.length);
});

test("exclut les priorités moyennes et les élèves seulement à surveiller", () => {
  const viewModel = createTeacherDashboardViewModel(createLocalTeacherDashboardData());
  assert.ok(viewModel.highPriorityStudents.every(({ priority }) => priority === "high"));
  assert.ok(viewModel.highPriorityStudents.every(({ reasonLabel }) => !reasonLabel.includes("À surveiller")));
});

test("préserve l’état vide professionnel", () => {
  assert.match(viewSource, /Aucun élève en priorité élevée pour cette activité/);
  const empty = createTeacherDashboardViewModel({ ...createLocalTeacherDashboardData(), activities: [{ ...createLocalTeacherDashboardData().activities[0], highPriorityStudents: [] }], selectedActivityId: createLocalTeacherDashboardData().activities[0].id });
  assert.deepEqual(empty.highPriorityStudents, []);
});

test("le fournisseur local utilise seulement des identités et constats fictifs", () => {
  const data = createLocalTeacherDashboardData();
  assert.equal(data.source, "local_demo");
  assert.match(data.teacher.displayLabel, /fictive/i);
  assert.ok(data.supportCandidates.every(({ displayLabel }) => /ficti(?:f|ve)/i.test(displayLabel)));
  assert.ok(data.groupBriefings.every(({ name, suggestion }) => /fictif/i.test(`${name} ${suggestion}`)));
});

test("le fournisseur local est interchangeable et interdit en production", async () => {
  assert.equal(isLocalTeacherDashboardEnabled("production"), false);
  await assert.rejects(() => new LocalDemoTeacherDashboardProvider("production").getDashboard(LOCAL_DEMO_TEACHER_ID), /disabled in production/);
  assert.match(pageSource, /if \(!isLocalTeacherDashboardEnabled\(\)\) notFound\(\)/);
});

test("n’ajoute aucun appel IA ou externe et limite le stockage au registre local", () => {
  const sources = [
    "lib/teacher-dashboard/local-provider.ts",
    "lib/teacher-dashboard/presentation.ts",
    "app/teacher/page.tsx",
    "app/teacher/teacher-dashboard-view.tsx",
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  assert.doesNotMatch(sources, /fetch\(|https?:|OpenAI|SpeechSDK|sessionStorage|indexedDB|console\./);
  assert.match(viewSource, /repository\.listPublishedActivities\(\)/);
  assert.match(viewSource, /repository\.listStudentOutcomes\(\)/);
  assert.match(viewSource, /createLocalTeacherActivitySummaries\(localActivities, data\.allGroups, studentOutcomes, studentProgress\)/);
  assert.match(viewSource, /\.\.\.localActivitySummaries, \.\.\.data\.activities/);
});

test("le modèle enseignant ne contient aucune conversation complète", () => {
  const types = readFileSync("lib/teacher-dashboard/types.ts", "utf8");
  const data = JSON.stringify(createLocalTeacherDashboardData());
  assert.doesNotMatch(types, /conversation|transcript|studentResponse|messageHistory/i);
  assert.doesNotMatch(data, /conversation|transcript|réponse complète/i);
});

test("utilise une palette enseignante sémantique distincte en clair et sombre", () => {
  assert.match(cssSource, /--teacher-bg:#f3eee6/);
  assert.match(cssSource, /--teacher-sidebar:#3a1934/);
  assert.match(cssSource, /\[data-theme="dark"\] \.teacher-dashboard/);
  assert.match(cssSource, /--teacher-bg:#211b20/);
  assert.match(cssSource, /--teacher-sidebar:#241020/);
  assert.doesNotMatch(cssSource, /--teacher-bg:#001|--teacher-sidebar:#001/);
  assert.equal((viewSource.match(/className="teacher-card /g) ?? []).length, 3);
  assert.match(viewSource, /className=\{`teacher-card support-card/);
  assert.match(cssSource, /--teacher-analysis-card-border:#b9a79f/);
  assert.match(cssSource, /--teacher-analysis-card-shadow:0 8px 28px #39182f0a,inset 0 0 0 1px #6f315f0a/);
  assert.match(cssSource, /\[data-theme="dark"\] \.teacher-dashboard\{[^}]*--teacher-analysis-card-border:#735d69[^}]*--teacher-analysis-card-shadow:0 8px 28px #0000001f,inset 0 0 0 1px #d6a55214/);
  assert.match(cssSource, /\.teacher-card\{[^}]*border:1px solid var\(--teacher-analysis-card-border\)[^}]*padding:24px[^}]*box-shadow:var\(--teacher-analysis-card-shadow\)/);
});

test("préserve les cibles, le focus et une hiérarchie accessible", () => {
  assert.match(viewSource, /<h1 className="teacher-activity-title" id="teacher-dashboard-title">\{activeActivity\.customTitle\}<\/h1>/);
  assert.match(viewSource, /aria-labelledby="global-portrait-title"/);
  assert.match(viewSource, /aria-labelledby="support-title"/);
  assert.doesNotMatch(viewSource, /aria-labelledby="groups-title"/);
  assert.match(cssSource, /\.teacher-dashboard \.teacher-details-action\{height:44px/);
  assert.match(cssSource, /\.teacher-dashboard \.theme-switch button\{[^}]*width:36px[^}]*height:36px/);
  assert.match(cssSource, /:focus-visible/);
  assert.match(viewSource, /aria-label=\{activityPickerAccessibleLabel\}/);
  assert.match(viewSource, /disabled aria-disabled="true"/);
});

test("adapte les cartes de groupes et la grille prioritaire aux petits écrans", () => {
  assert.match(cssSource, /@media\(max-width:1100px\)[\s\S]*\.briefing-item\{grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\) 100px/);
  assert.match(cssSource, /@media\(max-width:1100px\)[\s\S]*\.priority-list\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
  assert.match(cssSource, /@media\(max-width:620px\)[\s\S]*\.priority-list\{grid-template-columns:1fr\}/);
  assert.match(cssSource, /min-width:0/);
  assert.doesNotMatch(cssSource, /overflow-x:auto/);
});

test("préserve le mode réduit et le sélecteur de thème", () => {
  assert.match(viewSource, /<ThemeToggle \/>/);
  assert.match(cssSource, /\.teacher-dashboard \.theme-switch/);
  assert.match(themeToggleSource, /className="theme-option-light"/);
  assert.match(themeToggleSource, /className="theme-option-dark"/);
  assert.match(themeToggleSource, /aria-label="Thème clair" title="Thème clair"/);
  assert.match(themeToggleSource, /aria-label="Thème sombre" title="Thème sombre"/);
  assert.match(cssSource, /--teacher-theme-toggle-active-text:#17131a/);
  assert.match(cssSource, /--teacher-theme-toggle-inactive-text:#2b2229/);
  assert.match(cssSource, /--teacher-theme-toggle-active-bg:var\(--teacher-gold\)/);
  assert.match(cssSource, /\[data-theme="dark"\] \.teacher-dashboard\{[^}]*--teacher-theme-toggle-inactive-text:#f5edf2/);
  assert.match(cssSource, /\.teacher-dashboard \.theme-switch\{[^}]*gap:1px[^}]*padding:2px[^}]*border:1px solid[^}]*box-shadow:none/);
  assert.match(cssSource, /\.teacher-dashboard \.theme-switch button\{[^}]*width:36px[^}]*height:36px[^}]*background:transparent[^}]*font-size:1rem/);
  assert.match(cssSource, /\.teacher-dashboard \.theme-switch button\[aria-pressed="true"\]\{background:color-mix\(in srgb,var\(--teacher-gold\) 16%,transparent\);color:var\(--teacher-gold\)\}/);
  assert.match(cssSource, /\.teacher-dashboard \.theme-switch button:focus-visible\{outline:2px solid var\(--teacher-gold\);outline-offset:-2px\}/);
  assert.doesNotMatch(cssSource, /\.teacher-dashboard \.theme-switch(?:::before|:::after)|theme-switch button\[aria-pressed="true"\]::(?:before|after)/);
  assert.doesNotMatch(cssSource, /\.teacher-dashboard \.theme-switch[^\n]*(?:translate|scale)\(/);
  assert.match(cssSource, /@media \(prefers-reduced-motion:reduce\)/);
});

test("hydrate le sélecteur de thème avec un premier rendu déterministe", () => {
  assert.match(themeToggleSource, /useState<Theme>\("light"\)/);
  assert.match(themeToggleSource, /useEffect\(\(\) => \{[\s\S]*localStorage\.getItem\("socrato-theme"\)[\s\S]*matchMedia\("\(prefers-color-scheme: dark\)"\)[\s\S]*queueMicrotask[\s\S]*setTheme\(preferredTheme\)[\s\S]*document\.documentElement\.dataset\.theme = preferredTheme;[\s\S]*\}, \[\]\)/);
  assert.doesNotMatch(themeToggleSource, /useState[^;]*(?:window|document|localStorage|matchMedia)/);
  assert.match(themeToggleSource, /aria-pressed=\{theme === "light"\}/);
  assert.match(themeToggleSource, /aria-pressed=\{theme === "dark"\}/);
  assert.match(themeToggleSource, /setTheme\(nextTheme\)[\s\S]*localStorage\.setItem\("socrato-theme", nextTheme\)/);
  assert.doesNotMatch(themeToggleSource, /suppressHydrationWarning/);
  assert.doesNotMatch(viewSource, /Date\.now\(\)|Math\.random\(\)|typeof window[^\n]*\?/);
});

test("supprime entièrement l’ancienne rangée supérieure", () => {
  assert.doesNotMatch(viewSource, /teacher-top-overview|hero-welcome-card|hero-activity-card|hero-create-card|Bonjour, Mme Dupont/);
  assert.doesNotMatch(cssSource, /teacher-top-overview|hero-welcome-card|hero-activity-card|hero-create-card|grid-area:create/);
  assert.doesNotMatch(cssSource, /grid-template-areas:[^}]*create/);
});

test("centre un en-tête contextuel compact et responsive", () => {
  assert.match(viewSource, /className="teacher-context-header"/);
  assert.doesNotMatch(viewSource, /teacher-context-eyebrow|teacher-context-badge|ACTIVITÉ SÉLECTIONNÉE|ACTIVITÉ EN COURS/);
  assert.match(viewSource, /className="teacher-context-date"/);
  assert.match(viewSource, /className="teacher-context-meta"/);
  assert.doesNotMatch(viewSource, /teacher-completion-row|teacher-completion-progress/);
  const brandIndex = viewSource.indexOf('className="teacher-brand"');
  const sidebarCreateIndex = viewSource.indexOf("sidebar-create-action");
  const navIndex = viewSource.indexOf('<nav aria-label="Navigation principale">');
  const contextMainIndex = viewSource.indexOf('className="teacher-context-main"');
  const themeAreaIndex = viewSource.indexOf('className="teacher-theme-area"');
  assert.ok(brandIndex < navIndex && navIndex < sidebarCreateIndex);
  assert.ok(contextMainIndex < themeAreaIndex);
  assert.ok(viewSource.indexOf('className="teacher-activity-title"') < viewSource.indexOf("<ThemeToggle />"));
  assert.match(cssSource, /\.teacher-context-header\{grid-row:1[^}]*display:grid[^}]*grid-template-columns:minmax\(0,1fr\)[^}]*margin:0 calc\(-1 \* clamp\(18px,4vw,56px\)\)[^}]*padding:25px clamp\(18px,4vw,56px\) 24px[^}]*border-bottom:1px solid[^}]*radial-gradient/);
  assert.match(cssSource, /\.teacher-dashboard\{[^}]*--teacher-shell-row-gap:30px[^}]*grid-template-columns:250px minmax\(0,1fr\)[^}]*grid-template-rows:auto minmax\(0,1fr\)[^}]*row-gap:var\(--teacher-shell-row-gap\)/);
  assert.match(cssSource, /\.teacher-sidebar\{grid-column:1;grid-row:1\/3[^}]*padding:0 20px 28px[^}]*display:grid[^}]*grid-template-rows:subgrid/);
  assert.match(viewSource, /className="teacher-brand-lockup"[\s\S]*className="teacher-brand-symbol"[\s\S]*className="socrato-brand-logo"[^>]*src="\/logos\/socrato-logo-blanc-recadre\.png"[^>]*width=\{486\}[^>]*height=\{696\}[^>]*alt="Logo Socrato"[\s\S]*className="teacher-brand-name">SOCRATO[\s\S]*className="teacher-brand-subtitle">Espace enseignant/);
  assert.match(cssSource, /\.teacher-brand\{grid-column:1;grid-row:1;min-width:0;min-height:0;contain:none[^}]*align-items:center[^}]*justify-content:center[^}]*text-align:left\}/);
  assert.match(cssSource, /\.teacher-brand-lockup\{min-width:0;height:auto;min-height:0;flex-direction:row;align-items:center;justify-content:flex-start;align-content:initial;gap:8px;padding-top:0\}/);
  assert.match(cssSource, /\.teacher-brand-symbol,\.teacher-brand-copy\{flex:0 0 auto;margin:0\}/);
  assert.match(cssSource, /\.teacher-brand-copy\{align-items:flex-start;gap:3px\}/);
  assert.match(cssSource, /\.teacher-brand strong\{font-size:19px;font-weight:700[^}]*letter-spacing:\.035em[^}]*white-space:nowrap\}/);
  assert.match(cssSource, /\.teacher-brand small\{font-size:12px;font-weight:400[^}]*white-space:nowrap\}/);
  assert.match(cssSource, /\.teacher-brand-symbol\{width:38px;height:38px;min-height:38px;max-height:38px;aspect-ratio:1;display:grid;place-items:center;margin:0;padding:0;overflow:hidden;flex:0 0 38px\}/);
  assert.match(cssSource, /\.teacher-brand-symbol img,\.teacher-brand-symbol svg\{display:block;width:38px;height:38px;object-fit:contain;margin:0\}/);
  assert.match(cssSource, /\.teacher-brand-name\{margin:0;line-height:1\}/);
  assert.match(cssSource, /\.teacher-brand-subtitle\{margin:0;line-height:1\.2\}/);
  assert.match(cssSource, /@media\(max-width:1100px\)[\s\S]*\.teacher-brand-symbol\{width:38px;height:38px;min-height:38px;max-height:38px;flex-basis:38px\}/);
  assert.match(cssSource, /@media \(max-width:980px\)[\s\S]*\.teacher-brand\{[^}]*contain:none[^}]*text-align:left\}[^]*\.teacher-brand-lockup\{flex-direction:row;gap:8px;padding-top:0\}[^]*\.teacher-brand-copy\{align-items:flex-start;margin-top:0\}[^]*\.teacher-brand-symbol\{width:38px;height:38px;min-height:38px;max-height:38px;flex-basis:38px\}/);
  assert.doesNotMatch(cssSource, /\.teacher-brand\{[^}]*(?:position:absolute|transform:|margin:-)/);
  assert.match(cssSource, /\.teacher-sidebar nav\{box-sizing:border-box;grid-column:1;grid-row:2;width:100%;min-width:0;align-items:stretch;display:flex;flex-direction:column;justify-content:flex-start;gap:20px\}/);
  assert.match(cssSource, /\.teacher-sidebar nav \.teacher-groups-menu\{width:100%;min-width:0\}/);
  assert.match(cssSource, /\.teacher-sidebar nav \.groups-disclosure>span:nth-child\(2\),\.teacher-sidebar nav \.sidebar-create-action>span:first-of-type\{white-space:nowrap\}/);
  assert.match(cssSource, /\.teacher-content\{grid-column:2;grid-row:1\/3[^}]*display:grid[^}]*grid-template-rows:subgrid/);
  assert.match(cssSource, /\.teacher-dashboard-body\{grid-row:2;min-width:0;display:grid;gap:28px;padding-bottom:48px\}/);
  assert.match(viewSource, /className="socrato-observation-card" aria-label="Accueil de Socrato"/);
  assert.match(viewSource, /<span>Créer une activité<\/span>/);
  assert.match(groupsMenuSource, /<span>Groupes<\/span>/);
  assert.doesNotMatch(cssSource, /\.teacher-sidebar nav\{[^}]*(?:position:absolute|translateY|margin:-|(?:width|inline-size):(?:fit-content|min-content|max-content)|align-self:(?:start|center|end))/);
  assert.match(cssSource, /@media \(max-width:980px\)[\s\S]*\.teacher-sidebar\{grid-column:1;grid-row:auto[^}]*display:flex[^}]*flex-direction:column[^}]*flex-wrap:nowrap[^}]*align-items:stretch/);
  assert.match(cssSource, /@media \(max-width:980px\)[\s\S]*\.teacher-content\{grid-column:1;grid-row:auto[^}]*display:block/);
  assert.match(cssSource, /\.teacher-context-main\{grid-column:1;grid-row:1[^}]*padding-inline:115px/);
  assert.match(cssSource, /\.teacher-theme-area\{grid-column:1;grid-row:1[^}]*justify-self:end/);
  assert.doesNotMatch(cssSource, /\.teacher-theme-area\{[^}]*position:absolute/);
  assert.match(cssSource, /\.teacher-activity-title\{[^}]*font-size:clamp\(1\.55rem,1\.85vw,1\.75rem\)[^}]*white-space:nowrap[^}]*text-shadow:/);
  assert.match(viewSource, /className="teacher-title-theme-row">[\s\S]*teacher-context-rule-left[\s\S]*teacher-activity-title[\s\S]*teacher-context-rule-right/);
  assert.equal((viewSource.match(/teacher-context-rule teacher-context-rule-/g) ?? []).length, 2);
  assert.doesNotMatch(viewSource, /className="teacher-context-meta">\s*<span className="teacher-context-rule/);
  assert.match(cssSource, /\.teacher-title-theme-row\{[^}]*display:grid[^}]*grid-template-columns:minmax\(24px,54px\) max-content minmax\(24px,54px\)[^}]*align-items:center[^}]*gap:22px/);
  assert.match(cssSource, /\.teacher-context-rule-left\{background:linear-gradient\(90deg,transparent,color-mix/);
  assert.match(cssSource, /\.teacher-context-rule-right\{background:linear-gradient\(90deg,color-mix[^}]*transparent\)/);
  assert.doesNotMatch(cssSource, /\.teacher-context-(?:eyebrow|badge)\{/);
  assert.match(cssSource, /\.teacher-dashboard \.theme-switch button\{[^}]*width:36px[^}]*height:36px[^}]*font-size:1rem/);
  assert.equal((viewSource.match(/className="analysis-section-title"/g) ?? []).length, 2);
  assert.match(cssSource, /\.analysis-section-title h2\{white-space:nowrap\}/);
  assert.match(cssSource, /@media\(max-width:1100px\)[\s\S]*\.analysis-section-title h2\{white-space:normal\}/);
  assert.match(cssSource, /@media\(max-width:760px\)[\s\S]*\.teacher-activity-title\{white-space:normal\}/);
  assert.match(cssSource, /@media\(min-width:621px\) and \(max-width:760px\)\{\.teacher-title-theme-row\{grid-template-columns:minmax\(16px,36px\) max-content minmax\(16px,36px\);gap:12px\}\}/);
  assert.match(cssSource, /@media\(max-width:620px\)[\s\S]*\.teacher-context-rule\{display:none\}/);
  assert.match(cssSource, /\.teacher-dashboard \.theme-switch button\[aria-pressed="true"\]\{background:color-mix\(in srgb,var\(--teacher-gold\) 16%,transparent\);color:var\(--teacher-gold\)\}/);
  assert.doesNotMatch(cssSource, /theme-option-(?:light|dark)\{[^}]*color:/);
  assert.match(cssSource, /\.activity-picker\{[^}]*width:max-content/);
  assert.match(cssSource, /\.activity-picker-control\{[^}]*display:inline-flex/);
  assert.match(cssSource, /\.activity-picker select\{[^}]*field-sizing:content[^}]*display:inline-flex[^}]*width:max-content[^}]*min-height:32px[^}]*border:1px solid[^}]*padding:5px 29px 5px 11px[^}]*font-size:\.66rem[^}]*text-overflow:clip[^}]*box-shadow:none[^}]*white-space:nowrap/);
  assert.match(viewSource, /className="activity-picker-control"[\s\S]*<svg viewBox="0 0 12 12"/);
  assert.doesNotMatch(cssSource, /\.activity-picker-control svg\{[^}]*margin-left:auto/);
  assert.doesNotMatch(cssSource, /overflow-x:auto/);
});

test("présente un tableau de bord contextuel par activité sélectionnée", () => {
  assert.match(viewSource, /Changer d’activité/);
  assert.doesNotMatch(viewSource, /Changer d’activité de révision/);
  assert.doesNotMatch(viewSource, /Changer d’activité d’enrichissement/);
  assert.match(viewSource, /<option value="" disabled>\{activityPickerAccessibleLabel\}<\/option>/);
  assert.match(viewSource, /activities\.map\(\(activity\) => <option key=\{activity\.id\} value=\{activity\.id\}>\{activity\.customTitle\}/);
  assert.match(viewSource, /<select id="teacher-activity-picker" value="" onChange=\{\(event\) => setSelectedActivityId\(event\.target\.value\)\}/);
  assert.doesNotMatch(viewSource, /<select id="teacher-activity-picker" value=\{selectedActivityId/);
  assert.match(viewSource, /title="Portrait des groupes"/);
  assert.match(viewSource, /title="Élèves prioritaires"/);
  assert.doesNotMatch(viewSource, /Suivi par groupe/);
  assert.doesNotMatch(viewSource, /Aperçu fictif de la semaine/);
  assert.doesNotMatch(viewSource, /Démonstration locale/);
  assert.doesNotMatch(viewSource, /Voici un aperçu de votre semaine/);
  assert.doesNotMatch(viewSource, /Ajouter un groupe/);
  assert.match(viewSource, /className="teacher-context-header"/);
  assert.match(viewSource, /window\.history\.replaceState/);
  assert.match(viewSource, /activities\.find\(\(activity\) => activity\.id === selectedActivityId\) \?\? data\.selectedActivity/);
  assert.match(pageSource, /\(await searchParams\)\.activity/);
  assert.match(pageSource, /selectedActivityId: selectedActivityId \?\? data\.selectedActivityId/);
  const unknownActivity = createTeacherDashboardViewModel({ ...createLocalTeacherDashboardData(), selectedActivityId: "unknown" });
  assert.notEqual(unknownActivity.selectedActivity.id, "unknown");
  assert.match(viewSource, /<ThemeToggle \/>/);
  assert.doesNotMatch(viewSource, /className="theme-switch"/);
  assert.match(viewSource, /className="activity-picker"/);
});

test("présente toutes les activités de la plus récente à la plus ancienne", () => {
  assert.match(viewSource, /id="all-activities-title">Toutes les activités/);
  assert.match(viewSource, /activitiesByPublication/);
  assert.match(viewSource, /right\.publishedAt\.localeCompare\(left\.publishedAt\)/);
  assert.match(viewSource, /setSelectedActivityId\(activity\.id\)/);
  assert.match(viewSource, /Résultats disponibles/);
  assert.match(viewSource, /Résultats partiels/);
  assert.match(viewSource, /En attente de résultats/);
  assert.match(cssSource, /\.all-activities-card li button\{[^}]*grid-template-columns/);
  assert.match(viewSource, /Suspendre l’activité/);
  assert.match(viewSource, /Réactiver l’activité/);
  assert.match(viewSource, />Archiver<\/button>/);
  assert.match(viewSource, /\.setPublishedActivityStatus\(activityId, status\)/);
  assert.match(cssSource, /\.all-activities-status--suspended/);
  assert.match(cssSource, /\.all-activities-status--archived/);
  assert.match(cssSource, /@media\(max-width:620px\)[\s\S]*\.all-activities-card li button\{grid-template-columns:1fr auto/);
});

test("présente le brouillon avec les actions continuer et supprimer", () => {
  assert.match(viewSource, /repository\.readActiveDraftSummary\(\)/);
  assert.match(viewSource, /className="teacher-card activity-draft-card"/);
  assert.match(viewSource, /href="\/teacher\/activities\/new">Continuer/);
  assert.match(viewSource, /window\.confirm\("Supprimer ce brouillon d’activité\?/);
  assert.match(viewSource, /\.clearActiveDraft\(\)/);
  assert.match(viewSource, /setActivityDraft\(null\)/);
  assert.match(cssSource, /\.activity-draft-card/);
  assert.match(cssSource, /@media\(max-width:620px\)[\s\S]*\.activity-draft-details/);
});

test("prépare les futurs champs de groupe sans surcharger l’aperçu", () => {
  const types = readFileSync("lib/teacher-dashboard/types.ts", "utf8");
  assert.match(types, /dueDate: string \| null/);
  assert.match(types, /latestActivity: string \| null/);
  assert.match(types, /historicalKnowledgeToReview/);
  assert.match(types, /intellectualOperationsToReview/);
  assert.match(types, /accessCodeManagementAvailable/);
});

test("simplifie l’en-tête compact sans progression globale", () => {
  const titleIndex = viewSource.indexOf('className="teacher-title-theme-row"');
  const dateIndex = viewSource.indexOf('className="teacher-context-date"');
  const pickerIndex = viewSource.indexOf('className="activity-picker"');
  assert.ok(titleIndex < dateIndex && dateIndex < pickerIndex);
  assert.match(viewSource, /className="teacher-context-meta"[\s\S]*Publiée le[\s\S]*className="activity-picker"/);
  assert.match(viewSource, /<option value="" disabled>\{activityPickerAccessibleLabel\}<\/option>/);
  assert.doesNotMatch(viewSource, /teacher-completion-row|teacher-completion-progress|role="progressbar"/);
  assert.doesNotMatch(cssSource, /teacher-completion-row|teacher-completion-progress|teacher-context-type/);
  assert.match(cssSource, /\.teacher-context-meta\{[^}]*display:flex[^}]*flex-direction:column[^}]*align-items:center[^}]*justify-content:center/);
});

test("affiche une participation explicite, accessible et bornée pour chaque portrait", () => {
  const types = readFileSync("lib/teacher-dashboard/types.ts", "utf8");
  const portraits = createLocalTeacherDashboardData().activities.flatMap((activity) => activity.groupPortraits);
  assert.match(types, /TeacherGroupBriefing[\s\S]*completedStudentCount: number;[\s\S]*targetedStudentCount: number;/);
  assert.deepEqual(portraits.slice(0, 4).map(({ completedStudentCount, targetedStudentCount }) => [completedStudentCount, targetedStudentCount]), [[21, 24], [18, 23], [24, 25], [17, 22]]);
  assert.ok(portraits.every(({ completedStudentCount, targetedStudentCount }) => completedStudentCount >= 0 && completedStudentCount <= targetedStudentCount));
  assert.match(viewSource, /Math\.min\(100, Math\.max\(0, Math\.round\(\(value \/ total\) \* 100\)\)\)/);
  assert.match(viewSource, /group\.targetedStudentCount === 0 \? "Aucune participation disponible"/);
  assert.match(viewSource, /`\$\{group\.completedStudentCount\} élèves sur \$\{group\.targetedStudentCount\} ont terminé l’activité, soit \$\{participationPercentage\} %\.`/);
  assert.match(viewSource, /<strong>\{group\.targetedStudentCount === 0 \? "—" : `\$\{participationPercentage\} %`\}<\/strong>/);
  assert.match(viewSource, /`\$\{group\.completedStudentCount\} sur \$\{group\.targetedStudentCount\}`/);
  assert.match(cssSource, /\.teacher-main-grid\{[^}]*grid-template-columns:minmax\(0,2fr\) minmax\(0,3fr\)[^}]*gap:22px/);
  assert.match(cssSource, /\.briefing-columns,\.briefing-item\{[^}]*grid-template-columns:minmax\(140px,1\.6fr\) minmax\(130px,1\.45fr\) minmax\(80px,110px\) minmax\(80px,110px\)/);
  assert.match(cssSource, /\.participation-ring\{[^}]*width:62px[^}]*height:62px[^}]*conic-gradient/);
});
