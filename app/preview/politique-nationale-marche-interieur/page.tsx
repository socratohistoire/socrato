import { StudentLearningSessionView } from "@/app/eleve/activite/[activityId]/session-view";
import { createDemoStudentLearningSession } from "@/lib/student-learning-session/demo-provider";
import "@/app/eleve/activite/[activityId]/session.css";

export default function NationalPolicyDomesticMarketPreviewPage() {
  const data = createDemoStudentLearningSession(
    "demo-activity-politique-nationale-marche-interieur",
    "politique-nationale",
    "teacher-assigned",
  );

  if (!data) return null;

  return <StudentLearningSessionView data={data} persistProgress={false} teacherPreview />;
}
