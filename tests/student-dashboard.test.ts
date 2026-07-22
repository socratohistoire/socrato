import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { loadAuthorizedStudentDashboard } from "../lib/student-dashboard/access.ts";
import {
  createDemoStudentDashboard,
  DEMO_INTELLECTUAL_OPERATIONS,
} from "../lib/student-dashboard/demo-provider.ts";
import {
  DASHBOARD_LABELS,
  getActivityActionLabel,
  getActivityCardLabel,
  getActivityOriginLabel,
  getActivityTitle,
  hasNotebookResource,
  PROGRESS_STATUS_LABELS,
} from "../lib/student-dashboard/presentation.ts";
import { presentIntellectualOperations } from "../lib/student-dashboard/operation-presentation.ts";
import { presentHistoricalKnowledge } from "../lib/student-dashboard/knowledge-presentation.ts";
import {
  ACTE_UNION_HISTORICAL_KNOWLEDGE,
  ACTE_UNION_NOTION_ID,
  getHistoricalKnowledgeForNotion,
  type HistoricalKnowledgeCatalog,
} from "../lib/student-dashboard/historical-knowledge-catalog.ts";
import type { StudentDashboardProvider } from "../lib/student-dashboard/provider.ts";
import {
  getKnowledgeScrollState,
  getNextKnowledgeScrollTop,
} from "../lib/student-dashboard/knowledge-scroll.ts";
import { getHistoricalPeriodLabel } from "../lib/student-dashboard/historical-period.ts";
import {
  getDashboardUrl,
  getNotionDashboardUrl,
  getSelectedNotionContext,
  resolveDashboardMode,
} from "../lib/student-dashboard/selection.ts";
import type { StudentDashboardData } from "../lib/student-dashboard/types.ts";
import type {
  StudentSession,
  StudentSessionRepository,
} from "../lib/student-access/session.ts";

class TestSessions implements StudentSessionRepository {
  constructor(private readonly active: boolean) {}

  async create(): Promise<StudentSession> {
    throw new Error("Not used in dashboard tests.");
  }

  async findActiveByToken(token: string): Promise<StudentSession | null> {
    return this.active && token === "valid-session"
      ? {
          token,
          anonymousStudentId: "anonymous-test-student",
          credentialId: "credential-test",
          expiresAt: new Date("2099-01-01T00:00:00.000Z"),
        }
      : null;
  }
}

class TestProvider implements StudentDashboardProvider {
  constructor(private readonly data: StudentDashboardData) {}
  async getForAnonymousStudent(): Promise<StudentDashboardData> {
    return this.data;
  }
}

test("une session absente ou invalide exige la redirection", async () => {
  const provider = new TestProvider(createDemoStudentDashboard());
  assert.equal(
    await loadAuthorizedStudentDashboard(undefined, new TestSessions(true), provider),
    null,
  );
  assert.equal(
    await loadAuthorizedStudentDashboard("invalid", new TestSessions(false), provider),
    null,
  );
});

test("une session valide charge les données affichées du tableau de bord", async () => {
  const data = await loadAuthorizedStudentDashboard(
    "valid-session",
    new TestSessions(true),
    new TestProvider(createDemoStudentDashboard()),
  );
  assert.ok(data);
  assert.equal(DASHBOARD_LABELS.title, "Mon tableau de bord");
  assert.equal(data.source, "local_demo");
});

test("expose exactement les sept opérations approuvées sans C1 ni C2", () => {
  const operations = getSelectedNotionContext(createDemoStudentDashboard()).operations;
  assert.equal(operations.length, 7);
  assert.deepEqual(
    operations.map(({ id, label }) => ({ id, label })),
    [...DEMO_INTELLECTUAL_OPERATIONS],
  );
  assert.equal(operations.some(({ label }) => /\bC[12]\b/.test(label)), false);
});

test("présente un bouton Retravailler pour chacune des sept opérations", () => {
  const presented = presentIntellectualOperations(
    getSelectedNotionContext(createDemoStudentDashboard()).operations,
  );
  assert.equal(presented.length, 7);
  assert.equal(
    presented.filter(({ reviewLabel }) => reviewLabel === "Retravailler").length,
    7,
  );
});

