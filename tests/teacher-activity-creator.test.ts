import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createLocalActivityPreview,
  getActivityQuestionSelection,
  getActivityQuestionCategory,
  getEligibleActivityQuestions,
  getProgressionCopy,
  getProgressionMode,
  isActivityConfigurationComplete,
  isLocalActivityCreatorEnabled,
  LocalActivityCreatorProvider,
  validateActivityConfiguration,
  type ActivityConfiguration,
} from "../lib/teacher-activity-creator/index.ts";

const viewSource = readFileSync("app/teacher/activities/new/teacher-activity-creator-view.tsx", "utf8");
const routeSource = readFileSync("app/teacher/activities/new/page.tsx", "utf8");
const cssSource = readFileSync("app/teacher/activities/new/teacher-activity-creator.css", "utf8");
const providerSource = readFileSync("lib/teacher-activity-creator/local-provider.ts", "utf8");
const wordExportSource = readFileSync("lib/teacher-activity-creator/word-export.ts", "utf8");
const studentPreviewSource = readFileSync("app/teacher/activities/new/student-preview/page.tsx", "utf8");
const studentPreviewFrameCssSource = readFileSync("app/teacher/activities/new/student-preview-frame.css", "utf8");
const studentPreviewCssSource = readFileSync("app/teacher/activities/new/student-preview/student-preview.css", "utf8");
const sessionViewSource = readFileSync("app/eleve/activite/[activityId]/session-view.tsx", "utf8");
const activityDraftSource = readFileSync("lib/teacher-activity-drafts/browser-store.ts", "utf8");

const baseConfig: ActivityConfiguration = {
  title: "Activité fictive",
  durationMinutes: 25,
  questionCount: 8,
  selectedGroupIds: ["group-demo-401"],
  workType: "revision",
  notionIds: ["acte-union"],
  operationId: null,
  questionValidated: true,
};
const unlimitedRevisionConfig: ActivityConfiguration = { ...baseConfig, questionCount: null };

test("rend les trois cartes dans l’ordre et aucune étape numérotée", () => {
  const format = viewSource.indexOf("Quel format ?");
  const audience = viewSource.indexOf("À qui s’adresse l’activité ?");
  const work = viewSource.indexOf("Quelle notion et opération voulez-vous travailler ?");
  assert.ok(format < work && work < audience);
  assert.doesNotMatch(viewSource, />Configuration<|>Questions<|>Expérience élève|>Publication</);
  assert.match(viewSource, /Espace enseignant[\s\S]*Créer une activité/);
  assert.match(cssSource, /\.creator-brand\{display:grid;grid-template-columns:38px minmax\(0,1fr\);grid-template-rows:auto auto/);
  assert.match(cssSource, /\.creator-brand img\{grid-column:1;grid-row:1\/3/);
  assert.doesNotMatch(viewSource, /<Icon name="groups"\/>Groupes/);
});

test("sélectionne tous les groupes et Révision par défaut", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  assert.match(viewSource, /selectedGroupIds: catalog\.groups\.map/);
  assert.match(viewSource, /workType: "revision"/);
  assert.match(viewSource, /title: ""/);
  assert.match(viewSource, /placeholder="Inscrivez le titre de l’activité"/);
  assert.equal(catalog.groups.length, 7);
  assert.ok(catalog.groups.every(({ name }) => /fictif/.test(name)));
});

test("propose uniquement un nombre de questions de 1 à 20", () => {
  assert.match(viewSource, /durationMinutes: null/);
  assert.match(viewSource, /questionCount: 1/);
  assert.doesNotMatch(viewSource, />Durée<select/);
  assert.doesNotMatch(viewSource, /Aucune durée|Aucun maximum/);
  assert.match(viewSource, /Array\.from\(\{ length: 20 \}, \(_, index\) => index \+ 1\)/);
});

test("place les deux types de travail dans la carte format", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  assert.match(viewSource, /Révision/);
  assert.doesNotMatch(viewSource, /id: "enrichment", label: "Enrichissement"/);
  assert.match(viewSource, /Question à développement/);
  assert.ok(viewSource.indexOf("Type de travail") < viewSource.indexOf("Quelle notion et opération voulez-vous travailler ?"));
  assert.doesNotMatch(viewSource, /className="dynamic-help"/);
  assert.equal(viewSource.match(/className="format-section"/g)?.length, 3);
  assert.match(cssSource, /\.creator-card \.format-section\{margin-top:16px\}/);
  assert.match(cssSource, /fieldset\.format-section legend\{margin:0 0 6px\}/);
  assert.equal(catalog.operations.length, 7);
});

