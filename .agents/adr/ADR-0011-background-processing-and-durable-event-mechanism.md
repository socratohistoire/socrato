# ADR-0011 — Background Processing and Durable Event Mechanism

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Decision Owners:** Platform and Reliability  
> **Technical Specification References:** Sections 5, 13, 15, 17, 18, 19, 21, 23, 25, 26, 27, and 29; `JOB-001` through `JOB-034`; `OD-006`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Socrato requires durable asynchronous execution for Practice generation, session finalization, Pedagogical Summaries, conversation deletion, Progress recalculation, reports, file processing, safety notification delivery, usage aggregation, and reconciliation.

The initial scale is approximately 250 registered Students, with 65 simultaneous Students at nominal capacity, load validation at 100 simultaneous users, and a peak test at 130 simultaneous users. The platform already depends on Supabase PostgreSQL and Vercel. Introducing Redis, Kafka, or a separate workflow platform before measured need would increase cost and operational complexity. Relying on untracked serverless promises or a cron invocation alone would not provide durability.

## Decision Drivers

- atomic creation with domain changes;
- at-least-once execution with idempotency;
- recovery after worker crash or deployment;
- priority isolation for safety and privacy work;
- minute-level scheduled execution;
- serverless compatibility;
- no raw conversation or Student identity content in queue payloads;
- local testability and provider portability;
- low initial infrastructure cost.

## Considered Options

1. **In-memory or fire-and-forget work — rejected.** It is lost on process termination and is not observable.
2. **Vercel Cron without durable job records — rejected.** Scheduling a request is not proof that the business operation completed.
3. **External managed queue or workflow service — deferred.** It may become appropriate after measured scale or workflow-complexity triggers.
4. **Supabase `pgmq` as the authoritative queue — not selected initially.** It is capable, but Socrato still requires domain job state, Outbox records, priorities, leases, and portability; a small application-owned schema provides one authoritative model.
5. **PostgreSQL job table plus transactional Outbox and bounded Vercel worker — accepted.**

## Decision

### Authoritative Components

The initial mechanism MUST use:

- `operations.jobs` as the durable job registry and execution queue;
- `operations.job_attempts` as sanitized attempt history where separate history is required;
- `operations.outbox_events` for events committed atomically with domain changes;
- a server-only application worker implemented in the Socrato codebase;
- Vercel Cron as the regular dispatcher trigger;
- an authenticated on-demand trigger for latency-sensitive work;
- scheduled reconciliation that recovers abandoned leases, unpublished Outbox Events, and missed work.

`pgmq`, Redis, and external workflow services are not required for the initial release.

### Delivery Semantics

The system provides at-least-once execution, not exactly-once delivery. Every handler and external side effect MUST be idempotent or protected by a durable idempotency key, unique constraint, or provider-supported idempotency mechanism.

A job's successful terminal state means that its registered business outcome is durably committed. It does not merely mean that a worker function returned without throwing.

### Transactional Creation

When a domain transaction requires asynchronous consequences, the same PostgreSQL transaction MUST persist:

1. the authoritative domain change;
2. the Outbox Event or directly registered Job;
3. the stable idempotency key and correlation identifier.

The transaction MUST NOT perform an external HTTP or AI call. Outbox publication is itself repeatable and reconciled.

### Job Record

Every job MUST include or resolve to:

- immutable job ID;
- stable registered job type;
- payload schema version;
- minimal reference-only payload;
- priority class;
- lifecycle state;
- idempotency key;
- attempt and maximum-attempt counts;
- `available_at`;
- lease owner and lease expiry when claimed;
- correlation and causation identifiers;
- sanitized error code;
- creation, start, completion, failure, and cancellation timestamps as applicable.

Job payloads MUST NOT contain real Student names, Student Access Codes, raw conversations, raw audio, complete uploaded files, secrets, provider credentials, or unrestricted safety content. Workers retrieve permitted data just in time after revalidating current authoritative state.

### Lifecycle

The canonical lifecycle remains:

```text
queued -> processing -> succeeded
                  |-> retry_scheduled -> processing
                  |-> failed
queued -> cancelled
processing -> abandoned -> retry_scheduled | failed
```

Transitions MUST be atomic. Terminal records are immutable except for approved retention cleanup and replay linkage. Manual replay creates a new Job or auditable execution identity.

### Claiming and Leases

