import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { StudentSession, StudentSessionRepository } from "../lib/student-access/session.ts";
import { loadAuthorizedStudentLearningSession } from "../lib/student-learning-session/access.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";
import { getCurrentLearningQuestion, getLearningSessionHeading, getLearningSessionProgress } from "../lib/student-learning-session/presentation.ts";
import type { StudentLearningSessionProvider } from "../lib/student-learning-session/provider.ts";
import type { StudentLearningSessionData } from "../lib/student-learning-session/types.ts";
import { getLearningSessionUrl } from "../lib/student-dashboard/selection.ts";

const viewSource = readFileSync("app/eleve/activite/[activityId]/session-view.tsx", "utf8");
const pageSource = readFileSync("app/eleve/activite/[activityId]/page.tsx", "utf8");
const cssSource = readFileSync("app/eleve/activite/[activityId]/session.css", "utf8");
const dashboardSource = readFileSync("app/eleve/tableau-de-bord/dashboard-view.tsx", "utf8");

class TestSessions implements StudentSessionRepository {
  constructor(private readonly active: boolean) {}
  async create(): Promise<StudentSession> { throw new Error("Not used."); }
  async findActiveByToken(token: string): Promise<StudentSession | null> {
    return this.active && token === "valid-session" ? {
      token, anonymousStudentId: "anonymous-test-student", credentialId: "credential-test", expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    } : null;
  }
}

class TestProvider implements StudentLearningSessionProvider {
  constructor(private readonly data: StudentLearningSessionData | null) {}
  async getForAnonymousStudent(): Promise<StudentLearningSessionData | null> { return this.data; }
}

test("redirige logiquement sans session valide", async () => {
  const provider = new TestProvider(createDemoStudentLearningSession());
  assert.equal(await loadAuthorizedStudentLearningSession(undefined, new TestSessions(true), provider, "demo-activity-acte-union"), null);
  assert.equal(await loadAuthorizedStudentLearningSession("invalid", new TestSessions(false), provider, "demo-activity-acte-union"), null);
  assert.match(pageSource, /redirect\("\/eleve"\)/);
});

test("affiche une séance avec session valide", async () => {
  const demo = createDemoStudentLearningSession();
  const data = await loadAuthorizedStudentLearningSession("valid-session", new TestSessions(true), new TestProvider(demo), "demo-activity-acte-union");
  assert.ok(data);
  assert.equal(data.source, "local_demo");
});

test("conserve le retour au tableau de bord et le contexte dans les URL", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  assert.match(data.dashboardHref, /notion=acte-union/);
  assert.equal(getLearningSessionUrl(data.activityId, data.notionId, "teacher-assigned"), "/eleve/activite/demo-activity-acte-union?notion=acte-union&mode=teacher-assigned");
  assert.match(viewSource, /Retour au tableau de bord/);
});

test("présente la notion, la période, le numéro et la progression", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  assert.equal(data.notionTitle, "Acte d’union");
  assert.deepEqual(data.historicalPeriod, { startYear: 1840, endYear: 1896 });
  assert.deepEqual(getLearningSessionProgress(data), { current: 1, total: 1, percent: 100 });
});

test("une activité enseignante affiche son titre personnalisé et son contexte", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  assert.equal(data.activityTitle, "Révision locale de démonstration");
  assert.equal(data.origin, "teacher_assigned");
  assert.deepEqual(getLearningSessionHeading(data), {
    primaryTitle: "Révision locale de démonstration",
    contextualNotion: "Acte d’union",
  });
});

test("une révision choisie affiche la notion une seule fois comme titre", () => {
  const data = createDemoStudentLearningSession("demo-activity-acte-union", "acte-union", "notion-review"); assert.ok(data);
  assert.equal(data.origin, "student_selected");
  assert.deepEqual(getLearningSessionHeading(data), {
    primaryTitle: "Acte d’union",
    contextualNotion: null,
  });
});

test("le composant reçoit le titre du contrat sans titre d’activité codé en dur", () => {
  assert.match(viewSource, /heading\.primaryTitle/);
  assert.match(viewSource, /heading\.contextualNotion/);
  assert.doesNotMatch(viewSource, /Révision locale de démonstration/);
  assert.doesNotMatch(viewSource, /searchParams[\s\S]*activityTitle/);
});

test("l’URL de séance ne transporte aucun titre libre", () => {
  const url = getLearningSessionUrl("demo-activity-acte-union", "acte-union", "teacher-assigned");
  assert.doesNotMatch(url, /title|titre|Révision/);
  assert.match(url, /^\/eleve\/activite\/demo-activity-acte-union\?/);
});

test("affiche les opérations intellectuelles de la question", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  assert.deepEqual(getCurrentLearningQuestion(data)?.intellectualOperations, [{ id: "establish_facts", label: "Établir des faits" }]);
});

test("utilise officiellement le cas sans document", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  assert.deepEqual(getCurrentLearningQuestion(data)?.documents, []);
  assert.match(viewSource, /Cette question ne nécessite aucun document historique/);
});

test("présente les contrôles de réponse et désactive la dictée", () => {
  assert.match(viewSource, /placeholder="Écris ta réponse ici…"/);
  assert.doesNotMatch(viewSource, /<label[^>]*>Écris ta réponse ici…<\/label>/);
  assert.match(viewSource, /aria-label="Réponse de l’élève"/);
  assert.match(viewSource, /Envoyer ma réponse/);
  assert.match(viewSource, /className="voice-button" disabled/);
  assert.match(viewSource, /<svg className="microphone-icon"/);
  assert.doesNotMatch(viewSource, /♩/);
  assert.match(viewSource, /Disponible bientôt/);
});

