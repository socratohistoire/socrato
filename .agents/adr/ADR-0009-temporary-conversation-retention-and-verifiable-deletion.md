# ADR-0009 — Temporary Conversation Retention and Verifiable Deletion

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Decision Owners:** Privacy, Data, AI, and Reliability  
> **Technical Specification References:** Sections 13, 15, 17, 19, 21, 23, 25, 26, and 30; `ADR-0011`; `OD-007`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Socrato temporarily processes Student tutoring exchanges to maintain conversational continuity, derive Learning Evidence candidates, produce a Pedagogical Summary, and update Progress. The product does not retain complete Student conversations as Teacher-visible history or analytics.

Deletion after successful finalization is necessary but insufficient as a policy: provider failure, interrupted sessions, abandoned browsers, worker crashes, and restoration from backup could otherwise retain raw exchanges indefinitely. A hard deadline and independently verifiable deletion workflow are required.

## Decision Drivers

- collect and retain only what is necessary for active tutoring;
- preserve a reasonable short resumption window;
- delete promptly after the stated purpose is complete;
- prevent failed finalization from becoming indefinite retention;
- keep safety evidence separate and minimal;
- avoid raw conversation copies in Jobs, logs, analytics, reports, or dashboards;
- support deletion verification, retries, restoration, and incident response;
- communicate the policy accurately without claiming instant physical erasure from every backup medium.

## Decision

### Data Classes

The system MUST distinguish:

| Data class | Retention rule |
|---|---|
| Raw Tutoring Exchange | Temporary under the deadlines below |
| Temporary conversation context | Same or shorter lifecycle than the source Exchanges |
| Pedagogical Summary | Retained under its separate approved schema and retention policy |
| Learning Evidence and Progress | Retained under pedagogical policy |
| Safety Detection candidate | Temporary and deleted with raw Exchanges unless promoted |
| Emergency Alert evidence | Separate minimal encrypted record governed by `OD-014` |
| Usage metadata | Content-free and retained under operational policy |
| Deletion Receipt | Content-free verification evidence |

Transforming a conversation into another complete transcript, prompt archive, analytics payload, or debug attachment does not change its classification and is prohibited.

### Normal Completion Deadline

When a Learning Session is explicitly completed:

1. the session enters `finalizing`;
2. required Pedagogical Summary and eligible Progress results are generated and validated;
3. permitted retained results are committed durably;
4. a conversation-deletion Job is created transactionally;
5. raw Exchanges and temporary context are deleted;
6. a content-free Deletion Receipt is committed.

The operational target is deletion within 15 minutes of explicit completion. The maximum deadline is one hour after explicit completion.

Successful finalization SHOULD delete immediately and MUST NOT deliberately wait until the one-hour deadline.

### Interrupted and Resumable Sessions

An interrupted or paused Learning Session MAY retain raw Exchanges only while a reasonable resumption purpose remains.

Raw Exchanges MUST be deleted no later than the earliest of:

- 24 hours after the last successful Student or tutoring exchange;
- 48 hours after the first raw Exchange in the Learning Session;
- Student or Teacher action requiring immediate deletion;
- Student Membership removal, Group closure, or year-end roster deletion;
- another shorter privacy or security deadline.

Successful activity may move the 24-hour inactivity deadline but MUST NOT move the 48-hour total deadline.

### Finalization Failure

Summary, AI, worker, or provider failure MUST NOT extend the hard deadline.

Before the hard deadline, the system MAY retry finalization or produce an approved deterministic minimal fallback Summary from already validated structured evidence. If required retained outputs still cannot be produced, Socrato MUST:

- preserve any already confirmed Learning Evidence that does not require the transcript;
- record a content-free finalization failure state;
- delete raw Exchanges by the applicable hard deadline;
- show an appropriate unavailable or incomplete-summary state;
- alert operations when the failure pattern or deletion deadline requires it.

Avoiding indefinite conversation retention takes precedence over recovering a perfect Summary.

### Teacher Preview

Teacher Preview conversations MUST NOT create real Student Exchanges, Progress, Summaries, or Emergency Alerts.

