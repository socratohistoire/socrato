import { StudentLearningSessionView } from "@/app/eleve/activite/[activityId]/session-view";
import { createDemoStudentLearningSession } from "@/lib/student-learning-session/demo-provider";
import "@/app/eleve/activite/[activityId]/session.css";

export default function MigrationsColonizationInterventionPreviewPage() {
  const data = createDemoStudentLearningSession(
    "demo-activity-migrations-intervention-colonisation",
    "migrations",
    "teacher-assigned",
  );

  if (!data) return null;

  return <StudentLearningSessionView data={data} persistProgress={false} teacherPreview />;
}
