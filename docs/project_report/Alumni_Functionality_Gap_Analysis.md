# Alumni Functionality — Gap Analysis

## 1. Purpose and Scope

Focus Hub is described in its own project synopsis as an "AI-Powered Alumni Social Platform" (`docs/project_report/Focus_Hub_MCA_Project_Synopsis.md:1`) in which "Alumni will contribute experience, professional insight, and career support" alongside students seeking "guidance, clarification and mentorship" (`docs/project_report/Focus_Hub_MCA_Project_Synopsis.md:81`), and the system is described as supporting "role-appropriate capabilities and governance" across its user types (`docs/project_report/Synopsis/3.md:52`).

This document checks that claim directly against the repository: schema, RLS policies, frontend code, and admin tooling. It is a companion to two existing documents and does not duplicate them:

- `docs/project_report/Implementation_Gap_Analysis.md` — maps the fortnightly progress reports to the codebase; never mentions "alumni" at all.
- `docs/project_report/Final_Report_PPT_Gap_Analysis.md` — maps the Final Report/PPT to the codebase; its Chapter 1 alignment row (`Final_Report_PPT_Gap_Analysis.md:22`) rates "alumni profiles" as **High** alignment without checking whether alumni profiles actually differ from student profiles. This document supplies that missing check, and the finding below should be read as a correction to that row.

## 2. What "Alumni" Currently Means in the App

`profiles.member_type` is the sole representation of alumni status anywhere in the system:

- The column was bolted on after the base schema, not part of the original table: `supabase/migrations/20250629133651_focus_hub.sql:11-24` (the original `CREATE TABLE public.profiles`) has no `member_type` column at all. It was added later by `supabase/migrations/new_data.sql:72`:
  ```sql
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS member_type TEXT CHECK (member_type IN ('student', 'alumni'));
  ```
- The canonical/current schema snapshot (`supabase/migrations/full_sql_data_Schema.sql:2854-2869`) shows it as a plain `text` column, `DEFAULT 'student'`, constrained by `CONSTRAINT member_type_check CHECK ((member_type = ANY (ARRAY['student'::text, 'alumni'::text])))`.
- A `member_type_enum` Postgres enum type is defined (`full_sql_data_Schema.sql:340-345`) but the column does not actually use it as its type — the enum is only referenced as a cast on the default literal (`'student'::public.member_type_enum`), which Postgres then implicitly casts back to `text`. The enum is effectively dead code in the schema.
- The value is populated exactly once, at signup, by the `handle_new_user()` trigger reading `new.raw_user_meta_data ->> 'member_type'` (`full_sql_data_Schema.sql:956-962`, `new_data.sql:74-87`) — itself fed by the frontend signup form (§3).
- No other alumni-related column exists anywhere in the schema: no `graduation_year`, `batch`, `company`, `job_title`, `designation`, or verification/approval-status field. `member_type` and `status` (`active`/etc.) are the only classification columns on `profiles`.

## 3. Every Place `member_type` Is Touched

| Location | Direction | Effect |
| --- | --- | --- |
| `src/pages/Register.tsx:20,126-138` | Write | Signup form radio button (`student` default, `alumni` option); passed as a positional arg to `signUp()`. |
| `src/contexts/AuthContext.tsx:119-133` | Write | `signUp()` places the value into Supabase Auth user metadata (`options.data.member_type`) only — not written directly to `profiles`; lands there later via the DB trigger. |
| `src/features/settings/components/ProfileSettings.tsx:30,48,152-165` | Write | A `Select` (student/alumni) in Settings lets a user change their own `member_type` at any time, with no approval, verification, or audit trail. |
| `src/features/settings/hooks/useSettings.ts:45-51,70-84` | Write | Persists the settings-page value straight to `profiles.member_type` via `useUpdateProfile`. |
| `src/pages/Profile.tsx:105,128-132` | **Read (only site in the app)** | Picks which word — "Student" or "Alumni" — to print inside a `Badge`. No conditional rendering, no gated tabs, no different stats: Posts/Files/Activity/About tabs, follow button, and Q&A stats are identical regardless of value. |
| `src/features/profile/api/profile.ts:6` | Read (fetch only) | `member_type` is one column among many pulled by `PROFILE_SELECT`; not used for any logic in that file. |
| `src/integrations/supabase/types.ts:406,421,436` | Type | `member_type: string | null` — a plain string, not a `"student" | "alumni"` literal union, so TypeScript does not even enforce the two allowed values at compile time. |

