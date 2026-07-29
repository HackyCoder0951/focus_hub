# Focus Hub – Software and Hardware Requirements

## 1. Software Requirements

### 1.1. Operating System
| Environment           | Supported OS Versions                |
|----------------------|--------------------------------------|
| Development          | Ubuntu 20.04+, macOS Monterey+, Windows 10+ |
| Production/Deployment| Any OS supporting Node.js & Docker (Linux recommended) |

### 1.2. Runtime & Languages
| Component    | Version/Details         |
|-------------|------------------------|
| Node.js     | v18.x or higher        |
| npm         | v9.x or higher         |
| TypeScript  | v5.5.x                 |
| PostgreSQL  | Managed by Supabase (local install only if self-hosting) |

### 1.3. Frameworks & Libraries
| Layer     | Library/Tool                | Version/Details         |
|-----------|----------------------------|------------------------|
| Frontend  | React                      | 18.3.1                 |
|           | React DOM                  | 18.3.1                 |
|           | Vite                       | 5.4.1                  |
|           | React Router DOM           | 6.26.2                 |
|           | Radix UI Components        | 1.1.0 - 2.2.1          |
|           | Tailwind CSS               | 3.4.11                 |
|           | Tailwind Merge             | 2.5.2                  |
|           | Tailwind CSS Animate       | 1.0.7                  |
|           | Lucide React               | 0.462.0                |
|           | Next Themes                | 0.3.0                  |
|           | TanStack React Query       | 5.56.2                 |
|           | React Hook Form            | 7.53.0                 |
|           | Zod                        | 3.23.8                 |
|           | Hookform Resolvers         | 3.9.0                  |
|           | Class Variance Authority   | 0.7.1                  |
|           | CLSX                       | 2.1.1                  |
|           | Date-fns                   | 3.6.0                  |
|           | Emoji Mart React           | 1.1.1                  |
|           | Emoji Mart                 | 5.6.0                  |
|           | File Saver                 | 2.0.5                  |
|           | Input OTP                  | 1.2.4                  |
|           | React Day Picker           | 8.10.1                 |
|           | React PDF                  | 10.0.1                 |
|           | PDF.js Dist                | 5.3.31                 |
|           | React Resizable Panels     | 2.1.3                  |
|           | Recharts                   | 2.12.7                 |
|           | Sonner                     | 1.5.0                  |
|           | Vaul                       | 0.9.9                  |
|           | CMDK                       | 1.0.0                  |
|           | Embla Carousel React       | 8.3.0                  |
|           | Solana Wallet Standard     | 1.3.0                  |
| Backend   | Supabase JS                | 2.50.2                 |
|           | PostgreSQL                 | Managed by Supabase    |
| Development| TypeScript                 | 5.5.3                  |
|           | ESLint                     | 9.9.0                  |
|           | PostCSS                    | 8.4.47                 |
|           | Autoprefixer               | 10.4.20                |
|           | Lovable Tagger             | 1.1.7                  |
|           | Vite Plugin React SWC      | 3.5.0                  |
|           | Vite Plugin Compression    | 0.5.1                  |
|           | Tailwind Typography        | 0.5.15                 |
|           | Source Map Explorer        | 2.5.3                  |
|           | TypeScript ESLint          | 8.0.1                  |
| Other     | Docker                     | Optional, for containers |
|           | Git                        | Version control        |

### 1.4. Browser Support
| Browser         | Supported Versions         |
|----------------|---------------------------|
| Chrome         | Latest (desktop & mobile)  |
| Firefox        | Latest (desktop & mobile)  |
| Edge           | Latest                     |
| Safari         | Latest (desktop & mobile)  |

### 1.5. Cloud Services
| Service         | Purpose                                    |
|----------------|--------------------------------------------|
| Supabase       | Auth, database, file storage, real-time     |

---

## 2. Hardware Requirements

### 2.1. Development Machine (Minimum)
| Component   | Minimum Requirement         | Recommended         |
|-------------|----------------------------|---------------------|
| CPU         | Dual-core 2.0 GHz          | Quad-core 2.5 GHz   |
| RAM         | 4 GB                       | 8 GB                |
| Storage     | 2 GB free disk space        | 10 GB+              |
| Display     | 1366x768 resolution         | 1920x1080+          |
| Network     | Broadband internet          | Broadband           |

### 2.2. Production Server (if self-hosting)
| Component   | Minimum Requirement         |
|-------------|----------------------------|
| CPU         | Quad-core 2.0 GHz           |
| RAM         | 8 GB                        |
| Storage     | 20 GB SSD                   |
| Network     | Reliable broadband, low latency |
| OS          | Ubuntu 20.04+ or equivalent |
| Docker      | Optional, for containers    |

### 2.3. Client Devices (End Users)
| Device Type     | Minimum Requirement                        |
|-----------------|--------------------------------------------|
| Desktop/Laptop  | Modern device, current web browser         |
| Mobile          | Android 8.0+ or iOS 13+ with Chrome/Safari/Firefox |

---

## 3. Additional Recommendations

| Area                | Recommendation                                             |
|---------------------|-----------------------------------------------------------|
| Developer Tools     | VS Code or WebStorm with TypeScript & ESLint plugins      |
| Production          | Use CDN for static assets, enable HTTPS, monitor health   |
| Scaling             | Use Supabase scaling or cloud VM/container with load balancing |

