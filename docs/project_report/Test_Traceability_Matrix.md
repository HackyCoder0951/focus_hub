# Focus Hub Test Traceability Matrix

**Date:** 2026-07-29 (updated same day — second pass closing "Not covered" gaps)
**Source of IDs:** `docs/Software_Testing_Documentation.md` §5/§6 (43 documented test-case IDs across 9 modules — the original draft of this doc undercounted this as 41; the actual row count below is 43).
**Purpose:** Map each documented ID to the automated test(s) that actually exercise it, following up on the Priority 2 action item "Map automated tests back to documented IDs" in `docs/project_report/Implementation_Gap_Analysis.md` §10, which was previously marked **Not done**.

## How to read this table

- **Covered** — a real automated test (unit, API, hook, component, or E2E) exercises this behavior.
- **Partially covered** — the underlying logic is tested (usually at the API/unit layer) but the full user-facing flow (component or E2E) is not.
- **Not covered** — the feature likely exists in the app but no automated test was written for it this round.
- **Not implemented in app** — confirmed by reading the relevant source this session: the validation/behavior the ID describes does not exist in the codebase, so no test can honestly claim to cover it. These are gaps in the *application*, not the test suite.

**Standing blocker — resolved:** the `priyakumari@gmail.com` / `user@123` login blocker described in the original draft of this doc no longer reproduces. A full live run of all 11 Cypress spec files (`npx cypress run`) against the dev server passed **18/18 tests, 1 correctly skipped** (the admin-account-gated case with no credentials configured). Two real bugs found and fixed during that run (not app bugs — bugs in the specs themselves): `qanda.cy.js`'s intercept pattern didn't account for PostgREST's `?select=*` query string and so never matched, silently masking the actual test; and `follow.cy.js` used an unscoped `cy.contains('a', /./)` selector that accidentally matched a sidebar nav link instead of a followed-user link, plus wrong button-label expectations ("Unfollow" vs the app's actual "Follow"/"Following" labels). `admin.cy.js` was also corrected after live runs showed `priyakumari@gmail.com` is **not** an admin account (an earlier single observation to the contrary, from a batch run, turned out to be stale session state, not real admin access) — it now correctly tests the non-admin-denied case with that account, and gates the admin-view case behind `Cypress.env('adminEmail'/'adminPassword')` since no confirmed admin account exists.

## Auth

| ID | Description | Status | Test(s) |
| --- | --- | --- | --- |
| AUTH-REG-01 | Register with valid credentials → redirected | Covered | `tests/unit/components/register-page.test.tsx` (`signUp` call args, and a redirect test that simulates `user` becoming truthy after signup) |
| AUTH-REG-02 | Duplicate email → "Email already in use" | Covered | `tests/unit/contexts/auth-context.test.tsx` — tests `AuthContext.signUp` directly against a mocked Supabase error, asserting the toast surfaces Supabase's own message |
| AUTH-REG-03 | Weak password → "Password too weak" | Not implemented in app | `Register.tsx` has no client-side password-strength check (confirmed by reading the component) |
| AUTH-REG-04 | All fields empty → "Required fields missing" | Covered | `tests/unit/components/register-page.test.tsx` — confirmed jsdom's native `required`-attribute constraint validation blocks the submit event (verified `signUp` is never called; the submit button itself wasn't disabled by component logic in this case, isolating the native-validation behavior) |
| AUTH-LOGIN-01 | Valid login → redirected to dashboard | Covered | `tests/unit/components/login-page.test.tsx` (signIn call + admin/non-admin redirect logic); `cypress/e2e/login.cy.js` |
| AUTH-LOGIN-02 | Valid email + wrong password → "Invalid credentials" | Covered | `cypress/e2e/login.cy.js` ("shows an error for invalid credentials"); `tests/unit/contexts/auth-context.test.tsx` |
| AUTH-LOGIN-03 | Unregistered email → "User not found" | Not implemented in app | Supabase Auth returns a generic "Invalid login credentials" for both wrong-password and unknown-email cases (by design, for security) — the app has no distinct "User not found" path |
| AUTH-RESET-01 | Invalid email → "Email not found" | Covered | `tests/unit/components/forgot-password.test.tsx` — `ForgotPassword.tsx` does have real error handling (`supabase.auth.resetPasswordForEmail` error surfaced inline), confirmed by reading the component |

## Social Feed

