# Focus Hub Database Schema (Table Format)

Below is the documentation for all tables in the Focus Hub database, including columns, data types, constraints, and indexes for each table.

---

## User Management Tables

## profiles

| Column Name   | Data Type    | Constraints                                      |
|---------------|--------------|--------------------------------------------------|
| id            | UUID         | PK, FK → auth.users(id), NOT NULL                |
| email         | TEXT         | NOT NULL                                         |
| full_name     | TEXT         |                                                  |
| avatar_url    | TEXT         |                                                  |
| bio           | TEXT         |                                                  |
| location      | TEXT         |                                                  |
| website       | TEXT         |                                                  |
| settings      | JSONB        |                                                  |
| created_at    | TIMESTAMPTZ  | DEFAULT now(), NOT NULL                          |
| updated_at    | TIMESTAMPTZ  | DEFAULT now(), NOT NULL                          |
| member_type   | TEXT         | DEFAULT 'student', CHECK (IN 'student','alumni') |
| status        | TEXT         | DEFAULT 'active'                                 |
| last_seen     | TIMESTAMPTZ  | DEFAULT now()                                    |

**Indexes:**
- idx_profiles_id (id)

## user_roles

| Column Name | Data Type    | Constraints                                      |
|-------------|-------------|--------------------------------------------------|
| id          | UUID         | PK, DEFAULT gen_random_uuid(), NOT NULL          |
| user_id     | UUID         | NOT NULL, FK → profiles(id)                      |
| role        | app_role     | DEFAULT 'user'                                   |
| created_at  | TIMESTAMPTZ  | DEFAULT now()                                    |
|             |              | UNIQUE(user_id, role)                            |

**Indexes:**
- user_roles_pkey (id)
- user_roles_user_id_role_key (user_id, role)

## Social Feed Tables

## posts

| Column Name | Data Type    | Constraints                                      |
|-------------|-------------|--------------------------------------------------|
| id          | UUID         | PK, DEFAULT gen_random_uuid(), NOT NULL          |
| user_id     | UUID         | FK → profiles(id)                                |
| content     | TEXT         | NOT NULL                                         |
| media_url   | TEXT         |                                                  |
| image_url   | TEXT         |                                                  |
| file_url    | TEXT         |                                                  |
| is_deleted  | BOOLEAN      | DEFAULT FALSE                                    |
| flag_status | TEXT         | DEFAULT 'normal'                                 |
| created_at  | TIMESTAMPTZ  | DEFAULT now()                                    |
| updated_at  | TIMESTAMPTZ  | DEFAULT now()                                    |

**Indexes:**
- idx_posts_user_id (user_id)

## comments

| Column Name | Data Type    | Constraints                                      |
|-------------|-------------|--------------------------------------------------|
| id          | UUID         | PK, DEFAULT gen_random_uuid(), NOT NULL          |
| post_id     | UUID         | FK → posts(id)                                   |
| user_id     | UUID         | FK → profiles(id)                                |
| content     | TEXT         | NOT NULL                                         |
| parent_id   | UUID         | FK → comments(id)                                |
| created_at  | TIMESTAMPTZ  | DEFAULT now()                                    |

**Indexes:**
- comments_pkey (id)
- comments_post_id_fkey (post_id)
- comments_user_id_fkey (user_id)
- comments_parent_id_fkey (parent_id)

## likes

| Column Name | Data Type    | Constraints                                      |
|-------------|-------------|--------------------------------------------------|
| id          | UUID         | PK, DEFAULT gen_random_uuid(), NOT NULL          |
| post_id     | UUID         | FK → posts(id)                                   |
| user_id     | UUID         | FK → profiles(id)                                |
| created_at  | TIMESTAMPTZ  | DEFAULT now()                                    |
|             |              | UNIQUE(post_id, user_id)                         |

**Indexes:**
- idx_likes_post_id (post_id)

## comment_likes

| Column Name | Data Type    | Constraints                                      |
|-------------|-------------|--------------------------------------------------|
| id          | UUID         | PK, DEFAULT gen_random_uuid(), NOT NULL          |
| comment_id  | UUID         | FK → comments(id)                                |
| user_id     | UUID         | FK → profiles(id)                                |
| created_at  | TIMESTAMPTZ  | DEFAULT now()                                    |
|             |              | UNIQUE(comment_id, user_id)                      |

**Indexes:**
- comment_likes_comment_id_user_id_key (comment_id, user_id)

## Q&A Module Tables

## questions

| Column Name   | Data Type    | Constraints                                      |
|---------------|-------------|--------------------------------------------------|
| id            | UUID         | PK, DEFAULT gen_random_uuid(), NOT NULL          |
| user_id       | UUID         | FK → auth.users(id)                              |
| title         | TEXT         | NOT NULL                                         |
| body          | TEXT         | NOT NULL                                         |
| category      | TEXT         |                                                  |
| status        | TEXT         | DEFAULT 'open', CHECK (IN 'open','closed','duplicate') |
| best_answer_id| UUID         |                                                  |
| view_count    | INTEGER      | DEFAULT 0                                        |
| created_at    | TIMESTAMPTZ  | DEFAULT now()                                    |
| updated_at    | TIMESTAMPTZ  | DEFAULT now()                                    |

