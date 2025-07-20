# Focus Hub Database Schema (Tabular Format)

## User Management Tables

### Table: profiles

| Column Name  | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, FK → auth.users(id), NOT NULL                      |
| email        | text        | NOT NULL                                               |
| full_name    | text        |                                                        |
| avatar_url   | text        |                                                        |
| bio          | text        |                                                        |
| location     | text        |                                                        |
| website      | text        |                                                        |
| settings     | jsonb       |                                                        |
| created_at   | timestamptz | DEFAULT now(), NOT NULL                                |
| updated_at   | timestamptz | DEFAULT now(), NOT NULL                                |
| member_type  | text        | DEFAULT 'student', CHECK (IN 'student','alumni')       |
| status       | text        | DEFAULT 'active'                                       |
| last_seen    | timestamptz | DEFAULT now()                                          |

_See Indexes section below for index details._

---

### Table: user_roles

| Column Name | Data Type   | Constraints/Description                        |
|-------------|------------|------------------------------------------------|
| id          | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL        |
| user_id     | uuid        | NOT NULL, FK → profiles(id)                    |
| role        | app_role    | DEFAULT 'user'                                 |
| created_at  | timestamptz | DEFAULT now()                                  |

_See Indexes section below for index details._

## Social Feed Tables

### Table: posts

| Column Name | Data Type   | Constraints/Description                        |
|-------------|------------|------------------------------------------------|
| id          | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL        |
| user_id     | uuid        | FK → profiles(id)                              |
| content     | text        | NOT NULL                                       |
| media_url   | text        |                                                |
| image_url   | text        |                                                |
| file_url    | text        |                                                |
| is_deleted  | boolean     | DEFAULT FALSE                                  |
| flag_status | text        | DEFAULT 'normal'                               |
| created_at  | timestamptz | DEFAULT now()                                  |
| updated_at  | timestamptz | DEFAULT now()                                  |

_See Indexes section below for index details._

---

### Table: comments

| Column Name | Data Type   | Constraints/Description                        |
|-------------|------------|------------------------------------------------|
| id          | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL        |
| post_id     | uuid        | FK → posts(id)                                 |
| user_id     | uuid        | FK → profiles(id)                              |
| content     | text        | NOT NULL                                       |
| parent_id   | uuid        | FK → comments(id)                              |
| created_at  | timestamptz | DEFAULT now()                                  |

_See Indexes section below for index details._

---

### Table: likes

| Column Name | Data Type   | Constraints/Description                        |
|-------------|------------|------------------------------------------------|
| id          | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL        |
| post_id     | uuid        | FK → posts(id)                                 |
| user_id     | uuid        | FK → profiles(id)                              |
| created_at  | timestamptz | DEFAULT now()                                  |

_See Indexes section below for index details._

---

### Table: comment_likes

| Column Name | Data Type   | Constraints/Description                        |
|-------------|------------|------------------------------------------------|
| id          | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL        |
| comment_id  | uuid        | FK → comments(id)                              |
| user_id     | uuid        | FK → profiles(id)                              |
| created_at  | timestamptz | DEFAULT now()                                  |

_See Indexes section below for index details._

## Q&A Module Tables

### Table: questions

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| user_id      | uuid        | FK → profiles(id), NOT NULL                             |
| title        | text        | NOT NULL                                                |
| body         | text        | NOT NULL                                                |
| category     | text        |                                                         |
| created_at   | timestamptz | DEFAULT now(), NOT NULL                                 |
| updated_at   | timestamptz | DEFAULT now(), NOT NULL                                 |
| status       | text        | DEFAULT 'active'                                        |
| view_count   | bigint      | DEFAULT 0, NOT NULL                                     |

_See Indexes section below for index details._

---

### Table: answers

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| question_id  | uuid        | FK → questions(id), NOT NULL                            |
| user_id      | uuid        | FK → profiles(id), NOT NULL                             |
| body         | text        | NOT NULL                                                |
| created_at   | timestamptz | DEFAULT now(), NOT NULL                                 |
| updated_at   | timestamptz | DEFAULT now(), NOT NULL                                 |
| is_accepted  | boolean     | DEFAULT false, NOT NULL                                 |

_See Indexes section below for index details._

---

