import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getStudentAccessRuntime,
  STUDENT_SESSION_COOKIE,
} from "@/lib/student-access/local-runtime";

export default async function TemporaryStudentDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/eleve");
  }

  try {
    const session = await getStudentAccessRuntime().sessions.findActiveByToken(token);
    if (!session) {
      redirect("/eleve");
    }
  } catch {
    redirect("/eleve");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#efefed] p-6 text-[#0d2945]">
      <section className="w-full max-w-2xl rounded-[28px] bg-[#fbf8f2] p-10 text-center shadow-[0_14px_45px_rgba(15,23,42,0.12)]">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a6a3d]">
          Page temporaire du pilote
        </p>
        <h1 className="mt-4 font-[family:var(--font-cormorant)] text-4xl font-semibold">
          Espace élève
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-700">
          Ton code a été validé. Le tableau de bord d’apprentissage sera ajouté
          dans une prochaine étape.
        </p>
      </section>
    </main>
  );
}
