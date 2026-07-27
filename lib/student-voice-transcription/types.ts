export const VOICE_WARNING_SECONDS = 105 as const;
export const VOICE_MAX_SECONDS = 120 as const;
export const VOICE_LOCALE = "fr-CA" as const;
export const VOICE_AZURE_REGION = "canadacentral" as const;
export const LOCAL_VOICE_DEMO_TRANSCRIPT = "[Simulation locale de dictée — aucun audio n’a été transmis ni transcrit.]";

export type VoiceCaptureStatus =
  | "unsupported"
  | "idle"
  | "requesting_permission"
  | "recording"
  | "stopping"
  | "transcribing"
  | "success"
  | "permission_denied"
  | "error"
  | "duration_limit_reached";

export type VoiceCaptureState = {
  status: VoiceCaptureStatus;
  elapsedSeconds: number;
  remainingSeconds: number;
  warningReached: boolean;
  message: string;
};

export type VoiceTranscriptionRequest = {
  audio: Uint8Array;
  mimeType: string;
  locale: typeof VOICE_LOCALE;
};

export type VoiceTranscriptionResult = {
  text: string;
};

export type VoiceTranscriptionErrorCode =
  | "not_configured"
  | "not_authorized"
  | "invalid_audio"
  | "limit_reached"
  | "provider_unavailable"
  | "timeout";

export class VoiceTranscriptionError extends Error {
  constructor(readonly code: VoiceTranscriptionErrorCode) {
    super("La transcription vocale n’est pas disponible pour le moment.");
    this.name = "VoiceTranscriptionError";
  }
}

export function appendVoiceTranscript(existing: string, transcript: string) {
  if (!existing) return transcript;
  return `${existing}${/\s$/.test(existing) ? "" : "\n"}${transcript}`;
}

export function formatRecordingDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}
