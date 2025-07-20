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

**Indexes:**

| Index Name      | Columns | Type   | Condition |
|-----------------|---------|--------|-----------|
| profiles_pkey   | id      | PK     |           |

---

### Table: user_roles

| Column Name | Data Type   | Constraints/Description                        |
|-------------|------------|------------------------------------------------|
| id          | uuid        | PK, DEFAULT gen_random_uuid(), NOT NULL        |
| user_id     | uuid        | NOT NULL, FK → profiles(id)                    |
| role        | app_role    | DEFAULT 'user'                                 |
| created_at  | timestamptz | DEFAULT now()                                  |

**Indexes:**

| Index Name                    | Columns         | Type    | Condition |
|-------------------------------|-----------------|---------|-----------|
| user_roles_pkey               | id              | PK      |           |
| user_roles_user_id_role_key   | user_id, role   | UNIQUE  |           |

## Social Feed Tables

_Tables will be listed here._

## Q&A Module Tables

_Tables will be listed here._

## Chat System Tables

_Tables will be listed here._

## Resource Sharing Tables

_Tables will be listed here._

## Social Features Tables

_Tables will be listed here._

## Notification Tables

_Tables will be listed here._

## Moderation Tables

_Tables will be listed here._

## Views

_Views will be listed here._

## Functions

_Functions will be listed here._

## Triggers

_Triggers will be listed here._

## RLS Policies

_RLS Policies will be listed here._ 