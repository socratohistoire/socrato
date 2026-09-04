import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { StudentSession, StudentSessionRepository } from "../lib/student-access/session.ts";
import { loadAuthorizedStudentLearningSession } from "../lib/student-learning-session/access.ts";
import { createDemoStudentLearningSession } from "../lib/student-learning-session/demo-provider.ts";
import { getCurrentLearningQuestion, getInitialQuestionDocument, getLearningSessionHeading, getLearningSessionProgress, getQuestionDocuments } from "../lib/student-learning-session/presentation.ts";
import type { StudentLearningSessionProvider } from "../lib/student-learning-session/provider.ts";
import type { StudentLearningSessionData } from "../lib/student-learning-session/types.ts";
import { getConsolidationSessionUrl, getConsolidationStrategyAdvice, getLearningSessionUrl } from "../lib/student-dashboard/selection.ts";

const viewSource = readFileSync("app/eleve/activite/[activityId]/session-view.tsx", "utf8");
const pageSource = readFileSync("app/eleve/activite/[activityId]/page.tsx", "utf8");
const teacherPreviewPageSource = readFileSync("app/teacher/activities/new/student-preview/page.tsx", "utf8");

test("utilise l’analyse IA dans tous les aperçus du créateur, y compris après publication", () => {
  assert.match(teacherPreviewPageSource, /<StudentLearningSessionView[^>]*teacherApiTest(?:\s|>)/);
  assert.doesNotMatch(teacherPreviewPageSource, /teacherApiTest=\{published !== "1"\}/);
  assert.match(teacherPreviewPageSource, /publishedActivityId/);
  assert.match(teacherPreviewPageSource, /activityId \|\| publishedActivityId/);
});

test("réaffiche le bilan lorsqu’une activité terminée est rouverte", () => {
  assert.match(viewSource, /useState\(\(\) => Boolean\(initialEngineState\.summary\)\)/);
  assert.match(viewSource, /engineState\.summary && finalFeedbackDelivered/);
});

test("la consolidation reprend en priorité une difficulté réellement rencontrée", () => {
  assert.match(pageSource, /difficultyQuestionIds/);
  assert.match(pageSource, /pedagogicalOutcome !== "satisfactory" \|\| attemptNumber > 1 \|\| hintLevel > 0 \|\| instructionOmissionObserved/);
  assert.match(pageSource, /candidates\.find\(\(\{ id \}\) => difficultyQuestionIds\.has\(id\)\)/);
  assert.doesNotMatch(pageSource, /find\(\(\{ id \}\) => !unsuccessfulIds\.has\(id\)\)/);
});

test("fait concorder la stratégie avec l’opération et la connaissance ciblées", () => {
  assert.match(pageSource, /matchesRequestedTarget/);
  assert.match(pageSource, /runtime\.find\(\(item\) => matchesRequestedTarget\(item\) && matchesStrategy\(item\)\)/);
});

test("la consolidation enseigne explicitement l’opération dans une seule activité ciblée", () => {
  assert.match(pageSource, /consolidationStrategyAdvice:/);
  assert.match(pageSource, /questions: \[\{ \.\.\.alternate, number: 1 \}\]/);
  assert.doesNotMatch(pageSource, /const transfer = candidates\.find|Nouvelle tentative avec moins d’aide/);
  assert.match(viewSource, /function consolidationOpeningMessage/);
  assert.match(viewSource, /Nous allons consolider l’opération/);
  assert.match(viewSource, /Voici le processus à appliquer/);
  assert.match(viewSource, /successful: Boolean\(result && result\.status !== "to_work_on"\)/);
  assert.doesNotMatch(viewSource, /feuille|cahier/iu);
  assert.match(viewSource, /author: "socrato" as const/);
  assert.doesNotMatch(viewSource, /<aside className="consolidation-strategy-reminder">/);
});

test("garde le conseil de consolidation lisible en thème clair", () => {
  assert.match(cssSource, /\[data-theme="light"\] \.consolidation-strategy-reminder\{[^}]*background:#f1e2c2/);
  assert.match(cssSource, /\[data-theme="light"\] \.consolidation-strategy-reminder p\{color:#102c45\}/);
});

test("conserve la question exacte pour personnaliser les points forts objectifs", () => {
  assert.match(viewSource, /questionPrompt: question\.prompt/);
});

test("transmet seulement Comment progresser à la consolidation", () => {
  const entry = "Croiser plusieurs documents\nQuestion\nÀ la question 4.\nÀ vérifier\nLe deuxième document manque.\nComment progresser\nNote l’idée utile de chaque document.";
  const advice = getConsolidationStrategyAdvice(entry);
  assert.equal(advice, "Note l’idée utile de chaque document.");
  const url = getConsolidationSessionUrl("activity-1", "acte-union", undefined, undefined, "cross-documents", advice);
  assert.match(url, /Note\+l%E2%80%99id%C3%A9e\+utile/);
  assert.doesNotMatch(url, /%C3%80\+v%C3%A9rifier|Le\+deuxi%C3%A8me\+document/);
});
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
  async revokeByToken(): Promise<void> {}
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
  assert.match(data.dashboardHref, /activity=demo-activity-acte-union/);
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
  assert.equal(data.activityTitle, "Révision avant l’évaluation 1");
  assert.equal(data.origin, "teacher_assigned");
  assert.deepEqual(getLearningSessionHeading(data), {
    primaryTitle: "Révision avant l’évaluation 1",
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
  const question = getCurrentLearningQuestion(data); assert.ok(question);
  assert.deepEqual(question.intellectualOperations.map(({ label }) => label), ["Établir des liens de causalité"]);
  assert.equal(question.primaryOperationId, "causal_connections");
  assert.equal(question.intellectualOperations.filter(({ id }) => id === question.primaryOperationId).length, 1);
});

test("utilise officiellement le cas sans document", () => {
  const data = createDemoStudentLearningSession("demo-activity-industrialisation", "industrialisation", "notion-review"); assert.ok(data);
  assert.deepEqual(getCurrentLearningQuestion(data)?.documentRelations, []);
  assert.deepEqual(getQuestionDocuments(data), []);
  assert.match(viewSource, /Cette question ne nécessite aucun document historique/);
});

test("présente les contrôles de réponse et la simulation locale de dictée", () => {
  assert.match(viewSource, /placeholder="Écris ta réponse ici…"/);
  assert.doesNotMatch(viewSource, /<label[^>]*>Écris ta réponse ici…<\/label>/);
  assert.match(viewSource, /aria-label="Réponse de l’élève"/);
  assert.match(viewSource, /Envoyer ma réponse/);
  assert.match(viewSource, /className="composer-icon-button voice-button" onClick=\{handleVoicePrimaryAction\} disabled=\{voiceBusy \|\| voiceUnavailable\}/);
  assert.match(viewSource, /<svg className="microphone-icon"/);
  assert.doesNotMatch(viewSource, /♩/);
  assert.match(viewSource, /title=\{voicePrimaryLabel\}/);
});

test("applique la lisibilité pédagogique à tous les messages", () => {
  assert.match(cssSource, /\.message p \{[^}]*font-size:16px[^}]*font-weight:400[^}]*line-height:1\.5/);
  assert.match(cssSource, /\.message strong \{[^}]*font-size:16px[^}]*font-weight:700[^}]*line-height:1\.3/);
  assert.match(cssSource, /\.question-card h3 \{[^}]*margin:0[^}]*font-family:var\(--font-geist-sans\)[^}]*font-size:clamp\(22px,1\.5vw,23px\)[^}]*font-weight:700[^}]*line-height:1\.32/);
  assert.match(cssSource, /@media \(max-width:620px\) \{ \.question-card \{ padding:12px 16px; \}\.question-card h3 \{ font-size:clamp\(20px,5\.2vw,22px\); line-height:1\.32; \} \}/);
  assert.match(cssSource, /@media \(max-width:620px\)[^{]*\{[^}]*\.session-header/);
  assert.match(cssSource, /\.message p \{ font-size:16px; line-height:1\.5; \}/);
  assert.match(cssSource, /textarea::placeholder/);
});

