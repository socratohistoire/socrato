import type { StudentDashboardProvider } from "./provider.ts";
import type { StudentDashboardData } from "./types.ts";
import {
  ACTE_UNION_HISTORICAL_KNOWLEDGE,
  ACTE_UNION_NOTION_ID,
} from "./historical-knowledge-catalog.ts";
import {
  getDashboardUrl,
  resolveDashboardMode,
  resolveSelectedNotionId,
} from "./selection.ts";

export const DEMO_INTELLECTUAL_OPERATIONS = [
  { id: "establish_facts", label: "Établir des faits" },
  {
    id: "causes_and_consequences",
    label: "Déterminer des causes et des conséquences",
  },
  {
    id: "time_and_space",
    label: "Situer dans le temps et dans l’espace",
  },
  { id: "relationships_between_facts", label: "Mettre en relation des faits" },
  {
    id: "changes_and_continuities",
    label: "Déterminer des changements et des continuités",
  },
  {
    id: "differences_and_similarities",
    label: "Déterminer des différences et des similitudes",
  },
  { id: "causal_connections", label: "Établir des liens de causalité" },
] as const;

const DEMO_STATUSES = [
  "mastered",
  "consolidate",
  "needs_work",
  "not_assessed",
] as const;

const INITIAL_HISTORICAL_PERIOD = {
  startYear: 1840,
  endYear: 1896,
} as const;

function createOperationStatuses(offset: number) {
  return DEMO_INTELLECTUAL_OPERATIONS.map((operation, index) => ({
    ...operation,
    status: DEMO_STATUSES[(index + offset) % DEMO_STATUSES.length],
    canReview: true,
  }));
}

export function createDemoStudentDashboard(
  requestedNotionId?: string,
  requestedMode?: string,
): StudentDashboardData {
  const selectedMode = resolveDashboardMode(requestedMode);
  const isNotionReview = selectedMode === "notion-review";
  const notionContexts: StudentDashboardData["notionContexts"] = [
    {
      notionId: ACTE_UNION_NOTION_ID,
      activity: {
        id: "demo-activity-acte-union",
        label: "Activité de révision",
        title: "Acte d’union",
        progressPercent: isNotionReview ? 0 : 35,
        state: isNotionReview ? "available" : "in_progress",
        isNew: isNotionReview ? false : true,
        actionHref: getDashboardUrl(ACTE_UNION_NOTION_ID, selectedMode),
        illustrationSrc: "/images/montrealfin1800.png",
        illustrationPosition: "72% center",
        origin: isNotionReview ? "student_selected" : "teacher_assigned",
      },
      notebookRecommendation: null,
      recommendationEmptyMessage:
        "Les références apparaîtront ici lorsqu’elles seront associées à l’activité.",
      operations: createOperationStatuses(0),
      historicalKnowledge: ACTE_UNION_HISTORICAL_KNOWLEDGE.map(
        (knowledge, index) => {
          // Démonstration visuelle uniquement. La maîtrise réelle proviendra plus
          // tard des données de progression propres à la session de l’élève.
          const status = DEMO_STATUSES[index % DEMO_STATUSES.length];
          return {
            id: knowledge.id,
            label: knowledge.label,
            status,
            canReview: true,
          };
        },
      ),
    },
    {
      notionId: "industrialisation",
      activity: {
        id: "demo-activity-industrialisation",
        label: "Activité de révision",
        title: "Industrialisation",
        progressPercent: isNotionReview ? 0 : 10,
        state: isNotionReview ? "available" : "in_progress",
        isNew: false,
        actionHref: getDashboardUrl("industrialisation", selectedMode),
        illustrationSrc: "/images/montrealfin1800.png",
        illustrationPosition: "88% center",
        origin: isNotionReview ? "student_selected" : "teacher_assigned",
      },
      notebookRecommendation: null,
      recommendationEmptyMessage:
        "Les recommandations pour cette notion seront ajoutées ultérieurement.",
      operations: createOperationStatuses(2),
      historicalKnowledge: [],
    },
  ];

  const base: StudentDashboardData = {
    source: "local_demo",
    defaultNotionId: ACTE_UNION_NOTION_ID,
    selectedNotionId: ACTE_UNION_NOTION_ID,
    selectedMode,
    notionContexts,
    notions: [
      {
        id: ACTE_UNION_NOTION_ID,
        title: "Acte d’union",
        description: "Notion disponible dans le référentiel initial.",
        historicalPeriod: INITIAL_HISTORICAL_PERIOD,
      },
      {
        id: "industrialisation",
        title: "Industrialisation",
        description: "Notion disponible dans le référentiel initial.",
        historicalPeriod: INITIAL_HISTORICAL_PERIOD,
      },
    ],
    teacherPractices: [
      {
        id: "demo-teacher-practice-1",
        title: "Acte d’union",
        state: "active",
        notionId: ACTE_UNION_NOTION_ID,
        illustrationSrc: "/images/montrealfin1800.png",
        illustrationPosition: "76% 57%",
        progressPercent: 35,
      },
    ],
  };

  return {
    ...base,
    selectedNotionId: resolveSelectedNotionId(base, requestedNotionId),
  };
}

export class LocalDemoStudentDashboardProvider
  implements StudentDashboardProvider
{
  async getForAnonymousStudent(
    _anonymousStudentId: string,
    requestedNotionId?: string,
    requestedMode?: string,
  ): Promise<StudentDashboardData> {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "The local demonstration dashboard provider is disabled in production.",
      );
    }

    return createDemoStudentDashboard(requestedNotionId, requestedMode);
  }
}