Workers MUST claim eligible Jobs in a short database transaction using `FOR UPDATE SKIP LOCKED` or an equivalently atomic compare-and-set operation.

The claim sets:

- `processing` state;
- unique lease owner;
- lease expiry;
- incremented attempt count;
- start timestamp where absent.

The initial default lease is two minutes. Each job type MAY define a longer documented lease when its timeout budget requires it. Handler timeout MUST remain shorter than the lease and the Vercel Function limit.

Long-running handlers MUST renew before lease expiry or divide work into checkpointed child Jobs. A worker MUST verify lease ownership before committing a non-idempotent terminal effect.

Expired processing leases become `abandoned` and are reconciled into retry or terminal failure according to policy.

### Dispatcher and Schedule

Vercel Cron MUST invoke one protected dispatcher route every minute in production. The route MUST authenticate the scheduler through the approved secret or platform-authenticated mechanism and MUST reject ordinary public callers.

Each invocation MUST:

1. recover a bounded number of expired leases;
2. publish or convert a bounded number of pending Outbox Events;
3. claim a bounded batch using priority and fairness;
4. process within an execution deadline shorter than the platform limit;
5. stop claiming new work before the deadline;
6. leave unclaimed and retryable work durable for the next invocation;
7. emit sanitized metrics and outcome evidence.

The initial worker execution budget is 240 seconds maximum, with a claim cutoff at 210 seconds. Actual deployment `maxDuration` MUST be at least 240 seconds or the configured budget MUST be lowered to preserve margin.

The dispatcher MUST NOT assume that Vercel Cron runs exactly once or exactly on time.

### On-Demand Trigger

Latency-sensitive flows MAY request immediate processing only after the Job is durably committed.

The initiating server operation MAY:

- process a bounded Job synchronously when the result is required and timeout risk is low; or
- invoke the authenticated worker trigger after commit.

Failure of the immediate trigger MUST NOT lose the Job. The next scheduled dispatcher or reconciliation pass remains authoritative.

Untracked promises that depend on a serverless process continuing after response completion are prohibited.

### Priority and Fairness

The canonical priority classes are:

| Priority | Examples | Scheduling rule |
|---|---|---|
| `critical` | Confirmed safety delivery and privacy-integrity repair | Reserved capacity; never starved by general AI work |
| `interactive` | Summary finalization and Teacher-visible generation | Low queue delay target |
| `standard` | Progress projections and content processing | Normal fair scheduling |
| `maintenance` | Retention, reconciliation, and aggregation | Runs without starving interactive work |

Workers MUST reserve capacity or use separate bounded claims for `critical` work. Fairness MUST prevent one Teacher or Group from monopolizing execution. Aging MAY raise effective scheduling weight without changing the recorded priority class.

Safety classification occurs in the active tutoring safety boundary. Once a high-severity alert is durably confirmed, the delivery Job uses the critical path and SHOULD receive an immediate on-demand attempt plus scheduled retry protection.

### Initial Concurrency

The initial dispatcher MAY run up to five Jobs concurrently, subject to job-type limits:

- AI operations: maximum three concurrent per worker invocation;
- critical safety delivery: reserved capacity of at least one;
- database-intensive maintenance: maximum one;
- file processing: maximum one unless load testing approves more.

These are configuration values and MAY be tuned through measured load testing without superseding this ADR. Database connection and provider-rate limits remain hard constraints.

### Retry Policy

The default transient retry schedule is:

```text
1 minute, 5 minutes, 15 minutes, 1 hour, 6 hours
```

Jitter MUST be applied. Job types MAY use stricter policies when their privacy, safety, or user-facing deadline requires it.

Retries MUST NOT occur for authorization failure, schema failure, invalid lifecycle state, permanent policy rejection, unsupported job type, or exhausted budget unless an authorized state change makes the work newly eligible.

Provider rate-limit hints SHOULD be respected. Ambiguous external outcomes MUST be reconciled before repeating a chargeable or externally visible action.

Conversation deletion and critical safety delivery require dedicated escalation thresholds and MUST NOT wait silently through the generic retry schedule when their deadline is at risk.

### Failure and Dead-Letter Behavior

Exhausted or permanent failures enter `failed` and remain visible in an authorized operational view with sanitized evidence. A separate external dead-letter service is not required initially.

Failure MUST:

- update the owning user-visible workflow where applicable;
- emit a metric and operational alert according to severity;
- preserve attempt history and idempotency evidence;
- offer a documented repair, cancellation, or replay path;
- never expose raw provider responses or protected payload content.

