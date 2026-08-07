import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStudentAccessRuntime, STUDENT_SESSION_COOKIE } from "@/lib/student-access/local-runtime";
import { loadAuthorizedStudentLearningSession } from "@/lib/student-learning-session/access";
import { LocalDemoStudentLearningSessionProvider } from "@/lib/student-learning-session/demo-provider";
import { DatabaseStudentLearningSessionProvider } from "@/lib/student-learning-session/database-provider";
import { StudentLearningSessionView } from "./session-view";
import "./session.css";

export default async function StudentLearningSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ activityId: string }>;
  searchParams: Promise<{ notion?: string; mode?: string }>;
}) {
  const [{ activityId }, { notion, mode }, cookieStore] = await Promise.all([
    params,
    searchParams,
    cookies(),
  ]);
  const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;

  let data;
  try {
    data = await loadAuthorizedStudentLearningSession(
      token,
      getStudentAccessRuntime().sessions,
      process.env.DATABASE_URL ? new DatabaseStudentLearningSessionProvider() : new LocalDemoStudentLearningSessionProvider(),
      activityId,
      notion,
      mode,
    );
  } catch {
    redirect("/eleve");
  }

  if (!data) redirect("/eleve");
  return <StudentLearningSessionView data={data} />;
}
