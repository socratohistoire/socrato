import type { FutureServerDataModel } from "./types.ts";

export type DataModelIssue = { collection: keyof FutureServerDataModel; id: string; message: string };

export function validateServerDataModel(model: FutureServerDataModel): DataModelIssue[] {
  const issues: DataModelIssue[] = [];
  const schools = new Set(model.schools.map(({ id }) => id));
  const teachers = new Set(model.teachers.map(({ id }) => id));
  const groups = new Set(model.groups.map(({ id }) => id));
  const students = new Set(model.students.map(({ id }) => id));
  const activities = new Set(model.activities.map(({ id }) => id));
  const learningSessions = new Set(model.learningSessions.map(({ id }) => id));
  const check = (valid: boolean, collection: keyof FutureServerDataModel, id: string, message: string) => { if (!valid) issues.push({ collection, id, message }); };

  for (const teacher of model.teachers) check(schools.has(teacher.schoolId), "teachers", teacher.id, "École inconnue.");
  for (const group of model.groups) {
    check(schools.has(group.schoolId), "groups", group.id, "École inconnue.");
    check(teachers.has(group.teacherId), "groups", group.id, "Enseignant inconnu.");
  }
  for (const student of model.students) check(schools.has(student.schoolId), "students", student.id, "École inconnue.");
  for (const membership of model.groupMemberships) {
    check(groups.has(membership.groupId), "groupMemberships", membership.id, "Groupe inconnu.");
    check(students.has(membership.studentId), "groupMemberships", membership.id, "Élève inconnu.");
  }
  for (const assignment of model.activityGroupAssignments) {
    check(activities.has(assignment.activityId), "activityGroupAssignments", assignment.id, "Activité inconnue.");
    check(groups.has(assignment.groupId), "activityGroupAssignments", assignment.id, "Groupe inconnu.");
  }
  for (const session of model.learningSessions) {
    check(activities.has(session.activityId), "learningSessions", session.id, "Activité inconnue.");
    check(students.has(session.studentId), "learningSessions", session.id, "Élève inconnu.");
    check(groups.has(session.groupId), "learningSessions", session.id, "Groupe inconnu.");
  }
  for (const progress of model.studentProgress) check(learningSessions.has(progress.sessionId), "studentProgress", progress.sessionId, "Séance inconnue.");
  for (const response of model.studentResponses) check(learningSessions.has(response.sessionId), "studentResponses", response.sessionId, "Séance inconnue.");
  for (const outcome of model.studentOutcomes) check(learningSessions.has(outcome.sessionId), "studentOutcomes", outcome.sessionId, "Séance inconnue.");
  return issues;
}
