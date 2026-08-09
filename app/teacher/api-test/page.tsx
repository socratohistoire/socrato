import Link from "next/link";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getQuestionsForKnowledgeHeading } from "@/lib/pedagogical-reference";
import { createCatalogLearningSessionQuestions } from "@/lib/student-learning-session/demo-provider";
import { ApiTestView } from "./test-view";
import "./test-view.css";

export const dynamic = "force-dynamic";

export default async function TeacherApiTestPage() {
  await requireTeacherActor();
  const approved = getQuestionsForKnowledgeHeading("acte-union");
  const catalog = createCatalogLearningSessionQuestions(approved.map(({ id }) => id));
  const documents = new Map(catalog.documents.map((document) => [document.id, document]));
  const questions = catalog.questions.map((question) => ({
    id: question.id, number: question.number, format: question.format ?? question.type,
    prompt: question.prompt,
    operation: question.intellectualOperations.find(({ id }) => id === question.primaryOperationId)?.label ?? question.primaryOperationId,
    expectedAnswer: approved.find(({ id }) => id === question.id)?.expectedAnswer ?? "",
    documents: question.documentRelations.flatMap(({ documentId }) => {
      const document = documents.get(documentId);
      return document ? [{ id: document.id, title: document.title, typeLabel: document.typeLabel }] : [];
    }),
  }));
  return (
    <main className="api-test-shell">
      <header className="api-test-header">
        <div><p className="api-test-kicker">Espace enseignant</p><h1>Banc d’essai de Terra</h1><p>Testez les 37 questions de l’Acte d’Union sans modifier la progression d’un élève.</p></div>
        <Link href="/teacher">Retour au tableau de bord</Link>
      </header>
      <ApiTestView questions={questions} />
    </main>
  );
}
