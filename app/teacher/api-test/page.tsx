import { StudentLearningSessionView } from "@/app/eleve/activite/[activityId]/session-view";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getQuestionsForKnowledgeHeading } from "@/lib/pedagogical-reference";
import { createCatalogLearningSessionQuestions } from "@/lib/student-learning-session/demo-provider";
import "@/app/eleve/activite/[activityId]/session.css";

export const dynamic = "force-dynamic";

type TeacherApiTestQuery = { notion?: string };

const TEST_NOTIONS = {
  "acte-union": { title: "Acte d’Union", startYear: 1840, endYear: 1896 },
  "gouvernement-responsable": { title: "Gouvernement responsable", startYear: 1840, endYear: 1896 },
} as const;

export default async function TeacherApiTestPage({ searchParams }: { searchParams: Promise<TeacherApiTestQuery> }) {
  await requireTeacherActor();
  const query = await searchParams;
  const notionId = query.notion === "gouvernement-responsable" ? query.notion : "acte-union";
  const notion = TEST_NOTIONS[notionId];
  const approved = getQuestionsForKnowledgeHeading(notionId);
  const catalog = createCatalogLearningSessionQuestions(approved.map(({ id }) => id));
  return <StudentLearningSessionView
    teacherPreview
    teacherApiTest
    persistProgress={false}
    teacherPreviewExitHref="/teacher"
    data={{
      id: `teacher-api-test:${notionId}`, activityId: `teacher-api-test:${notionId}`, activityTitle: `Révision complète des ${catalog.questions.length} questions — ${notion.title}`,
      origin: "teacher_assigned", notionId, notionTitle: notion.title,
      historicalPeriod: { startYear: notion.startYear, endYear: notion.endYear }, currentQuestionIndex: 0,
      questions: catalog.questions, documentCatalog: catalog.documents, dashboardHref: "/teacher",
      source: "local_demo", localDemoNotice: "",
    }}
  />;
}
