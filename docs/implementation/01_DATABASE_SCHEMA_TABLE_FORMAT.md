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
| Name | Description | SQL Reference/Notes |
|------|-------------|---------------------|
| question_stats | Aggregates question stats (answers, votes, etc.) | See schema for full SQL |

## Functions
| Name | Description | SQL Reference/Notes |
|------|-------------|---------------------|
| broadcast_comment_update | Notifies on comment changes | See schema for full SQL |
| broadcast_notification_update | Notifies on notification changes | See schema for full SQL |
| broadcast_vote_update | Broadcasts vote changes | See schema for full SQL |
| create_realtime_notifications | Creates notifications for answers/comments/votes | See schema for full SQL |

## Triggers
| Name | Table | Event/Timing | Function | Description |
|------|-------|--------------|----------|-------------|
| file_deletion_trigger | filemodels | AFTER DELETE | handle_file_deletion | Cleans up files on delete |
| file_update_trigger | filemodels | AFTER UPDATE | handle_file_update | Cleans up old files on update |
| realtime_answer_notification_update_trigger | answer_notifications | AFTER INSERT/DELETE/UPDATE | broadcast_notification_update | Broadcasts answer notification changes |
| realtime_answer_vote_notification_trigger | answer_votes | AFTER INSERT | create_realtime_notifications | Notifies on answer votes |
| realtime_answer_vote_update_trigger | answer_votes | AFTER INSERT/DELETE/UPDATE | broadcast_vote_update | Broadcasts answer vote changes |
| realtime_comment_notification_trigger | answer_comments | AFTER INSERT | create_realtime_notifications | Notifies on answer comments |
| realtime_comment_update_trigger | answer_comments | AFTER INSERT/DELETE/UPDATE | broadcast_comment_update | Broadcasts answer comment changes |
| realtime_notification_creation_trigger | answers | AFTER INSERT | create_realtime_notifications | Notifies on new answers |
| realtime_notification_update_trigger | question_notifications | AFTER INSERT/DELETE/UPDATE | broadcast_notification_update | Broadcasts question notification changes |
| realtime_vote_notification_trigger | question_votes | AFTER INSERT | create_realtime_notifications | Notifies on question votes |
| realtime_vote_update_trigger | question_votes | AFTER INSERT/DELETE/UPDATE | broadcast_vote_update | Broadcasts question vote changes |

