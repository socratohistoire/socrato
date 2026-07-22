import { validateAndNormalizeAccessCode } from "./format.ts";
import type { AccessCodeLookup } from "./lookup.ts";
import type { StudentAccessCodeRepository } from "./repository.ts";
import type { StudentAccessRateLimiter } from "./rate-limiter.ts";
import type { StudentSession, StudentSessionRepository } from "./session.ts";

export const GENERIC_ACCESS_ERROR =
  "Impossible d’accéder à l’espace élève. Vérifie le code et réessaie.";

export type StudentAccessResult =
  | {
      success: true;
      session: StudentSession;
      redirectTo: "/eleve/tableau-de-bord";
    }
  | { success: false; message: typeof GENERIC_ACCESS_ERROR };

export type StudentAccessDependencies = {
  lookup: AccessCodeLookup;
  codes: StudentAccessCodeRepository;
  sessions: StudentSessionRepository;
  rateLimiter: StudentAccessRateLimiter;
  now?: () => Date;
};

export async function authenticateStudentAccess(
  submittedCode: unknown,
  clientContext: string,
  dependencies: StudentAccessDependencies,
): Promise<StudentAccessResult> {
  if (!dependencies.rateLimiter.check(clientContext).allowed) {
    return failure();
  }

  const format = validateAndNormalizeAccessCode(submittedCode);
  if (!format.valid) {
    dependencies.rateLimiter.recordFailure(clientContext);
    return failure();
  }

  const digest = dependencies.lookup.digest(format.normalizedCode);
  const credential = await dependencies.codes.findByLookupDigest(digest);
  const now = (dependencies.now ?? (() => new Date()))();

  if (
    !credential ||
    credential.status !== "active" ||
    !credential.membershipActive ||
    credential.expiresAt.getTime() <= now.getTime()
  ) {
    dependencies.rateLimiter.recordFailure(clientContext);
    return failure();
  }

  const session = await dependencies.sessions.create({
    anonymousStudentId: credential.anonymousStudentId,
    credentialId: credential.credentialId,
  });

  return {
    success: true,
    session,
    redirectTo: "/eleve/tableau-de-bord",
  };
}

function failure(): StudentAccessResult {
  return { success: false, message: GENERIC_ACCESS_ERROR };
}
