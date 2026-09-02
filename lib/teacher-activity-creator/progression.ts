import type { ActivityConfiguration, ProgressionMode } from "./types.ts";

export function getProgressionMode(config: Pick<ActivityConfiguration, "durationMinutes" | "questionCount">): ProgressionMode {
  if (config.durationMinutes && config.questionCount) return "timed-capped";
  if (config.durationMinutes) return "timed";
  if (config.questionCount) return "fixed";
  return "incomplete";
}

export function getProgressionCopy(config: Pick<ActivityConfiguration, "durationMinutes" | "questionCount">) {
  const mode = getProgressionMode(config);
  if (mode === "fixed") return {
    summary: `${config.questionCount} question${config.questionCount === 1 ? "" : "s"}`,
    help: "",
    navigation: `Question 1 sur ${config.questionCount}`,
  };
  if (mode === "timed") return {
    summary: `${config.durationMinutes} minutes · parcours adaptatif`,
    help: "La révision s’adapte à la durée cible, sans total de questions imposé.",
    navigation: "Question 1 · Révision en cours",
  };
  if (mode === "timed-capped") return {
    summary: `${config.durationMinutes} minutes · jusqu’à ${config.questionCount} questions`,
    help: "Le parcours s’adapte à la durée cible, avec un maximum de questions.",
    navigation: `Question 1 · jusqu’à ${config.questionCount}`,
  };
  return {
    summary: "Format à compléter",
    help: "Choisissez un nombre de questions entre 1 et 24.",
    navigation: "Aucune progression définie",
  };
}
