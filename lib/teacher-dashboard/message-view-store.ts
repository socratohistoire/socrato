export interface TeacherMessageViewStore {
  hasSeen(messageKey: string): boolean;
  markSeen(messageKey: string): void;
}

export const TEACHER_MESSAGE_STORAGE_KEY = "socrato-teacher-viewed-message-keys-v1";

function opaqueMessageKeyPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function createActivitySummaryMessageKey(activityId: string, summaryVersion: string) {
  return `activity-summary-${opaqueMessageKeyPart(activityId)}-${opaqueMessageKeyPart(summaryVersion)}`;
}

function isOpaqueTeacherMessageKey(value: unknown): value is string {
  return typeof value === "string" && /^(?:teacher-welcome-v1|teacher-configuration-complete-v1|activity-summary-[a-z0-9-]+-[a-z0-9-]+)$/.test(value);
}

export class LocalTeacherMessageViewStore implements TeacherMessageViewStore {
  constructor(private readonly storage: Pick<Storage, "getItem" | "setItem">) {}

  private readKeys() {
    try {
      const parsed: unknown = JSON.parse(this.storage.getItem(TEACHER_MESSAGE_STORAGE_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter(isOpaqueTeacherMessageKey) : [];
    } catch {
      return [];
    }
  }

  hasSeen(messageKey: string) {
    return isOpaqueTeacherMessageKey(messageKey) && this.readKeys().includes(messageKey);
  }

  markSeen(messageKey: string) {
    if (!isOpaqueTeacherMessageKey(messageKey)) return;
    const keys = this.readKeys();
    if (!keys.includes(messageKey)) this.storage.setItem(TEACHER_MESSAGE_STORAGE_KEY, JSON.stringify([...keys, messageKey]));
  }
}
