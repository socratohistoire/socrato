# ADR-0008 — AI Provider Boundary and Application-Owned Adapter

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Decision Owners:** AI, Architecture, Pedagogy, Privacy, and Cost  
> **Technical Specification References:** Sections 5, 12, 13, 15, 18, 21, 22, 23, 24, and 26; `AI-001` through `AI-054`; `OD-010`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Socrato requires AI for guided tutoring, Practice generation, question revision, structured pedagogical summaries, Learning Evidence candidates, and narrowly scoped safety assessment. These operations have different quality, latency, cost, privacy, and failure requirements.

The application must not depend directly on provider response objects or allow browsers to select models. Model names, prompts, routing, budgets, structured schemas, and fallbacks require a versioned server-owned registry.

## Decision Drivers

- strong French-language pedagogical quality;
- Socratic guidance rather than direct answer delivery;
- predictable structured outputs for retained data;
- low interactive latency;
- bounded cost for approximately 250 registered Student scenarios;
- no Student names or Access Codes in provider payloads;
- temporary application-owned conversation state;
- provider replacement and model migration without domain-schema rewrites;
- safety behavior independent from one model verdict;
- measurable evaluation before model changes.

## Current Official Model Baseline

As of 2026-07-20, the approved OpenAI family is:

| Model | Intended Socrato role |
|---|---|
| `gpt-5.6-terra` | Primary balanced-quality pedagogical model |
| `gpt-5.6-luna` | Cost-sensitive structured and high-volume operations |
| `gpt-5.6-sol` | Exceptional complex review and controlled fallback |
| `omni-moderation-latest` | First-pass text safety classification |

Model identifiers MUST be stored in configuration, not scattered through domain code. A model becoming available in the provider account does not make it approved for Socrato.

Voice is outside this OpenAI model baseline. Azure AI Speech is the selected transcription provider under amended `ADR-0022`; its production activation gates remain closed.

## Decision

### Provider Adapter

All OpenAI calls MUST pass through a server-only Socrato adapter exposing application-owned operations rather than generic provider calls.

The adapter MUST own:

- operation authorization;
- model and reasoning selection;
- identity-minimized payload construction;
- prompt and schema version selection;
- timeout, retry, idempotency, and fallback policy;
- structured-output validation;
- usage and cost attribution;
- provider error translation;
- privacy-safe observability;
- provider-specific request and response mapping.

Browsers MUST NOT receive an OpenAI API key, choose a model, supply system instructions, call provider tools, or forward arbitrary provider parameters.

### API Surface

New text and reasoning operations MUST use the OpenAI Responses API through the maintained official SDK. Requests MUST set `store: false` unless a future privacy review and ADR explicitly approve provider-managed state.

Socrato MUST NOT use provider conversation threads as the authoritative Learning Session. Temporary conversational context remains application-owned and is deleted according to the approved retention workflow.

Provider response identifiers MAY be retained only temporarily for idempotency, support, or encrypted reasoning continuity when explicitly required; they MUST NOT become Student or Learning Session identifiers.

### Initial Routing Registry

| Operation | Primary model | Reasoning | Maximum visible output | Controlled fallback |
|---|---|---|---:|---|
| `tutor_turn` | `gpt-5.6-terra` | `low` | 600 tokens | `gpt-5.6-sol` at `low`, once, when budget and health permit |
| `practice_generate` | `gpt-5.6-terra` | `medium` | 4,000 tokens | Queue for retry; `gpt-5.6-sol` only for approved complex generation |
| `question_revise` | `gpt-5.6-terra` | `low` | 2,000 tokens | Queue or controlled `gpt-5.6-sol` retry |
| `pedagogical_summary` | `gpt-5.6-luna` | `low` | 1,200 tokens | `gpt-5.6-terra` at `low` |
| `learning_evidence_candidates` | `gpt-5.6-luna` | `low` | 1,200 tokens | `gpt-5.6-terra` at `low` |
| `content_metadata_extract` | `gpt-5.6-luna` | `none` or `low` | 1,500 tokens | `gpt-5.6-terra` at `low` |
| `safety_candidate_assess` | `gpt-5.6-terra` | `low` | 500 tokens | No weaker-model fallback |
| `complex_content_review` | `gpt-5.6-sol` | `medium` | 3,000 tokens | Manual review or deferred retry |

Token limits are ceilings, not output targets. Prompts MUST request the shortest response that satisfies the educational and schema requirements.

The initial routing registry is version `ai_route_2026_07_20_v1`.

### Tutoring Route

`tutor_turn` MUST prioritize low latency and pedagogical quality. It MUST stream approved text when the interface benefits, but no streamed content may update Progress Records before the complete structured result passes validation.

