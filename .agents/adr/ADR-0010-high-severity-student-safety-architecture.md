# ADR-0010 — High-Severity Student Safety Architecture

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Decision Owners:** Student Safety, Security, Privacy, and Product  
> **Technical Specification References:** Sections 13, 19, 21, 23, 25, and 26; `ADR-0007`; `ADR-0008`; `ADR-0009`; `ADR-0011`; `OD-008`; `OD-011`; `OD-012`; `OD-013`; `OD-014`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Socrato uses exactly one exceptional high-severity emergency level. Routine tutoring, mistakes, frustration, ordinary personal-information sharing, off-topic language, and normal classroom concerns do not create Teacher alerts.

When the approved threshold is confirmed, the system requires a deterministic recipient route. A model may not choose recipients, and Socrato may not assume that an arbitrary school employee is authorized. The product therefore needs a stable role-based routing model that each participating school configures and approves before activation.

## Decision Drivers

- one clear accountable primary recipient;
- a verified fallback when the primary is unavailable;
- no recipient names or addresses hard-coded in application code;
- Group-level authorization and minimum disclosure;
- no arbitrary escalation outside the school-approved route;
- delivery and acknowledgement evidence without full transcripts;
- no claim of continuous human monitoring;
- safe disablement when configuration is incomplete;
- compatibility with Teacher changes and school-year rollover.

## Considered Options

1. **Teacher only — rejected.** It has no safe route for absence, leave, delivery failure, or conflict.
2. **School administration only — not selected as default.** It may bypass the adult who knows the Group and Student context best.
3. **Automatic parent or emergency-service contact — rejected.** Socrato lacks authority, verified contact context, and real-time emergency-service capability.
4. **Responsible Teacher followed by a school-designated replacement adult — accepted.**

## Decision

### Approved High-Severity Categories

The production policy recognizes exactly four high-severity reason codes:

| Reason code | Approved category |
|---|---|
| `IMMINENT_SELF_HARM` | Explicit intent to die by suicide or seriously harm oneself where present or imminent danger is indicated. |
| `IMMINENT_HARM_TO_OTHER` | A credible present or imminent threat to kill or seriously injure another person. |
| `IMMEDIATE_WEAPON_DANGER` | Present or imminent danger involving access to, possession of, use of, or a credible threat with a weapon. |
| `IMMEDIATE_ABUSE_DANGER` | Disclosure of current physical or sexual abuse where the Student or another identifiable minor appears to face immediate serious danger. |

Alert creation requires every minimum threshold element:

1. an explicit statement or contextually unambiguous indicators;
2. present or imminent timing;
3. an identifiable person who may be in serious danger, without asking the Student for additional identifying information;
4. at least one approved reason code;
5. deterministic server validation after contextual model assessment.

Missing any element prevents event creation. When appropriate, the tutor may provide a proportionate supportive response or ask one brief non-leading clarification, but no lower alert level exists.

Historical or fictional material, general distress, frustration, anger, jokes, figurative language, isolated violent wording, non-imminent bullying, clearly ended situations, and classifier uncertainty do not independently satisfy the threshold.

This threshold controls Socrato's automated product behavior only. It does not replace, narrow, or determine legal or professional reporting duties applicable to school personnel or organizations.

### Approved French Student Response

After a confirmed event, ordinary tutoring stops and the interface renders this versioned canonical `fr-CA` response before any other content:

> Ce que tu viens d’écrire peut indiquer un danger grave. Ta sécurité passe avant la révision.
>
> Va immédiatement voir un adulte de confiance qui se trouve près de toi. Si toi ou une autre personne êtes en danger maintenant, appelle le 911 ou demande à un adulte de le faire.
>
> Socrato n’est pas un service d’urgence et personne ne surveille cette conversation en continu. Une alerte limitée sera transmise à l’adulte responsable désigné par ton école, mais n’attends pas sa réponse pour chercher de l’aide.

The message remains visible until deliberate navigation away from the safety view and remains available when notification delivery fails. It is application-owned content and MUST NOT be freely rewritten by the AI model.

### Approved Québec Resources

Every confirmed immediate-danger event displays `911` as the primary action labelled `Appeler le 911`. Info-Social `811`, option 2, is supplemental psychosocial support. For suicide or serious self-harm, the view additionally displays:

- `1 866 APPELLE` (`1 866 277-3553`);
- text `535353`;
- `suicide.ca`.

Telephone destinations are accessible and click-to-call on supported devices. Resources are stored in versioned server-owned jurisdiction configuration with provenance, effective date, verification dates, owner, and approval status. They are verified before every school year. Expired or unverified jurisdiction configuration blocks activation and MUST NOT be silently replaced by model-generated resource information.