test("permet de sélectionner plusieurs notions dans tous les modes", () => {
  assert.match(viewSource, /<details ref=\{notionPickerRef\} className="notion-picker">/);
  assert.match(viewSource, /period\.notions\.map/);
  assert.match(viewSource, /<input type="checkbox"/);
  assert.doesNotMatch(viewSource, /type="radio"|Une seule|notionIds: \[notionId\]/);
  assert.doesNotMatch(viewSource, /notionIds: config\.notionIds\.slice/);
  assert.match(viewSource, /ref=\{notionPickerRef\}/);
  assert.match(viewSource, /document\.addEventListener\("pointerdown", closeNotionPickerOnOutsideClick\)/);
  assert.match(viewSource, /!picker\.contains\(event\.target\)\) picker\.removeAttribute\("open"\)/);
});

test("expose dans l’ordre les 56 rubriques de connaissances du programme ministériel", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  assert.equal(catalog.notions.length, 56);
  assert.deepEqual(catalog.notions.slice(0, 3).map(({ title }) => title), ["Acte d’Union", "Économie coloniale", "Gouvernement responsable"]);
  assert.deepEqual(catalog.notions.slice(-3).map(({ title }) => title), ["Dévitalisation de localités", "Relations internationales", "Ère de l’information"]);
});

test("regroupe les notions dans les quatre périodes officielles de quatrième secondaire", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  assert.deepEqual(
    [...new Set(catalog.notions.map(({ periodLabel }) => periodLabel))],
    [
      "1840-1896 · La formation du régime fédéral canadien",
      "1896-1945 · Les nationalismes et l’autonomie du Canada",
      "1945-1980 · La modernisation du Québec et la Révolution tranquille",
      "De 1980 à nos jours · Les choix de société dans le Québec contemporain",
    ],
  );
  assert.deepEqual(
    catalog.notions.reduce<Record<string, number>>((counts, notion) => ({ ...counts, [notion.periodId]: (counts[notion.periodId] ?? 0) + 1 }), {}),
    { "1840-1896": 14, "1896-1945": 15, "1945-1980": 15, "1980-present": 12 },
  );
  assert.equal(catalog.notions.find(({ title }) => title === "Statut du Canada dans l’Empire britannique")?.periodId, "1896-1945");
  assert.equal(catalog.notions.find(({ title }) => title === "Redéfinition du rôle de l’État")?.periodId, "1980-present");
  assert.match(viewSource, /className="notion-period"/);
  assert.match(cssSource, /\.creator-card:has\(\.notion-picker\[open\]\)\{z-index:12\}/);
});

test("applique les trois contrats de progression", () => {
  assert.equal(getProgressionMode({ durationMinutes: null, questionCount: 8 }), "fixed");
  assert.equal(getProgressionCopy({ durationMinutes: null, questionCount: 8 }).summary, "8 questions");
  assert.equal(getProgressionCopy({ durationMinutes: null, questionCount: 8 }).help, "");
  assert.equal(getProgressionMode({ durationMinutes: 25, questionCount: null }), "timed");
  assert.doesNotMatch(getProgressionCopy({ durationMinutes: 25, questionCount: null }).navigation, /sur \d/);
  assert.equal(getProgressionMode({ durationMinutes: 25, questionCount: 8 }), "timed-capped");
  assert.equal(getProgressionCopy({ durationMinutes: 25, questionCount: 8 }).summary, "25 minutes · jusqu’à 8 questions");
  assert.equal(getProgressionMode({ durationMinutes: null, questionCount: null }), "incomplete");
});

test("retire les durées et borne le nombre de questions", () => {
  assert.doesNotMatch(viewSource, /DURATION_OPTIONS/);
  assert.match(viewSource, /Array\.from\(\{ length: 20 \}, \(_, index\) => index \+ 1\)/);
  assert.match(validateActivityConfiguration({ ...baseConfig, questionCount: 21 }).format ?? "", /entre 1 et 20/);
});

