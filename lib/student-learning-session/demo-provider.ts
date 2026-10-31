import { getDashboardUrl } from "../student-dashboard/selection.ts";
import type { DashboardMode } from "../student-dashboard/types.ts";
import type { StudentLearningSessionProvider } from "./provider.ts";
import { isLocalStudentDemoEnabled } from "../student-access/local-runtime.ts";
import type { LearningSessionQuestion, StudentLearningSessionData } from "./types.ts";
import { ACTE_UNION_CAUSAL_PILOT_DOCUMENTS, ACTE_UNION_DOCUMENTS } from "./document-catalog.ts";
import { ACTE_UNION_CAUSAL_PILOT_QUESTION, ACTE_UNION_POLITICAL_INSTITUTIONS_ASSOCIATION_QUESTION, ACTE_UNION_TIMELINE_PROTOTYPE_QUESTION, FEDERAL_PROVINCIAL_RELATIONS_COMPETENCIES_ASSOCIATION_QUESTION, PEDAGOGICAL_QUESTION_CATALOG, RESPONSIBLE_GOVERNMENT_CAUSAL_CHAIN_QUESTION, RESPONSIBLE_GOVERNMENT_TIMELINE_SHORT_ANSWER_QUESTION } from "../pedagogical-reference/question-catalog.ts";
import { INTELLECTUAL_OPERATIONS } from "../pedagogical-reference/intellectual-operations.ts";
import type { ApprovedQuestion } from "../pedagogical-reference/types.ts";
import { CAUSES_CONSEQUENCES_LEARNING_QUESTION, CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID, INTELLECTUAL_OPERATION_LEARNING_DOCUMENTS } from "../teacher-activity-creator/intellectual-operation-learning.ts";
import { TRANSVERSAL_FEDERAL_CHRONOLOGY_QUESTION } from "../pedagogical-reference/transversal-federal-chronology-question.ts";
import { SOCRATO_INITIAL_RESPONSE_PROMPT } from "./initial-message.ts";

const DEMO_ACTIVITIES = new Set([
  "demo-activity-acte-union",
  "demo-activity-industrialisation",
  "demo-teacher-practice-1",
  "demo-activity-timeline",
  "demo-activity-association",
  "demo-activity-federal-provincial-competencies",
  "demo-activity-causal-chain",
  "demo-activity-politique-nationale",
  "demo-activity-politique-nationale-crise",
  "demo-activity-politique-nationale-causalite",
  "demo-activity-politique-nationale-terres-gratuites",
  "demo-activity-politique-nationale-macdonald-motifs",
  "demo-activity-politique-nationale-marche-interieur",
  "demo-activity-politique-nationale-fonctions-cpr",
  "demo-activity-politique-nationale-projet-economique-territorial",
  "demo-activity-politique-nationale-objectifs-1879",
  "demo-activity-politique-nationale-espaces",
  "demo-activity-migrations-intervention-colonisation",
  "demo-activity-migrations-mouvements-causes",
  "demo-activity-migrations-evolution-population",
  "demo-activity-migrations-departure-factors",
  "demo-activity-migrations-emigration-colonization-causality",
  "demo-activity-migrations-famine-grosse-ile",
  "demo-activity-migrations-exode-emigration-comparison",
  "demo-activity-migrations-saguenay-innu-consequence",
  "demo-activity-migrations-industrialization-transport",
  "demo-activity-migrations-chronological-association",
  "demo-activity-eglise-ultramontains-anticlericaux",
  "demo-activity-eglise-identite-canadienne-francaise",
  "demo-activity-eglise-concepts-association",
  "demo-activity-eglise-systeme-scolaire-composition-religieuse",
  "demo-activity-eglise-presence-changement-continuite",
  "demo-activity-manifestations-enseignement-superieur",
  "demo-activity-manifestations-oeuvres-patriotiques",
  "demo-activity-manifestations-femmes-vie-litteraire",
]);

