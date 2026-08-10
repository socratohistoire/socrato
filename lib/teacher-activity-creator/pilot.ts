import type { ActivityConfiguration, ActivityCreatorCatalog } from "./types.ts";

export const TERRA_SUMMARY_PILOT_QUESTION_COUNT = 10;

export function createSolSummaryPilotConfiguration(
  catalog: ActivityCreatorCatalog,
  selectedGroupIds: readonly string[] = catalog.groups.map(({ id }) => id),
): ActivityConfiguration {
  const availableGroupIds = new Set(catalog.groups.map(({ id }) => id));
  const validSelectedGroupIds = selectedGroupIds.filter((id) => availableGroupIds.has(id));

  return {
    title: "Activité pilote — bilan Sol",
    durationMinutes: null,
    questionCount: TERRA_SUMMARY_PILOT_QUESTION_COUNT,
    selectedGroupIds: validSelectedGroupIds.length > 0
      ? [...validSelectedGroupIds]
      : catalog.groups.map(({ id }) => id),
    workType: "revision",
    notionIds: ["acte-union"],
    operationId: null,
    questionValidated: false,
  };
}
