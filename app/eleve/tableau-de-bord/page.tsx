import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getStudentAccessRuntime,
  STUDENT_SESSION_COOKIE,
} from "@/lib/student-access/local-runtime";
import { loadAuthorizedStudentDashboard } from "@/lib/student-dashboard/access";
import { LocalDemoStudentDashboardProvider } from "@/lib/student-dashboard/demo-provider";
import { DatabaseStudentDashboardProvider } from "@/lib/student-dashboard/database-provider";
import type { StudentDashboardData } from "@/lib/student-dashboard/types";
import { StudentDashboardView } from "./dashboard-view";
import "./dashboard.css";

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ activity?: string }>;
}) {
  const cookieStore = await cookies();
  const { activity } = await searchParams;
  const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;
  let data: StudentDashboardData | null;

  try {
    data = await loadAuthorizedStudentDashboard(
      token,
      getStudentAccessRuntime().sessions,
      process.env.DATABASE_URL ? new DatabaseStudentDashboardProvider() : new LocalDemoStudentDashboardProvider(),
      activity,
    );
  } catch {
    redirect("/eleve");
  }

  if (!data) {
    redirect("/eleve");
  }

  return <StudentDashboardView data={data} />;
}