### Table: question_votes

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| question_id  | uuid        | FK → questions(id), NOT NULL                            |
| user_id      | uuid        | FK → profiles(id), NOT NULL                             |
| vote_value   | integer     | NOT NULL                                                |

_See Indexes section below for index details._

---

### Table: answer_votes

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| answer_id    | uuid        | FK → answers(id), NOT NULL                              |
| user_id      | uuid        | FK → profiles(id), NOT NULL                             |
| vote_value   | integer     | NOT NULL                                                |

_See Indexes section below for index details._

---

### Table: question_tags

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| question_id  | uuid        | FK → questions(id), NOT NULL                            |
| tag_name     | text        | NOT NULL                                                |

_See Indexes section below for index details._

---

### Table: ai_answers

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| question_id  | uuid        | FK → questions(id), NOT NULL                            |
| user_id      | uuid        | FK → profiles(id), NOT NULL                             |
| body         | text        | NOT NULL                                                |
| created_at   | timestamptz | DEFAULT now(), NOT NULL                                 |
| updated_at   | timestamptz | DEFAULT now(), NOT NULL                                 |

_See Indexes section below for index details._

---

### Table: answer_comments

| Column Name        | Data Type   | Constraints/Description                                 |
|-------------------|------------|---------------------------------------------------------|
| id                | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| answer_id         | uuid        | FK → answers(id), NOT NULL                              |
| user_id           | uuid        | FK → profiles(id), NOT NULL                             |
| content           | text        | NOT NULL                                                |
| created_at        | timestamptz | DEFAULT now(), NOT NULL                                 |
| parent_comment_id | uuid        | FK → answer_comments(id)                                |

_See Indexes section below for index details._

---

### Table: answer_tags

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| answer_id    | uuid        | FK → answers(id), NOT NULL                              |
| tag_name     | text        | NOT NULL                                                |

_See Indexes section below for index details._

---

### Table: votes

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| user_id      | uuid        | FK → profiles(id), NOT NULL                             |
| vote_value   | integer     | NOT NULL                                                |

_See Indexes section below for index details._

---

### Table: reputation_events

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| user_id      | uuid        | FK → profiles(id), NOT NULL                             |
| event_type   | text        | NOT NULL                                                |
| created_at   | timestamptz | DEFAULT now(), NOT NULL                                 |

_See Indexes section below for index details._

---

### Table: tags

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| tag_name     | text        | NOT NULL                                                |

_See Indexes section below for index details._

## Chat System Tables

### Table: chats

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| created_at   | timestamptz | DEFAULT now(), NOT NULL                                 |
| updated_at   | timestamptz | DEFAULT now(), NOT NULL                                 |

_See Indexes section below for index details._

---

### Table: chat_members

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| chat_id      | uuid        | FK → chats(id), NOT NULL                                |
| user_id      | uuid        | FK → profiles(id), NOT NULL                             |
| is_admin     | boolean     | DEFAULT false, NOT NULL                                 |
| joined_at    | timestamptz | DEFAULT now(), NOT NULL                                 |

_See Indexes section below for index details._

---

### Table: chat_messages

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| chat_id      | uuid        | FK → chats(id), NOT NULL                                |
| user_id      | uuid        | FK → profiles(id), NOT NULL                             |
| content      | text        | NOT NULL                                                |
| created_at   | timestamptz | DEFAULT now(), NOT NULL                                 |

_See Indexes section below for index details._

## Resource Sharing Tables

### Table: filemodels

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| user_id      | uuid        | FK → profiles(id), NOT NULL                             |
| file_name    | text        | NOT NULL                                                |
| description  | text        |                                                        |
| file_url     | text        |                                                        |
| image_url    | text        |                                                        |
| is_public    | boolean     | DEFAULT false, NOT NULL                                 |
| created_at   | timestamptz | DEFAULT now(), NOT NULL                                 |
| updated_at   | timestamptz | DEFAULT now(), NOT NULL                                 |

_See Indexes section below for index details._

## Social Features Tables

### Table: followers

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| follower_id  | uuid        | FK → profiles(id), NOT NULL                             |
| following_id | uuid        | FK → profiles(id), NOT NULL                             |

_See Indexes section below for index details._

## Notification Tables

