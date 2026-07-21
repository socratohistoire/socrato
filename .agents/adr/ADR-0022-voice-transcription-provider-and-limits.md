# ADR-0022 — Voice Transcription Provider and Limits

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Decision Owners:** AI, Privacy, Security, Accessibility, and Product  
> **Technical Specification References:** Sections 6, 7, 12, 13, 17, 21, 23, 26, and Appendix H; `OD-024`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Voice is optional input. It must not create durable audio, background capture, an inaccessible keyboard dependency, or an unapproved provider data boundary.

## Decision

Select `gpt-4o-mini-transcribe` initially, subject to contractual, regional, privacy, and evaluation approval. Limit each recording to 120 seconds, warn at 105 seconds, stop automatically at 120 seconds, and limit cumulative recording to 15 minutes per session. Configure Québec French context and allow only one active recording.

Show an editable transcription before submission. Delete audio immediately after transcription, never include audio in backups, and handle the transcription as temporary text. Always provide keyboard fallback. Never record in the background.

## Activation Gates

Voice remains disabled until provider terms, region, retention behavior, access controls, failure handling, deletion evidence, accessibility, and evaluation results are verified.

## Resolution

This ADR resolves `OD-024`; it does not by itself activate Voice.