**Indexes:**
- idx_questions_user_id (user_id)
- idx_questions_category (category)
- idx_questions_status (status)
- idx_questions_created_at (created_at DESC)
- idx_questions_title_gin (to_tsvector('english', title))
- idx_questions_body_gin (to_tsvector('english', body))

## answers

| Column Name | Data Type    | Constraints                                      |
|-------------|-------------|--------------------------------------------------|
| id          | UUID         | PK, DEFAULT gen_random_uuid(), NOT NULL          |
| question_id | UUID         | FK → questions(id)                               |
| user_id     | UUID         | FK → auth.users(id)                              |
| body        | TEXT         | NOT NULL                                         |
| is_accepted | BOOLEAN      | DEFAULT FALSE                                    |
| created_at  | TIMESTAMPTZ  | DEFAULT now()                                    |
| updated_at  | TIMESTAMPTZ  | DEFAULT now()                                    |

**Indexes:**
- idx_answers_question_id (question_id)
- idx_answers_user_id (user_id)
- idx_answers_is_accepted (is_accepted)
- idx_answers_created_at (created_at DESC)

## question_votes

| Column Name | Data Type    | Constraints                                      |
|-------------|-------------|--------------------------------------------------|
| id          | UUID         | PK, DEFAULT gen_random_uuid(), NOT NULL          |
| question_id | UUID         | FK → questionanswers(id)                         |
| user_id     | UUID         | FK → profiles(id)                                |
| vote_value  | SMALLINT     | CHECK (IN (1, -1))                               |
| created_at  | TIMESTAMPTZ  | DEFAULT now()                                    |
| updated_at  | TIMESTAMPTZ  | DEFAULT now()                                    |
|             |              | UNIQUE(question_id, user_id)                     |

**Indexes:**
- idx_question_votes_question_id (question_id)
- idx_question_votes_user_id (user_id)

## answer_votes

| Column Name | Data Type    | Constraints                                      |
|-------------|-------------|--------------------------------------------------|
| id          | UUID         | PK, DEFAULT gen_random_uuid(), NOT NULL          |
| answer_id   | UUID         | FK → answers(id)                                 |
| user_id     | UUID         | FK → profiles(id)                                |
| vote_value  | SMALLINT     | CHECK (IN (1, -1))                               |
| created_at  | TIMESTAMPTZ  | DEFAULT now()                                    |
| updated_at  | TIMESTAMPTZ  | DEFAULT now()                                    |
|             |              | UNIQUE(answer_id, user_id)                       |

**Indexes:**
- idx_answer_votes_answer_id (answer_id)
- idx_answer_votes_user_id (user_id)

## question_tags

| Column Name | Data Type    | Constraints                                      |
|-------------|-------------|--------------------------------------------------|
| id          | UUID         | PK, DEFAULT gen_random_uuid(), NOT NULL          |
| question_id | UUID         | FK → questionanswers(id)                         |
| tag_name    | TEXT         | NOT NULL                                         |
| created_at  | TIMESTAMPTZ  | DEFAULT now()                                    |
|             |              | UNIQUE(question_id, tag_name)                    |

**Indexes:**
- idx_question_tags_question_id (question_id)
- idx_question_tags_tag_name (tag_name)

## ai_answers

| Column Name           | Data Type      | Constraints                                      |
|-----------------------|---------------|--------------------------------------------------|
| id                    | UUID          | PK, DEFAULT gen_random_uuid(), NOT NULL          |
| question_id           | UUID          | FK → questionanswers(id)                         |
| answer_text           | TEXT          | NOT NULL                                         |
| model_used            | TEXT          |                                                  |
| tokens_used           | INTEGER       |                                                  |
| processing_time_ms    | INTEGER       |                                                  |
| user_feedback_rating  | INTEGER       | CHECK (1 <= user_feedback_rating <= 5)           |
| generation_attempts   | INTEGER       | DEFAULT 1                                        |
| created_at            | TIMESTAMPTZ   | DEFAULT now()                                    |
| user_id               | UUID          | FK → profiles(id) ON DELETE SET NULL             |
| generated_by          | TEXT          |                                                  |

**Indexes:**
- idx_ai_answers_question_id (question_id)

## question_notifications

| Column Name         | Data Type    | Constraints                                                      |
|---------------------|-------------|------------------------------------------------------------------|
| id                  | UUID        | PK, DEFAULT gen_random_uuid(), NOT NULL                          |
| question_id         | UUID        | FK → questions(id)                                               |
| user_id             | UUID        | FK → auth.users(id)                                              |
| notification_type   | TEXT        | CHECK (IN ('answer','comment','vote','best_answer'))             |
| message             | TEXT        | NOT NULL                                                         |
| is_read             | BOOLEAN     | DEFAULT FALSE                                                    |
| related_id          | UUID        |                                                                  |
| created_at          | TIMESTAMPTZ | DEFAULT now()                                                    |