test("conserve le bouton pour une opération maîtrisée", () => {
  const mastered = presentIntellectualOperations(
    getSelectedNotionContext(createDemoStudentDashboard()).operations,
  ).find(({ status }) => status === "mastered");
  assert.ok(mastered);
  assert.equal(mastered.reviewLabel, "Retravailler");
});

test("conserve toujours le statut sous forme textuelle", () => {
  const presented = presentIntellectualOperations(
    getSelectedNotionContext(createDemoStudentDashboard()).operations,
  );
  assert.equal(presented.every(({ statusLabel }) => statusLabel.length > 0), true);
  assert.deepEqual(
    new Set(presented.map(({ statusLabel }) => statusLabel)),
    new Set(["Maîtrisée", "À consolider", "À travailler", "Non travaillée"]),
  );
});

test("rend disponibles les quatre statuts de progression", () => {
  assert.deepEqual(new Set(Object.values(PROGRESS_STATUS_LABELS)), new Set([
    "Maîtrisée",
    "À consolider",
    "À travailler",
    "Non travaillée",
  ]));
});

test("présente un bouton pour chaque connaissance, y compris maîtrisée", () => {
  const presented = presentHistoricalKnowledge(
    getSelectedNotionContext(createDemoStudentDashboard()).historicalKnowledge,
  );
  assert.equal(presented.length, 12);
  assert.equal(
    presented.every(({ reviewLabel }) => reviewLabel === "Retravailler"),
    true,
  );
  assert.equal(
    presented.find(({ status }) => status === "mastered")?.reviewLabel,
    "Retravailler",
  );
});

test("conserve exactement les douze connaissances approuvées dans leur ordre", () => {
  assert.deepEqual(
    ACTE_UNION_HISTORICAL_KNOWLEDGE.map(({ label }) => label),
    [
      "Rébellions de 1837-1838",
      "Contexte de l’Acte d’union",
      "Causes de l’Acte d’union",
      "Objectifs de l’Acte d’union",
      "Rapport Durham",
      "Acte d’union",
      "Création de la Province du Canada (union du Haut-Canada et du Bas-Canada)",
      "Populations du Bas-Canada et du Haut-Canada",
      "Représentation égale des deux Canadas",
      "Structure des institutions politiques",
      "L’anglais comme langue officielle",
      "Conséquences de l’Acte d’union",
    ],
  );
});

test("utilise douze identifiants uniques rattachés à l’Acte d’union", () => {
  assert.equal(ACTE_UNION_HISTORICAL_KNOWLEDGE.length, 12);
  assert.equal(
    new Set(ACTE_UNION_HISTORICAL_KNOWLEDGE.map(({ id }) => id)).size,
    12,
  );
  assert.equal(
    ACTE_UNION_HISTORICAL_KNOWLEDGE.every(
      ({ notionId }) => notionId === ACTE_UNION_NOTION_ID,
    ),
    true,
  );
});

test("ne contient plus les anciennes connaissances temporaires", () => {
  assert.equal(
    ACTE_UNION_HISTORICAL_KNOWLEDGE.some(({ label }) =>
      label.startsWith("Connaissance de démonstration"),
    ),
    false,
  );
});

test("permet d’ajouter une autre notion par les seules données", () => {
  const catalog: HistoricalKnowledgeCatalog = {
    [ACTE_UNION_NOTION_ID]: ACTE_UNION_HISTORICAL_KNOWLEDGE,
    "notion-future": [
      {
        id: "connaissance-future",
        notionId: "notion-future",
        label: "Connaissance future validée",
      },
    ],
  };
  assert.equal(getHistoricalKnowledgeForNotion(catalog, "notion-future").length, 1);
  assert.equal(getHistoricalKnowledgeForNotion(catalog, "inconnue").length, 0);
});

test("décrit un état Cahier vide sans ressource ouvrable", () => {
  const context = getSelectedNotionContext(createDemoStudentDashboard());
  assert.equal(context.notebookRecommendation, null);
  assert.equal(hasNotebookResource(context.notebookRecommendation), false);
});

