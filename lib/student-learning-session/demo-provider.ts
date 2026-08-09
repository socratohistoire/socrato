import { getDashboardUrl } from "../student-dashboard/selection.ts";
import type { DashboardMode } from "../student-dashboard/types.ts";
import type { StudentLearningSessionProvider } from "./provider.ts";
import type { LearningSessionQuestion, StudentLearningSessionData } from "./types.ts";
import { ACTE_UNION_CAUSAL_PILOT_DOCUMENTS, ACTE_UNION_DOCUMENTS } from "./document-catalog.ts";
import { ACTE_UNION_CAUSAL_PILOT_QUESTION, ACTE_UNION_POLITICAL_INSTITUTIONS_ASSOCIATION_QUESTION, ACTE_UNION_TIMELINE_PROTOTYPE_QUESTION, PEDAGOGICAL_QUESTION_CATALOG } from "../pedagogical-reference/question-catalog.ts";
import { INTELLECTUAL_OPERATIONS } from "../pedagogical-reference/intellectual-operations.ts";

const DEMO_ACTIVITIES = new Set([
  "demo-activity-acte-union",
  "demo-activity-industrialisation",
  "demo-teacher-practice-1",
  "demo-activity-timeline",
  "demo-activity-association",
]);

const PUBLISHED_TEST_QUESTION_IDS = [
  "question:acte-union:timeline-001",
  "question:acte-union:multiple-choice-006",
  "question:acte-union:short-answer-006",
  "question:acte-union:001",
  "question:acte-union:short-answer-007",
] as const;

