import type { StudentDashboardProvider } from "./provider.ts";
import type { ProgressStatus, StudentActivity, StudentDashboardData } from "./types.ts";
import { ACTE_UNION_HISTORICAL_KNOWLEDGE, ACTE_UNION_NOTION_ID } from "./historical-knowledge-catalog.ts";
import { getActivityDashboardUrl, getLearningSessionUrl, resolveSelectedActivityId } from "./selection.ts";

export const DEMO_INTELLECTUAL_OPERATIONS = [
  { id: "establish_facts", label: "Établir des faits" },
  { id: "causes_and_consequences", label: "Déterminer des causes et des conséquences" },
  { id: "time_and_space", label: "Situer dans le temps et dans l’espace" },
  { id: "relationships_between_facts", label: "Mettre en relation des faits" },
  { id: "changes_and_continuities", label: "Déterminer des changements et des continuités" },
  { id: "differences_and_similarities", label: "Déterminer des différences et des similitudes" },
  { id: "causal_connections", label: "Établir des liens de causalité" },
] as const;

const PERIOD = { startYear: 1840, endYear: 1896 } as const;
const STATUSES: ProgressStatus[] = ["mastered", "consolidate", "needs_work", "not_assessed"];

function operations(offset: number) {
  return DEMO_INTELLECTUAL_OPERATIONS.map((operation, index) => ({
    ...operation,
    status: STATUSES[(index + offset) % STATUSES.length],
  }));
}

function knowledge(ids: readonly string[], offset: number) {
  return ids.map((id, index) => {
    const canonical = ACTE_UNION_HISTORICAL_KNOWLEDGE.find((item) => item.id === id);
    if (!canonical) throw new Error(`Connaissance historique non approuvée : ${id}`);
    return { id: canonical.id, label: canonical.label, status: STATUSES[(index + offset) % STATUSES.length] };
  });
}

function createActivities(): StudentActivity[] {
  const assignedKnowledge = ["contexte-acte-union", "causes-acte-union", "rapport-durham", "consequences-acte-union"];
  const completedKnowledge = ["rebellions-1837-1838", "objectifs-acte-union", "acte-union"];
  return [
    {
      id: "demo-activity-acte-union",
      activityTitle: "Révision avant l’évaluation 1",
      activityType: "revision",
      publicationDate: "16 mai 2025",
      historicalPeriod: PERIOD,
      notionIds: [ACTE_UNION_NOTION_ID, "industrialisation"],
      historicalKnowledgeIds: assignedKnowledge,
      durationMinutes: 25,
      progressPercentage: 35,
      activityStatus: "in_progress",
      origin: "teacher_assigned",
      isRecent: true,
      actionHref: getLearningSessionUrl("demo-activity-acte-union", ACTE_UNION_NOTION_ID, "teacher-assigned"),
      operations: operations(0),
      historicalKnowledge: knowledge(assignedKnowledge, 0),
      summary: { state: "pending", strengths: [], consolidationTargets: [], recommendation: null, consolidationActivity: null, consolidationProgress: null },
    },
    {
      id: "demo-activity-industrialisation",
      activityTitle: "Révision – Industrialisation",
      activityType: "revision",
      publicationDate: "5 mai 2025",
      historicalPeriod: PERIOD,
      notionIds: ["industrialisation"],
      historicalKnowledgeIds: [],
      durationMinutes: 20,
      progressPercentage: 0,
      activityStatus: "not_started",
      origin: "student_selected",
      isRecent: false,
      actionHref: getLearningSessionUrl("demo-activity-industrialisation", "industrialisation", "notion-review"),
      operations: DEMO_INTELLECTUAL_OPERATIONS.map((operation) => ({ ...operation, status: "not_assessed" as const })),
      historicalKnowledge: [],
      summary: { state: "pending", strengths: [], consolidationTargets: [], recommendation: null, consolidationActivity: null, consolidationProgress: null },
    },
    {
      id: "demo-activity-completed",
      activityTitle: "Consolidation – Acte d’union",
      activityType: "enrichment",
      publicationDate: "28 avril 2025",
      historicalPeriod: PERIOD,
      notionIds: [ACTE_UNION_NOTION_ID],
      historicalKnowledgeIds: completedKnowledge,
      durationMinutes: 15,
      progressPercentage: 100,
      activityStatus: "completed",
      origin: "teacher_assigned",
      isRecent: false,
      actionHref: `${getActivityDashboardUrl("demo-activity-completed")}#bilan`,
      operations: operations(1).map((operation) => operation.id === "establish_facts"
        ? { ...operation, status: "mastered" as const }
        : operation.id === "causes_and_consequences"
          ? { ...operation, status: "consolidate" as const }
          : operation),
      historicalKnowledge: knowledge(completedKnowledge, 1).map((item, index) => ({
        ...item,
        status: index === 0 ? "mastered" as const : "consolidate" as const,
      })),
      summary: {
        state: "local_demo_structured",
        strengths: ["Résultat local structuré à remplacer par le bilan confirmé."],
        consolidationTargets: ["Cible locale de démonstration, sans analyse pédagogique."],
        recommendation: "Recommandation locale à valider avant tout usage réel.",
        consolidationActivity: "Activité locale non générée et non persistée.",
        consolidationProgress: {
          state: "improving",
          source: "teacher_assigned",
          completedAt: "28 avril 2025",
          previousLevel: "À consolider",
          currentLevel: "En progression",
          observation: "Tu établis maintenant les faits avec plus de précision. Continue à justifier tes liens de cause à conséquence à l’aide des documents.",
        },
      },
    },
  ];
}

export function createDemoStudentDashboard(requestedActivityId?: string): StudentDashboardData {
  const activities = createActivities();
  const base: StudentDashboardData = {
    source: "local_demo",
    defaultActivityId: activities[0].id,
    selectedActivityId: activities[0].id,
    activities,
    notions: [
      { id: ACTE_UNION_NOTION_ID, title: "Acte d’union", description: "Notion du référentiel initial.", historicalPeriod: PERIOD },
      { id: "industrialisation", title: "Industrialisation", description: "Notion du référentiel initial.", historicalPeriod: PERIOD },
    ],
  };
  return { ...base, selectedActivityId: resolveSelectedActivityId(base, requestedActivityId) };
}

export class LocalDemoStudentDashboardProvider implements StudentDashboardProvider {
  async getForAnonymousStudent(_anonymousStudentId: string, requestedActivityId?: string) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("The local demonstration dashboard provider is disabled in production.");
    }
    return createDemoStudentDashboard(requestedActivityId);
  }
}
