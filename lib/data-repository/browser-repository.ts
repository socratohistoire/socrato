import { readLocalPublishedActivities, saveLocalPublishedActivity, setLocalPublishedActivityStatus } from "../local-published-activities/store.ts";
import { applyLocalPublishedActivitiesToStudentDashboard } from "../local-published-activities/student-dashboard.ts";
import { applyStoredStudentActivityOutcomes, clearStudentActivityOutcome, readStudentActivityOutcomes, saveStudentActivityOutcome } from "../student-activity-outcomes/browser-store.ts";
import { applyStoredStudentProgress, clearStudentProgress, readStudentProgress, saveStudentProgress } from "../student-progress/browser-store.ts";
import { clearActiveTeacherActivityDraft, readActiveTeacherActivityDraft, readActiveTeacherActivityDraftSummary, saveTeacherActivityDraft } from "../teacher-activity-drafts/browser-store.ts";
import type { SocratoDataRepository } from "./types.ts";

export class BrowserSocratoDataRepository implements SocratoDataRepository {
  constructor(private readonly storage: Storage) {}
  async loadStudentDashboard(data: Parameters<SocratoDataRepository["loadStudentDashboard"]>[0], selectedActivityId?: string | null) {
    const withPublishedActivities = applyLocalPublishedActivitiesToStudentDashboard(data, readLocalPublishedActivities(this.storage), undefined, selectedActivityId);
    const withProgress = applyStoredStudentProgress(withPublishedActivities, this.storage);
    return applyStoredStudentActivityOutcomes(withProgress, this.storage);
  }
  async listPublishedActivities() { return readLocalPublishedActivities(this.storage); }
  async savePublishedActivity(activity: Parameters<typeof saveLocalPublishedActivity>[1]) { saveLocalPublishedActivity(this.storage, activity); }
  async setPublishedActivityStatus(activityId: string, status: Parameters<typeof setLocalPublishedActivityStatus>[2]) { return setLocalPublishedActivityStatus(this.storage, activityId, status); }
  async readActiveDraft(catalog: Parameters<typeof readActiveTeacherActivityDraft>[1]) { return readActiveTeacherActivityDraft(this.storage, catalog); }
  async readActiveDraftSummary() { return readActiveTeacherActivityDraftSummary(this.storage); }
  async saveDraft(draft: Parameters<typeof saveTeacherActivityDraft>[1]) { saveTeacherActivityDraft(this.storage, draft); }
  async clearActiveDraft() { clearActiveTeacherActivityDraft(this.storage); }
  async listStudentProgress() { return readStudentProgress(this.storage); }
  async saveStudentProgress(progress: Parameters<typeof saveStudentProgress>[1]) { return saveStudentProgress(this.storage, progress); }
  async clearStudentProgress(activityId: string) { clearStudentProgress(this.storage, activityId); }
  async listStudentOutcomes() { return readStudentActivityOutcomes(this.storage); }
  async saveStudentOutcome(summary: Parameters<typeof saveStudentActivityOutcome>[1]) { saveStudentActivityOutcome(this.storage, summary); }
  async clearStudentOutcome(activityId: string) { clearStudentActivityOutcome(this.storage, activityId); }
}

export function createBrowserDataRepository(storage: Storage): SocratoDataRepository {
  return new BrowserSocratoDataRepository(storage);
}
