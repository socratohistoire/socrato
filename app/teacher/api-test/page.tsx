import { StudentLearningSessionView } from "@/app/eleve/activite/[activityId]/session-view";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getQuestionsForKnowledgeHeading } from "@/lib/pedagogical-reference";
import { createCatalogLearningSessionQuestions } from "@/lib/student-learning-session/demo-provider";
import "@/app/eleve/activite/[activityId]/session.css";

export const dynamic = "force-dynamic";

export default async function TeacherApiTestPage() {
  await requireTeacherActor();
  const approved = getQuestionsForKnowledgeHeading("acte-union");
  const catalog = createCatalogLearningSessionQuestions(approved.map(({ id }) => id));
  return <StudentLearningSessionView
    teacherPreview
    teacherApiTest
    persistProgress={false}
    teacherPreviewExitHref="/teacher"
    data={{
      id: "teacher-api-test", activityId: "teacher-api-test", activityTitle: "Banc d’essai de Sol — Acte d’Union",
      origin: "teacher_assigned", notionId: "acte-union", notionTitle: "Acte d’Union",
      historicalPeriod: { startYear: 1840, endYear: 1896 }, currentQuestionIndex: 0,
      questions: catalog.questions, documentCatalog: catalog.documents, dashboardHref: "/teacher",
      source: "local_demo", localDemoNotice: "",
    }}
  />;
}
