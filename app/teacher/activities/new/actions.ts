"use server";

import type { LocalPublishedActivity } from "@/lib/local-published-activities";
import { saveDemoPublishedActivity } from "@/lib/server/published-activities";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";

export async function publishActivityToSupabase(activity: LocalPublishedActivity) {
  return saveDemoPublishedActivity(activity, await requireTeacherActor());
}
