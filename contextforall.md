# WBCT Members Platform — AI Context

> **Purpose**: Single source of truth for any AI assistant (Claude, Gemini, opencode, Cursor, Copilot, etc.) to understand the project quickly and produce consistent code.
>
> **Stack**: Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · NextAuth v5 · MySQL via `mysql2` (primary) · Prisma 7 (partially used) · Appwrite REST (auth mirror, optional) · TipTap · Resend
>
> **Database mode**: **MySQL-first**. The `mysql2` driver powers all 36+ API routes. `user-store.js` is the only file with Appwrite-first behavior (used as a fast index for user lookup, with MySQL as fallback). The `db.js` pool is lazy and only activates if `DATABASE_URL` is set AND a raw `query()` is called — but in this project, every route except the ones in `user-store.js` uses MySQL, so MySQL is effectively required.
>
> **Language**: UI and copy are in **Portuguese (pt-BR)**. Comments and identifiers are in **English**.

---

## 1. Project Identity

- **Name**: WBCT Members Platform
- **Domain**: Exclusive medical community for Brazilian doctors
- **Path**: `/Users/constantino/Desktop/CLIENTES/PROGRAMACAO/CRIATIVA DIGITAL/WBCT/PROJETO-TESTE-02`
- **Two protected areas**:
  - `/admin` — requires `role = ADMIN`
  - `/membro` — requires `status = APPROVED` (any role)
- **User lifecycle**: `register → PENDING → admin approves → APPROVED → can login`
- **Git remotes**:
  - `origin` → `https://github.com/JVConstantino/WBCT-SISTEMA-NOVO.git` (primary, used by Easy Panel)
  - `wbct-members` → `https://github.com/JVConstantino/wbct-members.git` (mirror)
  - Active branch: `building`

---

## 2. Quick Start (for any AI)

```bash
# Install
npm install

# Configure env
cp .env.example .env
# Edit DATABASE_URL, AUTH_SECRET, Appwrite vars

# Setup DB + seed
node scripts/setup-db.mjs
node scripts/seed-admin.mjs
node scripts/seed-posts.mjs
node scripts/seed-webinars.mjs
node scripts/seed-activity.mjs

# Dev
npm run dev          # http://localhost:3000 (or next free port)
PORT=3001 npm run dev
```

---

## 3. Tech Stack (pinned)

| Layer | Package | Version | Purpose |
|---|---|---|---|
| Framework | `next` | 16.1.3 | App Router, SSR, API Routes |
| UI | `react` / `react-dom` | 19.2.3 | Components |
| Auth | `next-auth` | 5.0.0-beta.30 | JWT + Credentials |
| DB driver | `mysql2` | 3.16.1 | Connection pool (10 conns, keep-alive) — PRIMARY |
| ORM | `@prisma/client` / `prisma` | 7.2.0 | Partially used, schema is outdated |
| Hashing | `bcryptjs` | 3.0.3 | Passwords |
| Styles | `tailwindcss` | 4.1.18 | Utility-first + custom CSS vars |
| Typography | `@tailwindcss/typography` | 0.5.19 | Prose styling |
| Icons | `lucide-react` | 0.562.0 | All icons |
| Charts | `recharts` | 3.6.0 | Area, Bar, Pie, Line |
| Animation | `framer-motion` | 12.27.1 | Layouts, transitions |
| Editor | `@tiptap/*` | 3.15–3.16 | Rich text for posts |
| Dates | `date-fns` | 4.1.0 | Formatting, calculations |
| Email | `resend` | 6.12.4 | Transactional email |
| Class utils | `clsx` / `tailwind-merge` | 2.1.1 / 3.4.0 | `cn()` helper |

> **Note**: `framer-motion` and `gsap` are installed but `framer-motion` is the one actually used (admin layout).

---

## 4. Repository Structure