**Indexes:**
- idx_question_notifications_user_id (user_id)
- idx_question_notifications_question_id (question_id)
- idx_question_notifications_is_read (is_read)
- idx_question_notifications_created_at (created_at DESC)

## answer_notifications

| Column Name         | Data Type    | Constraints                                                      |
|---------------------|-------------|------------------------------------------------------------------|
| id                  | UUID        | PK, DEFAULT gen_random_uuid(), NOT NULL                          |
| answer_id           | UUID        | FK → answers(id)                                                 |
| user_id             | UUID        | FK → auth.users(id)                                              |
| notification_type   | TEXT        | CHECK (IN ('comment','vote','acceptance','mention'))             |
| message             | TEXT        | NOT NULL                                                         |
| is_read             | BOOLEAN     | DEFAULT FALSE                                                    |
| related_id          | UUID        |                                                                  |
| created_at          | TIMESTAMPTZ | DEFAULT now()                                                    |

**Indexes:**
- idx_answer_notifications_answer_id (answer_id)
- idx_answer_notifications_user_id (user_id)
- idx_answer_notifications_is_read (is_read)
- idx_answer_notifications_created_at (created_at DESC)

## content_flags

| Column Name         | Data Type    | Constraints                                                      |
|---------------------|-------------|------------------------------------------------------------------|
| id                  | UUID        | PK, DEFAULT gen_random_uuid(), NOT NULL                          |
| flagged_by_user_id  | UUID        | FK → profiles(id)                                                |
| post_id             | UUID        | FK → posts(id)                                                   |
| comment_id          | UUID        | FK → comments(id)                                                |
| reason              | TEXT        |                                                                  |
| status              | TEXT        | DEFAULT 'pending'                                                |
| created_at          | TIMESTAMPTZ | DEFAULT now()                                                    |
|                     |             | CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL)) |

**Indexes:**
- content_flags_pkey (id)

## answer_comments

| Column Name        | Data Type    | Constraints                              |
|--------------------|-------------|------------------------------------------|
| id                 | UUID        | PK, DEFAULT gen_random_uuid(), NOT NULL  |
| answer_id          | UUID        | FK → answers(id)                         |
| user_id            | UUID        | FK → auth.users(id)                      |
| parent_comment_id  | UUID        | FK → answer_comments(id)                 |
| body               | TEXT        | NOT NULL                                 |
| created_at         | TIMESTAMPTZ | DEFAULT now()                            |
| updated_at         | TIMESTAMPTZ | DEFAULT now()                            |

**Indexes:**
- idx_answer_comments_answer_id (answer_id)
- idx_answer_comments_user_id (user_id)
- idx_answer_comments_parent_comment_id (parent_comment_id)

## answer_tags

| Column Name | Data Type    | Constraints                              |
|-------------|-------------|------------------------------------------|
| id          | UUID        | PK, DEFAULT gen_random_uuid(), NOT NULL  |
| answer_id   | UUID        | FK → answers(id)                         |
| tag_name    | TEXT        | NOT NULL                                 |
| created_at  | TIMESTAMPTZ | DEFAULT now()                            |
|             |             | UNIQUE(answer_id, tag_name)              |

**Indexes:**
- idx_answer_tags_answer_id (answer_id)
- idx_answer_tags_tag_name (tag_name)

## votes

| Column Name | Data Type    | Constraints                                      |
|-------------|-------------|--------------------------------------------------|
| id          | SERIAL      | PK                                               |
| user_id     | UUID        | FK → auth.users(id)                              |
| target_id   | INTEGER     | NOT NULL                                         |
| target_type | TEXT        | CHECK (IN ('question','answer'))                 |
| value       | SMALLINT    | CHECK (IN (1, -1))                               |
| created_at  | TIMESTAMPTZ | DEFAULT now()                                    |
|             |             | UNIQUE(user_id, target_id, target_type)          |

**Indexes:**
- votes_pkey (id)
- votes_user_id_target_id_target_type_key (user_id, target_id, target_type)

## reputation_events

| Column Name | Data Type    | Constraints                                      |
|-------------|-------------|--------------------------------------------------|
| id          | SERIAL      | PK                                               |
| user_id     | UUID        | FK → auth.users(id)                              |
| type        | TEXT        | NOT NULL                                         |
| value       | INTEGER     | NOT NULL                                         |
| related_id  | INTEGER     |                                                  |
| created_at  | TIMESTAMPTZ | DEFAULT now()                                    |

**Indexes:**
- reputation_events_pkey (id)

## tags

| Column Name | Data Type    | Constraints                                      |
|-------------|-------------|--------------------------------------------------|
| id          | SERIAL      | PK                                               |
| name        | TEXT        | NOT NULL, UNIQUE                                 |
| created_at  | TIMESTAMPTZ | DEFAULT now()                                    |

**Indexes:**
- tags_pkey (id)
- tags_name_key (name)

## Views: Name | Definition (full SQL in code block)

## Functions: Name | Definition (full SQL in code block)

## Triggers: Name | Table | Event | Function | Definition (full SQL in code block)

## RLS Policies: Table | Policy Name | Command | Using/With Check Expression (one row per policy) 