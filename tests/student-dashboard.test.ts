import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { StudentSession, StudentSessionRepository } from "../lib/student-access/session.ts";
import { loadAuthorizedStudentDashboard } from "../lib/student-dashboard/access.ts";
import { createDemoStudentDashboard, DEMO_INTELLECTUAL_OPERATIONS, LocalDemoStudentDashboardProvider } from "../lib/student-dashboard/demo-provider.ts";
import { ACTE_UNION_HISTORICAL_KNOWLEDGE } from "../lib/student-dashboard/historical-knowledge-catalog.ts";
import { getHistoricalPeriodLabel } from "../lib/student-dashboard/historical-period.ts";
import { getKnowledgeScrollState, getNextKnowledgeScrollTop } from "../lib/student-dashboard/knowledge-scroll.ts";
import { ACTIVITY_STATUS_LABELS, ACTIVITY_TYPE_LABELS, getActivityActionLabel, getWorkedHistoricalKnowledge, getWorkedOperations } from "../lib/student-dashboard/presentation.ts";
import type { StudentDashboardProvider } from "../lib/student-dashboard/provider.ts";
import { getActivityDashboardUrl, getLearningSessionUrl, getSelectedActivity } from "../lib/student-dashboard/selection.ts";
import type { StudentDashboardData } from "../lib/student-dashboard/types.ts";

const viewSource = readFileSync("app/eleve/tableau-de-bord/dashboard-view.tsx", "utf8");
const cssSource = readFileSync("app/eleve/tableau-de-bord/dashboard.css", "utf8");
const pageSource = readFileSync("app/eleve/tableau-de-bord/page.tsx", "utf8");
const providerSource = readFileSync("lib/student-dashboard/demo-provider.ts", "utf8");
const knowledgeScrollSource = readFileSync("app/eleve/tableau-de-bord/knowledge-scroll-region.tsx", "utf8");

class TestSessions implements StudentSessionRepository {
  constructor(private active: boolean) {}
  async create(): Promise<StudentSession> { throw new Error("Not used."); }
  async findActiveByToken(token: string): Promise<StudentSession | null> {
    return this.active && token === "valid-session" ? { token, anonymousStudentId: "anonymous-test-student", credentialId: "credential-test", expiresAt: new Date("2099-01-01") } : null;
  }
}
class TestProvider implements StudentDashboardProvider {
  constructor(private data: StudentDashboardData) {}
  async getForAnonymousStudent(): Promise<StudentDashboardData> { return this.data; }
}

test("protège le tableau de bord avec la session élève", async () => {
  const provider = new TestProvider(createDemoStudentDashboard());
  assert.equal(await loadAuthorizedStudentDashboard(undefined, new TestSessions(true), provider), null);
  assert.equal(await loadAuthorizedStudentDashboard("invalid", new TestSessions(false), provider), null);
  assert.ok(await loadAuthorizedStudentDashboard("valid-session", new TestSessions(true), provider));
  assert.match(pageSource, /redirect\("\/eleve"\)/);
});

test("affiche par défaut l’activité récente avec son titre personnalisé", () => {
  const activity = getSelectedActivity(createDemoStudentDashboard());
  assert.equal(activity.id, "demo-activity-acte-union");
  assert.equal(activity.isRecent, true);
  assert.equal(activity.activityTitle, "Révision avant l’évaluation 1");
  assert.equal(activity.origin, "teacher_assigned");
  assert.equal(activity.activityType, "revision");
});

test("conserve tous les champs distincts de la carte principale", () => {
  const activity = getSelectedActivity(createDemoStudentDashboard());
  assert.equal(ACTIVITY_TYPE_LABELS[activity.activityType], "Activité de révision");
  assert.equal(activity.publicationDate, "16 mai 2025");
  assert.equal(getHistoricalPeriodLabel(activity.historicalPeriod), "1840–1896");
  assert.equal(activity.durationMinutes, 25);
  assert.equal(activity.historicalKnowledgeIds.length, 4);
  assert.equal(activity.progressPercentage, 35);
  assert.equal(activity.activityStatus, "in_progress");
});