test("une question à développement accepte plusieurs notions et une opération aléatoire", () => {
  const development = { ...baseConfig, workType: "development" as const, notionIds: [], operationId: null };
  assert.match(validateActivityConfiguration(development).notions ?? "", /au moins une notion/);
  assert.equal(validateActivityConfiguration({ ...development, notionIds: ["acte-union", "economie-coloniale"] }).notions, undefined);
  assert.equal(validateActivityConfiguration({ ...development, notionIds: ["acte-union", "economie-coloniale"] }).operation, undefined);
  assert.equal(isActivityConfigurationComplete(development), false);
  assert.doesNotMatch(viewSource, /automaticOperationId/);
  assert.match(viewSource, /value=\{config\.operationId \?\? "random"\}/);
  assert.match(viewSource, /<option value="random">Aléatoire<\/option>/);
});

test("présente 150 mots comme cible souple sans validation quantitative", () => {
  assert.match(viewSource, /environ 150 mots/);
  assert.match(viewSource, /cible pédagogique est souple/);
  assert.doesNotMatch(viewSource, /wordCount|minWords|maxWords|split\([^)]*\)\.length/);
});

test("réserve les questions de 150 mots au mode développement", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  const developmentConfig = { ...baseConfig, workType: "development" as const, operationId: "causes_and_consequences" as const };
  const development = createLocalActivityPreview(developmentConfig, catalog, 0);
  assert.equal(development.format, "development-150");
  assert.equal(catalog.questions.find(({ prompt }) => prompt === development.question)?.format, "development-150");
  const revisionQuestions = getEligibleActivityQuestions(baseConfig, catalog);
  const enrichmentQuestions = getEligibleActivityQuestions({ ...baseConfig, workType: "enrichment" }, catalog);
  assert.ok(revisionQuestions.length > 0);
  assert.ok(enrichmentQuestions.length > 0);
  assert.equal(revisionQuestions.some(({ format }) => format === "development-150"), false);
  assert.equal(enrichmentQuestions.some(({ format }) => format === "development-150"), false);
  const allDevelopment = Array.from({ length: 5 }, (_, variant) => createLocalActivityPreview({ ...developmentConfig, operationId: null }, catalog, variant));
  assert.equal(new Set(allDevelopment.map(({ question }) => question)).size, 5);
  const timelineQuestion = allDevelopment.find(({ question }) => question.startsWith("À l’aide de la ligne du temps"));
  assert.deepEqual(timelineQuestion?.documents.map(({ id }) => id), ["AU-D-002"]);
  const debtQuestion = allDevelopment.find(({ question }) => question.startsWith("À l’aide des deux documents"));
  assert.deepEqual(debtQuestion?.documents.map(({ id }) => id), ["AU-G-001", "AU-D-001"]);
  const comparisonQuestion = allDevelopment.find(({ question }) => question.startsWith("Compare les recommandations"));
  assert.deepEqual(comparisonQuestion?.documents.map(({ id }) => id), ["historical-presentation:acte-union:durham-union-legislative", "historical-presentation:acte-union:durham-responsabilite", "AU-T-001"]);
});

test("compose une activité équilibrée et diversifie les opérations", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  const fourQuestions = getActivityQuestionSelection({ ...baseConfig, questionCount: 4 }, catalog);
  const fiveQuestions = getActivityQuestionSelection({ ...baseConfig, questionCount: 5 }, catalog);
  const sixQuestions = getActivityQuestionSelection({ ...baseConfig, questionCount: 6 }, catalog);
  assert.equal(fourQuestions[0]?.format, "interactive-timeline");
  assert.deepEqual(fourQuestions.map(({ format }) => getActivityQuestionCategory(format)), ["document-interpretation", "multiple-choice", "short-answer", "document-interpretation"]);
  assert.deepEqual(fiveQuestions.map(({ format }) => getActivityQuestionCategory(format)), ["document-interpretation", "multiple-choice", "short-answer", "document-interpretation", "short-answer"]);
  assert.deepEqual(sixQuestions.map(({ format }) => getActivityQuestionCategory(format)), ["document-interpretation", "multiple-choice", "short-answer", "document-interpretation", "short-answer", "multiple-choice"]);
  assert.equal(new Set(fiveQuestions.map(({ operationId }) => operationId)).size >= 3, true);
  assert.equal(fiveQuestions.some(({ format }) => format === "development-150"), false);
  assert.match(viewSource, /`\$\{currentQuestionNumber\} sur \$\{activityQuestionCount\}`/);
  assert.doesNotMatch(viewSource, /Question \$\{currentQuestionNumber\} sur \$\{eligibleQuestionCount\}/);
});

