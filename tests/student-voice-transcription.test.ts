import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  AZURE_SPEECH_MODE,
  AZURE_SPEECH_PROVIDER,
  AzureSpeechTranscriptionProvider,
  LOCAL_VOICE_DEMO_TRANSCRIPT,
  LocalVoiceCaptureController,
  VOICE_AZURE_REGION,
  VOICE_LOCALE,
  VOICE_MAX_SECONDS,
  VOICE_WARNING_SECONDS,
  VoiceTranscriptionError,
  appendVoiceTranscript,
  isLocalVoicePrototypeEnabled,
  negotiateVoiceMimeType,
} from "../lib/student-voice-transcription/index.ts";
import type { VoiceCaptureState, VoiceTranscriptionProvider } from "../lib/student-voice-transcription/index.ts";

function harness(options: { supported?: boolean; permissionError?: Error } = {}) {
  const states: VoiceCaptureState[] = [];
  const transcripts: string[] = [];
  const stoppedTracks: number[] = [];
  let requestCount = 0;
  let now = 0;
  let tick: (() => void) | null = null;
  let finishProcessing: (() => void) | null = null;
  const recorder = {
    state: "inactive",
    ondataavailable: null as ((event: BlobEvent) => void) | null,
    onstop: null as ((event: Event) => void) | null,
    onerror: null as ((event: ErrorEvent) => void) | null,
    start() { this.state = "recording"; },
    stop() { this.state = "inactive"; this.onstop?.(new Event("stop")); },
  };
  const stream = { getTracks: () => [{ stop: () => stoppedTracks.push(1) }] } as unknown as MediaStream;
  const adapter = {
    supported: () => options.supported ?? true,
    requestStream: async () => { requestCount += 1; if (options.permissionError) throw options.permissionError; return stream; },
    chooseMimeType: () => "audio/webm;codecs=opus",
    createRecorder: () => recorder,
    now: () => now,
    setInterval: (callback: () => void) => { tick = callback; return 1 as unknown as ReturnType<typeof setInterval>; },
    clearInterval: () => { tick = null; },
    setTimeout: (callback: () => void) => { finishProcessing = callback; return 2 as unknown as ReturnType<typeof setTimeout>; },
    clearTimeout: () => { finishProcessing = null; },
  };
  const controller = new LocalVoiceCaptureController(adapter, {
    onState: (value) => states.push(value),
    onSimulatedTranscript: (text) => transcripts.push(text),
  }, true);
  return {
    controller, adapter, states, transcripts, stoppedTracks,
    requestCount: () => requestCount,
    advance(seconds: number) { now = seconds * 1000; tick?.(); },
    completeProcessing() { const callback = finishProcessing; finishProcessing = null; callback?.(); },
    failRecorder() { recorder.onerror?.(new Event("error") as ErrorEvent); },
  };
}

