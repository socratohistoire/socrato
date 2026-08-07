import type { LocalActivityPublicationStatus, LocalPublishedActivity } from "../local-published-activities/store.ts";
import type { PedagogicalSummary } from "../pedagogical-session-engine/types.ts";
import type { StudentDashboardData } from "../student-dashboard/types.ts";
import type { StudentProgressContract } from "../student-progress/types.ts";
import type { TeacherActivityDraft } from "../teacher-activity-drafts/types.ts";

export const SOCRATO_API_VERSION = "v1" as const;
export const SOCRATO_API_BASE_PATH = `/api/${SOCRATO_API_VERSION}` as const;

export const SOCRATO_API_ROUTES = {
  studentDashboard: `${SOCRATO_API_BASE_PATH}/student/dashboard`,
  studentProgress: `${SOCRATO_API_BASE_PATH}/student/progress`,
  studentOutcomes: `${SOCRATO_API_BASE_PATH}/student/outcomes`,
  teacherActivities: `${SOCRATO_API_BASE_PATH}/teacher/activities`,
  activeTeacherDraft: `${SOCRATO_API_BASE_PATH}/teacher/activity-drafts/active`,
} as const;

export function activityStatusRoute(activityId: string) {
  return `${SOCRATO_API_ROUTES.teacherActivities}/${encodeURIComponent(activityId)}/status`;
}

export function studentProgressRoute(activityId: string) {
  return `${SOCRATO_API_ROUTES.studentProgress}/${encodeURIComponent(activityId)}`;
}

export function studentOutcomeRoute(activityId: string) {
  return `${SOCRATO_API_ROUTES.studentOutcomes}/${encodeURIComponent(activityId)}`;
}

export type SocratoApiContract = {
  "GET /student/dashboard": {
    query: { activityId?: string };
    response: StudentDashboardData;
  };
  "GET /teacher/activities": { response: LocalPublishedActivity[] };
  "POST /teacher/activities": { body: LocalPublishedActivity; response: LocalPublishedActivity };
  "PATCH /teacher/activities/:activityId/status": {
    body: { publicationStatus: LocalActivityPublicationStatus };
    response: LocalPublishedActivity[];
  };
  "GET /teacher/activity-drafts/active": { response: TeacherActivityDraft | null };
  "PUT /teacher/activity-drafts/active": { body: TeacherActivityDraft; response: TeacherActivityDraft };
  "DELETE /teacher/activity-drafts/active": { response: null };
  "GET /student/progress": { response: Record<string, StudentProgressContract> };
  "PUT /student/progress/:activityId": { body: StudentProgressContract; response: StudentProgressContract };
  "DELETE /student/progress/:activityId": { response: null };
  "GET /student/outcomes": { response: Record<string, PedagogicalSummary> };
  "PUT /student/outcomes/:activityId": { body: PedagogicalSummary; response: PedagogicalSummary };
  "DELETE /student/outcomes/:activityId": { response: null };
};
