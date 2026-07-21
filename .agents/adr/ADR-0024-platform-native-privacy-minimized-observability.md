# ADR-0024 — Platform-Native Privacy-Minimized Observability

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Decision Owners:** Platform, Security, Privacy, and Reliability  
> **Technical Specification References:** Sections 19, 21, 25, 26, 27, and Appendix H; `OD-022`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

The pilot needs operational visibility without exporting sensitive Student, tutoring, Voice, Summary, or safety content to another provider.

## Decision

Use only minimal platform-native telemetry for the pilot and integrate no external observability service. Redact at source. Permitted fields are error type and time, component, duration, job state, call volume, approximate consumption, and anonymous technical identifiers.

Prohibited fields include names, full codes, conversations, Student responses, audio, transcripts, Pedagogical Summaries, safety-alert information, keys, secrets, and protected Documents.

Any external provider requires a new approval covering region, retention, access, source redaction, cost, sampling, and exit strategy.

## Consequences

- Operational dashboards remain content-minimized.
- Tests must detect forbidden fields before logging.
- External telemetry is not authorized by this ADR.

## Resolution

This ADR resolves `OD-022`.