test("masque les compteurs techniques tout en conservant leur état dans le moteur", () => {
  assert.doesNotMatch(viewSource, /engine-status|Tentative \$\{|indice \$\{|Question terminée · bilan local disponible/);
  const engineTypes = readFileSync("lib/pedagogical-session-engine/types.ts", "utf8");
  assert.match(engineTypes, /attemptNumber: number/);
  assert.match(engineTypes, /hintLevel: HintLevel/);
  assert.match(viewSource, /maximumHelpReceived \? "Aide maximale reçue" : "Obtenir un indice"/);
});

test("rend la zone de réponse compacte dans un encadré intégré", () => {
  assert.match(cssSource, /\.response-composer textarea \{[^}]*height:48px[^}]*min-height:48px[^}]*max-height:112px[^}]*overflow-y:auto[^}]*overflow-x:hidden[^}]*resize:none[^}]*padding:12px 4px[^}]*font-size:16px[^}]*line-height:1\.4/);
  assert.match(cssSource, /\.response-composer-shell \{[^}]*grid-template-columns:minmax\(0,1fr\) auto[^}]*border-radius:16px/);
  assert.match(cssSource, /\.response-composer-shell:focus-within \{[^}]*border-color:var\(--gold\)[^}]*box-shadow:/);
  assert.match(cssSource, /\.learning-session \.response-composer textarea:focus,\.learning-session \.response-composer textarea:focus-visible \{ border:0; outline:0; box-shadow:none; \}/);
});

test("la conversation grandit naturellement puis fait défiler uniquement les messages", () => {
  assert.match(cssSource, /@media \(min-width:1120px\) and \(min-height:700px\)[\s\S]*\.conversation \{ min-height:0; flex:1; overflow:hidden; \}/);
  assert.match(cssSource, /@media \(min-width:1120px\) and \(min-height:700px\)[\s\S]*\.message-list \{ min-height:0; max-height:none; flex:1; \}/);
  assert.match(cssSource, /\.message-list \{[^}]*overflow-y:auto[^}]*overflow-x:hidden/);
  assert.match(cssSource, /\.response-composer \{[^}]*flex:0 0 auto/);
  assert.match(viewSource, /<section className="conversation"[\s\S]*<div[^>]*className="message-list"[\s\S]*<form className="response-composer"/);
  assert.match(cssSource, /\.question-card \{[^}]*padding:12px 20px/);
  assert.doesNotMatch(cssSource, /\.question-card \{[^}]*min-height/);
  assert.match(cssSource, /@media \(min-width:1120px\) and \(min-height:700px\)[\s\S]*\.conversation \{ min-height:0; flex:1/);
});

test("égalise les colonnes dans un espace de travail piloté par le viewport", () => {
  assert.match(cssSource, /\.learning-session \{[^}]*min-height:100vh[^}]*display:block/);
  assert.match(cssSource, /@media \(min-width:1120px\) and \(min-height:700px\) \{[\s\S]*\.session-layout \{ height:100dvh; min-height:100dvh; grid-template-columns:minmax\(0,1\.02fr\) minmax\(0,\.98fr\); grid-template-rows:auto minmax\(0,1fr\); align-items:stretch/);
  assert.doesNotMatch(cssSource, /min-height:calc\(100vh -/);
  assert.match(cssSource, /@media \(min-width:1120px\) and \(min-height:700px\)[\s\S]*\.question-pane,\.documents-pane \{ height:100%; min-height:0; display:flex; flex-direction:column; \}/);
  assert.match(cssSource, /\.question-module \{[^}]*display:flex[^}]*flex-direction:column/);
  assert.match(cssSource, /@media \(min-width:1120px\) and \(min-height:700px\)[\s\S]*\.document-system-card \{ height:100%; min-height:0; flex:1; display:flex; flex-direction:column; overflow:hidden; \}/);
  assert.match(cssSource, /\.document-content-group-textual \{ min-height:0; flex:0 1 auto; overflow-y:auto; overflow-x:hidden; \}/);
  assert.match(cssSource, /\.document-content-group-visual \{ min-height:0; flex:1 1 auto; overflow:hidden; \}/);
  assert.match(cssSource, /\.document-flex-space \{ min-height:0; display:block; flex:1 1 auto; \}/);
  assert.match(cssSource, /\.document-actions,\.document-separator,\.document-navigation \{ flex:0 0 auto; \}/);
});

test("conserve un repli vertical pour les très petits écrans", () => {
  assert.match(cssSource, /@media \(max-width:1119px\) \{[^}]*\.learning-session \{ height:auto; min-height:0; display:block; \}/);
  assert.match(cssSource, /@media \(max-width:1119px\)[\s\S]*\.session-layout \{ height:auto; min-height:0; grid-template-columns:1fr; grid-template-rows:none; align-items:start;[^}]*overflow:visible/);
  assert.match(cssSource, /@media \(max-width:1119px\)[\s\S]*\.message-list \{ max-height:clamp\(190px,32vh,320px\); flex:none; \}/);
  assert.match(cssSource, /@media \(max-width:1119px\)[\s\S]*\.document-system-card \{ height:auto; display:block; overflow:visible; \}/);
});

test("intègre l’indice à droite de la dernière ligne de la question", () => {
  assert.match(viewSource, /<h3 id="question-title">\{question\.prompt\}\{!isMultipleChoice \? <span className="question-inline-hint">[\s\S]*className="hint-button hint-button-compact"/);
  assert.match(viewSource, /<div className="multiple-choice-actions">[\s\S]*Obtenir un indice[\s\S]*Vérifier ma réponse/);
  assert.doesNotMatch(viewSource, /<p>\{question\.instruction\}<\/p>/);
  assert.match(cssSource, /\.question-support-row \{[^}]*display:flex[^}]*justify-content:flex-end/);
  assert.match(cssSource, /\.question-card-heading-row \{[^}]*display:block/);
  assert.match(cssSource, /\.question-inline-hint \{[^}]*float:right[^}]*margin:4px 0 0 14px/);
  assert.match(cssSource, /\.hint-button\.hint-button-compact \{[^}]*min-height:30px[^}]*font-size:9px/);
  assert.match(cssSource, /\.hint-button \{[^}]*display:inline-flex[^}]*margin-left:auto/);
  assert.doesNotMatch(cssSource, /\.hint-button \{[^}]*position:absolute/);
  assert.match(cssSource, /\.question-card-actions \{[^}]*display:flex[^}]*justify-content:flex-end/);
  assert.match(cssSource, /\.hint-button \{[^}]*min-height:44px/);
  assert.match(viewSource, /<svg className="hint-icon"[^>]*aria-hidden="true"/);
});

test("conserve la question à gauche et compacte la ligne du temps dans le volet documentaire", () => {
  assert.doesNotMatch(viewSource, /session-layout--timeline-development|conversation--timeline-dock|Afficher la conversation/);
  assert.match(viewSource, /const useStackedDocuments = questionDocuments\.length > 0/);
  assert.match(viewSource, /<DocumentContent document=\{document\} compact onExpand=\{\(\) => expandStackedDocument\(document\.id\)\} \/>/);
  assert.match(viewSource, /<DocumentContent document=\{selected\} expanded \/>/);
});

test("place les indices ouverts dans la conversation avec Socrato", () => {
  assert.match(viewSource, /const conversationFeedback = transition\.hint[\s\S]*`\$\{feedback\.studentFacingText\}\\n\\nIndice\\n\$\{transition\.hint\.text\}`/);
  assert.match(viewSource, /content: `Voici un indice : \$\{hint\.text\}`/);
  assert.match(viewSource, /function ConversationMessageContent/);
  assert.match(viewSource, /content\.split\(\/\\n\{2,\}\//);
  assert.match(cssSource, /\.message-content\{display:grid;gap:10px\}/);
});

test("affiche uniquement l’opération principale explicitement définie près de QUESTION 1", () => {
  assert.match(viewSource, /find\(\(\{ id \}\) => id === question\.primaryOperationId\)/);
  assert.match(viewSource, /<h2 id="question-section-title" className="column-title question-number">Question \{question\.number\}<\/h2>\s*\{primaryOperation \? <span className="operation-chip">\{primaryOperation\.label\}<\/span> : null\}/);
  assert.doesNotMatch(viewSource, /question\.intellectualOperations\.map/);
  assert.match(cssSource, /\.operation-chip \{[^}]*min-height:30px[^}]*padding:4px 12px[^}]*font-size:clamp\(\.9375rem,1vw,1rem\)[^}]*font-weight:700[^}]*line-height:1\.2[^}]*white-space:nowrap/);
  assert.match(cssSource, /@media \(max-width:620px\)[\s\S]*\.operation-chip \{ min-height:28px; padding-inline:10px; font-size:\.875rem; white-space:normal; \}/);
});