---

## 4. Testing

### 4.1 Unit Tests (Vitest)

```bash
npm test          # run once
npm run typecheck # tsc --noEmit
npm run lint      # eslint
npm run check     # typecheck + lint + test, all together
```

Unit tests live under `tests/unit/` and use `jsdom` + React Testing Library (see `vitest.config.ts`, setup in `tests/setup.ts`).

### 4.2 End-to-End Tests (Cypress)

Specs live under `cypress/e2e/`. There are two ways to run them:

**Option A — Native (recommended for interactive/GUI use)**

Cypress is a project devDependency, so it runs directly on your machine with no Docker or X11 forwarding involved.

```bash
# Point Cypress at the Vite dev server
npm run dev
npx cypress open --config baseUrl=http://localhost:5173

# ...or against the production Docker build
docker compose -f docker-compose.ci.yml up -d app
npx cypress open --config baseUrl=http://localhost:8080

# Headless, CI-style run
npx cypress run --config baseUrl=http://localhost:5173
```

This opens the full interactive Test Runner — pick a browser, run a spec, time-travel through commands.

**Option B — Fully containerized (headless only)**

`docker-compose.ci.yml` builds the app image and runs Cypress in the official `cypress/included` container, matching what CI (`.github/workflows/cicd.yml`) does:

```bash
docker compose -f docker-compose.ci.yml build
docker compose -f docker-compose.ci.yml run --rm cypress
docker compose -f docker-compose.ci.yml down
```

> **Note on the interactive/GUI container variant:** `docker-compose.override.yml` adds an `open`-mode Cypress service with X11 forwarding (`DISPLAY`/`XAUTHORITY` passthrough, `/tmp/.X11-unix` mount) for systems where Docker can reach the host's X server. **This does not work if Docker is installed via snap** — snap's confinement silently mounts anything outside `$HOME` (including `/tmp/.X11-unix`) as an empty directory, so the container never sees a real display. If `docker compose -f docker-compose.ci.yml -f docker-compose.override.yml up cypress` fails with `Missing X server or $DISPLAY`, check `snap list docker` — if Docker is a snap package, use **Option A** (native) instead, which has no such restriction.

---

## 5. Project Structure

```bash
focus_hub/
├── public/                       # Static assets (favicon, index.html, etc.)
├── src/                          # Main application source code
│   ├── api/                      # API route handlers or API utilities
│   ├── components/               # Reusable React components
│   │   └── ui/                   # UI library components (shadcn/ui, etc.)
│   ├── contexts/                 # React context providers (e.g., AuthContext)
│   ├── hooks/                    # Custom React hooks
│   ├── integrations/             # Third-party integrations (e.g., Supabase)
│   │   └── supabase/             # Supabase client and types
│   ├── lib/                      # Utility libraries and helper functions
│   ├── pages/                    # Top-level route/page components
│   ├── index.css                 # Global styles (Tailwind, design tokens)
│   ├── App.tsx                   # Main React app component (routing, layout)
│   ├── main.tsx                  # React entry point
│   └── vite-env.d.ts             # Vite environment types
├── supabase/                     # Supabase backend configuration
│   ├── migrations/               # SQL migration files (schema, RLS, triggers)
│   ├── config.toml               # Supabase project config
│   └── .temp/                    # Temporary Supabase files
├── modules_documentation/        # Modular documentation (PascalCase .md files)
│   ├── Index.md                  # Documentation index
│   ├── ApiModules.md
│   ├── LibModules.md
│   ├── ContextProviders.md
│   ├── CustomHooks.md
│   ├── Integrations.md
│   ├── Pages.md
│   ├── Components.md
│   ├── DatabaseDesign.md
│   ├── QandA.md
│   ├── Chat.md
│   ├── Profile.md
│   ├── Resources.md
│   ├── Settings.md
│   ├── Login.md
│   ├── Register.md
│   └── AdminDashboard.md
├── docs/                         # Tutorial and high-level documentation (chapters)
│   ├── 01_supabase_integration_.md
│   ├── 02_authentication___user_management_.md
│   ├── ... (other chapters)
│   └── index.md
├── package.json                  # Project dependencies and scripts
├── package-lock.json             # Dependency lock file
├── vite.config.ts                # Vite build configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.app.json             # App-specific TypeScript config
├── tsconfig.node.json            # Node-specific TypeScript config
├── README.md                     # Project overview and instructions
├── .gitignore                    # Git ignore rules
└── ... (other config and meta files)
```

*Document generated for Focus Hub project. Last updated: July 2024.*

---

## AI-Powered Q&A and Answer Generation

Focus Hub features an advanced AI-powered answer generation system integrated into the Q&A module. Leveraging the Groq API, users can:
- Instantly generate high-quality, concise answers to posted questions
- Regenerate, copy, and rate AI-generated answers
- Benefit from real-time, cost-effective, and privacy-conscious AI models (Groq Llama3, Mixtral, Gemma2, etc.)
- Seamlessly combine community and AI answers for a richer knowledge base

**How it works:**
- When a question is posted, users can request an AI-generated answer
- The backend calls Groq API, stores the answer, and displays it in the Q&A interface
- Users can provide feedback, copy, or regenerate the AI answer as needed

For setup and customization, see `docs/AI_INTEGRATION_SETUP.md` and `docs/GROQ_AI_INTEGRATION_SETUP.md`. 