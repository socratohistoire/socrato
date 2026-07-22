import type {
  DashboardMode,
  StudentDashboardData,
  StudentNotionDashboardContext,
} from "./types.ts";

export const DEFAULT_DASHBOARD_MODE: DashboardMode = "teacher-assigned";

export function resolveDashboardMode(requestedMode?: string): DashboardMode {
  return requestedMode === "notion-review" || requestedMode === "teacher-assigned"
    ? requestedMode
    : DEFAULT_DASHBOARD_MODE;
}

export function resolveSelectedNotionId(
  data: Pick<StudentDashboardData, "defaultNotionId" | "notionContexts">,
  requestedNotionId?: string,
): string {
  if (
    requestedNotionId &&
    data.notionContexts.some(({ notionId }) => notionId === requestedNotionId)
  ) {
    return requestedNotionId;
  }

  return data.defaultNotionId;
}

export function getSelectedNotionContext(
  data: StudentDashboardData,
  notionId = data.selectedNotionId,
): StudentNotionDashboardContext {
  const context =
    data.notionContexts.find((context) => context.notionId === notionId) ??
    data.notionContexts.find(
      (context) => context.notionId === data.defaultNotionId,
    );

  if (!context) {
    throw new Error("Le tableau de bord ne contient aucune notion par défaut.");
  }

  return context;
}

export function getDashboardUrl(
  notionId: string,
  mode: DashboardMode,
): string {
  return `/eleve/tableau-de-bord?mode=${mode}&notion=${encodeURIComponent(notionId)}#tableau-notion`;
}

export function getNotionDashboardUrl(notionId: string): string {
  return getDashboardUrl(notionId, "notion-review");
}
