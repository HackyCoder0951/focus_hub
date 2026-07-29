# Security Data Classification and Recovery Plan

## Purpose

This document starts the data classification and backup planning requested in the first fortnight supervisor feedback. It identifies sensitive data, handling expectations, retention guidance, and recovery expectations for Focus Hub.

## Data Classification

| Data Category | Examples | Sensitivity | Handling Rule |
| --- | --- | --- | --- |
| Authentication data | Supabase user id, email, session token metadata | High | Store and validate through Supabase Auth only; never log access tokens. |
| Profile data | full name, avatar, bio, location, website, member type | Medium | Allow authenticated users to manage their own profile; protect updates with RLS. |
| Social content | posts, comments, likes, flags | Medium | Preserve ownership metadata; use soft delete where supported for moderation review. |
| Q&A content | questions, answers, votes, AI answers, feedback ratings | Medium | Keep author ids and timestamps for auditability. |
| Chat content | chats, members, messages, attachments | High | Restrict reads and writes to chat members only. |
| Resource files | uploaded documents, images, metadata, file URLs | High | Enforce storage policies, file-size limits, and ownership checks. |
| Admin/moderation data | user status, content flags, reports, role rows | High | Restrict to admin users and avoid exposing to ordinary users. |
| Operational data | logs, request ids, errors, performance data | Medium | Remove secrets and personal tokens before storing or sharing. |

## Security Baseline

- Authentication must remain Supabase-backed with session state managed through `AuthContext`.
- Admin-only views must remain behind role-aware protected routes.
- File upload paths should include the owning user id where practical.
- Storage buckets should enforce authenticated upload rules and read rules based on intended visibility.
- Server endpoints that mutate protected data must require bearer-token authentication.
- Environment secrets must stay outside source control and be configured through provider environments.

## Retention Guidance

| Data Type | Suggested Retention | Notes |
| --- | --- | --- |
| Active user profiles | Account lifetime | Delete or anonymize on account removal where required. |
| Posts and comments | Account lifetime or moderation policy | Soft-deleted content may be retained for moderation history. |
| Chat messages | Account/project policy | Treat as sensitive; avoid unnecessary exports. |
| Uploaded resources | Until user deletion or file deletion | Remove related storage objects when file rows are deleted. |
| AI answer metadata | Project policy | Keep model, token, and timing metadata for quality review. |
| Logs and diagnostics | 30-90 days | Avoid storing access tokens, passwords, or full sensitive payloads. |

## Backup and Restore Plan

- Take database schema and data backups before applying migrations to staging or production.
- Export or snapshot Supabase storage metadata and document bucket names before release windows.
- Test restore steps against an isolated Supabase project before production migration work.
- Keep migration order stable and document any manual SQL steps.
- Record rollback notes for releases that include database or storage changes.

## Integration-Day Checklist

- Confirm all migrations apply cleanly to a fresh or staging database.
- Confirm Supabase environment variables are set for the target environment.
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm test`.
- Run critical Cypress smoke flows when test credentials are available.
- Spot-check realtime behavior for chat, Q&A votes/comments, and feed updates.
- Verify RLS/storage policies for one positive and one negative access case.
- Capture any failed checks in the release notes or testing documentation.
