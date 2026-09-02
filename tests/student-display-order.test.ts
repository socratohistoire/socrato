import assert from "node:assert/strict";
import test from "node:test";
import { compareStudentsByFamilyName } from "../lib/student-display-order.ts";

test("classe les élèves selon leur nom de famille affiché", () => {
  const students = [{ displayLabel: "Zoé T." }, { displayLabel: "Adam B." }, { displayLabel: "Liam A." }];
  assert.deepEqual(students.sort(compareStudentsByFamilyName).map(({ displayLabel }) => displayLabel), ["Liam A.", "Adam B.", "Zoé T."]);
});
