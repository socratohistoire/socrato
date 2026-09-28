import { IndustrialisationPartieB } from "@/app/components/industrialisation-partie-b";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
export const dynamic = "force-dynamic";
export const metadata = { title: "Modèle d’activité — Industrialisation | Socrato" };
export default async function IndustrialisationTeacherPage() {
  const teacher = await requireTeacherActor();
  return <IndustrialisationPartieB teacherMode storageScope={`teacher-${teacher.id}`} />;
}