test("présente Commencer, Poursuivre et Voir mon bilan selon l’état", () => {
  const activities = createDemoStudentDashboard().activities;
  assert.equal(getActivityActionLabel(activities.find(({ activityStatus }) => activityStatus === "not_started")!), "Commencer l’activité");
  assert.equal(getActivityActionLabel(activities.find(({ activityStatus }) => activityStatus === "in_progress")!), "Poursuivre l’activité");
  assert.equal(getActivityActionLabel(activities.find(({ activityStatus }) => activityStatus === "completed")!), "Voir mon bilan");
  assert.deepEqual(new Set(Object.values(ACTIVITY_STATUS_LABELS)), new Set(["À commencer", "En cours", "Terminée"]));
});

test("remplace Nouvelle activité disponible une fois terminée", () => {
  assert.match(viewSource, /!completed \? <div className="new-activity-heading"/);
  assert.match(viewSource, /Bravo ! Tu as terminé cette activité de révision !/);
  assert.match(viewSource, /completed \? "Bravo/);
});

test("expose exactement les sept opérations officielles pour chaque activité", () => {
  assert.equal(DEMO_INTELLECTUAL_OPERATIONS.length, 7);
  assert.deepEqual(DEMO_INTELLECTUAL_OPERATIONS.map(({ label }) => label), [
    "Établir des faits", "Déterminer des causes et des conséquences", "Situer dans le temps et dans l’espace", "Mettre en relation des faits", "Déterminer des changements et des continuités", "Déterminer des différences et des similitudes", "Établir des liens de causalité",
  ]);
  assert.equal(createDemoStudentDashboard().activities.every(({ operations }) => operations.length === 7), true);
});

test("utilise uniquement les connaissances du catalogue canonique", () => {
  const canonical = new Set(ACTE_UNION_HISTORICAL_KNOWLEDGE.map(({ id }) => id));
  for (const activity of createDemoStudentDashboard().activities) {
    assert.equal(activity.historicalKnowledgeIds.every((id) => canonical.has(id as never)), true);
    assert.equal(activity.historicalKnowledge.every(({ id }) => canonical.has(id as never)), true);
  }
});

test("présente un bilan explicatif avant la fin", () => {
  const activity = getSelectedActivity(createDemoStudentDashboard());
  assert.equal(activity.summary.state, "pending");
  assert.deepEqual(activity.summary.strengths, []);
  assert.match(viewSource, /Lorsque tu auras terminé cette activité, Socrato préparera un bilan personnalisé/);
});

test("présente un bilan local structuré et explicitement non réel après la fin", () => {
  const completed = createDemoStudentDashboard().activities.find(({ activityStatus }) => activityStatus === "completed");
  assert.ok(completed);
  assert.equal(completed.summary.state, "local_demo_structured");
  assert.ok(completed.summary.strengths.length > 0);
  assert.match(completed.summary.strengths.join(" "), /local|remplacer/i);
  assert.match(viewSource, /aucune analyse pédagogique réelle/);
});

test("intègre la progression d’une consolidation sans effacer le bilan précédent", () => {
  const completed = createDemoStudentDashboard().activities.find(({ activityStatus }) => activityStatus === "completed");
  assert.ok(completed?.summary.consolidationProgress);
  assert.equal(completed.summary.consolidationProgress.previousLevel, "À consolider");
  assert.equal(completed.summary.consolidationProgress.currentLevel, "En progression");
  assert.equal(completed.summary.consolidationProgress.source, "teacher_assigned");
  assert.equal(completed.operations.find(({ id }) => id === "establish_facts")?.status, "mastered");
  assert.equal(completed.operations.find(({ id }) => id === "causes_and_consequences")?.status, "consolidate");
  assert.equal(completed.historicalKnowledge[0].status, "mastered");
  assert.match(viewSource, /Progression après consolidation/);
  assert.match(viewSource, /Assignée par l’enseignant/);
  assert.match(cssSource, /\.consolidation-progress\{[^}]*display:grid[^}]*border:1px solid/);
});

