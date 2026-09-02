export type StudentFollowUpLevel = "high" | "medium" | "normal";

export type StudentPriorityAssessment = {
  level: StudentFollowUpLevel;
  reason: string;
};

function resultStatuses(value: unknown): string[] {
  if (typeof value === "string") {
    try { value = JSON.parse(value) as unknown; } catch { return []; }
  }
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => item && typeof item === "object" && typeof (item as { status?: unknown }).status === "string"
    ? [(item as { status: string }).status]
    : []);
}

/** One shared pedagogical rule for every teacher-facing student list. */
export function assessStudentPriority(operationResults: unknown, knowledgeResults: unknown): StudentPriorityAssessment {
  const statuses = [...resultStatuses(operationResults), ...resultStatuses(knowledgeResults)];
  const needsWorkCount = statuses.filter((status) => status === "to_work_on" || status === "needs_work").length;
  const assistedCount = statuses.filter((status) => status === "to_consolidate" || status === "consolidate").length;

  if (needsWorkCount >= 2) {
    return {
      level: "high",
      reason: `${needsWorkCount} éléments demeurent à travailler malgré l’accompagnement de Socrato.`,
    };
  }
  if (needsWorkCount === 1) {
    return {
      level: "medium",
      reason: "Un élément ciblé demeure à travailler; un suivi est recommandé.",
    };
  }
  if (assistedCount >= 2) {
    return {
      level: "medium",
      reason: `${assistedCount} éléments ont été maîtrisés avec l’aide de Socrato.`,
    };
  }
  return {
    level: "normal",
    reason: assistedCount === 1
      ? "Un élément a été maîtrisé avec l’aide de Socrato; aucune intervention prioritaire n’est requise."
      : "Aucun signal d’intervention prioritaire pour le moment.",
  };
}
