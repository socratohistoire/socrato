export type StudentAccessCredential = {
  credentialId: string;
  anonymousStudentId: string;
  lookupDigest: string;
  status: "active" | "disabled";
  expiresAt: Date;
  membershipActive: boolean;
};

export interface StudentAccessCodeRepository {
  findByLookupDigest(
    lookupDigest: string,
  ): Promise<StudentAccessCredential | null>;
}