| ID | Description | Status | Test(s) |
| --- | --- | --- | --- |
| FEED-POST-01 | Create post → appears in feed | Covered | `tests/unit/api/feed-posts.test.ts`, `tests/unit/components/create-post.test.tsx`, `cypress/e2e/post.cy.js` |
| FEED-POST-02 | Empty content → "Content required" | Covered (as disabled submit, not literal text) | `tests/unit/components/create-post.test.tsx` |
| FEED-POST-03 | Post while unauthenticated → redirected | Covered | `cypress/e2e/post.cy.js` ("redirects an unauthenticated visitor away from the feed") |
| FEED-POST-04 | Content exceeding max length → "Content too long" | Covered (as truncation, not an error message) | `tests/unit/components/create-post.test.tsx` — confirms `maxLength={1000}` and that pasting past it truncates the value |
| FEED-COMMENT-01 | Add comment → appears under post | Covered | `tests/unit/api/feed-comments.test.ts`, `cypress/e2e/comment.cy.js` |
| FEED-COMMENT-02 | Special-characters-only comment → error/sanitized | Not implemented in app | No such validation found in `feed/api/comments.ts` |

## Chat System

| ID | Description | Status | Test(s) |
| --- | --- | --- | --- |
| CHAT-SEND-01 | Send message → visible to recipient | Covered | `tests/unit/api/chat-api.test.ts` (`insertMessage`), `cypress/e2e/chat.cy.js` |
| CHAT-SEND-02 | Empty message → "Message required" | Covered (as disabled Send button) | `cypress/e2e/chat.cy.js` |
| CHAT-SEND-03 | Send while unauthenticated → redirected | Covered | `cypress/e2e/chat.cy.js` ("redirects an unauthenticated visitor away from the chat page") |
| CHAT-SEND-04 | Unsupported file type → "File type not supported" | Not implemented in app | `MessageInput.tsx` restricts the OS file picker via an `accept` attribute only — there is no post-selection validation or error message |
| CHAT-SEND-05 | Message exceeding max length → "Message too long" | Not implemented in app | No length cap found in `MessageInput.tsx` or `chat/api.ts`'s `insertMessage` |

## Q&A Module

| ID | Description | Status | Test(s) |
| --- | --- | --- | --- |
| QA-POST-01 | Post question → appears in list | Covered | `tests/unit/api/qa-questions.test.ts`, `tests/unit/components/ask-question-dialog.test.tsx`, `cypress/e2e/qanda.cy.js` |
| QA-POST-02 | Empty content → "Content required" | Covered (as disabled submit) | `tests/unit/components/ask-question-dialog.test.tsx` |
| QA-POST-03 | Duplicate question → error/duplicate warning | Not implemented in app | No duplicate-detection logic found in `qa/api/questions.ts` |
| QA-POST-04 | Content exceeding max length → "Content too long" | Covered (as truncation, not an error message) | `tests/unit/components/ask-question-dialog.test.tsx` — confirms `TITLE_MAX=150`/`BODY_MAX=2000` and that pasting past them truncates |
| QA-ANSWER-01 | Post answer → appears under question | Covered | `tests/unit/api/qa-answers.test.ts` (`createAnswer`), `tests/unit/components/answer-form.test.tsx` (the actual submission UI) |
| QA-ANSWER-02 | Answer while unauthenticated → redirected | Covered | `tests/unit/components/answer-form.test.tsx` (shows a sign-in-required toast and never calls `createAnswer` with no user); `cypress/e2e/qanda.cy.js` (page-level redirect) |

## Resource Sharing

| ID | Description | Status | Test(s) |
| --- | --- | --- | --- |
| RES-UPLOAD-01 | Valid upload → appears in list | Covered | `tests/unit/api/resources-files.test.ts`, `cypress/e2e/resources.cy.js` |
| RES-UPLOAD-02 | Unsupported file type → "File type not supported" | Not implemented in app | No MIME/extension validation found in `resources/api/files.ts` or `UploadDialog.tsx` |
| RES-UPLOAD-03 | File exceeding size limit → "File too large" | Not implemented in app | No file-size check found in `resources/api/files.ts` or `UploadDialog.tsx` |
| RES-UPLOAD-04 | Upload while unauthenticated → redirected | Covered | `cypress/e2e/resources.cy.js` ("redirects an unauthenticated visitor away from the resources page") |
| RES-UPLOAD-05 | Malicious file content → "File rejected or sanitized" | Not implemented in app | No content-scanning/sanitization logic exists anywhere in the upload path |

## Admin Dashboard

