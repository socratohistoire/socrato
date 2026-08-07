import { LOCAL_TEACHER_ID } from "../academic-context/index.ts";
import { isTeacherAuthenticationEnabled } from "../supabase/config.ts";
import { createSocratoSupabaseServerClient } from "../supabase/server.ts";

export type TeacherActor = { id: string; identityProviderSubject: string; displayName: string; email: string | null; onboardingCompletedAt: string | null };

export async function requireTeacherActor(): Promise<TeacherActor> {
  if (!isTeacherAuthenticationEnabled()) return { id: LOCAL_TEACHER_ID, identityProviderSubject: "local-demo-teacher", displayName: "Enseignante fictive", email: null, onboardingCompletedAt: null };
  const supabase = await createSocratoSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Une connexion enseignante valide est requise.");
  const emailName = user.email?.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  return {
    id: `teacher-${user.id}`,
    identityProviderSubject: user.id,
    displayName: typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim() ? user.user_metadata.full_name.trim() : emailName || "Enseignant Socrato",
    email: user.email ?? null,
    onboardingCompletedAt: typeof user.user_metadata?.socrato_onboarding_completed_at === "string" ? user.user_metadata.socrato_onboarding_completed_at : null,
  };
}