### Reconciliation

Reconciliation MUST run at least every minute as part of the dispatcher and through deeper scheduled sweeps where appropriate. It MUST detect:

- expired leases;
- Outbox Events not converted or published;
- workflows stuck in `queued`, `processing`, or `finalizing` beyond threshold;
- provider outcomes with uncertain local state;
- conversation deletion approaching deadline;
- safety notification delivery failure;
- missed scheduled maintenance;
- stale temporary file and session state.

Repair actions remain idempotent and auditable.

### Deployment Safety

Workers MUST support the currently emitted payload version and at least the immediately preceding version during rolling deployment when older Jobs may remain queued.

Deployments MUST stop emitting an old version only after compatible consumers are live. Rollback MUST not strand Jobs emitted by the newer version. Unknown versions fail closed and remain recoverable.

### Local and Test Execution

The same Job handlers MUST run through a deterministic local worker command or test harness without Vercel Cron. Tests use isolated schemas or databases, synthetic data, fake clocks, and contract-faithful provider fakes.

Tests MUST simulate duplicate delivery, crash after external effect, lease expiry, timeout, deployment with older payloads, provider rate limits, unavailable providers, and database rollback.

## Consequences

### Positive

- no additional production queue service is required initially;
- domain change and asynchronous intent can be atomic;
- Job state is inspectable and recoverable in PostgreSQL;
- serverless function loss does not lose committed work;
- the design remains portable beyond Vercel and Supabase.

### Negative

- PostgreSQL bears queue polling, history, and locking load;
- minute cron cadence may add delay when on-demand triggering fails;
- application code must implement leasing, retries, fairness, and operations tooling;
- Vercel duration and invocation limits constrain individual handlers;
- external queue migration may eventually be required.

## Privacy Impact

Reference-only payloads prevent raw conversations, names, codes, and audio from becoming durable queue copies. Just-in-time worker retrieval remains subject to the original authorization, purpose, and retention rules.

## Security Impact

Scheduler and worker routes are server-only and authenticated. Runtime roles receive least-privilege `operations` grants. Job payloads and errors exclude secrets. Replay and duplicate execution are controlled through idempotency and current-state validation.

## Cost Impact

The mechanism primarily uses existing PostgreSQL and Vercel capacity. Costs arise from Cron invocations, Function execution, database polling, storage, and provider work. Metrics MUST distinguish queue infrastructure cost from AI and notification cost.

## Validation

Tests and operational evidence MUST prove that:

1. domain state and required Outbox Event commit or roll back together;
2. duplicate delivery creates no duplicate critical effect;
3. worker crash and lease expiry make the Job safely recoverable;
4. public callers cannot invoke scheduler or worker administration;
5. raw conversation, Student names, codes, audio, and secrets never enter payloads or logs;
6. critical work receives capacity despite a standard backlog;
7. retry schedules are bounded and apply jitter;
8. ambiguous provider outcomes reconcile before repeated paid work;
9. exhausted Jobs update user-visible and operational states;
10. old and new payload versions coexist during deployment and rollback;
11. dispatcher execution stops before the configured platform limit;
12. missed cron invocation does not lose durable work;
13. conversation deletion and safety delivery deadline risks alert operators;
14. a representative peak burst at 130 simultaneous users for the approximately 250-Student pilot recovers within the approved queue-age target.

## Reconsideration Triggers

Adopt or evaluate a managed queue/workflow service when measured evidence shows one or more of:

- sustained database queue contention affects interactive queries;
- production backlog cannot meet approved latency or deletion deadlines;
- workflows require long-running orchestration beyond bounded Jobs;
- required throughput or fan-out materially exceeds the validated worker model;
- multi-region execution makes PostgreSQL lease coordination unsuitable;
- Vercel scheduling or duration limits prevent reliable processing;
- operational burden exceeds the cost of a managed service.

Any transition MUST preserve idempotency keys, payload versions, traceability, privacy rules, and safe migration of pending Jobs.

## References

- Supabase documentation for PostgreSQL queues, `pg_cron`, and scheduled functions
- Vercel Cron Jobs and Vercel Functions duration documentation

## Resolution

This ADR resolves `OD-006`. Production enablement still requires deployment-plan verification, scheduler authentication, load testing, alert thresholds, and operational runbooks.
