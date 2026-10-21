import { PolitiqueNationalePartieB } from "@/app/components/politique-nationale-partie-b";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Modèle d’activité — Politique nationale | Socrato" };

export default async function PolitiqueNationaleTeacherPage() {
  const teacher = await requireTeacherActor();
  return <PolitiqueNationalePartieB teacherMode storageScope={`teacher-${teacher.id}`} />;
}