### Table: notifications

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| user_id      | uuid        | FK → profiles(id), NOT NULL                             |
| notification_type | text   | NOT NULL                                                |
| message      | text        | NOT NULL                                                |
| is_read      | boolean     | DEFAULT false, NOT NULL                                 |
| created_at   | timestamptz | DEFAULT now(), NOT NULL                                 |

_See Indexes section below for index details._

---

### Table: question_notifications

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| question_id  | uuid        | FK → questions(id), NOT NULL                            |
| user_id      | uuid        | FK → profiles(id), NOT NULL                             |
| notification_type | text   | NOT NULL                                                |
| message      | text        | NOT NULL                                                |
| is_read      | boolean     | DEFAULT false, NOT NULL                                 |
| created_at   | timestamptz | DEFAULT now(), NOT NULL                                 |

_See Indexes section below for index details._

---

### Table: answer_notifications

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| answer_id    | uuid        | FK → answers(id), NOT NULL                              |
| user_id      | uuid        | FK → profiles(id), NOT NULL                             |
| notification_type | text   | NOT NULL                                                |
| message      | text        | NOT NULL                                                |
| is_read      | boolean     | DEFAULT false, NOT NULL                                 |
| created_at   | timestamptz | DEFAULT now(), NOT NULL                                 |

_See Indexes section below for index details._

## Moderation Tables

### Table: content_flags

| Column Name   | Data Type   | Constraints/Description                                 |
|--------------|------------|---------------------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| comment_id   | uuid        | FK → comments(id)                                       |
| flagged_by_user_id | uuid  | FK → profiles(id)                                       |
| post_id      | uuid        | FK → posts(id)                                          |

_See Indexes section below for index details._

## Indexes

