export type StudentSession = {
  token: string;
  anonymousStudentId: string;
  credentialId: string;
  expiresAt: Date;
};

export interface StudentSessionRepository {
  create(input: {
    anonymousStudentId: string;
    credentialId: string;
  }): Promise<StudentSession>;
  findActiveByToken(token: string): Promise<StudentSession | null>;
  revokeByToken(token: string): Promise<void>;
}
