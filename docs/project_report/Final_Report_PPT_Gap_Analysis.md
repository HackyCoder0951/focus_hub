# Final Report & PPT vs. Current Implementation — Gap Analysis

## 1. Purpose and Scope

This document maps the two submission-level deliverables — `Kulkarni_Final_Report-28-08-2025.pdf` (111 pages, Chapters 1–12) and `Project PPT.pdf` (17 slides) — against the current state of the Focus Hub repository, including the unit tests and Cypress specs added in this session that are not yet committed (`tests/unit/components/`, `tests/unit/contexts/`, `tests/unit/hooks/`, `cypress/e2e/admin.cy.js`, `chat.cy.js`, `follow.cy.js`, `settings.cy.js`, `docs/project_report/Test_Traceability_Matrix.md`).

This is a companion to two existing documents and deliberately does not duplicate them:

- `docs/project_report/Implementation_Gap_Analysis.md` — maps the four **fortnightly progress reports** to the codebase.
- `docs/project_report/Test_Traceability_Matrix.md` — maps the 43 test-case IDs (which are verbatim the same test cases as Final Report Chapter 8 §8.5) to actual automated tests.

Where those two already cover a topic, this document references them rather than re-deriving the answer.

## 2. Flag First: Chapter 2 (Literature Survey) Does Not Belong to This Project

Chapter 2 of the Final Report consists entirely of abstracts about **post-quantum cryptography** — rank-metric codes, attribute-based encryption, PQC network instruments, X.509 certificates under PQC, lattice-based CP-ABE. None of this relates to an alumni-mentorship / generative-AI platform. This is not a code gap; it reads as content copy-pasted from an unrelated report (likely a cryptography-themed project) and left in place. Recommend either replacing Chapter 2 with literature actually relevant to alumni-mentorship platforms, generative AI in ed-tech, or Supabase/React architecture — or, at minimum, confirming with the reviewing faculty whether this was submitted in error before the final version is filed anywhere further.

## 3. Chapter-by-Chapter Alignment

| Chapter | Content | Alignment | Remark |
| --- | --- | --- | --- |
| 1. Introduction | Problem statement, key components (mentorship matching, placement hub, chat assistant, alumni profiles, analytics dashboard) | High | Matches the real feature set (feed, Q&A, chat, resources, admin) modulo the AI-specific framing being more ambitious than what's built (see §4). |
| 2. Literature Survey | Post-quantum cryptography papers | **Mismatch — not this project** | See §2. |
| 3. Methodology | Agile SDLC, existing/proposed problem, module breakdown (Auth, Social, Profile/Resources, Utility) | High | Matches `src/pages/`, `src/features/*` structure directly. |
| 4. SDLC | Maps SDLC phases to `docs/`, `supabase/migrations/`, `cypress/e2e/*.cy.js`, notes CI/CD gap (`.github/workflows/ci.yml` absent) and test debt as open risks | **Now partially stale, in a good way** | The chapter's own §4.2.5 said "No CI/CD manifests found" and §4.3.3 recommended adding `.github/workflows/ci.yml`. That gap is now closed: `.github/workflows/cicd.yml` exists (build → lint → typecheck → audit → unit tests → build → Cypress via Docker Compose → conditional Vercel deploy). The test-debt gap it flagged is also substantially closed — see `Test_Traceability_Matrix.md`. |
| 5. Requirements Analysis | User/module list, functional & non-functional requirements | **Mixed — see §4 below** | Several bullets are real, several are unimplemented SRS boilerplate. |
| 6. System Design | Architecture, component, DFD, ER, use-case diagrams | High | Diagrams (Supabase API layer, shadcn/ui components, React Router, TanStack Query, RLS) match the actual stack; sequence diagrams for login/register/feed/chat/resources correspond to real flows in `src/features/*`. |
| 7. UI Screenshots | Dashboard, resources, chat, admin dashboard, settings screens | High for what's shown | Screens genuinely exist and render as shown (dark theme, feed/Q&A/resources/chat sidebar, admin user management, settings tabs). One caveat: the Settings → Security screenshot shows a functioning-looking "Two-Factor Authentication" toggle — the toggle exists in the UI but is inert (see §4). |
| 8. Software Testing | 43 test-case IDs across 8 modules, traceability matrix, Cypress execution summary | **Stale, superseded** | See §5 — `Test_Traceability_Matrix.md` supersedes §8.7's execution summary with a much more current and more thorough result. |
| 9. Conclusion | Summary of outcomes | Informational, no gap to assess | — |
| 10. Future Enhancement | Mobile app, AI recommendations, gamification, video/audio chat, third-party integrations, advanced analytics, accessibility, localization, enhanced security (2FA), reliable notifications | Correctly scoped as future work | Matches the PPT's "Planned features: mobile app, video chat, AI feature upgrades" — consistent and honestly labeled as not-yet-built, unlike Chapter 5. |
| 11. Bibliography | Doc/reference links | N/A | — |
| 12. Publication Certificate + appendix certificates | Journal publication, NPTEL, conference, workshop certificates | N/A — administrative, not implementation-related | — |

