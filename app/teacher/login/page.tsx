import { redirect } from "next/navigation";
import { createSocratoSupabaseServerClient } from "@/lib/supabase/server";
import { isTeacherAuthenticationEnabled } from "@/lib/supabase/config";
import { sendTeacherMagicLink } from "./actions";
import "./teacher-login.css";

export const dynamic = "force-dynamic";

export default async function TeacherLoginPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string; returnTo?: string }> }) {
  if (!isTeacherAuthenticationEnabled()) redirect("/teacher");
  const params = await searchParams;
  const returnTo = /^\/(?:teacher|admin)(?:\/|$)/.test(params.returnTo ?? "") ? params.returnTo! : "/teacher";
  const supabase = await createSocratoSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(returnTo);
  const errorMessage = params.error === "invalid-email" ? "Inscrivez une adresse courriel valide." : params.error === "not-authorized" ? "Cette adresse n’est pas encore autorisée pour l’espace enseignant." : params.error ? "Le lien n’a pas pu être utilisé. Réessayez." : null;
  return <main className="teacher-login-page"><section className="teacher-login-card" aria-labelledby="teacher-login-title">
    <p className="teacher-login-brand">SOCRATO</p><h1 id="teacher-login-title">Espace enseignant</h1>
    <p className="teacher-login-intro">Connectez-vous sans mot de passe. Un lien sécurisé et temporaire sera envoyé à votre adresse autorisée.</p>
    {params.sent === "1" ? <p className="teacher-login-success" role="status">Le lien de connexion a été envoyé. Consultez votre boîte courriel sur ce même appareil.</p> : null}
    {errorMessage ? <p className="teacher-login-error" role="alert">{errorMessage}</p> : null}
    <form action={sendTeacherMagicLink}><input name="returnTo" type="hidden" value={returnTo}/><label htmlFor="teacher-email">Adresse courriel</label><input id="teacher-email" name="email" type="email" inputMode="email" autoComplete="email" required placeholder="nom@ecole.ca"/><button type="submit">Recevoir un lien de connexion</button></form>
    <div className="teacher-login-separator"><span>ou</span></div><button className="teacher-microsoft-pending" type="button" disabled>Continuer avec Microsoft <small>Bientôt disponible</small></button>
    <p className="teacher-login-note">Seules les adresses autorisées par l’administration de Socrato peuvent accéder à cet espace.</p>
  </section></main>;
}
