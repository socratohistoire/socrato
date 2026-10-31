import { StudentLearningSessionView } from "@/app/eleve/activite/[activityId]/session-view";
import { createDemoStudentLearningSession } from "@/lib/student-learning-session/demo-provider";
import "@/app/eleve/activite/[activityId]/session.css";
import "@/app/eleve/activite/[activityId]/association-documents-compact.css";

export const dynamic = "force-dynamic";

export default function EgliseConceptsAssociationPreviewPage() {
  const data = createDemoStudentLearningSession(
    "demo-activity-eglise-concepts-association",
    "presence-de-l-eglise-catholique",
    "teacher-assigned",
  );

  if (!data) return null;

  return <StudentLearningSessionView data={data} persistProgress={false} teacherPreview />;
}
