export const AUTHENTICATION_CONTRACT_VERSION = 1 as const;

export type AuthenticatedSessionContract = {
  schemaVersion: typeof AUTHENTICATION_CONTRACT_VERSION;
  role: "student" | "teacher";
  subjectId: string;
  groupIds: string[];
  expiresAt: string;
};

export type StudentCodeSessionRequest = { code: string };
export type StudentCodeSessionResponse = { session: AuthenticatedSessionContract };

export const AUTHENTICATION_API_ROUTES = {
  currentSession: "/api/v1/auth/session",
  studentCodeSession: "/api/v1/auth/student/code-session",
  teacherLogin: "/api/v1/auth/teacher/login",
} as const;

export type AuthenticationApiContract = {
  "GET /auth/session": { response: AuthenticatedSessionContract | null };
  "DELETE /auth/session": { response: null };
  "POST /auth/student/code-session": { body: StudentCodeSessionRequest; response: StudentCodeSessionResponse };
  "GET /auth/teacher/login": { query: { returnTo?: string }; response: "redirect" };
};
