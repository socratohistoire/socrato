import assert from "node:assert/strict";
import test from "node:test";
import { AUTHENTICATION_API_ROUTES, HttpAuthenticationClient } from "../lib/authentication/index.ts";

test("uses an HttpOnly-cookie-compatible student session flow without exposing a token", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const session = { schemaVersion: 1 as const, role: "student" as const, subjectId: "student-1", groupIds: ["group-1"], expiresAt: "2026-08-06T12:00:00.000Z" };
  const client = new HttpAuthenticationClient("https://server.example/", (async (url, init) => {
    requests.push({ url: String(url), init });
    return new Response(JSON.stringify({ session }), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch);

  const result = await client.createStudentSession("ABCD1234");
  assert.deepEqual(result.session, session);
  assert.equal("token" in result.session, false);
  assert.equal(requests[0]?.url, `https://server.example${AUTHENTICATION_API_ROUTES.studentCodeSession}`);
  assert.equal(requests[0]?.init?.credentials, "include");
});

test("prepares teacher authentication while preventing an external return URL", () => {
  const client = new HttpAuthenticationClient("https://server.example");
  assert.equal(client.teacherLoginUrl(), "https://server.example/api/v1/auth/teacher/login?returnTo=%2Fteacher");
  assert.throws(() => client.teacherLoginUrl("https://malicious.example"), /rester dans Socrato/);
  assert.throws(() => client.teacherLoginUrl("//malicious.example"), /rester dans Socrato/);
});
