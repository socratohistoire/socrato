import type { ActivityCreatorCatalog } from "../teacher-activity-creator/types.ts";
import type { SocratoDataRepository } from "./types.ts";
import { activityStatusRoute, SOCRATO_API_ROUTES, studentOutcomeRoute, studentProgressRoute } from "./api-contract.ts";

export class SocratoApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = "api_error",
  ) {
    super(message);
    this.name = "SocratoApiError";
  }
}

type HttpRepositoryOptions = {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
};

export class HttpSocratoDataRepository implements SocratoDataRepository {
  private readonly baseUrl: string;
  private readonly fetchImplementation: typeof globalThis.fetch;

  constructor({ baseUrl, fetch: fetchImplementation = globalThis.fetch }: HttpRepositoryOptions) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.fetchImplementation = fetchImplementation;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchImplementation(`${this.baseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: { code?: string; message?: string } } | null;
      throw new SocratoApiError(payload?.error?.message ?? "Le serveur Socrato n’a pas pu traiter la demande.", response.status, payload?.error?.code);
    }
    if (response.status === 204) return null as T;
    return response.json() as Promise<T>;
  }

  loadStudentDashboard(_data: Parameters<SocratoDataRepository["loadStudentDashboard"]>[0], selectedActivityId?: string | null) {
    const query = selectedActivityId ? `?activityId=${encodeURIComponent(selectedActivityId)}` : "";
    return this.request<Awaited<ReturnType<SocratoDataRepository["loadStudentDashboard"]>>>(`${SOCRATO_API_ROUTES.studentDashboard}${query}`);
  }
  listPublishedActivities() { return this.request<Awaited<ReturnType<SocratoDataRepository["listPublishedActivities"]>>>(SOCRATO_API_ROUTES.teacherActivities); }
  async savePublishedActivity(activity: Parameters<SocratoDataRepository["savePublishedActivity"]>[0]) { await this.request(SOCRATO_API_ROUTES.teacherActivities, { method: "POST", body: JSON.stringify(activity) }); }
  setPublishedActivityStatus(activityId: string, status: Parameters<SocratoDataRepository["setPublishedActivityStatus"]>[1]) { return this.request<Awaited<ReturnType<SocratoDataRepository["setPublishedActivityStatus"]>>>(activityStatusRoute(activityId), { method: "PATCH", body: JSON.stringify({ publicationStatus: status }) }); }
  readActiveDraft(_catalog: ActivityCreatorCatalog) { return this.request<Awaited<ReturnType<SocratoDataRepository["readActiveDraft"]>>>(SOCRATO_API_ROUTES.activeTeacherDraft); }
  readActiveDraftSummary() { return this.request<Awaited<ReturnType<SocratoDataRepository["readActiveDraftSummary"]>>>(SOCRATO_API_ROUTES.activeTeacherDraft); }
  async saveDraft(draft: Parameters<SocratoDataRepository["saveDraft"]>[0]) { await this.request(SOCRATO_API_ROUTES.activeTeacherDraft, { method: "PUT", body: JSON.stringify(draft) }); }
  async clearActiveDraft() { await this.request(SOCRATO_API_ROUTES.activeTeacherDraft, { method: "DELETE" }); }
  listStudentProgress() { return this.request<Awaited<ReturnType<SocratoDataRepository["listStudentProgress"]>>>(SOCRATO_API_ROUTES.studentProgress); }
  saveStudentProgress(progress: Parameters<SocratoDataRepository["saveStudentProgress"]>[0]) { return this.request<Awaited<ReturnType<SocratoDataRepository["saveStudentProgress"]>>>(studentProgressRoute(progress.activityId), { method: "PUT", body: JSON.stringify(progress) }); }
  async clearStudentProgress(activityId: string) { await this.request(studentProgressRoute(activityId), { method: "DELETE" }); }
  listStudentOutcomes() { return this.request<Awaited<ReturnType<SocratoDataRepository["listStudentOutcomes"]>>>(SOCRATO_API_ROUTES.studentOutcomes); }
  async saveStudentOutcome(summary: Parameters<SocratoDataRepository["saveStudentOutcome"]>[0]) { await this.request(studentOutcomeRoute(summary.activityId), { method: "PUT", body: JSON.stringify(summary) }); }
  async clearStudentOutcome(activityId: string) { await this.request(studentOutcomeRoute(activityId), { method: "DELETE" }); }
}