### Canonical Recipient Chain

For each active Group, the approved routing order is:

```text
Responsible Teacher for the Group
  -> School-designated replacement adult
```

The primary recipient is the currently authorized responsible Teacher assigned to the Group.

The secondary recipient is an adult role explicitly designated by the participating school, such as an authorized administrator or designated Student-support professional. Socrato does not select the person's organizational title automatically.

### Role-Based Configuration

Recipient configuration MUST use stable internal account and role assignments, not names, email addresses, phone numbers, or arbitrary destinations embedded in source code, prompts, job payloads, or client requests.

Each participating school MUST approve and configure:

- primary responsible Teacher for every enabled Group;
- one active school-designated replacement adult;
- permitted operating hours and after-hours behavior;
- who may acknowledge, handle, and close the restricted event;
- who owns configuration review and correction;
- the secure delivery channels approved under `OD-013`.

The model, Student, browser, Teacher-editable request body, and Historical Document content MUST NOT select or modify recipients.

### Activation Gate

The safety-alert capability MUST remain disabled for a school or Group until:

- the school has approved the route;
- both primary and secondary recipient accounts are active and individually authenticated;
- recipient roles and Group scope are valid;
- required contact or delivery destinations are verified;
- a test notification has completed successfully;
- operating-hours and fallback behavior are recorded;
- recipients have received the workflow and limitation documentation;
- configuration has an owner and next-review date.

An incomplete route is a release or enablement blocker, not a reason to send to a generic administrator or developer.

### Primary Routing

Only a server-confirmed `HIGH_SEVERITY_EMERGENCY` may create the restricted event and initiate routing.

The system MUST first route to the responsible Teacher when that Teacher remains:

- active;
- authorized for the Group and Student relationship;
- eligible under the school's approved safety role;
- reachable through the configured channel;
- not excluded by a recorded conflict or unavailability state.

The initial notification contains no full conversation and directs the Teacher to authenticate in Socrato for the minimum restricted context.

### Secondary Routing

The school-designated replacement adult becomes the active fallback when:

- primary delivery fails;
- the Teacher account or Group assignment is inactive;
- the Teacher is marked unavailable under the approved procedure;
- an acknowledgement deadline defined by `OD-013` expires;
- a conflict rule prevents routing to the Teacher;
- the school configuration explicitly defines direct secondary routing for the current operating period.

Fallback MUST be automatic according to configured state and MUST NOT wait for an AI model decision.

The system MUST NOT fall back to an arbitrary Platform Administrator, developer, support agent, other Teacher, parent, police service, emergency service, personal contact, or organization-wide mailing list.

### Conflict and Unavailability

The routing configuration MUST support temporary Teacher unavailability and conflict-safe fallback without recording sensitive reasons in broad operational metadata.

If the responsible Teacher is the subject of the Student's safety concern, is not authorized to receive the event, or cannot safely receive it under school policy, routing MUST bypass the Teacher and use the verified replacement adult.

Socrato does not determine whether an adult is safe through AI inference. Conflict and availability states come only from approved school configuration or authorized human action.

### Delivery Content

The external notification MUST contain only:

- statement that an exceptional Socrato safety event requires prompt review;
- school and Group routing reference as necessary;
- pseudonymous Student or restricted roster-lookup reference;
- event timestamp;
- secure authenticated link;
- delivery or acknowledgement instructions.

It MUST NOT contain the full conversation, Student Access Code, full name unless separately necessary and approved inside the authenticated application, AI reasoning, model confidence, diagnosis, disciplinary recommendation, or unrelated learning history.

### Delivery Channel and Acknowledgement

The authoritative event exists only in Socrato's restricted in-application safety inbox. A simultaneous transactional email acts only as a minimum-content attention signal and contains:

```text
Subject: Action requise dans Socrato

Une situation exceptionnelle nécessite une vérification rapide dans Socrato.

Connectez-vous à votre espace sécurisé pour consulter l’alerte.

Ce message ne contient aucune information détaillée sur l’élève.

[Ouvrir Socrato]
```

The link leads through ordinary authentication to the authorized restricted inbox and contains no Student identifier, event identifier, category, access code, bearer credential, or sensitive query parameter.

The primary recipient has 10 minutes by default to authenticate and select `J’ai pris connaissance de cette alerte`. Definitive primary delivery failure or deadline expiry activates the replacement adult immediately. The secondary recipient then has 10 additional minutes. Secondary failure or expiry creates `critical_delivery_failure`; no third recipient is invented.

