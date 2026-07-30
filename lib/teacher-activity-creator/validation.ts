import type { ActivityConfiguration, ConfigurationErrors } from "./types.ts";

export function validateActivityConfiguration(config: ActivityConfiguration): ConfigurationErrors {
  const errors: ConfigurationErrors = {};
  if (!config.title.trim()) errors.title = "Ajoutez un titre à l’activité.";
  if (!config.durationMinutes && !config.questionCount) errors.format = "Sélectionnez une durée ou un nombre de questions.";
  if (!config.selectedGroupIds.length) errors.groups = "Sélectionnez au moins un groupe.";
  if (!config.notionIds.length) errors.notions = "Sélectionnez au moins une notion.";
  if (config.workType === "development" && config.notionIds.length !== 1) errors.notions = "Une question à développement exige exactement une notion.";
  if (config.workType === "development" && !config.operationId) errors.operation = "Sélectionnez une opération intellectuelle.";
  return errors;
}

export function isActivityConfigurationComplete(config: ActivityConfiguration) {
  return Object.keys(validateActivityConfiguration(config)).length === 0;
}
