"use server";

import { revalidatePath } from "next/cache";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getSocratoDatabase } from "@/lib/server/database";
import type { ActivityPublicationStatus } from "@/lib/activity-contract";

export async function setStoredActivityStatus(activityId: string, publicationStatus: ActivityPublicationStatus) {
  if (!/^activity-[a-z0-9-]+$/.test(activityId) || !["published", "suspended", "archived"].includes(publicationStatus)) return { ok: false as const, error: "Cette activité est introuvable." };
  const teacher = await requireTeacherActor();
  try {
    const sql = getSocratoDatabase();
    const rows = await sql<{ id: string }[]>`
      update socrato.activities set publication_status = ${publicationStatus}, updated_at = now()
      where id = ${activityId} and teacher_id = ${teacher.id}
      returning id
    `;
    if (!rows[0]) return { ok: false as const, error: "Cette activité est introuvable." };
    revalidatePath("/teacher");
    revalidatePath("/eleve/tableau-de-bord");
    return { ok: true as const };
  } catch { return { ok: false as const, error: "La modification n’a pas pu être enregistrée." }; }
}
