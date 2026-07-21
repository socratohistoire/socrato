# ADR-0015 — Private Historical Document Upload and Delivery

> **Status:** Accepted  
> **Date:** 2026-07-20  
> **Decision Owners:** Content, Security, Privacy, and Platform  
> **Technical Specification References:** Sections 16, 17, 18, 21, 22, and Appendix H; `OD-026`  
> **Supersedes:** None  
> **Superseded By:** None

## Context

Historical Documents require verified provenance, rights, accessibility metadata, private storage, technical inspection, and controlled publication. Pilot Teachers do not upload Documents.

## Decision

Only Content Administrators may upload during the pilot. Required metadata includes title, description, source, rights holder, source URL, date or period, rights, verification status, alt text, Historical Period, Notion, one or more Historical Knowledge targets, and one or more possible Intellectual Operations.

Accept JPG/JPEG, PNG, WebP, and PDF where necessary. Use lifecycle `draft` → `uploaded` → `technical_review` → `rights_review` → `approved` → `published`. Validate and inspect files, store them privately, authorize every access, and archive rather than silently remove a Document that is referenced by historical Practice records.

The approved HTTP contract is:

- `POST /api/admin/historical-documents/uploads` prepares the upload and returns a secure temporary URL;
- `PUT [temporary URL]` uploads directly to private storage;
- `POST /api/admin/historical-documents` finalizes the record and metadata;
- `GET /api/admin/historical-documents` lists and filters the bank;
- `GET /api/admin/historical-documents/{documentId}` retrieves one record;
- `PATCH /api/admin/historical-documents/{documentId}` changes metadata and associations;
- `DELETE /api/admin/historical-documents/{documentId}` archives without immediate permanent deletion;
- `POST /api/admin/historical-documents/{documentId}/download-url` returns a temporary viewing URL.

Administration endpoints are restricted to authorized Content Administrators. Storage is private with no permanent public URL. Each file is limited to 25 MB and must be PDF, JPEG, PNG, or WebP. Type, size, integrity, antivirus status, source, and rights MUST be validated before publication, and an unvalidated file MUST NOT be used in a Practice. Upload, modification, and archival MUST be logged. Students may access only Documents associated with their authorized Practice through a temporary URL. Upload failure MUST create no incomplete record. Resumable interrupted upload is deferred until after the pilot.

Questions and Documents have a many-to-many relationship. A Question may use no Document and remains a valid Knowledge Question.

## Consequences

- Teacher upload is deferred.
- Published delivery uses authorized application endpoints and private asset references.
- Rights, provenance, accessibility, processing, and version metadata remain traceable.

## Resolution

This ADR and its approved HTTP contract resolve `OD-026` on 2026-07-20.