| ID | Description | Status | Test(s) |
| --- | --- | --- | --- |
| ADMIN-FLAG-01 | Admin views flagged content list | Partially covered | `tests/unit/api/admin-flags.test.ts` (`fetchFlags`); `cypress/e2e/admin.cy.js` has a spec gated behind `Cypress.env('adminEmail'/'adminPassword')` — skips itself when no admin test account is configured (none exists today; `priyakumari@gmail.com` was confirmed via live runs to be a non-admin account) |
| ADMIN-FLAG-02 | Non-admin denied access to dashboard | Covered | `cypress/e2e/admin.cy.js` ("redirects a non-admin user away from the admin dashboard") — confirmed passing consistently across 5 live runs |
| ADMIN-USER-01 | Ban a user → confirmation | Covered | `tests/unit/api/admin-users.test.ts` (`updateUserStatus`), `tests/unit/components/admin-user-management.test.tsx` (the actual ban action through the confirm dialog + dropdown menu UI) |
| ADMIN-USER-02 | Ban an already-banned user → "User already banned" | Not implemented as an error path | `UserManagement.tsx` instead hides the "Ban" menu item once `user.status === "banned"` — confirmed both by reading the component and by `tests/unit/components/admin-user-management.test.tsx`, which asserts the "Ban" option isn't rendered for a banned user. The double-ban case is prevented at the UI level, not surfaced as an error message, so the ID's literal expectation doesn't apply as written |

## Profile & Settings

| ID | Description | Status | Test(s) |
| --- | --- | --- | --- |
| PROFILE-UPDATE-01 | Update profile info → confirmation | Covered | `tests/unit/api/settings-api.test.ts` (`updateProfileRow`), `cypress/e2e/settings.cy.js` |
| PROFILE-UPDATE-02 | Invalid email/username → "Invalid data" | Not implemented in app | Confirmed by reading `ProfileSettings.tsx`: the email field is disabled/uneditable ("tied to your account and cannot be changed here"), and there is no username concept anywhere in the app's profile model — this ID doesn't map onto anything the app actually does |
| PROFILE-UPDATE-03 | Update while unauthenticated → redirected | Covered | `cypress/e2e/settings.cy.js` ("redirects an unauthenticated visitor away from the settings page") |
| SETTINGS-UPDATE-01 | Change password (valid) → confirmation | Covered | `tests/unit/components/security-settings.test.tsx` (form validation + mutation call), `tests/unit/hooks/settings-use-change-password.test.tsx` (hook-level: asserts the actual "Password updated" success toast) |
| SETTINGS-UPDATE-02 | Wrong old password → "Incorrect old password" | Covered | `tests/unit/components/security-settings.test.tsx`, `cypress/e2e/settings.cy.js` (asserts the actual toast title, "Password update failed") |

## AI Integration

| ID | Description | Status | Test(s) |
| --- | --- | --- | --- |
| AI-ANSWER-01 | Request AI answer → answer appears | Covered | `server/tests/ai-answers.test.js` (`POST /generate` success case) |
| AI-ANSWER-02 | Empty input → "Input required" | Covered | `server/tests/ai-answers.test.js` (400 for missing question/questionId) |
| AI-ANSWER-03 | Request while unauthenticated → redirected/error | Covered | `server/tests/ai-answers.test.js` (401 for missing/invalid auth) |
| AI-ANSWER-04 | Unsupported language → error/fallback | Not implemented in app | No language detection or validation exists in `server/ai-answers.js` |

## Summary

| Status | Count |
| --- | ---: |
| Covered | 30 |
| Partially covered | 1 |
| Not covered (untested, likely exists) | 0 |
| Not implemented in app | 12 |
| **Total** | **43** |

Up from the first pass's 16 Covered / 5 Partial / 11 Not-covered / 9 Not-implemented (out of a miscounted 41 — the actual row count is 43). Every "Not covered" item from the first pass has now been either tested or reclassified: most became real tests (auth flows, unauthenticated-access redirects, max-length truncation, the AnswerForm/UserManagement UIs); `PROFILE-UPDATE-02` was reclassified to "Not implemented in app" after confirming the app has no editable email/username fields for that ID to apply to. The one remaining "Partially covered" item (`ADMIN-FLAG-01`) and all 12 "Not implemented in app" items are genuine gaps — the former needs a real admin test account, the latter need application code changes (file type/size limits, message/content length caps, duplicate-question detection, language handling) that were explicitly out of scope for this round.