test("place les deux en-têtes hors des cartes dans une grille alignée", () => {
  assert.match(viewSource, /<div className=\{`session-layout\$\{isInteractiveTimeline \|\| isInteractiveAssociation \|\| isInteractiveCausalChain \? " session-layout--timeline" : ""\}[\s\S]*session-layout--choice-no-documents/);
  assert.match(viewSource, /<div className="question-heading">[\s\S]*?<section className="question-pane" aria-labelledby="question-section-title">\s*<div className="question-module">\s*<div className=\{`question-card\$\{isShortAnswerWithoutDocuments/);
  assert.match(viewSource, /<div className="documents-heading">[\s\S]*?<h2 id="documents-title"[\s\S]*?<DocumentsPane/);
  assert.doesNotMatch(viewSource, /className="session-progress"/);
  assert.match(viewSource, /<aside className="documents-pane" aria-labelledby="documents-title">\s*<div className="documents-module">/);
  assert.match(viewSource, /<div className=\{`question-card\$\{isShortAnswerWithoutDocuments[\s\S]*<div className="question-card-heading-row">[\s\S]*<h3 id="question-title">\{question\.prompt\}\{!isMultipleChoice \? <span className="question-inline-hint">/);
  assert.match(viewSource, /className="question-inline-hint">[\s\S]*className="hint-button hint-button-compact"/);
  assert.match(cssSource, /@media \(min-width:1120px\) and \(min-height:700px\)[\s\S]*\.session-layout \{[^}]*grid-template-rows:auto minmax\(0,1fr\)/);
  assert.match(cssSource, /\.question-heading \{[^}]*position:sticky[^}]*top:0[^}]*grid-column:1[^}]*grid-row:1/);
  assert.match(cssSource, /\.documents-heading \{[^}]*position:sticky[^}]*top:0[^}]*grid-column:2[^}]*grid-row:1/);
  assert.match(cssSource, /\.question-heading \{[^}]*background:transparent/);
  assert.match(cssSource, /\.documents-heading \{[^}]*background:transparent/);
  assert.match(cssSource, /@media \(max-width:1119px\)[^{]*\{[\s\S]*\.question-pane,\.documents-pane \{ height:auto; display:block; grid-row:auto; \}/);
});

test("réserve la mise en page sans défilement aux choix multiples", () => {
  assert.match(viewSource, /questionDocuments\.length === 0 && isMultipleChoice \? " session-layout--choice-no-documents"/);
  assert.doesNotMatch(viewSource, /isMultipleChoice \|\| question\.type === "question_without_documents"/);
  assert.match(cssSource, /\.session-layout--short-answer-no-documents \.conversation\{[^}]*flex:1 1 auto!important[^}]*overflow:hidden!important/);
  assert.match(cssSource, /\.session-layout--short-answer-no-documents \.message-list\{[^}]*max-height:none!important[^}]*flex:1 1 auto!important[^}]*overflow-anchor:none/);
  assert.match(cssSource, /\.message-list \{[^}]*overflow-y:auto/);
});

test("utilise la typographie documentaire sans empattement sans surtitre", () => {
  assert.doesNotMatch(viewSource, /RESSOURCES DE LA QUESTION/);
  assert.match(viewSource, />Documents historiques<\/h2>/);
  assert.match(cssSource, /\.documents-pane \{[^}]*font-family:var\(--font-geist-sans\)/);
  assert.match(cssSource, /\.column-title \{[^}]*font-family:var\(--font-geist-sans\)/);
  assert.doesNotMatch(cssSource, /\.column-title \{[^}]*font-cormorant/);
});

test("conserve une surface de question légère en mode clair", () => {
  assert.match(cssSource, /\[data-theme="light"\] \.question-card \{[^}]*border-width:1\.5px[^}]*border-color:rgba\(177,121,40,\.72\)[^}]*background:linear-gradient[^}]*box-shadow:0 0 0 1px rgba\(203,151,71,\.1\),0 0 14px rgba\(170,116,39,\.14\),0 8px 22px rgba\(55,39,22,\.14\)/);
  assert.doesNotMatch(cssSource, /\.question-card::before/);
  assert.match(cssSource, /@media \(max-width:620px\)/);
  assert.match(cssSource, /\.question-card \{[^}]*border-radius:12px/);
});

test("encadre uniquement la conversation avec la palette adaptée au thème", () => {
  assert.match(cssSource, /\.conversation \{[^}]*border:1px solid[^}]*border-radius:16px/);
  assert.match(cssSource, /\[data-theme="dark"\] \.conversation \{[^}]*border-color:#a98750[^}]*background:#0c2235/);
  assert.match(cssSource, /\[data-theme="light"\] \.conversation \{[^}]*border-color:rgba\(53,78,98,\.25\)/);
  assert.match(cssSource, /\[data-theme="dark"\] \.question-card \{[^}]*border-width:1\.5px[^}]*border-color:rgba\(218,171,91,\.82\)[^}]*background:linear-gradient\(145deg,#fffaf0,#eadcc5\)[^}]*color:#102c45[^}]*box-shadow:0 0 0 1px rgba\(255,221,158,\.12\),0 0 18px rgba\(211,155,62,\.22\),0 10px 28px rgba\(0,15,29,\.24\)/);
  assert.doesNotMatch(cssSource, /\.question-card \{[^}]*animation:/);
});

test("retire les grands cadres extérieurs et partage le style des titres", () => {
  assert.match(viewSource, /className="column-title question-number"/);
  assert.match(viewSource, /className="column-title">Documents historiques<\/h2>/);
  assert.match(cssSource, /\.column-title \{[^}]*font-size:clamp\(1\.25rem,1\.6vw,1\.6rem\)[^}]*font-weight:700[^}]*line-height:1\.15/);
  assert.match(cssSource, /\.question-number \{[^}]*padding:0[^}]*border:0[^}]*border-radius:0[^}]*background:transparent[^}]*box-shadow:none/);
  const moduleRule = cssSource.match(/\.question-module, \.documents-module \{([^}]*)\}/)?.[1] ?? "";
  assert.doesNotMatch(moduleRule, /border|border-radius|background|box-shadow/);
  assert.match(cssSource, /\.documents-module \{[^}]*display:flex[^}]*flex-direction:column/);
  assert.match(cssSource, /\[data-theme="light"\] \.operation-chip \{[^}]*background:#ead8b5[^}]*color:#102c45/);
  assert.match(cssSource, /\[data-theme="dark"\] \.operation-chip \{[^}]*border-color:#d3b176[^}]*background:#17344b[^}]*color:#fff5df/);
});

test("transmet la réponse au moteur sans afficher d’avertissement technique local", () => {
  assert.match(viewSource, /setMessages/);
  assert.match(viewSource, /withResponseAnalysisTimeout\(submitStudentResponse\(engineDefinition, engineState, content, analyzer\)\)/);
  assert.doesNotMatch(viewSource, /LOCAL_ANALYZER_NOTICE|session-demo-notice/);
  assert.doesNotMatch(viewSource, /Démonstration locale : ta réponse n’est pas réellement évaluée|local-analysis-notice|setAnalysisNotice/);
  assert.doesNotMatch(readFileSync("lib/pedagogical-session-engine/feedback.ts", "utf8"), /technicalNotice:/);
  assert.doesNotMatch(viewSource, /author: "socrato"[\s\S]{0,180}technicalNotice/);
});

test("transmet le texte et la consigne au moteur du bilan", () => {
  const definitionSource = readFileSync("lib/pedagogical-session-engine/demo-definition.ts", "utf8");
  assert.match(definitionSource, /questionPrompt: question\.prompt/);
  assert.match(definitionSource, /instruction: question\.instruction/);
});

test("ne répète pas automatiquement un appel d’analyse externe en échec", () => {
  const actionSource = readFileSync("app/eleve/activite/analysis-actions.ts", "utf8");
  assert.doesNotMatch(actionSource, /catch \{[\s\S]*analyzer\.analyze\(response, definition\)/);
  assert.match(actionSource, /const analysis = validateStructuredAnalysis/);
});

test("envoie au clavier avec Entrée sans dupliquer la logique du formulaire", () => {
  const keyboardHandler = viewSource.match(/function handleResponseKeyDown[\s\S]*?\n  \}/)?.[0] ?? "";
  const sharedSender = viewSource.match(/async function sendLocalResponse[\s\S]*?\n  \}/)?.[0] ?? "";
  assert.match(keyboardHandler, /event\.key !== "Enter" \|\| event\.shiftKey/);
  assert.match(keyboardHandler, /event\.nativeEvent\.isComposing/);
  assert.match(keyboardHandler, /event\.keyCode === 229/);
  assert.match(keyboardHandler, /event\.preventDefault\(\)/);
  assert.match(keyboardHandler, /void sendLocalResponse\(\)/);
  assert.match(viewSource, /function submitLocalResponse[\s\S]*void sendLocalResponse\(\)/);
  assert.equal(viewSource.match(/submitStudentResponse\(engineDefinition, engineState, content, analyzer\)/g)?.length, 1);
  assert.match(sharedSender, /const content = response\.trim\(\)/);
  assert.match(sharedSender, /!content \|\| submitting \|\| submissionLockRef\.current/);
  assert.match(sharedSender, /engineState\.status === "completed"/);
  assert.match(sharedSender, /activeAttemptLimit !== null && activeQuestionState\.attemptNumber >= activeAttemptLimit/);
});

test("limite aussi les choix multiples à trois essais", () => {
  assert.match(viewSource, /const nextAttempt = activeQuestionState\.attemptNumber \+ 1/);
  assert.match(viewSource, /const exhausted = !correct && nextAttempt >= MAX_PEDAGOGICAL_ATTEMPTS/);
  assert.match(viewSource, /await completeObjectiveQuestion\(false, nextAttempt\)/);
  assert.match(viewSource, /recordObjectiveAttempt\(nextAttempt\)/);
  assert.match(viewSource, /Tu as fait trois essais sérieux/);
});

test("réactive la réponse si l’analyse Socrato tarde trop longtemps", () => {
  assert.match(viewSource, /const RESPONSE_ANALYSIS_TIMEOUT_MS = 45_000/);
  assert.match(viewSource, /Promise\.race\(\[operation, timeout\]\)/);
  assert.match(viewSource, /Socrato met trop de temps à répondre\. Ta réponse a été conservée; tu peux réessayer\./);
  assert.match(viewSource, /catch \(error\)[\s\S]*setResponse\(content\)[\s\S]*finally \{\s*submissionLockRef\.current = false;\s*setSubmitting\(false\)/);
  assert.match(viewSource, /transition\.feedback\?\.technicalNotice[\s\S]*filter\(\(\{ id \}\) => id !== optimisticMessageId\)[\s\S]*setResponse\(content\)/);
});

test("protège la composition, le double envoi et restaure le focus du champ", () => {
  assert.match(viewSource, /const submissionLockRef = useRef\(false\)/);
  assert.match(viewSource, /submissionLockRef\.current = true/);
  assert.match(viewSource, /finally \{\s*submissionLockRef\.current = false;\s*setSubmitting\(false\)/);
  assert.match(viewSource, /responseInputRef\.current\?\.focus\(\)/);
  assert.match(viewSource, /<textarea ref=\{responseInputRef\}[\s\S]*?onKeyDown=\{handleResponseKeyDown\}/);
  assert.match(viewSource, /id="student-response" aria-label="Réponse de l’élève"/);
  assert.doesNotMatch(viewSource, /Entrée pour envoyer · Maj \+ Entrée pour aller à la ligne|student-response-help|response-keyboard-help/);
  assert.doesNotMatch(cssSource, /response-keyboard-help|local-analysis-notice/);
});

test("fait défiler uniquement la conversation vers chaque nouveau message", () => {
  assert.match(viewSource, /const messagesRegionRef = useRef<HTMLDivElement>\(null\)/);
  assert.match(viewSource, /const newestMessageRef = useRef<HTMLElement>\(null\)/);
  assert.match(viewSource, /useEffect\(\(\) => \{[\s\S]*messages\.length <= renderedMessageCountRef\.current[\s\S]*revealNewestConversationMessage\(region, newestMessage\)[\s\S]*\}, \[messages\]\)/);
  assert.match(viewSource, /ref=\{messagesRegionRef\} className="message-list"/);
  assert.match(viewSource, /ref=\{index === messages\.length - 1 \? newestMessageRef : undefined\}/);
  const scrollHelper = viewSource.match(/function revealNewestConversationMessage[\s\S]*?\n\}/)?.[0] ?? "";
  assert.match(scrollHelper, /region\.scrollTo/);
  assert.match(scrollHelper, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(scrollHelper, /window\.scrollTo|scrollIntoView/);
  assert.match(cssSource, /\.message-list \{[^}]*overflow-y:auto[^}]*scroll-padding-block:16px[^}]*padding:16px 5px/);
  assert.match(cssSource, /\.message \{[^}]*scroll-margin-block:16px/);
});

test("conserve le locuteur avec sa bulle sans avertissement visible dans la conversation", () => {
  assert.match(viewSource, /<article[^>]*className=\{`message message-\$\{message\.author\}`\}>[\s\S]*<strong>\{message\.author === "student" \? "Toi" : "Socrato"/);
  assert.doesNotMatch(viewSource, /analysisNotice|local-analysis-notice/);
  assert.doesNotMatch(cssSource, /\.message \{[^}]*overflow:hidden/);
  assert.match(cssSource, /\.message p \{[^}]*overflow-wrap:anywhere/);
});

test("un changement de document ne déclenche pas le défilement conversationnel", () => {
  const selector = viewSource.match(/function selectDocument[\s\S]*?\n  \}/)?.[0] ?? "";
  assert.doesNotMatch(selector, /revealNewestConversationMessage|messagesRegionRef|newestMessageRef/);
  assert.match(selector, /setSelectedId\(documentId\)/);
});

test("demande au moteur un indice local borné", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  assert.ok((getCurrentLearningQuestion(data)?.localHint ?? "").length > 0);
  assert.match(viewSource, /requestNextHint\(engineDefinition, engineState\)/);
  assert.match(viewSource, /setCurrentHint\(hint\?\.text/);
  assert.match(viewSource, /maximumHelpReceived = activeQuestionState\.hintLevel >= MAX_EXPLICIT_HINT_LEVEL/);
  assert.match(viewSource, /disabled=\{engineState\.status === "completed" \|\| maximumHelpReceived\}/);
  assert.match(viewSource, /maximumHelpReceived \? "Aide maximale reçue" : "Obtenir un indice"/);
});

test("n’ajoute aucun appel IA ou externe", () => {
  const combined = [viewSource, pageSource, readFileSync("lib/student-learning-session/demo-provider.ts", "utf8")].join("\n");
  assert.doesNotMatch(combined, /fetch\(|openai|anthropic|generateText|streamText|chat\.completions|responses\.create/i);
});

test("transpose la question approuvée avec ses trois documents ordonnés uniques", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  const question = getCurrentLearningQuestion(data); assert.ok(question);
  assert.equal(question.type, "question_with_documents");
  assert.equal(question.prompt, "À l’aide des documents, explique pourquoi la réponse britannique contribue au déclenchement des Rébellions de 1837-1838.");
  assert.equal(question.instruction, "Appuie ta réponse sur une revendication des 92 Résolutions, sur la réponse formulée dans les résolutions Russell et sur le passage du refus des réformes à la résistance présenté dans La Minerve.");
  const documents = getQuestionDocuments(data);
  assert.equal(documents.length, 3);
  assert.deepEqual(documents.map(({ displayOrder }) => displayOrder), [1, 2, 3]);
  assert.equal(new Set(documents.map(({ id }) => id)).size, 3);
  assert.deepEqual(documents.map(({ id }) => id), ["PAT-T-002", "PAT-T-003", "PAT-T-007"]);
});

test("isole le prototype de ligne du temps sans modifier la question textuelle", () => {
  const data = createDemoStudentLearningSession("demo-activity-timeline", "acte-union", "teacher-assigned"); assert.ok(data);
  const question = getCurrentLearningQuestion(data); assert.ok(question);
  assert.equal(question.type, "interactive_timeline");
  assert.equal(question.timelineInteraction?.entries.length, 6);
  assert.deepEqual(question.timelineInteraction?.dates, ["1837-1838", "1839", "1840", "1841", "1841-1842", "1848"]);
  assert.equal(question.documentRelations.length, 0);
  assert.equal(data.documentCatalog.length, 0);
  assert.match(viewSource, /InteractiveTimelineQuestion/);
  assert.match(viewSource, /Vérifier mes réponses/);
  assert.match(viewSource, /Placer ici sous/);
  assert.match(viewSource, /classroomMode && !completed[\s\S]*Afficher la réponse/);
  assert.match(viewSource, /Voici la réponse attendue/);
  assert.match(viewSource, /"timeline-entry-1": "center 78%"/);
  assert.match(viewSource, /"timeline-entry-2": "center 29%"/);
  assert.match(viewSource, /"timeline-entry-5": "center 72%"/);
  assert.match(viewSource, /"timeline-entry-6": "center 24%"/);
  assert.match(viewSource, /draggable=\{false\}/);
  assert.match(viewSource, /setDragImage\(event\.currentTarget/);
  assert.match(cssSource, /\.timeline-question img\{-webkit-user-drag:none;user-select:none\}/);
  assert.match(cssSource, /@media \(min-width:800px\) and \(max-height:850px\)/);
  assert.match(cssSource, /\.classroom-session \.timeline-question__dates,\.classroom-session \.timeline-card-pool>div\{grid-template-columns:repeat\(6,minmax\(0,1fr\)\);gap:8px\}/);
  assert.match(cssSource, /\.classroom-session \.timeline-empty-slot,\.classroom-session \.timeline-placed-card\{min-height:112px\}/);
  assert.match(cssSource, /\.classroom-session \.timeline-card-pool>div>button\{min-height:128px\}/);
});

test("garde les documents à droite de la conversation sur un petit ordinateur", () => {
  assert.match(viewSource, /questionDocuments\.length > 0 \? " session-layout--with-documents"/);
  assert.match(cssSource, /@media \(min-width:900px\)\{\.learning-session \.session-layout--with-documents:not\(\.session-layout--timeline\)/);
  assert.match(cssSource, /\.session-layout--with-documents:not\(\.session-layout--timeline\) \.documents-pane\{grid-column:2;grid-row:2\}/);
});

test("propose la chronologie interactive du gouvernement responsable de 1841 à 1864", () => {
  const data = createDemoStudentLearningSession("demo-activity-timeline", "gouvernement-responsable", "teacher-assigned"); assert.ok(data);
  const question = getCurrentLearningQuestion(data); assert.ok(question);
  assert.equal(data.notionId, "gouvernement-responsable");
  assert.equal(data.notionTitle, "Gouvernement responsable");
  assert.equal(question.type, "interactive_timeline");
  assert.deepEqual(question.timelineInteraction?.dates, ["1841", "1841-1842", "1843", "1848", "1849", "1854-1864", "1864"]);
  assert.equal(question.timelineInteraction?.entries.length, 7);
  assert.ok(question.timelineInteraction?.entries.some(({ date, description }) => date === "1848" && /confiance de l’Assemblée/.test(description)));
});

test("conserve tous les rattachements pédagogiques plusieurs-à-plusieurs", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  const question = getCurrentLearningQuestion(data); assert.ok(question);
  assert.equal(question.historicalKnowledgeIds.length, 5);
  assert.equal(question.intellectualOperations.length, 1);
  assert.equal(question.documentRelations.length, 3);
  for (const document of data.documentCatalog) {
    assert.ok(document.historicalKnowledgeIds.length >= 1);
    assert.ok(document.intellectualOperationIds.length >= 1);
  }
});

test("conserve les sources et notes éditoriales des deux textes approuvés", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  const documents = getQuestionDocuments(data);
  assert.equal(documents[0].content.kind, "historical_excerpt");
  assert.equal(documents[1].content.kind, "historical_excerpt");
  assert.match(documents[0].editorialNote ?? "", /français modernisé/);
  assert.match(documents[1].editorialNote ?? "", /traduction-adaptation française/);
  assert.ok(documents.every(({ sourceUrls }) => sourceUrls.length > 0));
});

test("ne réintroduit pas le tableau statistique de l’ancienne question", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  assert.ok(getQuestionDocuments(data).every(({ content }) => content.kind === "historical_excerpt"));
  const combinedSource = [viewSource, readFileSync("lib/student-learning-session/document-catalog.ts", "utf8")].join("\n");
  assert.doesNotMatch(combinedSource, /Malgré une population beaucoup plus importante au Canada-Est/);
  assert.doesNotMatch(viewSource, /document-conclusion|content\.conclusion/);
});

test("utilise le premier texte approuvé comme document initial", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  const question = getCurrentLearningQuestion(data); assert.ok(question);
  const document = getQuestionDocuments(data)[0];
  assert.equal(question.prompt, "À l’aide des documents, explique pourquoi la réponse britannique contribue au déclenchement des Rébellions de 1837-1838.");
  assert.equal(document.displayOrder, 1);
  assert.equal(document.id, "PAT-T-002");
  assert.equal(question.featuredDocumentId, document.id);
});

test("rend le document 4 dans la navigation, l’agrandissement et les détails", () => {
  assert.match(viewSource, /className="historical-document-image"/);
  assert.match(viewSource, /<figcaption>\{document\.title\}<\/figcaption>/);
  assert.match(viewSource, /<dt>Description factuelle<\/dt>/);
  assert.match(viewSource, /document\.content\.localSrc/);
  assert.match(viewSource, /\{consultedIds\.size\} sur \{documents\.length\}/);
  assert.match(viewSource, /<DocumentContent document=\{selected\} onExpand=\{\(\) => setExpanded\(true\)\} \/>/);
  assert.match(viewSource, /<DocumentContent document=\{selected\} expanded \/>/);
});

test("affiche une miniature locale uniquement pour les documents réellement illustrés", () => {
  assert.match(viewSource, /function DocumentThumbnailPreview[\s\S]*document\.content\.kind === "historical_image"[\s\S]*className="document-thumbnail-image"[\s\S]*src=\{document\.content\.localSrc\}[\s\S]*alt=\{`Aperçu du document/);
  assert.match(viewSource, /width=\{180\}/);
  assert.match(viewSource, /height=\{92\}/);
  assert.match(cssSource, /\.document-thumbnail-image \{[^}]*object-fit:cover/);
  assert.match(cssSource, /\.historical-document-image \{[^}]*object-fit:contain/);
  const data = createDemoStudentLearningSession(); assert.ok(data);
  const documents = getQuestionDocuments(data);
  assert.equal(documents.filter(({ content }) => content.kind === "historical_image").length, 0);
  assert.equal(documents.filter(({ content }) => content.kind !== "historical_image" && "localSrc" in content).length, 0);
  assert.doesNotMatch(viewSource, /https?:\/\/upload\.wikimedia\.org/);
});

test("entoure uniquement les extraits historiques de guillemets français", () => {
  assert.match(viewSource, /<blockquote>« \{document\.content\.excerpt\} »<\/blockquote>/);
  assert.match(viewSource, /document\.content\.kind === "historical_excerpt"[\s\S]*<cite className="document-identification">\{identification\}<\/cite>/);
  assert.match(viewSource, /<DocumentContent document=\{selected\} onExpand=\{\(\) => setExpanded\(true\)\} \/>/);
  assert.match(viewSource, /<DocumentContent document=\{selected\} expanded \/>/);
  assert.match(viewSource, /document\.content\.kind === "population_table" \? \([\s\S]*?<table>[\s\S]*?<\/table>[\s\S]*?\) : document\.content\.kind === "historical_image" \?[\s\S]*?: <blockquote>« \{document\.content\.excerpt\} »<\/blockquote>/);
  const data = createDemoStudentLearningSession(); assert.ok(data);
  const excerpts = getQuestionDocuments(data).filter(({ content }) => content.kind === "historical_excerpt");
  assert.deepEqual(excerpts.map(({ id }) => id), ["PAT-T-002", "PAT-T-003", "PAT-T-007"]);
});

test("permet sélection clavier et vue agrandie accessible avec retour du focus", () => {
  assert.match(viewSource, /type="button"[\s\S]*aria-pressed/);
  assert.match(viewSource, /onClick=\{\(\) => selectDocument\(document\.id\)\}/);
  assert.match(viewSource, /role="dialog" aria-modal="true"/);
  assert.match(viewSource, /event\.key === "Escape"/);
  assert.match(viewSource, /thumbnailRefs\.current\.get\(selected\?\.id/);
  assert.match(viewSource, /aria-label="Fermer la vue agrandie"/);
  assert.match(viewSource, /<table>[\s\S]*<caption>[\s\S]*scope="col"[\s\S]*scope="row"/);
});

test("suit les documents consultés et conserve clairement la sélection", () => {
  assert.match(viewSource, /useState\(\(\) => new Set\(initialDocumentId \? \[initialDocumentId\] : \[\]\)\)/);
  assert.match(viewSource, /setConsultedIds\(\(current\) => new Set\(current\)\.add\(documentId\)\)/);
  assert.match(viewSource, /\{consultedIds\.size\} sur \{documents\.length\} \{consultedIds\.size === 1 \? "consulté" : "consultés"\}/);
  assert.match(viewSource, /✓ Consulté/);
  assert.match(viewSource, /aria-pressed=\{document\.id === selected\?\.id\}/);
  assert.match(cssSource, /\.document-thumbnails button\[aria-pressed="true"\]/);
});

test("résout explicitement le premier document approuvé comme document initial consulté", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  const question = getCurrentLearningQuestion(data); assert.ok(question);
  assert.equal(question.featuredDocumentId, "PAT-T-002");
  assert.ok(question.documentRelations.some(({ documentId }) => documentId === question.featuredDocumentId));
  assert.equal(getInitialQuestionDocument(data)?.id, "PAT-T-002");
  assert.deepEqual(getQuestionDocuments(data).map(({ displayOrder }) => displayOrder), [1, 2, 3]);
  assert.match(viewSource, /useState\(initialDocumentId\)/);
  assert.match(viewSource, /consultedIds\.size === 1 \? "consulté"/);
  assert.doesNotMatch(viewSource, /Document suivant|Document précédent|selectedIndex/);
  assert.equal(getQuestionDocuments(data).at(-1)?.displayOrder, 3);
});

test("applique les replis typés du document initial sans numéro ni titre comme autorité", () => {
  const base = createDemoStudentLearningSession(); assert.ok(base);
  const firstDocument = base.documentCatalog[0]; assert.ok(firstDocument);
  const anotherDocument = { ...firstDocument, id: "another-stable-document" };
  const withAnotherFeatured: StudentLearningSessionData = {
    ...base,
    documentCatalog: [...base.documentCatalog, anotherDocument],
    questions: [{ ...base.questions[0], featuredDocumentId: anotherDocument.id, documentRelations: [...base.questions[0].documentRelations, { documentId: anotherDocument.id, displayOrder: 5 }] }],
  };
  assert.equal(getInitialQuestionDocument(withAnotherFeatured)?.id, anotherDocument.id);

  const withoutFeatured: StudentLearningSessionData = { ...base, questions: [{ ...base.questions[0], featuredDocumentId: undefined }] };
  assert.equal(getInitialQuestionDocument(withoutFeatured)?.id, firstDocument.id);

  const textDocuments = base.documentCatalog.filter(({ content }) => content.kind !== "historical_image");
  const withoutImage: StudentLearningSessionData = {
    ...base,
    documentCatalog: textDocuments,
    questions: [{ ...base.questions[0], featuredDocumentId: undefined, documentRelations: base.questions[0].documentRelations.filter(({ documentId }) => textDocuments.some(({ id }) => id === documentId)) }],
  };
  assert.equal(getInitialQuestionDocument(withoutImage)?.id, textDocuments[0].id);

  const withoutDocuments = createDemoStudentLearningSession("demo-activity-industrialisation", "industrialisation", "notion-review"); assert.ok(withoutDocuments);
  assert.equal(getInitialQuestionDocument(withoutDocuments), null);
  const presentationSource = readFileSync("lib/student-learning-session/presentation.ts", "utf8");
  const resolver = presentationSource.match(/export function getInitialQuestionDocument[\s\S]*?\n\}/)?.[0] ?? "";
  assert.doesNotMatch(resolver, /displayOrder|\.title|Document 4|duncan-parliament/);
});

test("retire les commandes précédent et suivant tout en préservant la position", () => {
  assert.doesNotMatch(viewSource, /Document précédent|Document suivant|selectRelativeDocument|selectedIndex/);
  assert.match(viewSource, /window\.scrollY/);
  assert.match(viewSource, /window\.scrollTo\(\{ top: scrollPosition, behavior: "auto" \}\)/);
  assert.match(viewSource, /thumbnailRefs\.current\.get\(selected\?\.id/);
});

test("présente les vignettes en deux colonnes sur mobile", () => {
  assert.doesNotMatch(viewSource, /mobile-document-cards/);
  assert.match(cssSource, /@media \(max-width:620px\)[\s\S]*\.document-thumbnails \{ display:grid; grid-template-columns:repeat\(2,minmax\(0,1fr\)\); \}/);
});

test("neutralise les titres visibles et les noms accessibles des documents", () => {
  assert.doesNotMatch(viewSource, /Population des deux Canadas au moment de l’Acte d’union|Le comte de Gosford critique la représentation égale|La Fontaine dénonce les conditions de l’Union/);
  assert.match(viewSource, /<h3[^>]*>[\s\S]*<strong>Document \{document\.displayOrder\}<\/strong>[\s\S]*<small>\{getNeutralDocumentType\(document\)\}<\/small>[\s\S]*<\/h3>/);
  assert.match(viewSource, /aria-label=\{`Ouvrir le document \$\{document\.displayOrder\}, \$\{getNeutralDocumentType\(document\)/);
});

test("présente les types neutres dans les vignettes", () => {
  const data = createDemoStudentLearningSession(); assert.ok(data);
  assert.deepEqual(getQuestionDocuments(data).map(({ typeLabel }) => typeLabel), ["Extrait d’un texte parlementaire", "Extrait d’un texte parlementaire", "Extrait d’un discours publié dans un journal"]);
  assert.match(viewSource, /document\.content\.kind === "population_table" \|\| document\.content\.kind === "comparison_table" \? "Tableau statistique" : document\.typeLabel/);
  assert.match(viewSource, /<strong>Document \{document\.displayOrder\}<\/strong>[\s\S]*<span>\{getNeutralDocumentType\(document\)\}<\/span>/);
  assert.doesNotMatch(viewSource, /<span>\{document\.authorLabel\}<\/span>/);
});

test("rend le schéma politique visuel plutôt qu’un tableau statistique", () => {
  assert.match(viewSource, /document\.content\.kind === "political_structure_diagram"/);
  assert.match(viewSource, /className="student-political-structure"/);
  assert.match(viewSource, /Assemblée législative · 84 députés/);
  assert.match(viewSource, /Le Conseil propose des mesures ↓/);
  assert.match(viewSource, /L’Assemblée débat, vote et transmet les projets ↑/);
  assert.match(cssSource, /\.student-political-structure\{[^}]*display:grid/);
  assert.match(cssSource, /\.student-political-structure \.ps-council-links/);
  assert.match(cssSource, /--diagram-link:#f2cc82/);
  assert.match(viewSource, /responsible-government-structure/);
  assert.match(viewSource, /responsible-government-1848/);
  assert.match(viewSource, /agit par l’intermédiaire du ↓/);
  assert.match(viewSource, /élit 42 députés ↑/);
  assert.match(viewSource, /Si le Conseil exécutif perd la confiance/);
});

test("réunit le numéro et le type neutre dans l’en-tête de chaque document", () => {
  assert.match(viewSource, /<strong>Document \{document\.displayOrder\}<\/strong>\s*<span aria-hidden="true"> · <\/span>\s*<small>\{getNeutralDocumentType\(document\)\}<\/small>/);
  assert.match(cssSource, /\.document-content h3 \{[^}]*display:flex[^}]*flex-wrap:wrap/);
  assert.match(cssSource, /\.document-content h3 strong \{[^}]*font-size:clamp\(1\.25rem,1\.35vw,1\.375rem\)[^}]*font-weight:700/);
  assert.match(cssSource, /\.document-content h3 > span \{[^}]*color:var\(--gold\)[^}]*font-size:clamp\(1\.2rem,1\.3vw,1\.35rem\)/);
  assert.match(cssSource, /\.document-content h3 small \{[^}]*font-size:clamp\(1\.1875rem,1\.3vw,1\.3125rem\)[^}]*font-weight:600/);
  assert.match(cssSource, /\.document-thumbnails button \{[^}]*min-height:60px/);
});

test("compacte uniquement la hiérarchie typographique documentaire", () => {
  assert.match(cssSource, /\.column-title \{[^}]*font-size:clamp\(1\.25rem,1\.6vw,1\.6rem\)[^}]*font-weight:700[^}]*line-height:1\.15/);
  assert.match(cssSource, /\.documents-heading-copy > span,\.question-heading-accent \{[^}]*width:28px[^}]*height:1px[^}]*margin-top:4px/);
  assert.match(cssSource, /\.document-preview \{[^}]*margin-top:10px/);
  assert.match(cssSource, /\.document-thumbnails button strong \{[^}]*font-size:\.82rem[^}]*line-height:1\.15/);
  assert.match(cssSource, /\.document-thumbnails button span \{[^}]*overflow:hidden[^}]*font-size:\.75rem[^}]*line-height:1\.15[^}]*-webkit-line-clamp:2/);
  assert.match(cssSource, /\.document-thumbnail-image \{[^}]*height:58px/);
});

test("affiche les choix A à D et remplace la réponse libre pour une question à choix", () => {
  assert.match(viewSource, /question\?\.type === "multiple_choice"/);
  assert.match(viewSource, /className="multiple-choice-options" role="radiogroup"/);
  assert.match(viewSource, /question\.answerOptions\.map/);
  assert.match(viewSource, /Vérifier ma réponse/);
  assert.match(viewSource, /className="multiple-choice-check"/);
  assert.match(cssSource, /\.multiple-choice-options button \{/);
  assert.match(viewSource, /isMultipleChoice && questionDocuments\.length === 0 \? null : <div className="documents-heading-copy">/);
  assert.match(viewSource, /<strong>Socrato<\/strong><p>J’attends ta réponse…<\/p>/);
  assert.match(viewSource, /questionDocuments\.length === 0 \? renderMultipleChoiceResponse\(true\)/);
  assert.match(viewSource, /\{questionDocuments\.length === 0 \? null : <>/);
  assert.match(cssSource, /\.multiple-choice-socrato-panel \{/);
  assert.match(viewSource, /session-layout--choice-no-documents/);
  assert.match(cssSource, /\.learning-session \.session-layout--choice-no-documents\{[^}]*max-width:1600px[^}]*grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
  assert.match(cssSource, /\.learning-session \.session-layout--choice-no-documents \.question-pane\{[^}]*grid-column:1[^}]*width:100%/);
  assert.match(cssSource, /\.learning-session \.session-layout--choice-no-documents \.documents-heading,[^}]*\.documents-pane\{display:none\}/);
  assert.match(viewSource, /Pas tout à fait\. Consulte les documents ou demande un indice, puis réessaie\./);
  assert.match(viewSource, /Pas tout à fait\. Demande un indice, puis réessaie\./);
  assert.match(cssSource, /\.choice-feedback-correct \{[^}]*max-height:min\(42vh,360px\)[^}]*overflow-y:auto[^}]*scrollbar-gutter:stable/);
});

test("rend visible la rétroaction Socrato après une longue question à choix", () => {
  assert.match(viewSource, /choiceFeedbackRef\.current\?\.scrollIntoView/);
  assert.match(viewSource, /ref=\{choiceFeedbackRef\}/);
  assert.match(cssSource, /session-layout--choice-no-documents\{height:auto!important;min-height:0!important;grid-template-rows:auto auto!important;align-items:start!important;overflow:visible!important/);
});

test("regroupe actions, navigation et quatre vignettes dans l’encadré documentaire local", () => {
  assert.match(viewSource, /<div className=\{`document-system-card\$\{stacked[\s\S]*<DocumentContent document=\{selected\} onExpand=[\s\S]*<div className="document-separator"[\s\S]*<div className="document-navigation"[\s\S]*<div className="document-thumbnails"/);
  assert.match(viewSource, /<div className="document-actions">[\s\S]*className="expand-document"[\s\S]*Agrandir[\s\S]*<details className="document-details">\s*<summary>Détails<\/summary>/);
  assert.match(cssSource, /\.document-actions \{[^}]*width:100%[^}]*display:flex[^}]*flex-wrap:wrap[^}]*justify-content:flex-start[^}]*align-items:center/);
  assert.match(cssSource, /\.document-system-card \{[^}]*border:1px solid[^}]*border-radius:14px/);
  assert.match(cssSource, /\.document-thumbnails \{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(cssSource, /@media \(min-width:1120px\) and \(min-height:700px\)[\s\S]*\.session-layout \{[^}]*align-items:stretch/);
  assert.match(cssSource, /@media \(min-width:1120px\) and \(min-height:700px\)[\s\S]*\.message-list \{ min-height:0; max-height:none; flex:1; \}/);
});

test("empile tous les documents associés sans vignettes et adapte leur répartition", () => {
  assert.match(viewSource, /const useStackedDocuments = questionDocuments\.length > 0 && !isInteractiveTimeline && !isInteractiveAssociation/);
  assert.match(viewSource, /stacked=\{useStackedDocuments\}/);
  assert.match(viewSource, /stacked \? <div ref=\{stackedListRef\} className="stacked-document-list" style=\{\{ gridTemplateRows: `repeat\(\$\{documents\.length\}, minmax\(0, 1fr\)\)` \}\}>\{documents\.map/);
  assert.match(viewSource, /<DocumentContent document=\{document\} compact onExpand=/);
  assert.match(cssSource, /\.stacked-document-list\{[^}]*display:grid/);
  assert.match(cssSource, /\.document-content-compact blockquote\{[^}]*-webkit-line-clamp:4/);
  assert.match(viewSource, /compactTextLength <= 300 \? " document-content-compact--short"/);
  assert.match(viewSource, /compactTextLength <= 430 \? " document-content-compact--medium"/);
  assert.match(cssSource, /\.document-content-compact--short blockquote\{[^}]*font-size:clamp\(\.88rem/);
  assert.match(cssSource, /\.document-content-compact--medium blockquote\{[^}]*font-size:clamp\(\.78rem/);
  assert.match(cssSource, /\.document-content-compact blockquote\{[^}]*-webkit-line-clamp:unset/);
});

test("affiche simultanément les cartes documentaires compactes sans défilement interne", () => {
  assert.match(cssSource, /\.stacked-document-list:has\(>\.stacked-document:nth-child\(4\):last-child\)\{grid-template-rows:repeat\(4,minmax\(0,1fr\)\)!important\}/);
  assert.match(cssSource, /\.document-system-card--stacked \.stacked-document-list\{[^}]*overflow:visible!important/);
});

test("affiche une identification sobre et place les métadonnées sous Détails", () => {
  assert.match(viewSource, /document\.authorLabel \?\? document\.institutionLabel \?\? document\.sourceLabel/);
  assert.match(viewSource, /document\.dateLabel/);
  assert.match(viewSource, /\[document\.sourceLabel, document\.dateLabel\]\.filter\(Boolean\)\.join\(" · "\)/);
  assert.match(viewSource, /<details className="document-details">\s*<summary>Détails<\/summary>/);
  assert.doesNotMatch(viewSource, /<details className="document-details"[^>]*\sopen(?:=|\s|>)/);
  assert.match(viewSource, /<dt>Source complète<\/dt>/);
  assert.match(viewSource, /document\.editorialNote/);
  assert.match(viewSource, /document\.sourceUrls/);
  assert.match(cssSource, /\.document-details\[open\] summary::before/);
  assert.match(cssSource, /\.document-system-card--stacked\{position:relative/);
  assert.match(cssSource, /\.stacked-document:has\(\.document-details\[open\]\)\{overflow:visible\}/);
  assert.match(cssSource, /\.document-content-compact \.document-details\[open\]\{[^}]*display:block[^}]*overflow-y:auto[^}]*scrollbar-gutter:stable/);
});

test("place chaque attribution dans le même groupe que son document avant les actions", () => {
  assert.match(viewSource, /<div className=\{`document-content-group document-content-group-\$\{document\.content\.kind === "historical_image" \? "visual" : "textual"\}`\}>[\s\S]*<h3[\s\S]*document\.content\.kind === "population_table"[\s\S]*document\.content\.kind === "historical_excerpt"[\s\S]*className="document-identification"[\s\S]*<\/div>\s*<div className="document-flex-space"[\s\S]*<div className="document-actions">/);
  assert.match(cssSource, /\.document-content-group \{[^}]*display:flex[^}]*flex-direction:column[^}]*gap:10px/);
  assert.match(cssSource, /\.document-identification \{[^}]*margin:0/);
  assert.doesNotMatch(cssSource, /\.document-identification \{[^}]*margin-top:auto/);
  assert.doesNotMatch(cssSource, /\.document-content-group \{[^}]*justify-content:space-between/);
});

test("contient entièrement les images sans faire défiler la région visuelle", () => {
  assert.match(viewSource, /document\.content\.kind === "historical_image"[\s\S]*<div className="document-visual-viewport">[\s\S]*className="historical-document-image"/);
  assert.match(cssSource, /\.document-visual-viewport \{ min-height:0; flex:1 1 auto; display:grid; place-items:center; overflow:hidden; \}/);
  assert.match(cssSource, /\.historical-document-image \{[^}]*width:100%[^}]*height:100%[^}]*max-height:100%[^}]*object-fit:contain/);
  assert.match(cssSource, /\.document-content-group-visual \+ \.document-flex-space \{ display:none; \}/);
  assert.match(cssSource, /\.document-modal \.document-visual-viewport \{[^}]*height:min\(70dvh,700px\)[^}]*overflow:hidden/);
});

