import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { HmacAccessCodeLookup, type AccessCodeLookup } from "./lookup.ts";
import type {
  StudentAccessCodeRepository,
  StudentAccessCredential,
} from "./repository.ts";
import { InMemoryStudentAccessRateLimiter } from "./rate-limiter.ts";
import type { StudentSession, StudentSessionRepository } from "./session.ts";
import { LOCAL_STUDENT_ID } from "../academic-context/local-context.ts";
import { createDatabaseStudentAccessRuntime } from "./database-runtime.ts";

const LOCAL_ONLY_LOOKUP_KEY = "socrato-local-development-only";
const LOCAL_DEMO_CODE = "K7MPR4XT9QHC";
const SESSION_LIFETIME_MS = 60 * 60 * 1000;

class LocalAccessCodeRepository implements StudentAccessCodeRepository {
  private readonly credential: StudentAccessCredential;

  constructor(lookup: HmacAccessCodeLookup) {
    this.credential = {
      credentialId: "local-credential-1",
      anonymousStudentId: LOCAL_STUDENT_ID,
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

  async revokeByToken(token: string): Promise<void> {
    this.sessions.delete(token);
  }
}

export const STUDENT_SESSION_COOKIE = "socrato_student_session";

export type StudentAccessRuntime = {
  lookup: AccessCodeLookup;
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
  __socratoStudentAccessRuntimeMode?: "local" | "database";
};

export function getStudentAccessRuntime(): StudentAccessRuntime {
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    throw new Error(
      "Student access requires the database repository in production.",
    );
  }

  const mode = process.env.DATABASE_URL ? "database" : "local";
  if (!runtimeGlobal.__socratoStudentAccessRuntime || runtimeGlobal.__socratoStudentAccessRuntimeMode !== mode) {
    runtimeGlobal.__socratoStudentAccessRuntime = mode === "database" ? createDatabaseStudentAccessRuntime() : createLocalRuntime();
    runtimeGlobal.__socratoStudentAccessRuntimeMode = mode;
  }
  return runtimeGlobal.__socratoStudentAccessRuntime;
}
