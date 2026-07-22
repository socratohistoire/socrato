import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { HmacAccessCodeLookup } from "./lookup.ts";
import type {
  StudentAccessCodeRepository,
  StudentAccessCredential,
} from "./repository.ts";
import { InMemoryStudentAccessRateLimiter } from "./rate-limiter.ts";
import type { StudentSession, StudentSessionRepository } from "./session.ts";

const LOCAL_ONLY_LOOKUP_KEY = "socrato-local-development-only";
const LOCAL_DEMO_CODE = "K7MPR4XT9QHC";
const SESSION_LIFETIME_MS = 4 * 60 * 60 * 1000;

class LocalAccessCodeRepository implements StudentAccessCodeRepository {
  private readonly credential: StudentAccessCredential;

  constructor(lookup: HmacAccessCodeLookup) {
    this.credential = {
      credentialId: "local-credential-1",
      anonymousStudentId: "local-anonymous-student-1",
      lookupDigest: lookup.digest(LOCAL_DEMO_CODE),
      status: "active",
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
      membershipActive: true,
    };
  }

  async findByLookupDigest(
    lookupDigest: string,
  ): Promise<StudentAccessCredential | null> {
    const expected = Buffer.from(this.credential.lookupDigest, "hex");
    const received = Buffer.from(lookupDigest, "hex");

    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      return null;
    }

    return this.credential;
  }
}

class LocalStudentSessionRepository implements StudentSessionRepository {
  private readonly sessions = new Map<string, StudentSession>();

  async create(input: {
    anonymousStudentId: string;
    credentialId: string;
  }): Promise<StudentSession> {
    for (const [token, session] of this.sessions) {
      if (session.credentialId === input.credentialId) {
        this.sessions.delete(token);
      }
    }

    const session = {
      token: randomBytes(32).toString("base64url"),
      anonymousStudentId: input.anonymousStudentId,
      credentialId: input.credentialId,
      expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
    };
    this.sessions.set(session.token, session);
    return session;
  }

  async findActiveByToken(token: string): Promise<StudentSession | null> {
    const session = this.sessions.get(token);
    if (!session || session.expiresAt.getTime() <= Date.now()) {
      return null;
    }
    return session;
  }
}

export const STUDENT_SESSION_COOKIE = "socrato_student_session";

export type StudentAccessRuntime = {
  lookup: HmacAccessCodeLookup;
  codes: StudentAccessCodeRepository;
  sessions: StudentSessionRepository;
  rateLimiter: InMemoryStudentAccessRateLimiter;
  clientContext(rawContext: string): string;
};

function createLocalRuntime(): StudentAccessRuntime {
  const lookup = new HmacAccessCodeLookup(LOCAL_ONLY_LOOKUP_KEY);
  return {
    lookup,
    codes: new LocalAccessCodeRepository(lookup),
    sessions: new LocalStudentSessionRepository(),
    rateLimiter: new InMemoryStudentAccessRateLimiter(),
    clientContext(rawContext: string) {
      return createHash("sha256")
        .update(`local:${rawContext}`)
        .digest("hex");
    },
  };
}

const runtimeGlobal = globalThis as typeof globalThis & {
  __socratoStudentAccessRuntime?: StudentAccessRuntime;
};

export function getStudentAccessRuntime(): StudentAccessRuntime {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Student access requires a production repository and managed lookup key.",
    );
  }

  runtimeGlobal.__socratoStudentAccessRuntime ??= createLocalRuntime();
  return runtimeGlobal.__socratoStudentAccessRuntime;
}
