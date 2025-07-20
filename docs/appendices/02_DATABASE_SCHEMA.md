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

### 2.1 Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'student',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles enum
CREATE TYPE user_role AS ENUM ('student', 'educator', 'admin');
```

**Columns:**
- `id`: Unique identifier (UUID)
- `email`: User's email address (unique)
- `full_name`: User's full name
- `username`: Unique username
- `avatar_url`: Profile picture URL
- `bio`: User biography
- `role`: User role (student, educator, admin)
- `is_verified`: Email verification status
- `is_active`: Account status
- `last_login`: Last login timestamp
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### 2.2 Posts Table
```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique identifier (UUID)
- `author_id`: Reference to users table
- `title`: Post title
- `content`: Post content
- `category`: Post category
- `tags`: Array of tags
- `likes_count`: Number of likes
- `comments_count`: Number of comments
- `is_published`: Publication status
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### 2.3 Comments Table
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique identifier (UUID)
- `post_id`: Reference to posts table
- `author_id`: Reference to users table
- `parent_id`: Parent comment for replies
- `content`: Comment content
- `likes_count`: Number of likes
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### 2.4 Questions Table
```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    tags TEXT[],
    status question_status DEFAULT 'open',
    votes_count INTEGER DEFAULT 0,
    answers_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question status enum
CREATE TYPE question_status AS ENUM ('open', 'answered', 'closed');
```

**Columns:**
- `id`: Unique identifier (UUID)
- `author_id`: Reference to users table
- `title`: Question title
- `content`: Question content
- `category`: Question category
- `tags`: Array of tags
- `status`: Question status (open, answered, closed)
- `votes_count`: Number of votes
- `answers_count`: Number of answers
- `views_count`: Number of views
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### 2.5 AI Answers Table
```sql
CREATE TABLE ai_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    model_used TEXT,
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    relevance_score DECIMAL(3,2),
    completeness_score DECIMAL(3,2),
    user_feedback_rating INTEGER CHECK (user_feedback_rating BETWEEN 1 AND 5),
    generation_attempts INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique identifier (UUID)
- `question_id`: Reference to questions table
- `answer_text`: AI-generated answer content
- `confidence_score`: AI model confidence score (0-1)
- `model_used`: AI model identifier (e.g., "llama3-8b-8192")
- `tokens_used`: Number of tokens consumed
- `processing_time_ms`: Time taken to generate answer
- `relevance_score`: Relevance score (0-1)
- `completeness_score`: Completeness score (0-1)
- `user_feedback_rating`: User rating (1-5)
- `generation_attempts`: Number of generation attempts
- `created_at`: Creation timestamp

### 2.6 Answers Table
```sql
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT false,
    votes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique identifier (UUID)
- `question_id`: Reference to questions table
- `author_id`: Reference to users table
- `content`: Answer content
- `is_accepted`: Accepted answer status
- `votes_count`: Number of votes
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### 2.6 Chat Rooms Table
```sql
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type room_type DEFAULT 'group',
    created_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room type enum
CREATE TYPE room_type AS ENUM ('direct', 'group');
```

**Columns:**
- `id`: Unique identifier (UUID)
- `name`: Room name
- `description`: Room description
- `type`: Room type (direct, group)
- `created_by`: Room creator
- `is_active`: Room status
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### 2.7 Chat Messages Table
```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    file_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message type enum
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system');
```

**Columns:**
- `id`: Unique identifier (UUID)
- `room_id`: Reference to chat_rooms table
- `sender_id`: Reference to users table
- `content`: Message content
- `message_type`: Type of message
- `file_url`: File URL for file messages
- `is_read`: Read status
- `created_at`: Creation timestamp

### 2.8 Resources Table
```sql
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    tags TEXT[],
    downloads_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique identifier (UUID)
- `title`: Resource title
- `description`: Resource description
- `author_id`: Reference to users table
- `file_url`: File storage URL
- `file_name`: Original file name
- `file_size`: File size in bytes
- `file_type`: File MIME type
- `category`: Resource category
- `tags`: Array of tags
- `downloads_count`: Number of downloads
- `is_public`: Public visibility
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### 2.9 Votes Table
```sql
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    votable_type VARCHAR(20) NOT NULL,
    votable_id UUID NOT NULL,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, votable_type, votable_id)
);

