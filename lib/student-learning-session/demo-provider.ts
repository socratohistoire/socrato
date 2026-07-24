import { getDashboardUrl } from "../student-dashboard/selection.ts";
import type { DashboardMode } from "../student-dashboard/types.ts";
import type { StudentLearningSessionProvider } from "./provider.ts";
import type { StudentLearningSessionData } from "./types.ts";

const DEMO_ACTIVITIES = new Set([
  "demo-activity-acte-union",
  "demo-activity-industrialisation",
  "demo-teacher-practice-1",
]);

export function createDemoStudentLearningSession(
  activityId = "demo-activity-acte-union",
  requestedNotionId = "acte-union",
  requestedMode: DashboardMode = "teacher-assigned",
): StudentLearningSessionData | null {
  if (!DEMO_ACTIVITIES.has(activityId)) return null;
  const notionId = requestedNotionId === "industrialisation" ? requestedNotionId : "acte-union";
  const notionTitle = notionId === "industrialisation" ? "Industrialisation" : "Acte d’union";
  const activityTitle = activityId === "demo-activity-acte-union"
    ? "Révision avant l’évaluation 1"
    : activityId === "demo-activity-industrialisation"
      ? "Révision – Industrialisation"
      : "Révision locale de démonstration";

  return {
    id: `local-session-${activityId}`,
    activityId,
    activityTitle,
    origin: requestedMode === "notion-review" ? "student_selected" : "teacher_assigned",
    notionId,
    notionTitle,
    historicalPeriod: { startYear: 1840, endYear: 1896 },
    currentQuestionIndex: 0,
    dashboardHref: getDashboardUrl(notionId, requestedMode, activityId),
    source: "local_demo",
    localDemoNotice: "Démonstration locale à valider — aucune réponse n’est enregistrée ni évaluée.",
    questions: [
      {
        id: "local-neutral-question-1",
        number: 1,
        prompt: "Formule une question que tu aimerais approfondir à propos de cette notion.",
        instruction: "Explique brièvement pourquoi cette question te semble importante.",
        intellectualOperations: [{ id: "establish_facts", label: "Établir des faits" }],
        historicalKnowledgeIds: [],
        documents: [],
        localHint: "Indice local : commence par nommer clairement ce que tu souhaites mieux comprendre.",
        initialMessages: [
          {
            id: "local-welcome",
            author: "socrato",
            content: "Cette démonstration locale recueille ta réponse sans l’évaluer.",
          },
        ],
      },
    ],
  };
}

export class LocalDemoStudentLearningSessionProvider
  implements StudentLearningSessionProvider
{
  async getForAnonymousStudent(
    _anonymousStudentId: string,
    activityId: string,
    requestedNotionId?: string,
    requestedMode?: string,
  ): Promise<StudentLearningSessionData | null> {
    if (process.env.NODE_ENV === "production") {
      throw new Error("The local demonstration learning-session provider is disabled in production.");
    }
    const mode: DashboardMode = requestedMode === "notion-review" ? "notion-review" : "teacher-assigned";
    return createDemoStudentLearningSession(activityId, requestedNotionId, mode);
  }
}
