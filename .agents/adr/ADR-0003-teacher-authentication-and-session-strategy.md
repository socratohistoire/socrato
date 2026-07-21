# ADR-0003 — Teacher Authentication and Session Strategy

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Decision Owners:** Identity and Security  
> **Technical Specification References:** Sections 5, 6, 7, 10, 17, 18, 21, 22, and 27; `AUTH-001` through `AUTH-030`; `OD-003`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Socrato has two materially different authenticated experiences. Teachers use managed Supabase Auth accounts to access rosters, encrypted Student names, progress, Practices, and protected distribution tools. Students use anonymous Student Access Codes to establish application-owned Student Sessions, often on shared school devices.

Provider defaults may permit sessions to remain active until sign-out. Socrato requires explicit idle and absolute limits, server-side revocation, safe refresh behavior, concurrent-session policy, recent authentication for sensitive actions, and preservation of confirmed learning work when authentication expires.

## Decision Drivers

- protect shared school devices;
- avoid losing confirmed Student work;
- keep Teacher access usable during a school day;
- prevent unlimited sessions and refresh-token persistence;
- revoke access promptly after roster, credential, role, or account changes;
- support realistic Teacher use across school and personal devices;
- preserve server-side authorization independent of provider token claims;
- remain compatible with Supabase Auth and Next.js server rendering.

## Decision

### Session Classes

Socrato MUST maintain separate session classes:

| Session | Authentication source | Idle timeout | Absolute lifetime | Concurrent policy |
|---|---|---:|---:|---|
| Teacher Session | Supabase Auth plus Socrato authorization | 60 minutes | 12 hours | Maximum 3 active sessions |
| Student Session | Valid Student Access Code | 30 minutes | 4 hours | One active session per current credential |
| Teacher Preview | Active Teacher Session plus isolated preview context | Inherits Teacher Session | Cannot exceed Teacher Session | No separate persistent login |
| Platform Administrator | Managed account with MFA | 15 minutes | 8 hours | One active session |

Idle time is measured from the last successful server-authorized activity, not browser mouse movement, focus, background refresh, analytics, or passive page visibility.

Absolute lifetime is measured from initial authentication and MUST NOT be extended by refresh, activity, tutoring, or background work.

### Teacher Authentication

Teacher authentication MUST use verified email and password through Supabase Auth and the approved server-rendering and PKCE-compatible integration. Password recovery uses the approved time-limited email flow. Initial production registration is invite-only or administrator-approved; public self-registration remains disabled. Passwordless sign-in or institutional SSO requires separate enablement and testing.

Supabase access JWT lifetime MUST be 60 minutes. Refresh-token rotation MUST remain enabled. Refresh-token reuse detection and provider-supported revocation controls MUST be enabled and tested.

Socrato MUST maintain or resolve an application authorization record for each Teacher Session so protected requests can validate current account state, role, ownership, session status, idle deadline, and absolute deadline. A valid unexpired provider token alone is insufficient authorization.

### Teacher Concurrent Sessions

A Teacher MAY have at most three active Sessions to accommodate typical school, home, and secondary-device use.

Creating a fourth Session MUST revoke the least recently active Session after successful authentication and notify the Teacher in clear language. The account-security view SHOULD list active Sessions with privacy-safe device and last-activity information and permit revocation of one or all Sessions.

Password reset, confirmed account compromise, account suspension, trusted-role removal, and **Sign out all sessions** MUST revoke every Teacher Session.

### Student Sessions

Student Sessions are application-owned and MUST NOT create Supabase Auth users. Successful code validation creates a new opaque, high-entropy Session token stored in a protected cookie and a server-side protected Session record.

Only one Student Session may remain active for one current Student Access Code credential. A successful new sign-in revokes the previous Session for that credential. The new login MUST NOT delete confirmed learning work.

Student code regeneration, code revocation, Student Membership removal, Group closure, year-end roster deletion, or Student Identity deletion MUST revoke all affected Student Sessions immediately after the controlling transaction commits.

### Active Learning and Expiration

An active tutoring exchange updates Student Session activity only after a successful server-authorized request. Draft text, microphone capture, page focus, and client-only interactions do not extend the session.

When a Session expires during learning:

- confirmed Question Attempts, Learning Evidence, and progress writes remain preserved;
- unconfirmed browser-only input MAY be offered for local copy but MUST NOT be persisted as authenticated work;
- the active Learning Session enters the applicable resumable or finalization state;
- the Student returns to code entry and may resume after successful reauthentication if the Practice remains eligible;
- expiration MUST NOT silently submit or duplicate an answer.

Authentication Session expiration is distinct from Learning Session completion.

### Warning Periods

Where technically reliable, the interface MUST warn:

- Teachers 5 minutes before idle or absolute expiration;
- Students 5 minutes before idle or absolute expiration during an active learning view.

The warning MUST state the required action and protect unsaved input. An **Rester connecté** action MAY refresh idle activity only through a real server-authorized request and MUST NOT extend the absolute lifetime.

### Cookies

Production Session cookies MUST use:

- `Secure`;
- `HttpOnly` wherever compatible with the approved Supabase integration;
- `SameSite=Lax` or a stricter policy where workflow-compatible;
- host-only scope where practical;
- narrow paths where practical;
- opaque, non-descriptive values;
- expiry no later than the server Session deadline.

Authentication tokens and Student Session tokens MUST NOT be stored in localStorage, IndexedDB, URLs, analytics, logs, error payloads, or AI requests.

### CSRF and Request Validation

State-changing authenticated requests MUST validate allowed origin and content type and use the approved CSRF protection appropriate to the Next.js and cookie pattern. `SameSite` cookies are defense in depth and MUST NOT be the only protection where a cross-site request remains possible.