test("décrit proprement l’absence d’activité publiée", () => {
  assert.equal(getActivityTitle(null), "Aucune activité publiée");
});

test("accepte une troisième notion par les seules données", () => {
  const data = createDemoStudentDashboard();
  data.notions.push({
    id: "future-notion",
    title: "Notion future validée",
    description: "Entrée de test injectée par les données.",
    historicalPeriod: { displayLabel: "Période future validée" },
  });
  assert.equal(data.notions.length, 3);
  assert.equal(data.notions.at(-1)?.title, "Notion future validée");
});

test("sélectionne l’Acte d’union par défaut avec ses douze connaissances", () => {
  const data = createDemoStudentDashboard();
  const context = getSelectedNotionContext(data);
  assert.equal(data.selectedNotionId, ACTE_UNION_NOTION_ID);
  assert.equal(context.notionId, ACTE_UNION_NOTION_ID);
  assert.equal(context.historicalKnowledge.length, 12);
});

test("rend l’activité et la progression des opérations contextuelles", () => {
  const data = createDemoStudentDashboard();
  const acteUnion = getSelectedNotionContext(data, ACTE_UNION_NOTION_ID);
  const industrialisation = getSelectedNotionContext(data, "industrialisation");

  assert.notEqual(acteUnion.activity?.title, industrialisation.activity?.title);
  assert.notDeepEqual(
    acteUnion.operations.map(({ status }) => status),
    industrialisation.operations.map(({ status }) => status),
  );
});

test("conserve l’industrialisation sans connaissance historique inventée", () => {
  const data = createDemoStudentDashboard("industrialisation");
  const context = getSelectedNotionContext(data);
  assert.equal(data.selectedNotionId, "industrialisation");
  assert.equal(context.historicalKnowledge.length, 0);
  assert.equal(context.notebookRecommendation, null);
  assert.match(context.recommendationEmptyMessage, /ajoutées ultérieurement/);
});

test("persiste la notion dans l’URL et la restaure au rechargement", () => {
  assert.equal(
    getNotionDashboardUrl("industrialisation"),
    "/eleve/tableau-de-bord?mode=notion-review&notion=industrialisation#tableau-notion",
  );
  const reloaded = createDemoStudentDashboard("industrialisation", "notion-review");
  assert.equal(reloaded.selectedNotionId, "industrialisation");
  assert.equal(reloaded.selectedMode, "notion-review");
  assert.equal(getSelectedNotionContext(reloaded).notionId, "industrialisation");
});

