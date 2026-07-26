import { getDashboardUrl } from "../student-dashboard/selection.ts";
import type { DashboardMode } from "../student-dashboard/types.ts";
import type { StudentLearningSessionProvider } from "./provider.ts";
import type { StudentLearningSessionData } from "./types.ts";
import { ACTE_UNION_DOCUMENTS } from "./document-catalog.ts";

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
  const hasActeUnionDocuments = notionId === "acte-union";

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
    documentCatalog: hasActeUnionDocuments ? ACTE_UNION_DOCUMENTS : [],
    questions: [
      {
        id: hasActeUnionDocuments ? "acte-union-equal-representation" : "local-neutral-question-1",
        type: hasActeUnionDocuments ? "question_with_documents" : "question_without_documents",
        number: 1,
        prompt: hasActeUnionDocuments ? "À l’aide des documents 1, 2 et 3, explique pourquoi la représentation égale du Canada-Est et du Canada-Ouest pouvait désavantager le Canada-Est au moment de l’Acte d’union." : "Formule une question que tu aimerais approfondir à propos de cette notion.",
        instruction: hasActeUnionDocuments ? "Appuie ta réponse sur un élément précis du tableau et sur les propos d’au moins un des deux acteurs politiques." : "Explique brièvement pourquoi cette question te semble importante.",
        primaryOperationId: hasActeUnionDocuments ? "causes-and-consequences" : "establish_facts",
        featuredDocumentId: hasActeUnionDocuments ? "duncan-parliament-interior" : undefined,
        intellectualOperations: hasActeUnionDocuments ? [
          { id: "establish_facts", label: "Établir des faits" },
          { id: "relate_facts", label: "Mettre en relation des faits" },
          { id: "causes-and-consequences", label: "Déterminer des causes et des conséquences" },
        ] : [{ id: "establish_facts", label: "Établir des faits" }],
        historicalKnowledgeIds: hasActeUnionDocuments ? ["contexte-acte-union", "acte-union-1840", "populations-bas-haut-canada", "institutions-politiques", "consequences-acte-union"] : [],
        documentRelations: hasActeUnionDocuments ? ACTE_UNION_DOCUMENTS.map((document, index) => ({ documentId: document.id, displayOrder: index + 1 })) : [],
        localHint: hasActeUnionDocuments ? "Indice local : compare d’abord les populations et le nombre de députés, puis repère le jugement exprimé par un acteur politique." : "Indice local : commence par nommer clairement ce que tu souhaites mieux comprendre.",
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
