"use server";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createSocratoSupabaseServerClient } from "@/lib/supabase/server";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getSocratoDatabase } from "@/lib/server/database";
import { STUDENT_ACCESS_CODE_ALPHABET } from "@/lib/student-access/format";

export type GeneratedStudentCode = { groupName: string; alias: string; code: string };
type Setup = { displayName: string; group: { name: string; aliases: string[] } };
const code = () => Array.from(randomBytes(12), (byte) => STUDENT_ACCESS_CODE_ALPHABET[byte % STUDENT_ACCESS_CODE_ALPHABET.length]).join("");
const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export async function createTeacherGroupWithCodes(setup: Setup) {
  if (!setup.displayName.trim() || !setup.group.name.trim() || !setup.group.aliases.length || setup.group.aliases.some((alias) => !/^[\p{L}'’\-]+(?:\s[\p{L}'’\-]+)*\s\p{Lu}\.$/u.test(alias))) return { ok: false as const, error: "Les renseignements du groupe n’ont pas été reconnus. Vérifiez l’aperçu des élèves." };
  const actor = await requireTeacherActor(); const sql = getSocratoDatabase(); const generatedCodes: GeneratedStudentCode[] = [];
  try { await sql.begin(async (tx) => {
    await tx`insert into socrato.schools (id, display_name) values (${"school-demo-local"}, ${"École Socrato"}) on conflict (id) do nothing`;
    await tx`insert into socrato.teachers (id, school_id, identity_provider_subject, display_name) values (${actor.id}, ${"school-demo-local"}, ${actor.identityProviderSubject}, ${setup.displayName.trim()}) on conflict (id) do update set display_name=excluded.display_name`;
    const group=setup.group; const groupId=`group-${randomUUID()}`; await tx`insert into socrato.groups (id, school_id, teacher_id, display_name, school_year) values (${groupId}, ${"school-demo-local"}, ${actor.id}, ${group.name.trim()}, ${"2026-2027"})`; for (const alias of group.aliases) { const studentId=`student-${randomUUID()}`, accessCode=code(); await tx`insert into socrato.students (id, school_id, display_alias) values (${studentId}, ${"school-demo-local"}, ${alias})`; await tx`insert into socrato.group_memberships (id, group_id, student_id) values (${`membership-${randomUUID()}`}, ${groupId}, ${studentId})`; await tx`insert into socrato.student_access_credentials (id, student_id, lookup_digest, status, expires_at) values (${`credential-${randomUUID()}`}, ${studentId}, ${digest(accessCode)}, ${"active"}, ${"2027-08-31T23:59:59Z"})`; generatedCodes.push({groupName:group.name.trim(),alias,code:accessCode}); }
  }); } catch { return { ok: false as const, error: "La base de données n’a pas pu créer le groupe. Aucun élève de cette tentative n’a été enregistré." }; }
  return {ok:true as const,generatedCodes};
}

export async function completeTeacherOnboarding(displayName: string) {
  const supabase=await createSocratoSupabaseServerClient(); const completedAt=new Date().toISOString();
  const {error}=await supabase.auth.updateUser({data:{full_name:displayName.trim(),socrato_onboarding_completed_at:completedAt}});
  return error ? {ok:false as const,error:"La configuration du compte n’a pas pu être terminée."} : {ok:true as const,completedAt};
}