test("rend les deux notions disponibles comme de vrais liens Next.js", () => {
  const source = readFileSync(
    new URL(
      "../app/eleve/tableau-de-bord/dashboard-view.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /<Link[\s\S]*?href=\{getNotionDashboardUrl\(notion\.id\)\}/);
  assert.match(source, /aria-current=\{notion\.id === selectedNotionId \? "page"/);
  assert.doesNotMatch(source, /<button[\s\S]*?Réviser cette notion/);
  assert.doesNotMatch(source, /preventDefault|disabled=/);
  assert.equal(
    getNotionDashboardUrl(ACTE_UNION_NOTION_ID),
    "/eleve/tableau-de-bord?mode=notion-review&notion=acte-union#tableau-notion",
  );
  assert.equal(
    getNotionDashboardUrl("industrialisation"),
    "/eleve/tableau-de-bord?mode=notion-review&notion=industrialisation#tableau-notion",
  );
});

test("la navigation serveur produit les contenus propres à chaque URL", () => {
  const acteUnion = createDemoStudentDashboard("acte-union");
  const industrialisation = createDemoStudentDashboard("industrialisation");
  const acteUnionContext = getSelectedNotionContext(acteUnion);
  const industrialisationContext = getSelectedNotionContext(industrialisation);

  assert.equal(acteUnionContext.activity?.title, "Acte d’union");
  assert.equal(acteUnionContext.historicalKnowledge.length, 12);
  assert.equal(industrialisationContext.activity?.title, "Industrialisation");
  assert.equal(industrialisationContext.historicalKnowledge.length, 0);
});

test("distingue une activité enseignante d’une révision choisie", () => {
  const teacherActivity = getSelectedNotionContext(
    createDemoStudentDashboard("acte-union", "teacher-assigned"),
  ).activity;
  const selectedActivity = getSelectedNotionContext(
    createDemoStudentDashboard("industrialisation", "notion-review"),
  ).activity;

  assert.ok(teacherActivity);
  assert.ok(selectedActivity);
  assert.equal(teacherActivity.origin, "teacher_assigned");
  assert.equal(teacherActivity.title, "Acte d’union");
  assert.equal(getActivityCardLabel(teacherActivity), "Activité de révision");
  assert.equal(getActivityOriginLabel(teacherActivity), "Assignée par ton enseignant");
  assert.equal(getActivityActionLabel(teacherActivity), "Poursuivre l’activité");
  assert.equal(teacherActivity.isNew, true);

  assert.equal(selectedActivity.origin, "student_selected");
  assert.equal(selectedActivity.title, "Industrialisation");
  assert.equal(selectedActivity.progressPercent, 0);
  assert.equal(getActivityCardLabel(selectedActivity), "Révision par notion");
  assert.equal(getActivityOriginLabel(selectedActivity), "Choisie par toi");
  assert.equal(getActivityActionLabel(selectedActivity), "Commencer l’activité");
  assert.equal(selectedActivity.isNew, false);
});

test("conserve le mode dans l’URL et replie un mode inconnu vers l’activité enseignante", () => {
  assert.equal(
    getDashboardUrl("acte-union", "teacher-assigned"),
    "/eleve/tableau-de-bord?mode=teacher-assigned&notion=acte-union#tableau-notion",
  );
  assert.equal(resolveDashboardMode("mode-inconnu"), "teacher-assigned");
  assert.equal(
    createDemoStudentDashboard("acte-union", "mode-inconnu").selectedMode,
    "teacher-assigned",
  );
});

test("ne présente aucun texte local temporaire dans la carte d’activité", () => {
  const source = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard-view.tsx", import.meta.url),
    "utf8",
  );
  const activities = [
    getSelectedNotionContext(createDemoStudentDashboard()).activity,
    getSelectedNotionContext(
      createDemoStudentDashboard("industrialisation", "notion-review"),
    ).activity,
  ];
  assert.equal(activities.some((activity) => /démonstration locale/i.test(activity?.title ?? "")), false);
  assert.doesNotMatch(source, /Poursuis ton activité là où tu l’as laissée/);
});

test("déclare deux variantes visuelles distinctes pour la carte principale", () => {
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /\.activity-card-teacher-assigned/);
  assert.match(css, /\.activity-card-student-selected/);
});

test("place l’assignation enseignante une seule fois dans un bandeau accessible", () => {
  const source = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard-view.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /teacher-assigned-banner[\s\S]*?role="note"/);
  assert.match(source, /teacher-assigned-star[\s\S]*?★/);
  const start = source.indexOf("function ActiveRevisionCard");
  const end = source.indexOf("function NotebookCard");
  const activityCard = source.slice(start, end);
  assert.equal(activityCard.match(/Assignée par ton enseignant/g)?.length, 1);
  assert.match(source, /activity && !isStudentSelected/);
  assert.match(source, /activity && isStudentSelected/);
});

