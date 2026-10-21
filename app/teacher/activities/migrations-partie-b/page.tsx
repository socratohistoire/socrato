import { MigrationsPartieB } from "@/app/components/migrations-partie-b";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Modèle d’activité — Migrations | Socrato" };

export default async function MigrationsTeacherPage() {
  const teacher = await requireTeacherActor();
  return <MigrationsPartieB teacherMode storageScope={`teacher-${teacher.id}`} />;
}
