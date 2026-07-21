# ADR-0012 — PostgreSQL Physical Schema and RLS Boundary

> **Status:** Accepted  
> **Date:** 2026-07-19  
> **Decision Owners:** Architecture, Data, and Security  
> **Technical Specification References:** Sections 5, 10, 17, 18, 21, 22, 27, and 30; Appendix D; `OD-005`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Socrato stores application data in Supabase PostgreSQL. The database contains data with materially different exposure, retention, and operational requirements: application records, protected Student identity mappings, curriculum content, background-processing state, and security audit evidence.

The first production migration requires a stable physical schema layout, explicit ownership and grants, a defined Row-Level Security boundary, and a clear distinction between migration authority and runtime authority.

## Decision Drivers

- deny browser access to protected tables by default;
- isolate Student identity and credential material;
- keep authorization enforceable at both the application and database boundaries;
- prevent normal application failures from mutating audit evidence;
- give background processing only the permissions it requires;
- support generated types and migrations without exposing internal schemas;
- remain compatible with Supabase Auth, PostgreSQL, backups, and managed operations;
- avoid unnecessary infrastructure for the initial scale of approximately 250 registered Students.

## Considered Options

### Option 1 — Store all application tables in `public`

Rejected. This is simple initially but makes accidental Data API exposure, broad grants, generated-type leakage, and responsibility boundaries harder to control.

### Option 2 — Use `app` for all product data and rely only on RLS

Rejected. RLS remains important defense in depth, but one schema does not adequately isolate credentials, identity mappings, operational state, and audit evidence.

### Option 3 — Use responsibility-specific schemas with explicit runtime roles

Accepted. This provides clear ownership and exposure boundaries while remaining a single PostgreSQL database.

## Decision

### Physical Schemas

Socrato MUST use the following physical schemas:

| Schema | Purpose | Data API exposure |
|---|---|---|
| `app` | Primary product and learning records | Not exposed initially |
| `private` | Student identity mappings, Student Access Code representations, sessions, and restricted security data | Never exposed |
| `content` | Curriculum, instructional resources, rights metadata, Historical Documents, and question-bank records | Not exposed initially |
| `operations` | Jobs, leases, idempotency records, outbox events, AI-operation metadata, usage, and runtime configuration | Never exposed |
| `audit` | Append-only security, administrative, privacy, and safety Audit Events | Never exposed |

The PostgreSQL `public` schema MUST contain no Socrato application tables, views, functions, sequences, or application-owned types. Creation privileges on `public` MUST be revoked from `PUBLIC` and from every runtime role.

Provider-managed schemas, including Supabase `auth`, `storage`, `extensions`, and platform-internal schemas, remain provider-owned and MUST NOT be modified except through supported provider mechanisms.

### Access Boundary

The initial product MUST NOT expose application tables through the Supabase Data API to browsers. Browsers access protected data only through authenticated Socrato server endpoints.

If direct browser database access is proposed later, it requires a superseding or additional ADR, explicit exposed-schema configuration, a complete RLS review, and adversarial authorization tests before enablement.

### Database Roles

At minimum, production MUST distinguish these responsibilities:

| Role class | Required authority |
|---|---|
| Migration owner | Owns Socrato schemas and migrations; unavailable to normal runtime code |
| Application runtime | Performs approved synchronous product operations with least privilege |
| Background worker | Performs approved job, outbox, deletion, and reconciliation operations |
| Audit writer | Appends approved Audit Events; cannot update or delete them |
| Read-only operations | Reads explicitly approved operational views without protected payload access |

Concrete role names MAY vary by environment, but the responsibility boundaries and grants MUST remain equivalent.

The Supabase service-role credential MUST NOT be used as the ordinary application database identity. Where a provider operation requires it, usage MUST be confined to a reviewed server-only adapter with the narrowest possible operation surface.

### Ownership and Grants