export function createCatalogLearningSessionQuestions(questionIds: readonly string[]) {
  const catalog = [...ACTE_UNION_CAUSAL_PILOT_DOCUMENTS, ...ACTE_UNION_DOCUMENTS];
  const questions: LearningSessionQuestion[] = questionIds.map((id, index) => {
    const question = PEDAGOGICAL_QUESTION_CATALOG.find((candidate) => candidate.id === id);
    if (!question) throw new Error(`Question de test introuvable : ${id}`);
    const documents = catalog.filter((document) => question.historicalDocumentIds.includes(document.id));
    const operation = INTELLECTUAL_OPERATIONS.find(({ id: operationId }) => operationId === question.operationId);
    return {
      id: question.id,
      format: question.format,
      type: question.format === "interactive-timeline" ? "interactive_timeline"
        : question.format === "interactive-association" ? "interactive_association"
        : question.format === "multiple-choice" ? "multiple_choice"
        : documents.length > 0 ? "question_with_documents" : "question_without_documents",
      number: index + 1,
      prompt: question.prompt,
      instruction: question.instruction,
      primaryOperationId: question.operationId,
      featuredDocumentId: documents[0]?.id,
      intellectualOperations: [{ id: question.operationId, label: operation?.officialLabel ?? question.operationId }],
      historicalKnowledgeIds: [...question.relatedKnowledgeHeadingIds],
      documentRelations: documents.map(({ id: documentId }, documentIndex) => ({ documentId, displayOrder: documentIndex + 1 })),
      requiredDocumentIds: documents.map(({ id: documentId }) => documentId),
      localHint: question.instruction,
      initialMessages: [{ id: `published-test-welcome-${index}`, author: "socrato", content: question.format === "short-answer" ? "J’attends ta réponse…" : question.format === "document-interpretation" ? "Bonjour, consulte les sources puis réponds à la question." : "J’attends ta réponse…" }],
      answerOptions: question.answerOptions,
      answerExplanation: question.expectedAnswer,
      timelineInteraction: question.timelineInteraction,
      associationInteraction: question.associationInteraction,
    };
  });
  const documentIds = new Set(questions.flatMap((question) => question.documentRelations.map(({ documentId }) => documentId)));
  return { questions, documents: catalog.filter(({ id }) => documentIds.has(id)) };
}

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
    : activityId === "demo-activity-timeline"
      ? "Révision avant l’évaluation"
    : activityId === "demo-activity-industrialisation"
      ? "Révision – Industrialisation"
      : "Révision de l’Acte d’Union";
  const hasActeUnionDocuments = notionId === "acte-union";
  const isTimelinePrototype = activityId === "demo-activity-timeline";
  const isAssociationPrototype = activityId === "demo-activity-association";
  const timelineQuestion = ACTE_UNION_TIMELINE_PROTOTYPE_QUESTION;

  if (activityId === "demo-teacher-practice-1") {
    const published = createCatalogLearningSessionQuestions(PUBLISHED_TEST_QUESTION_IDS);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle: "Test – Révision de l’Acte d’Union",
      origin: "teacher_assigned",
      notionId: "acte-union",
      notionTitle: "Acte d’union",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("acte-union", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

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
    localDemoNotice: "",
    documentCatalog: hasActeUnionDocuments && !isTimelinePrototype && !isAssociationPrototype ? ACTE_UNION_CAUSAL_PILOT_DOCUMENTS : [],
    questions: [
      isAssociationPrototype ? {
        id: ACTE_UNION_POLITICAL_INSTITUTIONS_ASSOCIATION_QUESTION.id,
        type: "interactive_association",
        number: 1,
        prompt: ACTE_UNION_POLITICAL_INSTITUTIONS_ASSOCIATION_QUESTION.prompt,
        instruction: ACTE_UNION_POLITICAL_INSTITUTIONS_ASSOCIATION_QUESTION.instruction,
        primaryOperationId: ACTE_UNION_POLITICAL_INSTITUTIONS_ASSOCIATION_QUESTION.operationId,
        intellectualOperations: [{ id: "relationships_between_facts", label: "Mettre en relation des faits" }],
        historicalKnowledgeIds: ["acte-union-1840", "institutions-politiques"],
        documentRelations: [],
        requiredDocumentIds: [],
        localHint: "Distingue d’abord les institutions élues des institutions nommées, puis repère celles qui conseillent ou représentent la Couronne.",
        initialMessages: [{ id: "association-welcome", author: "socrato", content: "Bonjour, sélectionne une institution, puis associe-la à son rôle principal." }],
        associationInteraction: ACTE_UNION_POLITICAL_INSTITUTIONS_ASSOCIATION_QUESTION.associationInteraction,
      } : isTimelinePrototype ? {
        id: timelineQuestion.id,
        type: "interactive_timeline",
        number: 1,
        prompt: timelineQuestion.prompt,
        instruction: timelineQuestion.instruction,
        primaryOperationId: timelineQuestion.operationId,
        intellectualOperations: [
          { id: "time_and_space", label: "Situer dans le temps et dans l’espace" },
          { id: "relationships_between_facts", label: "Mettre en relation des faits" },
        ],
        historicalKnowledgeIds: ["rebellions-1837-1838", "rapport-durham", "acte-union-1840", "gouvernement-responsable"],
        documentRelations: [],
        requiredDocumentIds: [],
        localHint: "Distingue bien deux étapes voisines : l’Acte d’Union est adopté en 1840, puis il entre en vigueur et crée la Province du Canada en 1841.",
        initialMessages: [{ id: "timeline-welcome", author: "socrato", content: "Bonjour, observe chaque image et sa description. Sélectionne ensuite une carte et place-la sous la bonne date." }],
        timelineInteraction: timelineQuestion.timelineInteraction,
      } : {
        id: hasActeUnionDocuments ? ACTE_UNION_CAUSAL_PILOT_QUESTION.id : "local-neutral-question-1",
        type: hasActeUnionDocuments ? "question_with_documents" : "question_without_documents",
        number: 1,
        prompt: hasActeUnionDocuments ? ACTE_UNION_CAUSAL_PILOT_QUESTION.prompt : "Formule une question que tu aimerais approfondir à propos de cette notion.",
        instruction: hasActeUnionDocuments ? ACTE_UNION_CAUSAL_PILOT_QUESTION.instruction : "Explique brièvement pourquoi cette question te semble importante.",
        primaryOperationId: hasActeUnionDocuments ? ACTE_UNION_CAUSAL_PILOT_QUESTION.operationId : "establish_facts",
        featuredDocumentId: hasActeUnionDocuments ? ACTE_UNION_CAUSAL_PILOT_DOCUMENTS[0]?.id : undefined,
        intellectualOperations: hasActeUnionDocuments ? [
          { id: "causal_connections", label: "Établir des liens de causalité" },
        ] : [{ id: "establish_facts", label: "Établir des faits" }],
        historicalKnowledgeIds: hasActeUnionDocuments ? ["contexte-acte-union", "acte-union-1840", "populations-bas-haut-canada", "institutions-politiques", "consequences-acte-union"] : [],
        documentRelations: hasActeUnionDocuments ? ACTE_UNION_CAUSAL_PILOT_DOCUMENTS.map((document, index) => ({ documentId: document.id, displayOrder: index + 1 })) : [],
        requiredDocumentIds: hasActeUnionDocuments ? ACTE_UNION_CAUSAL_PILOT_DOCUMENTS.map(({ id }) => id) : [],
        localHint: hasActeUnionDocuments ? "Construis une chaîne en trois étapes — une revendication des 92 Résolutions, la réponse des résolutions Russell, puis un signe de radicalisation dans La Minerve." : "Commence par nommer clairement ce que tu souhaites mieux comprendre.",
        initialMessages: [
          {
            id: "local-welcome",
            author: "socrato",
            content: "Bonjour, consulte les sources puis réponds lorsque tu te sens prêt. Je suis là pour t’accompagner si tu as besoin d’un indice.",
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
