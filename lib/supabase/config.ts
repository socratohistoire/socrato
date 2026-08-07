export function getSupabasePublicConfiguration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("L’authentification Supabase n’est pas configurée.");
  return { url, publishableKey };
}

export function isTeacherAuthenticationEnabled() {
  return process.env.SOCRATO_TEACHER_AUTH_ENABLED === "enabled";
}
