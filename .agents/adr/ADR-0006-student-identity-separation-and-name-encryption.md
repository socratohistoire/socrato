# ADR-0006 — Student Identity Separation and Name Encryption

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Decision Owners:** Privacy, Security, and Data  
> **Technical Specification References:** Sections 4, 7, 10, 11, 17, 21, and 22; `ADR-0007`; `OD-004`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Teachers need to identify Students and view Group rosters alphabetically by family name. Socrato must simultaneously keep Teacher-visible names separate from anonymous learning identities, exclude names from AI requests, prevent plaintext database disclosure, and delete roster identity data at year-end.

The pilot population is bounded at approximately 250 registered Students. This makes authorized server-side decryption and in-memory sorting practical without a persistent plaintext, deterministic, or order-revealing sort index.

## Decision Drivers

- names never reach the AI provider;
- database-only disclosure must not reveal names;
- authorization must precede decryption;
- roster sorting must follow French-Canadian expectations;
- no deterministic or order-revealing name index;
- bounded performance at classroom scale;
- reliable Student addition, correction, removal, and year-end deletion;
- key rotation and backup restoration must remain possible.

## Considered Options

1. **Plaintext names with database sorting — rejected.** It exposes identity data to database reads, exports, and accidental telemetry.
2. **Encrypted names with a plaintext normalized sort key — rejected.** The derived value would continue to expose identity information and ordering.
3. **Deterministic or order-revealing encryption — rejected.** It leaks equality or ordering and is unnecessary at Socrato's bounded scale.
4. **Authorized bounded decryption and in-memory sorting — accepted.** It provides the required Teacher experience without a persistent searchable name derivative.

## Decision

### Identity Separation

The anonymous `student_id` remains the canonical Student Identity. Teacher-visible name data MUST be stored only in the unexposed `private` schema and MUST be linked through the opaque `student_id`.

Application and learning tables MUST reference `student_id`, never a name, name fragment, Student Access Code, or encrypted-name record identifier as their identity key.

### Encrypted Name Payload

Each Student's approved Teacher-visible name information MUST be stored as one versioned authenticated-encrypted payload containing only the required fields, initially:

```json
{
  "givenName": "…",
  "familyName": "…",
  "displayPreference": "given_family"
}
```

The payload MUST NOT contain birthdate, student number, email, address, parent information, diagnostic information, or unrelated school-system data.

Encryption MUST follow accepted `ADR-0007`. The database stores ciphertext and cryptographic metadata, not plaintext fields or a plaintext normalized copy.

### Authorization Before Decryption

Only the reviewed server-side Student identity service MAY decrypt the payload. Before decryption, it MUST validate:

- an active authorized Teacher Session;
- Teacher ownership or approved access to the Group;
- active Student Membership in that Group;
- the requested operation and minimum required fields;
- applicable account, Group, and Student lifecycle states.

Platform operations MAY use a separately authorized support workflow only when explicitly approved and audited. Browsers, database clients, background jobs, exports, and analytics do not gain decryption merely because they possess a `student_id`.

### Alphabetical Sorting

For an authorized Group roster, the server MUST:

1. query only the bounded active roster and encrypted name payloads;
2. decrypt the payloads in server memory after authorization;
3. normalize Unicode for comparison in memory without altering the stored display value;
4. sort primarily by `familyName`, secondarily by `givenName`, and finally by opaque `student_id` for stable ordering;
5. use the maintained runtime's `Intl.Collator` with locale `fr-CA` and reviewed comparison options;
6. return only the minimum Teacher-visible roster projection;
7. release plaintext references as soon as the request completes.

No plaintext `sort_name`, keyed sort token, deterministic ciphertext, phonetic key, prefix index, search index, materialized view, analytics dimension, or cache entry MAY be persisted.

### Display and Search

The interface MAY display the approved full or reduced name format to the authorized Teacher. Student-facing and AI-facing contexts MUST use no real name unless a later explicitly approved requirement establishes a safe need.

Initial roster search MUST occur only over the already authorized, decrypted, bounded roster in server memory or the authorized client projection. Socrato MUST NOT add server-side encrypted-name search infrastructure for hypothetical scale.

### Add and Correct Student

The **Ajouter un élève** workflow MUST:

- authorize the Teacher for the target Group;
- validate and minimize submitted name fields;
- create the anonymous Student Identity and Membership;
- encrypt the name payload before persistence;
- generate the Student Access Code through `ADR-0004` and `ADR-0005`;
- avoid logging submitted names or codes;
- return the authorized distribution result.

Correcting a name MUST replace the encrypted payload with a newly encrypted version and new nonce. It MUST NOT change `student_id`, progress, summaries, or Practice history.

### Caching and Client Boundary

Decrypted Group rosters MUST NOT enter shared caches, public caches, static generation, incremental static regeneration, localStorage, IndexedDB, service-worker caches, analytics payloads, or error-monitoring attachments.

An authorized browser MAY hold the minimum roster projection in volatile page memory for the active Teacher view. Responses MUST use private no-store caching controls. Navigation, sign-out, session expiration, and Group change MUST discard the projection.

### AI Boundary

Real names, encrypted name payloads, normalized names, name initials, and any reversible or derived identity values MUST NOT be included in AI prompts, tool calls, provider metadata, provider thread identifiers, moderation requests, embeddings, or model-generated summaries.

AI-boundary tests MUST inspect final serialized provider payloads rather than only upstream domain objects.

### Audit and Observability

Routine authorized roster viewing SHOULD create aggregate access evidence rather than one Audit Event per Student. Sensitive bulk export, exceptional support access, key migration, deletion, and rejected cross-scope attempts MUST be auditable.

Logs and traces MUST exclude plaintext names, encrypted payloads, cryptographic metadata that enables replay, and complete roster responses.

### Deletion and Restoration

Removing a Student under the approved roster-deletion workflow and year-end roster removal MUST delete the encrypted name payload and revoke Student credentials and Sessions. Historical Practices MAY remain only without the deleted identity mapping.

Backups do not redefine retention. After restoration, deletion and revocation records MUST be replayed before restored data becomes available.

## Consequences

### Positive

- names remain outside normal application and AI data paths;
- no persistent sort derivative leaks equality or alphabetical order;
- database-only compromise does not reveal plaintext names without the key boundary;
- Teacher roster behavior remains familiar;
- complexity remains proportionate to initial scale.

### Negative

- database-native sorting, filtering, and pagination by name are unavailable;
- authorized roster requests require bounded decryption work;
- client and server caching options are intentionally restricted;
- key loss would make names unrecoverable, so key recovery procedures are essential.

## Privacy Impact

The design minimizes identity fields, separates identity from learning records, prohibits AI transfer, and supports deletion without deleting permitted anonymous pedagogical history when policy allows it.

## Security Impact

Protection depends on server authorization, `private` schema isolation, authenticated encryption, external key custody, safe client handling, and negative AI-boundary tests. Application compromise within an authorized runtime remains a threat and is limited through least privilege and auditability.

## Performance Requirement

Before pilot release, a test with at least 250 Students in an authorized pilot roster MUST demonstrate acceptable decryption and `fr-CA` sorting latency within the approved page-performance budget. Failure requires optimization that preserves this privacy model or a superseding ADR.

## Validation

Tests MUST prove that:

1. database rows contain no plaintext or deterministic name derivative;
2. cross-Teacher and cross-Group requests cannot decrypt names;
3. roster ordering is family name, given name, then stable opaque identifier;
4. accents, hyphens, apostrophes, compound names, and equal names behave consistently under `fr-CA` collation;
5. **Ajouter un élève** encrypts before persistence and generates an independent anonymous credential;
6. correcting a name preserves Student Identity and learning history;
7. names never appear in AI payloads, logs, URLs, analytics, caches, or error reports;
8. year-end deletion removes encrypted identity data and revokes credentials and Sessions;
9. restored backups reapply deletions before service availability;
10. a 250-Student roster satisfies the approved performance budget.

## Reconsideration Triggers

Revisit this decision before implementing organization-wide Student search, rosters materially beyond measured in-memory limits, institutional directory synchronization, co-Teacher tenancy, a reporting warehouse containing identity data, or any persistent name search/index scheme.

## Resolution

This ADR resolves `OD-004`. Its production implementation depends on accepted `ADR-0007` and the configured production key-management provider.