test("déclare Azure derrière un fournisseur interchangeable sans intégration réseau", async () => {
  const provider: VoiceTranscriptionProvider = new AzureSpeechTranscriptionProvider();
  assert.equal(AZURE_SPEECH_PROVIDER, "azure-ai-speech");
  assert.equal(AZURE_SPEECH_MODE, "real-time");
  assert.equal(VOICE_LOCALE, "fr-CA");
  assert.equal(VOICE_AZURE_REGION, "canadacentral");
  await assert.rejects(() => provider.transcribe({ audio: new Uint8Array(), mimeType: "audio/webm", locale: VOICE_LOCALE }), VoiceTranscriptionError);
  const source = readFileSync("lib/student-voice-transcription/azure-provider.ts", "utf8");
  assert.doesNotMatch(source, /fetch\(|https?:|SpeechSDK|AZURE_.*KEY|subscriptionKey/);
});

test("documente les limites Azure sans prétendre vérifier la conformité du fournisseur", () => {
  const adr = readFileSync(".agents/adr/ADR-0022-voice-transcription-provider-and-limits.md", "utf8");
  const providerBoundaryAdr = readFileSync(".agents/adr/ADR-0008-ai-provider-boundary-and-application-owned-adapter.md", "utf8");
  assert.match(adr, /Batch transcription MUST NOT be used/);
  assert.match(adr, /audio and transcription logging[\s\S]*MUST be disabled/);
  assert.match(adr, /recorded evidence[\s\S]*logging is disabled/);
  assert.match(adr, /credentials, authorization material, and resource secrets MUST remain server-side/);
  assert.match(adr, /Treat the resulting text exactly like keyboard input/);
  assert.match(adr, /After the personalized summary is produced successfully, delete that conversation/);
  assert.match(adr, /not a claim of legal compliance for minors/);
  assert.match(providerBoundaryAdr, /Azure AI Speech is selected/);
  assert.doesNotMatch(`${adr}\n${providerBoundaryAdr}`, /gpt-4o-mini-transcribe/);
});

test("négocie prudemment le premier format réellement pris en charge", () => {
  const checked: string[] = [];
  const selected = negotiateVoiceMimeType({ isTypeSupported: (type) => { checked.push(type); return type === "audio/mp4"; } });
  assert.equal(selected, "audio/mp4");
  assert.deepEqual(checked, ["audio/webm;codecs=opus", "audio/mp4"]);
});

test("signale un navigateur incompatible sans demander le microphone", async () => {
  const local = harness({ supported: false });
  await local.controller.start();
  assert.equal(local.states.at(-1)?.status, "unsupported");
  assert.equal(local.requestCount(), 0);
});

test("demande la permission au clic puis démarre un seul enregistrement", async () => {
  const local = harness();
  await local.controller.start();
  await local.controller.start();
  assert.equal(local.requestCount(), 1);
  assert.deepEqual(local.states.slice(0, 2).map(({ status }) => status), ["requesting_permission", "recording"]);
  assert.equal(local.controller.isActive, true);
});

test("gère le refus de permission avec une erreur sobre", async () => {
  const local = harness({ permissionError: new DOMException("private detail", "NotAllowedError") });
  await local.controller.start();
  assert.equal(local.states.at(-1)?.status, "permission_denied");
  assert.doesNotMatch(local.states.at(-1)?.message ?? "", /private detail/);
});

test("arrête, libère les pistes et produit seulement le texte simulé modifiable", async () => {
  const local = harness();
  await local.controller.start();
  local.controller.stop();
  assert.ok(local.stoppedTracks.length >= 1);
  assert.deepEqual(local.states.slice(-2).map(({ status }) => status), ["stopping", "transcribing"]);
  assert.deepEqual(local.transcripts, []);
  local.completeProcessing();
  assert.equal(local.states.at(-1)?.status, "success");
  assert.deepEqual(local.transcripts, [LOCAL_VOICE_DEMO_TRANSCRIPT]);
});

test("annule sans transcription et libère toutes les pistes", async () => {
  const local = harness();
  await local.controller.start();
  local.controller.cancel();
  assert.equal(local.states.at(-1)?.status, "idle");
  assert.deepEqual(local.transcripts, []);
  assert.ok(local.stoppedTracks.length >= 1);
});

test("une erreur d’enregistrement libère les pistes et ne produit aucun texte", async () => {
  const local = harness();
  await local.controller.start();
  local.failRecorder();
  assert.equal(local.states.at(-1)?.status, "error");
  assert.equal(local.controller.isActive, false);
  assert.ok(local.stoppedTracks.length >= 1);
  assert.deepEqual(local.transcripts, []);
});

test("avertit à 105 secondes et s’arrête automatiquement à 120 secondes", async () => {
  const local = harness();
  await local.controller.start();
  local.advance(VOICE_WARNING_SECONDS);
  assert.equal(local.states.at(-1)?.warningReached, true);
  local.advance(VOICE_MAX_SECONDS);
  assert.ok(local.states.some(({ status }) => status === "duration_limit_reached"));
  assert.equal(local.controller.isActive, false);
  assert.ok(local.stoppedTracks.length >= 1);
});

test("le démontage arrête les pistes sans produire de transcription", async () => {
  const local = harness();
  await local.controller.start();
  local.controller.dispose();
  assert.ok(local.stoppedTracks.length >= 1);
  assert.deepEqual(local.transcripts, []);
});

test("le prototype échoue fermé en production", async () => {
  assert.equal(isLocalVoicePrototypeEnabled("production"), false);
  const local = harness();
  const controller = new LocalVoiceCaptureController(local.adapter, {
    onState: (value) => local.states.push(value), onSimulatedTranscript: (text) => local.transcripts.push(text),
  }, false);
  await controller.start();
  assert.equal(local.states.at(-1)?.status, "unsupported");
  assert.equal(local.requestCount(), 0);
});

test("la Page 3 insère la simulation sans soumission automatique et conserve le clavier", () => {
  const view = readFileSync("app/eleve/activite/[activityId]/session-view.tsx", "utf8");
  assert.match(view, /setResponse\(\(current\) => appendVoiceTranscript\(current, text\)\)/);
  assert.match(view, /Dictée prête/);
  assert.match(view, /onKeyDown=\{handleResponseKeyDown\}/);
  assert.match(view, /requestAnimationFrame\(\(\) => responseInputRef\.current\?\.focus\(\)\)/);
  const voiceCallback = view.match(/onSimulatedTranscript:[\s\S]*?requestAnimationFrame\(\(\) => responseInputRef\.current\?\.focus\(\)\);\n      \}/)?.[0] ?? "";
  assert.doesNotMatch(voiceCallback, /sendLocalResponse|submitStudentResponse/);
});

