# ADR-0004 — Student Access Code Credential Design

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Decision Owners:** Identity and Security  
> **Technical Specification References:** Sections 4, 6, 7, 10, 11, 17, 18, 21, and 22; `AUTH-012` through `AUTH-019`; `OD-001`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Students in the initial institutional version of Socrato do not create email-based accounts or general-purpose passwords. An authorized Teacher generates and privately distributes a Student Access Code that establishes an anonymous, time-bounded Student Session.

The code must be practical for Secondary IV classrooms while resisting guessing, enumeration, database disclosure, accidental logging, and predictable generation. It is a revocable credential, not a Student Identity or public identifier.

This ADR defines code generation, format, normalization, lookup protection, collision handling, expiration, throttling, rotation, and validation. Whether a Teacher may later reveal the same plaintext code remains governed separately by `OD-002` and `ADR-0005`.

## Decision Drivers

- simple manual entry on school computers and mobile devices;
- sufficient entropy for a school-year credential;
- no student names, initials, dates, or Group information in the code;
- no ambiguous characters;
- efficient server-side lookup without plaintext storage;
- safe bulk generation for approximately 250 registered Students and future growth;
- layered abuse protection that accommodates shared school networks;
- immediate revocation and safe regeneration;
- no disclosure through URLs, logs, analytics, AI payloads, or browser storage.

## Considered Options

### Short numeric PIN

Rejected. Although easy to type, it provides insufficient entropy for a long-lived single-factor credential and requires aggressive throttling that could disrupt shared classroom networks.

### Eight-character alphanumeric code

Rejected. It improves usability but provides a smaller security margin for a credential that may remain active throughout a school year.

### Twelve-character random human-readable code

Accepted. It provides approximately 59 bits of entropy with the approved 30-character alphabet and remains readable when displayed in three groups of four.

### UUID or longer token

Rejected for routine student entry. It provides more entropy than required but creates unnecessary typing and transcription burden.

## Decision

### Canonical Format

Every newly generated Student Access Code MUST contain exactly 12 significant characters and MUST be displayed as three groups of four:

```text
XXXX-XXXX-XXXX
```

Example:

```text
K7MP-R4XT-9QHC
```

Hyphens are presentation characters and do not contribute entropy.

### Alphabet and Entropy

Generation MUST select each significant character uniformly from this versioned 30-character alphabet:

```text
23456789ABCDEFGHJKMNPQRSTVWXYZ
```

The alphabet excludes `0`, `1`, `I`, `L`, `O`, and `U` to reduce transcription ambiguity and unintended word formation. Codes are case-insensitive at entry, but the canonical display is uppercase.

The format provides approximately 59 bits of entropy. Generation MUST use a cryptographically secure random source supplied by the approved server runtime. General-purpose pseudo-random functions, timestamps, counters, Student data, Teacher data, and database identifiers MUST NOT influence generated characters.

The format version MUST be stored as credential metadata. The initial version is `sac_v1`. Future formats MUST coexist through explicit version handling and MUST NOT silently reinterpret existing credentials.

### Normalization

Before lookup, the server MUST:

1. bound the submitted input length before further processing;
2. remove approved ASCII presentation hyphens and surrounding ASCII whitespace;
3. convert ASCII letters to uppercase;
4. require exactly 12 remaining characters;
5. reject any character outside the `sac_v1` alphabet.

The server MUST NOT perform visually approximate substitutions such as converting `O` to `0` or `I` to `1`. Unicode lookalikes and unsupported separators MUST be rejected. The browser MAY format valid input as `XXXX-XXXX-XXXX`, but server normalization remains authoritative.

### Credential Scope

Each code MUST resolve server-side to exactly one active Student access context. The code MUST NOT serve as:

- a Student Identity primary key;
- a route parameter;
- an analytics identifier;
- an AI provider identifier;
- a value displayed outside the authorized distribution workflow.

Only one current code SHOULD be active for a Student Membership unless a separately approved migration or recovery workflow requires a bounded overlap. Any overlap MUST have an explicit expiration and Audit Event.

### Protected Lookup Representation

Plaintext Student Access Codes MUST NOT be stored as the verification representation.

The canonical normalized code MUST be transformed server-side using HMAC-SHA-256 with a versioned, environment-specific secret key. The database stores:

- the lookup digest;
- the lookup-key version;
- the code-format version;
- lifecycle status;
- issued, expiration, revocation, and last-success timestamps where approved;
- failure-control metadata only where required and privacy-minimized.

The lookup digest MUST have a uniqueness constraint within the applicable credential registry. HMAC comparison MUST use an approved constant-time comparison primitive where application comparison occurs.

The HMAC key MUST remain in protected server-side secret management, remain separate across environments, never enter the database or browser, and follow the key-management controls finalized by `ADR-0007`. Key rotation MUST support a bounded transition across active key versions.

A separate encrypted recoverable copy MUST NOT be added unless `OD-002` and `ADR-0005` explicitly approve later redistribution. The lookup representation itself is not reversible.

### Collision Handling

Generation MUST:

1. generate a candidate with the approved secure random source;
2. normalize and calculate its protected lookup digest;
3. attempt insertion under the database uniqueness constraint;
4. generate a completely independent candidate after a collision;
5. stop and report an internal generation failure after five unsuccessful insertions.

The plaintext candidate and conflicting digest MUST NOT appear in logs or error payloads. Bulk generation MUST preserve one-to-one assignment and report any failed Student record without reusing another Student's code.

### Initial Expiration Policy

Every credential MUST have an explicit `expires_at` value.

For the initial institutional release:

- a code expires no later than the end of its active school-year or Group access period;
- a newly issued code MUST NOT remain valid for more than 13 months;
- removal of a Student Membership, Group closure, roster deletion, Teacher action, or security event MAY revoke it earlier;
- year-end Student roster removal MUST revoke the code and associated Student Sessions;
- expired or revoked codes MUST never create a new Student Session.

Expiration does not authorize retention of Student Identity data beyond the applicable privacy policy.

### Validation and Public Response

Validation MUST occur only on a Socrato server boundary over HTTPS. The server MUST normalize the input, apply abuse controls, compute the protected lookup digest, resolve an eligible credential, verify membership and lifecycle state, and create a new opaque Student Session.

Invalid format, unknown code, expired code, revoked code, inactive membership, and rate-limited validation MUST use non-enumerating public behavior. Internal reason categories MAY differ, but public responses MUST NOT disclose whether a Student, Teacher, Group, or code exists.

The submitted code MUST be discarded from normal application state immediately after validation. It MUST NOT be copied into the Student Session, URL, browser storage, logs, traces, analytics, Audit Events, error monitoring, support tooling, or AI requests.

### Layered Abuse Controls

The initial implementation MUST combine:

- per-client or risk-context throttling;
- shared-network-aware throttling;
- global anomaly detection;
- bounded progressive delay;
- uniform failure responses;
- operational monitoring for distributed attacks.

Initial production values MUST be configurable and security-tested. The starting baseline is:

| Scope | Starting threshold | Initial action |
|---|---:|---|
| Client or risk context | 10 failed attempts per 15 minutes | Progressive delay, then temporary rejection |
| Shared network | 120 failed attempts per minute and 600 per 15 minutes | Temporary network throttling |
| Global service | Measured anomaly threshold | Protective control and security alert |

Successful authentication MUST NOT erase evidence required to detect distributed abuse. Network thresholds MUST accommodate legitimate shared school NAT traffic and MUST be validated through classroom-scale load testing.

The system MUST NOT permanently lock a Student credential solely because unauthenticated remote failures targeted it. An authorized Teacher must be able to regenerate or revoke a code even while public validation is throttled.

Exact limits MAY be tightened or relaxed through reviewed security configuration without superseding this ADR when the credential format, threat model, and control layers remain unchanged.

### Regeneration and Revocation

Regeneration MUST create a new independent 12-character code, revoke the previous code transactionally, and invalidate affected Student Sessions according to the approved session policy. It MUST NOT change the Student Identity or delete retained learning progress.

Revocation MUST prevent new Student Sessions immediately after the revocation is committed. Active-session enforcement is finalized with `OD-003`, but the architecture MUST support server-side session revocation.

Generation, regeneration, revocation, dedicated print/export, and security-relevant anomalies MUST create privacy-minimized Audit Events that exclude the code and its digest.

## Consequences

### Positive

- the code remains reasonably easy to read and type;
- approximately 59 bits of entropy provides a strong margin against online guessing;
- protected keyed lookup avoids plaintext credential storage;
- the format works for paper distribution and copy-paste;
- code rotation does not disturb Student learning history;
- format and key versioning support future migration.

### Negative

- 12 characters require slightly more classroom transcription than shorter codes;
- school-network-aware throttling is more complex than a simple per-IP limit;
- HMAC key rotation requires coordinated application and secret-management support;
- later redisplay cannot be implemented from the lookup digest alone.

## Privacy Impact

The code contains no personal information and is stored independently from Teacher-visible Student names. It remains a sensitive credential because it grants access to a Student learning context. The code and its digest are prohibited from analytics, AI payloads, and general logs.

## Security Impact

Security depends on cryptographic generation, approximately 59 bits of entropy, protected HMAC lookup, server-only validation, explicit expiration, revocation, opaque sessions, layered throttling, and key protection. Code entropy does not replace authorization or session controls.

## Cost and Operational Impact

Generation and HMAC lookup have negligible cost at initial scale. Rate-limit state and monitoring add modest operational storage and processing. No additional external identity provider account is required for Students.

## Validation

Automated tests MUST demonstrate that:

1. generated `sac_v1` codes contain exactly 12 allowed characters;
2. display formatting is always `XXXX-XXXX-XXXX`;
3. normalization accepts lowercase and omitted approved hyphens;
4. invalid length, characters, Unicode lookalikes, and unsupported separators are rejected;
5. generation uses the approved cryptographic random source;
6. a large statistical generation test reveals no collision or material distribution bias;
7. the database uniqueness constraint safely handles a forced collision;
8. plaintext codes never appear in persisted verification data, logs, URLs, analytics, errors, sessions, or AI payloads;
9. invalid, expired, revoked, and unknown codes have non-enumerating public responses;
10. layered throttling limits automated guessing without preventing the approved classroom concurrency scenario;
11. regeneration revokes the previous code and preserves Student Identity and learning history;
12. year-end removal revokes credentials and Student Sessions;
13. lookup-key versions support the approved rotation test;
14. only one Student access context resolves from a successful code validation.

## Reconsideration Triggers

This decision MUST be revisited before:

- allowing Students to choose or memorize their own codes;
- using codes as a second factor rather than the initial single Student credential;
- materially extending credential validity beyond 13 months;
- changing the alphabet, significant length, or normalization rules;
- enabling offline validation;
- expanding into a direct-to-parent or direct-to-student consumer identity model;
- replacing protected keyed lookup with another verification design;
- identifying measured abuse that the current entropy and throttling model cannot control.

## Resolution

This ADR resolves `OD-001`. Implementation remains blocked on the separate reveal and redistribution decision `OD-002` where the Teacher workflow requires later plaintext display.
