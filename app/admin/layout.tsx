import { requireAdminActor } from "@/lib/authentication/teacher-access";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdminActor();
  } catch (error) {
    if (error instanceof Error && error.message === "Une connexion enseignante valide est requise.") {
      redirect(`/teacher/login?returnTo=${encodeURIComponent("/admin/pedagogical-reference")}`);
    }
    throw error;
  }
  return children;
}
