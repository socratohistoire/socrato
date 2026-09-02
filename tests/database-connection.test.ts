import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("lib/server/database.ts", "utf8");

test("désactive les requêtes préparées pour rester compatible avec le pool PostgreSQL", () => {
  assert.match(source, /prepare: false/);
  assert.match(source, /socratoDatabaseUnprepared/);
});
