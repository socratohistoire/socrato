export function activityTitleWithoutStudentIdentity(title: string) {
  return /^Consolidation personnalisée\s+[—–-]\s+.+$/iu.test(title.trim())
    ? "Consolidation personnalisée"
    : title;
}
