function familyNameKey(displayLabel: string) {
  const clean = displayLabel.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const parts = clean.split(/\s+/);
  return `${parts.at(-1) ?? ""} ${parts.slice(0, -1).join(" ")}`;
}

export function compareStudentsByFamilyName(a: { displayLabel: string }, b: { displayLabel: string }) {
  return familyNameKey(a.displayLabel).localeCompare(familyNameKey(b.displayLabel), "fr-CA", { sensitivity: "base", numeric: true });
}