```
PROJETO-TESTE-02/
├── .nixpacks.toml                  # Pins Node 20 + npm 10 for Easy Panel
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.js               # Root layout (Providers, fonts, metadata)
│   │   ├── page.js                 # → redirect /login
│   │   ├── globals.css             # Design tokens, Tailwind, animations
│   │   ├── login/page.js           # Login + 2-step register
│   │   ├── registro/page.js        # Alternative register page (duplicate)
│   │   ├── politica-de-privacidade/page.js
│   │   ├── termos-de-uso/page.js
│   │   │
│   │   ├── admin/                  # Admin backoffice
│   │   │   ├── layout.js           # Sidebar + Header (forces light theme)
│   │   │   ├── page.js             # Dashboard (stats + charts)
│   │   │   ├── error.js / loading.js
│   │   │   ├── membros/            # CRUD members + approve
│   │   │   ├── postagens/          # Moderation
│   │   │   ├── analytics/          # Advanced charts
│   │   │   ├── eventos/            # Calendar + management
│   │   │   ├── webinars/           # Course catalog
│   │   │   ├── chat/               # Admin messages
│   │   │   ├── docs/               # Internal docs
│   │   │   ├── perfil/             # Admin profile
│   │   │   └── configuracoes/email/
│   │   │
│   │   ├── membro/                 # Member portal
│   │   │   ├── layout.js           # Sidebar + Header
│   │   │   ├── page.js             # Feed
│   │   │   ├── blog/               # Articles HUB
│   │   │   ├── criar/              # New post (TipTap)
│   │   │   ├── minhas-postagens/   # User's own posts
│   │   │   ├── postagens/[id]/     # Read post + comments
│   │   │   ├── editar/post/[id]/   # Edit post
│   │   │   ├── diretorio/          # Doctor directory
│   │   │   ├── medico/[id]/        # Public doctor profile
│   │   │   ├── eventos/            # Calendar view
│   │   │   ├── webinars/ + [id]/   # Courses + lessons
│   │   │   ├── chat/               # Private messages
│   │   │   └── perfil/
│   │   │
│   │   └── api/                    # 30+ API Routes (all use MySQL via query())
│   │
│   ├── components/
│   │   ├── Providers.js            # SessionProvider + UserProvider
│   │   ├── NotificationDropdown.js # Bell + 30s polling
│   │   ├── StatsCard.js            # Metric card
│   │   ├── TextEditor.js           # TipTap wrapper
│   │   ├── CookieConsent.js        # LGPD banner
│   │   └── ui/                     # Design system primitives
│   │       ├── index.js            # Central re-export
│   │       ├── Avatar.js           # Photo + initials + online dot
│   │       ├── Badge.js            # + PostStatusBadge + RoleBadge
│   │       ├── Button.js           # 5 variants × 3 sizes
│   │       ├── Card.js             # 4 variants, polymorphic (as=)
│   │       ├── EmptyState.js
│   │       ├── Input.js            # + Textarea + Select
│   │       ├── Modal.js            # Esc, scroll-lock, 5 sizes
│   │       ├── PageHeader.js       # title + breadcrumb + actions
│   │       ├── Skeleton.js         # + Spinner
│   │       └── Table.js            # columns[], loading, EmptyState
│   │
│   ├── contexts/
│   │   └── UserContext.js          # useUser() + updateUser() + refreshUser()
│   │
│   ├── lib/
│   │   ├── auth.js                 # NextAuth v5 config (Credentials, JWT, callbacks)
│   │   ├── db.js                   # mysql2 pool — LAZY: only used if DATABASE_URL set + query() called
│   │   ├── prisma.js               # Singleton PrismaClient (legacy)
│   │   ├── user-store.js           # Auth: Appwrite-first when configured, MySQL fallback
│   │   ├── appwrite-db.js          # Optional Appwrite REST adapter (auth path only)
│   │   └── email.js                # Resend wrapper (env + AppSetting fallback)
│   │
│   ├── hooks/                      # Custom hooks
│   ├── styles/                     # Additional styles
│   ├── utils/                      # cn() and helpers
│   └── middleware.js               # Route protection
│
├── prisma/
│   └── schema.prisma               # ⚠️ Partially outdated — see §7
│
├── public/
│   ├── uploads/                    # Files from /api/upload
│   └── manifest.json               # PWA manifest
│
├── scripts/                        # DB + migration utilities
│   ├── setup-db.mjs                # Create schema
│   ├── seed-*.mjs                  # admin / posts / webinars / activity
│   ├── create-tables.sql           # Canonical SQL schema
│   ├── add-*.sql                   # Incremental migrations
│   ├── create-notifications.js     # Notification table
│   ├── create-social-tables.js     # Follows + Messages
│   ├── migrate-*.{js,mjs}          # Column updates
│   ├── fix_db_image.js             # Image column patch
│   ├── update-*.mjs                # Data patches
│   ├── provision-appwrite-from-mysql.mjs
│   └── migrate-mysql-to-appwrite.mjs
│
├── docs/                           # Internal + product docs
├── .env / .env.example             # DATABASE_URL, AUTH_SECRET, Resend, Appwrite
├── next.config.js                  # Minimal config (allowedDevOrigins + 1 redirect)
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json                   # Path aliases (@/*)
└── package.json                    # + engines.node >=20.19.0
```

