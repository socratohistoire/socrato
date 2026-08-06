import assert from "node:assert/strict";
import test from "node:test";
import { SERVER_DATA_MODEL_VERSION, validateServerDataModel, type FutureServerDataModel } from "../lib/server-data-model/index.ts";

function emptyModel(): FutureServerDataModel {
  return { schemaVersion: SERVER_DATA_MODEL_VERSION, schools: [], teachers: [], groups: [], students: [], groupMemberships: [], studentAccessCredentials: [], sessions: [], activities: [], activityGroupAssignments: [], teacherDrafts: [], learningSessions: [], studentProgress: [], studentResponses: [], studentOutcomes: [] };
}

test("defines every future persistence collection without selecting a database", () => {
  assert.deepEqual(Object.keys(emptyModel()), ["schemaVersion", "schools", "teachers", "groups", "students", "groupMemberships", "studentAccessCredentials", "sessions", "activities", "activityGroupAssignments", "teacherDrafts", "learningSessions", "studentProgress", "studentResponses", "studentOutcomes"]);
});

test("detects broken academic and learning-session relationships", () => {
  const model = emptyModel();
  model.groups.push({ id: "group-1", schoolId: "missing-school", teacherId: "missing-teacher", displayName: "401", schoolYear: "2026-2027", archivedAt: null });
  model.learningSessions.push({ id: "session-1", activityId: "missing-activity", studentId: "missing-student", groupId: "group-1", startedAt: "2026-08-05T12:00:00.000Z", completedAt: null });
  assert.equal(validateServerDataModel(model).length, 4);
});
