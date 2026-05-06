Plan: Full Next.js Migration for Focus Hub

Migrate the current Vite SPA to a Next.js App Router app on Vercel, keeping Supabase, Groq, realtime behavior, and the current product surface intact. The safest path is a phased cutover: build the Next.js app in parallel, reach feature parity, then switch deployment and remove Vite-only pieces.

Steps
1. Set up the Next.js foundation first: App Router, TypeScript, Vercel-ready config, global providers, env handling, and build scripts. Keep behavior unchanged while the new shell is introduced.
2. Recreate the current route tree in Next.js using file-based routes and nested layouts. Translate the route map from src/App.tsx into public routes, protected app routes, and admin-only routes.
3. Replace client-only auth with server-managed Supabase sessions. Move the logic currently in src/contexts/AuthContext.tsx into a Next.js auth flow using middleware and server/client boundaries.
4. Move data access into the Next.js model in a controlled way. Keep TanStack Query where it helps interactivity, but shift initial reads and protected data loading toward server components and route handlers.
5. Port the current Express API layer into Next.js route handlers. Migrate src/api/server.js, src/api/index.js, src/api/answers.js, src/api/comments.js, src/api/votes.js, and src/api/ai-answers.js, keeping the same validation, ownership checks, and Groq flow.
6. Refactor realtime features so they stay client-only where required. Start from src/hooks/useRealtime.ts and isolate Supabase subscriptions behind client components and hooks.
7. Migrate pages and shared UI feature by feature in parity order: auth and shell first, then feed, profile, Q&A, resources, chat, settings, and admin last.
8. Update deployment and environment setup for the Next.js runtime. Replace Vite assumptions, align secrets, and keep the Vercel target intact.
9. Rework tests and validation around the new route structure. Cover auth redirects, protected pages, API handlers, and Groq answer generation, then compare against the documented user journeys.
10. Remove Vite, React Router, and Express-only artifacts only after the Next.js app is verified and deployed as the production path.

Relevant files
- src/App.tsx — current route tree and provider nesting.
- src/contexts/AuthContext.tsx — auth/session/profile/role behavior to preserve.
- src/integrations/supabase/client.ts — current Supabase client setup.
- src/hooks/useRealtime.ts — realtime subscription pattern to keep client-only.
- src/api/server.js — Express bootstrap to replace.
- src/api/index.js — existing API router composition to map into route handlers.
- src/api/answers.js, src/api/comments.js, src/api/votes.js, src/api/ai-answers.js — backend endpoints to migrate.
- src/api/requireAuth.js — JWT auth approach to replace.
- package.json — dependency and script changes needed for the Next.js runtime.
- docs/implementation/00_OVERVIEW.md, docs/implementation/02_AUTHENTICATION.md, docs/implementation/04_API_INTEGRATION.md, docs/SYSTEM_DESIGN.md — reference docs to preserve architecture and behavior.
- README.md and docs/Project_Documentation.md — feature parity baseline.

Verification
1. Build the Next.js shell and confirm it compiles before feature migration starts.
2. Validate auth flows end to end: sign up, sign in, session persistence, banned or inactive account handling, sign out, and protected-route redirects.
3. Exercise the migrated API routes for answers, comments, votes, and AI answer generation.
4. Verify realtime updates in feed, chat, and notifications after the client/server split.
5. Compare the migrated routes and features against the documented app behavior before removing the old stack.

Decisions
- Target framework: Next.js App Router.
- Auth strategy: server-managed Supabase sessions.
- API strategy: migrate the Express layer into Next.js route handlers.
- Migration strategy: phased cutover with temporary coexistence of the current app.
- Deployment target: Vercel.
- Scope boundary: preserve behavior first, remove Vite and React Router only after parity is proven.

If you want, I can turn this into a phase-by-phase execution plan next, with explicit ownership for auth, shell, Q&A, chat, resources, and admin.