---

## 5. Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | — | `mysql://user:pass@host:3306/dbname` (mysql2 driver is used by all 36+ API routes) |
| `AUTH_SECRET` | **Yes** (prod) | — | 32+ random chars, signs JWTs |
| `AUTH_URL` | No | `http://localhost:3000` | Base URL |
| `NEXTAUTH_URL` | No | — | Legacy alias for AUTH_URL |
| `AUTH_TRUST_HOST` | No | `false` | `true` for non-Vercel deployments |
| `RESEND_API_KEY` | No | — | Email (also stored in `AppSetting` table) |
| `RESEND_FROM_EMAIL` | No | — | Default sender |
| `RESEND_FROM_NAME` | No | `WBCT` | Default sender name |
| `USE_APPWRITE_DB` | No | `0` | Set `1` to use Appwrite as primary for auth (user-store.js) |
| `APPWRITE_ENDPOINT` | If Appwrite | — | e.g. `https://database.wbctmember.org/v1` |
| `APPWRITE_PROJECT_ID` | If Appwrite | — | Appwrite project id |
| `APPWRITE_API_KEY` | If Appwrite | — | **Server API key — NEVER commit, rotate if exposed** |
| `APPWRITE_DATABASE_ID` | If Appwrite | — | Database id |
| `MIGRATION_BATCH_SIZE` | No | `300` | Appwrite migration batch |
| `APPWRITE_COLLECTIONS_JSON` | No | (map) | Table → collection mapping (legacy migration) |

> **Priority order** for email config: `process.env` → `AppSetting` table → default.
>
> **Security**: the Appwrite API key has full read/write access. Never commit it. Never paste in chat. Rotate immediately if exposed.

---

## 6. Authentication & Authorization

### Flow (`src/lib/auth.js`)
```
1. POST /login → signIn("credentials")
2. authorize() in src/lib/auth.js:
   - getUserByEmail from user-store (Appwrite-first → MySQL fallback)
   - If status === PENDING  → throw "PENDING"
   - If status === REJECTED → throw "REJECTED"
   - bcrypt.compare(password, user.password)
   - createLoginActivity (Appwrite-first → MySQL fallback)
   - updateLastActiveAt (Appwrite-first → MySQL fallback)
   - Return { id, name, email, image, role }
3. JWT callback: token.role, token.id, token.image
4. Session callback: session.user.role, session.user.id, session.user.image
5. Redirect: ADMIN → /admin | MEMBER → /membro
```

### Route Protection (`src/middleware.js`)
```js
// matcher excludes: /api, /_next/static, /_next/image, /favicon.ico
/admin/*  → require session + role === "ADMIN"  (else → /membro)
/membro/* → require session                     (else → /login)
/login    → if logged in, redirect to dashboard
```

### API Guard Pattern
```js
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });
    // ... logic
}
```

### ⚠️ Appwrite Auth Path Status (verified 2026-06-01)
The Appwrite instance at `database.wbctmember.org` is **broken for query parameters**:
- `queries[]=...` → HTTP 400 "Invalid query: Syntax error"
- `limit=N` / `offset=N` → silently ignored, always returns 25 docs default
- The user-store Appwrite-first path still works for `getUserByEmail` (uses `Query.equal` + `Query.limit(1)`, falls back to full scan via `listDocuments` if that fails)