The tutoring payload MUST include only:

- approved system and pedagogical instructions;
- anonymous session-scoped context;
- current Practice, Question, curriculum target, and approved Historical Documents;
- the minimum temporary exchanges needed for continuity;
- approved page references and content rights metadata where relevant.

It MUST exclude real names, Access Codes, Teacher email, full roster, unrelated history, hidden answer keys not required by the operation, infrastructure data, and arbitrary browser instructions.

The model MUST NOT have web search, file search, code execution, computer use, or arbitrary function tools in Student tutoring. Required content is assembled by Socrato from approved sources.

### Practice Generation and Revision

Practice generation is a Teacher-authorized or administrative operation. It MUST use strict Structured Outputs and remain a Draft until Teacher validation.

Generation MAY use asynchronous or Batch execution when latency is not interactive and the privacy boundary permits it. Generated questions, answers, citations, page references, and Historical Document associations MUST pass deterministic validation and Teacher review before publication.

`gpt-5.6-sol` MUST NOT be invoked automatically for every Practice. It is reserved for explicitly approved complex review, failed evaluation cases, or a bounded fallback authorized by cost policy.

### Summaries and Learning Evidence

Pedagogical Summary and Learning Evidence operations use strict JSON Schema outputs. AI produces candidate structured observations; deterministic Socrato rules validate eligibility, allowed target identifiers, evidence sufficiency, field lengths, and progress transitions.

An AI output alone MUST NOT mark a Notion or Intellectual Operation mastered. The deterministic progress engine remains authoritative.

If Summary generation fails, raw conversation deletion follows the approved finalization and maximum-retention policy rather than retaining conversation indefinitely.

### Safety Routing

Every eligible Student message MUST pass through the approved first-pass safety boundary using `omni-moderation-latest` and applicable Socrato deterministic rules.

A moderation result is a signal, not a Teacher alert. Only messages crossing the approved candidate threshold proceed to `safety_candidate_assess` with the minimum context required. The application-owned high-severity policy then decides whether the single exceptional Emergency Alert level is met.

No model may directly notify a Teacher, create an Emergency Alert, choose recipients, or retain a conversation. Routine conversations MUST NOT produce alerts.

If both the moderation boundary and safety assessment route are unavailable when assessment is required, Socrato MUST fail safely: do not represent the message as assessed, do not continue with an unsafe ordinary response, and enter the controlled retry or supportive fallback state defined by the safety specification.

### Voice Route

Azure AI Speech is selected behind the application-owned transcription adapter by amended `ADR-0022`, which resolves `OD-024`. Voice transcription remains disabled for production until every `ADR-0022` activation gate is verified. This ADR does not authorize audio collection, upload, storage, or production transcription.

The text tutoring models in this registry do not receive raw audio.

### Structured Outputs

Every operation affecting retained state MUST use strict Structured Outputs with an application-owned JSON Schema. Function or tool schemas MUST use strict mode where supported.

The adapter MUST reject:

- malformed JSON;
- unknown properties where prohibited;
- invalid identifiers or enums;
- excessive field lengths;
- missing required evidence;
- citations outside the approved content set;
- prompt or policy leakage;
- unsafe or identity-bearing output.

Schema-valid output remains untrusted until domain validation succeeds.

### Prompt Registry

Every operation MUST reference:

- stable operation name;
- prompt-template version;
- output-schema version;
- routing-registry version;
- curriculum or policy version where applicable.

Prompts MUST be server-owned, reviewable, testable, and absent from browser-editable parameters. Production prompt changes require evaluation and traceable approval.

### Retry and Fallback

Retries MUST be bounded and based on classified failure type.

- Network or retryable provider failure: at most one same-model retry with bounded jitter when the operation is idempotent.
- Invalid structured output: at most one repair retry when safe and within budget.
- Content-policy refusal: do not retry with weaker safety instructions.
- Ambiguous mutation outcome: reconcile using idempotency metadata before retry.
- Budget or usage limit: do not bypass the limit through fallback.
- Model unavailable: use only the operation's registered fallback.

Fallback output MUST pass the same or stricter validation. The application MUST expose a controlled user recovery state rather than silently degrading to an unapproved model.

### Cost Controls

Every request MUST have:

- an authorized operation type;
- bounded input context;
- maximum output tokens;
- approved reasoning level;
- Teacher, Group, Practice, and anonymous Student usage attribution where permitted;
- per-operation and aggregate budget checks;
- recorded model and token usage without content logging.

Prompt caching MAY be used only for non-personal, rights-approved, stable instructions and curriculum context. Student responses, names, Access Codes, temporary conversations, safety context, and protected roster data MUST NOT be intentionally placed in a reusable shared prompt cache.