Preview context MUST be deleted when Preview ends and no later than one hour after its last activity. Preview data MUST NOT be used to train, profile, or evaluate a Student.

### Safety Separation

Routine conversations and routine personal-information sharing do not create a safety record.

When the single approved high-severity threshold is confirmed, the system MAY create a separate restricted Emergency Alert record containing only the minimum approved context necessary for authorized adult action. It MUST NOT copy the complete conversation.

Creation of a safety record does not suspend raw-conversation deletion. Raw Exchanges follow the same one-hour, 24-hour, and 48-hour deadlines. The separate safety-record retention period is decided by `OD-014`.

### Storage Boundary

Raw Exchanges MUST reside only in the approved temporary conversation store in the unexposed data boundary. They MUST NOT appear in:

- Teacher dashboards or ordinary Teacher APIs;
- general logs, traces, analytics, or error monitoring;
- Job or Outbox payloads;
- caches beyond the same shorter deadline;
- search indexes, embeddings, vector stores, exports, or reporting tables;
- provider-managed threads or stored Responses;
- test fixtures derived from production data.

Workers receive Learning Session identifiers and retrieve permitted temporary content just in time.

### Application-Level Protection

Raw conversation storage MUST use provider encryption at rest and SHOULD use application-level authenticated encryption under a dedicated purpose key when production threat modelling confirms the operational design.

If application-level encryption is enabled, it follows `ADR-0007` with a distinct `temporary_tutoring_exchange` purpose. Key or envelope deletion MUST not be represented as a substitute for deleting authoritative ciphertext rows and indexes.

### Provider Boundary

OpenAI text requests MUST use `store: false` under `ADR-0008`. Socrato MUST not create provider threads, files, vector stores, or persistent conversation objects for Student tutoring.

Provider abuse-monitoring or legal retention is distinct from Socrato application storage. Contractual data controls, residency, retention eligibility, and subprocessors MUST be verified before production. Socrato MUST not claim zero provider retention without verified account and endpoint evidence.

### Deletion Mechanism

Deletion MUST use the durable background mechanism in `ADR-0011`.

The deletion handler MUST:

1. validate the policy version and authoritative Session state;
2. identify all raw Exchange and temporary-context stores for the Session;
3. delete in an idempotent transaction where practical;
4. invalidate related temporary caches and pending nonessential work;
5. verify zero authoritative raw rows remain;
6. write or update a content-free Deletion Receipt;
7. emit privacy-safe metrics;
8. retry or escalate failure before the deadline.

The handler MUST be safe when run repeatedly and after the data is already absent.

### Deletion Receipt

The retained Deletion Receipt MAY contain only:

- opaque Learning Session identifier;
- retention-policy version;
- deletion trigger category;
- deletion requested, started, and verified timestamps;
- deleted-row counts by store category;
- final status;
- sanitized failure code and attempt count where applicable;
- Job and correlation identifiers.

It MUST NOT contain conversation text, hashes or embeddings derived from text, Student names, Access Codes, prompt content, provider responses, or safety evidence.

The initial policy version is `conversation_retention_2026_07_20_v1`.

### Scheduler and Reconciliation

The worker dispatcher runs every minute. Each pass MUST prioritize:

- completed Sessions awaiting deletion;
- Sessions approaching the one-hour completion deadline;
- inactive Sessions approaching 24 hours;
- Sessions approaching the 48-hour total cap;
- failed deletion attempts;
- restored or reconciled Sessions whose deadline has passed.

Operational alerts MUST fire before a deadline breach when recovery time remains, and immediately on an observed breach.

### Backups and Point-in-Time Recovery

Database deletion does not imply immediate physical removal from every pre-existing encrypted backup or point-in-time recovery segment. Backup retention is governed by `OD-023`.

Raw Exchanges recovered from an older backup MUST NOT become available to application users merely because the backup predates deletion. Before restored service accepts traffic, a restore reconciliation MUST:

1. load durable deletion and lifecycle evidence available to the recovery process;
2. recalculate deadlines from authoritative timestamps;
3. delete Sessions whose deadlines passed;
4. reapply Membership, Group, code, and year-end deletion events;
5. verify deletion before enabling affected data paths.

Backup access remains restricted, audited, encrypted, and unavailable for ordinary application or Teacher use. The privacy notice MUST describe backup handling accurately.

### Deletion Failure and Incident Handling

Deletion failure categories MUST distinguish database unavailability, lock contention, unknown storage location, schema incompatibility, corrupted metadata, worker failure, authorization/configuration defect, and restore inconsistency.

A deletion deadline breach is a privacy incident requiring immediate operational review. The response MUST identify affected Session IDs without copying conversation content, contain further access, repair deletion, assess notification obligations, and preserve content-free incident evidence.

### User and Teacher Access

Students MAY view the active conversational context required for their own current Session. Teachers MUST NOT receive raw Student conversation history through normal product workflows.

After deletion, the product exposes only permitted Pedagogical Summaries and Progress data. It MUST NOT reconstruct a transcript from retained fragments.

## Consequences

### Positive

- conversations disappear promptly after their purpose is fulfilled;
- interrupted learning remains resumable for a short defined window;
- failed AI finalization cannot cause indefinite retention;
- deletion is measurable without retaining content-derived proof;
- safety evidence remains narrowly separated;
- restoration cannot silently reactivate expired transcripts.

### Negative

- a Student cannot resume the same raw conversation after the deadline;
- severe outages may yield an incomplete or unavailable Summary;
- deletion reconciliation and restore gating add operational work;
- encrypted backups may contain older deleted rows until backup expiry;
- one-minute monitoring and priority execution consume background capacity.

## Privacy Impact

This decision implements purpose limitation and minimal retention. The 24-hour inactivity and 48-hour total caps are maximums, not routine retention targets. Normal completed Sessions should delete within 15 minutes.

## Security Impact

Raw conversation access is restricted to active server-side tutoring and finalization. Reference-only Jobs, `store: false`, no provider threads, no Teacher transcript access, content-free Receipts, and restore reconciliation reduce secondary disclosure paths.

## Cost Impact

Frequent deletion and reconciliation use PostgreSQL and worker capacity but reduce storage and breach exposure. Summary retries are bounded. Cost control MUST NOT override the hard deletion deadline.

## Validation

Automated and operational tests MUST prove that:

1. successful completed Sessions normally delete within 15 minutes;
2. no completed Session retains raw Exchanges beyond one hour;
3. interrupted Sessions delete within 24 hours of last exchange;
4. no Session retains raw Exchanges beyond 48 hours from first exchange;
5. finalization failure cannot move a hard deadline;
6. duplicate deletion Jobs remain safe and produce no content duplication;
7. zero raw rows and temporary cache entries remain after verified deletion;
8. Deletion Receipts contain no content or content-derived hashes;
9. Jobs, logs, analytics, dashboards, and AI Usage Records contain no raw conversation;
10. high-severity promotion retains only approved minimal safety context and does not block transcript deletion;
11. Preview context deletes at exit or within one hour of last activity;
12. provider calls use `store: false` and no provider conversation objects;
13. simulated worker and database failures alert before or at deadline;
14. backup restoration reapplies deletion before application traffic;
15. year-end roster deletion removes raw Exchanges and revokes Sessions;
16. an authorized Teacher cannot retrieve raw conversation history.

## Reconsideration Triggers

Revisit this decision before enabling offline tutoring, extending resumption beyond 24 hours, retaining transcripts for Teacher review, adopting provider-managed conversation state, enabling Voice, changing backup technology, introducing a separate temporary store, or receiving legal/privacy direction requiring a shorter deadline.

## References

- Commission d'accès à l'information du Québec guidance on conservation and destruction
- Québec privacy legislation and privacy-impact assessment requirements

## Resolution

This ADR resolves `OD-007`. Production still requires `OD-014` for Emergency Alert evidence, `OD-023` for backup retention, verified provider data controls, restore testing, and operational deadline alerts.