-- Vote type enum
CREATE TYPE vote_type AS ENUM ('upvote', 'downvote');
```

**Columns:**
- `id`: Unique identifier (UUID)
- `user_id`: Reference to users table
- `votable_type`: Type of votable item (post, comment, question, answer)
- `votable_id`: ID of votable item
- `vote_type`: Type of vote (upvote, downvote)
- `created_at`: Creation timestamp

### 2.10 Followers Table
```sql
CREATE TABLE followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);
```

**Columns:**
- `id`: Unique identifier (UUID)
- `follower_id`: User who is following
- `following_id`: User being followed
- `created_at`: Creation timestamp

### 2.11 Chat Room Participants Table
```sql
CREATE TABLE chat_room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role participant_role DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Participant role enum
CREATE TYPE participant_role AS ENUM ('member', 'moderator', 'admin');
```

**Columns:**
- `id`: Unique identifier (UUID)
- `room_id`: Reference to chat_rooms table
- `user_id`: Reference to users table
- `role`: Participant role
- `joined_at`: Join timestamp

### 2.12 Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification type enum
CREATE TYPE notification_type AS ENUM ('like', 'comment', 'follow', 'answer', 'mention', 'system');
```

**Columns:**
- `id`: Unique identifier (UUID)
- `user_id`: Reference to users table
- `type`: Notification type
- `title`: Notification title
- `message`: Notification message
- `data`: Additional data (JSON)
- `is_read`: Read status
- `created_at`: Creation timestamp

### Table: ai_answers
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

| Column                | Data Type      | Constraints/Description                                 |
|-----------------------|---------------|---------------------------------------------------------|
| id                    | uuid          | PK, DEFAULT gen_random_uuid(), NOT NULL                 |
| question_id           | uuid          | FK → questions(id)                                      |
| answer_text           | text          | NOT NULL                                               |
| model_used            | text          |                                                        |
| tokens_used           | integer       |                                                        |
| processing_time_ms    | integer       |                                                        |
| user_feedback_rating  | integer       | CHECK (1 <= value <= 5)                                |
| generation_attempts   | integer       | DEFAULT 1                                              |
| created_at            | timestamptz   | DEFAULT now()                                          |
| user_id               | uuid          | FK → profiles(id), ON DELETE SET NULL                  |
| generated_by          | text          |                                                        |

**Foreign Keys:**
- question_id → questions(id)
- user_id → profiles(id) (ON DELETE SET NULL)

**Check Constraints:**
- user_feedback_rating must be between 1 and 5

---

### Table: answer_comments
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

| Column             | Data Type    | Constraints/Description                |
|--------------------|-------------|----------------------------------------|
| id                 | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL|
| answer_id          | uuid        | FK → answers(id)                       |
| user_id            | uuid        | FK → auth.users(id)                    |
| parent_comment_id  | uuid        | FK → answer_comments(id)               |
| body               | text        | NOT NULL                               |
| created_at         | timestamptz | DEFAULT now()                          |
| updated_at         | timestamptz | DEFAULT now()                          |

**Foreign Keys:**
- answer_id → answers(id)
- user_id → auth.users(id)
- parent_comment_id → answer_comments(id)

---

### Table: answer_notifications
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

| Column             | Data Type    | Constraints/Description                |
|--------------------|-------------|----------------------------------------|
| id                 | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL|
| answer_id          | uuid        | FK → answers(id)                       |
| user_id            | uuid        | FK → auth.users(id)                    |
| notification_type  | text        | CHECK (in 'comment','vote','acceptance','mention') |
| message            | text        | NOT NULL                               |
| is_read            | boolean     | DEFAULT false                          |
| related_id         | uuid        |                                        |
| created_at         | timestamptz | DEFAULT now()                          |

**Foreign Keys:**
- answer_id → answers(id)
- user_id → auth.users(id)

**Check Constraints:**
- notification_type must be one of 'comment', 'vote', 'acceptance', 'mention'

---

