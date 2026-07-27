# ADR-0022 — Voice Transcription Provider and Limits

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Amended:** 2026-07-26 — Azure AI Speech provider selection
> **Decision Owners:** AI, Privacy, Security, Accessibility, and Product  
> **Technical Specification References:** Sections 6, 7, 12, 13, 17, 21, 23, 26, and Appendix H; `OD-024`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Voice is optional input. It must not create durable audio, background capture, an inaccessible keyboard dependency, or an unapproved provider data boundary.

## Decision

Select **Azure AI Speech — Speech to Text** in real-time mode, configured for locale `fr-CA` and the **Canada Central** region, subject to contractual, regional, privacy, security, accessibility, and evaluation approval. Batch transcription MUST NOT be used for the Student conversation. Azure remains behind the application-owned `VoiceTranscriptionProvider` port so the provider can be replaced without changing the Student interface.

This selection prioritizes real-time processing without voluntary audio retention, Canadian French support, institutional acceptability, and a controlled regional target. It does not claim comparative quality: Azure MUST be reevaluated after a representative test of school-based Québec French. Azure audio and transcription logging and all optional speaker identification, voice personalization, biometric analysis, emotion analysis, behavioral analysis, or model-training use MUST be disabled. Because the application cannot independently prove every provider-side setting, production deployment MUST include recorded evidence that logging is disabled for the selected resource, endpoint, subscription, and region; an unverified configuration MUST fail the Voice activation gate.

The boundary has three distinct stages: the browser captures audio locally after an explicit Student action; a future authenticated server adapter sends only the current recording to Azure for real-time transcription; and the pedagogical engine receives only text that the Student has reviewed and deliberately submitted. Azure credentials, authorization material, and resource secrets MUST remain server-side. Azure MUST receive no Student identifier and no pedagogical-session state beyond the minimum transcription configuration.

Limit each recording to 120 seconds, warn at 105 seconds, stop automatically at 120 seconds, and limit cumulative recording to 15 minutes per session. Allow only one active recording.

Show an editable transcription before submission. Audio exists only during capture and real-time transcription: Socrato MUST NOT save an audio file, include audio in backups, or place audio or full transcription text in technical logs. Treat the resulting text exactly like keyboard input and retain it only in the temporary conversation. After the personalized summary is produced successfully, delete that conversation and its transcribed text; retain only the approved pedagogical summary and structured progress data. Always provide keyboard fallback. Never record in the background, activate the microphone automatically, or continue listening after the Student stops it. Every use requires a new explicit Student action. No transcription may automatically submit a Student response.

These controls are technical safeguards, not a claim of legal compliance for minors. Institutional authorization, any applicable consent, school-board or establishment rules, provider agreements, privacy assessment, and the final residency and protection requirements remain separate activation obligations.

## Activation Gates

Voice remains disabled in production until Azure terms, Canada Central availability and routing, retention behavior, access controls, failure handling, deletion evidence, recorded proof that audio and transcription logging and optional features are disabled, institutional and consent requirements, accessibility, and representative `fr-CA` evaluation results are verified.

## Resolution

This amended ADR resolves the provider choice in `OD-024`; it does not by itself activate Voice. A development-only local capture simulation may exercise the interface without network transmission, but MUST fail closed in production and MUST never be described as an Azure transcription.
