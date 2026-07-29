import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createLocalActivityPreview,
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

test("rend les trois cartes dans l’ordre et aucune étape numérotée", () => {
  const format = viewSource.indexOf("Quel format ?");
  const audience = viewSource.indexOf("À qui s’adresse l’activité ?");
  const work = viewSource.indexOf("Que voulez-vous travailler ?");
  assert.ok(format < audience && audience < work);
  assert.doesNotMatch(viewSource, />Configuration<|>Questions<|>Expérience élève|>Publication</);
  assert.match(viewSource, /Groupes[\s\S]*Espace enseignant[\s\S]*Créer une activité/);
});

test("sélectionne tous les groupes et Révision par défaut", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  assert.match(viewSource, /selectedGroupIds: catalog\.groups\.map/);
  assert.match(viewSource, /workType: "revision"/);
  assert.equal(catalog.groups.length, 7);
  assert.ok(catalog.groups.every(({ name }) => /fictif/.test(name)));
});

test("expose les trois types de travail et les sept opérations canoniques", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  assert.match(viewSource, /Révision/);
  assert.match(viewSource, /Enrichissement/);
  assert.match(viewSource, /Question à développement/);
  assert.equal(catalog.operations.length, 7);
});

test("rend le sélecteur déroulant de notions disponible dans tous les modes", () => {
  assert.match(viewSource, /<details className="notion-picker">/);
  assert.match(viewSource, /catalog\.notions\.map/);
  assert.match(viewSource, /config\.workType === "development" \? "radio" : "checkbox"/);
});

test("expose dans l’ordre les 56 rubriques de connaissances du programme ministériel", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  assert.equal(catalog.notions.length, 56);
  assert.deepEqual(catalog.notions.slice(0, 3).map(({ title }) => title), ["Acte d’Union", "Économie coloniale", "Gouvernement responsable"]);
  assert.deepEqual(catalog.notions.slice(-3).map(({ title }) => title), ["Dévitalisation de localités", "Relations internationales", "Ère de l’information"]);
});

test("applique les trois contrats de progression", () => {
  assert.equal(getProgressionMode({ durationMinutes: null, questionCount: 8 }), "fixed");
  assert.match(getProgressionCopy({ durationMinutes: null, questionCount: 8 }).help, /Toutes les questions/);
  assert.equal(getProgressionMode({ durationMinutes: 25, questionCount: null }), "timed");
  assert.doesNotMatch(getProgressionCopy({ durationMinutes: 25, questionCount: null }).navigation, /sur \d/);
  assert.equal(getProgressionMode({ durationMinutes: 25, questionCount: 8 }), "timed-capped");
  assert.equal(getProgressionCopy({ durationMinutes: 25, questionCount: 8 }).summary, "25 minutes · jusqu’à 8 questions");
  assert.equal(getProgressionMode({ durationMinutes: null, questionCount: null }), "incomplete");
});

test("propose toutes les durées et tous les nombres de questions demandés", () => {
  assert.match(viewSource, /const DURATION_OPTIONS = \[5, 10, 15, 20, 25, 30, 35, 40\]/);
  assert.match(viewSource, /Array\.from\(\{ length: 12 \}, \(_, index\) => index \+ 1\)/);
});

test("une question à développement exige exactement une notion et une opération", () => {
  const development = { ...baseConfig, workType: "development" as const, notionIds: [], operationId: null };
  assert.match(validateActivityConfiguration(development).notions ?? "", /exactement une notion/);
  assert.match(validateActivityConfiguration(development).operation ?? "", /opération intellectuelle/);
  assert.equal(isActivityConfigurationComplete(development), false);
  assert.match(viewSource, /config\.workType === "development" \? <option value="" disabled>Choisir une opération<\/option> : <option value="random">Aléatoire<\/option>/);
});

test("présente 150 mots comme cible souple sans validation quantitative", () => {
  assert.match(viewSource, /environ 150 mots/);
  assert.match(viewSource, /cible pédagogique est souple/);
  assert.doesNotMatch(viewSource, /wordCount|minWords|maxWords|split\([^)]*\)\.length/);
});

test("génère un aperçu déterministe depuis les documents approuvés", async () => {
  const catalog = await new LocalActivityCreatorProvider("test").getCatalog();
  const first = createLocalActivityPreview(baseConfig, catalog);
  const second = createLocalActivityPreview(baseConfig, catalog);
  assert.deepEqual(first, second);
  assert.equal(first.documents, catalog.documents);
  assert.equal(first.documents.length, 4);
  assert.match(first.question, /représentation égale/);
});

test("reste local, sans publication réelle, et ferme le fournisseur en production", async () => {
  assert.equal(isLocalActivityCreatorEnabled("production"), false);
  await assert.rejects(() => new LocalActivityCreatorProvider("production").getCatalog(), /disabled in production/);
  assert.match(routeSource, /if \(!isLocalActivityCreatorEnabled\(\)\) notFound\(\)/);
  assert.doesNotMatch(providerSource + viewSource, /fetch\(|axios|openai|anthropic|prisma|supabase|firebase|indexedDB|localStorage|sessionStorage/);
  assert.match(viewSource, /aucune activité n’a été publiée/);
});

test("couvre accessibilité, thèmes et responsive sans défilement horizontal imposé", () => {
  assert.match(viewSource, /aria-live="polite"/);
  assert.match(viewSource, /aria-pressed=/);
  assert.match(viewSource, /aria-current="page"/);
  assert.match(viewSource, /aria-disabled="true" title="Fonction à venir"/);
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

test("clarifie l’aperçu, la validation et la progression des champs", () => {
  assert.match(viewSource, /config\.notionIds\.length > 0/);
  assert.match(viewSource, /Question proposée/);
  assert.match(viewSource, /Brouillon/);
  assert.match(viewSource, /Accompagnement Socrato/);
  assert.match(viewSource, /Proposer une autre question/);
  assert.match(viewSource, /creator-footer \$\{complete \? "is-ready" : "is-pending"\}/);
  assert.match(cssSource, /\.creator-footer\{position:static/);
  assert.doesNotMatch(cssSource, /\.creator-footer\{position:sticky/);
});

test("ajoute le bandeau historique à l’en-tête enseignant", () => {
  assert.match(cssSource, /\.creator-header\{[^}]*url\('\/images\/montrealfin1800\.png'\)/);
});
