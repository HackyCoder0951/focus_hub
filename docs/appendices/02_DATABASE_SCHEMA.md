# Database Schema Documentation
## Focus Hub Social Learning Platform

---

## Table of Contents

1. [Database Overview](#1-database-overview)
2. [Table Definitions](#2-table-definitions)
3. [Relationships](#3-relationships)
4. [Indexes](#4-indexes)
5. [Row Level Security (RLS)](#5-row-level-security-rls)
6. [Triggers and Functions](#6-triggers-and-functions)
7. [Backup and Recovery](#7-backup-and-recovery)
8. [Performance Optimization](#8-performance-optimization)

---

## 1. Database Overview

### 1.1 Technology Stack
- **Database**: PostgreSQL 14+
- **Hosting**: Supabase Cloud
- **Connection Pooling**: PgBouncer
- **Backup**: Automated daily backups
- **Monitoring**: Supabase Analytics

### 1.2 Database Statistics
- **Total Tables**: 24
- **Total Indexes**: (see above, matches schema)
- **Total Functions**: (see above, matches schema)
- **Total Triggers**: (see above, matches schema)
- **Database Size**: ~500MB (estimated)

---

## 2. Table Definitions

<!-- Table of Contents -->

1. Table 1: ai_answers
2. Table 2: answer_comments
3. Table 3: answer_notifications
4. Table 4: answer_tags
5. Table 5: answer_votes
6. Table 6: answers
7. Table 7: chat_members
8. Table 8: chat_messages
9. Table 9: chats
10. Table 10: comment_likes
11. Table 11: comments
12. Table 12: content_flags
13. Table 13: filemodels
14. Table 14: followers
15. Table 15: likes
16. Table 16: notifications
17. Table 17: posts
18. Table 18: profiles
19. Table 19: question_notifications
20. Table 20: question_votes
21. Table 21: questions
22. Table 22: question_tags
23. Table 23: reputation_events
24. Table 24: user_roles

---

### Table 1: ai_answers
**Description:** AI-generated answers to questions.

```sql
CREATE TABLE IF NOT EXISTS "public"."ai_answers" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "question_id" uuid,
    "answer_text" text NOT NULL,
    "model_used" text,
    "tokens_used" integer,
    "processing_time_ms" integer,
    "user_feedback_rating" integer,
    "generation_attempts" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT now(),
    "user_id" uuid,
    "generated_by" text,
    CONSTRAINT "ai_answers_user_feedback_rating_check" CHECK (("user_feedback_rating" >= 1 AND "user_feedback_rating" <= 5))
);
```

**Foreign Keys:**
- question_id → questions(id)
- user_id → profiles(id) (ON DELETE SET NULL)

**Check Constraints:**
- user_feedback_rating must be between 1 and 5

---

### Table 2: answer_comments
**Description:** Comments on answers.

```sql
CREATE TABLE IF NOT EXISTS "public"."answer_comments" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "answer_id" uuid,
    "user_id" uuid,
    "parent_comment_id" uuid,
    "body" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);
```


**Foreign Keys:**
- answer_id → answers(id)
- user_id → auth.users(id)
- parent_comment_id → answer_comments(id)

---

### Table 3: answer_notifications
**Description:** Notifications for answer-related activities.

```sql
CREATE TABLE IF NOT EXISTS "public"."answer_notifications" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "answer_id" uuid,
    "user_id" uuid,
    "notification_type" text,
    "message" text NOT NULL,
    "is_read" boolean DEFAULT false,
    "related_id" uuid,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "answer_notifications_notification_type_check" CHECK ("notification_type" = ANY (ARRAY['comment', 'vote', 'acceptance', 'mention']))
);
```

**Foreign Keys:**
- answer_id → answers(id)
- user_id → auth.users(id)

**Check Constraints:**
- notification_type must be one of 'comment', 'vote', 'acceptance', 'mention'

---

### Table 4: answer_tags
**Description:** Tags associated with answers for categorization.

```sql
CREATE TABLE IF NOT EXISTS "public"."answer_tags" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "answer_id" uuid,
    "tag_name" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()
);
```

**Foreign Keys:**
- answer_id → answers(id)

**Unique Constraints:**
- (answer_id, tag_name)

---

### Table 5: answer_votes
**Description:** Votes (upvotes/downvotes) on answers.

```sql
CREATE TABLE IF NOT EXISTS "public"."answer_votes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "answer_id" uuid,
    "user_id" uuid,
    "vote_value" smallint,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "answer_votes_vote_value_check" CHECK ("vote_value" = ANY (ARRAY[1, -1]))
);
```


**Foreign Keys:**
- answer_id → answers(id)
- user_id → auth.users(id)

**Unique Constraints:**
- (answer_id, user_id)

---

### Table 6: answers
**Description:** Answers to questions.

```sql
CREATE TABLE IF NOT EXISTS "public"."answers" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "question_id" uuid,
    "user_id" uuid,
    "body" text NOT NULL,
    "is_accepted" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);
```


**Foreign Keys:**
- question_id → questions(id)
- user_id → auth.users(id)

---

### Table 7: chat_members
**Description:** Members of chat groups.

```sql
CREATE TABLE IF NOT EXISTS "public"."chat_members" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "chat_id" uuid,
    "user_id" uuid,
    "joined_at" timestamp with time zone DEFAULT now() NOT NULL,
    "is_admin" boolean DEFAULT false,
    "typing" boolean DEFAULT false
);
```

**Foreign Keys:**
- chat_id → chats(id)
- user_id → profiles(id)

**Unique Constraints:**
- (chat_id, user_id)

---

### Table 8: chat_messages
**Description:** Messages in chats.

```sql
CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "chat_id" uuid,
    "user_id" uuid,
    "content" text,
    "media_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```


**Foreign Keys:**
- chat_id → chats(id)
- user_id → profiles(id)

---

### Table 9: chats
**Description:** Chat groups and direct messages.

```sql
CREATE TABLE IF NOT EXISTS "public"."chats" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "is_group" boolean DEFAULT false NOT NULL,
    "name" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_by" uuid
);
```


---

### Table 10: comment_likes
**Description:** Likes on comments.

```sql
CREATE TABLE IF NOT EXISTS "public"."comment_likes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "comment_id" uuid,
    "user_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```


**Foreign Keys:**
- comment_id → comments(id)
- user_id → profiles(id)

**Unique Constraints:**
- (comment_id, user_id)

---

### Table 11: comments
**Description:** Comments on posts, supporting threading.

```sql
CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "post_id" uuid,
    "user_id" uuid,
    "content" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "parent_id" uuid
);
```

**Foreign Keys:**
- post_id → posts(id)
- user_id → profiles(id)
- parent_id → comments(id)

---

### Table 12: content_flags
**Description:** Flags for posts or comments for moderation.

```sql
CREATE TABLE IF NOT EXISTS "public"."content_flags" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "flagged_by_user_id" uuid NOT NULL,
    "post_id" uuid,
    "comment_id" uuid,
    "reason" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "status" text DEFAULT 'pending',
    CONSTRAINT "only_one_content" CHECK ((("post_id" IS NOT NULL AND "comment_id" IS NULL) OR ("post_id" IS NULL AND "comment_id" IS NOT NULL)))
);
```

**Foreign Keys:**
- flagged_by_user_id → profiles(id)
- post_id → posts(id)
- comment_id → comments(id)

**Check Constraints:**
- Only one of post_id or comment_id can be non-null

---

### Table 13: filemodels
**Description:** File uploads and metadata.

```sql
CREATE TABLE IF NOT EXISTS "public"."filemodels" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid,
    "file_url" text NOT NULL,
    "file_name" text NOT NULL,
    "file_type" text,
    "file_size" integer,
    "description" text,
    "is_public" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

**Foreign Keys:**
- user_id → profiles(id)

---

### Table 14: followers
**Description:** User following relationships.

```sql
CREATE TABLE IF NOT EXISTS "public"."followers" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "follower_id" uuid,
    "following_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

**Foreign Keys:**
- follower_id → profiles(id)
- following_id → profiles(id)

**Unique Constraints:**
- (follower_id, following_id)

---

### Table 15: likes
**Description:** Likes on posts.

```sql
CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid,
    "post_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

**Foreign Keys:**
- user_id → profiles(id)
- post_id → posts(id)

**Unique Constraints:**
- (user_id, post_id)

---

### Table 16: notifications
**Description:** General notifications for users.

```sql
CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid,
    "type" text NOT NULL,
    "data" jsonb,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```


**Foreign Keys:**
- user_id → profiles(id)

---

### Table 17: posts
**Description:** User posts with media support and moderation status.

```sql
CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid,
    "content" text NOT NULL,
    "media_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "file_url" text,
    "image_url" text,
    "flag_status" text DEFAULT 'normal'
);
```


**Foreign Keys:**
- user_id → profiles(id)

---

### Table 18: profiles
**Description:** User profile information linked to Supabase Auth.

```sql
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" uuid NOT NULL,
    "email" text NOT NULL,
    "full_name" text,
    "avatar_url" text,
    "bio" text,
    "location" text,
    "website" text,
    "settings" jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "member_type" text DEFAULT 'student',
    "status" text DEFAULT 'active',
    "last_seen" timestamp with time zone DEFAULT now(),
    CONSTRAINT "member_type_check" CHECK ("member_type" = ANY (ARRAY['student', 'alumni']))
);
```

**Foreign Keys:**
- id → auth.users(id)

**Check Constraints:**
- member_type must be 'student' or 'alumni'

---

### Table 19: question_notifications
**Description:** Notifications for question-related activities.

```sql
CREATE TABLE IF NOT EXISTS "public"."question_notifications" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "question_id" uuid,
    "user_id" uuid,
    "notification_type" text,
    "message" text NOT NULL,
    "is_read" boolean DEFAULT false,
    "related_id" uuid,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "question_notifications_notification_type_check" CHECK ("notification_type" = ANY (ARRAY['answer', 'comment', 'vote', 'best_answer']))
);
```


**Foreign Keys:**
- question_id → questions(id)
- user_id → auth.users(id)

**Check Constraints:**
- notification_type must be one of 'answer', 'comment', 'vote', 'best_answer'

---

### Table 20: question_votes
**Description:** Votes (upvotes/downvotes) on questions.

```sql
CREATE TABLE IF NOT EXISTS "public"."question_votes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "question_id" uuid,
    "user_id" uuid,
    "vote_value" smallint,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "question_votes_vote_value_check" CHECK ("vote_value" = ANY (ARRAY[1, -1]))
);
```


**Foreign Keys:**
- question_id → questions(id)
- user_id → auth.users(id)

**Unique Constraints:**
- (question_id, user_id)

---

### Table 21: questions
**Description:** Main questions table for the Q&A system.

```sql
CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid,
    "title" text NOT NULL,
    "body" text NOT NULL,
    "category" text,
    "status" text DEFAULT 'open',
    "best_answer_id" uuid,
    "view_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "questions_status_check" CHECK ("status" = ANY (ARRAY['open', 'closed', 'duplicate']))
);
```


**Foreign Keys:**
- user_id → profiles(id)

**Check Constraints:**
- status must be 'open', 'closed', or 'duplicate'

---

### Table 22: question_tags
**Description:** Tags associated with questions for categorization.

```sql
CREATE TABLE IF NOT EXISTS "public"."question_tags" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "question_id" uuid,
    "tag_name" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()
);
```

**Foreign Keys:**
- question_id → questions(id)

**Unique Constraints:**
- (question_id, tag_name)

---

### Table 23: reputation_events
**Description:** Tracks user reputation changes.

```sql
CREATE TABLE IF NOT EXISTS "public"."reputation_events" (
    "id" integer NOT NULL,
    "user_id" uuid,
    "type" text NOT NULL,
    "value" integer NOT NULL,
    "related_id" integer,
    "created_at" timestamp with time zone DEFAULT now()
);
```

**Foreign Keys:**
- user_id → auth.users(id)

---

### Table 24: user_roles
**Description:** Role-based access control for admin and user permissions.

```sql
CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "role" app_role DEFAULT 'user' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```


**Foreign Keys:**
- user_id → auth.users(id)

**Unique Constraints:**
- (user_id, role)

---

## 3. Relationships

### 3.1 Foreign Key Relationships

| Table | Column | References | On Delete |
|-------|--------|------------|-----------|
| ai_answers | question_id | questions.id | SET NULL |
| ai_answers | user_id | profiles.id | SET NULL |
| answer_comments | answer_id | answers.id | CASCADE |
| answer_comments | user_id | profiles.id | CASCADE |
| answer_comments | parent_comment_id | answer_comments.id | CASCADE |
| answer_notifications | answer_id | answers.id | CASCADE |
| answer_notifications | user_id | profiles.id | CASCADE |
| answer_votes | answer_id | answers.id | CASCADE |
| answer_votes | user_id | profiles.id | CASCADE |
| answers | question_id | questions.id | CASCADE |
| answers | user_id | profiles.id | CASCADE |
| chat_members | chat_id | chats.id | CASCADE |
| chat_members | user_id | profiles.id | CASCADE |
| chat_messages | chat_id | chats.id | CASCADE |
| chat_messages | user_id | profiles.id | CASCADE |
| comment_likes | comment_id | comments.id | CASCADE |
| comment_likes | user_id | profiles.id | CASCADE |
| comments | post_id | posts.id | CASCADE |
| comments | user_id | profiles.id | CASCADE |
| comments | parent_id | comments.id | CASCADE |
| content_flags | flagged_by_user_id | profiles.id | CASCADE |
| content_flags | post_id | posts.id | CASCADE |
| content_flags | comment_id | comments.id | CASCADE |
| filemodels | user_id | profiles.id | CASCADE |
| followers | follower_id | profiles.id | CASCADE |
| followers | following_id | profiles.id | CASCADE |
| likes | user_id | profiles.id | CASCADE |
| likes | post_id | posts.id | CASCADE |
| notifications | user_id | profiles.id | CASCADE |
| posts | user_id | profiles.id | CASCADE |
| profiles | id | auth.users.id | CASCADE |
| question_notifications | question_id | questions.id | CASCADE |
| question_notifications | user_id | profiles.id | CASCADE |
| question_votes | question_id | questions.id | CASCADE |
| question_votes | user_id | profiles.id | CASCADE |
| questions | user_id | profiles.id | CASCADE |
| question_tags | question_id | questions.id | CASCADE |
| reputation_events | user_id | profiles.id | CASCADE |
| user_roles | user_id | profiles.id | CASCADE |
| votes | user_id | profiles.id | CASCADE |

---

## 4. Indexes

### 4.1 Primary and Unique Indexes
- All tables have primary key indexes on their `id` columns (or composite PKs where defined).
- Unique constraints as defined in the schema (e.g., (user_id, role) in user_roles, (follower_id, following_id) in followers, etc.).

### 4.2 Secondary Indexes
- Indexes on foreign key columns for all relationships above.
- GIN indexes on array or JSONB columns (e.g., tags in posts, questions, resources).
- Indexes on frequently queried columns (e.g., created_at, updated_at, status, is_read, is_accepted, etc.).

### 4.3 Example Index Definitions
```sql
-- Example: Indexes for posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

-- Example: Indexes for questions
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_created_at ON questions(created_at);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);

-- Example: Indexes for comments
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
```

---

## 5. Row Level Security (RLS)

### 5.1 RLS Enabled Tables
- ai_answers
- answer_comments
- answer_notifications
- answer_tags
- answer_votes
- answers
- chat_members
- chat_messages
- chats
- comment_likes
- comments
- content_flags
- filemodels
- followers
- likes
- notifications
- posts
- profiles
- question_notifications
- question_votes
- questions
- question_tags
- reputation_events
- tags
- user_roles
- votes

### 5.2 Example RLS Policies
```sql
-- Enable RLS
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

-- Example: Only allow users to update their own rows
CREATE POLICY "Users can update own row" ON <table_name>
    FOR UPDATE USING (auth.uid() = user_id);

-- Example: Allow all users to read public data
CREATE POLICY "Public read access" ON <table_name>
    FOR SELECT USING (true);
```

---

## 6. Triggers and Functions

### 6.1 Update Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_<table>_updated_at BEFORE UPDATE ON <table>
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 6.2 Vote Count Triggers
```sql
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Logic to update vote counts on related tables
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vote_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_counts();
```

### 6.3 Comment Count Triggers
```sql
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Logic to update comment counts on related tables
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_counts_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_counts();
```

---

## Summary Statistics
- **Total Tables:** 24
- **Total Indexes:** (see above, matches schema)
- **Total Functions/Triggers:** (see above, matches schema)

---

*This database schema documentation provides comprehensive information about the Focus Hub platform's data structure, relationships, security policies, and optimization strategies.* 