test("maintient Agrandir et Détails ensemble puis affiche les détails dessous", () => {
  assert.match(cssSource, /\.document-actions \{[^}]*width:100%[^}]*display:flex[^}]*flex-wrap:wrap[^}]*justify-content:flex-start[^}]*align-items:center[^}]*gap:8px/);
  assert.match(cssSource, /\.document-details\[open\] \{ display:contents; \}/);
  assert.match(cssSource, /\.document-details\[open\] \.document-metadata,\.document-details\[open\] \.document-links \{[^}]*width:100%[^}]*flex:0 0 100%/);
  assert.match(cssSource, /\.document-details\[open\] \.document-metadata \{ margin-top:8px; \}/);
  assert.match(cssSource, /\.expand-document \{[^}]*min-width:44px[^}]*min-height:44px/);
  assert.match(cssSource, /\.document-details summary \{[^}]*min-width:44px[^}]*min-height:44px/);
});

test("compacte visuellement Agrandir et Détails sans réduire leur cible accessible", () => {
  assert.match(cssSource, /\.document-actions \{[^}]*align-items:center[^}]*gap:8px/);
  assert.match(cssSource, /\.expand-document \{[^}]*min-width:44px[^}]*min-height:44px[^}]*padding:0 9px[^}]*font-size:12\.5px/);
  assert.match(cssSource, /\.expand-document::before \{[^}]*inset:7px 0[^}]*border-radius:5px/);
  assert.match(cssSource, /\.expand-document svg \{[^}]*width:14px[^}]*height:14px/);
  assert.match(cssSource, /\.document-details summary \{[^}]*min-width:44px[^}]*min-height:44px[^}]*gap:5px[^}]*padding:0 9px[^}]*font-size:12\.5px/);
  assert.match(cssSource, /\.document-details summary::before \{[^}]*width:14px[^}]*height:14px[^}]*font-size:12px/);
  assert.match(cssSource, /\.document-details summary::after \{[^}]*inset:7px 0[^}]*border:1px solid var\(--gold\)[^}]*border-radius:5px/);
});