**Current state**: MySQL is the reliable primary for all auth and data. Appwrite is best-effort mirror.

---

## 7. Database

### ⚠️ Prisma Schema is Outdated
The `prisma/schema.prisma` does **not** include these columns that exist in the real MySQL:
- `User.status` (PENDING / APPROVED / REJECTED)
- `User.stack`
- `User.lastActiveAt`

Prisma is only used for some operations. The app primarily uses **raw SQL via `mysql2`**.

### Connection (`src/lib/db.js`)
```js
import { query } from "@/lib/db";
const rows = await query("SELECT * FROM User WHERE id = ?", [id]);
// Pool: 10 conns, keep-alive, undefined → null auto-conversion
// LAZY: throws only when query() is called AND DATABASE_URL is missing
```

### Tables

#### `User`
| Field | Type | Notes |
|---|---|---|
| `id` | string (cuid) | PK |
| `name` | string? | |
| `email` | string? | **unique** |
| `password` | string? | bcrypt hash |
| `image` | string? | URL or base64 |
| `bio` | text? | |
| `crm` | string? | Medical license |
| `specialty` | string? | |
| `stack` | string? | Practice area (NOT in Prisma) |
| `role` | enum | `ADMIN` \| `MEMBER` (default MEMBER) |
| `status` | string | `PENDING` \| `APPROVED` \| `REJECTED` (NOT in Prisma) |
| `allowMessagesFrom` | string | `followers` \| `connections` \| `everyone` \| `nobody` |
| `lastActiveAt` | DateTime? | Online tracking (NOT in Prisma) |
| `createdAt` / `updatedAt` | DateTime | |

#### `Post`
`id` · `title` · `content` (LongText, HTML) · `image` · `status` (PENDING/APPROVED) · `views` (incremented on GET) · `authorId` · `createdAt` · `updatedAt`

#### `Comment`
`id` · `content` · `postId` (Cascade) · `authorId` · `parentId` (nullable) · `createdAt`