test("évite de répéter un document historique dans une même activité de révision lorsque la banque le permet", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  const questions = getActivityQuestionSelection({ ...baseConfig, questionCount: 8 }, catalog);
  const documentIds = questions.flatMap(({ historicalDocumentIds }) => historicalDocumentIds);
  assert.equal(questions.length, 8);
  assert.equal(new Set(documentIds).size, documentIds.length);
});

test("évite les répétitions entre pratiques sauf pour une révision de période", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  const config = { ...baseConfig, questionCount: 5 };
  const firstPractice = getActivityQuestionSelection(config, catalog);
  const secondPractice = getActivityQuestionSelection(config, catalog, firstPractice.map(({ id }) => id));
  assert.equal(firstPractice[0]?.format, "interactive-timeline");
  assert.equal(secondPractice.some(({ id }) => firstPractice.some((question) => question.id === id)), false);
  assert.notEqual(secondPractice[0]?.format, "interactive-timeline");
  const firstPeriodId = catalog.notions[0]?.periodId;
  const periodNotionIds = catalog.notions.filter(({ periodId }) => periodId === firstPeriodId).map(({ id }) => id);
  const periodReview = getActivityQuestionSelection({ ...config, notionIds: periodNotionIds }, catalog, firstPractice.map(({ id }) => id));
  assert.equal(periodReview[0]?.format, "interactive-timeline");
});

test("laisse Changer parcourir toute la banque admissible malgré la composition proposée", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  const fiveQuestionConfig = { ...baseConfig, questionCount: 5 };
  const eligible = getEligibleActivityQuestions(fiveQuestionConfig, catalog);
  const previews = Array.from({ length: eligible.length }, (_, variant) => createLocalActivityPreview(fiveQuestionConfig, catalog, variant));
  assert.equal(new Set(previews.map(({ questionId }) => questionId)).size, eligible.length);
  assert.equal(previews.some(({ format }) => format === "development-150"), false);
  assert.equal(previews.some(({ format }) => format === "interactive-timeline" || format === "interactive-association"), true);
});

test("génère un aperçu déterministe depuis les documents approuvés", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  const first = createLocalActivityPreview(unlimitedRevisionConfig, catalog);
  const second = createLocalActivityPreview(unlimitedRevisionConfig, catalog);
  assert.deepEqual(first, second);
  assert.deepEqual(first.documents.map(({ id }) => id), ["PAT-T-002", "PAT-T-003", "PAT-T-006"]);
  assert.equal(catalog.questions.length, 38);
  assert.equal(first.operationLabel, "Établir des liens de causalité");
  assert.equal(first.question, catalog.questions[0]?.prompt);
  assert.match(first.question, /réponse britannique.*Rébellions/);
  assert.match(first.guidance[0] ?? "", /^Bonjour,/);
  assert.equal(first.questionId, catalog.questions[0]?.id);
});

test("Socrato attend simplement la réponse pour toutes les réponses courtes", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  const shortAnswerIndexes = getEligibleActivityQuestions(unlimitedRevisionConfig, catalog)
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => question.format === "short-answer");
  assert.ok(shortAnswerIndexes.length > 0);
  for (const { index } of shortAnswerIndexes) {
    assert.equal(createLocalActivityPreview(unlimitedRevisionConfig, catalog, index).guidance[0], "J’attends ta réponse…");
  }
});

test("Socrato invite à consulter les sources pour toutes les interprétations de documents", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  const documentQuestionIndexes = getEligibleActivityQuestions(unlimitedRevisionConfig, catalog)
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => question.format === "document-interpretation");
  assert.ok(documentQuestionIndexes.length > 0);
  for (const { index } of documentQuestionIndexes) {
    assert.equal(createLocalActivityPreview(unlimitedRevisionConfig, catalog, index).guidance[0], "Bonjour, consulte les sources puis réponds à la question.");
  }
});

