"use server";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getSocratoDatabase } from "@/lib/server/database";
import { STUDENT_ACCESS_CODE_ALPHABET } from "@/lib/student-access/format";
import { encryptStudentAccessCode } from "@/lib/student-access/code-encryption";

export type RegeneratedStudentCode = { groupName: string; alias: string; code: string };
export type AddedStudentCode = { alias: string; code: string };

const createAccessCode = () => Array.from(randomBytes(12), (byte) => STUDENT_ACCESS_CODE_ALPHABET[byte % STUDENT_ACCESS_CODE_ALPHABET.length]).join("");
const digestAccessCode = (value: string) => createHash("sha256").update(value).digest("hex");

function studentAlias(firstName: string, familyName: string) {
  const first = firstName.trim().replace(/\s+/g, " ");
  const initial = familyName.trim().match(/[\p{L}]/u)?.[0]?.toLocaleUpperCase("fr-CA");
  return first && initial ? `${first} ${initial}.` : null;
}

export async function addStudentToGroup(groupId: string, firstName: string, familyName: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(groupId) || groupId.length > 80) return { ok: false as const, error: "Ce groupe est introuvable." };
  const alias = studentAlias(firstName, familyName);
  if (!alias) return { ok: false as const, error: "Inscrivez le prénom et le nom de famille de l’élève." };
  const teacher = await requireTeacherActor();
  const sql = getSocratoDatabase();
  const code = createAccessCode();
  try {
    await sql.begin(async (tx) => {
      const groups = await tx<{ school_id: string }[]>`select school_id from socrato.groups where id = ${groupId} and teacher_id = ${teacher.id} and archived_at is null limit 1`;
      if (!groups[0]) throw new Error("group-not-found");
      const existing = await tx<{ count: number }[]>`
        select count(*)::int as count from socrato.students s
        join socrato.group_memberships gm on gm.student_id = s.id and gm.active = true
        where gm.group_id = ${groupId} and lower(s.display_alias) = lower(${alias}) and s.archived_at is null
      `;
      if ((existing[0]?.count ?? 0) > 0) throw new Error("duplicate-alias");
      const studentId = `student-${randomUUID()}`;
      await tx`insert into socrato.students (id, school_id, display_alias) values (${studentId}, ${groups[0].school_id}, ${alias})`;
      await tx`insert into socrato.group_memberships (id, group_id, student_id) values (${`membership-${randomUUID()}`}, ${groupId}, ${studentId})`;
      await tx`insert into socrato.student_access_credentials (id, student_id, lookup_digest, encrypted_code, status, expires_at) values (${`credential-${randomUUID()}`}, ${studentId}, ${digestAccessCode(code)}, ${encryptStudentAccessCode(code)}, ${"active"}, ${"2027-08-31T23:59:59Z"})`;
    });
  } catch (error) {
    return { ok: false as const, error: error instanceof Error && error.message === "duplicate-alias" ? "Un élève portant ce prénom et cette initiale existe déjà dans le groupe." : "L’élève n’a pas pu être ajouté." };
  }
  revalidatePath(`/teacher/groups/${groupId}`);
  revalidatePath(`/teacher/groups/${groupId}/codes`);
  revalidatePath("/teacher");
  return { ok: true as const, student: { alias, code } satisfies AddedStudentCode };
}

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
          insert into socrato.student_access_credentials (id, student_id, lookup_digest, encrypted_code, status, expires_at)
          values (${`credential-${randomUUID()}`}, ${student.id}, ${digestAccessCode(code)}, ${encryptStudentAccessCode(code)}, ${"active"}, ${"2027-08-31T23:59:59Z"})
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