| Table        | Index Name                  | Columns         | Type    | Condition |
|--------------|----------------------------|-----------------|---------|-----------|
| profiles     | profiles_pkey               | id              | PK      |           |
| user_roles   | user_roles_pkey             | id              | PK      |           |
| user_roles   | user_roles_user_id_role_key | user_id, role   | UNIQUE  |           |
| posts        | posts_pkey                  | id              | PK      |           |
| posts        | idx_posts_user_id           | user_id         | INDEX   |           |
| comments     | comments_pkey               | id              | PK      |           |
| comments     | comments_post_id_fkey       | post_id         | INDEX   |           |
| comments     | comments_user_id_fkey       | user_id         | INDEX   |           |
| comments     | comments_parent_id_fkey     | parent_id       | INDEX   |           |
| likes        | likes_pkey                  | id              | PK      |           |
| likes        | idx_likes_post_id           | post_id         | INDEX   |           |
| comment_likes| comment_likes_pkey          | id              | PK      |           |
| comment_likes| comment_likes_comment_id_user_id_key | comment_id, user_id | UNIQUE |           |
| questions    | questions_pkey              | id              | PK      |           |
| questions    | idx_questions_user_id       | user_id         | INDEX   |           |
| questions    | idx_questions_category      | category        | INDEX   |           |
| questions    | idx_questions_status        | status          | INDEX   |           |
| questions    | idx_questions_created_at    | created_at      | INDEX   | DESC      |
| questions    | idx_questions_title_gin     | title           | GIN     |           |
| questions    | idx_questions_body_gin      | body            | GIN     |           |
| answers      | answers_pkey                | id              | PK      |           |
| answers      | idx_answers_question_id     | question_id     | INDEX   |           |
| answers      | idx_answers_user_id         | user_id         | INDEX   |           |
| answers      | idx_answers_is_accepted     | is_accepted     | INDEX   |           |
| answers      | idx_answers_created_at      | created_at      | INDEX   | DESC      |
| question_votes| question_votes_pkey        | id              | PK      |           |
| question_votes| idx_question_votes_question_id | question_id | INDEX   |           |
| question_votes| idx_question_votes_user_id | user_id         | INDEX   |           |
| answer_votes | answer_votes_pkey           | id              | PK      |           |
| answer_votes | idx_answer_votes_answer_id  | answer_id       | INDEX   |           |
| answer_votes | idx_answer_votes_user_id    | user_id         | INDEX   |           |
| question_tags| question_tags_pkey          | id              | PK      |           |
| question_tags| idx_question_tags_question_id| question_id    | INDEX   |           |
| question_tags| idx_question_tags_tag_name  | tag_name        | INDEX   |           |
| ai_answers   | ai_answers_pkey             | id              | PK      |           |
| ai_answers   | idx_ai_answers_question_id  | question_id     | INDEX   |           |
| answer_comments| answer_comments_pkey       | id              | PK      |           |
| answer_comments| idx_answer_comments_answer_id | answer_id    | INDEX   |           |
| answer_comments| idx_answer_comments_user_id | user_id        | INDEX   |           |
| answer_comments| idx_answer_comments_parent_comment_id | parent_comment_id | INDEX |           |
| answer_tags  | answer_tags_pkey            | id              | PK      |           |
| answer_tags  | idx_answer_tags_answer_id   | answer_id       | INDEX   |           |
| answer_tags  | idx_answer_tags_tag_name    | tag_name        | INDEX   |           |
| votes        | votes_pkey                  | id              | PK      |           |
| reputation_events| reputation_events_pkey   | id              | PK      |           |
| tags         | tags_pkey                   | id              | PK      |           |
| chats        | chats_pkey                  | id              | PK      |           |
| chat_members | chat_members_pkey           | id              | PK      |           |
| chat_members | idx_chat_members_chat_id    | chat_id         | INDEX   |           |
| chat_members | idx_chat_members_user_id    | user_id         | INDEX   |           |
| chat_messages| chat_messages_pkey          | id              | PK      |           |
| chat_messages| idx_chat_messages_chat_id   | chat_id         | INDEX   |           |
| filemodels   | filemodels_pkey             | id              | PK      |           |
| filemodels   | idx_filemodels_user_id      | user_id         | INDEX   |           |
| followers    | followers_pkey              | id              | PK      |           |
| followers    | idx_followers_follower_id   | follower_id     | INDEX   |           |
| followers    | idx_followers_following_id  | following_id    | INDEX   |           |
| notifications| notifications_pkey          | id              | PK      |           |
| notifications| idx_notifications_user_id   | user_id         | INDEX   |           |
| question_notifications| question_notifications_pkey | id      | PK      |           |
| question_notifications| idx_question_notifications_user_id | user_id | INDEX |           |
| question_notifications| idx_question_notifications_question_id | question_id | INDEX |           |
| question_notifications| idx_question_notifications_is_read | is_read | INDEX |           |
| question_notifications| idx_question_notifications_created_at | created_at | INDEX | DESC      |
| answer_notifications| answer_notifications_pkey | id        | PK      |           |
| answer_notifications| idx_answer_notifications_answer_id | answer_id | INDEX |           |
| answer_notifications| idx_answer_notifications_user_id | user_id | INDEX |           |
| answer_notifications| idx_answer_notifications_is_read | is_read | INDEX |           |
| answer_notifications| idx_answer_notifications_created_at | created_at | INDEX | DESC      |
| content_flags | content_flags_pkey            | id              | PK      |           |

## Views

| Name | Definition |
|------|------------|
| question_stats | 
```sql
CREATE OR REPLACE VIEW "public"."question_stats" AS
 SELECT "q"."id",
    "q"."title",
    "q"."view_count",
    count(DISTINCT "a"."id") AS "answer_count",
    count(DISTINCT "qv"."id") AS "vote_count",
    (sum(CASE WHEN ("qv"."vote_value" = 1) THEN 1 ELSE 0 END) - sum(CASE WHEN ("qv"."vote_value" = '-1'::integer) THEN 1 ELSE 0 END)) AS "vote_score"
   FROM (("public"."questions" "q"
     LEFT JOIN "public"."answers" "a" ON (("q"."id" = "a"."question_id")))
     LEFT JOIN "public"."question_votes" "qv" ON (("q"."id" = "qv"."question_id")))
  GROUP BY "q"."id", "q"."title", "q"."view_count";
```
|

## Functions