test("les boutons de navigation font circuler les questions approuvées et leurs documents", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  const first = createLocalActivityPreview(unlimitedRevisionConfig, catalog, 0);
  const second = createLocalActivityPreview(unlimitedRevisionConfig, catalog, 1);
  const selectedQuestion = catalog.questions.find(({ prompt }) => prompt === second.question);
  assert.notEqual(second.question, first.question);
  assert.ok(selectedQuestion);
  assert.equal(second.format, "interactive-timeline");
  assert.deepEqual(second.timelineInteraction, selectedQuestion.timelineInteraction);
  assert.equal(second.operationLabel, catalog.operations.find(({ id }) => id === selectedQuestion.operationId)?.label);
});

test("raccorde Russell et La Fontaine à leur question de comparaison", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  const eligibleQuestions = getEligibleActivityQuestions(unlimitedRevisionConfig, catalog);
  const index = eligibleQuestions.findIndex(({ id }) => id === "question:acte-union:document-interpretation-003");
  assert.ok(index >= 0);
  const preview = createLocalActivityPreview(unlimitedRevisionConfig, catalog, index);
  assert.deepEqual(preview.documents.map(({ id }) => id), ["AU-T-002", "historical-document:acte-union:lafontaine-terrebonne-1840"]);
  assert.deepEqual(preview.documents.map(({ authorLabel }) => authorLabel), ["Lord John Russell, ministre de l’Intérieur du Royaume-Uni", "Louis-Hippolyte La Fontaine"]);
});

test("raccorde les deux questions interactives à l’aperçu élève", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  const eligible = Array.from({ length: catalog.questions.length }, (_, variant) => createLocalActivityPreview(unlimitedRevisionConfig, catalog, variant));
  const timeline = eligible.find(({ format }) => format === "interactive-timeline");
  const association = eligible.find(({ format }) => format === "interactive-association");
  assert.equal(timeline?.timelineInteraction?.entries.length, 5);
  assert.equal(association?.associationInteraction?.items.length, 5);
  assert.match(studentPreviewSource, /preview\.format === "interactive-timeline" \? "interactive_timeline"/);
  assert.match(studentPreviewSource, /preview\.format === "interactive-association" \? "interactive_association"/);
  assert.match(studentPreviewSource, /timelineInteraction: preview\.timelineInteraction/);
  assert.match(studentPreviewSource, /associationInteraction: preview\.associationInteraction/);
  assert.match(viewSource, /className="student-page-preview"/);
  assert.match(viewSource, /<iframe[^>]*src=\{singlePreviewHref\}/);
  assert.match(studentPreviewSource, /<StudentLearningSessionView/);
  assert.match(studentPreviewFrameCssSource, /\.student-page-preview iframe/);
});

