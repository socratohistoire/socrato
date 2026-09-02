import assert from "node:assert/strict";
import test from "node:test";
import { assessStudentPriority } from "../lib/server/student-priority.ts";

test("classe à surveiller lorsqu’un seul élément demeure à travailler", () => {
  const result = assessStudentPriority([{ id: "op", status: "to_work_on" }], []);
  assert.equal(result.level, "medium");
  assert.match(result.reason, /suivi est recommandé/);
});

test("réserve la priorité élevée à plusieurs éléments qui demeurent à travailler", () => {
  const result = assessStudentPriority(
    [{ id: "op", status: "to_work_on" }],
    [{ id: "knowledge", status: "to_work_on" }],
  );
  assert.equal(result.level, "high");
  assert.match(result.reason, /2 éléments demeurent à travailler/);
});

test("classe à surveiller lorsque l’aide de Socrato est répétée", () => {
  const result = assessStudentPriority(
    [{ id: "op", status: "to_consolidate" }],
    [{ id: "knowledge", status: "to_consolidate" }],
  );
  assert.equal(result.level, "medium");
  assert.match(result.reason, /2 éléments/);
});

test("conserve le suivi normal pour une maîtrise autonome ou une aide isolée", () => {
  assert.equal(assessStudentPriority([{ id: "op", status: "mastered" }], []).level, "normal");
  assert.equal(assessStudentPriority([{ id: "op", status: "to_consolidate" }], []).level, "normal");
});
