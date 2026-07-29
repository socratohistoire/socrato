import { ACTE_UNION_DOCUMENTS } from "../student-learning-session/document-catalog.ts";
import { DEMO_INTELLECTUAL_OPERATIONS } from "../student-dashboard/demo-provider.ts";
import { createLocalTeacherDashboardData } from "../teacher-dashboard/local-provider.ts";
import { SECONDARY_FOUR_NOTIONS } from "./secondary-four-notions.ts";
import type { ActivityCreatorCatalog } from "./types.ts";

export function isLocalActivityCreatorEnabled(environment = process.env.NODE_ENV) {
  return environment !== "production";
}

export class LocalActivityCreatorProvider {
  constructor(private readonly environment = process.env.NODE_ENV) {}

  async getCatalog(): Promise<ActivityCreatorCatalog> {
    if (!isLocalActivityCreatorEnabled(this.environment)) {
      throw new Error("The local activity-creator provider is disabled in production.");
    }
    const dashboard = createLocalTeacherDashboardData();
    return {
      source: "local_demo",
      groups: dashboard.groups.map(({ id, name }) => ({ id, name })),
      notions: SECONDARY_FOUR_NOTIONS,
      operations: DEMO_INTELLECTUAL_OPERATIONS.map(({ id, label }) => ({ id, label })),
      documents: ACTE_UNION_DOCUMENTS,
    };
  }
}
