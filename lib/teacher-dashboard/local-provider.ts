import type { TeacherDashboardProvider } from "./provider.ts";
import type { TeacherDashboardData } from "./types.ts";

export const LOCAL_DEMO_TEACHER_ID = "teacher-demo-local";

export function isLocalTeacherDashboardEnabled(environment = process.env.NODE_ENV) {
  return environment !== "production";
}

export function createLocalTeacherDashboardData(): TeacherDashboardData {
  const activities = [
    {
      id: "activity-revision-01",
      summaryVersion: "v2",
      activityType: "revision" as const,
      customTitle: "Révision avant l’évaluation 1",
      publishedAt: "2025-05-16",
      targetedGroupIds: ["group-demo-401", "group-demo-402", "group-demo-403", "group-demo-404", "group-demo-405", "group-demo-406", "group-demo-407"],
      completedStudentCount: 80,
      targetedStudentCount: 85,
      resultAvailability: "available" as const,
      socratoObservation: {
        progression: "majority_completed" as const,
        strength: "historical_knowledge" as const,
        difficulty: "cause_consequence" as const,
      },
      groupPortraits: [
        { id: "portrait-401", activityId: "activity-revision-01", name: "Groupe fictif 401", observation: "Les résultats montrent une bonne maîtrise des causes et conséquences de l’Acte d’union.", suggestion: "Suggestion fictive : Poursuivre sur les liens entre documents et contexte politique.", completedStudentCount: 21, targetedStudentCount: 24, groupDetailHref: "/teacher/activities/activity-revision-01/groups/group-demo-401" },
        { id: "portrait-402", activityId: "activity-revision-01", name: "Groupe fictif 402", observation: "Les bilans restent partiels autour des documents historiques, mais les progrès sont visibles.", suggestion: "Suggestion fictive : Renforcer la comparaison entre deux sources différentes.", completedStudentCount: 18, targetedStudentCount: 23 },
        { id: "portrait-403", activityId: "activity-revision-01", name: "Groupe fictif 403", observation: "Le raisonnement causal reste fragile pour plusieurs groupes, malgré un bon repérage du sujet.", suggestion: "Suggestion fictive : Proposer un rappel guidé sur les notions essentielles.", completedStudentCount: 24, targetedStudentCount: 25 },
        { id: "portrait-404", activityId: "activity-revision-01", name: "Groupe fictif 404", observation: "Le travail de synthèse progresse, mais la précision du vocabulaire historique reste à consolider.", suggestion: "Suggestion fictive : Reprendre une courte activité de reformulation avec les documents approuvés.", completedStudentCount: 17, targetedStudentCount: 22 },
        { id: "portrait-405", activityId: "activity-revision-01", name: "Groupe fictif 405", observation: "Les connaissances principales sont comprises, mais les justifications demeurent parfois trop brèves.", suggestion: "Suggestion fictive : Approfondir la justification à l’aide de faits historiques précis.", completedStudentCount: 19, targetedStudentCount: 24 },
        { id: "portrait-406", activityId: "activity-revision-01", name: "Groupe fictif 406", observation: "Les élèves mobilisent correctement les connaissances, mais certains liens entre les événements demeurent imprécis.", suggestion: "Suggestion fictive : Consolider les liens de causalité à l’aide d’un exemple guidé.", completedStudentCount: 20, targetedStudentCount: 23 },
        { id: "portrait-407", activityId: "activity-revision-01", name: "Groupe fictif 407", observation: "La compréhension générale est satisfaisante, mais plusieurs réponses manquent encore de justification historique.", suggestion: "Suggestion fictive : Renforcer la justification avec des faits historiques précis.", completedStudentCount: 22, targetedStudentCount: 26 },
      ],
      highPriorityStudents: [
        { id: "student-demo-a17", displayLabel: "Liam B. (fictif)", groupId: "group-demo-401", groupLabel: "Groupe fictif 401", priority: "high" as const, highPriorityReason: "failed_assessment" as const, reasonLabel: "Maîtrise insuffisante des connaissances ciblées" },
        { id: "student-demo-b08", displayLabel: "Maya L. (fictive)", groupId: "group-demo-402", groupLabel: "Groupe fictif 402", priority: "high" as const, highPriorityReason: "near_failure" as const, reasonLabel: "Difficultés persistantes dans cette activité" },
        { id: "student-demo-d22", displayLabel: "Sofia P. (fictive)", groupId: "group-demo-404", groupLabel: "Groupe fictif 404", priority: "high" as const, highPriorityReason: "near_failure" as const, reasonLabel: "Accompagnement prioritaire recommandé" },
      ],
    },
    {
      id: "activity-enrichment-02",
      summaryVersion: "v1",
      activityType: "enrichment" as const,
      customTitle: "Enrichissement autour de la Constitution",
      publishedAt: "2025-05-20",
      targetedGroupIds: ["group-demo-401", "group-demo-402"],
      completedStudentCount: 41,
      targetedStudentCount: 52,
      resultAvailability: "partial" as const,
      groupPortraits: [
        { id: "portrait-401-b", activityId: "activity-enrichment-02", name: "Groupe fictif 401", observation: "Les premiers résultats montrent de bons progrès sur la comparaison des sources, mais l’activité reste partielle.", suggestion: "Suggestion fictive : Poursuivre la consolidation de la synthèse avec les documents encore à traiter.", completedStudentCount: 22, targetedStudentCount: 28 },
        { id: "portrait-402-b", activityId: "activity-enrichment-02", name: "Groupe fictif 402", observation: "La participation est en forte progression ; les premiers bilans indiquent un besoin de soutien ciblé.", suggestion: "Suggestion fictive : Proposer un accompagnement prioritaire recommandé pour les élèves encore en retard.", completedStudentCount: 19, targetedStudentCount: 24 },
      ],
      highPriorityStudents: [
        { id: "student-demo-c11", displayLabel: "Noah T. (fictif)", groupId: "group-demo-403", groupLabel: "Groupe fictif 403", priority: "high" as const, highPriorityReason: "near_failure" as const, reasonLabel: "Accompagnement prioritaire recommandé" },
        { id: "student-demo-d22", displayLabel: "Sofia P. (fictive)", groupId: "group-demo-404", groupLabel: "Groupe fictif 404", priority: "high" as const, highPriorityReason: "near_failure" as const, reasonLabel: "Accompagnement prioritaire recommandé" },
      ],
    },
    {
      id: "activity-revision-03",
      summaryVersion: "v1",
      activityType: "revision" as const,
      customTitle: "Révision de consolidation",
      publishedAt: "2025-06-02",
      targetedGroupIds: ["group-demo-403", "group-demo-404"],
      completedStudentCount: 0,
      targetedStudentCount: 46,
      resultAvailability: "awaiting_results" as const,
      groupPortraits: [],
      highPriorityStudents: [],
    },
  ];

  return {
    source: "local_demo",
    hasCreatedActivity: true,
    teacher: {
      id: LOCAL_DEMO_TEACHER_ID,
      displayLabel: "Enseignante fictive",
      roleLabel: "Profil local de démonstration",
      initials: "EF",
    },
    weekLabel: "Aperçu fictif de la semaine",
    activities,
    selectedActivityId: "activity-revision-01",
    groupBriefings: activities[0].groupPortraits,
    supportCandidates: [...activities[0].highPriorityStudents],
    groups: [
      {
        id: "group-demo-401",
        name: "Groupe fictif 401",
        studentCount: 28,
        currentActivity: "Révision avant l’évaluation 1 — démonstration",
        currentActivityType: "Révision guidée fictive",
        dueDate: null,
        latestActivity: "Activité fictive sur l’Acte d’union",
        historicalKnowledgeToReview: ["Contexte de l’Acte d’union"],
        intellectualOperationsToReview: ["Déterminer des causes et des conséquences"],
        accessCodeManagementAvailable: false,
      },
      {
        id: "group-demo-402",
        name: "Groupe fictif 402",
        studentCount: 24,
        currentActivity: "Enrichissement autour de la Constitution",
        currentActivityType: "Enrichissement fictif",
        dueDate: null,
        latestActivity: null,
        historicalKnowledgeToReview: [],
        intellectualOperationsToReview: [],
        accessCodeManagementAvailable: false,
      },
      {
        id: "group-demo-403",
        name: "Groupe fictif 403",
        studentCount: 20,
        currentActivity: "Révision de consolidation",
        currentActivityType: "Révision fictive",
        dueDate: null,
        latestActivity: null,
        historicalKnowledgeToReview: [],
        intellectualOperationsToReview: [],
        accessCodeManagementAvailable: false,
      },
      {
        id: "group-demo-404",
        name: "Groupe fictif 404",
        studentCount: 18,
        currentActivity: "Révision avant l’évaluation 1 — démonstration",
        currentActivityType: "Révision guidée fictive",
        dueDate: null,
        latestActivity: null,
        historicalKnowledgeToReview: [],
        intellectualOperationsToReview: [],
        accessCodeManagementAvailable: false,
      },
      {
        id: "group-demo-405",
        name: "Groupe fictif 405",
        studentCount: 24,
        currentActivity: "Révision avant l’évaluation 1 — démonstration",
        currentActivityType: "Révision guidée fictive",
        dueDate: null,
        latestActivity: null,
        historicalKnowledgeToReview: [],
        intellectualOperationsToReview: [],
        accessCodeManagementAvailable: false,
      },
      {
        id: "group-demo-406",
        name: "Groupe fictif 406",
        studentCount: 23,
        currentActivity: "Révision avant l’évaluation 1 — démonstration",
        currentActivityType: "Révision guidée fictive",
        dueDate: null,
        latestActivity: null,
        historicalKnowledgeToReview: [],
        intellectualOperationsToReview: [],
        accessCodeManagementAvailable: false,
      },
      {
        id: "group-demo-407",
        name: "Groupe fictif 407",
        studentCount: 26,
        currentActivity: "Révision avant l’évaluation 1 — démonstration",
        currentActivityType: "Révision guidée fictive",
        dueDate: null,
        latestActivity: null,
        historicalKnowledgeToReview: [],
        intellectualOperationsToReview: [],
        accessCodeManagementAvailable: false,
      },
    ],
  };
}

export class LocalDemoTeacherDashboardProvider implements TeacherDashboardProvider {
  constructor(private readonly environment = process.env.NODE_ENV) {}

  async getDashboard(teacherAccountId: string) {
    if (!isLocalTeacherDashboardEnabled(this.environment)) {
      throw new Error("The local teacher dashboard provider is disabled in production.");
    }
    if (teacherAccountId !== LOCAL_DEMO_TEACHER_ID) {
      throw new Error("Unknown local demonstration teacher.");
    }
    return createLocalTeacherDashboardData();
  }
}
