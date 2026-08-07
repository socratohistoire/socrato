"use server";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getSocratoDatabase } from "@/lib/server/database";
import { STUDENT_ACCESS_CODE_ALPHABET } from "@/lib/student-access/format";

export type RegeneratedStudentCode = { groupName: string; alias: string; code: string };

const createAccessCode = () => Array.from(randomBytes(12), (byte) => STUDENT_ACCESS_CODE_ALPHABET[byte % STUDENT_ACCESS_CODE_ALPHABET.length]).join("");
const digestAccessCode = (value: string) => createHash("sha256").update(value).digest("hex");

export async function regenerateGroupAccessCodes(groupId: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(groupId) || groupId.length > 80) return { ok: false as const, error: "Ce groupe est introuvable." };
  const teacher = await requireTeacherActor();
  const sql = getSocratoDatabase();
  const generatedCodes: RegeneratedStudentCode[] = [];
  try {
    await sql.begin(async (tx) => {
      const groups = await tx<{ name: string }[]>`
        select display_name as name from socrato.groups
        where id = ${groupId} and teacher_id = ${teacher.id} and archived_at is null
        limit 1
      `;
      const group = groups[0];
      if (!group) throw new Error("group-not-found");
      const students = await tx<{ id: string; alias: string }[]>`
        select s.id, s.display_alias as alias
        from socrato.students s
        join socrato.group_memberships gm on gm.student_id = s.id and gm.active = true
        where gm.group_id = ${groupId} and s.archived_at is null
        order by s.display_alias asc
      `;
      if (!students.length) throw new Error("no-students");
      await tx`
        update socrato.student_access_credentials set status = ${"disabled"}
        where status = ${"active"} and student_id in (
          select student_id from socrato.group_memberships where group_id = ${groupId} and active = true
        )
      `;
      for (const student of students) {
        const code = createAccessCode();
        await tx`
          insert into socrato.student_access_credentials (id, student_id, lookup_digest, status, expires_at)
          values (${`credential-${randomUUID()}`}, ${student.id}, ${digestAccessCode(code)}, ${"active"}, ${"2027-08-31T23:59:59Z"})
        `;
        generatedCodes.push({ groupName: group.name, alias: student.alias, code });
      }
    });
  } catch {
    return { ok: false as const, error: "Les nouveaux codes n’ont pas pu être créés. Les codes actuels demeurent valides." };
  }
  revalidatePath(`/teacher/groups/${groupId}`);
  return { ok: true as const, generatedCodes };
}