test("réserve la bordure et la lueur chaude à la grande carte enseignante", () => {
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.match(
    css,
    /\.activity-card-teacher-assigned\s*\{[^}]*border:\s*3px solid #e0a23f[^}]*box-shadow:[^}]*rgba\(222,154,48/,
  );
  assert.match(css, /\.activity-card-teacher-assigned:hover, \.activity-card-teacher-assigned:focus-within/);
  assert.doesNotMatch(
    css,
    /\.activity-card-student-selected\s*\{[^}]*rgba\(212,154,62/,
  );
});

test("retombe sans erreur sur la notion par défaut pour un identifiant inconnu", () => {
  const data = createDemoStudentDashboard("notion-inconnue");
  assert.equal(data.selectedNotionId, ACTE_UNION_NOTION_ID);
  assert.equal(getSelectedNotionContext(data).notionId, ACTE_UNION_NOTION_ID);
});

test("limite la liste des connaissances sur grand écran et la libère sur tablette", () => {
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /\.dashboard-progress-section\s*\{[^}]*--progress-panel-height:\s*360px/);
  assert.match(css, /\.dashboard-progress-section > section\s*\{[^}]*height:\s*var\(--progress-panel-height\)/);
  assert.match(css, /\.knowledge-scroll-shell\s*\{[^}]*flex:\s*1/);
  assert.match(css, /\.knowledge-list\s*\{[\s\S]*?height:\s*100%/);
  assert.match(css, /\.knowledge-list\s*\{[\s\S]*?overflow-y:\s*scroll/);
  assert.match(
    css,
    /@media \(max-width:\s*1120px\)[\s\S]*?\.dashboard-progress-section > section\s*\{[^}]*height:\s*auto/,
  );
});

test("affiche les titres de notion en majuscules sans modifier les données", () => {
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  const data = createDemoStudentDashboard();
  assert.equal(getSelectedNotionContext(data).activity?.title, "Acte d’union");
  assert.equal(
    getSelectedNotionContext(
      createDemoStudentDashboard("industrialisation", "notion-review"),
    ).activity?.title,
    "Industrialisation",
  );
  assert.match(css, /\.activity-copy h2\s*\{[^}]*font-weight:\s*800[^}]*text-transform:\s*uppercase/);
});

test("hiérarchise l’en-tête des connaissances sans préfixe de sélection", () => {
  const source = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard-view.tsx", import.meta.url),
    "utf8",
  );
  const start = source.indexOf("function KnowledgeCollection");
  const end = source.indexOf("function KnowledgeStatusIcon");
  const knowledgeSection = source.slice(start, end);
  const headingPosition = knowledgeSection.indexOf("DASHBOARD_LABELS.knowledge");
  const notionPosition = knowledgeSection.indexOf('className="knowledge-notion-title"');

  assert.ok(headingPosition >= 0);
  assert.ok(notionPosition > headingPosition);
  assert.doesNotMatch(knowledgeSection, /Notion sélectionnée/);
  assert.match(knowledgeSection, /knowledge-notion-title">\{context\}/);
});

test("utilise le même grand titre et le même trait décoratif dans les deux colonnes", () => {
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /\.section-heading h2\s*\{[^}]*font-size:\s*24px/);
  assert.match(css, /\.section-heading > span\s*\{[^}]*background:\s*var\(--gold\)/);
  assert.match(css, /#operations > \.section-heading h2, #connaissances > \.section-heading h2\s*\{[^}]*text-transform:\s*uppercase/);
  assert.doesNotMatch(css, /\.knowledge-notion-title\s*\{[^}]*text-transform:\s*uppercase/);
});

test("retire le compte et l’instruction sous le nom de la notion", () => {
  const source = readFileSync(
    new URL(
      "../app/eleve/tableau-de-bord/knowledge-scroll-region.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /knowledge-count|Fais défiler pour voir la suite/);
  assert.doesNotMatch(source, /\{total\}.*connaissance/);
  assert.match(source, /Voir les autres connaissances/);
});

test("agrandit le bandeau enseignant tout en conservant sa sémantique informative", () => {
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  const source = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard-view.tsx", import.meta.url),
    "utf8",
  );
  assert.match(css, /\.teacher-assigned-banner\s*\{[^}]*border:\s*2px[^}]*padding:\s*9px 13px[^}]*font-size:\s*11px[^}]*font-weight:\s*850/);
  assert.match(css, /\.teacher-assigned-star\s*\{[^}]*font-size:\s*17px/);
  assert.match(source, /teacher-assigned-banner" role="note"/);
  assert.doesNotMatch(source, /<button[^>]*teacher-assigned-banner/);
});

test("calcule dynamiquement le total des connaissances de la notion", () => {
  const acteUnion = getSelectedNotionContext(createDemoStudentDashboard());
  const industrialisation = getSelectedNotionContext(
    createDemoStudentDashboard("industrialisation", "notion-review"),
  );
  assert.equal(acteUnion.historicalKnowledge.length, 12);
  assert.equal(industrialisation.historicalKnowledge.length, 0);
});

