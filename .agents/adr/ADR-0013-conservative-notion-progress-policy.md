# ADR-0013 — Conservative Notion Progress Policy

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Decision Owners:** Pedagogy, Product, and Data  
> **Technical Specification References:** Sections 4, 6, 13, 14, 17, 21, 22, and Appendix H; `OD-015`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Progress must remain formative, explainable, deterministic, and isolated by Notion. Weak, isolated, or heavily guided evidence must not overstate mastery or modify unrelated targets.

## Decision

Use the versioned states `not_assessed`, `needs_work`, `consolidate`, and `mastered`. `mastered` requires multiple recent and consistent successes on at least two distinct Questions with little or no support. A single correct answer or heavily guided evidence cannot establish mastery. An isolated error does not automatically lower status; multiple recent contradictions trigger reassessment.

Update only the Historical Knowledge and Intellectual Operations actually exercised. Progress for every other Notion remains unchanged, and the visible notebook follows the actively selected Notion.

## Consequences

- Every transition is reproducible from structured evidence and the policy version.
- Guided evidence carries lower weight.
- Recalculation and migration require explicit policy-version handling.
- Tests must prove target isolation, conservative mastery, contradiction handling, and deterministic replay.

## Resolution

This ADR resolves `OD-015`.
