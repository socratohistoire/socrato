import { getSocratoDatabase } from "../server/database.ts";
import type { TeacherActor } from "./teacher-session.ts";

export type TeacherAccessRole = "teacher" | "admin";

function emailSet(value: string | undefined) {
  return new Set((value ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
}

export function configuredTeacherEmails() { return emailSet(process.env.SOCRATO_TEACHER_EMAIL_ALLOWLIST); }
export function configuredAdminEmails() {
  const explicit = emailSet(process.env.SOCRATO_ADMIN_EMAIL_ALLOWLIST);
  return explicit.size ? explicit : configuredTeacherEmails();
}

export async function getTeacherAccessRole(email: string): Promise<TeacherAccessRole | null> {
  const normalized = email.trim().toLowerCase();
  if (configuredAdminEmails().has(normalized)) return "admin";
  if (configuredTeacherEmails().has(normalized)) return "teacher";
  try {
    const sql = getSocratoDatabase();
    const rows = await sql<{ role: TeacherAccessRole }[]>`select role from socrato.teacher_access_grants where email = ${normalized} and active = true limit 1`;
    return rows[0]?.role ?? null;
  } catch { return null; }
}

export async function requireAdminActor(): Promise<TeacherActor> {
  if (process.env.NODE_ENV === "development" && process.env.SOCRATO_LOCAL_ADMIN_PREVIEW === "enabled") {
    const email = configuredAdminEmails().values().next().value ?? null;
    return { id: "local-preview-admin", identityProviderSubject: "local-preview-admin", displayName: "Administration locale", email, onboardingCompletedAt: null };
  }
  const { requireTeacherActor } = await import("./teacher-session.ts");
  const actor = await requireTeacherActor();
  if (!actor.email || await getTeacherAccessRole(actor.email) !== "admin") throw new Error("Un accès administrateur est requis.");
  return actor;
}