test("détecte le débordement, la fin et le retour vers le haut", () => {
  assert.deepEqual(getKnowledgeScrollState(0, 294, 504), {
    hasOverflow: true,
    isAtEnd: false,
  });
  assert.deepEqual(getKnowledgeScrollState(210, 294, 504), {
    hasOverflow: true,
    isAtEnd: true,
  });
  assert.deepEqual(getKnowledgeScrollState(80, 294, 504), {
    hasOverflow: true,
    isAtEnd: false,
  });
  assert.deepEqual(getKnowledgeScrollState(0, 294, 250), {
    hasOverflow: false,
    isAtEnd: true,
  });
});

test("fait avancer la liste d’environ une hauteur sans dépasser la fin", () => {
  assert.equal(getNextKnowledgeScrollTop(0, 294, 700), 258.72);
  assert.equal(getNextKnowledgeScrollTop(390, 294, 700), 406);
});

test("rend un véritable bouton clavier uniquement lorsqu’il reste du contenu", () => {
  const source = readFileSync(
    new URL(
      "../app/eleve/tableau-de-bord/knowledge-scroll-region.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /<button[\s\S]*?type="button"[\s\S]*?aria-label="Voir les autres connaissances"/);
  assert.match(source, />Voir les autres connaissances</);
  assert.equal(source.match(/<path d="m7 (?:3|10) 5 5 5-5"/g)?.length, 2);
  assert.match(source, /hasOverflow && !isAtEnd/);
  assert.match(source, /Toutes les connaissances sont affichées/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(source, /preventDefault/);
});

test("présente le contrôle comme une zone fondue sans bouton encadré", () => {
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.match(
    css,
    /\.knowledge-scroll-more\s*\{[^}]*right:\s*11px[^}]*left:\s*0[^}]*border:\s*0[^}]*border-radius:\s*15px[^}]*background:\s*linear-gradient/,
  );
  assert.match(css, /\.knowledge-scroll-more:focus-visible/);
  assert.match(css, /@media \(max-width:\s*1120px\)[\s\S]*?\.knowledge-scroll-more[^}]*display:\s*none/);
});

test("expose les titres structurants requis", () => {
  assert.equal(DASHBOARD_LABELS.activity, "Activité de révision");
  assert.equal(DASHBOARD_LABELS.notions, "Réviser par notion");
  assert.equal(
    DASHBOARD_LABELS.knowledge,
    "Connaissances historiques",
  );
  assert.equal(DASHBOARD_LABELS.teacherPractices, "Pratiques de l’enseignant");
  assert.equal(
    DASHBOARD_LABELS.recommendations,
    "Recommandations de Socrato",
  );
  assert.notEqual(DASHBOARD_LABELS.recommendations, "Cahier");
});

test("utilise le titre corrigé au pluriel sans ancienne variante", () => {
  const source = readFileSync(
    new URL("../lib/student-dashboard/presentation.ts", import.meta.url),
    "utf8",
  );
  assert.equal(DASHBOARD_LABELS.knowledge, "Connaissances historiques");
  assert.doesNotMatch(source, /Connaissances abordées dans cette notion|Connaissance historique"/);
});

test("conserve le slug technique tout en appliquant la graphie Acte d’union", () => {
  assert.equal(ACTE_UNION_NOTION_ID, "acte-union");
  const visibleLabels = [
    getSelectedNotionContext(createDemoStudentDashboard()).activity?.title ?? "",
    ...ACTE_UNION_HISTORICAL_KNOWLEDGE.map(({ label }) => label),
  ];
  assert.equal(visibleLabels.some((label) => label.includes("Acte d’Union")), false);
  assert.equal(visibleLabels.some((label) => label.includes("Acte d’union")), true);
});

test("compacte les connaissances et garde les recommandations secondaires", () => {
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /\.knowledge-row\s*\{[^}]*min-height:\s*38px[^}]*gap:\s*8px[^}]*padding:\s*0/);
  assert.match(css, /\.knowledge-review-button\s*\{[^}]*min-height:\s*32px/);
  assert.match(css, /\.notebook-card\s*\{[^}]*border:\s*1px solid rgba\(190,151,87,.64\)/);
  assert.match(css, /\.activity-card-teacher-assigned\s*\{[^}]*border:\s*3px solid/);
});