const PUBLISHED_TEST_QUESTION_IDS = [
  "question:acte-union:timeline-001",
  "question:acte-union:multiple-choice-006",
  "question:acte-union:001",
  "question:acte-union:short-answer-007",
] as const;

export function createCatalogLearningSessionQuestions(questionIds: readonly string[]) {
  const catalog = [...ACTE_UNION_CAUSAL_PILOT_DOCUMENTS, ...ACTE_UNION_DOCUMENTS, ...INTELLECTUAL_OPERATION_LEARNING_DOCUMENTS];
  const approvedQuestions = questionIds.flatMap((id) => {
    const question: ApprovedQuestion | undefined = id === CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID
      ? CAUSES_CONSEQUENCES_LEARNING_QUESTION
      : PEDAGOGICAL_QUESTION_CATALOG.find((candidate) => candidate.id === id);
    return question ? [question] : [];
  });
  const questions: LearningSessionQuestion[] = approvedQuestions.map((question, index) => {
    const documents = question.historicalDocumentIds.flatMap((documentId) => {
      const document = catalog.find(({ id }) => id === documentId);
      return document ? [document] : [];
    });
    const operation = INTELLECTUAL_OPERATIONS.find(({ id: operationId }) => operationId === question.operationId);
    const historicalKnowledgeIds = [...new Set([
      ...question.relatedKnowledgeHeadingIds,
      ...documents.flatMap((document) => document.historicalKnowledgeIds),
    ])];
    return {
      id: question.id,
      format: question.format,
      type: question.causalChainInteraction ? "interactive_causal_chain"
        : question.format === "interactive-timeline" ? "interactive_timeline"
        : question.format === "interactive-association" ? "interactive_association"
        : question.format === "multiple-choice" ? "multiple_choice"
        : documents.length > 0 ? "question_with_documents" : "question_without_documents",
      number: index + 1,
      prompt: question.prompt,
      instruction: question.instruction,
      primaryOperationId: question.operationId,
      featuredDocumentId: documents[0]?.id,
      intellectualOperations: [{ id: question.operationId, label: operation?.officialLabel ?? question.operationId }],
      historicalKnowledgeIds,
      documentRelations: documents.map(({ id: documentId }, documentIndex) => ({ documentId, displayOrder: documentIndex + 1 })),
      requiredDocumentIds: documents.map(({ id: documentId }) => documentId),
      localHint: question.instruction,
      initialMessages: [{ id: `published-test-welcome-${index}`, author: "socrato", content: SOCRATO_INITIAL_RESPONSE_PROMPT }],
      maxAttempts: question.id === CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID ? null : undefined,
      answerOptions: question.answerOptions,
      answerExplanation: question.expectedAnswer,
      evaluationGuide: { expectedAnswer: question.expectedAnswer, commonErrors: [...question.commonErrors] },
      timelineInteraction: question.timelineInteraction,
      associationInteraction: question.associationInteraction,
      causalChainInteraction: question.causalChainInteraction,
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
  const notionId = requestedNotionId === "industrialisation" || requestedNotionId === "gouvernement-responsable" || requestedNotionId === "relations-federales-provinciales" || requestedNotionId === "acte-de-l-amerique-du-nord-britannique" || requestedNotionId === "politique-nationale" || requestedNotionId === "migrations" ? requestedNotionId : "acte-union";
  const notionTitle = notionId === "industrialisation" ? "Industrialisation" : notionId === "gouvernement-responsable" ? "Gouvernement responsable" : notionId === "relations-federales-provinciales" ? "Relations fédérales-provinciales" : notionId === "acte-de-l-amerique-du-nord-britannique" ? "Affaires indiennes · AANB · Relations fédérales-provinciales" : notionId === "politique-nationale" ? "Politique nationale" : notionId === "migrations" ? "Migrations" : "Acte d’union";
  const activityTitle = activityId === "demo-activity-acte-union"
    ? "Révision avant l’évaluation 1"
    : activityId === "demo-activity-causal-chain"
      ? "Chaîne politique du gouvernement responsable"
    : activityId === "demo-activity-timeline"
      ? notionId === "gouvernement-responsable" ? "Chronologie du gouvernement responsable" : notionId === "acte-de-l-amerique-du-nord-britannique" ? "Chronologie transversale" : "Révision avant l’évaluation"
    : activityId === "demo-activity-industrialisation"
      ? "Révision – Industrialisation"
    : activityId === "demo-activity-federal-provincial-competencies"
      ? "Classement des compétences fédérales et provinciales"
    : activityId === "demo-activity-politique-nationale"
      ? "Comparer les effets du tarif protecteur"
    : activityId === "demo-activity-politique-nationale-crise"
      ? "Deux manifestations de la crise de 1873"
    : activityId === "demo-activity-politique-nationale-causalite"
      ? "Tarifs, chemin de fer et colonisation"
    : activityId === "demo-activity-politique-nationale-terres-gratuites"
      ? "Les terres gratuites dans l’Ouest"
    : activityId === "demo-activity-politique-nationale-macdonald-motifs"
      ? "Pourquoi Macdonald propose la Politique nationale"
    : activityId === "demo-activity-politique-nationale-marche-interieur"
      ? "Le Canadien Pacifique et le marché intérieur"
    : activityId === "demo-activity-politique-nationale-fonctions-cpr"
      ? "Les fonctions du Canadien Pacifique"
    : activityId === "demo-activity-politique-nationale-projet-economique-territorial"
      ? "Un même projet économique et territorial"
    : activityId === "demo-activity-politique-nationale-objectifs-1879"
      ? "Les objectifs de la Politique nationale"
    : activityId === "demo-activity-politique-nationale-espaces"
      ? "Les espaces de la Politique nationale"
    : activityId === "demo-activity-migrations-intervention-colonisation"
      ? "Une intervention sur les déplacements de population"
    : activityId === "demo-activity-migrations-mouvements-causes"
      ? "Les mouvements migratoires et leurs causes"
    : activityId === "demo-activity-migrations-evolution-population"
      ? "Migrations et évolution de la population urbaine"
    : activityId === "demo-activity-migrations-departure-factors"
      ? "Les facteurs de l’émigration vers les États-Unis"
    : activityId === "demo-activity-migrations-emigration-colonization-causality"
      ? "Émigration et colonisation au Québec"
    : activityId === "demo-activity-migrations-famine-grosse-ile"
      ? "La Grande Famine et Grosse-Île"
    : activityId === "demo-activity-migrations-exode-emigration-comparison"
      ? "Exode rural et émigration"
    : activityId === "demo-activity-migrations-saguenay-innu-consequence"
      ? "Colonisation et territoire innu"
    : activityId === "demo-activity-migrations-industrialization-transport"
      ? "Industrialisation, transports et migrations"
    : activityId === "demo-activity-migrations-chronological-association"
      ? "Repères chronologiques des migrations"
    : activityId === "demo-activity-eglise-ultramontains-anticlericaux"
      ? "Ultramontains et anticléricaux"
    : activityId === "demo-activity-eglise-identite-canadienne-francaise"
      ? "L’Église et l’identité canadienne-française"
    : activityId === "demo-activity-eglise-concepts-association"
      ? "Quatre concepts liés à la présence de l’Église"
    : activityId === "demo-activity-eglise-systeme-scolaire-composition-religieuse"
      ? "Système scolaire et composition religieuse"
    : activityId === "demo-activity-eglise-presence-changement-continuite"
      ? "Changement et continuité de la présence de l’Église"
    : activityId === "demo-activity-manifestations-enseignement-superieur"
      ? "L’enseignement supérieur francophone et anglophone"
    : activityId === "demo-activity-manifestations-oeuvres-patriotiques"
      ? "Contexte politique et œuvres patriotiques"
    : activityId === "demo-activity-manifestations-femmes-vie-litteraire"
      ? "Les femmes dans la vie littéraire"
      : "Révision de l’Acte d’Union";
  const hasActeUnionDocuments = notionId === "acte-union";
  const isTimelinePrototype = activityId === "demo-activity-timeline";
  const isCompetencyAssociationPrototype = activityId === "demo-activity-federal-provincial-competencies";
  const isAssociationPrototype = activityId === "demo-activity-association" || isCompetencyAssociationPrototype;
  const isCausalChainPrototype = activityId === "demo-activity-causal-chain";
  const timelineQuestion = notionId === "gouvernement-responsable" ? RESPONSIBLE_GOVERNMENT_TIMELINE_SHORT_ANSWER_QUESTION : notionId === "acte-de-l-amerique-du-nord-britannique" ? TRANSVERSAL_FEDERAL_CHRONOLOGY_QUESTION : ACTE_UNION_TIMELINE_PROTOTYPE_QUESTION;
  const associationQuestion = isCompetencyAssociationPrototype ? FEDERAL_PROVINCIAL_RELATIONS_COMPETENCIES_ASSOCIATION_QUESTION : ACTE_UNION_POLITICAL_INSTITUTIONS_ASSOCIATION_QUESTION;
  const associationOperation = INTELLECTUAL_OPERATIONS.find(({ id }) => id === associationQuestion.operationId);

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

  if (activityId === "demo-activity-politique-nationale") {
    const published = createCatalogLearningSessionQuestions(["question:politique-nationale:document-interpretation-001"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "politique-nationale",
      notionTitle: "Politique nationale",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("politique-nationale", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-politique-nationale-crise") {
    const published = createCatalogLearningSessionQuestions(["question:politique-nationale:document-interpretation-002"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "politique-nationale",
      notionTitle: "Politique nationale",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("politique-nationale", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-politique-nationale-causalite") {
    const published = createCatalogLearningSessionQuestions(["question:politique-nationale:document-interpretation-003"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "politique-nationale",
      notionTitle: "Politique nationale",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("politique-nationale", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-politique-nationale-terres-gratuites") {
    const published = createCatalogLearningSessionQuestions(["question:politique-nationale:document-interpretation-004"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "politique-nationale",
      notionTitle: "Politique nationale",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("politique-nationale", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-politique-nationale-macdonald-motifs") {
    const published = createCatalogLearningSessionQuestions(["question:politique-nationale:document-interpretation-005"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "politique-nationale",
      notionTitle: "Politique nationale",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("politique-nationale", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-politique-nationale-marche-interieur") {
    const published = createCatalogLearningSessionQuestions(["question:politique-nationale:document-interpretation-006"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "politique-nationale",
      notionTitle: "Politique nationale",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("politique-nationale", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-politique-nationale-fonctions-cpr") {
    const published = createCatalogLearningSessionQuestions(["question:politique-nationale:document-interpretation-007"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "politique-nationale",
      notionTitle: "Politique nationale",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("politique-nationale", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-politique-nationale-projet-economique-territorial") {
    const published = createCatalogLearningSessionQuestions(["question:politique-nationale:document-interpretation-008"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "politique-nationale",
      notionTitle: "Politique nationale",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("politique-nationale", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-politique-nationale-objectifs-1879") {
    const published = createCatalogLearningSessionQuestions(["question:politique-nationale:document-interpretation-009"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "politique-nationale",
      notionTitle: "Politique nationale",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("politique-nationale", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-politique-nationale-espaces") {
    const published = createCatalogLearningSessionQuestions(["question:politique-nationale:interactive-association-001"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "politique-nationale",
      notionTitle: "Politique nationale",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("politique-nationale", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-migrations-intervention-colonisation") {
    const published = createCatalogLearningSessionQuestions(["question:migrations:document-interpretation-001"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "migrations",
      notionTitle: "Migrations",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("migrations", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-migrations-mouvements-causes") {
    const published = createCatalogLearningSessionQuestions(["question:migrations:interactive-association-001"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "migrations",
      notionTitle: "Migrations",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("migrations", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-migrations-evolution-population") {
    const published = createCatalogLearningSessionQuestions(["question:migrations:short-answer-001"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "migrations",
      notionTitle: "Migrations",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("migrations", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-migrations-departure-factors") {
    const published = createCatalogLearningSessionQuestions(["question:migrations:short-answer-002"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "migrations",
      notionTitle: "Migrations",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("migrations", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-migrations-emigration-colonization-causality") {
    const published = createCatalogLearningSessionQuestions(["question:migrations:short-answer-003"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "migrations",
      notionTitle: "Migrations",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("migrations", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-migrations-famine-grosse-ile") {
    const published = createCatalogLearningSessionQuestions(["question:migrations:short-answer-004"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "migrations",
      notionTitle: "Migrations",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("migrations", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-migrations-exode-emigration-comparison") {
    const published = createCatalogLearningSessionQuestions(["question:migrations:short-answer-005"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "migrations",
      notionTitle: "Migrations",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("migrations", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-migrations-saguenay-innu-consequence") {
    const published = createCatalogLearningSessionQuestions(["question:migrations:short-answer-006"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "migrations",
      notionTitle: "Migrations",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("migrations", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-migrations-industrialization-transport") {
    const published = createCatalogLearningSessionQuestions(["question:migrations:short-answer-007"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "migrations",
      notionTitle: "Migrations",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("migrations", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-migrations-chronological-association") {
    const published = createCatalogLearningSessionQuestions(["question:migrations:interactive-association-002"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "migrations",
      notionTitle: "Migrations",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("migrations", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-eglise-ultramontains-anticlericaux") {
    const published = createCatalogLearningSessionQuestions(["question:presence-de-l-eglise-catholique:short-answer-001"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "presence-de-l-eglise-catholique",
      notionTitle: "La présence de l’Église catholique",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("presence-de-l-eglise-catholique", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-eglise-identite-canadienne-francaise") {
    const published = createCatalogLearningSessionQuestions(["question:presence-de-l-eglise-catholique:short-answer-002"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "presence-de-l-eglise-catholique",
      notionTitle: "La présence de l’Église catholique",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("presence-de-l-eglise-catholique", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-eglise-concepts-association") {
    const published = createCatalogLearningSessionQuestions(["question:presence-de-l-eglise-catholique:interactive-association-003"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "presence-de-l-eglise-catholique",
      notionTitle: "La présence de l’Église catholique",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("presence-de-l-eglise-catholique", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-eglise-systeme-scolaire-composition-religieuse") {
    const published = createCatalogLearningSessionQuestions(["question:presence-de-l-eglise-catholique:short-answer-004"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "presence-de-l-eglise-catholique",
      notionTitle: "La présence de l’Église catholique",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("presence-de-l-eglise-catholique", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-eglise-presence-changement-continuite") {
    const published = createCatalogLearningSessionQuestions(["question:presence-de-l-eglise-catholique:short-answer-005"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "presence-de-l-eglise-catholique",
      notionTitle: "La présence de l’Église catholique",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("presence-de-l-eglise-catholique", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-manifestations-enseignement-superieur") {
    const published = createCatalogLearningSessionQuestions(["question:manifestations-socioculturelles:short-answer-002"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "manifestations-socioculturelles",
      notionTitle: "Manifestations socioculturelles",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("manifestations-socioculturelles", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-manifestations-oeuvres-patriotiques") {
    const published = createCatalogLearningSessionQuestions(["question:manifestations-socioculturelles:short-answer-001"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "manifestations-socioculturelles",
      notionTitle: "Manifestations socioculturelles",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("manifestations-socioculturelles", "teacher-assigned", activityId),
      source: "local_demo",
      localDemoNotice: "",
      documentCatalog: published.documents,
      questions: published.questions,
    };
  }

  if (activityId === "demo-activity-manifestations-femmes-vie-litteraire") {
    const published = createCatalogLearningSessionQuestions(["question:manifestations-socioculturelles:short-answer-003"]);
    return {
      id: `local-session-${activityId}`,
      activityId,
      activityTitle,
      origin: "teacher_assigned",
      notionId: "manifestations-socioculturelles",
      notionTitle: "Manifestations socioculturelles",
      historicalPeriod: { startYear: 1840, endYear: 1896 },
      currentQuestionIndex: 0,
      dashboardHref: getDashboardUrl("manifestations-socioculturelles", "teacher-assigned", activityId),
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
      isCausalChainPrototype ? {
        id: RESPONSIBLE_GOVERNMENT_CAUSAL_CHAIN_QUESTION.id,
        type: "interactive_causal_chain",
        format: "short-answer",
        number: 1,
        prompt: RESPONSIBLE_GOVERNMENT_CAUSAL_CHAIN_QUESTION.prompt,
        instruction: RESPONSIBLE_GOVERNMENT_CAUSAL_CHAIN_QUESTION.instruction,
        primaryOperationId: RESPONSIBLE_GOVERNMENT_CAUSAL_CHAIN_QUESTION.operationId,
        intellectualOperations: [{ id: "causal_connections", label: "Établir des liens de causalité" }],
        historicalKnowledgeIds: ["gouvernement-responsable", "instabilite-ministerielle", "grande-coalition"],
        documentRelations: [], requiredDocumentIds: [],
        localHint: "Suis les événements de 1848 à 1864 : accomplissement, loi, réaction, problème politique, cause du problème, puis solution.",
        initialMessages: [{ id: "causal-chain-welcome", author: "socrato", content: SOCRATO_INITIAL_RESPONSE_PROMPT }],
        causalChainInteraction: RESPONSIBLE_GOVERNMENT_CAUSAL_CHAIN_QUESTION.causalChainInteraction,
      } : isAssociationPrototype ? {
        id: associationQuestion.id,
        type: "interactive_association",
        format: "interactive-association",
        number: 1,
        prompt: associationQuestion.prompt,
        instruction: associationQuestion.instruction,
        primaryOperationId: associationQuestion.operationId,
        intellectualOperations: [{ id: associationQuestion.operationId, label: associationOperation?.officialLabel ?? associationQuestion.operationId }],
        historicalKnowledgeIds: isCompetencyAssociationPrototype ? ["relations-federales-provinciales", "champs-de-competence", "articles-91-92", "education", "desaveu"] : ["acte-union-1840", "institutions-politiques"],
        documentRelations: [],
        requiredDocumentIds: [],
        localHint: isCompetencyAssociationPrototype ? "L’article 91 énumère les compétences fédérales. L’article 92 énumère les compétences provinciales; l’éducation est précisée à l’article 93." : "Distingue d’abord les institutions élues des institutions nommées, puis repère celles qui conseillent ou représentent la Couronne.",
        initialMessages: [{ id: "association-welcome", author: "socrato", content: SOCRATO_INITIAL_RESPONSE_PROMPT }],
        associationInteraction: associationQuestion.associationInteraction,
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
        historicalKnowledgeIds: [...timelineQuestion.relatedKnowledgeHeadingIds],
        documentRelations: [],
        requiredDocumentIds: [],
        localHint: "initialGuidance" in timelineQuestion ? timelineQuestion.initialGuidance : timelineQuestion.instruction,
        initialMessages: [{ id: "timeline-welcome", author: "socrato", content: SOCRATO_INITIAL_RESPONSE_PROMPT }],
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
            content: SOCRATO_INITIAL_RESPONSE_PROMPT,
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
    if (process.env.NODE_ENV === "production" && !isLocalStudentDemoEnabled()) {
      throw new Error("The local demonstration learning-session provider is disabled in production.");
    }
    const mode: DashboardMode = requestedMode === "notion-review" ? "notion-review" : "teacher-assigned";
    return createDemoStudentLearningSession(activityId, requestedNotionId, mode);
  }
}
