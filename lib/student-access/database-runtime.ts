import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getSocratoDatabase } from "../server/database.ts";
import { Sha256AccessCodeLookup } from "./lookup.ts";
import type { StudentAccessCodeRepository, StudentAccessCredential } from "./repository.ts";
import { InMemoryStudentAccessRateLimiter } from "./rate-limiter.ts";
import type { StudentSession, StudentSessionRepository } from "./session.ts";
import type { StudentAccessRuntime } from "./local-runtime.ts";

const SESSION_LIFETIME_MS = 60 * 60 * 1000;
const tokenDigest = (token: string) => createHash("sha256").update(token).digest("hex");

class DatabaseAccessCodeRepository implements StudentAccessCodeRepository {
  async findByLookupDigest(lookupDigest: string): Promise<StudentAccessCredential | null> {
    const sql = getSocratoDatabase();
    const rows = await sql<{ credential_id: string; student_id: string; lookup_digest: string; status: "active" | "disabled"; expires_at: Date; membership_active: boolean }[]>`
      select c.id as credential_id, c.student_id, c.lookup_digest, c.status, c.expires_at,
        exists (
          select 1 from socrato.group_memberships gm
          join socrato.groups g on g.id = gm.group_id and g.archived_at is null
          where gm.student_id = c.student_id and gm.active = true
        ) as membership_active
      from socrato.student_access_credentials c
      where c.lookup_digest = ${lookupDigest}
      limit 1
    `;
    const credential = rows[0];
    return credential ? {
      credentialId: credential.credential_id,
      anonymousStudentId: credential.student_id,
      lookupDigest: credential.lookup_digest,
      status: credential.status,
      expiresAt: new Date(credential.expires_at),
      membershipActive: credential.membership_active,
    } : null;
  }
}

class DatabaseStudentSessionRepository implements StudentSessionRepository {
  async create(input: { anonymousStudentId: string; credentialId: string }): Promise<StudentSession> {
    const sql = getSocratoDatabase();
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);
    await sql`
      insert into socrato.server_sessions (id, subject_type, subject_id, token_digest, expires_at)
      values (${`session-${randomUUID()}`}, ${"student"}, ${input.anonymousStudentId}, ${tokenDigest(token)}, ${expiresAt.toISOString()})
    `;
    return { token, anonymousStudentId: input.anonymousStudentId, credentialId: input.credentialId, expiresAt };
  }

  async findActiveByToken(token: string): Promise<StudentSession | null> {
    const sql = getSocratoDatabase();
    const rows = await sql<{ id: string; subject_id: string; expires_at: Date }[]>`
      select id, subject_id, expires_at from socrato.server_sessions
      where subject_type = ${"student"} and token_digest = ${tokenDigest(token)} and revoked_at is null and expires_at > now()
      limit 1
    `;
    const session = rows[0];
    return session ? { token, anonymousStudentId: session.subject_id, credentialId: session.id, expiresAt: new Date(session.expires_at) } : null;
  }

  async revokeByToken(token: string): Promise<void> {
    const sql = getSocratoDatabase();
    await sql`
      update socrato.server_sessions set revoked_at = now()
      where subject_type = ${"student"} and token_digest = ${tokenDigest(token)} and revoked_at is null
    `;
  }
}

export function createDatabaseStudentAccessRuntime(): StudentAccessRuntime {
  return {
    lookup: new Sha256AccessCodeLookup(),
    codes: new DatabaseAccessCodeRepository(),
    sessions: new DatabaseStudentSessionRepository(),
    rateLimiter: new InMemoryStudentAccessRateLimiter(),
    clientContext(rawContext: string) {
      return createHash("sha256").update(`database:${rawContext}`).digest("hex");
    },
  };
}