The pilot enrolls approximately 250 Students, with nominal capacity of 65 simultaneous Students, load validation at 100 simultaneous users, and a peak test at 130 simultaneous users. The monthly pilot budget target is US$150, with a warning at US$100, an important alert at US$130, and a hard ceiling at US$175. At the ceiling, non-essential AI functions MUST be suspended while activities using already available approved Questions remain available. Safety, finalization, and deletion MUST NOT be blocked. The budget MUST be reassessed after the first month using actual utilization; the approved product limits remain unchanged.

### Model Change Policy

A model or snapshot change requires:

1. official availability and capability verification;
2. privacy and data-control review;
3. price and rate-limit update;
4. French-language pedagogical evaluation;
5. safety and refusal evaluation;
6. structured-schema conformance testing;
7. latency and cost comparison;
8. staged rollout and rollback configuration;
9. routing-registry version change;
10. approval evidence.

A like-for-like model update within this architecture MAY be approved through the registry without superseding this ADR. A change to provider boundary, retained provider state, direct browser access, authoritative AI progress decisions, or safety authority requires a new ADR.

### Evaluation Gates

The production evaluation set MUST include Québec French examples covering:

- factual accuracy for the 1840–1896 pilot;
- all approved Intellectual Operations;
- Socratic guidance without direct answer disclosure;
- vocabulary clarification;
- use of Historical Documents and citations;
- page-reference behavior;
- misconceptions and partial answers;
- off-topic redirection;
- prompt injection attempts;
- personal-information attempts;
- high-severity and routine safety cases;
- summary and Learning Evidence schema accuracy.

Baseline acceptance thresholds are finalized with the testing and pedagogical decisions. No model is production-approved solely because it performs well in a general benchmark.

### Privacy and Provider Data Controls

All payloads MUST be minimized and sent through the approved server account and project. Provider data-use, retention, residency, abuse-monitoring, subprocessors, and contractual controls MUST be reviewed before production.

`store: false` prevents Socrato from opting into provider-managed response state; it does not replace contractual privacy review or Socrato's own deletion duties.

API keys MUST remain server-only, environment-specific, least-privilege where supported, rotated, and excluded from source control and logs.

### Observability

Privacy-safe telemetry MAY record:

- operation type and version;
- model identifier;
- latency;
- input, cached-input, reasoning, and output token totals where returned;
- estimated cost;
- provider request identifier where approved;
- retry and fallback category;
- schema-validation result;
- generalized error code.

Telemetry MUST NOT record complete prompts, Student responses, conversations, names, Access Codes, safety content, raw audio, or unrestricted Historical Document content.

## Consequences

### Positive

- Terra provides the quality/cost balance for core pedagogy;
- Luna reduces recurring summary and extraction cost;
- Sol is reserved for cases that justify frontier cost;
- provider objects and model names remain outside domain contracts;
- structured validation protects retained data;
- model migration is measurable and reversible.

### Negative

- routing and evaluation infrastructure adds implementation work;
- three text models create more configuration and test combinations;
- fallback may increase cost during incidents;
- current model identifiers and prices require ongoing maintenance;
- `store: false` requires Socrato to manage temporary context explicitly.

## Validation

Tests and operational evidence MUST prove that:

1. browsers cannot call OpenAI or choose models;
2. every operation resolves through the versioned registry;
3. Requests API calls set `store: false`;
4. real names, Access Codes, and unrelated identity data are absent from final serialized payloads;
5. retained-state operations reject invalid or unknown structured fields;
6. AI output cannot directly establish mastery or send an Emergency Alert;
7. routine conversation cases create no alert;
8. retry and fallback counts remain bounded and budget-aware;
9. unavailable or refused operations produce safe application states;
10. per-operation token ceilings are enforced;
11. telemetry excludes prompts and Student content;
12. model-registry rollback can restore the previous approved route;
13. the French pedagogical and safety evaluation suite passes before rollout;
14. transcription remains disabled until its separate decision is accepted.

## Reconsideration Triggers

Revisit this decision before adopting another AI provider, enabling provider-managed conversation state, enabling web or file search in Student tutoring, allowing direct browser AI calls, using raw audio with text models, making AI decisions authoritative for Progress or safety, or materially changing the model-family and fallback architecture.

## References

- OpenAI Models and GPT-5.6 model documentation
- OpenAI Responses API migration guidance
- OpenAI Structured Outputs and strict function-calling guidance
- OpenAI Moderation and transcription model documentation

## Resolution

This ADR resolves `OD-010`. Production activation still requires API account configuration, privacy review, cost simulation, rate-limit verification, and successful Socrato evaluation results.