test("applique la lisibilité pédagogique à tous les messages", () => {
  assert.match(cssSource, /\.message p \{[^}]*font-size:18px[^}]*line-height:1\.42/);
  assert.match(cssSource, /\.question-card h2 \{[^}]*font-family:var\(--font-geist-sans\)[^}]*font-weight:650[^}]*line-height:1\.28/);
  assert.match(cssSource, /@media \(max-width:620px\)[^{]*\{[^}]*\.session-header/);
  assert.match(cssSource, /\.message p \{ font-size:17px; line-height:1\.42; \}/);
  assert.match(cssSource, /textarea::placeholder/);
});

test("place l’indice dans la rangée supérieure sans positionnement absolu", () => {
  assert.match(viewSource, /className="question-meta"[\s\S]*className="hint-button"[\s\S]*<h2 id="question-title"/);
  assert.match(cssSource, /\.hint-button \{[^}]*display:inline-flex[^}]*margin-left:auto/);
  assert.doesNotMatch(cssSource, /\.hint-button \{[^}]*position:absolute/);
  assert.match(cssSource, /\.question-meta \{[^}]*flex-wrap:wrap/);
  assert.match(cssSource, /\.hint-button \{[^}]*min-height:44px/);
  assert.match(cssSource, /\.hint-button \{ flex-basis:100%/);
  assert.match(viewSource, /<svg className="hint-icon"[^>]*aria-hidden="true"/);
});

test("utilise la typographie documentaire sans empattement sans surtitre", () => {
  assert.doesNotMatch(viewSource, /RESSOURCES DE LA QUESTION/);
  assert.match(viewSource, />Documents historiques<\/h2>/);
  assert.match(cssSource, /\.documents-pane \{[^}]*font-family:var\(--font-geist-sans\)/);
  assert.match(cssSource, /\.documents-heading h2 \{[^}]*font-family:var\(--font-geist-sans\)/);
  assert.doesNotMatch(cssSource, /\.documents-heading h2 \{[^}]*font-cormorant/);
});

test("conserve le renforcement approuvé de la carte en mode clair", () => {
  assert.match(cssSource, /\[data-theme="light"\] \.question-card \{[^}]*border:2px solid #c2954d[^}]*background:linear-gradient[^}]*box-shadow:/);
  assert.match(cssSource, /\[data-theme="light"\] \.question-card::before/);
  assert.match(cssSource, /@media \(max-width:620px\)/);
  assert.match(cssSource, /\[data-theme="light"\] \.question-card,\[data-theme="dark"\] \.question-card \{ margin:8px 8px 0; \}/);
});

test("intègre le contour sombre sans modifier sa palette", () => {
  assert.match(cssSource, /\[data-theme="dark"\] \.question-card \{[^}]*margin:10px 10px 0[^}]*border:2px solid #a98750[^}]*border-radius:14px[^}]*box-shadow:/);
  assert.match(cssSource, /\[data-theme="dark"\] \.question-card::before/);
  const darkCardRule = cssSource.match(/\[data-theme="dark"\] \.question-card \{([^}]*)\}/)?.[1] ?? "";
  assert.doesNotMatch(darkCardRule, /background|color|padding|width|height/);
  assert.match(cssSource, /\[data-theme="light"\] \.question-card,\[data-theme="dark"\] \.question-card \{ margin:8px 8px 0; \}/);
});

test("ajoute localement une réponse sans prétendre l’évaluer", () => {
  assert.match(viewSource, /setMessages/);
  assert.match(viewSource, /Réponse ajoutée localement/);
  assert.match(viewSource, /n’a pas été évaluée/);
  assert.match(viewSource, /sera perdue au rechargement/);
});

test("affiche un indice local borné", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  assert.match(getCurrentLearningQuestion(data)?.localHint ?? "", /^Indice local/);
  assert.match(viewSource, /setHintVisible\(true\)/);
});

test("n’ajoute aucun appel IA ou externe", () => {
  const combined = [viewSource, pageSource, readFileSync("lib/student-learning-session/demo-provider.ts", "utf8")].join("\n");
  assert.doesNotMatch(combined, /fetch\(|openai|anthropic|generateText|streamText|chat\.completions|responses\.create/i);
});

test("ne fabrique aucun document ni fait historique", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  const question = getCurrentLearningQuestion(data); assert.ok(question);
  assert.equal(question.documents.length, 0);
  assert.equal(question.historicalKnowledgeIds.length, 0);
  assert.match(data.localDemoNotice, /Démonstration locale à valider/);
});

test("relie les cartes d’activité du tableau de bord à la séance", () => {
  assert.match(dashboardSource, /getLearningSessionUrl\(practice\.id/);
  assert.match(readFileSync("lib/student-dashboard/demo-provider.ts", "utf8"), /getLearningSessionUrl\("demo-activity-acte-union"/);
});

test("préserve les thèmes clair et sombre et les contrats accessibles", () => {
  assert.match(viewSource, /<ThemeToggle/);
  assert.match(cssSource, /\[data-theme="light"\] \.learning-session/);
  assert.match(cssSource, /prefers-reduced-motion/);
  assert.match(viewSource, /aria-live="polite"/);
  assert.match(viewSource, /aria-pressed/);
});