test("limite les citations des vignettes sans toucher aux extraits complets", () => {
  assert.match(viewSource, /<blockquote className="document-thumbnail-quote" aria-hidden="true">« \{document\.content\.excerpt\} »<\/blockquote>/);
  assert.match(cssSource, /\.document-thumbnail-table,\.document-thumbnail-quote \{[^}]*overflow:hidden/);
  assert.match(cssSource, /\.document-thumbnail-quote \{[^}]*font-size:9px[^}]*-webkit-line-clamp:3/);
  assert.match(cssSource, /\.document-thumbnail-quote::after \{[^}]*linear-gradient/);
  assert.match(viewSource, /: <blockquote>« \{document\.content\.excerpt\} »<\/blockquote>/);
});

test("distingue la sélection légère du focus clavier des vignettes", () => {
  const activeRule = cssSource.match(/\.document-thumbnails button\[aria-pressed="true"\] \{([^}]*)\}/)?.[1] ?? "";
  assert.match(activeRule, /border-color:var\(--gold\)/);
  assert.match(activeRule, /box-shadow:0 0 8px/);
  assert.doesNotMatch(activeRule, /0 0 0 2px/);
  assert.match(cssSource, /\.learning-session button:focus-visible[^}]*outline:3px solid/);
});

test("intègre la dictée et l’envoi iconographique dans un compositeur compact", () => {
  assert.match(viewSource, /const sendUnavailable = !response\.trim\(\) \|\| responseUnavailable \|\| voiceBlocksSending/);
  assert.match(viewSource, /if \(!content \|\| submitting \|\| submissionLockRef\.current \|\| voiceBlocksSending/);
  assert.match(viewSource, /className="composer-icon-button submit-button" disabled=\{sendUnavailable\} aria-label="Envoyer ma réponse" title="Envoyer ma réponse"/);
  assert.match(viewSource, /className="composer-icon-button voice-button" onClick=\{handleVoicePrimaryAction\}/);
  assert.match(viewSource, /aria-label=\{voicePrimaryLabel\} title=\{voicePrimaryLabel\}/);
  assert.doesNotMatch(viewSource, />Envoyer ma réponse</);
  assert.doesNotMatch(viewSource, />Dicter ma réponse</);
  assert.match(viewSource, /<span>Arrêter<\/span>/);
  assert.match(viewSource, /Enregistrement en cours/);
  assert.match(viewSource, /formatRecordingDuration\(voiceState\.elapsedSeconds\)/);
  assert.match(viewSource, /className="voice-processing-state" role="status">\{voicePrimaryLabel\}/);
  assert.match(viewSource, />Annuler<\/button>/);
  assert.match(cssSource, /\.composer-icon-button \{[^}]*width:44px[^}]*height:44px/);
  assert.match(cssSource, /\.voice-stop-button \{[^}]*min-height:44px[^}]*background:#b32636/);
  assert.match(cssSource, /\.submit-button:disabled \{[^}]*cursor:not-allowed/);
  assert.match(cssSource, /\.microphone-icon \{ width:20px; height:20px; flex:0 0 auto; fill:none; stroke:currentColor; stroke-linecap:round; stroke-linejoin:round; stroke-width:1\.8; \}/);
});

