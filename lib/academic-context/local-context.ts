import { ACADEMIC_CONTEXT_VERSION, type AcademicContext } from "./types.ts";

export const LOCAL_TEACHER_ID = "teacher-demo-local";
export const LOCAL_STUDENT_ID = "local-anonymous-student-1";
export const LOCAL_STUDENT_GROUP_ID = "group-demo-401";

const group = (id: string, name: string) => ({ id, teacherId: LOCAL_TEACHER_ID, name });

export const LOCAL_ACADEMIC_CONTEXT: AcademicContext = {
  schemaVersion: ACADEMIC_CONTEXT_VERSION,
  teachers: [{ id: LOCAL_TEACHER_ID, displayLabel: "Enseignante fictive" }],
  groups: [
    group("group-demo-401", "Groupe fictif 401"), group("group-demo-402", "Groupe fictif 402"), group("group-demo-403", "Groupe fictif 403"),
    group("group-demo-404", "Groupe fictif 404"), group("group-demo-405", "Groupe fictif 405"), group("group-demo-406", "Groupe fictif 406"), group("group-demo-407", "Groupe fictif 407"),
  ],
  students: [
    { id: LOCAL_STUDENT_ID, groupId: LOCAL_STUDENT_GROUP_ID, displayLabel: "Élève local (fictif)" },
    { id: "student-demo-a17", groupId: "group-demo-401", displayLabel: "Liam B. (fictif)" },
    { id: "student-demo-b08", groupId: "group-demo-401", displayLabel: "Maya L. (fictive)" },
    { id: "student-demo-d22", groupId: "group-demo-401", displayLabel: "Sofia P. (fictive)" },
    { id: "student-demo-e14", groupId: "group-demo-401", displayLabel: "Émile R. (fictif)" },
    { id: "student-demo-n09", groupId: "group-demo-401", displayLabel: "Nora T. (fictive)" },
    { id: "student-demo-c03", groupId: "group-demo-401", displayLabel: "Adam C. (fictif)" },
    { id: "student-demo-f11", groupId: "group-demo-402", displayLabel: "Zoé M. (fictive)" },
    { id: "student-demo-g04", groupId: "group-demo-402", displayLabel: "Noah P. (fictif)" },
  ],
  assignments: [{ activityId: "activity-revision-01", teacherId: LOCAL_TEACHER_ID, groupIds: ["group-demo-401", "group-demo-402", "group-demo-403", "group-demo-404", "group-demo-405", "group-demo-406", "group-demo-407"] }],
};