test("n’ajoute aucun appel IA, externe ou persistance", () => {
  const combined = [viewSource, pageSource, providerSource].join("\n");
  assert.doesNotMatch(combined, /fetch\(|openai|anthropic|generateText|streamText|chat\.completions|responses\.create|postgres|prisma/i);
});

test("interdit explicitement le fournisseur local en production", async () => {
  const previousNodeEnv = Object.getOwnPropertyDescriptor(process.env, "NODE_ENV");
  Object.defineProperty(process.env, "NODE_ENV", { configurable: true, enumerable: true, value: "production", writable: true });
  try {
    await assert.rejects(
      () => new LocalDemoStudentDashboardProvider().getForAnonymousStudent("anonymous-test-student"),
      /disabled in production/,
    );
  } finally {
    if (previousNodeEnv) Object.defineProperty(process.env, "NODE_ENV", previousNodeEnv);
    else Reflect.deleteProperty(process.env, "NODE_ENV");
  }
});

test("selectedActivityId actualise toutes les sections", () => {
  const first = createDemoStudentDashboard("demo-activity-acte-union");
  const second = createDemoStudentDashboard("demo-activity-industrialisation");
  const completed = createDemoStudentDashboard("demo-activity-completed");
  assert.equal(first.selectedActivityId, "demo-activity-acte-union");
  assert.equal(second.selectedActivityId, "demo-activity-industrialisation");
  assert.notEqual(getSelectedActivity(first).activityTitle, getSelectedActivity(second).activityTitle);
  assert.notDeepEqual(getSelectedActivity(first).operations, getSelectedActivity(second).operations);
  assert.notDeepEqual(getSelectedActivity(first).historicalKnowledge, getSelectedActivity(second).historicalKnowledge);
  assert.notDeepEqual(getSelectedActivity(first).summary, getSelectedActivity(completed).summary);
});

test("persiste uniquement l’identifiant d’activité dans l’URL", () => {
  const url = getActivityDashboardUrl("demo-activity-industrialisation");
  assert.equal(url, "/eleve/tableau-de-bord?activity=demo-activity-industrialisation#activite");
  assert.doesNotMatch(url, /title|titre|Révision|code|student/);
  assert.match(pageSource, /searchParams: Promise<\{ activity\?: string \}>/);
});

test("replie un identifiant inconnu vers l’activité par défaut", () => {
  const data = createDemoStudentDashboard("activité-inconnue");
  assert.equal(data.selectedActivityId, data.defaultActivityId);
  assert.equal(getSelectedActivity(data).id, data.defaultActivityId);
});

test("préserve les modes clair et sombre avec la palette approuvée", () => {
  assert.match(cssSource, /--light-page:#f4efe6/);
  assert.match(cssSource, /--light-surface:#fffdf8/);
  assert.match(cssSource, /--light-text:#102c45/);
  assert.match(cssSource, /\[data-theme="dark"\] \.student-dashboard/);
  assert.match(viewSource, /<ThemeToggle/);
});

test("renforce le contraste du bilan Socrato en thème clair", () => {
  assert.match(cssSource, /\[data-theme="light"\] \.summary-panel \{[^}]*background:linear-gradient\(145deg,#173b57,#254b66\); color:#fffaf2/);
  assert.match(cssSource, /\[data-theme="light"\] \.summary-item p \{ color:#f1f4f6; \}/);
  assert.match(cssSource, /\[data-theme="light"\] \.summary-recommend \{ color:#e8b8ff; \}/);
});

test("rend la page responsive, zoomable et accessible", () => {
  assert.match(cssSource, /overflow-x:hidden/);
  assert.match(cssSource, /@media \(max-width:1050px\)/);
  assert.match(cssSource, /@media \(max-width:720px\)/);
  assert.match(cssSource, /min-height:44px/);
  assert.match(cssSource, /prefers-reduced-motion:reduce/);
  assert.match(viewSource, /aria-current=/);
  assert.match(viewSource, /aria-label="Activité sélectionnée"/);
});

test("conserve une région compacte accessible pour les connaissances", () => {
  assert.match(viewSource, /<KnowledgeScrollRegion total=\{workedItems\.length\}>/);
  assert.match(cssSource, /\.results-panel \{[^}]*height:380px/);
  assert.match(cssSource, /\.knowledge-list \{[^}]*height:100%[^}]*overflow-y:auto/);
});

test("aligne les connaissances à la suite sans étirer les rangées", () => {
  assert.match(cssSource, /\.knowledge-list \{[^}]*align-content:start; grid-auto-rows:max-content;/);
});

test("détecte le débordement et la fin de la liste des connaissances", () => {
  assert.deepEqual(getKnowledgeScrollState(0, 294, 504), { hasOverflow: true, isAtEnd: false });
  assert.deepEqual(getKnowledgeScrollState(210, 294, 504), { hasOverflow: true, isAtEnd: true });
  assert.deepEqual(getKnowledgeScrollState(0, 294, 250), { hasOverflow: false, isAtEnd: true });
});

test("avance la liste sans dépasser sa fin", () => {
  assert.equal(getNextKnowledgeScrollTop(0, 294, 700), 258.72);
  assert.equal(getNextKnowledgeScrollTop(390, 294, 700), 406);
});

test("conserve un bouton de défilement utilisable au clavier", () => {
  assert.match(knowledgeScrollSource, /<button[\s\S]*?type="button"[\s\S]*?aria-label="Voir les autres connaissances"/);
  assert.match(knowledgeScrollSource, /hasOverflow && !isAtEnd/);
  assert.match(knowledgeScrollSource, /Toutes les connaissances sont affichées/);
  assert.match(knowledgeScrollSource, /prefers-reduced-motion: reduce/);
});

test("compacte réellement la zone supérieure sans transformation globale", () => {
  assert.match(cssSource, /\.welcome-panel \{[^}]*padding:6px 8px 8px/);
  assert.match(cssSource, /\.welcome-copy \{[^}]*padding:16px 6px 0/);
  assert.match(cssSource, /\.main-activity-card \{[^}]*padding:20px 26px 18px/);
  assert.match(cssSource, /\.activity-progress \{[^}]*width:110px[^}]*height:110px/);
  assert.match(cssSource, /\.main-activity-action \{[^}]*min-height:46px/);
  assert.doesNotMatch(cssSource, /transform:scale\(/);
});

test("prend en charge les titres personnalisés longs sur deux lignes", () => {
  const activity = { ...getSelectedActivity(createDemoStudentDashboard()), activityTitle: "Révision préparatoire approfondie avant la première évaluation de la séquence" };
  assert.ok(activity.activityTitle.length > 60);
  assert.match(cssSource, /\.main-activity-card > h2 \{[^}]*-webkit-line-clamp:2/);
  assert.match(viewSource, /\{activity\.activityTitle\}/);
});

test("applique un fond crème à l’avatar sombre sans modifier le mode clair", () => {
  assert.match(cssSource, /\.welcome-portrait \{[^}]*background:var\(--navy\)/);
  assert.match(cssSource, /\[data-theme="dark"\] \.welcome-portrait \{[^}]*background:#f3e6cf/);
  assert.match(viewSource, /src="\/logos\/socrato-logo-blanc\.png"[^>]*className="welcome-portrait-light"/);
  assert.match(viewSource, /src="\/logos\/socrato-logo-v2\.png"[^>]*className="welcome-portrait-dark"/);
  assert.match(cssSource, /\.welcome-portrait-dark \{[^}]*display:none/);
  assert.match(cssSource, /\[data-theme="dark"\] \.welcome-portrait-light \{[^}]*display:none/);
  assert.match(cssSource, /\[data-theme="dark"\] \.welcome-portrait-dark \{[^}]*display:block/);
  assert.doesNotMatch(cssSource, /\[data-theme="light"\] \.welcome-portrait/);
});

test("conserve les trois zones équilibrées de l’en-tête et son titre principal", () => {
  assert.match(viewSource, /className="brand-lockup"/);
  assert.match(viewSource, /className="hero-title-block"/);
  assert.match(viewSource, /<ThemeToggle \/>/);
  assert.match(viewSource, /<h1>\{DASHBOARD_LABELS\.title\}<\/h1>/);
  assert.match(cssSource, /\.dashboard-hero \{[^}]*height:130px/);
  assert.match(cssSource, /\.dashboard-body \{[^}]*padding:18px var\(--dashboard-gutter\) 26px/);
});

test("aligne toutes les sections sur un conteneur horizontal responsive", () => {
  assert.match(cssSource, /--dashboard-gutter:clamp\(16px,3\.2vw,56px\)/);
  assert.match(cssSource, /\.student-dashboard,\.student-dashboard \* \{[^}]*box-sizing:border-box/);
  assert.match(cssSource, /\.dashboard-hero-content \{[^}]*width:100%[^}]*max-width:1440px[^}]*padding:8px var\(--dashboard-gutter\)/);
  assert.match(cssSource, /\.dashboard-body \{[^}]*width:100%[^}]*max-width:1440px[^}]*padding:18px var\(--dashboard-gutter\) 26px/);
  assert.doesNotMatch(cssSource, /\.dashboard-body \{[^}]*width:min\(100% -/);
});

test("réserve la typographie de marque au mot-symbole Socrato", () => {
  assert.match(cssSource, /\.brand-name \{[^}]*font-family:var\(--font-cormorant\)/);
  for (const selector of [
    "hero-title-block h1",
    "new-activity-heading h2",
    "welcome-copy h2",
    "activity-type",
    "main-activity-card > h2",
    "summary-heading h2",
    "results-heading h2",
    "activities-panel > h2",
  ]) {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(cssSource, new RegExp(`\\.${escapedSelector} \\{[^}]*font-family:var\\(--font-geist-sans\\)`));
  }
  assert.doesNotMatch(cssSource, /\.(?:hero-title-block h1|new-activity-heading h2|welcome-copy h2|main-activity-card > h2|summary-heading h2|results-heading h2|activities-panel > h2) \{[^}]*text-transform:uppercase/);
});

test("filtre les opérations et connaissances non travaillées dans la présentation", () => {
  const operations = getSelectedActivity(createDemoStudentDashboard()).operations;
  const knowledge = getSelectedActivity(createDemoStudentDashboard()).historicalKnowledge;
  assert.equal(operations.some(({ status }) => status === "not_assessed"), true);
  assert.equal(knowledge.some(({ status }) => status === "not_assessed"), true);
  assert.equal(getWorkedOperations(operations).some(({ status }) => status === "not_assessed"), false);
  assert.equal(getWorkedHistoricalKnowledge(knowledge).some(({ status }) => status === "not_assessed"), false);
});

test("conserve visibles les trois statuts réellement travaillés", () => {
  const statuses = new Set(getWorkedOperations(getSelectedActivity(createDemoStudentDashboard()).operations).map(({ status }) => status));
  assert.deepEqual(statuses, new Set(["mastered", "consolidate", "needs_work"]));
});

test("affiche les deux états vides fixes lorsque rien n’est travaillé", () => {
  const unstarted = getSelectedActivity(createDemoStudentDashboard("demo-activity-industrialisation"));
  assert.equal(getWorkedOperations(unstarted.operations).length, 0);
  assert.equal(getWorkedHistoricalKnowledge(unstarted.historicalKnowledge).length, 0);
  assert.match(viewSource, /Tes résultats apparaîtront ici après le début de l’activité/);
  assert.match(viewSource, /Tes connaissances travaillées apparaîtront ici au fil de l’activité/);
});

test("distingue le nombre ciblé des résultats effectivement affichés", () => {
  const activity = getSelectedActivity(createDemoStudentDashboard());
  assert.equal(activity.historicalKnowledgeIds.length, 4);
  assert.equal(activity.historicalKnowledge.length, 4);
  assert.equal(getWorkedHistoricalKnowledge(activity.historicalKnowledge).length, 3);
  assert.match(viewSource, /activity\.historicalKnowledgeIds\.length/);
});

test("navigue vers la page 3 avec identifiant et contexte autorisé", () => {
  const activity = getSelectedActivity(createDemoStudentDashboard());
  assert.equal(activity.actionHref, getLearningSessionUrl(activity.id, "acte-union", "teacher-assigned"));
  assert.match(activity.actionHref, /^\/eleve\/activite\/demo-activity-acte-union\?/);
  assert.doesNotMatch(activity.actionHref, /Révision avant/);
});

test("le retour de la page 3 restaure l’activité sélectionnée", () => {
  const sessionProvider = readFileSync("lib/student-learning-session/demo-provider.ts", "utf8");
  assert.match(sessionProvider, /getDashboardUrl\(notionId, requestedMode, activityId\)/);
  assert.equal(getActivityDashboardUrl("demo-activity-acte-union"), "/eleve/tableau-de-bord?activity=demo-activity-acte-union#activite");
});

test("conserve l’identité visuelle et la hiérarchie du modèle", () => {
  assert.match(viewSource, /dashboard-hero/);
  assert.match(viewSource, /Nouvelle activité disponible/);
  assert.match(viewSource, /DASHBOARD_LABELS\.summary/);
  assert.match(viewSource, /DASHBOARD_LABELS\.operations/);
  assert.match(viewSource, /DASHBOARD_LABELS\.knowledge/);
  assert.match(viewSource, /DASHBOARD_LABELS\.activities/);
  assert.match(cssSource, /\.main-activity-card\.activity-teacher_assigned \{[^}]*border-width:3px[^}]*box-shadow:/);
});