test("relie les cartes d’activité du tableau de bord à la séance", () => {
  assert.match(dashboardSource, /href=\{activity\.actionHref\}/);
  assert.match(readFileSync("lib/student-dashboard/demo-provider.ts", "utf8"), /getLearningSessionUrl\("demo-activity-acte-union"/);
});

test("préserve les thèmes clair et sombre et les contrats accessibles", () => {
  assert.match(viewSource, /<ThemeToggle/);
  assert.match(cssSource, /\[data-theme="light"\] \.learning-session/);
  assert.match(cssSource, /prefers-reduced-motion/);
  assert.match(viewSource, /aria-live="polite"/);
  assert.match(viewSource, /aria-pressed/);
});

test("guide l’élève sous la chaîne après une tentative imparfaite", () => {
  assert.match(viewSource, /className="causal-chain-socrato-help" role="status" aria-live="polite"/);
  assert.match(viewSource, /Reprends seulement les maillons suivants/);
  assert.match(viewSource, /answer\.includes\("indemni"\).*answer\.includes\("rebellion"\)/);
  assert.match(viewSource, /answer\.includes\("instabilit"\).*answer\.includes\("politique"\)/);
  assert.match(cssSource, /\.causal-chain-socrato-help\{[^}]*border-radius:18px/);
});