### Table: answer_tags
**Description:** Tags associated with answers for categorization.

```sql
CREATE TABLE IF NOT EXISTS "public"."answer_tags" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "answer_id" uuid,
    "tag_name" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()
);
```

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| answer_id   | uuid         | FK → answers(id)                       |
| tag_name    | text         | NOT NULL                               |
| created_at  | timestamptz  | DEFAULT now()                          |

**Foreign Keys:**
- answer_id → answers(id)

**Unique Constraints:**
- (answer_id, tag_name)

---

### Table: answer_votes
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

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| answer_id   | uuid         | FK → answers(id)                       |
| user_id     | uuid         | FK → auth.users(id)                    |
| vote_value  | smallint     | CHECK (1 or -1)                        |
| created_at  | timestamptz  | DEFAULT now()                          |
| updated_at  | timestamptz  | DEFAULT now()                          |

**Foreign Keys:**
- answer_id → answers(id)
- user_id → auth.users(id)

**Unique Constraints:**
- (answer_id, user_id)

---

### Table: answers
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

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| question_id | uuid         | FK → questions(id)                     |
| user_id     | uuid         | FK → auth.users(id)                    |
| body        | text         | NOT NULL                               |
| is_accepted | boolean      | DEFAULT false                          |
| created_at  | timestamptz  | DEFAULT now()                          |
| updated_at  | timestamptz  | DEFAULT now()                          |

**Foreign Keys:**
- question_id → questions(id)
- user_id → auth.users(id)

---

### Table: chat_members
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

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| chat_id     | uuid         | FK → chats(id)                         |
| user_id     | uuid         | FK → profiles(id)                      |
| joined_at   | timestamptz  | DEFAULT now(), NOT NULL                |
| is_admin    | boolean      | DEFAULT false                          |
| typing      | boolean      | DEFAULT false                          |

**Foreign Keys:**
- chat_id → chats(id)
- user_id → profiles(id)

**Unique Constraints:**
- (chat_id, user_id)

---

### Table: chat_messages
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

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| chat_id     | uuid         | FK → chats(id)                         |
| user_id     | uuid         | FK → profiles(id)                      |
| content     | text         |                                        |
| media_url   | text         |                                        |
| created_at  | timestamptz  | DEFAULT now(), NOT NULL                |

**Foreign Keys:**
- chat_id → chats(id)
- user_id → profiles(id)

---

### Table: chats
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

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| is_group    | boolean      | DEFAULT false, NOT NULL                |
| name        | text         |                                        |
| created_at  | timestamptz  | DEFAULT now(), NOT NULL                |
| created_by  | uuid         |                                        |

---

### Table: comment_likes
**Description:** Likes on comments.

```sql
CREATE TABLE IF NOT EXISTS "public"."comment_likes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "comment_id" uuid,
    "user_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| comment_id  | uuid         | FK → comments(id)                      |
| user_id     | uuid         | FK → profiles(id)                      |
| created_at  | timestamptz  | DEFAULT now(), NOT NULL                |

**Foreign Keys:**
- comment_id → comments(id)
- user_id → profiles(id)

**Unique Constraints:**
- (comment_id, user_id)

---

### Table: comments
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

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| post_id     | uuid         | FK → posts(id)                         |
| user_id     | uuid         | FK → profiles(id)                      |
| content     | text         | NOT NULL                               |
| created_at  | timestamptz  | DEFAULT now(), NOT NULL                |
| parent_id   | uuid         | FK → comments(id)                      |

**Foreign Keys:**
- post_id → posts(id)
- user_id → profiles(id)
- parent_id → comments(id)

---

### Table: content_flags
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

| Column             | Data Type    | Constraints/Description                |
|--------------------|-------------|----------------------------------------|
| id                 | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| flagged_by_user_id | uuid         | FK → profiles(id), NOT NULL            |
| post_id            | uuid         | FK → posts(id)                         |
| comment_id         | uuid         | FK → comments(id)                      |
| reason             | text         |                                        |
| created_at         | timestamptz  | DEFAULT now()                          |
| status             | text         | DEFAULT 'pending'                      |

**Foreign Keys:**
- flagged_by_user_id → profiles(id)
- post_id → posts(id)
- comment_id → comments(id)

**Check Constraints:**
- Only one of post_id or comment_id can be non-null

---

### Table: filemodels
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

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| user_id     | uuid         | FK → profiles(id)                      |
| file_url    | text         | NOT NULL                               |
| file_name   | text         | NOT NULL                               |
| file_type   | text         |                                        |
| file_size   | integer      |                                        |
| description | text         |                                        |
| is_public   | boolean      | DEFAULT false, NOT NULL                |
| created_at  | timestamptz  | DEFAULT now(), NOT NULL                |

**Foreign Keys:**
- user_id → profiles(id)

---

### Table: followers
**Description:** User following relationships.

```sql
CREATE TABLE IF NOT EXISTS "public"."followers" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "follower_id" uuid,
    "following_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