Every protected request MUST revalidate Session status and authorization scope server-side. Sensitive mutations MUST fail closed when current Session state cannot be confirmed.

### Recent Authentication

The initial recent-authentication window is 15 minutes.

Recent Teacher authentication or approved step-up verification is REQUIRED for:

- Group-wide Student Access Code printing or enabled export;
- changing password, primary email, or MFA configuration;
- **Sign out all sessions** when initiated from an untrusted context;
- closing the Teacher Account;
- assigning or changing a privileged role;
- high-impact protected-data export;
- exceptional key, safety, or administrative operations defined elsewhere.

Individual masked-code reveal MAY use the active Teacher Session plus explicit confirmation during the pilot, as approved by `ADR-0005`. Risk evidence MAY promote it to recent-authentication without superseding this ADR.

### Refresh and Revocation Enforcement

Provider session time-box and inactivity settings SHOULD mirror the approved Teacher limits where the selected Supabase plan supports them. Because Supabase enforces some session changes at refresh boundaries, Socrato MUST NOT rely on provider timing for immediate application revocation.

Application Session state MUST be checked on protected requests. Revocation MUST take effect no later than the next protected request and MUST not wait for a one-hour JWT to expire.

Session caches, if introduced, MUST use short bounded TTLs and an immediate invalidation path. Authorization-critical revocation MUST fail closed when cache freshness is uncertain.

### Sign-Out

Teacher sign-out MUST terminate the applicable Supabase and Socrato Session, clear protected cookies and volatile protected state, and prevent ordinary browser-history restoration of protected content.

Student sign-out MUST revoke the current Student Session, clear the cookie and volatile roster/learning state, and return to code entry without exposing the prior Student Identity.

Closing a tab is not reliable sign-out. Shared-device interfaces MUST visibly offer **Se déconnecter** and SHOULD remind Students to use it.

### Failure and Recovery

Expired, revoked, missing, or superseded Sessions MUST return a uniform unauthorized state appropriate to the actor without revealing account, Group, or Student existence.

The UI MUST preserve safe recovery destinations:

- Teacher → Teacher sign-in;
- Student → Student Access Code entry;
- Preview → owning Teacher Practice context when the Teacher Session remains valid.

Background finalization and confirmed deletion work MUST continue independently of browser Session expiration when already authorized and durably queued.

### Audit and Monitoring

Privacy-minimized Audit Events MUST cover security-relevant Session creation, fourth-Session eviction, revocation, sign-out-all, password recovery, role change, administrator login, and repeated anomalies.

General logs MUST NOT contain access tokens, refresh tokens, Session cookies, Student Access Codes, real Student names, or complete roster responses.

Metrics SHOULD cover aggregate sign-in success, expiration category, revocation latency, refresh failure, concurrent-Session eviction, and shared-network authentication failure without enabling Student surveillance.

## Consequences

### Positive

- shared-device exposure is bounded;
- Teacher access remains usable through a normal school day;
- immediate application revocation does not depend on JWT expiry;
- confirmed Student learning survives authentication expiration;
- sensitive Teacher actions receive stronger recent-authentication controls.

### Negative

- Teachers may need to authenticate again after long inactive periods;
- Students switching devices automatically end the prior Session;
- application-owned Session state adds persistence and revocation logic;
- provider session settings may require a paid Supabase plan;
- warning timers require careful synchronization with authoritative server deadlines.

## Privacy Impact

Sessions use opaque identifiers and minimal metadata. Student Sessions remain separate from names and AI identifiers. Device descriptions and IP-derived security metadata must be minimized and retained only for approved security purposes.

## Security Impact

Bounded idle and absolute lifetimes, rotating refresh tokens, protected cookies, recent authentication, concurrent limits, server-side revocation, CSRF controls, and authorization checks reduce credential and shared-device risk. Session limits do not replace code protection, MFA for administrators, or resource authorization.

## Validation

Tests MUST prove that:

1. Teacher Sessions expire after 60 minutes of inactivity or 12 hours absolutely;
2. Student Sessions expire after 30 minutes of inactivity or 4 hours absolutely;
3. passive client activity cannot extend idle deadlines;
4. refresh cannot extend an absolute deadline;
5. a fourth Teacher Session revokes the least recently active one;
6. a new Student login revokes the prior Session for the credential;
7. code regeneration, membership removal, Group closure, and year-end deletion revoke affected Student Sessions;
8. account suspension, role removal, password reset, and sign-out-all revoke Teacher Sessions;
9. revocation takes effect on the next protected request despite a still-valid JWT;
10. cookie flags and expiry match the approved production configuration;
11. CSRF and cross-origin mutation attempts fail;
12. confirmed learning survives expiration without duplicate submission;
13. Teacher Preview cannot outlive or replace the Teacher Session;
14. warnings do not extend absolute lifetime or expose protected information;
15. recent authentication is enforced for the approved sensitive actions;
16. credentials and protected identity data are absent from logs, analytics, URLs, and browser persistence.

## Reconsideration Triggers

Revisit this decision before requiring Teacher MFA universally, adding institutional SSO, enabling co-Teachers or organization tenancy, adopting offline Student work, changing the device-sharing model, materially changing Supabase plan capabilities, or receiving measured usability or security evidence that the approved limits are inappropriate.

## References

- NIST SP 800-63B session and reauthentication guidance
- Supabase Auth User Sessions documentation
- Supabase Auth server-side rendering guidance

## Resolution

This ADR resolves `OD-003` and supplies the initial Authentication Configuration Registry values. Environment verification MUST confirm that Supabase and Socrato enforcement together meet these limits before production.
