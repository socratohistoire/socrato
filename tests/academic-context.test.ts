import assert from "node:assert/strict";
import test from "node:test";
import { LOCAL_ACADEMIC_CONTEXT, LOCAL_STUDENT_ID, LOCAL_TEACHER_ID, studentCanAccessActivity, studentCanAccessAssignment, teacherCanAccessStudent, teacherOwnsAssignment, teacherOwnsGroup } from "../lib/academic-context/index.ts";

test("defines one coherent local teacher, group roster and student identity", () => {
  assert.equal(LOCAL_ACADEMIC_CONTEXT.schemaVersion, 1);
  assert.equal(LOCAL_ACADEMIC_CONTEXT.teachers.some(({ id }) => id === LOCAL_TEACHER_ID), true);
  const localStudent = LOCAL_ACADEMIC_CONTEXT.students.find(({ id }) => id === LOCAL_STUDENT_ID);
  assert.equal(localStudent?.groupId, "group-demo-401");
  assert.equal(new Set(LOCAL_ACADEMIC_CONTEXT.students.map(({ id }) => id)).size, LOCAL_ACADEMIC_CONTEXT.students.length);
  assert.ok(LOCAL_ACADEMIC_CONTEXT.groups.every(({ teacherId }) => teacherId === LOCAL_TEACHER_ID));
});

test("allows a teacher to access only owned groups and their students", () => {
  assert.equal(teacherOwnsGroup(LOCAL_ACADEMIC_CONTEXT, LOCAL_TEACHER_ID, "group-demo-401"), true);
  assert.equal(teacherOwnsGroup(LOCAL_ACADEMIC_CONTEXT, "teacher-other", "group-demo-401"), false);
  assert.equal(teacherCanAccessStudent(LOCAL_ACADEMIC_CONTEXT, LOCAL_TEACHER_ID, LOCAL_STUDENT_ID), true);
  assert.equal(teacherCanAccessStudent(LOCAL_ACADEMIC_CONTEXT, "teacher-other", LOCAL_STUDENT_ID), false);
});

test("allows an activity only for a student in an assigned group", () => {
  assert.equal(teacherOwnsAssignment(LOCAL_ACADEMIC_CONTEXT, LOCAL_TEACHER_ID, "activity-revision-01"), true);
  assert.equal(studentCanAccessActivity(LOCAL_ACADEMIC_CONTEXT, LOCAL_STUDENT_ID, "activity-revision-01"), true);
  assert.equal(studentCanAccessActivity(LOCAL_ACADEMIC_CONTEXT, LOCAL_STUDENT_ID, "activity-unknown"), false);
  const foreignAssignment = { activityId: "foreign", teacherId: "teacher-other", groupIds: ["group-demo-401"] };
  assert.equal(studentCanAccessAssignment(LOCAL_ACADEMIC_CONTEXT, LOCAL_STUDENT_ID, foreignAssignment), false);
});