| Name | Definition |
|------|------------|
| broadcast_comment_update | 
```sql
CREATE OR REPLACE FUNCTION "public"."broadcast_comment_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    comment_data JSONB;
BEGIN
    -- Build comment data
    comment_data := json_build_object(
        'id', NEW.id,
        'answer_id', NEW.answer_id,
        'user_id', NEW.user_id,
        'body', NEW.body,
        'parent_comment_id', NEW.parent_comment_id,
        'created_at', NEW.created_at,
        'action', TG_OP
    );
    
    -- Broadcast the comment update
    PERFORM pg_notify(
        'comment_update',
        comment_data::text
    );
    
    RETURN NEW;
END;
$$;
```
|
| broadcast_notification_update | 
```sql
CREATE OR REPLACE FUNCTION "public"."broadcast_notification_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    notification_data JSONB;
BEGIN
    -- Build notification data
    notification_data := json_build_object(
        'id', NEW.id,
        'user_id', NEW.user_id,
        'notification_type', NEW.notification_type,
        'message', NEW.message,
        'is_read', NEW.is_read,
        'related_id', NEW.related_id,
        'created_at', NEW.created_at,
        'action', TG_OP
    );
    
    -- Broadcast the notification update
    PERFORM pg_notify(
        'notification_update',
        notification_data::text
    );
    
    RETURN NEW;
END;
$$;
```
|
| broadcast_vote_update | 
```sql
CREATE OR REPLACE FUNCTION "public"."broadcast_vote_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    vote_count INTEGER;
    vote_score INTEGER;
    target_type TEXT;
    target_id UUID;
BEGIN
    -- Determine if this is a question or answer vote
    IF TG_TABLE_NAME = 'question_votes' THEN
        target_type := 'question';
        target_id := NEW.question_id;
        
        -- Calculate vote count and score for question
        SELECT 
            COUNT(*),
            COALESCE(SUM(vote_value), 0)
        INTO vote_count, vote_score
        FROM question_votes 
        WHERE question_id = NEW.question_id;
        
        -- Update question view_count (we'll use this for vote count)
        UPDATE questions 
        SET view_count = vote_count 
        WHERE id = NEW.question_id;
        
    ELSIF TG_TABLE_NAME = 'answer_votes' THEN
        target_type := 'answer';
        target_id := NEW.answer_id;
        
        -- Calculate vote count and score for answer
        SELECT 
            COUNT(*),
            COALESCE(SUM(vote_value), 0)
        INTO vote_count, vote_score
        FROM answer_votes 
        WHERE answer_id = NEW.answer_id;
    END IF;
    
    -- Broadcast the update via realtime
    PERFORM pg_notify(
        'vote_update',
        json_build_object(
            'target_type', target_type,
            'target_id', target_id,
            'vote_count', vote_count,
            'vote_score', vote_score,
            'user_id', NEW.user_id,
            'vote_value', NEW.vote_value
        )::text
    );
    
    RETURN NEW;
END;
$$;
```
|
| create_realtime_notifications | 
```sql
CREATE OR REPLACE FUNCTION "public"."create_realtime_notifications"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Create notification for new answer
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'answers' THEN
        INSERT INTO question_notifications (
            question_id, 
            user_id, 
            notification_type, 
            message, 
            related_id
        )
        SELECT 
            NEW.question_id,
            q.user_id,
            'answer',
            'Someone answered your question: ' || LEFT(q.title, 50) || '...',
            NEW.id
        FROM questions q
        WHERE q.id = NEW.question_id AND q.user_id != NEW.user_id;
    END IF;
    
    -- Create notification for new comment
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'answer_comments' THEN
        INSERT INTO answer_notifications (
            answer_id,
            user_id,
            notification_type,
            message,
            related_id
        )
        SELECT 
            NEW.answer_id,
            a.user_id,
            'comment',
            'Someone commented on your answer',
            NEW.id
        FROM answers a
        WHERE a.id = NEW.answer_id AND a.user_id != NEW.user_id;
    END IF;
    
    -- Create notification for vote
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'question_votes' THEN
        INSERT INTO question_notifications (
            question_id,
            user_id,
            notification_type,
            message,
            related_id
        )
        SELECT 
            NEW.question_id,
            q.user_id,
            'vote',
            CASE 
                WHEN NEW.vote_value = 1 THEN 'Someone upvoted your question'
                ELSE 'Someone downvoted your question'
            END,
            NEW.id
        FROM questions q
        WHERE q.id = NEW.question_id AND q.user_id != NEW.user_id;
    END IF;
    
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'answer_votes' THEN
        INSERT INTO answer_notifications (
            answer_id,
            user_id,
            notification_type,
            message,
            related_id
        )
        SELECT 
            NEW.answer_id,
            a.user_id,
            'vote',
            CASE 
                WHEN NEW.vote_value = 1 THEN 'Someone upvoted your answer'
                ELSE 'Someone downvoted your answer'
            END,
            NEW.id
        FROM answers a
        WHERE a.id = NEW.answer_id AND a.user_id != NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;
```
|

