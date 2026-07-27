import {
  LOCAL_VOICE_DEMO_TRANSCRIPT,
  VOICE_MAX_SECONDS,
  VOICE_WARNING_SECONDS,
  type VoiceCaptureState,
} from "./types.ts";

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/webm",
  "audio/ogg;codecs=opus",
] as const;

type RecorderLike = {
  state: string;
  start(): void;
  stop(): void;
  ondataavailable: ((event: BlobEvent) => void) | null;
  onstop: ((event: Event) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
};

type VoiceBrowserAdapter = {
  supported(): boolean;
  requestStream(): Promise<MediaStream>;
  chooseMimeType(): string | null;
  createRecorder(stream: MediaStream, mimeType: string): RecorderLike;
  now(): number;
  setInterval(callback: () => void, milliseconds: number): ReturnType<typeof setInterval>;
  clearInterval(timer: ReturnType<typeof setInterval>): void;
  setTimeout(callback: () => void, milliseconds: number): ReturnType<typeof setTimeout>;
  clearTimeout(timer: ReturnType<typeof setTimeout>): void;
};

export type VoiceCaptureCallbacks = {
  onState(state: VoiceCaptureState): void;
  onSimulatedTranscript(text: string): void;
};

function state(status: VoiceCaptureState["status"], elapsedSeconds = 0, message = ""): VoiceCaptureState {
  return {
    status,
    elapsedSeconds,
    remainingSeconds: Math.max(0, VOICE_MAX_SECONDS - elapsedSeconds),
    warningReached: elapsedSeconds >= VOICE_WARNING_SECONDS,
    message,
  };
}

export function negotiateVoiceMimeType(mediaRecorder: Pick<typeof MediaRecorder, "isTypeSupported">): string | null {
  return MIME_CANDIDATES.find((mimeType) => mediaRecorder.isTypeSupported(mimeType)) ?? null;
}

export function createBrowserVoiceAdapter(): VoiceBrowserAdapter {
  return {
    supported: () => typeof navigator !== "undefined"
      && Boolean(navigator.mediaDevices?.getUserMedia)
      && typeof MediaRecorder !== "undefined",
    requestStream: () => navigator.mediaDevices.getUserMedia({ audio: true }),
    chooseMimeType: () => typeof MediaRecorder === "undefined" ? null : negotiateVoiceMimeType(MediaRecorder),
    createRecorder: (stream, mimeType) => new MediaRecorder(stream, { mimeType }),
    now: () => Date.now(),
    setInterval: (callback, milliseconds) => globalThis.setInterval(callback, milliseconds),
    clearInterval: (timer) => globalThis.clearInterval(timer),
    setTimeout: (callback, milliseconds) => globalThis.setTimeout(callback, milliseconds),
    clearTimeout: (timer) => globalThis.clearTimeout(timer),
  };
}

export function isLocalVoicePrototypeEnabled(environment = process.env.NODE_ENV) {
  return environment !== "production";
}

export class LocalVoiceCaptureController {
  private recorder: RecorderLike | null = null;
  private stream: MediaStream | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private processingTimer: ReturnType<typeof setTimeout> | null = null;
  private startedAt = 0;
  private cancelled = false;
  private active = false;

  constructor(
    private readonly adapter: VoiceBrowserAdapter,
    private readonly callbacks: VoiceCaptureCallbacks,
    private readonly enabled = isLocalVoicePrototypeEnabled(),
  ) {}

  get isActive() { return this.active; }

  async start() {
    if (!this.enabled) {
      this.callbacks.onState(state("unsupported", 0, "La dictée est désactivée dans cet environnement."));
      return;
    }
    if (this.active) return;
    if (!this.adapter.supported()) {
      this.callbacks.onState(state("unsupported", 0, "La dictée n’est pas prise en charge par ce navigateur."));
      return;
    }
    const mimeType = this.adapter.chooseMimeType();
    if (!mimeType) {
      this.callbacks.onState(state("unsupported", 0, "Aucun format audio compatible n’est disponible."));
      return;
    }
    this.active = true;
    this.cancelled = false;
    this.callbacks.onState(state("requesting_permission", 0, "Autorisation du microphone…"));
    try {
      const stream = await this.adapter.requestStream();
      if (this.cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        this.active = false;
        return;
      }
      this.stream = stream;
      this.recorder = this.adapter.createRecorder(stream, mimeType);
      this.recorder.ondataavailable = () => { /* Audio deliberately discarded in the local prototype. */ };
      this.recorder.onerror = () => this.fail();
      this.recorder.onstop = () => this.finishStop();
      this.startedAt = this.adapter.now();
      this.recorder.start();
      this.callbacks.onState(state("recording", 0, "Écoute en cours — simulation locale."));
      this.timer = this.adapter.setInterval(() => this.tick(), 250);
    } catch (error) {
      this.cleanup();
      const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError");
      this.callbacks.onState(state(denied ? "permission_denied" : "error", 0, denied
        ? "L’autorisation du microphone a été refusée."
        : "Le microphone n’est pas disponible."));
    }
  }

  stop() {
    if (!this.active || !this.recorder) return;
    this.callbacks.onState(state("stopping", this.elapsed(), "Arrêt de la dictée…"));
    this.stopRecorderAndTracks();
  }

  cancel() {
    if (!this.active) return;
    this.cancelled = true;
    this.stopRecorderAndTracks();
    this.cleanup();
    this.callbacks.onState(state("idle", 0, "Dictée annulée."));
  }

  dispose() {
    this.cancelled = true;
    this.stopRecorderAndTracks();
    this.cleanup();
  }

  private elapsed() {
    return Math.min(VOICE_MAX_SECONDS, Math.floor((this.adapter.now() - this.startedAt) / 1000));
  }

  private tick() {
    const elapsed = this.elapsed();
    if (elapsed >= VOICE_MAX_SECONDS) {
      this.callbacks.onState(state("duration_limit_reached", elapsed, "Durée maximale atteinte."));
      this.stopRecorderAndTracks();
      return;
    }
    this.callbacks.onState(state("recording", elapsed, elapsed >= VOICE_WARNING_SECONDS
      ? "La limite approche. La dictée s’arrêtera automatiquement."
      : "Écoute en cours — simulation locale."));
  }

  private stopRecorderAndTracks() {
    if (this.timer) this.adapter.clearInterval(this.timer);
    this.timer = null;
    if (this.recorder?.state !== "inactive") this.recorder?.stop();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  private finishStop() {
    if (this.cancelled) return;
    this.cleanup();
    this.callbacks.onState(state("transcribing", 0, "Traitement de la dictée…"));
    this.processingTimer = this.adapter.setTimeout(() => {
      this.processingTimer = null;
      if (this.cancelled) return;
      this.callbacks.onSimulatedTranscript(LOCAL_VOICE_DEMO_TRANSCRIPT);
      this.callbacks.onState(state("success", 0, "Enregistrement arrêté. Texte de simulation ajouté; vérifie-le avant de l’envoyer."));
    }, 300);
  }

  private fail() {
    this.stopRecorderAndTracks();
    this.cleanup();
    this.callbacks.onState(state("error", 0, "La dictée a échoué. Tu peux réessayer ou écrire ta réponse."));
  }

  private cleanup(resetRecorder = true) {
    if (this.timer) this.adapter.clearInterval(this.timer);
    this.timer = null;
    if (this.processingTimer) this.adapter.clearTimeout(this.processingTimer);
    this.processingTimer = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    if (resetRecorder) this.recorder = null;
    this.active = false;
  }
}