test("rend immédiatement un état recording explicite, chronométré et accessible", () => {
  const view = readFileSync("app/eleve/activite/[activityId]/session-view.tsx", "utf8");
  const css = readFileSync("app/eleve/activite/[activityId]/session.css", "utf8");
  assert.match(view, /voiceState\.status === "recording" \? \([\s\S]*voice-stop-button/);
  assert.match(view, /<span>Arrêter<\/span>/);
  assert.match(view, /className="voice-stop-icon"[\s\S]*<rect/);
  assert.match(view, /Enregistrement en cours/);
  assert.match(view, /formatRecordingDuration\(voiceState\.elapsedSeconds\)/);
  assert.match(view, /voiceState\.status === "stopping" \|\| voiceState\.status === "transcribing"/);
  assert.match(view, /className="voice-processing-state"/);
  assert.match(view, /aria-pressed="true"/);
  assert.match(view, /const sendUnavailable = !response\.trim\(\) \|\| responseUnavailable \|\| voiceBlocksSending/);
  assert.match(view, /aria-label="Envoyer ma réponse" title="Envoyer ma réponse"/);
  assert.match(view, /id="voice-status"[\s\S]*aria-live="polite"/);
  assert.match(view, /permission_denied" \|\| voiceState\.status === "error" \? "Réessayer"/);
  assert.match(css, /\.voice-stop-button \{[^}]*background:#b32636/);
  assert.match(css, /\.voice-recording-dot \{[^}]*animation:voice-recording-pulse/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(view.match(/voiceState\.status === "recording" \? \([\s\S]*?\) : \(/)?.[0] ?? "", /Dicter ma réponse/);
});

test("ajoute la transcription sans écraser un champ vide ou existant", () => {
  assert.equal(appendVoiceTranscript("", "Texte dicté"), "Texte dicté");
  assert.equal(appendVoiceTranscript("Début existant", "Texte dicté"), "Début existant\nTexte dicté");
  assert.equal(appendVoiceTranscript("Début existant\n", "Texte dicté"), "Début existant\nTexte dicté");
});

test("aucune donnée vocale ne rejoint URL, journaux, bilan ou moteur pédagogique", () => {
  const sources = [
    "lib/student-voice-transcription/browser-controller.ts",
    "lib/student-voice-transcription/azure-provider.ts",
    "lib/pedagogical-session-engine/types.ts",
    "lib/pedagogical-session-engine/summary.ts",
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  assert.doesNotMatch(sources, /console\.|localStorage|sessionStorage|URL\.createObjectURL|URLSearchParams|audioUrl|audioPath|studentId/);
  assert.doesNotMatch(readFileSync("lib/pedagogical-session-engine/types.ts", "utf8"), /audio|transcript/i);
});