## Triggers

| Name | Table | Event | Function | Definition |
|------|-------|-------|----------|------------|
| file_deletion_trigger | filemodels | AFTER DELETE | handle_file_deletion | 
```sql
CREATE OR REPLACE TRIGGER "file_deletion_trigger" AFTER DELETE ON "public"."filemodels" FOR EACH ROW EXECUTE FUNCTION "public"."handle_file_deletion"();
```
|
| file_update_trigger | filemodels | AFTER UPDATE | handle_file_update | 
```sql
CREATE OR REPLACE TRIGGER "file_update_trigger" AFTER UPDATE ON "public"."filemodels" FOR EACH ROW EXECUTE FUNCTION "public"."handle_file_update"();
```
|
| realtime_answer_notification_update_trigger | answer_notifications | AFTER INSERT OR DELETE OR UPDATE | broadcast_notification_update | 
```sql
CREATE OR REPLACE TRIGGER "realtime_answer_notification_update_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."answer_notifications" FOR EACH ROW EXECUTE FUNCTION "public"."broadcast_notification_update"();
```
|
| realtime_answer_vote_notification_trigger | answer_votes | AFTER INSERT | create_realtime_notifications | 
```sql
CREATE OR REPLACE TRIGGER "realtime_answer_vote_notification_trigger" AFTER INSERT ON "public"."answer_votes" FOR EACH ROW EXECUTE FUNCTION "public"."create_realtime_notifications"();
```
|
| realtime_answer_vote_update_trigger | answer_votes | AFTER INSERT OR DELETE OR UPDATE | broadcast_vote_update | 
```sql
CREATE OR REPLACE TRIGGER "realtime_answer_vote_update_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."answer_votes" FOR EACH ROW EXECUTE FUNCTION "public"."broadcast_vote_update"();
```
|
| realtime_comment_notification_trigger | answer_comments | AFTER INSERT | create_realtime_notifications | 
```sql
CREATE OR REPLACE TRIGGER "realtime_comment_notification_trigger" AFTER INSERT ON "public"."answer_comments" FOR EACH ROW EXECUTE FUNCTION "public"."create_realtime_notifications"();
```
|
| realtime_comment_update_trigger | answer_comments | AFTER INSERT OR DELETE OR UPDATE | broadcast_comment_update | 
```sql
CREATE OR REPLACE TRIGGER "realtime_comment_update_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."answer_comments" FOR EACH ROW EXECUTE FUNCTION "public"."broadcast_comment_update"();
```
|
| realtime_notification_creation_trigger | answers | AFTER INSERT | create_realtime_notifications | 
```sql
CREATE OR REPLACE TRIGGER "realtime_notification_creation_trigger" AFTER INSERT ON "public"."answers" FOR EACH ROW EXECUTE FUNCTION "public"."create_realtime_notifications"();
```
|
| realtime_notification_update_trigger | question_notifications | AFTER INSERT OR DELETE OR UPDATE | broadcast_notification_update | 
```sql
CREATE OR REPLACE TRIGGER "realtime_notification_update_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."question_notifications" FOR EACH ROW EXECUTE FUNCTION "public"."broadcast_notification_update"();
```
|
| realtime_vote_notification_trigger | question_votes | AFTER INSERT | create_realtime_notifications | 
```sql
CREATE OR REPLACE TRIGGER "realtime_vote_notification_trigger" AFTER INSERT ON "public"."question_votes" FOR EACH ROW EXECUTE FUNCTION "public"."create_realtime_notifications"();
```
|
| realtime_vote_update_trigger | question_votes | AFTER INSERT OR DELETE OR UPDATE | broadcast_vote_update | 
```sql
CREATE OR REPLACE TRIGGER "realtime_vote_update_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."question_votes" FOR EACH ROW EXECUTE FUNCTION "public"."broadcast_vote_update"();
```
|

## RLS Policies

_RLS Policies will be listed here._ 