## 4. Chapter 5 Requirements — Verified Against Code

Each bullet below was checked with a repo grep first, then the relevant file was read to confirm before marking "Not implemented" — the same standard `Test_Traceability_Matrix.md` used for its "Not implemented in app" category.

### 5.2 Functional Requirements

| Requirement (as stated in report) | Status | Evidence |
| --- | --- | --- |
| Post creation/edit/delete, real-time comments, like/dislike | Implemented | `src/features/feed/hooks/usePosts.ts`, `useComments.ts`, `api/likes.ts` |
| Media upload (images, videos) in feed | Implemented | `src/features/feed/components/PostMedia.tsx` |
| Post sharing and bookmarking | **Not implemented** | No `bookmark` reference anywhere in `src/`; "sharing" only exists as the Web Share API button on `PostActions.tsx`, not a bookmark/save-for-later feature |
| Hashtag support and trending topics | **Not implemented for feed** | The only "trending" hit is Q&A tag sorting (`useQuestions.ts`) and an admin stats card label — there is no hashtag parser or trending-topics feature in the Social Feed module the requirement describes |
| Q&A: post/answer, AI-powered answers (Groq/Llama3), voting, accept best answer, search/filter | Implemented | `src/features/qa/*`, `src/pages/QandA.tsx`, `server/ai-answers.js` |
| Chat: real-time messaging, group chat creation, file sharing, message history/search, online/offline status, notifications | Implemented | `src/features/chat/components/CreateChatDialog.tsx`, `GroupInfoDialog.tsx`, `hooks/useChatPresence.ts` (presence/online-offline is real, not mocked) |
| Resources: upload with progress, categorization/tagging, search/filter, download tracking, **version control**, access control | **Partially implemented** | Upload, tagging, search, and per-file access control exist (`src/features/resources/*`); no version-control concept was found (`grep -c version` returns 0 across every file in the module) — download tracking exists only as UI affordances in `FileCard.tsx`/`FileListRow.tsx`, not an analytics ledger |
| Admin: user management/moderation, content moderation, analytics/reporting, system configuration, **backup and restore**, performance monitoring | **Partially implemented** | User management, flagged-content moderation, and analytics charts are real (`src/features/admin/components/{ReportsTab,FlaggedContent,AnalyticsCharts}.tsx`, `hooks/useAdminAnalytics.ts`); no backup/restore functionality exists anywhere in `src/` or `supabase/` (confirms `Implementation_Gap_Analysis.md` §7.6, which flagged the same gap against the fortnightly reports); "System configuration" has no dedicated settings surface beyond what's already covered by Settings |
| Authentication: registration, secure login, password reset, **role-based access, session management, OAuth (Google, GitHub)** | **Partially implemented** | Register/login/reset and role-based route protection are real (`AuthContext.tsx`, `ProtectedRoute.tsx`); **OAuth is not implemented** — zero matches for `oauth`/`signInWithOAuth`/provider config anywhere in `src/` |

### 5.3 Non-Functional Requirements

