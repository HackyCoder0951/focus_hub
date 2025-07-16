# Focus Hub System Design

## System Architecture

### High-Level Architecture
```mermaid
graph TD
  subgraph Frontend
    A[React App]
    B[shadcn/ui Components]
    C[React Router]
    D[TanStack Query]
    E[Context Providers]
  end
  subgraph API Layer
    F[API Modules]
  end
  subgraph Backend Services
    G[Supabase API]
    H[PostgreSQL Database]
    I[Auth Service]
    J[Realtime Engine]
    K[Storage]
  end
  subgraph Integrations
    L[External Services]
  end
  A -- "Uses" --> B
  A -- "Uses" --> C
  A -- "Uses" --> D
  A -- "Uses" --> E
  A -- "Fetches Data" --> F
  F -- "Calls" --> G
  G -- "Queries" --> H
  G -- "Handles Auth" --> I
  G -- "Realtime" --> J
  G -- "File Ops" --> K
  G -- "Integrates" --> L
  J -- "Pushes Updates" --> A
  I -- "Session/Token" --> A
  K -- "Uploads/Downloads" --> A
  L -- "Webhooks/API" --> G
```

## Deployment Architecture

```mermaid
graph TD
  Dev[Developer]
  Repo[Git Repository]
  CI[CI/CD Pipeline]
  Build[Build Server]
  Host[Hosting / CDN - Vercel, Netlify]
  User[End User]
  Supabase[Supabase Backend<br/>Database / Auth / Storage]
  Dev -->|Push Code| Repo
  Repo -->|Trigger Build| CI
  CI -->|Run Tests & Build| Build
  Build -->|Deploy Artifacts| Host
  Host -->|Serve Frontend| User
  User -->|API Requests| Supabase
  Host -->|API Proxy| Supabase
```

## Database Design

### Data Flow Diagram
```mermaid
graph TD
  User[User / App]
  DB[Database]
  subgraph System [Application System]
    Process[Process / Logic Layer]
  end
  User -->|Query / Mutation| Process
  Process -->|Result| User
  Process -->|SQL Query| DB
  DB -->|Query Result| Process
```

### Entity-Relationship Diagram (ERD)
```mermaid
erDiagram
  users ||--o{ posts : "has"
  users ||--o{ comments : "writes"
  users ||--o{ votes : "casts"
  users ||--o{ questions : "asks"
  users ||--o{ answers : "answers"
  users ||--o{ resources : "uploads"
  users ||--o{ messages : "sends"
  posts ||--o{ comments : "receives"
  posts ||--o{ votes : "receives"
  questions ||--o{ answers : "receives"
  questions ||--o{ comments : "receives"
  answers ||--o{ votes : "receives"
  answers ||--o{ comments : "receives"
  followers {
    INT follower_id
    INT followed_id
  }
  users ||--o{ followers : "follows"
  followers }o--|| users : "followed by"
  chats ||--o{ messages : "contains"
  resources ||--|| users : "belongs to"
```

### Table Descriptions
| Table         | Description                                 |
|---------------|---------------------------------------------|
| users         | Stores user account information             |
| posts         | Social feed posts linked to users           |
| comments      | Comments on posts and Q&A                   |
| votes         | Upvotes/downvotes on posts and answers      |
| questions     | Q&A module questions                        |
| answers       | Q&A module answers                          |
| followers     | User follow relationships                   |
| resources     | Shared files and resources                  |
| chats         | Chat conversations                          |
| messages      | Individual chat messages                    |

## Component Architecture

```mermaid
graph TD
  subgraph App UI
    PageComponent["Page (e.g., /chat, /profile)"]
    Layout["Layout (Header, Sidebar, Footer)"]
    FeatureComponent["Feature Component (ChatBox, PostCard)"]
  end
  subgraph UI Library
    Button["Base/Button"]
    Input["Base/Input"]
    Dialog["Overlay/Dialog"]
    Tabs["Navigation/Tabs"]
    Avatar["Data/Avatar"]
    Toast["Feedback/Toast"]
  end
  PageComponent --> Layout
  PageComponent --> FeatureComponent
  FeatureComponent --> Button
  FeatureComponent --> Input
  FeatureComponent --> Dialog
  FeatureComponent --> Tabs
  FeatureComponent --> Avatar
  FeatureComponent --> Toast
```

## Module-Level Flows

### Feed
```mermaid
sequenceDiagram
    participant User
    participant Feed
    participant API
    participant Database
    User->>Feed: Create/read post, like, comment
    Feed->>API: Send request
    API->>Database: Perform operation
    Database-->>API: Return result
    API-->>Feed: Response
    Feed-->>User: Update UI
```

### Q&A
```mermaid
sequenceDiagram
    participant User
    participant QandA
    participant API
    participant Database
    User->>QandA: Submit question/answer/vote/comment
    QandA->>API: Send request
    API->>Database: Perform operation
    Database-->>API: Return result
    API-->>QandA: Response
    QandA-->>User: Update UI
```

### Chat
```mermaid
sequenceDiagram
    participant User
    participant Chat
    participant API
    participant Database
    User->>Chat: Send/receive message, share file
    Chat->>API: Send request (message/file)
    API->>Database: Store/retrieve message or file
    Database-->>API: Return result
    API-->>Chat: Response / real-time update
    Chat-->>User: Update UI (display message, file)
```

### Resources
```mermaid
sequenceDiagram
    participant User
    participant Resources
    participant API
    participant Storage
    participant Database
    User->>Resources: Upload/download/preview/manage file
    Resources->>API: Send request
    API->>Storage: Store/retrieve file
    API->>Database: Store/retrieve metadata
    Storage-->>API: File result
    Database-->>API: Metadata result
    API-->>Resources: Response
    Resources-->>User: Update UI
```

### Profile
```mermaid
sequenceDiagram
    participant User
    participant Profile
    participant API
    participant Database
    User->>Profile: View/edit profile, update settings
    Profile->>API: Send request
    API->>Database: Perform operation
    Database-->>API: Return result
    API-->>Profile: Response
    Profile-->>User: Update UI
```

### Settings
```mermaid
sequenceDiagram
    participant User
    participant Settings
    participant API
    participant Database
    User->>Settings: Update preferences, change password, set privacy
    Settings->>API: Send request
    API->>Database: Update user/profile/settings
    Database-->>API: Return result
    API-->>Settings: Response
    Settings-->>User: Update UI
```

### Admin Dashboard
```mermaid
sequenceDiagram
    participant Admin
    participant AdminDashboard
    participant API
    participant Database
    Admin->>AdminDashboard: View/manage users, roles, content
    AdminDashboard->>API: Send admin request
    API->>Database: Perform admin operation
    Database-->>API: Return result
    API-->>AdminDashboard: Response
    AdminDashboard-->>Admin: Update UI
```

## Security & RLS
- **Authentication**: Supabase Auth with JWT/session tokens
- **Row Level Security (RLS)**: Enforced at the database level for all tables
- **Role-Based Access**: Admin/user roles with granular permissions
- **Frontend Security**: Protected routes, input validation, XSS/CSRF prevention

## Summary
Focus Hub's system design enables a secure, scalable, and real-time platform by combining modular frontend, robust backend, and best-in-class security and deployment practices. 