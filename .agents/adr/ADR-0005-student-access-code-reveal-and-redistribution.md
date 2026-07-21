# ADR-0005 — Student Access Code Reveal and Redistribution

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Decision Owners:** Identity, Security, Privacy, and Teacher Experience  
> **Technical Specification References:** Sections 7, 10, 11, 17, 21, and 22; `ADR-0004`; `OD-002`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Teachers must distribute Student Access Codes at the beginning of a Group's use of Socrato and may need to redistribute them when students lose their paper or use a different school device. Requiring regeneration for every lost code would interrupt classroom use, invalidate active sessions, and create avoidable support work.

At the same time, Student Access Codes are credentials. Persistent plaintext storage, unmasked roster display, unrestricted exports, or client-side decryption would create unacceptable disclosure risk.

`ADR-0004` defines the `sac_v1` format and the non-reversible HMAC verification representation. This ADR decides whether a separate recoverable representation may exist for authorized Teacher redistribution.

## Decision Drivers

- realistic classroom redistribution and printing needs;
- minimal interruption when a Student loses a code;
- protection against database-only disclosure;
- strict Teacher and Group authorization;
- no plaintext code in normal roster responses;
- server-only decryption and short plaintext lifetime;
- traceable individual reveal and bulk distribution;
- immediate regeneration and revocation when compromise is suspected;
- mandatory year-end deletion.

## Considered Options

### Option 1 — One-time plaintext reveal with later regeneration

Not selected for the initial institutional workflow. It minimizes recoverable credential storage, but routine loss would force regeneration, invalidate sessions, and create classroom friction. Teachers could also compensate by keeping insecure local copies.

### Option 2 — Store plaintext codes for later display

Rejected. Database compromise, broad queries, exports, backups, or accidental logging could disclose active credentials directly.

### Option 3 — Store a separate encrypted recoverable representation

Accepted. The HMAC digest remains the authentication lookup representation. A separately encrypted copy supports authorized Teacher redistribution under strict server-only controls.

## Decision

### Dual Representation

Each active Student Access Code MAY have two distinct protected representations:

1. the non-reversible HMAC-SHA-256 lookup digest defined by `ADR-0004`; and
2. an authenticated-encrypted recoverable representation used only for authorized reveal, copy, print, and regeneration workflows.

The encrypted representation MUST NOT be used for credential lookup or routine authentication. The plaintext code MUST NOT be stored in any database column, cache, log, Audit Event, analytics event, URL, browser storage, or AI request.

### Encryption Boundary

Encryption and decryption MUST occur only in a reviewed server-only credential service. Browsers MUST never receive encryption keys or provider key-management credentials.

The recoverable representation MUST use approved authenticated encryption with:

- an environment-specific key hierarchy;
- explicit key version metadata;
- unique cryptographic nonce or initialization material per encrypted value;
- authenticated context binding the ciphertext to its credential record and environment;
- algorithm agility and key rotation support;
- failure behavior that never falls back to plaintext storage.

The exact algorithm, maintained library, key custody, rotation, backup, and recovery process remain blocked on `OD-009` and `ADR-0007`. Production implementation of recoverable storage MUST NOT begin before that decision is accepted.

### Default Teacher Experience

The Group roster MUST display codes as masked by default. It MUST NOT fetch or embed plaintext codes in the initial page payload, server-rendered HTML, hidden fields, accessibility labels, client state, or hydration data.

An authorized Teacher MAY request:

- an individual code reveal;
- an individual copy action;
- a dedicated printable code sheet for one authorized Group;
- a controlled Group code export when explicitly enabled.

Every plaintext-returning request MUST independently validate:

- the active Teacher Session;
- Teacher ownership or approved access to the Group;
- the Student's active membership in that Group;
- the credential's active lifecycle state;
- recent-authentication or confirmation requirements;
- applicable rate and anomaly controls.

Possession of a Student, Group, or credential identifier is never sufficient authorization.

### Individual Reveal

An individual reveal MUST:

1. begin from a masked state;
2. require an explicit Teacher action;
3. fetch plaintext only after server authorization;
4. reveal only the selected Student's code;
5. automatically remask after 30 seconds, navigation, tab backgrounding where detectable, or dialog closure;
6. remove the plaintext from client state immediately after remasking;
7. create a privacy-minimized Audit Event without the code or ciphertext.

The interface MUST provide a visible **Masquer** action and MUST warn that the code grants access to the Student's Socrato space.

### Copy Action

Copying a code MUST use the same authorization as reveal. It MUST be an explicit Teacher action and MUST NOT copy additional Student data unless the dedicated workflow clearly states it.

The application cannot guarantee removal from the operating-system clipboard. The interface SHOULD warn the Teacher to paste the code only into an approved destination and SHOULD attempt clipboard clearing only where reliable, non-disruptive, and supported. Clipboard content MUST NOT be read back for analytics or confirmation.

### Bulk Print and Export

Printing or exporting codes MUST use a dedicated server-authorized workflow, not the normal roster table or a general data export.

The workflow MUST:

- be limited to one authorized Group at a time;
- require an explicit confirmation explaining credential sensitivity;
- use a recent Teacher authentication according to the approved session policy;
- include only the minimum distribution fields;
- generate the artifact on demand;
- assign a short expiration to any server-side temporary artifact;
- prevent indexing and shared public links;
- avoid persistent storage unless separately approved;
- create one Audit Event describing the action and Group scope without including codes;
- provide secure disposal guidance to the Teacher.

The initial printable sheet SHOULD use detachable Student-specific rows or cards so one Student does not receive another Student's code. A Group-wide plaintext CSV export SHOULD remain disabled by default and requires a separate product and security enablement decision.