| Requirement | Status | Evidence |
| --- | --- | --- |
| Page load <3s, real-time updates <500ms, 1000+ concurrent users, 99.9% uptime | **Page load: now measured and met. The other three: still unverifiable.** | A Lighthouse audit (2026-07-30, desktop, local production build via `npm run build` + `npm run preview`, landing page `/` only) scored **Performance 92**, LCP **1.4s**, FCP **1.4s**, Speed Index **1.4s**, TBT **0ms**, CLS **0** — comfortably under the 3s target. This is one page, one environment, one run: it does not cover authenticated app pages (`/app/feed`, `/app/chat`, etc.), the real production/Vercel deployment, or mobile. Real-time-latency, concurrent-user, and uptime targets remain entirely unmeasured — no load-testing harness exists (`Implementation_Gap_Analysis.md` §7.4 already flagged the absence of k6/Artillery scripts), and uptime is an operational metric that can only accrue from real monitoring over time, not a one-off test |
| HTTPS, SQL injection prevention, XSS/CSRF protection, input validation, secure file upload, regular security audits | **Partially implemented** | HTTPS comes for free from Vercel/Supabase hosting; SQL-injection prevention is structural (Supabase's parameterized PostgREST layer + RLS in `supabase/migrations/full_sql_data_Schema.sql`), not an explicit app-level sanitizer; no dedicated CSRF middleware or scheduled security-audit process was found; input validation exists ad hoc per form (e.g. `maxLength` truncation confirmed in `Test_Traceability_Matrix.md`'s FEED-POST-04/QA-POST-04 rows), not as a centralized layer |
| Horizontal scaling, load balancing, connection pooling, caching, CDN, microservices-ready | **Not verifiable from repo** | These are properties of the Supabase/Vercel hosting platform by default, not app-level code the repo would show; no evidence contradicts them, but no evidence confirms them as deliberate engineering either |
| Responsive design, WCAG 2.1 accessibility, intuitive UI, fast interactions, clear error messages, PWA features | **Partially implemented** | Tailwind responsive classes and `aria-*` attributes across 35 component files (72 occurrences total) show real accessibility effort; there is no service worker / manifest, so the "Progressive Web App features" claim is not implemented. A Lighthouse audit (2026-07-30, landing page, local production build) scored **Accessibility 87/100** — real evidence now exists, but this is not a formal WCAG 2.1 audit (Lighthouse's accessibility category checks a subset of WCAG success criteria automatically; it doesn't certify full 2.1 AA/AAA compliance), it's one page, and the score wasn't broken down by specific failing checks in this pass |
| Data backup/recovery, error handling/logging, graceful degradation, monitoring/alerting, automated testing coverage | **Partially implemented** | Automated testing coverage is real and current (see §5 below); no backup/recovery or production monitoring/alerting integration was found (consistent with `Implementation_Gap_Analysis.md` §7.5, which flagged the same monitoring gap) |
| Two-Factor Authentication (listed under Future Enhancement in Ch. 10, but shown as a live toggle in Ch. 7 screenshot §7.2.19/§7.2.29) | **UI-only, explicitly disabled** | `src/features/settings/components/SecuritySettings.tsx:176` renders the toggle with the literal label **"Two-factor authentication — coming soon."** — the report's own screenshot captured a stub, and Chapter 10 correctly lists 2FA as future work, so this is an internal inconsistency between Ch. 7 (screenshot implies it's live) and Ch. 10 (says it's future work) rather than a hidden gap |

## 5. Chapter 8 (Software Testing) — Superseded by Test_Traceability_Matrix.md

Chapter 8 §8.7 ("Test Execution Summary") reports a run where only 3 Cypress specs passed (`login.cy.js`, `post.cy.js`, `comment.cy.js`) and 4 failed (`registration.cy.js`, `profileEdit.cy.js`, `qa.cy.js`, `resource.cy.js`). This reflects an earlier, less mature state of the suite.

The current state, per `docs/project_report/Test_Traceability_Matrix.md` (dated 2026-07-29, updated same day):

- **11 Cypress spec files**, a full live run passing **18/18** (1 correctly skipped for missing admin credentials).
- Of the 43 documented test-case IDs from §8.5/§8.6: **30 Covered, 1 Partially covered, 12 Not implemented in app** (these 12 are real application gaps — e.g. no client-side password-strength check, no duplicate-question detection, no file-type/size validation on uploads — not testing gaps).
- Substantial new unit-test coverage added since the report was written: `tests/unit/components/`, `tests/unit/contexts/`, `tests/unit/hooks/`, plus API-layer unit tests (`tests/unit/api/*.test.ts`) and server-side AI-answer tests (`server/tests/ai-answers.test.js`).

Recommendation: treat `Test_Traceability_Matrix.md` as the authoritative, current source for testing status; Chapter 8 §8.7 should be considered a historical snapshot if the report is revised.

## 6. PPT Cross-Check

The PPT (17 slides) is a strict summary of the Final Report — same architecture diagram, same SDLC flow, same ER diagram, same UI screenshots, same "Planned features: mobile app, video chat, AI feature upgrades" as Chapter 10. Nothing in the PPT contradicts the report. One slide detail worth reconciling:

- **Slide "Deployment Architecture"**: "CI/CD pipeline for build, test, and deploy (**manual currently**)." This is now outdated — `.github/workflows/cicd.yml` (present, last modified 2026-07-29) runs the full pipeline automatically on every push/PR to `MCA_Project`: install → lint → typecheck → audit → unit tests → build → Docker-Compose Cypress E2E → conditional automatic deploy to Vercel production on push. The deploy step is no longer manual.

## 7. Overall Alignment Estimate

| Area | Alignment | Basis |
| --- | ---: | --- |
| Core feature implementation (Chapters 1, 3, 6, 7) | High (~85-90%) | Architecture, DFDs, ER diagram, and screenshots all correspond to real code |
| Requirements accuracy (Chapter 5) | Medium (~60-65%) | A meaningful minority of listed functional/non-functional requirements (OAuth, 2FA, bookmarking, hashtags/trending, resource versioning, backup/restore, PWA) are not implemented; this is typical SRS-template inflation, not a sign the built product is behind schedule |
| Testing claims (Chapter 8) | Now High (~85%), but the report text itself is stale | `Test_Traceability_Matrix.md` shows substantially more coverage and a fully green E2E run than what Ch. 8 §8.7 documents |
| CI/CD claims (PPT + Ch. 4) | High, and improved since the report/PPT were authored | Full pipeline now exists and auto-deploys; the report's own "no CI/CD manifests found" finding (Ch. 4 §4.2.5) is resolved |
| Literature Survey (Chapter 2) | **Not aligned — wrong topic entirely** | Needs replacement or explanation before further submission |

**Bottom line:** the built application is honestly represented in the architecture/design/screenshot chapters, has *better* testing and CI/CD maturity today than the report or PPT credit it with, but Chapter 5's requirements list overstates the feature set with several SRS-boilerplate items that were never built (OAuth, 2FA, bookmarking, hashtags, resource versioning, backup/restore) — and Chapter 2 needs to be replaced, as it does not describe this project at all.
