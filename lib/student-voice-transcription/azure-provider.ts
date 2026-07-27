import type { VoiceTranscriptionProvider } from "./provider.ts";
import { VoiceTranscriptionError, type VoiceTranscriptionRequest } from "./types.ts";

export const AZURE_SPEECH_PROVIDER = "azure-ai-speech" as const;
export const AZURE_SPEECH_MODE = "real-time" as const;

/**
 * Server-only future adapter. No SDK, credential, endpoint or network behavior is
 * introduced until ADR-0022 activation evidence and the server contract exist.
 */
export class AzureSpeechTranscriptionProvider implements VoiceTranscriptionProvider {
  async transcribe(_request: VoiceTranscriptionRequest): Promise<never> {
    void _request;
    throw new VoiceTranscriptionError("not_configured");
  }
}