- Only the migration owner MAY own Socrato schemas or objects.
- Runtime roles MUST NOT own tables, schemas, policies, functions, triggers, or types.
- All schema and table privileges MUST be explicitly granted; reliance on implicit `PUBLIC` privileges is prohibited.
- Runtime roles receive only the required `USAGE`, `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and sequence privileges for approved workflows.
- The application runtime MUST NOT read Student Access Code verification material except through the credential-verification operation.
- The application runtime MAY decrypt Student names only after Teacher authorization and only through the approved identity service boundary.
- The background worker MUST NOT obtain interactive Teacher capabilities.
- Audit consumers MUST receive approved projections, not unrestricted access to sensitive event payloads.

Default privileges MUST be configured so that newly created objects do not silently become available to runtime roles.

### Row-Level Security

RLS MUST be enabled and forced on every tenant-, Teacher-, Group-, Student-, Practice-, Learning Session-, and Student-specific table where row ownership or scope exists.

RLS is defense in depth and MUST NOT replace server-side authorization. Server handlers MUST authorize every operation before issuing a database query.

Policies MUST:

- use stable identifiers rather than display names;
- enforce Teacher ownership and Group membership boundaries;
- distinguish Student, Teacher, Teacher Preview, worker, and administrative contexts;
- deny access when authorization context is absent or ambiguous;
- prevent Teacher Preview from creating retained Student learning evidence;
- prevent cross-Group and cross-Teacher access;
- be covered by positive and negative integration tests.

Tables that are intentionally reachable only by a narrowly privileged server role MUST still receive explicit grants and appropriate RLS or an ADR-documented justification when RLS cannot provide meaningful protection.

### Functions and Views

Database functions use `SECURITY INVOKER` by default. A `SECURITY DEFINER` function requires documented justification, an immutable safe `search_path`, fully qualified object names, explicit execute grants, input validation, and security tests.

Views MUST use the invoker's permissions where supported. Materialized views and reporting projections MUST NOT copy protected identity or raw conversation data unless separately approved.

Cross-schema access MUST occur through reviewed server queries, approved views, or narrowly scoped functions. It MUST NOT be enabled through broad schema grants.

### Migrations and Generated Types

- All schema changes MUST be represented by ordered, reviewable migrations.
- Production migrations MUST run with the migration identity, never with a browser or normal runtime identity.
- Migrations MUST set explicit schema names and MUST NOT depend on an ambient `search_path`.
- Destructive or privilege-expanding migrations require rollback or forward-recovery instructions.
- Generated application database types MUST include only the schemas intentionally consumed by application code.
- Types generated from `private`, `operations`, or `audit` MUST remain server-only and MUST NOT enter browser bundles.
- Schema drift checks MUST compare migrations with each deployed environment.

### Storage References

PostgreSQL stores authorized metadata and private object references. Binary files remain in approved private Supabase Storage buckets. Storage authorization MUST follow the same Teacher, Group, Student, and content-rights boundaries; possession of an object path is not authorization.

## Consequences

### Positive

- accidental browser and Data API exposure is reduced;
- sensitive identity, credential, operational, and audit domains are physically distinguishable;
- grants and generated types can be reviewed by responsibility;
- runtime compromise has a narrower database impact;
- future audits and migrations have stable boundaries.

### Negative

- migrations and local setup require explicit schema qualification and grants;
- cross-schema queries and generated types require additional discipline;
- test environments must reproduce roles, grants, and RLS rather than using an all-powerful owner connection;
- some provider tooling may require schema-specific configuration.

## Privacy Impact

Student names and credential representations remain in the unexposed `private` schema. Raw tutoring conversations remain temporary and are not copied into reporting, audit, or analytics schemas. Schema separation does not authorize additional collection or retention.

## Security Impact

The decision reduces reliance on a single broad provider credential. It establishes least-privilege runtime roles, explicit grants, forced RLS where appropriate, restricted audit mutation, and controls for privileged database functions.

## Operational Impact

Environment provisioning must create equivalent schemas, roles, default privileges, policies, and verification tests. Backup and restoration procedures must preserve the entire relational dependency graph while reapplying expired-data deletion and credential revocation requirements after restoration.

## Validation

The decision is verified when automated checks demonstrate that:

1. `public` contains no Socrato-owned application objects and has no runtime creation grants;
2. exposed Data API schemas do not include `app`, `private`, `content`, `operations`, or `audit` in the initial release;
3. browser credentials cannot directly select from any Socrato table;
4. runtime roles cannot create, alter, drop, grant, or own database objects;
5. unauthorized Teacher, Student, Preview, and cross-Group access is denied;
6. the application role cannot update or delete append-only Audit Events;
7. the worker can perform only approved job and reconciliation workflows;
8. server-only generated types do not appear in client bundles;
9. privileged functions pass `search_path`, grant, and authorization review;
10. migration drift and privilege snapshots match the approved environment baseline.

## Reconsideration Triggers

This decision MUST be revisited before:

- enabling direct browser access through Supabase Data API;
- introducing institutional multi-tenancy or co-Teacher authorization;
- adding a separate analytics warehouse or database;
- introducing a new database provider or extended dual-write design;
- granting external reporting tools database access;
- changing the application runtime to use a role that bypasses RLS.

## Resolution

This ADR resolves `OD-005`. The first production migration MUST implement this layout and its grant model before application tables are created.
