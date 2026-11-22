import { PolitiqueNationalePartieB } from "@/app/components/politique-nationale-partie-b";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { POLITIQUE_NATIONALE_ANSWERS, POLITIQUE_NATIONALE_DOCUMENT_FEEDBACK } from "@/lib/politique-nationale-partie-b";

export const dynamic = "force-dynamic";
export const metadata = { title: "Modèle d’activité — Politique nationale | Socrato" };

export default async function PolitiqueNationaleTeacherPage() {
  const teacher = await requireTeacherActor();
  return <PolitiqueNationalePartieB teacherMode storageScope={`teacher-${teacher.id}`} correctionAnswers={POLITIQUE_NATIONALE_ANSWERS} correctionFeedback={POLITIQUE_NATIONALE_DOCUMENT_FEEDBACK} />;
}
