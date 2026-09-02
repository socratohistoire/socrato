import type { ActivityConfiguration, ConfigurationErrors } from "./types.ts";

export function validateActivityConfiguration(config: ActivityConfiguration): ConfigurationErrors {
  const errors: ConfigurationErrors = {};
  if (!config.title.trim()) errors.title = "Ajoutez un titre à l’activité.";
  if (!config.questionCount || config.questionCount < 1 || config.questionCount > 24) errors.format = "Sélectionnez un nombre de questions entre 1 et 24.";
  if (!config.selectedGroupIds.length) errors.groups = "Sélectionnez au moins un groupe.";
  if (!config.notionIds.length) errors.notions = "Sélectionnez au moins une notion.";
  return errors;
}

export function isActivityConfigurationComplete(config: ActivityConfiguration) {
  return Object.keys(validateActivityConfiguration(config)).length === 0;
}