### Recent Authentication and Confirmation

Bulk plaintext access MUST require a recently authenticated Teacher Session or an approved step-up verification. The exact recent-authentication window is finalized with `OD-003`; it MUST be bounded and MUST NOT rely only on a stale browser page.

Individual reveal MAY use the active Teacher Session plus explicit confirmation during the pilot, but the server MUST support tightening this rule through configuration when risk evidence requires it.

### Rate and Anomaly Controls

Reveal, copy, print, and export endpoints MUST use layered rate limits and anomaly monitoring distinct from Student code validation limits.

The system SHOULD detect:

- rapid sequential reveal across many Students;
- repeated Group-wide printing or export;
- access following an unusual Teacher authentication event;
- attempts across unauthorized Groups;
- repeated decryption or integrity failures.

Protective controls MUST fail closed without exposing ciphertext, key details, or whether another Teacher's credential exists.

### Regeneration Instead of Reveal

The Teacher interface MUST offer **Générer un nouveau code** when:

- compromise is suspected;
- the encrypted representation is unavailable or fails integrity validation;
- the code or Student Membership is revoked or expired;
- a key migration cannot safely decrypt the existing representation;
- policy prohibits redisplay for the affected context.

Regeneration follows `ADR-0004`: create a new independent code, revoke the previous credential, invalidate affected Student Sessions according to policy, preserve Student learning history, and record an Audit Event.

The application MUST NOT silently regenerate when the Teacher requested reveal because that would unexpectedly invalidate Student access.

### Retention and Deletion

The encrypted representation MUST share the active credential's lifecycle and MUST NOT outlive the approved redistribution purpose.

It MUST be deleted when:

- the credential is permanently revoked and no approved recovery window applies;
- the Student is removed under the roster-deletion workflow;
- the Group's Student roster is deleted at year-end;
- the associated Student Identity is deleted;
- privacy policy otherwise requires deletion.

Encrypted code representations MUST NOT be archived merely because historical Practices are retained. Restore procedures MUST reapply revocation and deletion events so expired or deleted codes do not become usable after backup restoration.

### Auditability

Audit Events MUST record, as applicable:

- authorized Teacher identifier;
- action category: individual reveal, copy, print, export, regeneration, or failure;
- affected Group and credential-record identifiers;
- timestamp, request correlation identifier, and privacy-safe outcome;
- security reason category when access is rejected.

Audit Events MUST NOT contain plaintext codes, ciphertext, lookup digests, encryption nonces, clipboard contents, rendered print artifacts, or Student conversation content.

## Consequences

### Positive

- Teachers can redistribute lost codes without disrupting learning sessions;
- the normal roster remains masked and contains no plaintext payload;
- database-only disclosure does not directly expose plaintext without the external key boundary;
- bulk distribution becomes a controlled, auditable workflow;
- suspected compromise still has a clear regeneration path.

### Negative

- reversible encryption creates additional key-management and breach impact;
- authorized Teacher-session compromise may permit code disclosure;
- printouts and clipboards create risks outside Socrato's complete technical control;
- backup, key rotation, and deletion workflows become more complex;
- implementation remains blocked until the encryption design is finalized.

## Privacy Impact

The recoverable representation exists solely to support Teacher distribution of an anonymous credential. It does not authorize collection of additional Student data. Plaintext must remain transient and must never be included in analytics, AI processing, or general exports.

## Security Impact

Security depends on authenticated encryption, externalized versioned keys, strict Teacher and Group authorization, recent-authentication controls, masked default display, short plaintext lifetime, anomaly detection, and reliable revocation. Encryption at rest does not protect against a compromised authorized Teacher Session; session security therefore remains essential.

## Cost and Operational Impact

Encryption and individual reveal costs are negligible at pilot scale. The material operational obligations are key custody, rotation, backup recovery, audit review, temporary artifact cleanup, and incident response.

## Validation

Automated and manual tests MUST demonstrate that:

1. normal roster responses contain no plaintext code or recoverable ciphertext;
2. unauthorized, cross-Teacher, cross-Group, expired, and revoked reveal requests fail closed;
3. individual reveal returns only the selected active credential;
4. revealed codes automatically remask and are removed from client state;
5. direct API requests cannot bypass confirmation and recent-authentication rules;
6. bulk printing is limited to one authorized Group and creates no public artifact;
7. general exports exclude Student Access Code plaintext;
8. ciphertext modification, wrong context, wrong environment, or wrong key version fails integrity validation;
9. the HMAC digest remains the only authentication lookup representation;
10. plaintext, ciphertext, digests, nonces, and print artifacts are absent from logs, analytics, errors, and Audit Events;
11. regeneration revokes the old credential without changing Student Identity or learning history;
12. year-end deletion removes encrypted representations and revokes Sessions;
13. backup restoration does not reactivate deleted or expired credentials;
14. load and security tests cover classroom-scale reveal and shared-network behavior.

## Reconsideration Triggers

This decision MUST be revisited if:

- Teachers do not materially use later reveal during the pilot;
- a deployment authority prohibits reversible Student credential storage;
- secure institutional distribution removes the need for redisplay;
- a security incident exposes Teacher Sessions or encryption keys;
- the product adopts Student-managed accounts or federated school identity;
- Group-wide plaintext export is proposed for default enablement;
- the key-management design cannot satisfy deletion, rotation, and recovery requirements.

## Resolution

This ADR resolves `OD-002`. Recoverable code storage and reveal implementation remain blocked until `OD-009` and `ADR-0007` approve the application-level encryption algorithm and key hierarchy.
