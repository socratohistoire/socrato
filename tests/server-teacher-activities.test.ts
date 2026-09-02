import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("lib/server/teacher-activities.ts", "utf8");

test("fait remonter chaque élève prioritaire dès que son activité est terminée", () => {
  assert.match(source, /sp\.state = \$\{"completed"\}/);
  assert.match(source, /assessStudentPriority\(row\.operation_results, row\.historical_knowledge_results\)/);
  assert.match(source, /if \(assessment\.level !== "high"\) continue/);
  assert.match(source, /priorityByActivity\.get\(activity\.id\) \?\? \[\]/);
  assert.doesNotMatch(source, /completed_count\s*>\s*targeted_count/);
  assert.doesNotMatch(source, /completed_count\s*\/\s*targeted_count/);
});
