import type { StudentActivity, StudentDashboardData } from "../student-dashboard/types.ts";
import type { LocalPublishedActivity } from "./store.ts";
import { LOCAL_STUDENT_GROUP_ID } from "../academic-context/local-context.ts";
import { prioritizeDashboardActivities } from "../student-dashboard/selection.ts";

export const LOCAL_DEMO_STUDENT_GROUP_ID = LOCAL_STUDENT_GROUP_ID;

function formatPublicationDate(value: string) {
  return new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Toronto" }).format(new Date(value));
}

function getLocalLearningSessionUrl(activity: LocalPublishedActivity) {
  const params = new URLSearchParams({
    notion: activity.notionIds[0] ?? "acte-union",
    notions: activity.notionIds.join(","),
    title: activity.title,
    workType: activity.workType,
    operation: activity.operationId ?? "",
    questionIds: activity.questionIds.join(","),
    published: "1",
    activityId: activity.id,
  });
  return `/teacher/activities/new/student-preview?${params.toString()}`;
}

function toStudentActivity(activity: LocalPublishedActivity, data: StudentDashboardData): StudentActivity {
  const firstNotion = data.notions.find(({ id }) => activity.notionIds.includes(id));
  const operationCatalog = data.activities.flatMap(({ operations }) => operations);
  const selectedOperation = activity.operationId ? operationCatalog.find(({ id }) => id === activity.operationId) : undefined;
  return {
    id: activity.id,
    activityTitle: activity.title,
    activityType: activity.workType,
    publicationDate: formatPublicationDate(activity.publishedAt),
    historicalPeriod: firstNotion?.historicalPeriod ?? { displayLabel: "Histoire du Québec et du Canada" },
    notionIds: activity.notionIds,
    historicalKnowledgeIds: [],
    durationMinutes: 0,
    progressPercentage: 0,
    activityStatus: "not_started",
    origin: "teacher_assigned",
    isRecent: true,
    actionHref: getLocalLearningSessionUrl(activity),
    operations: selectedOperation ? [{ ...selectedOperation, status: "not_assessed" }] : [],
    historicalKnowledge: [],
    summary: { state: "pending", strengths: [], consolidationTargets: [], recommendation: null, consolidationActivity: null, consolidationProgress: null },
  };
}

export function applyLocalPublishedActivitiesToStudentDashboard(
  data: StudentDashboardData,
  activities: readonly LocalPublishedActivity[],
  groupId = LOCAL_DEMO_STUDENT_GROUP_ID,
  requestedActivityId?: string | null,
): StudentDashboardData {
  const assigned = activities
    .filter(({ targetedGroupIds, questionIds, publicationStatus }) => (publicationStatus ?? "published") === "published" && targetedGroupIds.includes(groupId) && questionIds.length > 0)
    .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime())
    .map((activity, index) => ({ ...toStudentActivity(activity, data), isRecent: index === 0 }));
  const activityIds = new Set(assigned.map(({ id }) => id));
  const mergedActivities = prioritizeDashboardActivities([...assigned, ...data.activities.filter(({ id }) => !activityIds.has(id))]);
  const defaultActivityId = mergedActivities[0]?.id ?? data.defaultActivityId;
  const selectedActivityId = requestedActivityId && mergedActivities.some(({ id }) => id === requestedActivityId)
    ? requestedActivityId
    : defaultActivityId;
  return { ...data, defaultActivityId, activities: mergedActivities, selectedActivityId };
}
