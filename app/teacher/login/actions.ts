"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSocratoSupabaseServerClient } from "@/lib/supabase/server";
import { getTeacherAccessRole } from "@/lib/authentication/teacher-access";

export async function sendTeacherMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const requestedReturnTo = String(formData.get("returnTo") ?? "");
  const returnTo = /^\/(?:teacher|admin)(?:\/|$)/.test(requestedReturnTo) ? requestedReturnTo : "/teacher";
  const loginUrl = `/teacher/login?returnTo=${encodeURIComponent(returnTo)}`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect(`${loginUrl}&error=invalid-email`);
  if (!await getTeacherAccessRole(email)) redirect(`${loginUrl}&error=not-authorized`);
  const requestHeaders = await headers();
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const requestOrigin = requestHeaders.get("origin");
  const origin = requestOrigin === configuredSiteUrl ? requestOrigin : configuredSiteUrl;
  const supabase = await createSocratoSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}` } });
  if (error) redirect(`${loginUrl}&error=send-failed`);
  redirect(`${loginUrl}&sent=1`);
}
