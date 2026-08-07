"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSocratoSupabaseServerClient } from "@/lib/supabase/server";

function normalizedAllowedEmails() {
  return new Set((process.env.SOCRATO_TEACHER_EMAIL_ALLOWLIST ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
}

export async function sendTeacherMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/teacher/login?error=invalid-email");
  const allowedEmails = normalizedAllowedEmails();
  if (allowedEmails.size === 0 || !allowedEmails.has(email)) redirect("/teacher/login?error=not-authorized");
  const requestHeaders = await headers();
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const requestOrigin = requestHeaders.get("origin");
  const origin = requestOrigin === configuredSiteUrl ? requestOrigin : configuredSiteUrl;
  const supabase = await createSocratoSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/auth/callback?returnTo=${encodeURIComponent("/teacher")}` } });
  if (error) redirect("/teacher/login?error=send-failed");
  redirect("/teacher/login?sent=1");
}