test("affiche l’en-tête illustré des recommandations sur deux lignes", () => {
  const source = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard-view.tsx", import.meta.url),
    "utf8",
  );
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.equal(DASHBOARD_LABELS.recommendations, "Recommandations de Socrato");
  assert.match(source, /notebook-compass[\s\S]*?aria-hidden="true"[\s\S]*?<svg/);
  assert.match(source, /<span>RECOMMANDATIONS<\/span>[\s\S]*?<span>DE SOCRATO<\/span>/);
  assert.match(css, /\.notebook-kicker\s*\{[^}]*flex-direction:\s*column[^}]*font-size:\s*clamp\(16px,1\.55vw,21px\)/);
});

test("conserve l’état vide et son illustration décorative vectorielle", () => {
  const source = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard-view.tsx", import.meta.url),
    "utf8",
  );
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.match(source, /<h3>Aucune page recommandée<\/h3>[\s\S]*?<p>\{emptyMessage\}<\/p>[\s\S]*?<NotebookEmptyIllustration/);
  assert.match(source, /function NotebookEmptyIllustration[\s\S]*?aria-hidden="true"/);
  assert.match(source, /notebook-pages[\s\S]*?notebook-particles/);
  assert.match(css, /\.notebook-card\s*\{[^}]*border-radius:\s*22px[^}]*radial-gradient/);
  assert.match(css, /\.notebook-empty-illustration\s*\{[^}]*left:\s*50%[^}]*transform:\s*translateX\(-50%\)/);
});

test("centre le titre de page indépendamment des blocs latéraux", () => {
  const source = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard-view.tsx", import.meta.url),
    "utf8",
  );
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.match(source, /dashboard-hero-content/);
  assert.match(css, /\.dashboard-hero-content\s*\{[^}]*position:\s*relative/);
  assert.match(css, /\.hero-title-block\s*\{[^}]*position:\s*absolute[^}]*left:\s*50%[^}]*transform:\s*translateX\(-50%\)/);
  assert.match(css, /@media \(max-width:\s*620px\)[\s\S]*?\.hero-title-block\s*\{[^}]*bottom:\s*14px[^}]*transform:\s*none/);
});

test("sépare les recommandations avec une ligne et un losange sans renforcer leur contour", () => {
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /\.notebook-divider\s*\{[^}]*height:\s*1px[^}]*linear-gradient/);
  assert.match(css, /\.notebook-divider > span\s*\{[^}]*transform:\s*translate\(-50%,-50%\) rotate\(45deg\)/);
  assert.match(css, /\.notebook-card\s*\{[^}]*border:\s*1px solid/);
  assert.doesNotMatch(css, /\.activity-card-student-selected\s*\{[^}]*0 0 29px|\.notebook-card\s*\{[^}]*0 0 29px/);
});

test("calcule la période historique des deux notions depuis les données", () => {
  const data = createDemoStudentDashboard();
  assert.deepEqual(
    data.notions.map(({ historicalPeriod }) =>
      getHistoricalPeriodLabel(historicalPeriod),
    ),
    ["1840–1896", "1840–1896"],
  );
  assert.equal(
    getHistoricalPeriodLabel({ displayLabel: "Périodes multiples validées" }),
    "Périodes multiples validées",
  );
  assert.equal(getHistoricalPeriodLabel(), null);
});

test("affiche la période dans les trois familles de cartes sans date codée dans le JSX", () => {
  const source = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard-view.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /className="activity-period">\{periodLabel\}/);
  assert.match(source, /className="notion-card-period"[\s\S]*?getHistoricalPeriodLabel\(notion\.historicalPeriod\)/);
  assert.match(source, /className="teacher-practice-period">\{periodLabel\}/);
  assert.doesNotMatch(source, /1840[–-]1896|1840 à 1896/);
});

