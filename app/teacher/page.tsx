import { notFound } from "next/navigation";
import { LOCAL_DEMO_TEACHER_ID, LocalDemoTeacherDashboardProvider, createTeacherDashboardViewModel, isLocalTeacherDashboardEnabled } from "@/lib/teacher-dashboard";
import { TeacherDashboardView } from "./teacher-dashboard-view";
import "./teacher-dashboard.css";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage({ searchParams }: { searchParams: Promise<{ activity?: string | string[] }> }) {
  if (!isLocalTeacherDashboardEnabled()) notFound();
  const data = await new LocalDemoTeacherDashboardProvider().getDashboard(LOCAL_DEMO_TEACHER_ID);
  const requestedActivity = (await searchParams).activity;
  const selectedActivityId = typeof requestedActivity === "string" ? requestedActivity : requestedActivity?.[0];
  return <TeacherDashboardView data={createTeacherDashboardViewModel({ ...data, selectedActivityId: selectedActivityId ?? data.selectedActivityId })} />;
}
