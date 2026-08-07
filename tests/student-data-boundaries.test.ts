import assert from "node:assert/strict";
import test from "node:test";
import { authorizeStudentActivityScope, type StudentActivityScopeRepository } from "../lib/student-data-boundaries/authorize.ts";

test("une requête élève ne peut pas franchir la limite de son groupe", async () => {
  const repository: StudentActivityScopeRepository = {
    async findAssignedActivity(studentId, activityId) {
      return studentId === "student-groupe-a" && activityId === "activity-groupe-a"
        ? { groupId: "group-a", notionIds: ["acte-union"], questionIds: ["question:acte-union:001"] }
        : null;
    },
  };
  assert.equal(await authorizeStudentActivityScope(repository, "student-groupe-a", "activity-groupe-b"), null);
  assert.equal(await authorizeStudentActivityScope(repository, "student-groupe-b", "activity-groupe-a"), null);
  assert.equal((await authorizeStudentActivityScope(repository, "student-groupe-a", "activity-groupe-a"))?.groupId, "group-a");
});
