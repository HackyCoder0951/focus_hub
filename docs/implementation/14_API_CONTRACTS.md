# API Contract Baseline

## Purpose

This document records the first stable API contract baseline for Focus Hub. It supports the first fortnight supervisor recommendation to document request and response shapes for backend endpoints and frontend consumers.

## Contract Rules

- Frontend data access should go through feature API modules under `src/features/*/api/` or shared API helpers.
- Supabase table calls must return normalized objects that match the rendering components.
- Mutations should return either `void` for simple state-changing actions or a typed row/object when the UI immediately needs the created/updated data.
- Server API endpoints should return JSON with either a success payload or an `error` field.
- Auth-required server endpoints must use bearer tokens sent by `src/lib/api.ts`.

## Frontend Data Contracts

| Module | Consumer API | Main Inputs | Main Output | Notes |
| --- | --- | --- | --- | --- |
| Feed | `src/features/feed/api/posts.ts` | page index, search term, post content, optional image URL | paged posts with author profile and like count | Feed reads exclude soft-deleted posts. |
| Feed Comments | `src/features/feed/api/comments.ts` | post id, user id, comment content | comments with author profile and like metadata | Comment mutations update post discussion state. |
| Q&A Questions | `src/features/qa/api/questions.ts` | category, search, title, body, tags | questions with author, answer count, and tags | Tags are normalized to lowercase hyphenated names. |
| Q&A Answers | `src/features/qa/api/answers.ts` | question id, answer body, accepted answer id | answers with author metadata | Accepted-answer updates should keep one accepted answer per question. |
| AI Answers | `src/features/qa/api/aiAnswers.ts` | question id, question text, feedback rating | stored AI answer row | Uses the Express API instead of direct Supabase writes for generation. |
| Chat | `src/features/chat/api.ts` | user id, chat id, message content, optional media URL | chat list, message pages, inserted message rows | Realtime hooks update local query cache after inserts. |
| Resources | `src/features/resources/api/files.ts` | file, description, visibility flag, user id | file model rows and public storage URLs | Storage upload occurs before database insert. |
| Profile | `src/features/profile/api/profile.ts` | profile id, viewer id, follow target id | profile, follow stats, activity summaries | Follow/unfollow actions update relationship rows. |
| Settings | `src/features/settings/api/settingsApi.ts` | profile fields, avatar file, preferences | updated profile/settings data | Avatar uploads use Supabase storage. |
| Admin | `src/features/admin/api/*` | filters, user ids, flag ids, status changes | stats, user rows, flagged content, activity | Admin screens must be protected by role-aware routes. |

## Server Endpoint Contracts

### `GET /api/health`

- Auth: not required.
- Request body: none.
- Success response:

```json
{
  "status": "ok",
  "timestamp": "2026-07-25T00:00:00.000Z",
  "requestId": "optional-request-id"
}
```

### `POST /api/ai-answers/generate`

- Auth: required bearer token.
- Request body:

```json
{
  "question": "How do I prepare for an interview?",
  "questionId": 101
}
```

- Success response:

```json
{
  "success": true,
  "aiAnswer": {
    "id": 1,
    "question_id": 101,
    "answer_text": "Generated answer text",
    "generated_by": "groq",
    "user_id": "authenticated-user-id",
    "model_used": "llama-3.1-8b-instant",
    "tokens_used": 120,
    "processing_time_ms": 900,
    "user_feedback_rating": null,
    "generation_attempts": 1
  },
  "message": "AI answer generated successfully"
}
```

- Error responses:
  - `400` when `question` or `questionId` is missing.
  - `401` when no authenticated user is available.
  - `500` when AI generation or persistence fails.

### `GET /api/ai-answers/question/:id`

- Auth: not currently required.
- Success response:

```json
{
  "aiAnswer": null
}
```

or:

```json
{
  "aiAnswer": {
    "id": 1,
    "question_id": 101,
    "answer_text": "Generated answer text"
  }
}
```

### `PATCH /api/ai-answers/:id/feedback`

- Auth: required bearer token.
- Request body:

```json
{
  "user_feedback_rating": 1
}
```

- Success response:

```json
{
  "success": true,
  "aiAnswer": {
    "id": 1,
    "user_feedback_rating": 1
  }
}
```

- Error responses:
  - `400` when feedback rating is not numeric.
  - `401` when no authenticated user is available.
  - `500` when persistence fails.

## Contract Maintenance Checklist

- Update this document when a feature API function changes its input or output shape.
- Keep Supabase generated types in sync after migrations.
- Add a small test or smoke check for every newly documented contract.
- Review this document before integration days and release candidates.
