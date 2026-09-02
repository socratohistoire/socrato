"use server";

import { revalidatePath } from "next/cache";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getSocratoDatabase } from "@/lib/server/database";

export async function renameTeacherGroup(groupId: string, requestedName: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(groupId) || groupId.length > 80) return { ok: false as const, error: "Ce groupe est introuvable." };
  const name = requestedName.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80) return { ok: false as const, error: "Le nom doit contenir de 2 à 80 caractères." };
  const teacher = await requireTeacherActor();
  const sql = getSocratoDatabase();
  const updated = await sql<{ name: string }[]>`
    update socrato.groups set display_name = ${name}
    where id = ${groupId} and teacher_id = ${teacher.id} and archived_at is null
    returning display_name as name
  `;
  if (!updated[0]) return { ok: false as const, error: "Ce groupe est introuvable." };
  revalidatePath("/teacher");
  revalidatePath(`/teacher/groups/${groupId}`);
  revalidatePath(`/teacher/groups/${groupId}/codes`);
  return { ok: true as const, name: updated[0].name };
}