That is the complete set. No route, `ProtectedRoute` check (`src/components/ProtectedRoute.tsx` has zero references to `member_type`), server endpoint (`server/server.js`, `server/ai-answers.js` — zero references), or admin surface reads or branches on this field.

**Admin visibility**: `src/features/admin/api/users.ts:8-13` types `AdminUser` as `Pick<Profile, "id" | "full_name" | "email" | "avatar_url" | "created_at"> & { status: string }` — `member_type` is explicitly excluded from what admins can even see. `UserManagement.tsx`'s user table has no member-type column and no filter by student/alumni; `useAdminStats.ts`/`useAdminAnalytics.ts` report no breakdown by member type either.

**Database permissions**: all five RLS policies on `profiles` (`full_sql_data_Schema.sql:7397,7459,7515,7667,7739`) gate exclusively on `auth.uid() = id` or the admin `has_role()` check — none reference `member_type`. Every other table's policies (posts, likes, followers, chats, filemodels, questionanswers) gate the same way. Students and alumni have byte-identical read/write access to every table in the database.

## 4. What's Promised vs. What's Built

| Promised (documentation) | Reality (code) |
| --- | --- |
| "Alumni will contribute experience, professional insight, and career support" — `Focus_Hub_MCA_Project_Synopsis.md:81` | No mechanism exists for alumni to contribute anything students can't; posting, commenting, Q&A, chat, and resource upload are identical for both roles. |
| "Strengthen alumni engagement and mentorship pathways" — `Synopsis/3.md:9` | No mentorship-matching feature, alumni directory, or alumni-only interaction surface exists anywhere in `src/`. |
| "role-appropriate capabilities and governance" — `Synopsis/3.md:52` | No RLS policy, route guard, or UI branch grants or restricts any capability based on `member_type` (§3). |
| Final Report Chapter 1 lists "alumni profiles" as a key component, rated **High** alignment — `Final_Report_PPT_Gap_Analysis.md:22` | Alumni profiles are the exact same `profiles` row and same `Profile.tsx` render tree as student profiles, differing only in the text of one badge. |

Notably, `docs/project_report/Implementation_Gap_Analysis.md` and all four fortnightly reports (`fortnightly_report_1st.md` through `_4th.md`) never mention "alumni" — the differentiation promised in the synopsis does not appear to have been scoped into any sprint at all, rather than being cut for time.

## 5. Gap Table

| Area | Status | Evidence |
| --- | --- | --- |
| RLS / permission differentiation | **Not implemented** | Zero policies reference `member_type` (§3); identical access for both roles. |
| Admin visibility / filtering by member type | **Not implemented** | `member_type` excluded from `AdminUser` type and `UserManagement.tsx` table (`src/features/admin/api/users.ts:8-13`). |
| Alumni-specific profile fields (graduation year, company, designation, batch) | **Not implemented** | No such columns in schema or type definitions (§2). |
| Dedicated alumni features (directory, mentorship matching, verification/approval flow, alumni-only content) | **Not implemented** | No matches anywhere in `src/` for directory/mentorship/verification concepts tied to member type. |
| Type safety on `member_type` | **Weak** | Declared as `string \| null`, not a literal union (`src/integrations/supabase/types.ts:406,421,436`); the Postgres enum type that could enforce this exists but is unused by the column (§2). |
| Self-service change without gatekeeping | **Present, unflagged as a gap in prior docs** | Any user can switch their own `member_type` freely via Settings with no verification (`ProfileSettings.tsx:152-165`) — inconsistent with "governance" language in the synopsis. |
| Cosmetic display | **Implemented** | `Profile.tsx:128-132` renders the correct badge label for whichever value is stored. |

## 6. Overall Assessment

`member_type` is a single free-text column, constrained to two values by a `CHECK`, set once at signup and freely editable afterward, that is read in exactly one place in the entire application — to choose a word inside a `Badge`. There is no functional distinction between a student and an alumni account anywhere in Focus Hub today: not in database permissions, not in available features, not in admin tooling, not in profile data captured. "Alumni" is, in the current build, a label with no behavior attached to it.

This directly contradicts the synopsis's framing of role-differentiated "capabilities and governance," and it is a real gap that the existing `Final_Report_PPT_Gap_Analysis.md` did not catch — its Chapter 1 alignment table rates "alumni profiles" as **High** (`Final_Report_PPT_Gap_Analysis.md:22`) on the basis that the feature exists at all, without checking whether it does anything distinct from the student equivalent. That rating should be revisited: the feature exists structurally (a column, a signup choice, a settings toggle, a badge) but not functionally.