test("permet de fermer le test complet sans alourdir l’aperçu intégré", () => {
  assert.match(viewSource, /singlePreviewHref = `[^`]+&embedded=1`/);
  assert.match(studentPreviewSource, /teacherPreview=\{embedded !== "1" && published !== "1"\}/);
  assert.match(sessionViewSource, /Fermer l’aperçu/);
  assert.match(sessionViewSource, /window\.close\(\)/);
  assert.match(sessionViewSource, /window\.location\.assign\("\/teacher\/activities\/new"\)/);
  assert.match(studentPreviewCssSource, /\.teacher-preview-navigation \.teacher-preview-close/);
});

test("publie seulement une simulation locale et ferme le fournisseur en production", async () => {
  assert.equal(isLocalActivityCreatorEnabled("production"), false);
  await assert.rejects(() => new LocalActivityCreatorProvider("production").getCatalog(), /disabled in production/);
  assert.match(routeSource, /if \(!isLocalActivityCreatorEnabled\(\)\) notFound\(\)/);
  assert.doesNotMatch(providerSource + viewSource, /fetch\(|axios|openai|anthropic|prisma|supabase|firebase|indexedDB|sessionStorage/);
  assert.match(viewSource, /repository\.savePublishedActivity\(publishedActivity\)/);
  assert.doesNotMatch(viewSource.match(/function confirmLocalPublication[\s\S]*?\n  \}/)?.[0] ?? "", /window\.open|published=1/);
  assert.match(viewSource, /window\.location\.assign\(`\/teacher\?activity=\$\{encodeURIComponent\(publishedActivity\.id\)\}`\)/);
});

test("couvre accessibilité, thèmes et responsive sans défilement horizontal imposé", () => {
  assert.match(viewSource, /aria-live="polite"/);
  assert.match(viewSource, /aria-pressed=/);
  assert.match(viewSource, /aria-current="page"/);
  assert.match(viewSource, /className="student-view-link"[\s\S]*target="_blank"/);
  assert.match(cssSource, /data-theme="light"/);
  assert.match(cssSource, /focus-visible/);
  assert.match(cssSource, /min-height:44px/);
  assert.match(cssSource, /@media\(max-width:1180px\)/);
  assert.match(cssSource, /@media\(max-width:780px\)/);
  assert.match(cssSource, /@media\(max-width:520px\)/);
  assert.match(cssSource, /@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(cssSource, /overflow-x:scroll/);
});

test("reprend la palette partagée de l’espace enseignant", () => {
  assert.match(cssSource, /--creator-bg:#211b20;--creator-sidebar:#241020;--creator-panel:#2c252b/);
  assert.match(cssSource, /--creator-bg:#f3eee6;--creator-sidebar:#3a1934;--creator-panel:#fffdf9/);
  assert.match(cssSource, /--creator-text:#2b2229;--creator-muted:#71656d;--creator-coral:#6f315f;--creator-gold:#b27a25/);
});

test("harmonise le titre avec celui du tableau de bord enseignant", () => {
  assert.match(cssSource, /\.creator-header h1\{[^}]*font-family:Georgia,serif[^}]*font-size:clamp\(1\.55rem,1\.85vw,1\.75rem\)[^}]*font-weight:800[^}]*line-height:1\.05/);
});

test("renforce sobrement les boutons de groupes et de type de travail", () => {
  assert.match(cssSource, /\.work-types button,\.choice-chips button,\.all-groups\{[^}]*background:linear-gradient[^}]*font-weight:650[^}]*box-shadow/);
  assert.match(cssSource, /\.work-types button\[aria-pressed="true"\]\{[^}]*border-color:[^}]*background:linear-gradient[^}]*box-shadow/);
  assert.match(cssSource, /\.choice-chips button\[aria-pressed="true"\],\.all-groups\[aria-pressed="true"\]\{[^}]*background:linear-gradient[^}]*box-shadow/);
});

test("clarifie l’aperçu, la validation et la progression des champs", () => {
  assert.match(viewSource, /config\.notionIds\.length > 0/);
  assert.match(viewSource, /Aperçu identique à la séance d’apprentissage de l’élève/);
  assert.doesNotMatch(viewSource, /Vue élève réelle · sans le bandeau|student-page-preview__label/);
  assert.match(studentPreviewSource, /notions\?\.split\(","\)\.filter\(Boolean\)/);
  assert.match(studentPreviewSource, /questionNumber \?\? "1"/);
  assert.doesNotMatch(viewSource, /Composition variée prévue|question-mix-summary/);
  assert.doesNotMatch(viewSource, /Message de Socrato|className="socrato-guidance"/);
  assert.doesNotMatch(viewSource, /<p>\{preview\.instruction\}<\/p>/);
  assert.match(viewSource, /Aperçu/);
  assert.match(viewSource, /\/teacher\/activities\/new\/student-preview/);
  assert.match(viewSource, /questionIds=\$\{encodeURIComponent\(currentActivityQuestion\?\.id[^\n]*questionNumber=\$\{currentQuestionNumber\}/);
  assert.match(viewSource, /Question précédente/);
  assert.match(viewSource, /Question suivante/);
  assert.match(viewSource, /className="change-question"[^>]*>Changer</);
  assert.match(cssSource, /\.live-preview\{[^}]*height:100dvh[^}]*grid-template-rows:auto minmax\(0,1fr\) auto/);
  assert.doesNotMatch(cssSource, /\.live-preview\{[^}]*position:sticky/);
  assert.ok(viewSource.indexOf("Télécharger le fichier Word") < viewSource.indexOf("Tester l’activité complète comme un élève"));
  assert.ok(viewSource.indexOf("Tester l’activité complète comme un élève") < viewSource.indexOf("← Question précédente"));
  assert.ok(viewSource.indexOf("← Question précédente") < viewSource.indexOf(">Changer<"));
  assert.ok(viewSource.indexOf(">Changer<") < viewSource.indexOf("Question suivante →"));
  assert.ok(viewSource.indexOf("Question suivante →") < viewSource.indexOf(">Publier →</"));
  assert.doesNotMatch(viewSource, /Garder et passer à la suivante/);
  assert.match(cssSource, /\.live-preview \.creator-footer \.sequence-question-button\{[^}]*border:1px solid/);
  assert.match(viewSource, /className="publish-button" onClick=\{\(\) => setShowPublishReview\(true\)\}>Publier →<\/button>/);
  assert.doesNotMatch(viewSource, /className="publish-button" disabled=/);
  assert.doesNotMatch(viewSource, /Vérifier et publier|Dernière vérification/);
  assert.match(viewSource, /Publier cette activité/);
  assert.match(viewSource, /questions et les opérations laissées en mode aléatoire seront attribuées automatiquement/);
  assert.match(cssSource, /\.creator-footer \.publish-button,\.creator-footer\.is-pending>\.publish-button\{opacity:1/);
  assert.doesNotMatch(viewSource, /creator-footer-summary/);
  assert.match(viewSource, /creator-footer \$\{complete \? "is-ready" : "is-pending"\}/);
  assert.match(cssSource, /\.creator-footer\{position:static/);
  assert.doesNotMatch(viewSource, /className="preview-actions"/);
  assert.match(viewSource, /<footer className=\{`creator-footer[\s\S]*className="sequence-question-button"[\s\S]*<\/footer>\s*<\/section>/);
  assert.doesNotMatch(cssSource, /\.creator-footer\{position:sticky/);
});

