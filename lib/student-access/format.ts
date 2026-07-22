export const STUDENT_ACCESS_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

const MAX_SUBMITTED_LENGTH = 64;
const CANONICAL_CODE_PATTERN = new RegExp(
  `^[${STUDENT_ACCESS_CODE_ALPHABET}]{12}$`,
);

export type CodeFormatResult =
  | { valid: true; normalizedCode: string }
  | { valid: false };

export function validateAndNormalizeAccessCode(input: unknown): CodeFormatResult {
  if (typeof input !== "string" || input.length > MAX_SUBMITTED_LENGTH) {
    return { valid: false };
  }

  const normalizedCode = input
    .trim()
    .replaceAll("-", "")
    .replaceAll(" ", "")
    .toUpperCase();

  if (!CANONICAL_CODE_PATTERN.test(normalizedCode)) {
    return { valid: false };
  }

  return { valid: true, normalizedCode };
}