test("rend la pratique enseignante illustrée, prioritaire et navigable", () => {
  const data = createDemoStudentDashboard();
  const practice = data.teacherPractices[0];
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.equal(practice.notionId, ACTE_UNION_NOTION_ID);
  assert.equal(practice.title, "Acte d’union");
  assert.equal(practice.progressPercent, 35);
  assert.equal(
    getDashboardUrl(practice.notionId!, "teacher-assigned"),
    "/eleve/tableau-de-bord?mode=teacher-assigned&notion=acte-union#tableau-notion",
  );
  assert.match(css, /\.teacher-practice-image\s*\{[^}]*object-fit:\s*cover/);
  assert.match(css, /\.teacher-practice-card\s*\{[^}]*min-height:\s*165px[^}]*border:\s*3px solid/);
  assert.match(css, /\.teacher-practice-action\s*\{[^}]*margin-top:\s*auto/);
});

test("centralise la palette parchemin du mode clair", () => {
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  const expectedVariables = [
    ["light-page", "#f4efe6"],
    ["light-surface", "#fffdf8"],
    ["light-surface-secondary", "#e8eef0"],
    ["light-text", "#102c45"],
    ["light-text-secondary", "#5d6973"],
    ["light-gold", "#b8873b"],
    ["light-border", "#c9b184"],
    ["light-mastered", "#287a55"],
    ["light-consolidate", "#a96100"],
    ["light-work", "#b6403a"],
    ["light-not-started", "#687581"],
  ];
  for (const [name, value] of expectedVariables) {
    assert.match(css, new RegExp(`--${name}: ${value}`));
  }
});

test("applique la palette claire à toutes les sections sans altérer le bloc sombre", () => {
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /\[data-theme="light"\] \.dashboard-hero-overlay/);
  assert.match(css, /\[data-theme="light"\] \.activity-card-teacher-assigned/);
  assert.match(css, /\[data-theme="light"\] \.activity-card-student-selected/);
  assert.match(css, /\[data-theme="light"\] \.notebook-card/);
  assert.match(css, /\[data-theme="light"\] \.operation-status-mastered/);
  assert.match(css, /\[data-theme="light"\] \.knowledge-scroll-more/);
  assert.match(css, /\[data-theme="light"\] \.notion-card-overlay/);
  assert.match(css, /\[data-theme="light"\] \.teacher-practice-overlay/);
  assert.match(css, /\[data-theme="light"\] \.theme-option-light/);
  assert.match(css, /\[data-theme="dark"\] \.student-dashboard\s*\{[\s\S]*?--page:\s*#071725[\s\S]*?--navy:\s*#061725/);
});

test("assombrit uniquement les cartes ciblées dans le mode clair", () => {
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /\[data-theme="light"\] \.activity-card-teacher-assigned\s*\{[^}]*linear-gradient\(145deg, #123451, #071d31\)/);
  assert.match(css, /\[data-theme="light"\] \.activity-card-student-selected\s*\{[^}]*linear-gradient\(145deg, #29475c, #183549\)/);
  assert.match(css, /\[data-theme="light"\] \.notion-card-overlay\s*\{[^}]*rgba\(7,29,49,.94\)/);
  assert.match(css, /\[data-theme="light"\] \.teacher-practice-overlay\s*\{[^}]*rgba\(5,27,45,.96\)/);
  assert.match(css, /\[data-theme="light"\] \.activity-card-teacher-assigned \.progress-ring-center\s*\{[^}]*color:\s*#fff8e9/);
  assert.match(css, /\[data-theme="light"\] \.activity-card-student-selected \.primary-action\s*\{[^}]*background:\s*#e8eef0/);
});

test("préserve la hiérarchie claire entre activité, notions et recommandations", () => {
  const css = readFileSync(
    new URL("../app/eleve/tableau-de-bord/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /\[data-theme="light"\] \.activity-card-teacher-assigned\s*\{[^}]*0 0 30px rgba\(184,135,59,.42\)/);
  assert.match(css, /\[data-theme="light"\] \.activity-card-student-selected\s*\{[^}]*box-shadow:\s*0 13px 28px/);
  assert.match(css, /\[data-theme="light"\] \.notebook-card\s*\{[^}]*var\(--light-surface\)[^}]*var\(--light-surface-secondary\)/);
  assert.doesNotMatch(css, /\[data-theme="light"\] \.notebook-card\s*\{[^}]*0 0 30px/);
});