## RLS Policies
| Table | Policy Name | Command | Using/With Check Expression | Description |
|-------|-------------|---------|-----------------------------|-------------|
| answer_tags | AI can delete answer_tags | DELETE | USING (true) | Allows AI to delete answer tags |
| ai_answers | AI can insert ai_answers | INSERT | WITH CHECK (true) | Allows AI to insert ai answers |
| answer_tags | AI can insert answer_tags | INSERT | WITH CHECK (true) | Allows AI to insert answer tags |
| ai_answers | AI can select ai_answers | SELECT | USING (true) | Allows AI to select ai answers |
| answer_tags | AI can select answer_tags | SELECT | USING (true) | Allows AI to select answer tags |
| ai_answers | AI can update ai_answers | UPDATE | USING (true) | Allows AI to update ai answers |
| answer_tags | AI can update answer_tags | UPDATE | USING (true) | Allows AI to update answer tags |
| content_flags | Admins can delete any flag | DELETE | USING (admin role check) | Admins can delete any content flag |
| user_roles | Admins can insert roles | INSERT | WITH CHECK (admin role check) | Admins can insert user roles |
| chat_members | Admins can remove members | DELETE | USING (admin in chat) | Admins can remove chat members |
| chat_members | Admins can update admin status | UPDATE | USING (admin in chat) | Admins can update admin status |
| content_flags | Admins can update any flag | UPDATE | USING (admin role check) | Admins can update any content flag |
| profiles | Admins can update any profile | UPDATE | USING (admin role check) | Admins can update any profile |
| chats | Admins can update group info | UPDATE | USING (admin in chat) | Admins can update group info |
| user_roles | Admins can update roles | UPDATE | USING (admin role check) | Admins can update user roles |
| content_flags | Admins can view all flags | SELECT | USING (admin role check) | Admins can view all content flags |
| user_roles | Admins can view all roles | SELECT | USING (admin role check) | Admins can view all user roles |
| content_flags | All users can view all flags | SELECT | USING (authenticated) | All users can view content flags |
| user_roles | Allow all users to read admin roles | SELECT | USING (true) | All users can read admin roles |
| profiles | Allow users to update their own last_seen | UPDATE | USING (auth.uid = id) | Users can update their own last_seen |
| chat_members | Allow users to update their own typing status | UPDATE | USING (auth.uid = user_id) | Users can update their own typing status |
| answer_comments | Answer comments are viewable by everyone | SELECT | USING (true) | All users can view answer comments |
| answer_votes | Answer votes are viewable by everyone | SELECT | USING (true) | All users can view answer votes |
| chat_members | Anyone can add any user to chat | INSERT | WITH CHECK (true) | Anyone can add users to chat |
| answers | Authenticated users can delete answers | DELETE | USING (authenticated) | Authenticated users can delete answers |
| posts | Authenticated users can delete own posts | DELETE | USING (auth.uid = user_id) | Users can delete their own posts |
| questions | Authenticated users can delete questions | DELETE | USING (authenticated) | Authenticated users can delete questions |
| answers | Authenticated users can insert answers | INSERT | WITH CHECK (authenticated) | Authenticated users can insert answers |
| posts | Authenticated users can insert posts | INSERT | WITH CHECK (auth.uid = user_id) | Users can insert their own posts |
| questions | Authenticated users can insert questions | INSERT | WITH CHECK (authenticated) | Authenticated users can insert questions |
| answers | Authenticated users can select answers | SELECT | USING (authenticated) | Authenticated users can select answers |
| questions | Authenticated users can select questions | SELECT | USING (authenticated) | Authenticated users can select questions |
| answers | Authenticated users can update answers | UPDATE | USING (authenticated) | Authenticated users can update answers |
| posts | Authenticated users can update own posts | UPDATE | USING (auth.uid = user_id) | Users can update their own posts |
| questions | Authenticated users can update questions | UPDATE | USING (authenticated) | Authenticated users can update questions |
| posts | Authenticated users can view posts | SELECT | USING (authenticated) | Authenticated users can view posts |
| profiles | Public can view all profiles | SELECT | USING (true) | All users can view all profiles |
| question_tags | Question owners can manage tags | ALL | USING (question owner check) | Question owners can manage tags |
| question_tags | Question tags are viewable by everyone | SELECT | USING (true) | All users can view question tags |
| question_votes | Question votes are viewable by everyone | SELECT | USING (true) | All users can view question votes |
| answer_notifications | System can insert answer notifications | INSERT | WITH CHECK (true) | System can insert answer notifications |
| question_notifications | System can insert notifications | INSERT | WITH CHECK (true) | System can insert question notifications |
| filemodels | Users can delete own files | DELETE | USING (auth.uid = user_id) | Users can delete their own files |
| answer_comments | Users can delete their own comments | DELETE | USING (auth.uid = user_id) | Users can delete their own answer comments |
| comments | Users can delete their own comments | DELETE | USING (auth.uid = user_id) | Users can delete their own comments |
| filemodels | Users can delete their own files | DELETE | USING (auth.uid = user_id) | Users can delete their own files |
| followers | Users can delete their own follows | DELETE | USING (auth.uid = follower_id) | Users can delete their own follows |
| likes | Users can delete their own likes | DELETE | USING (auth.uid = user_id) | Users can delete their own likes |
| chat_messages | Users can delete their own messages | DELETE | USING (auth.uid = user_id) | Users can delete their own messages |
| answer_votes | Users can delete their own votes | DELETE | USING (auth.uid = user_id) | Users can delete their own answer votes |
| question_votes | Users can delete their own votes | DELETE | USING (auth.uid = user_id) | Users can delete their own question votes |
| chat_members | Users can delete themselves from chat | DELETE | USING (auth.uid = user_id) | Users can remove themselves from chat |
| content_flags | Users can flag posts | INSERT | WITH CHECK (auth.uid = flagged_by_user_id) | Users can flag posts |
| followers | Users can follow/unfollow | INSERT | WITH CHECK (auth.uid = follower_id) | Users can follow/unfollow |
| chat_messages | Users can insert chat messages | INSERT | WITH CHECK (auth.uid = user_id) | Users can insert their own chat messages |
| chats | Users can insert chats | INSERT | WITH CHECK (true) | Users can create chats |
| filemodels | Users can insert files | INSERT | WITH CHECK (auth.uid = user_id) | Users can insert their own files |
| notifications | Users can insert notifications | INSERT | WITH CHECK (true) | Users can insert notifications |
| filemodels | Users can insert own files | INSERT | WITH CHECK (auth.uid = user_id) | Users can insert their own files |
| answer_comments | Users can insert their own comments | INSERT | WITH CHECK (auth.uid = user_id) | Users can insert their own answer comments |
| comments | Users can insert their own comments | INSERT | WITH CHECK (auth.uid = user_id) | Users can insert their own comments |
| profiles | Users can insert their own profile | INSERT | WITH CHECK (auth.uid = id) | Users can insert their own profile |
| likes | Users can like posts | INSERT | WITH CHECK (auth.uid = user_id) | Users can like posts |
| comment_likes | Users can like/unlike comments | INSERT | WITH CHECK (auth.uid = user_id) | Users can like/unlike comments |
| comment_likes | Users can unlike their own comment like | DELETE | USING (auth.uid = user_id) | Users can unlike their own comment like |
| filemodels | Users can update own files | UPDATE | USING (auth.uid = user_id) | Users can update their own files |
| notifications | Users can update their notifications | UPDATE | USING (auth.uid = user_id) | Users can update their notifications |
| answer_notifications | Users can update their own answer notifications | UPDATE | USING (auth.uid = user_id) | Users can update their own answer notifications |
| answer_comments | Users can update their own comments | UPDATE | USING (auth.uid = user_id) | Users can update their own answer comments |
| comments | Users can update their own comments | UPDATE | USING (auth.uid = user_id) | Users can update their own comments |
| filemodels | Users can update their own files | UPDATE | USING (auth.uid = user_id) | Users can update their own files |
| question_notifications | Users can update their own notifications | UPDATE | USING (auth.uid = user_id) | Users can update their own notifications |
| profiles | Users can update their own profile | UPDATE | USING (auth.uid = id) | Users can update their own profile |
| answer_votes | Users can update their own votes | UPDATE | USING (auth.uid = user_id) | Users can update their own answer votes |
| question_votes | Users can update their own votes | UPDATE | USING (auth.uid = user_id) | Users can update their own question votes |
| comment_likes | Users can view all comment likes | SELECT | USING (true) | All users can view comment likes |
| comments | Users can view all comments | SELECT | USING (true) | All users can view comments |
| chat_members | Users can view chat members | SELECT | USING (true) | All users can view chat members |
| chat_messages | Users can view chat messages | SELECT | USING (true) | All users can view chat messages |
| chats | Users can view chats | SELECT | USING (true) | All users can view chats |
| followers | Users can view followers | SELECT | USING (true) | All users can view followers |
| likes | Users can view likes | SELECT | USING (true) | All users can view likes |
| filemodels | Users can view own and public files | SELECT | USING ((auth.uid = user_id) OR (is_public = true)) | Users can view their own and public files |
| filemodels | Users can view public files | SELECT | USING (is_public OR (auth.uid = user_id)) | Users can view public files |
| notifications | Users can view their notifications | SELECT | USING (auth.uid = user_id) | Users can view their notifications |
| answer_notifications | Users can view their own answer notifications | SELECT | USING (auth.uid = user_id) | Users can view their own answer notifications |
| question_notifications | Users can view their own notifications | SELECT | USING (auth.uid = user_id) | Users can view their own notifications |
| profiles | Users can view their own profile | SELECT | USING (auth.uid = id) | Users can view their own profile |
| user_roles | Users can view their own roles | SELECT | USING (auth.uid = user_id) | Users can view their own roles |
| answer_votes | Users can vote on answers | INSERT | WITH CHECK (auth.uid = user_id) | Users can vote on answers |
| question_votes | Users can vote on questions | INSERT | WITH CHECK (auth.uid = user_id) | Users can vote on questions |

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
| Name | Description | SQL Reference/Notes |
|------|-------------|---------------------|
| question_stats | Aggregates question stats (answers, votes, etc.) | See schema for full SQL |

