import { EgliseCatholiquePartieB } from "@/app/components/eglise-catholique-partie-b";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Modèle d’activité — Présence d’une institution | Socrato" };

export default async function EgliseCatholiqueTeacherPage() {
  const teacher = await requireTeacherActor();
  return <EgliseCatholiquePartieB teacherMode storageScope={`teacher-${teacher.id}`} />;
}