#### `Event`
`id` · `title` · `description` · `date` · `color` (#3b82f6) · `link` · M:N with `User` via `_UserEvents`

#### `Webinar`
`id` · `title` · `description` · `videoUrl` · `order` · timestamps

#### `Course` → `Lesson` → `LessonAttachment`
- `Course.image`, `Lesson.videoUrl`, `Lesson.order`
- `LessonAttachment`: `title` · `url` · `type` ('pdf' | 'image')

#### `LessonProgress`
- `userId` · `lessonId` · `completed` · `completedAt`
- **UNIQUE [userId, lessonId]**

#### Raw SQL Tables (no Prisma model)
- `Follows` — `followerId`, `followingId`, PK composite
- `Message` — `id` (UUID), `senderId`, `receiverId`, `content`
- `Notification` — `id` (UUID), `userId`, `type` (MESSAGE|POST_APPROVED|POST_REJECTED), `content`, `relatedId`, `isRead`
- `UserActivity` — `id` (`login_{userId8}_{ts36}`), `userId`, `type` (LOGIN)
- `AppSetting` — `settingKey` (unique), `settingValue`
- `EventParticipantStatus` — `eventId`, `userId`, `status` (PENDING/CONFIRMED/REJECTED)

---

## 8. Design System (Quick Reference)

### Color Tokens (CSS vars, in `globals.css`)
```css
--color-brand-primary:        #2563eb  /* Blue-600 */
--color-brand-primary-hover:  #1d4ed8
--color-brand-primary-active: #1e40af
--color-brand-primary-light:  #dbeafe
--color-brand-strong:         #0f172a  /* Slate-900 */
--color-accent:               #0284c7  /* Sky-600 */

--color-status-success:       #059669  bg: #ecfdf5
--color-status-warning:       #d97706  bg: #fffbeb
--color-status-error:         #dc2626  bg: #fef2f2
--color-status-info:          #2563eb  bg: #eff6ff
--color-status-pending:       #9333ea  bg: #faf5ff

--surface-page:               #f8fafc / #0a0f1e
--surface-card:               #ffffff / #0f172a
--surface-sidebar:            #ffffff / #080d1a
--surface-header:             #ffffffdd / #0a0f1edd
--surface-subtle:             #f1f5f9 / #1e293b
```

### Typography
- **Display**: Outfit (400–800) → headings
- **Body**: Inter (400–700) → base
- CSS var: `--font-body: "Inter", system-ui`

### Border Radius
`xs=2px · sm=4px · md=6px · lg=8px · xl=12px · full=9999px`

### Global Classes
```css
.btn-primary, .btn-secondary, .btn-ghost, .btn-accent, .btn-danger
.card, .card-subtle
.input, .badge
```

### Dark Mode
- Toggle class `.dark` on `<html>` + `data-theme="dark"`
- Persist in `localStorage("theme")`
- Admin layout **forces light theme** (see `src/app/admin/layout.js:32-35`)

### UI Primitives Cheatsheet
```jsx
import { Avatar, Badge, PostStatusBadge, RoleBadge, Button, Card, EmptyState, Input, Textarea, Select, Modal, PageHeader, Skeleton, Spinner, Table } from "@/components/ui";
```

---

## 9. API Routes (30+, all MySQL via `query()`)

### Auth
| Method | Route | Auth | Purpose |
|---|---|---|---|
| * | `/api/auth/[...nextauth]` | — | NextAuth handler |
| POST | `/api/auth/register` | Public | Create user (PENDING) via `user-store.js` |
| POST | `/api/auth/verify` | Public | Validate creds + log activity via `user-store.js` |

### Users
| Method | Route | Auth | Purpose |
|---|---|---|---|
| PUT | `/api/users/profile` | Logged | Update own profile |
| GET | `/api/users/profile/[id]` | Self | Full profile |
| GET | `/api/users/public/[id]` | Logged | Public profile of another |
| GET | `/api/users/directory` | Logged | Doctor directory |
| POST | `/api/users/follow` | Logged | Toggle follow |
| GET | `/api/users/contacts` | Logged | Following list |

### Members (Admin)
`/api/members` — GET list (search) · POST create · PUT update · DELETE

### Posts
`/api/posts` GET·POST·PATCH·DELETE · `/api/posts/[id]` GET·PATCH (inc. views) · `/api/posts/[id]/comments` POST · `/api/membro/posts` (own)

### Events
`/api/events` GET (filter `?month=`)·POST·DELETE · `/api/events/[id]/follow` POST toggle · `/api/admin/events/[id]/participants` GET

### Courses & Lessons
`/api/courses` GET·POST · `/api/courses/[id]` PATCH·DELETE · `/api/courses/[id]/lessons` GET·POST · `/api/lessons/[id]` PATCH·DELETE · `/api/lessons/[id]/progress` GET·POST

### Webinars
`/api/webinars` GET·POST·PATCH·DELETE

### Messages
`/api/messages` POST (creates Notification) · `/api/messages/[userId]` GET thread · `/api/admin/chat/contacts` GET

### Notifications & Activity
`/api/notifications` GET·PUT (mark read) · `/api/activity` POST (presence ping) · GET (online count, last 5min)

### Upload & Stats
`/api/upload` POST (image/PDF, max 5MB, MIME whitelist) · `/api/admin/stats` GET dashboard data

---

## 10. Conventions & Patterns

### Path Aliases (`jsconfig.json`)
```js
@/components/*  @/lib/*  @/contexts/*  @/hooks/*  @/utils/*  @/styles/*
```

### Component Patterns
- **Client components**: `"use client"` directive at top
- **Server components**: default (no directive)
- **API responses**: `{ success: boolean, ... }` shape; `Response.json()`
- **Loading/Error boundaries**: every route segment has `loading.js` and `error.js`

### Data Fetching (Client)
```js
// Always handle success flag
const res = await fetch("/api/posts?status=APPROVED");
const result = await res.json();
if (result.success) setData(result.data);
```

### Form Pattern
- React state for inputs
- Submit → `fetch("/api/...", { method, headers, body })`
- Show error from `result.error`
- Refetch list after success

### Theme Pattern
- Read `localStorage("theme")` in layout `useEffect`
- Apply `.dark` class + `data-theme` attribute
- Admin forces light via `forceLightTheme()`

### Polling
- Notifications: 30s
- Activity (admin dashboard): 30s
- Analytics: 60s

### IDs
- DB: cuid (default) or `user_${Date.now().toString(36)}`
- Activity: `login_${userId8}_${timestamp36}`
- Messages/Notifications: `uuid`

### Naming
- **Files**: `PascalCase.js` for components, `kebab-case.js` for routes, `camelCase.js` for lib
- **Variables**: `camelCase` (English), **UI strings**: `pt-BR`
- **Status**: UPPERCASE strings (`PENDING`, `APPROVED`, `REJECTED`)
- **Role**: UPPERCASE strings (`ADMIN`, `MEMBER`)

### What NOT to do
- ❌ Don't add comments to code (project convention)
- ❌ Don't use emojis in files
- ❌ Don't trust Prisma schema as source of truth (use raw SQL via `query()`)
- ❌ Don't add new dependencies without checking `package.json` first
- ❌ Don't change MySQL columns without updating `prisma/schema.prisma` AND the relevant scripts
- ❌ Don't paste the Appwrite API key in chat/commits — rotate immediately if exposed

---

## 11. Branching & Deployment

```
building  ──► release/*  ──► main
            (pre-prod)    (prod)
```

- **Work and validation** in `building`
- **Pre-production cleanup** in `release/main-hardening` (or similar)
- **Merge** `building → main` only after validation
- **Backup** branch/tag before prod: `backup/pre-main-YYYY-MM-DD` + `pre-main-YYYY-MM-DD`
- **Rollback**: `git revert <commit>` or redeploy previous release/tag

### Easy Panel deploy
- Webhook trigger: `POST http://<host>:3000/api/deploy/<token>` (token in path)
- Build provider: **Nixpacks** (uses `.nixpacks.toml` to pin Node 20 + npm 10)
- If using `Dockerfile`, set source type accordingly in Easy Panel UI

### Production Build
```bash
npm run build
npm run start
```

### Troubleshooting
- `not a git repository` → `cd` into project root
- `.next/dev/lock` → kill previous `next dev`
- Port conflict → `PORT=3001 npm run dev`
- MySQL errors → verify `DATABASE_URL` and network access
- `EBADENGINE` warnings → already solved by `.nixpacks.toml` (Node 20)
- Appwrite `Invalid query: Syntax error` → known bug on the staging instance, use MySQL instead

---

## 12. Appwrite Mirror (Optional, Auth Only)

When `USE_APPWRITE_DB=1` (or all Appwrite env vars set), the `user-store.js` writes are mirrored to Appwrite collections. The mirror is best-effort — failures are logged but don't block the main MySQL write.

- **Collections used**: `users` and `user_activities`
- **Provisioning**: `npm run provision:appwrite:staging`
- **Migration**: `npm run migrate:appwrite:staging`
- **Doc ID strategy**: use MySQL `id` directly (e.g. `user_xxx`, `login_xxx_yyy`)

### ⚠️ Appwrite API Bugs (verified)
The staging instance at `database.wbctmember.org` (v1.8.1, `database.type = "legacy"`) does **not** honor:
- `queries[]` array parameter → 400 "Invalid query: Syntax error"
- `limit` / `offset` query params → silently ignored
- `equal[]` filter params → silently ignored

Only `getUserByEmail` works (via `Query.equal` + `Query.limit(1)`) because it falls back to a full scan via `listDocuments` when the query fails.

**Recommendation**: keep MySQL as primary. Use Appwrite as backup/mirror. Do NOT depend on Appwrite for pagination or complex queries until the instance is upgraded to Appwrite 1.6+ with the new TablesDB API.

---

## 13. Common Tasks (for AI)

### Add a new admin page
1. Create `src/app/admin/{slug}/page.js` ("use client")
2. Add menu item in `src/app/admin/layout.js:18-30`
3. Reuse `PageHeader`, `Card`, `Table`, `EmptyState`
4. Create API route in `src/app/api/admin/{slug}/route.js` with ADMIN guard

### Add a new member page
1. Create `src/app/membro/{slug}/page.js`
2. Add to `src/app/membro/layout.js` sidebar
3. API route with logged-in guard (any role)

### Add a new model/table
1. Add SQL migration to `scripts/` (`.sql` or `.js`)
2. Update `prisma/schema.prisma` for consistency
3. Add CRUD helpers in `src/lib/user-store.js` pattern (or new `src/lib/{entity}-store.js`)
4. Wire to Appwrite collection if mirror is enabled

### Add a new UI primitive
1. Create `src/components/ui/{Name}.js`
2. Export from `src/components/ui/index.js`
3. Use CSS vars from `globals.css`, **not** hardcoded colors

### Modify the dashboard
- File: `src/app/admin/page.js`
- Stats endpoint: `src/app/api/admin/stats/route.js`
- Time ranges: 24h / 48h / 7d / 30d / 90d

### Modify the feed
- File: `src/app/membro/page.js`
- Posts API: `src/app/api/posts/route.js` (filter `?status=APPROVED`)

### Migrate from MySQL to Appwrite REST
Don't do this without fixing the Appwrite instance first. The staging Appwrite can't handle the query patterns the app needs (pagination, filtering, joins). See §12 for the known limitations.

---

## 14. Security Checklist (for AI-generated code)

- [ ] Every API route that requires auth calls `auth()` and checks `session?.user`
- [ ] Admin-only routes verify `session.user.role === "ADMIN"`
- [ ] User input is validated/sanitized before SQL queries (use parameterized queries — never string interpolation)
- [ ] Passwords are hashed with `bcrypt` (never stored as plain text)
- [ ] File uploads check MIME type and size (max 5MB)
- [ ] No secrets, API keys, or passwords are committed to the repo
- [ ] SQL `LIMIT` clauses on user-facing list endpoints
- [ ] User can only edit/delete **their own** resources (or ADMIN)
- [ ] `middleware.js` matcher is preserved when adding new protected routes
- [ ] Appwrite API key is only in env vars, never in source

---

## 15. Reference File Pointers

| Topic | File |
|---|---|
| Auth config | `src/lib/auth.js` |
| DB pool (lazy) | `src/lib/db.js` |
| User auth store (Appwrite-first, MySQL fallback) | `src/lib/user-store.js` |
| Appwrite adapter | `src/lib/appwrite-db.js` |
| Email sender | `src/lib/email.js` |
| Middleware | `src/middleware.js` |
| Root layout | `src/app/layout.js` |
| Admin layout | `src/app/admin/layout.js` |
| Member layout | `src/app/membro/layout.js` |
| Design tokens | `src/app/globals.css` |
| Tailwind config | `tailwind.config.js` |
| Prisma schema | `prisma/schema.prisma` |
| Canonical SQL | `scripts/create-tables.sql` |
| Full reference (PT-BR) | `docs/WBCT-REFERENCIA.md` |
| Appwrite migration | `docs/MIGRACAO-APPWRITE-STAGING.md` |
| UI primitives | `src/components/ui/index.js` |
| User context | `src/contexts/UserContext.js` |
| Providers | `src/components/Providers.js` |
| Nixpacks config | `.nixpacks.toml` |

---

## 16. Known Issues (as of 2026-06-01)

1. **Appwrite REST API on staging is broken** for `queries[]`, `limit`, `offset`, `equal[]` params. Use MySQL.
2. **MySQL credentials in `.env`** may be stale — the password `N4#vUS+dzl*@` is rejected by `wbctso41_membros_wbct@162.241.60.102`. Reset the password in the hosting panel and update `.env`.
3. **Prisma schema is outdated** — `status`, `stack`, `lastActiveAt`, `allowMessagesFrom` columns exist in MySQL but not in `prisma/schema.prisma`. Code uses raw SQL, so this is cosmetic.
4. **Middleware deprecation** — Next 16 warns `"middleware" file convention is deprecated. Please use "proxy" instead`. Cosmetic warning, no impact yet.
5. **N+1 queries in `/api/admin/stats` and other list endpoints** — every JOIN was done in SQL, no denormalization. Performance will degrade with >10k posts/users.

---

*Last updated: 2026-06-01 · Stack pinned to versions in `package.json` · Deploy target: Easy Panel (Nixpacks, Node 20)*