## Functions
| Name | Description | SQL Reference/Notes |
|------|-------------|---------------------|
| broadcast_comment_update | Notifies on comment changes | See schema for full SQL |
| broadcast_notification_update | Notifies on notification changes | See schema for full SQL |
| broadcast_vote_update | Broadcasts vote changes | See schema for full SQL |
| create_realtime_notifications | Creates notifications for answers/comments/votes | See schema for full SQL |

## Triggers
| Name | Table | Event/Timing | Function | Description |
|------|-------|--------------|----------|-------------|
| file_deletion_trigger | filemodels | AFTER DELETE | handle_file_deletion | Cleans up files on delete |
| file_update_trigger | filemodels | AFTER UPDATE | handle_file_update | Cleans up old files on update |
| realtime_answer_notification_update_trigger | answer_notifications | AFTER INSERT/DELETE/UPDATE | broadcast_notification_update | Broadcasts answer notification changes |
| realtime_answer_vote_notification_trigger | answer_votes | AFTER INSERT | create_realtime_notifications | Notifies on answer votes |
| realtime_answer_vote_update_trigger | answer_votes | AFTER INSERT/DELETE/UPDATE | broadcast_vote_update | Broadcasts answer vote changes |
| realtime_comment_notification_trigger | answer_comments | AFTER INSERT | create_realtime_notifications | Notifies on answer comments |
| realtime_comment_update_trigger | answer_comments | AFTER INSERT/DELETE/UPDATE | broadcast_comment_update | Broadcasts answer comment changes |
| realtime_notification_creation_trigger | answers | AFTER INSERT | create_realtime_notifications | Notifies on new answers |
| realtime_notification_update_trigger | question_notifications | AFTER INSERT/DELETE/UPDATE | broadcast_notification_update | Broadcasts question notification changes |
| realtime_vote_notification_trigger | question_votes | AFTER INSERT | create_realtime_notifications | Notifies on question votes |
| realtime_vote_update_trigger | question_votes | AFTER INSERT/DELETE/UPDATE | broadcast_vote_update | Broadcasts question vote changes |

## RLS Policies

_RLS Policies will be listed here._ 