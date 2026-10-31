import { StudentLearningSessionView } from "@/app/eleve/activite/[activityId]/session-view";
import { createDemoStudentLearningSession } from "@/lib/student-learning-session/demo-provider";
import "@/app/eleve/activite/[activityId]/session.css";

export const dynamic = "force-dynamic";

export default function ManifestationsFemmesVieLitterairePreviewPage() {
  const data = createDemoStudentLearningSession(
    "demo-activity-manifestations-femmes-vie-litteraire",
    "manifestations-socioculturelles",
    "teacher-assigned",
  );

  if (!data) return null;

  return <StudentLearningSessionView data={data} persistProgress={false} teacherPreview />;
}
