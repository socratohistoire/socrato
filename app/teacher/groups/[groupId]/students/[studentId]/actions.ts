"use server";

import { redirect } from "next/navigation";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getSocratoDatabase } from "@/lib/server/database";

const SAFE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function assignPersonalizedConsolidation(formData: FormData) {
  const groupId = String(formData.get("groupId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const operationId = String(formData.get("operationId") ?? "");
  const knowledgeId = String(formData.get("knowledgeId") ?? "");
  if (![groupId, studentId].every((id) => SAFE_ID.test(id) && id.length <= 100)) return;

  const teacher = await requireTeacherActor();
  const sql = getSocratoDatabase();
  const owned = await sql<{ display_alias: string }[]>`
    select s.display_alias
    from socrato.students s
    join socrato.group_memberships gm on gm.student_id = s.id and gm.active = true
    join socrato.groups g on g.id = gm.group_id and g.archived_at is null
    where s.id = ${studentId} and g.id = ${groupId} and g.teacher_id = ${teacher.id}
    limit 1
  `;
  if (!owned[0]) return;

  const params = new URLSearchParams({
    consolidationStudent: studentId,
    consolidationGroup: groupId,
    ...(operationId ? { operation: operationId } : {}),
    ...(knowledgeId ? { knowledge: knowledgeId } : {}),
  });
  redirect(`/teacher/activities/new?${params.toString()}`);
}
