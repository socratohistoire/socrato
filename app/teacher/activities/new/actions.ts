"use server";

import type { LocalPublishedActivity } from "@/lib/local-published-activities";
import { saveDemoPublishedActivity, savePersonalizedPublishedActivity } from "@/lib/server/published-activities";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";

export async function publishActivityToSupabase(activity: LocalPublishedActivity, target?: { groupId: string; studentId: string }) {
  const teacher = await requireTeacherActor();
  return target ? savePersonalizedPublishedActivity(activity, teacher, target) : saveDemoPublishedActivity(activity, teacher);
}
