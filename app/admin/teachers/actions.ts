"use server";

import { revalidatePath } from "next/cache";
import { requireAdminActor, type TeacherAccessRole } from "@/lib/authentication/teacher-access";
import { getSocratoDatabase } from "@/lib/server/database";

export async function saveTeacherAccess(formData: FormData) {
  await requireAdminActor();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "teacher") as TeacherAccessRole;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !["teacher", "admin"].includes(role)) return;
  const sql = getSocratoDatabase();
  await sql`insert into socrato.teacher_access_grants (email, role, active) values (${email}, ${role}, true) on conflict (email) do update set role = excluded.role, active = true, updated_at = now()`;
  revalidatePath("/admin/teachers");
}

export async function revokeTeacherAccess(formData: FormData) {
  const actor = await requireAdminActor();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || email === actor.email?.toLowerCase()) return;
  const sql = getSocratoDatabase();
  await sql`update socrato.teacher_access_grants set active = false, updated_at = now() where email = ${email}`;
  revalidatePath("/admin/teachers");
}
