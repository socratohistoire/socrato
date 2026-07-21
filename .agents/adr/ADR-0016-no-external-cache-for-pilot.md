# ADR-0016 — No External Cache for the Pilot

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Decision Owners:** Architecture, Security, Privacy, and Reliability  
> **Technical Specification References:** Sections 5, 17, 21, 26, 27, and Appendix H; `OD-028`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Pilot scale does not justify an additional cache service or its authorization, invalidation, privacy, cost, and operational boundaries.

## Decision

Use Next.js caching primitives and PostgreSQL only. Optimize queries before adding technology. Cache only approved non-sensitive content. Never place identity, Student Access Codes, Progress, Summaries, conversations, audio, or safety alerts in a public or shared cache.

Reconsider an external cache only when measured latency, database load, or concurrency demonstrates a need and a new security and privacy review approves the design.

## Consequences

- The pilot has no external cache provider or cache-specific personal-data boundary.
- Authorization remains authoritative at the application and database layers.
- Performance tests must measure whether the reconsideration trigger is reached.

## Resolution

This ADR resolves `OD-028`.
