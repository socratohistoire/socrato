import assert from "node:assert/strict";
import { test } from "node:test";
import {
  authenticateStudentAccess,
  GENERIC_ACCESS_ERROR,
} from "../lib/student-access/authenticate.ts";
import { validateAndNormalizeAccessCode } from "../lib/student-access/format.ts";
import { HmacAccessCodeLookup } from "../lib/student-access/lookup.ts";
import type {
  StudentAccessCodeRepository,
  StudentAccessCredential,
} from "../lib/student-access/repository.ts";
import { InMemoryStudentAccessRateLimiter } from "../lib/student-access/rate-limiter.ts";
import type {
  StudentSession,
  StudentSessionRepository,
} from "../lib/student-access/session.ts";
import { readFile } from "node:fs/promises";

const lookup = new HmacAccessCodeLookup("test-only-key");
const validCode = "K7MPR4XT9QHC";
const now = new Date("2026-07-22T12:00:00.000Z");

class TestCodeRepository implements StudentAccessCodeRepository {
  constructor(private readonly credential: StudentAccessCredential | null) {}

  async findByLookupDigest(): Promise<StudentAccessCredential | null> {
    return this.credential;
  }
}

class TestSessionRepository implements StudentSessionRepository {
  created = 0;

  async create(input: {
    anonymousStudentId: string;
    credentialId: string;
  }): Promise<StudentSession> {
    this.created += 1;
    return {
      ...input,
      token: "opaque-test-session-token",
      expiresAt: new Date(now.getTime() + 60_000),
    };
  }

  async findActiveByToken(): Promise<StudentSession | null> {
    return null;
  }

  async revokeByToken(): Promise<void> {}
}

function credential(
  overrides: Partial<StudentAccessCredential> = {},
): StudentAccessCredential {
  return {
    credentialId: "credential-1",
    anonymousStudentId: "anonymous-student-1",
    lookupDigest: lookup.digest(validCode),
    status: "active",
    expiresAt: new Date("2026-08-01T00:00:00.000Z"),
    membershipActive: true,
    ...overrides,
  };
}

function dependencies(found: StudentAccessCredential | null) {
  return {
    lookup,
    codes: new TestCodeRepository(found),
    sessions: new TestSessionRepository(),
    rateLimiter: new InMemoryStudentAccessRateLimiter(),
    now: () => now,
  };
}

test("accepte un format valide", () => {
  assert.deepEqual(validateAndNormalizeAccessCode("K7MP-R4XT-9QHC"), {
    valid: true,
    normalizedCode: validCode,
  });
});

test("rejette un format invalide", () => {
  assert.deepEqual(validateAndNormalizeAccessCode("INVALID-O0O0"), {
    valid: false,
  });
});

test("normalise les espaces, tirets et minuscules", () => {
  assert.deepEqual(validateAndNormalizeAccessCode("  k7mp r4xt 9qhc  "), {
    valid: true,
    normalizedCode: validCode,
  });
});

test("refuse un code inexistant", async () => {
  const result = await authenticateStudentAccess(validCode, "client", dependencies(null));
  assert.deepEqual(result, { success: false, message: GENERIC_ACCESS_ERROR });
});

test("refuse un code expiré", async () => {
  const result = await authenticateStudentAccess(
    validCode,
    "client",
    dependencies(credential({ expiresAt: new Date("2026-07-01T00:00:00.000Z") })),
  );
  assert.deepEqual(result, { success: false, message: GENERIC_ACCESS_ERROR });
});

test("refuse un code désactivé", async () => {
  const result = await authenticateStudentAccess(
    validCode,
    "client",
    dependencies(credential({ status: "disabled" })),
  );
  assert.deepEqual(result, { success: false, message: GENERIC_ACCESS_ERROR });
});

test("crée une session opaque et redirige pour un code valide", async () => {
  const deps = dependencies(credential());
  const result = await authenticateStudentAccess(validCode, "client", deps);
  assert.equal(result.success, true);
  assert.equal(deps.sessions.created, 1);
  if (result.success) {
    assert.equal(result.redirectTo, "/eleve/tableau-de-bord");
    assert.notEqual(result.session.token, validCode);
  }
});

test("utilise le même message générique pour tous les refus", async () => {
  const invalid = await authenticateStudentAccess("bad", "a", dependencies(null));
  const unknown = await authenticateStudentAccess(validCode, "b", dependencies(null));
  const expired = await authenticateStudentAccess(
    validCode,
    "c",
    dependencies(credential({ expiresAt: new Date(0) })),
  );
  assert.equal(invalid.success ? "" : invalid.message, GENERIC_ACCESS_ERROR);
  assert.equal(unknown.success ? "" : unknown.message, GENERIC_ACCESS_ERROR);
  assert.equal(expired.success ? "" : expired.message, GENERIC_ACCESS_ERROR);
});

test("limite les tentatives répétées après dix échecs sur quinze minutes", async () => {
  const deps = dependencies(null);
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await authenticateStudentAccess(validCode, "repeated-client", deps);
  }

  deps.codes = new TestCodeRepository(credential());
  const blocked = await authenticateStudentAccess(validCode, "repeated-client", deps);
  assert.deepEqual(blocked, { success: false, message: GENERIC_ACCESS_ERROR });
  assert.equal(deps.sessions.created, 0);
});

test("attend la confirmation du cookie avant d’ouvrir le tableau de bord", async () => {
  const actionSource = await readFile(new URL("../app/eleve/actions.ts", import.meta.url), "utf8");
  const formSource = await readFile(new URL("../app/eleve/student-access-form.tsx", import.meta.url), "utf8");

  assert.match(actionSource, /return \{ message: "", redirectTo: result\.redirectTo \}/);
  assert.doesNotMatch(actionSource, /redirect\(result\.redirectTo\)/);
  assert.match(formSource, /window\.location\.assign\(state\.redirectTo\)/);
  assert.doesNotMatch(formSource, /useRouter/);
  assert.match(formSource, /pending \|\| Boolean\(state\.redirectTo\)/);
});

test("la page d’accueil ouvre directement l’espace élève avec une seule saisie", async () => {
  const homeSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(homeSource, /import \{ StudentAccessForm \}/);
  assert.match(homeSource, /<StudentAccessForm \/>/);
  assert.doesNotMatch(homeSource, /action="\/eleve"|method="get"|Commencer la révision/);
});