`Intervention prise en charge` is a separate authenticated action. Dispatch, provider acceptance, acknowledgement, operational takeover, and final resolution remain distinct audited facts.

Transient email failure permits at most three controlled idempotent attempts. Definitive rejection, invalid destination, inactive account, or authorization failure bypasses further primary retries and initiates fallback. SMS, consumer messaging, direct parent contact, and automatic emergency-service contact are excluded from the initial release.

### Restricted Application View

After authentication, an authorized recipient MAY access only the minimum approved event record for the Student relationship and purpose. The view MUST enforce recent authentication where required, Group and role authorization, no-store caching, access logging, and automatic session expiration.

The event record remains separate from ordinary Teacher dashboards, Progress, reports, exports, analytics, and conversation history.

### Retention and Deletion

The approved schedule is:

| Record category | Retention deadline |
|---|---|
| `NO_EMERGENCY` assessment | No durable Student-linked retention |
| Dismissed or false-positive unconfirmed candidate | Within 24 hours of disposition |
| Complete ordinary conversation | Under `ADR-0009`, without extension for a safety event |
| Minimum necessary confirmed-event excerpt | 30 days after closure |
| Structured Emergency Alert | 12 months after closure |
| Dispatch, failure, retry, fallback, acknowledgement, handling, closure, and restricted access evidence | 12 months after closure |
| Backup copy after primary deletion | No ordinary access and final expiry within 35 days |

Events still open after 30 days require administrative review and must be closed or placed under a precisely scoped exceptional hold. A hold records its authority, purpose, owner, start date, covered categories, and a next review no later than 90 days. Inactivity, convenience, or model output cannot create a hold.

If a school requires longer official retention, it transfers a minimum structured report to its approved record system and applies its own legal and archival schedule there. Socrato does not become the official school record and does not silently lengthen its copy.

Deletion propagates through primary storage, indexes, caches, temporary files, replicas, provider artifacts, and backup expiry. Restoration reapplies deletion tombstones before access. Deletion evidence proves execution without preserving deleted content.

### Acknowledgement and Fallback State

The system MUST track distinct states:

```text
pending -> dispatched_primary -> delivered_primary -> acknowledged -> resolved
                           |-> primary_failed -> fallback_initiated
fallback_initiated -> dispatched_secondary -> delivered_secondary -> acknowledged -> resolved
                                      |-> secondary_failed -> critical_operational_failure
```

Dispatch, delivery, acknowledgement, handling, and resolution are different facts. Socrato MUST NOT mark an event acknowledged merely because an email or message was sent.

Exact delivery channel, retry interval, and acknowledgement deadline are finalized by `OD-013`.

### Failure of Both Recipients

Failure to deliver to both configured recipients is a critical operational failure.

The system MUST:

- keep the event unresolved;
- trigger the separately approved restricted operational failure channel;
- preserve minimum failure evidence;
- continue bounded idempotent recovery attempts as policy permits;
- never invent a new recipient;
- never tell the Student that an adult received the alert.

This architecture does not itself authorize external emergency dispatch.

### Student-Facing Behavior

The Student receives the approved calm supportive response and is encouraged to contact a trusted adult who is physically available and emergency services when immediate danger exists.

Socrato MUST state that it is not an emergency service and MUST NOT promise:

- continuous monitoring;
- immediate Teacher response;
- guaranteed delivery;
- guaranteed intervention;
- confidentiality from authorized safety handling.

The exact Québec French language and local resources are defined by the accepted `OD-012` amendment and remain subject to current resource verification.

### Configuration Lifecycle

Recipient configuration MUST be reviewed:

- before initial activation;
- before each school year;
- after Teacher or replacement-adult assignment changes;
- after account suspension, leave, or departure;
- after delivery failure or misdelivery;
- at a bounded periodic interval established by deployment policy.

Group creation or **Ajouter un élève** MUST NOT silently inherit an unverified recipient route. A Group may inherit only an active approved school configuration plus its currently assigned responsible Teacher, followed by validation.

Year-end Group closure MUST disable its route and revoke recipient access to new events. Retained event access follows `OD-014`.

### Testing and Exercises

Before activation, tests MUST use synthetic events and non-Student data to prove:

- correct responsible-Teacher resolution;
- automatic fallback to the designated replacement adult;
- bypass during recorded conflict or unavailability;
- rejection of stale, disabled, cross-school, and cross-Group recipients;
- no arbitrary recipient injection;
- minimum notification content;
- acknowledgement-state correctness;
- dual-delivery failure behavior;
- Preview isolation;
- audit and retention boundaries.

Production testing MUST NOT create a false event attached to a real Student.

### Auditability

Restricted Audit Events SHOULD record:

- route-configuration creation, change, verification, and expiry;
- synthetic test result;
- recipient resolution category;
- primary and secondary dispatch and delivery status;
- acknowledgement and resolution actor;
- rejected unauthorized access;
- fallback activation and failure;
- route disablement.

Audit evidence MUST use stable identifiers and action codes, not complete messages, conversation content, credentials, or broad personal details.

## Consequences

### Positive

- the Teacher closest to the Group receives the first alert;
- every enabled route has a school-approved fallback;
- staff changes do not require code or prompt changes;
- AI cannot broaden disclosure;
- incomplete configuration fails closed;
- the chain remains understandable and testable.

### Negative

- every school must designate and maintain a replacement adult;
- staff absences and Group changes require configuration updates;
- email-provider verification and synthetic delivery remain operational activation gates;
- Socrato cannot guarantee real-time adult intervention;
- dual-recipient failure still requires an external organizational procedure.

## Privacy Impact

Only two approved role-scoped recipients may receive routing access, and notifications contain minimum metadata plus a secure link. Safety records remain separate from learning analytics and ordinary Teacher access.

## Security Impact

Recipient selection is server-controlled, role-based, Group-scoped, recently verified, and audited. No address is accepted from AI output or client payloads. Cross-school, cross-Group, inactive, and stale assignments fail closed.

## Cost and Operational Impact

Each enabled school requires onboarding, route verification, periodic review, synthetic delivery tests, failure monitoring, deletion jobs, hold review, and restoration testing. Transactional-email and bounded retention costs remain subject to operational monitoring.

## Validation

The decision is verified when:

1. every enabled Group resolves exactly one responsible Teacher and one replacement adult;
2. missing or stale configuration prevents activation;
3. primary failure automatically uses only the approved secondary recipient;
4. conflict and unavailability bypass the Teacher without AI inference;
5. both-recipient failure becomes a critical unresolved operational state;
6. client and model attempts cannot inject recipients;
7. notification content contains no transcript, code, diagnosis, or AI reasoning;
8. recipients must authenticate before accessing restricted context;
9. every positive synthetic case maps to an approved reason code and satisfies all threshold elements;
10. historical, fictional, figurative, non-imminent, ended, and uncertain negative cases create no notification;
11. routine conversations and Teacher Preview create no notification;
12. synthetic tests verify routing without real Student data;
13. school-year and staffing changes force revalidation;
14. audit evidence contains no protected conversation content;
15. the exact approved `fr-CA` message renders before pedagogical content and remains visible after delivery failure;
16. `911` is the primary action for every positive event, with suicide-specific resources only where applicable;
17. phone, text, and external-link actions pass keyboard, screen-reader, mobile, zoom, and safe-link tests;
18. expired or unverified resource configuration blocks activation;
19. email contains only the approved minimum-content template and no sensitive URL parameter;
20. provider acceptance cannot acknowledge, take over, close, or resolve an event;
21. primary failure or 10-minute non-acknowledgement activates only the configured replacement adult;
22. secondary failure or the additional 10-minute deadline creates `critical_delivery_failure` without a third recipient;
23. retry and replay tests produce no duplicate logical recipient notification;
24. SMS and consumer messaging remain unavailable in the initial release;
25. `NO_EMERGENCY` assessments create no durable Student-linked record;
26. dismissed candidates expire within 24 hours and excerpts 30 days after closure;
27. structured event and restricted audit evidence expire 12 months after closure;
28. backup copies expire within 35 days and cannot reappear after restoration;
29. 30-day open-event review and 90-day hold-review controls prevent indefinite retention;
30. deletion evidence proves execution without preserving deleted content.

## Remaining Activation Gates

Production Student safety remains disabled until at least:

- each participating school approves and verifies its actual recipient assignments.

## Reconsideration Triggers

Revisit this decision before adding organization-wide safety teams, parents, direct-to-consumer use, 24/7 monitoring, emergency-service integration, co-Teacher routing, multi-school tenancy, or any automatic recipient not represented by the approved two-role chain.

## Resolution

This ADR resolves `OD-008`, `OD-011`, `OD-012`, `OD-013`, and `OD-014`: responsible Teacher first, school-designated replacement adult second, exactly four approved high-severity reason codes with a deterministic minimum threshold, a canonical French safety response with verified Québec resources, an authoritative in-application alert supported by minimum-content transactional email and authenticated acknowledgement, and bounded category-specific retention with verifiable deletion. Actual production activation remains blocked until each participating school approves and verifies its named role assignments and archival compatibility, current resource and email-provider verification is recorded, synthetic delivery and deletion succeed, and the approved safety evaluation suite passes.
