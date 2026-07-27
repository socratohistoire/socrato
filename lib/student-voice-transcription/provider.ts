import type { VoiceTranscriptionRequest, VoiceTranscriptionResult } from "./types.ts";

export interface VoiceTranscriptionProvider {
  transcribe(request: VoiceTranscriptionRequest): Promise<VoiceTranscriptionResult>;
}
