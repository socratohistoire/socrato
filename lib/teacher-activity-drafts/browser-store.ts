import type { ActivityConfiguration, ActivityCreatorCatalog } from "../teacher-activity-creator/types.ts";
import { ACTIVE_ACTIVITY_DRAFT_ID, TEACHER_ACTIVITY_DRAFT_VERSION, type TeacherActivityDraft } from "./types.ts";

export const TEACHER_ACTIVITY_DRAFT_STORAGE_KEY = "socrato-teacher-activity-drafts-v1";
type DraftStorage = Pick<Storage, "getItem" | "setItem">;

function validConfiguration(value: unknown): value is ActivityConfiguration {
  if (!value || typeof value !== "object") return false;
  const config = value as Record<string, unknown>;
  return typeof config.title === "string"
    && (config.durationMinutes === null || typeof config.durationMinutes === "number")
    && Number.isInteger(config.questionCount) && Number(config.questionCount) >= 1 && Number(config.questionCount) <= 20
    && Array.isArray(config.selectedGroupIds) && config.selectedGroupIds.every((id) => typeof id === "string")
    && (config.workType === "revision" || config.workType === "development")
    && Array.isArray(config.notionIds) && config.notionIds.every((id) => typeof id === "string")
    && (config.operationId === null || typeof config.operationId === "string")
    && typeof config.questionValidated === "boolean";
}

function validDraft(value: unknown): value is TeacherActivityDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return draft.schemaVersion === TEACHER_ACTIVITY_DRAFT_VERSION
    && typeof draft.draftId === "string"
    && validConfiguration(draft.configuration)
    && draft.questionOverrides !== null && typeof draft.questionOverrides === "object" && !Array.isArray(draft.questionOverrides)
    && Object.values(draft.questionOverrides as Record<string, unknown>).every((id) => typeof id === "string")
    && Number.isInteger(draft.previewQuestionIndex)
    && typeof draft.updatedAt === "string";
}

function readRecords(storage: Pick<Storage, "getItem">): Record<string, TeacherActivityDraft> {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(TEACHER_ACTIVITY_DRAFT_STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => validDraft(value)));
  } catch {
    return {};
  }
}

export function createTeacherActivityDraft(configuration: ActivityConfiguration, questionOverrides: Record<number, string>, previewQuestionIndex: number, now = new Date()): TeacherActivityDraft {
  return { schemaVersion: TEACHER_ACTIVITY_DRAFT_VERSION, draftId: ACTIVE_ACTIVITY_DRAFT_ID, configuration, questionOverrides, previewQuestionIndex, updatedAt: now.toISOString() };
}

export function saveTeacherActivityDraft(storage: DraftStorage, draft: TeacherActivityDraft) {
  storage.setItem(TEACHER_ACTIVITY_DRAFT_STORAGE_KEY, JSON.stringify({ ...readRecords(storage), [draft.draftId]: draft }));
}

export function readActiveTeacherActivityDraft(storage: Pick<Storage, "getItem">, catalog: ActivityCreatorCatalog): TeacherActivityDraft | null {
  const draft = readRecords(storage)[ACTIVE_ACTIVITY_DRAFT_ID];
  if (!draft) return null;
  const groupIds = new Set(catalog.groups.map(({ id }) => id));
  const notionIds = new Set(catalog.notions.map(({ id }) => id));
  const operationIds = new Set(catalog.operations.map(({ id }) => id));
  const questionIds = new Set(catalog.questions.map(({ id }) => id));
  return {
    ...draft,
    configuration: {
      ...draft.configuration,
      selectedGroupIds: draft.configuration.selectedGroupIds.filter((id) => groupIds.has(id)),
      notionIds: draft.configuration.notionIds.filter((id) => notionIds.has(id)),
      operationId: draft.configuration.operationId && operationIds.has(draft.configuration.operationId) ? draft.configuration.operationId : null,
    },
    questionOverrides: Object.fromEntries(Object.entries(draft.questionOverrides).filter(([, id]) => questionIds.has(id)).map(([index, id]) => [Number(index), id])),
  };
}

export function readActiveTeacherActivityDraftSummary(storage: Pick<Storage, "getItem">): TeacherActivityDraft | null {
  return readRecords(storage)[ACTIVE_ACTIVITY_DRAFT_ID] ?? null;
}

export function clearActiveTeacherActivityDraft(storage: DraftStorage) {
  const records = readRecords(storage);
  delete records[ACTIVE_ACTIVITY_DRAFT_ID];
  storage.setItem(TEACHER_ACTIVITY_DRAFT_STORAGE_KEY, JSON.stringify(records));
}
