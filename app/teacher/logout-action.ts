"use server";

import { redirect } from "next/navigation";
import { createSocratoSupabaseServerClient } from "@/lib/supabase/server";

export async function signOutTeacher() {
  const supabase = await createSocratoSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/teacher/login?signed-out=1");
}