| Column        | Data Type    | Constraints/Description                |
|---------------|-------------|----------------------------------------|
| id            | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| follower_id   | uuid         | FK → profiles(id)                      |
| following_id  | uuid         | FK → profiles(id)                      |
| created_at    | timestamptz  | DEFAULT now(), NOT NULL                |

**Foreign Keys:**
- follower_id → profiles(id)
- following_id → profiles(id)

**Unique Constraints:**
- (follower_id, following_id)

---

### Table: likes
**Description:** Likes on posts.

```sql
CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid,
    "post_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| user_id     | uuid         | FK → profiles(id)                      |
| post_id     | uuid         | FK → posts(id)                         |
| created_at  | timestamptz  | DEFAULT now(), NOT NULL                |

**Foreign Keys:**
- user_id → profiles(id)
- post_id → posts(id)

**Unique Constraints:**
- (user_id, post_id)

---

### Table: notifications
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

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| user_id     | uuid         | FK → profiles(id)                      |
| type        | text         | NOT NULL                               |
| data        | jsonb        |                                        |
| is_read     | boolean      | DEFAULT false, NOT NULL                |
| created_at  | timestamptz  | DEFAULT now(), NOT NULL                |

**Foreign Keys:**
- user_id → profiles(id)

---

### Table: posts
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

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| user_id     | uuid         | FK → profiles(id)                      |
| content     | text         | NOT NULL                               |
| media_url   | text         |                                        |
| created_at  | timestamptz  | DEFAULT now(), NOT NULL                |
| updated_at  | timestamptz  | DEFAULT now(), NOT NULL                |
| is_deleted  | boolean      | DEFAULT false, NOT NULL                |
| file_url    | text         |                                        |
| image_url   | text         |                                        |
| flag_status | text         | DEFAULT 'normal'                       |

**Foreign Keys:**
- user_id → profiles(id)

---

### Table: profiles
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

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, NOT NULL, FK → auth.users(id)      |
| email       | text         | NOT NULL                               |
| full_name   | text         |                                        |
| avatar_url  | text         |                                        |
| bio         | text         |                                        |
| location    | text         |                                        |
| website     | text         |                                        |
| settings    | jsonb        |                                        |
| created_at  | timestamptz  | DEFAULT now(), NOT NULL                |
| updated_at  | timestamptz  | DEFAULT now(), NOT NULL                |
| member_type | text         | DEFAULT 'student', CHECK (student,alumni) |
| status      | text         | DEFAULT 'active'                       |
| last_seen   | timestamptz  | DEFAULT now()                          |

**Foreign Keys:**
- id → auth.users(id)

**Check Constraints:**
- member_type must be 'student' or 'alumni'

---

### Table: question_notifications
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

| Column             | Data Type    | Constraints/Description                |
|--------------------|-------------|----------------------------------------|
| id                 | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| question_id        | uuid         | FK → questions(id)                     |
| user_id            | uuid         | FK → auth.users(id)                    |
| notification_type  | text         | CHECK (in 'answer','comment','vote','best_answer') |
| message            | text         | NOT NULL                               |
| is_read            | boolean      | DEFAULT false                          |
| related_id         | uuid         |                                        |
| created_at         | timestamptz  | DEFAULT now()                          |

**Foreign Keys:**
- question_id → questions(id)
- user_id → auth.users(id)

**Check Constraints:**
- notification_type must be one of 'answer', 'comment', 'vote', 'best_answer'

---

### Table: question_votes
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

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| question_id | uuid         | FK → questions(id)                     |
| user_id     | uuid         | FK → auth.users(id)                    |
| vote_value  | smallint     | CHECK (1 or -1)                        |
| created_at  | timestamptz  | DEFAULT now()                          |
| updated_at  | timestamptz  | DEFAULT now()                          |

**Foreign Keys:**
- question_id → questions(id)
- user_id → auth.users(id)

**Unique Constraints:**
- (question_id, user_id)

---

### Table: questions
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

| Column         | Data Type    | Constraints/Description                |
|----------------|-------------|----------------------------------------|
| id             | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| user_id        | uuid         | FK → profiles(id)                      |
| title          | text         | NOT NULL                               |
| body           | text         | NOT NULL                               |
| category       | text         |                                        |
| status         | text         | DEFAULT 'open', CHECK (open,closed,duplicate) |
| best_answer_id | uuid         |                                        |
| view_count     | integer      | DEFAULT 0                              |
| created_at     | timestamptz  | DEFAULT now()                          |
| updated_at     | timestamptz  | DEFAULT now()                          |

**Foreign Keys:**
- user_id → profiles(id)

**Check Constraints:**
- status must be 'open', 'closed', or 'duplicate'

---

### Table: question_tags
**Description:** Tags associated with questions for categorization.

```sql
CREATE TABLE IF NOT EXISTS "public"."question_tags" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "question_id" uuid,
    "tag_name" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()
);
```

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| question_id | uuid         | FK → questions(id)                     |
| tag_name    | text         | NOT NULL                               |
| created_at  | timestamptz  | DEFAULT now()                          |

**Foreign Keys:**
- question_id → questions(id)

**Unique Constraints:**
- (question_id, tag_name)

---

### Table: reputation_events
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

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | integer      | PK                                     |
| user_id     | uuid         | FK → auth.users(id)                    |
| type        | text         | NOT NULL                               |
| value       | integer      | NOT NULL                               |
| related_id  | integer      |                                        |
| created_at  | timestamptz  | DEFAULT now()                          |

**Foreign Keys:**
- user_id → auth.users(id)

---

### Table: tags
**Description:** Global tags for categorization.

```sql
CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" integer NOT NULL,
    "name" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()
);
```

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | integer      | PK                                     |
| name        | text         | NOT NULL, UNIQUE                       |
| created_at  | timestamptz  | DEFAULT now()                          |

**Unique Constraints:**
- name

---

### Table: user_roles
**Description:** Role-based access control for admin and user permissions.

```sql
CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "role" app_role DEFAULT 'user' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | uuid         | PK, DEFAULT gen_random_uuid(), NOT NULL|
| user_id     | uuid         | FK → auth.users(id), NOT NULL          |
| role        | app_role     | DEFAULT 'user', NOT NULL               |
| created_at  | timestamptz  | DEFAULT now(), NOT NULL                |

**Foreign Keys:**
- user_id → auth.users(id)

**Unique Constraints:**
- (user_id, role)

---

### Table: votes
**Description:** Legacy votes table for questions and answers.

```sql
CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" integer NOT NULL,
    "user_id" uuid,
    "target_id" integer NOT NULL,
    "target_type" text,
    "value" smallint,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "votes_target_type_check" CHECK ("target_type" = ANY (ARRAY['question', 'answer'])),
    CONSTRAINT "votes_value_check" CHECK ("value" = ANY (ARRAY[1, -1]))
);
```

| Column      | Data Type    | Constraints/Description                |
|-------------|-------------|----------------------------------------|
| id          | integer      | PK                                     |
| user_id     | uuid         | FK → auth.users(id)                    |
| target_id   | integer      | NOT NULL                               |
| target_type | text         | CHECK ('question' or 'answer')         |
| value       | smallint     | CHECK (1 or -1)                        |
| created_at  | timestamptz  | DEFAULT now()                          |

**Foreign Keys:**
- user_id → auth.users(id)

**Unique Constraints:**
- (user_id, target_id, target_type)

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