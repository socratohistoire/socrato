import assert from "node:assert/strict";
import test from "node:test";
import { getStudentAccessRuntime } from "../lib/student-access/local-runtime.ts";

function setEnvironment(name: "NODE_ENV" | "DATABASE_URL", value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else Object.defineProperty(process.env, name, { configurable: true, enumerable: true, value, writable: true });
}

test("uses persistent database access and sessions in production", () => {
  const previousNodeEnvironment = process.env.NODE_ENV;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  try {
    setEnvironment("NODE_ENV", "production");
    setEnvironment("DATABASE_URL", "postgresql://production.example/socrato");
    const runtime = getStudentAccessRuntime();
    assert.equal(runtime.lookup.constructor.name, "Sha256AccessCodeLookup");
    assert.equal(runtime.sessions.constructor.name, "DatabaseStudentSessionRepository");
  } finally {
    setEnvironment("NODE_ENV", previousNodeEnvironment);
    setEnvironment("DATABASE_URL", previousDatabaseUrl);
  }
});

test("refuses an in-memory student runtime in production", () => {
  const previousNodeEnvironment = process.env.NODE_ENV;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  try {
    setEnvironment("NODE_ENV", "production");
    setEnvironment("DATABASE_URL", undefined);
    assert.throws(() => getStudentAccessRuntime(), /database repository/);
  } finally {
    setEnvironment("NODE_ENV", previousNodeEnvironment);
    setEnvironment("DATABASE_URL", previousDatabaseUrl);
  }
});
