import { notFound } from "next/navigation";
import { LOCAL_DEMO_TEACHER_ID, LocalDemoTeacherDashboardProvider, createStoredTeacherDashboardData, createTeacherDashboardViewModel, isLocalTeacherDashboardEnabled } from "@/lib/teacher-dashboard";
import { TeacherDashboardView } from "./teacher-dashboard-view";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { listStoredTeacherGroups } from "@/lib/server/teacher-groups";
import { listStoredTeacherActivities } from "@/lib/server/teacher-activities";
import "./teacher-dashboard.css";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage({ searchParams }: { searchParams: Promise<{ activity?: string | string[]; welcome?: string | string[]; demo?: string | string[] }> }) {
  if (!isLocalTeacherDashboardEnabled()) notFound();
  const authenticatedTeacher = await requireTeacherActor();
  const [storedTeacherGroups, storedTeacherActivities] = await Promise.all([
    listStoredTeacherGroups(authenticatedTeacher.id),
    listStoredTeacherActivities(authenticatedTeacher.id),
  ]);
  const resolvedSearchParams = await searchParams;
  const explicitDemoMode = resolvedSearchParams.demo === "1";
  const data = explicitDemoMode
    ? await new LocalDemoTeacherDashboardProvider().getDashboard(LOCAL_DEMO_TEACHER_ID)
    : createStoredTeacherDashboardData(authenticatedTeacher, storedTeacherGroups);
  const requestedActivity = resolvedSearchParams.activity;
  const showConfigurationWelcome = resolvedSearchParams.welcome === "1";
  const selectedActivityId = typeof requestedActivity === "string" ? requestedActivity : requestedActivity?.[0];
  return <TeacherDashboardView authenticatedTeacher={authenticatedTeacher} storedTeacherGroups={explicitDemoMode ? [] : storedTeacherGroups} storedTeacherActivities={explicitDemoMode ? [] : storedTeacherActivities} showConfigurationWelcome={showConfigurationWelcome} data={createTeacherDashboardViewModel({ ...data, selectedActivityId: selectedActivityId ?? data.selectedActivityId })} />;
}
