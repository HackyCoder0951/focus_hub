# Focus Hub Next.js Migration Documentation

## 1. Purpose

This document defines the migration path from the current Vite + React Router application to a Next.js App Router application. The goal is to preserve all existing product behavior while modernizing the runtime, routing, auth model, API handling, and deployment workflow.

## 2. Migration Goals

- Move the application to Next.js App Router.
- Replace client-only Supabase auth with server-managed sessions.
- Preserve all current product areas: auth, feed, Q&A, chat, resources, profile, settings, and admin.
- Move the current Express API layer into Next.js route handlers.
- Keep Supabase realtime features working in client components.
- Deploy the new stack to Vercel.
- Use a phased migration to reduce risk and allow verification at each stage.

## 3. Reference Documentation

The migration should follow the behavior and architecture described in the existing documentation:

- [README.md](README.md)
- [docs/Project_Documentation.md](docs/Project_Documentation.md)
- [docs/implementation/00_OVERVIEW.md](docs/implementation/00_OVERVIEW.md)
- [docs/implementation/02_AUTHENTICATION.md](docs/implementation/02_AUTHENTICATION.md)
- [docs/implementation/04_API_INTEGRATION.md](docs/implementation/04_API_INTEGRATION.md)
- [docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md)

## 4. Target Architecture

### Frontend
- Next.js App Router
- React 18 + TypeScript
- Server Components for initial data loading where appropriate
- Client Components for interactive and realtime features
- Tailwind CSS and existing shadcn/ui style system

### Backend
- Supabase for auth, database, storage, and realtime
- Next.js route handlers for API logic
- Groq integration for AI answer generation
- Server-managed session handling via Supabase SSR patterns

### Deployment
- Vercel as the primary deployment target
- Environment variables configured for both server and client usage
- Temporary coexistence of the legacy Vite app during phased migration

## 5. Migration Phases

### Phase 0: Discovery and Baseline
**Duration:** Week 1

**Objectives:**
- Confirm the current app surface and migration scope.
- Inventory routes, API endpoints, realtime hooks, and auth flows.
- Identify dependencies that must be updated or removed.
- Preserve the current implementation as the parity baseline.

**Deliverables:**
- Route inventory
- API inventory
- Auth flow inventory
- Dependency migration checklist
- Baseline test list

**Exit Criteria:**
- All major application surfaces are mapped and documented.
- Migration scope is approved.

### Phase 1: Next.js Foundation
**Duration:** Week 2

**Objectives:**
- Create the Next.js application structure.
- Establish App Router, layout hierarchy, and global providers.
- Configure TypeScript, Tailwind, linting, and environment variables.
- Prepare Vercel-compatible build and runtime settings.

**Deliverables:**
- Next.js project scaffold
- Root layout and provider setup
- Environment variable conventions
- Updated build scripts

**Exit Criteria:**
- The Next.js shell builds successfully.
- The app can run locally in a minimal form.

### Phase 2: Routing and Layout Migration
**Duration:** Week 3

**Objectives:**
- Translate React Router routes into Next.js file-based routes.
- Recreate public pages and protected app routes.
- Replace nested route layout logic with App Router layouts.
- Maintain navigation behavior and 404 handling.

**Deliverables:**
- Route structure in the Next.js app
- Public and protected layouts
- Admin route grouping
- Not-found and redirect handling

**Exit Criteria:**
- All existing routes are accessible in the new routing model.
- Route-level navigation matches the current app behavior.

### Phase 3: Authentication and Session Migration
**Duration:** Week 4

**Objectives:**
- Replace client-only Supabase auth with server-managed sessions.
- Implement auth middleware and server/client session boundaries.
- Preserve sign-up, sign-in, sign-out, password reset, and account-status checks.
- Keep role-based access control intact.

**Deliverables:**
- Supabase SSR auth setup
- Auth middleware
- Session-aware route protection
- Role and profile resolution logic

**Exit Criteria:**
- Auth flows work end to end in the Next.js app.
- Protected routes redirect correctly.
- Banned or inactive account handling remains intact.

### Phase 4: Data Access and API Migration
**Duration:** Week 5

**Objectives:**
- Move API logic into Next.js route handlers.
- Replace the Express bootstrap with native Next.js handlers.
- Keep existing validation, ownership checks, and Groq processing.
- Review data fetching patterns for server and client boundaries.

**Deliverables:**
- Next.js route handlers for answers, comments, votes, and AI answers
- Supabase access patterns adapted for Next.js
- Request validation and auth verification updates

**Exit Criteria:**
- API endpoints behave like the current implementation.
- Server-side requests authenticate correctly.

### Phase 5: Realtime and Feature Migration
**Duration:** Weeks 6 to 7

**Objectives:**
- Keep Supabase realtime subscriptions in client components only.
- Migrate feed, chat, Q&A, resources, profile, settings, and admin pages.
- Preserve UI behavior, loading states, and interactive flows.
- Validate that realtime updates still function after the server/client split.

**Deliverables:**
- Migrated feature pages
- Client-only realtime hooks
- Updated shared UI patterns
- Feature parity checks per module

**Exit Criteria:**
- Core user journeys work in the Next.js app.
- Realtime updates remain stable.
- No major feature regressions remain in the migrated modules.

### Phase 6: Testing, Validation, and Cutover
**Duration:** Week 8

**Objectives:**
- Run validation against the migrated app.
- Update Cypress or equivalent end-to-end coverage for the new routes.
- Compare the Next.js app against the documentation baseline.
- Prepare for production cutover and retire Vite-only code.

**Deliverables:**
- Updated test suite
- Migration validation report
- Deployment checklist
- Decommission plan for legacy code

**Exit Criteria:**
- Feature parity is verified.
- The Next.js app is production-ready.
- Legacy Vite/React Router/Express-only artifacts can be removed.

## 6. Timeline Summary

| Week | Phase | Focus | Output |
|------|-------|-------|--------|
| 1 | Phase 0 | Discovery and baseline | Migration inventory and scope |
| 2 | Phase 1 | Next.js foundation | Working Next.js shell |
| 3 | Phase 2 | Routing and layout migration | Routes and layouts mapped |
| 4 | Phase 3 | Authentication migration | Server-managed auth and access control |
| 5 | Phase 4 | Data access and API migration | Route handlers and data layer updates |
| 6 | Phase 5 | Feature migration | Feed, profile, Q&A, and related pages |
| 7 | Phase 5 | Realtime and admin completion | Remaining interactive modules stabilized |
| 8 | Phase 6 | Testing and cutover | Validation complete and production release ready |

## 7. Risk Areas

- Routing differences between React Router and Next.js App Router.
- Auth session handling changes between client-side and server-managed patterns.
- Realtime subscriptions failing if moved into server components.
- API behavior drift during Express-to-Next route handler conversion.
- Hidden dependencies on Vite-specific environment variables or browser-only assumptions.

## 8. Validation Checklist

- Build succeeds in the Next.js app.
- Sign-up, sign-in, password reset, and sign-out work correctly.
- Protected pages redirect as expected.
- Admin access remains role-gated.
- API routes return the same data and error conditions as before.
- Realtime feed and chat updates still appear live.
- Documentation and implementation remain aligned.

## 9. Recommended Delivery Approach

Use a phased migration rather than a big-bang rewrite. This allows the team to preserve the current app as a fallback while the Next.js version is validated feature by feature. Once parity is confirmed, remove the legacy stack and promote the Next.js build to production.
