import type { DashboardMode, StudentActivity, StudentDashboardData } from "./types.ts";

export function resolveSelectedActivityId(
  data: Pick<StudentDashboardData, "defaultActivityId" | "activities">,
  requestedActivityId?: string,
): string {
  return requestedActivityId && data.activities.some(({ id }) => id === requestedActivityId)
    ? requestedActivityId
    : data.defaultActivityId;
}

export function prioritizeDashboardActivities(activities: readonly StudentActivity[]): StudentActivity[] {
  return activities
    .map((activity, index) => ({ activity, index }))
    .sort((left, right) => {
      const priority = (activity: StudentActivity) => activity.activityStatus === "completed"
        ? 2
        : activity.origin === "teacher_assigned" ? 0 : 1;
      return priority(left.activity) - priority(right.activity) || left.index - right.index;
    })
    .map(({ activity }) => activity);
}

export function getSelectedActivity(data: StudentDashboardData): StudentActivity {
  const activity = data.activities.find(({ id }) => id === data.selectedActivityId)
    ?? data.activities.find(({ id }) => id === data.defaultActivityId);
  if (!activity) throw new Error("Le tableau de bord ne contient aucune activité par défaut.");
  return activity;
}

export function getActivityDashboardUrl(activityId: string): string {
  return `/eleve/tableau-de-bord?activity=${encodeURIComponent(activityId)}#activite`;
}

export function getDashboardUrl(
  notionId: string,
  mode: DashboardMode,
  activityId?: string,
): string {
  if (activityId) return getActivityDashboardUrl(activityId);
  return `/eleve/tableau-de-bord?mode=${mode}&notion=${encodeURIComponent(notionId)}#activite`;
}

export function getLearningSessionUrl(activityId: string, notionId: string, mode: DashboardMode): string {
  const params = new URLSearchParams({ notion: notionId, mode });
  return `/eleve/activite/${encodeURIComponent(activityId)}?${params.toString()}`;
}

export type ConsolidationStrategyKey = "decompose-instruction" | "cross-documents" | "source-context" | "evidence" | "comparison" | "causality" | "date-event" | "data-association" | "other";

export function normalizeConsolidationStrategyAdvice(advice: string): string {
  return advice.trim()
    .replace(/^Pour appliquer cette stratégie, utilise une feuille ou ton cahier\.\s*/iu, "")
    .replace(/^Sur une feuille ou dans ton cahier,\s*/iu, "")
    .replace(/avec plusieurs documents(?! historiques)/giu, "avec plusieurs documents historiques")
    .replace(/avec un document(?! historique)/giu, "avec un document historique")
    .replace(/dans les documents(?! historiques)/giu, "dans les documents historiques");
}

export function getConsolidationStrategyKey(entry?: string): ConsolidationStrategyKey | undefined {
  if (!entry) return undefined;
  if (/^Décomposer la consigne|^Décoder la consigne/iu.test(entry)) return "decompose-instruction";
  if (/^Croiser plusieurs documents/iu.test(entry)) return "cross-documents";
  if (/^Identifier le point de vue et le contexte/iu.test(entry)) return "source-context";
  if (/^Prélever et expliquer une preuve/iu.test(entry)) return "evidence";
  if (/^Comparer avec méthode|^Dégager des différences et des similitudes/iu.test(entry)) return "comparison";
  if (/^Construire une chaîne causale(?: avec les documents)?|^Déterminer des causes et des conséquences|^Établir des liens de causalité/iu.test(entry)) return "causality";
  if (/^Associer chaque date à son événement|^Situer dans le temps et dans l’espace/iu.test(entry)) return "date-event";
  if (/^Associer les données à la bonne colonie/iu.test(entry)) return "data-association";
  return "other";
}

export function getConsolidationStrategyAdvice(entry?: string): string | undefined {
  if (!entry) return undefined;
  const markers = ["\nComment travailler cette opération\n", "\nComment progresser\n"];
  const marker = markers.find((candidate) => entry.includes(candidate));
  if (marker) {
    const advice = entry.slice(entry.indexOf(marker) + marker.length).trim();
    return advice ? normalizeConsolidationStrategyAdvice(advice) : undefined;
  }
  const legacyMarker = ", ton premier essai demandait encore cette vérification : ";
  const legacyBody = entry.split("\n").slice(1).join("\n");
  const legacyIndex = legacyBody.indexOf(legacyMarker);
  if (legacyIndex < 0) return undefined;
  const remainder = legacyBody.slice(legacyIndex + legacyMarker.length);
  const adviceStarts = ["Pour mieux", "Pour rendre", "Pour éviter", "Pour répondre", "Relève l’apport", "Choisis dans le document", "Avant d’interpréter"];
  const adviceIndex = adviceStarts.map((start) => remainder.lastIndexOf(` ${start}`)).filter((index) => index > 0).sort((a, b) => a - b)[0] ?? -1;
  if (adviceIndex < 0) return undefined;
  const advice = remainder.slice(adviceIndex).trim();
  if (advice.startsWith("Relève l’apport de chaque document")) return normalizeConsolidationStrategyAdvice("À ta prochaine question avec plusieurs documents historiques, note d’abord l’idée utile de chacun. Vérifie ensuite s’ils se complètent ou s’opposent avant de formuler ta conclusion.");
  return normalizeConsolidationStrategyAdvice(advice);
}

export function getConsolidationSessionUrl(activityId: string, notionId: string, operationId?: string, knowledgeId?: string, strategy?: ConsolidationStrategyKey, strategyAdvice?: string): string {
  const params = new URLSearchParams({ notion: notionId, mode: "notion-review", consolidation: "1" });
  if (operationId) params.set("operation", operationId);
  if (knowledgeId) params.set("knowledge", knowledgeId);
  if (strategy) params.set("strategy", strategy);
  if (strategyAdvice) params.set("advice", strategyAdvice.slice(0, 600));
  return `/eleve/activite/${encodeURIComponent(activityId)}?${params.toString()}`;
}
