import type { PublishedActivityContract } from "../activity-contract/types.ts";
import type { PedagogicalSummary, StudentResponse } from "../pedagogical-session-engine/types.ts";
import type { StudentProgressContract } from "../student-progress/types.ts";
import type { TeacherActivityDraft } from "../teacher-activity-drafts/types.ts";

export const SERVER_DATA_MODEL_VERSION = 1 as const;

export type SchoolRecord = { id: string; displayName: string; createdAt: string };
export type TeacherRecord = { id: string; schoolId: string; identityProviderSubject: string; displayName: string; createdAt: string };
export type GroupRecord = { id: string; schoolId: string; teacherId: string; displayName: string; schoolYear: string; archivedAt: string | null };
export type StudentRecord = { id: string; schoolId: string; displayAlias: string; externalReferenceDigest: string | null; createdAt: string; archivedAt: string | null };
export type GroupMembershipRecord = { id: string; groupId: string; studentId: string; active: boolean; joinedAt: string; leftAt: string | null };

export type StudentAccessCredentialRecord = {
  id: string;
  studentId: string;
  lookupDigest: string;
  status: "active" | "disabled";
  expiresAt: string;
  createdAt: string;
};

export type ServerSessionRecord = {
  id: string;
  subjectType: "student" | "teacher";
  subjectId: string;
  tokenDigest: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
};

export type ActivityRecord = PublishedActivityContract & { teacherId: string };
export type ActivityGroupAssignmentRecord = { id: string; activityId: string; groupId: string; assignedAt: string };
export type TeacherDraftRecord = { teacherId: string; draft: TeacherActivityDraft };
export type LearningSessionRecord = { id: string; activityId: string; studentId: string; groupId: string; startedAt: string; completedAt: string | null };
export type StudentProgressRecord = { sessionId: string; progress: StudentProgressContract };
export type StudentOutcomeRecord = { sessionId: string; studentId: string; summary: PedagogicalSummary };

export type StudentResponseRecord = Omit<StudentResponse, "content"> & {
  studentId: string;
  contentCiphertext: string;
  submittedAt: string;
  retentionExpiresAt: string;
};

export type FutureServerDataModel = {
  schemaVersion: typeof SERVER_DATA_MODEL_VERSION;
  schools: SchoolRecord[];
  teachers: TeacherRecord[];
  groups: GroupRecord[];
  students: StudentRecord[];
  groupMemberships: GroupMembershipRecord[];
  studentAccessCredentials: StudentAccessCredentialRecord[];
  sessions: ServerSessionRecord[];
  activities: ActivityRecord[];
  activityGroupAssignments: ActivityGroupAssignmentRecord[];
  teacherDrafts: TeacherDraftRecord[];
  learningSessions: LearningSessionRecord[];
  studentProgress: StudentProgressRecord[];
  studentResponses: StudentResponseRecord[];
  studentOutcomes: StudentOutcomeRecord[];
};