test("télécharge l’activité configurée en Word depuis l’aperçu et la confirmation", () => {
  assert.equal(viewSource.match(/<WordIcon\/>/g)?.length, 2);
  assert.match(viewSource, /className="word-download" aria-label=/);
  assert.doesNotMatch(viewSource, /Voir cette question comme un élève/);
  assert.ok(viewSource.indexOf("Télécharger le fichier Word") < viewSource.indexOf("Tester l’activité complète comme un élève"));
  assert.match(viewSource, /Tester l’activité complète comme un élève/);
  assert.match(viewSource, /aria-disabled=\{activityQuestions\.length === 0\} href=\{activityQuestions\.length > 0 \? fullPreviewHref : "#"\}/);
  assert.doesNotMatch(viewSource, /complete && activityQuestions\.length > 0 \? fullPreviewHref/);
  assert.match(viewSource, /downloadActivityWord\(config, catalog, preview\)/);
  assert.match(wordExportSource, /application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/);
  assert.match(wordExportSource, /p\("Question", "Heading1"\)/);
  assert.match(wordExportSource, /Consignes d’accompagnement/);
  assert.match(wordExportSource, /p\("Documents", "Heading1"\)/);
  assert.match(wordExportSource, /population_table/);
  assert.match(wordExportSource, /historical_excerpt/);
  assert.match(wordExportSource, /historical_image/);
  assert.match(wordExportSource, /Activité créée avec Socrato/);
  assert.match(wordExportSource, /w:footerReference/);
  assert.match(wordExportSource, /w:fldCharType="begin"/);
  assert.match(wordExportSource, /w:top w:val="single" w:sz="8" w:color="6F315F"/);
  assert.match(wordExportSource, /socrato-logo-v2\.png/);
});

test("ajoute le bandeau historique à l’en-tête enseignant", () => {
  assert.match(cssSource, /\.creator-header\{[^}]*url\('\/images\/montrealfin1800\.png'\)/);
});

test("ne conserve aucune progression élève pendant un aperçu enseignant", () => {
  assert.match(studentPreviewSource, /persistProgress=\{published === "1"\}/);
  assert.match(sessionViewSource, /if \(persistProgress && progressReady\) void createConfiguredDataRepository\(window\.localStorage\)\.saveStudentProgress/);
  assert.match(sessionViewSource, /persistProgress && nextState\.summary/);
});

test("enregistre automatiquement le brouillon et le retire après publication", () => {
  assert.match(viewSource, /createConfiguredDataRepository\(window\.localStorage\)\.readActiveDraft\(catalog\)/);
  assert.match(viewSource, /createConfiguredDataRepository\(window\.localStorage\)\.saveDraft\(createTeacherActivityDraft\(config, questionOverrides, previewVariant\)\)/);
  assert.match(viewSource, /repository\.clearActiveDraft\(\)/);
  assert.match(activityDraftSource, /TEACHER_ACTIVITY_DRAFT_VERSION/);
  assert.match(viewSource, /if \(!draftReady \|\| !draftTouched\) return/);
});
