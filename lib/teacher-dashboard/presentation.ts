import type { HighPriorityReason, TeacherActivitySummary, TeacherDashboardData, TeacherDashboardViewModel, TeacherSupportCandidate } from "./types.ts";

const APPROVED_HIGH_PRIORITY_REASONS = new Set<HighPriorityReason>([
  "failed_assessment",
  "near_failure",
]);

export function isHighPriorityStudent(candidate: TeacherSupportCandidate): candidate is TeacherSupportCandidate & {
  priority: "high";
  highPriorityReason: HighPriorityReason;
} {
  return candidate.priority === "high"
    && candidate.highPriorityReason !== undefined
    && APPROVED_HIGH_PRIORITY_REASONS.has(candidate.highPriorityReason);
}

export function selectHighPriorityStudents(candidates: readonly TeacherSupportCandidate[]) {
  return candidates.filter(isHighPriorityStudent);
}

function resolveSelectedActivity(data: TeacherDashboardData): TeacherActivitySummary {
  const fallbackActivity = [...data.activities].reverse().find((activity) => activity.resultAvailability !== "awaiting_results") ?? data.activities[0];
  const selectedActivity = data.activities.find((activity) => activity.id === data.selectedActivityId) ?? fallbackActivity;
  return selectedActivity ?? data.activities[0];
}

export function createTeacherDashboardViewModel(data: TeacherDashboardData): TeacherDashboardViewModel {
  const selectedActivity = resolveSelectedActivity(data);
  const selectedGroupBriefings = selectedActivity.groupPortraits;
  const selectedHighPriorityStudents = selectHighPriorityStudents(selectedActivity.highPriorityStudents);
  return {
    source: data.source,
    hasCreatedActivity: data.hasCreatedActivity,
    teacher: data.teacher,
    weekLabel: data.weekLabel,
    activities: data.activities,
    selectedActivityId: selectedActivity.id,
    selectedActivity,
    allGroups: data.groups,
    groupBriefings: selectedGroupBriefings,
    groups: data.groups.filter((group) => selectedActivity.targetedGroupIds.includes(group.id)),
    highPriorityStudents: selectedHighPriorityStudents,
  };
}
